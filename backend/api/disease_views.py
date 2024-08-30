from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm, TriggerChecklistItem, Symptoms, ExamType, NextStep, Symptoms
from .serializers import DiseaseSerializer, DiseaseAlgorithmSerializer, NextStepsSerializer, SymptomsSerializer, ExamTypeSerializer, TriggerChecklistItemSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json

#api/algorithms
@api_view(['GET'])
def showDiseaseAlgorithmDataForTree(request):
    if request.method == 'GET':
        diseases = Disease.objects.all()
        data = []
        #Get the all of the algorithms for the disease
        for disease in diseases:
            #convert models to dictionary representation of data
            disease_data = DiseaseSerializer(disease).data
            disease_data['algorithms'] = []
            #reverse relation manager: reverse search diseasealgorithm with FK of this disease
            algorithms = disease.diseasealgorithm_set.all()
            #Go through each algorithm and add the nextsteps info instead of just having the nextstep keys
            for algorithm in algorithms:
                nextSteps = algorithm.NextSteps.all()
                algorithm_data = DiseaseAlgorithmSerializer(algorithm).data
                #make it a child of the algorithm_data
                algorithm_data['NextSteps'] = NextStepsSerializer(nextSteps, many=True).data
                #Append this algorithm
                disease_data['algorithms'].append(algorithm_data)
            #add to the disease in the algorithm section
            data.append(disease_data)
        return Response(data) 

@api_view(['GET', 'POST'])
def GetAndPostDiseaseAlgorithmDataForForm(request):
    if request.method == 'GET':
        symptoms = Symptoms.objects.all()
        examTypes = ExamType.objects.all()
        trigger = TriggerChecklistItem.objects.all()
        triggerSerializer = TriggerChecklistItemSerializer(trigger, many = True)
        examTypeSerializer = ExamTypeSerializer(examTypes, many = True)
        symptomSerializer = SymptomsSerializer(symptoms, many = True)
        formData = {
            'symptoms': symptomSerializer.data,
            'examTypes': examTypeSerializer.data,
            "trigger": triggerSerializer.data
        }
        return Response(formData)
    elif request.method == 'POST':

        #DiseaseAlgorithm save
        diseaseAlgorithm_data = {
            'Name': request.data.get('TestName'),
            'Notes': request.data.get('Notes', ''),
            'Disease': request.data.get('DiseaseId')
        }

        if request.data.get('DAExamType'):
            diseaseAlgorithm_data['ExamType'] = request.data.get('DAExamType')

        diseaseAlgorithmSerializer = DiseaseAlgorithmSerializer(data = diseaseAlgorithm_data)
        if diseaseAlgorithmSerializer.is_valid():
            diseaseAlgorithm = diseaseAlgorithmSerializer.save()
             #Add trigger separately because foreign ID
            triggers = request.data.get('Triggers', '')
            if triggers:  # Check if triggers is not empty
                trigger = TriggerChecklistItem.objects.get(id=triggers)
                diseaseAlgorithm.Triggers.add(trigger)
                diseaseAlgorithm.save()
            
        else:
            return Response(diseaseAlgorithmSerializer.errors, status=400)
        
        #Saving nextStep
        nextStep_data = {
            'NextStepName': request.data.get('NSName'),
            'ConditionsForNextStep': request.data.get('ConditionsForNextStep'),
            'NextStepDiseaseAlgorithm': diseaseAlgorithm.id
        }
        #in case these are null
        if request.data.get('Symptom'):
            nextStep_data['Symptom'] = request.data.get('Symptom')
        if request.data.get('NSExamType'):
            nextStep_data['ExamType'] = request.data.get('NSExamType')
        nextStepSerializer = NextStepsSerializer(data = nextStep_data)
        if nextStepSerializer.is_valid():
            newNextStep = nextStepSerializer.save()
        else:
            return Response(nextStepSerializer.errors, status = 400)
        

        #add the nextstep to the node that current node is branching from
        currentAlgorithmNodeId = request.data.get('SelectedNodeId')

        currentAlgorithmNodeObj = get_object_or_404(DiseaseAlgorithm, id = currentAlgorithmNodeId)

        currentAlgorithmNodeObj.NextSteps.add(newNextStep)

        currentAlgorithmNodeObj.save()

        return Response({
                'next_step': nextStepSerializer.data,
                'disease_algorithm': diseaseAlgorithmSerializer.data
            }, status=201)

#If disease has no nodes, this adds the first one
@api_view(['POST'])
def Post_Initial_DiseaseAlgorithmNode(request):
    if request.method == 'POST':

        #DiseaseAlgorithm save
        diseaseAlgorithm_data = {
            'Name': request.data.get('Name'),
            'Notes': request.data.get('Notes', ''),
            'Disease': request.data.get('DiseaseId')
        }
        diseaseAlgorithmSerializer = DiseaseAlgorithmSerializer(data = diseaseAlgorithm_data)
        if diseaseAlgorithmSerializer.is_valid():
            diseaseAlgorithmSerializer.save()

        if diseaseAlgorithmSerializer.is_valid():
            diseaseAlgorithmSerializer.save()
            return Response(diseaseAlgorithmSerializer.data, status=201)
        else:
            return Response(diseaseAlgorithmSerializer.errors, status=400)
        
