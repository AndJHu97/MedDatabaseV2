from rest_framework import status 
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import TriggerChecklist, Symptoms, SelectionType, Disease, DiseaseAlgorithm, NextStep, ExamType
from .main_serializers import DiseaseSerializer, SymptomsSerializer, TriggerChecklistSerializer, NextStepsSerializer, DiseaseAlgorithmSerializer, ExamTypeSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from django.db.models import Q

#FAISS
#from sentence_transformers import SentenceTransformer
import faiss
import pickle
import numpy as np
import os
#from transformers import AutoTokenizer, AutoModel
import requests
from huggingface_hub import InferenceClient

#HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"


client = InferenceClient(api_key=os.environ["HF_TOKEN"])


'''
Using Bert
tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
'''

#model = SentenceTransformer('all-MiniLM-L6-v2')

#ONLY FOR HF API END POINT
def get_embedding_from_hf(query: str):
    result = client.feature_extraction(query, model="sentence-transformers/all-MiniLM-L6-v2")
    return np.array(result, dtype='float32')


#Bert
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size())
    return (token_embeddings * input_mask_expanded).sum(1) / input_mask_expanded.sum(1)


def load_faiss_index():
    index_path = "main/faiss_index/symptom_index.faiss"
    if not os.path.exists(index_path):
        raise FileNotFoundError(f"FAISS index file not found at {index_path}")
    return faiss.read_index(index_path)

def load_symptom_mapping():
    mapping_path = "main/faiss_index/symptom_mapping.pkl"
    if not os.path.exists(mapping_path):
        raise FileNotFoundError(f"Symptom mapping file not found at {mapping_path}")
    with open(mapping_path, "rb") as f:
        return pickle.load(f)

@api_view(['GET'])
def semantic_symptom_search(request):

    query = "glucose"
    embedding = get_embedding_from_hf(query)
    print("Shape:", embedding.shape)


    query = request.GET.get("search_term", "")
    if not query:
        return Response([])
    
    try:
        faiss_index = load_faiss_index()
        index_to_symptom = load_symptom_mapping()
    except FileNotFoundError as e:
        return Response({"error": str(e)}, status=500)
    
    #Without using Hugging face API (old)
    '''
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_vec = model.encode([query], convert_to_numpy=True).astype('float32')
    '''
    
    try:
        # Call Hugging Face API to get query embedding
        query_vec = get_embedding_from_hf(query).reshape(1, -1)
    except Exception as e:
        return Response({"error": "Failed to get embedding from Hugging Face", "details": str(e)}, status=500)
    
        
    #Bert
    '''
    inputs = tokenizer(query, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        model_output = model(**inputs)

    query_embedding = mean_pooling(model_output, inputs['attention_mask'])
    query_vec = query_embedding.cpu().numpy().astype('float32')
    '''

    #Distance and index returns of top 5 matches
    D, I = faiss_index.search(query_vec, k = 5)

    results = [{"symptom_id": index_to_symptom[i], "score": float(1/(1+d))} for i,d in zip(I[0], D[0])]

    return Response(results)

@api_view(['GET'])
def showSymptoms(request):
    if request.method == 'GET':
        symptoms = Symptoms.objects.all()
        symptomsSerializer = SymptomsSerializer(symptoms, many = True)
        return Response(symptomsSerializer.data)
    
@api_view(['GET'])
def showExamTypes(request):
    if request.method == 'GET':
        examType = ExamType.objects.all()
        examTypeSerializer = ExamTypeSerializer(examType, many = True)
        return Response(examTypeSerializer.data)
    
@api_view(['GET'])
def showDiseases(request):
    if request.method == 'GET':
        diseases = Disease.objects.all()
        diseaseSerializer = DiseaseSerializer(diseases, many = True)
        return Response(diseaseSerializer.data)
    
