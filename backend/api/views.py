from rest_framework.response import Response
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm
from .serializers import DiseaseSerializer, DiseaseAlgorithmSerializer, NextStepsSerializer

@api_view(['GET', 'POST'])
def getDiseaseAndAlgorithmData(request):
    if request.method == 'GET':
        diseases = Disease.objects.all()
        data = []
        savedAlgorithmData = []
        #Get the all of the algorithms for the disease
        for disease in diseases:
            #convert models to dictionary representation of data
            disease_data = DiseaseSerializer(disease).data
            #reverse relation manager: reverse search diseasealgorithm with FK of this disease
            algorithms = disease.diseasealgorithm_set.all()
            #Go through each algorithm and add the nextsteps info instead of just having the nextstep keys
            for algorithm in algorithms:
                nextSteps = algorithm.NextSteps.all()
                algorithm_data = DiseaseAlgorithmSerializer(algorithm).data
                algorithm_data['NextSteps'] = NextStepsSerializer(nextSteps, many=True).data
                #Save each time it loops around (or else algorithm_data gets replaced every time)
                savedAlgorithmData.append(algorithm_data)
            #add to the disease in the algorithm section
            disease_data['algorithms'] = savedAlgorithmData
            data.append(disease_data)
        return Response(data)
    elif request.method == 'POST':
         # Perform some logic with the symptoms data
        # Placeholder
        additional_questions = ['Do you have a fever?', 'Are you experiencing coughing or shortness of breath?']
        return Response({'additional_questions': additional_questions})

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


