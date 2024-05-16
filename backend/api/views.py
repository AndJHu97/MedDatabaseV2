from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm, TriggerChecklistItem
from .serializers import DiseaseSerializer, DiseaseAlgorithmSerializer, NextStepsSerializer, TriggerChecklistItemSerializer
from django.views.decorators.csrf import csrf_exempt
import json

#api/algorithms
@api_view(['GET', 'POST'])
def getDiseaseAndAlgorithmData(request):
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
    elif request.method == 'POST':
        diseaseAlgorithmInputSerializer = DiseaseAlgorithmSerializer(data = request.data)
        #check if valid
        if diseaseAlgorithmInputSerializer.is_valid():
            #Save and can manipulate this if want to
            newDiseaseAlgorithm = diseaseAlgorithmInputSerializer.save()
            # Optionally, return the serialized data of the newly created instance
            return Response(diseaseAlgorithmInputSerializer.data, status=201)
        else:
            #if invalid data: error
            return Response(diseaseAlgorithmInputSerializer.errors, status = 400)

#get medical user input of symptoms
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


