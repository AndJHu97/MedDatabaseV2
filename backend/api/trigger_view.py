from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import TriggerChecklist, Symptoms, SelectionType, Disease
from .serializers import DiseaseSerializer, SymptomsSerializer, TriggerChecklistSerializer, DiagnosisSerializer, SelectionTypeSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from django.db.models import Q

@api_view(['GET'])
def showSelectionType(request):
    if request.method == 'GET':
        selectionTypes = SelectionType.objects.all()
        selectionTypesSerializer = SelectionTypeSerializer(selectionTypes, many = True)
        return Response(selectionTypesSerializer.data)

@api_view(['GET'])
def showSymptoms(request):
    if request.method == 'GET':
        symptoms = Symptoms.objects.all()
        symptomsSerializer = SymptomsSerializer(symptoms, many = True)
        return Response(symptomsSerializer.data)

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

    #Process the negative symptoms here and eliminate all trigger checklist with that disease ID
    #Save all the values in negativeDiseaseID list so can remove

    #Process minimum
    minimum_selection_triggers = matched_negative_trigger_checklists.filter(SelectionAdditionalInformation="Minimum")

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
                negative_next_step_recommendations.extend(mandatory_negative_ids - set(symptom_ids))
        elif negative_matched_sx_count == (selection_threshold - 1):

            #if all mandatory satisfied, add in mandatory negative symptoms to update
            if mandatory_negative_ids.issubset(symptom_ids):
                negative_next_step_recommendations.extend(negative_ids - set(symptom_ids))
            else:
                #if negative mandatory not satisfied, add in the rest needed
                negative_next_step_recommendations.extend(mandatory_negative_ids - set(symptom_ids))

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
    negative_next_step_recommendations = [symptom for symptom in negative_next_step_recommendations if symptom not in symptoms_to_remove_from_next_steps]

    filtered_triggers = TriggerChecklist.objects.exclude(Disease__in=filtered_out_disease_ID)
    #Process All required
    

    
    matched_trigger_checklists = filtered_triggers.objects.filter(
        (
            Q(MandatoryPositiveSymptoms__id__in = symptom_ids) |
            Q(PositiveSymptoms__id__in = symptom_ids)
        )
        ).distinct()
    
    
    
    
    matched_trigger_checklists_serialized = TriggerChecklistSerializer(matched_trigger_checklists, many = True)

    return Response(matched_trigger_checklists_serialized.data, status = 200)

#Get response
@api_view(['POST'])
def PostTriggerForm(request):
    if request.method == 'POST':
        print(request.data)  

        #Get all the foreign IDs of symptoms
        positive_symptom_ids = request.data.get('PositiveSymptomIDs', [])
        negative_symptom_ids = request.data.get('NegativeSymptomIDs', [])
        mandatory_positive_symptom_ids = request.data.get('MandatoryPositiveSymptomIDs', [])
        mandatory_negative_symptom_ids = request.data.get('MandatoryNegativeSymptomIDs', [])
        positiveSymptoms = Symptoms.objects.filter(id__in=positive_symptom_ids)
        negativeSymptoms = Symptoms.objects.filter(id__in=negative_symptom_ids)
        mandatoryPositiveSymptoms = Symptoms.objects.filter(id__in = mandatory_positive_symptom_ids)
        mandatoryNegativeSymptoms = Symptoms.objects.filter(id__in = mandatory_negative_symptom_ids)


        triggerForm_data = {
            'Name': request.data.get('Name'),
            'Group': request.data.get('Group'),
            'ChecklistLogic': request.data.get('ChecklistLogicInfo'),
            'SelectionAdditionalInfo': request.data.get('SelectionAdditionalInfo'),
            'SelectionType': request.data.get('SelectionTypeID'),
            'Disease' : request.data.get('SelectedDiseaseId'),
            'GeneralAdditionalInfo': request.data.get('GeneralAdditionalInfo')
        }

        triggerChecklistSerializer = TriggerChecklistSerializer(data=triggerForm_data)
        if triggerChecklistSerializer.is_valid():
            triggerForm = triggerChecklistSerializer.save()
            # Save the Many-to-Many field
            triggerForm.PositiveSymptoms.set(positiveSymptoms)
            triggerForm.NegativeSymptoms.set(negativeSymptoms)
            triggerForm.MandatoryPositiveSymptoms.set(mandatoryPositiveSymptoms)
            triggerForm.MandatoryNegativeSymptoms.set(mandatoryNegativeSymptoms)
            return Response(triggerChecklistSerializer.data, status=201)
        else:
            print(triggerChecklistSerializer.errors)
            return Response(triggerChecklistSerializer.errors, status=400)