@api_view(['GET'])
def showDiseaseById(request):
    if request.method == 'GET':
        disease_id = request.GET.get('id', None)

        if not disease_id:
            return Response({'error': 'ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            disease = Disease.objects.get(id = disease_id)
            serializer = DiseaseSerializer(disease)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Disease.DoesNotExist:
            return Response({'error': 'Disease not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def showDiseaseAlgorithm(request):
    if request.method == 'GET':
        disease_algorithm_id = request.GET.get('id', None)

        if not disease_algorithm_id:
            return Response({'error': 'ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the DiseaseAlgorithm object using the provided ID
            disease_algorithm = DiseaseAlgorithm.objects.get(id=disease_algorithm_id)

            # Serialize the disease_algorithm object and return it
            serializer = DiseaseAlgorithmSerializer(disease_algorithm)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except DiseaseAlgorithm.DoesNotExist:
            return Response({'error': 'DiseaseAlgorithm not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def showNextSteps(request):
    if request.method == 'GET':
        next_step_id = request.GET.get('id', None)

    if not next_step_id:
        return Response({'error': 'ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        next_step = NextStep.objects.get(id = next_step_id)
        next_step_serializer = NextStepsSerializer(next_step)
        return Response(next_step_serializer.data, status = status.HTTP_200_OK)
    except NextStep.DoesNotExist:
        return Response({'error': 'Next Steps not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def GetDefaultMatchingTriggerChecklists(request):
    symptom_ids_str = request.GET.get('symptom_ids', '')  # Retrieves as a string
    #make into array
    symptom_ids = list(map(int, symptom_ids_str.split(','))) if symptom_ids_str else []  
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
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
                    })

        elif negative_matched_sx_count == (selection_threshold - 1):
            #if all mandatory satisfied, add in mandatory negative symptoms to update
            if mandatory_negative_ids.issubset(symptom_ids):
                #input the next steps with the trigger.name
                for symptom_id in negative_ids - set(symptom_ids):
                    negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
                    })
            else:
                #if negative mandatory not satisfied, add in the rest needed
                for symptom_id in mandatory_negative_ids - set(symptom_ids):
                    negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
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
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
                    })
                else:
                    for symptom_id in all_required_mandatory_negative_ids - set(symptom_ids):
                        negative_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
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
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
                    })

        #if one below the threshold
        elif positive_matched_sx_count == (selection_threshold - 1):
            #if all mandatory satisfied
            for symptom_id in positive_ids - set(symptom_ids):
                if mandatory_positive_ids.issubset(symptom_ids):
                    positive_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
                    })
            else:
                for symptom_id in  mandatory_positive_ids - set(symptom_ids):
                    positive_next_step_recommendations.append({
                        "symptom_id": symptom_id,
                        "trigger_name": trigger.Name,
                        "source": trigger.Source
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
                            "trigger_name": trigger.Name,
                            "source": trigger.Source
                        })
                else:
                    for symptom_id in all_required_mandatory_positive_ids - set(symptom_ids):
                        positive_next_step_recommendations.append({
                            "symptom_id": symptom_id,
                            "trigger_name": trigger.Name,
                            "source": trigger.Source
                        })
        

    matched_trigger_checklists = filtered_triggers.filter(id__in = matched_trigger_ID).distinct()
    matched_trigger_checklists_serialized = TriggerChecklistSerializer(matched_trigger_checklists, many = True)
    disease_ids_triggered = matched_trigger_checklists.values_list('Disease', flat = True).distinct()

    response_data = {
    "matched_trigger_checklists": matched_trigger_checklists_serialized.data,
    "positive_next_step_recommendations": list(positive_next_step_recommendations),
    "negative_next_step_recommendations": list(negative_next_step_recommendations),
    "diseases_ids_triggered": disease_ids_triggered
    }

    return Response(response_data, status = 200)

@api_view(['GET'])
def GetDefaultDiseaseAlgorithms(request):
    if request.method == 'GET':
        disease_id = request.GET.get('disease_id')
        next_steps_ids = request.GET.get('next_steps_ids', '')
        #convert to int
        next_steps_ids = list(map(int, next_steps_ids.split(','))) if next_steps_ids else []
        print("next step ids: ", next_steps_ids)
        if not disease_id:
            return Response({'error': 'Disease ID is required'}, status=400)
        
        try:
            disease = Disease.objects.get(id = disease_id)
        except Disease.DoesNotExist:
            return Response({'error': 'Disease not found'}, status = 400)
        
        root_algorithms = disease.RootAlgorithmNodes.all()
        #ONLY DOES THE FIRST ONE OF ROOT ALGORITHM
        final_algorithm = root_algorithms.first()

        if final_algorithm is None:
            return Response({'error': 'No root algorithm found for this disease'}, status=400)
        print("root node: ", final_algorithm)

        #Assume that the logged next steps from user are in order
        for i in range(len(next_steps_ids)):
            algorithm_next_steps = final_algorithm.NextSteps.all()
            print("algorithm next steps: ", algorithm_next_steps)
            #Get all of the next steps of algorithm
            algorithm_next_steps_ids =  {step.id for step in algorithm_next_steps}

            #matched next steps given with the disease algorithm's next steps
            if next_steps_ids[i] not in algorithm_next_steps_ids:
                break  # End the loop if no match is found
            
            selected_next_step = NextStep.objects.get(id=next_steps_ids[i])
            #grab the next algorithm
            final_algorithm = selected_next_step.NextStepDiseaseAlgorithm

        #convert next steps to a list of id
        final_next_step_ids = list(final_algorithm.NextSteps.values_list('id', flat=True))
        
        return Response({"test_id": final_algorithm.id, 'next_steps_ids': final_next_step_ids})



             
