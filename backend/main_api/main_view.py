from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import TriggerChecklist, Symptoms, SelectionType, Disease
from .main_serializers import DiseaseSerializer, SymptomsSerializer, TriggerChecklistSerializer, DiagnosisSerializer, SelectionTypeSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from django.db.models import Q

@api_view(['GET'])
def showSymptoms(request):
    if request.method == 'GET':
        symptoms = Symptoms.objects.all()
        symptomsSerializer = SymptomsSerializer(symptoms, many = True)
        return Response(symptomsSerializer.data)
    
@api_view(['GET'])
def showDiseases(request):
    if request.method == 'GET':
        diseases = Disease.objects.all()
        diseaseSerializer = DiseaseSerializer(diseases, many = True)
        return Response(diseaseSerializer.data)
    

@api_view(['POST'])
def GetDefaultMatchingTriggerChecklists(request):
    symptom_ids = request.data.get('symptom_ids', [])

    if not symptom_ids:
        return Response({"error": "No symptom IDs provided."}, status=400)

    '''
    1. Get negative triggers 
    2. Process to see if this rules out the disease
    3. Filtered out these disease
    4. Process to see if the positive symptoms are good
    5. To-do: should send back positive or negative triggers that are close (so can recommend next symptoms)
    '''
    matched_negative_trigger_checklists = TriggerChecklist.objects.filter(
        (
            Q(NegativeSymptoms__id__in = symptom_ids) |
            Q(MandatoryNegativeSymptoms__id__in = symptom_ids)
        )
    ).distinct()

    print("symptom_ids: ", symptom_ids)

    #Process the negative symptoms here and eliminate all trigger checklist with that disease ID
    #Save all the values in negativeDiseaseID list so can remove

    #Process Minimum, id = 3
    minimum_selection_triggers = matched_negative_trigger_checklists.filter(SelectionType=3)

    # Initialize a list to store triggers where MandatoryNegativeSymptoms match all symptoms
    filtered_out_disease_ID = []
    negative_next_step_recommendations = []

    # Dictionary to track which symptoms are still part of valid (non-filtered) disease triggers
    symptoms_in_valid_diseases = {}

    # Iterate through triggers and check if MandatoryNegativeSymptoms contain all symptom_ids
    for trigger in minimum_selection_triggers:
        #get all the symptom id for mandatory
        mandatory_negative_ids = set(trigger.MandatoryNegativeSymptoms.values_list('id', flat=True))
        negative_ids = set(trigger.NegativeSymptoms.values_list('id', flat = True))

        #make sure selectionadditionalinfo is properly defined
        try: 
            selection_threshold = int(trigger.SelectionAdditionalInfo)
        except ValueError:
            continue

        #check for total matched negative symptoms 
        negative_matched_sx_count = len(mandatory_negative_ids & set(symptom_ids)) + len(negative_ids & set(symptom_ids))

        if (negative_matched_sx_count >= selection_threshold):

            #if all mandatory are satisfied
            if mandatory_negative_ids.issubset(symptom_ids):
                filtered_out_disease_ID.append(trigger.Disease)
            #if need to satisfy mandatory still, will return
            else:
                for symptom_id in mandatory_negative_ids - set(symptom_ids):
                    negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name  # Assuming `Name` is a field in the `TriggerChecklist` model
                    })

        elif negative_matched_sx_count == (selection_threshold - 1):
            #if all mandatory satisfied, add in mandatory negative symptoms to update
            if mandatory_negative_ids.issubset(symptom_ids):
                #input the next steps with the trigger.name
                for symptom_id in negative_ids - set(symptom_ids):
                    negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name  # Assuming `Name` is a field in the `TriggerChecklist` model
                    })
            else:
                #if negative mandatory not satisfied, add in the rest needed
                for symptom_id in mandatory_negative_ids - set(symptom_ids):
                    negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name  # Assuming `Name` is a field in the `TriggerChecklist` model
                    })

         # Track symptoms per disease to ensure they are not excluded incorrectly
         # keeps track of symptoms to disease like this: sx 1: {disease 2, disease 3, etc.}
        for symptom_id in mandatory_negative_ids | negative_ids:
            if symptom_id not in symptoms_in_valid_diseases:
                symptoms_in_valid_diseases[symptom_id] = set()
            symptoms_in_valid_diseases[symptom_id].add(trigger.Disease)

        #Remove only symptoms that are tied exclusively to the filtered-out diseases. 
        #Don't check symptoms that were filtered out
        symptoms_to_remove_from_next_steps = set()
        for symptom_id, diseases in symptoms_in_valid_diseases.items():
            if not diseases.isdisjoint(filtered_out_disease_ID):
                continue  # Skip symptoms still associated with any non-filtered disease
            # If all diseases are filtered out, mark this symptom for removal
            if diseases.issubset(filtered_out_disease_ID):
                symptoms_to_remove_from_next_steps.add(symptom_id)

    # Filter out symptoms from the next steps that belong to the excluded disease IDs
    negative_next_step_recommendations = [
    recommendation
    for recommendation in negative_next_step_recommendations
    if recommendation["symptom_id"] not in symptoms_to_remove_from_next_steps
    ]

    filtered_triggers = TriggerChecklist.objects.exclude(Disease__in=filtered_out_disease_ID)


    #Process All required: 1
    all_required_selection_trigger = matched_negative_trigger_checklists.filter(SelectionType = 1)

    filtered_out_disease_ID = []

    '''
    1. Satisfy mandatory negative  
    2. Satisfy negative 
    3. Next steps if -2 all required
        a. send mandatory next steps if not complete in list
        b. send negative next steps if not complete in list
    '''

    for trigger in all_required_selection_trigger:
        all_required_mandatory_negative_ids = set(trigger.MandatoryNegativeSymptoms.values_list('id', flat=True))
        all_required_negative_ids = set(trigger.NegativeSymptoms.values_list('id', flat = True))        
        all_required_total_negative_ids = all_required_mandatory_negative_ids | all_required_negative_ids

        #Check if all symptom_ids are in combined set
        if all_required_total_negative_ids.issubset(set(symptom_ids)):
            filtered_out_disease_ID.append(trigger.Disease)
        else:
            missing_negative_ids = all_required_total_negative_ids - set(symptom_ids)
            missing_negative_count = len(missing_negative_ids)

            if missing_negative_count <= 2:
                #all mandatory is in symptoms id
                if all_required_mandatory_negative_ids.issubset(set(symptom_ids)):
                    for symptom_id in all_required_negative_ids - set(symptom_ids):
                        negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name  # Assuming `Name` is a field in the `TriggerChecklist` model
                    })
                else:
                    for symptom_id in all_required_mandatory_negative_ids - set(symptom_ids):
                        negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name  # Assuming `Name` is a field in the `TriggerChecklist` model
                    })

         # Track symptoms per disease to ensure they are not excluded incorrectly
         # keeps track of symptoms to disease like this: sx 1: {disease 2, disease 3, etc.}
        for symptom_id in all_required_mandatory_negative_ids | all_required_negative_ids:
            if symptom_id not in symptoms_in_valid_diseases:
                symptoms_in_valid_diseases[symptom_id] = set()
            symptoms_in_valid_diseases[symptom_id].add(trigger.Disease)

        #Remove only symptoms that are tied exclusively to the filtered-out diseases. 
        #Don't check symptoms that were filtered out
        symptoms_to_remove_from_next_steps = set()
        for symptom_id, diseases in symptoms_in_valid_diseases.items():
            if not diseases.isdisjoint(filtered_out_disease_ID):
                continue  # Skip symptoms still associated with any non-filtered disease
            # If all diseases are filtered out, mark this symptom for removal
            if diseases.issubset(filtered_out_disease_ID):
                symptoms_to_remove_from_next_steps.add(symptom_id)

    # Filter out symptoms from the next steps that belong to the excluded disease IDs
    negative_next_step_recommendations = [
        recommendation
        for recommendation in negative_next_step_recommendations
        if recommendation["symptom_id"] not in symptoms_to_remove_from_next_steps
    ]

    filtered_triggers = filtered_triggers.exclude(Disease__in=filtered_out_disease_ID)

    '''
    Positive triggers selection for next steps
    1. Get matched positive trigger selection (with any triggers that are in positive or mandatory positive) from the filtered triggers
    2. Check for minimum and see if one under to return next steps
    3. Check for minimum to see if all satisfied with mandatory positive
    4. Check for all required and see if one under to return next steps
    5. Check for all required and see if all satisfied 
    6. Unlike negative selection, these will return all selected trigger checklists that are positive and meets qualifications. (Instead of filtering out for negative selection)
    Note: Next steps don't need to be selected out like negative triggers. Just make sure you don't have duplicates
    '''


    positive_trigger_checklists = filtered_triggers.filter(
        (
            Q(PositiveSymptoms__id__in = symptom_ids) |
            Q(MandatoryPositiveSymptoms__id__in = symptom_ids)
        )
    ).distinct()    

    '''
    Minimum Positive Triggers

    1. Check if all mandatory is satisfied
    2. If matched mandatory + matched non-mandatory >= selection requirement, then return trigger if mandatory all satisfied. Or else return all mandatory remaining
        a. If matched mandatory + matched non-mandatory = selection - 1, return next mandatory next step if more mandatory. Else, return non-mandatory list

    '''

    minimum_positive_selection_triggers = positive_trigger_checklists.filter(SelectionType = 3)
    matched_trigger_ID = []
    positive_next_step_recommendations = []
    
    for trigger in minimum_positive_selection_triggers:
        mandatory_positive_ids = set(trigger.MandatoryPositiveSymptoms.values_list('id', flat = True))
        positive_ids = set(trigger.PositiveSymptoms.values_list('id', flat = True))

        try:
            selection_threshold = int(trigger.SelectionAdditionalInfo)
        except ValueError:
            continue

        #check for total matched positive symptoms

        positive_matched_sx_count = len(mandatory_positive_ids & set(symptom_ids)) + len(positive_ids & set(symptom_ids))

        #if all mandatory are satisfied
        if (positive_matched_sx_count >= selection_threshold):
            if mandatory_positive_ids.issubset(symptom_ids):
                #add matched
                matched_trigger_ID.append(trigger.id)
            #If mandatory not all satisfied, return 
            else:
                for symptom_id in mandatory_positive_ids - set(symptom_ids):
                    positive_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name 
                    })

        #if one below the threshold
        elif positive_matched_sx_count == (selection_threshold - 1):
            #if all mandatory satisfied
            for symptom_id in positive_ids - set(symptom_ids):
                if mandatory_positive_ids.issubset(symptom_ids):
                    positive_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name 
                    })
            else:
                for symptom_id in  mandatory_positive_ids - set(symptom_ids):
                    positive_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name
                    })


    '''
    All Required Positive
    1. 

    '''
    
    all_required_positive_selection_trigger = positive_trigger_checklists.filter(SelectionType = 1)

    for trigger in all_required_positive_selection_trigger:
        all_required_mandatory_positive_ids = set(trigger.MandatoryPositiveSymptoms.values_list('id', flat = True))
        all_required_positive_ids = set(trigger.PositiveSymptoms.values_list('id', flat = True))
        all_required_total_positive_ids = all_required_mandatory_positive_ids | all_required_positive_ids

        #check if all symptom ids are in the combined set
        if all_required_total_positive_ids.issubset(set(symptom_ids)):
            #add to the matched trigger
            matched_trigger_ID.append(trigger.id)
        else:
            missing_positive_ids = all_required_total_positive_ids - set(symptom_ids)
            missing_positive_count = len(missing_positive_ids)

            if missing_positive_count <= 2:
                #if mandatory positives are satisfied, then return all positive triggers
                if all_required_mandatory_positive_ids.issubset(set(symptom_ids)):
                    for symptom_id in all_required_positive_ids - set(symptom_ids):
                        positive_next_step_recommendations.append({
                            "symptom_id": symptom_id,
                            "trigger_name": trigger.Name
                        })
                else:
                    for symptom_id in all_required_mandatory_positive_ids - set(symptom_ids):
                        positive_next_step_recommendations.append({
                            "symptom_id": symptom_id,
                            "trigger_name": trigger.Name
                        })
        

    matched_trigger_checklists = filtered_triggers.filter(id__in = matched_trigger_ID).distinct()
    matched_trigger_checklists_serialized = TriggerChecklistSerializer(matched_trigger_checklists, many = True)

    response_data = {
    "matched_trigger_checklists": matched_trigger_checklists_serialized.data,
    "positive_next_step_recommendations": list(positive_next_step_recommendations),
    "negative_next_step_recommendations": list(negative_next_step_recommendations),
    }

    return Response(response_data, status = 200)