@api_view(['POST'])
def updateNode(request):
    if request.method == 'POST':
        #Get data
        updateNodeId = int(request.data.get('selectedNodeId'))
        print("updated node Id: ", updateNodeId)
        #Find model of interest
        updateNodeObj = DiseaseAlgorithm.objects.get(pk = updateNodeId)
        #Update model
        if updateNodeObj:
            updateNodeObj.Name = request.data.get('Name')
            updateNodeObj.Notes = request.data.get('Notes')
            updateNodeObj.Triggers.set(request.data.get('Triggers'))
            updateNodeObj.save()
            # Serialize the updated object
            serializer = DiseaseAlgorithmSerializer(updateNodeObj)

            print(f"Symptom of DiseaseAlgorithm with id={updateNodeObj.id} updated successfully")
        else: 
            return Response(updateNodeObj.errors, status=400)
        
        return Response({
                'disease_algorithm': serializer.data
            }, status=201)

#passes link parameters and the id of the link
@api_view(['POST'])
def updateLink(request):
    if request.method == 'POST':
        #Get data
        print("selected link Id: ", request.data.get('selectedLinkId'))
        updateLinkId = int(request.data.get('selectedLinkId'))
        #Find model of interest
        updateLinkObj = NextStep.objects.get(pk = updateLinkId)
        #Update model
        if updateLinkObj:
            updateLinkObj.ConditionsForNextStep = request.data.get('ConditionsForNextStep')
             # Handle Symptom update
            symptom_id = request.data.get('Symptom')
            if symptom_id:
                symptom_obj = Symptoms.objects.get(pk=symptom_id)
                updateLinkObj.Symptom = symptom_obj
            exam_id = request.data.get('ExamType')
            if exam_id:
                exam_obj = ExamType.objects.get(pk = exam_id)
                updateLinkObj.ExamType = exam_obj
            updateLinkObj.save()
            # Serialize the updated object
            serializer = NextStepsSerializer(updateLinkObj)

            print(f"Symptom of NextStep with id={updateLinkObj.id} updated successfully")
        else: 
            return Response(updateLinkObj.errors, status=400)
        
        return Response({
                'next_step': serializer.data
            }, status=201)

#Passes in selectedNodeId
@api_view(['DELETE'])
def deleteNode(request):
    if request.method == 'DELETE':
        try: 
            deletedNodeId = int(request.data.get('deletedNodeId'))
            deletedAlgorithm = DiseaseAlgorithm.objects.get(id = deletedNodeId)
            deletedAlgorithm.delete()
            return JsonResponse({'message': 'Disease Algorithm deleted successfully!'}, status=200)
        except DiseaseAlgorithm.DoesNotExist:
            return JsonResponse({'error': 'Algorithm not found'}, status=404)
        
#adding symptom unlisted in form
@api_view(['POST'])
def add_symptom(request):
    if request.method == 'POST':
        symptom_name = request.data.get('name')
        
        if not symptom_name:
            return JsonResponse({'error': 'Name is required'}, status=400)
        
        symptom_data = {
            'Name': symptom_name
        }

        symptomAlgorithmSerialized = SymptomsSerializer(data = symptom_data)
        if symptomAlgorithmSerialized.is_valid():
            symptomAlgorithmSerialized = symptomAlgorithmSerialized.save()
            return JsonResponse({'id': symptomAlgorithmSerialized.id, 'Name': symptomAlgorithmSerialized.Name}, status=201)
        return JsonResponse({"Could not save symptom"}, status = 404)

@api_view(['POST'])
def add_disease(request):
    if request.method == 'POST':
        disease_data = {
            'Name': request.data.get('Name'),
            'Notes': request.data.get('Notes')
        }
        print(request.data.get('Name'))
        disease_data_serialized = DiseaseSerializer(data = disease_data)
        if disease_data_serialized.is_valid():
            saved_disease_data_serialized = disease_data_serialized.save()
            return JsonResponse({'id': saved_disease_data_serialized.id, 'Name': saved_disease_data_serialized.Name}, status = 201)
        return JsonResponse({"Could not save disease"}, status = 404)


        
@api_view(['POST'])
def inputSymptoms(request):
    if request.method == 'POST':
        #Get symptom name from the request
        request_data = json.loads(request.body)
        #Get the parameter name for Name
        symptom_ID = request_data.get('ID', None)

        if 'symptom' not in request.session:
            request.session['symptoms'] = []
    #Check if not none
    if symptom_ID:
        #Add to session variable
        request.session['symptoms'].append(symptom_ID)
        #Reverse search the Trigger Checklist Items with symptom name
        symptom_triggers = TriggerChecklistItem.object.filter(SymptomTrigger = symptom_ID)

        #Reverse search the algorithms with triggers that have the symptom_trigger. NEED TO ADD THE OTHER WORKUP, ASSESSMENT, ETC
        algorithm_trigger = DiseaseAlgorithm.object.filter(Triggers__isnull = False, Triggers = symptom_triggers)

        #To-do: Add function to go through the triggers and check if activates those triggers 
        #Notes: Go through the symptom_trigger and see if there's enough 
        #Use session variables 

    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)




#archive
@api_view(['GET'])
def getSelectiveDiseaseAlgorithmData(request, dfk):
    diseaseAlgorithm = DiseaseAlgorithm.objects.filter(Disease = dfk)
    serializer = DiseaseAlgorithmSerializer(diseaseAlgorithm, many = True)
    return Response(serializer.data)


@api_view(['GET','POST'])
def test(request):
    if request.method == 'POST':
        symptoms = request.data.get('testVariable')
        # Perform some logic with the symptoms data
        # For example, you could process the symptoms and return additional questions
        additional_questions = ['Do you have a fever?', 'Are you experiencing coughing or shortness of breath?']
        return Response({'additional_questions': additional_questions})
    else:
        # Handle GET requests, if needed
        return Response({'message': 'This endpoint only supports POST requests'}, status=405)  # Method Not Allowed


