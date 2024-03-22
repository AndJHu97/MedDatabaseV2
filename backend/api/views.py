from rest_framework.response import Response
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm
from .serializers import DiseaseSerializer, DiseaseAlgorithmSerializer

@api_view(['GET', 'POST'])
def getDiseaseAndAlgorithmData(request):
    if request.method == 'GET':
        diseases = Disease.objects.all()
        data = []
        for disease in diseases:
            disease_data = DiseaseSerializer(disease).data
            algorithms = disease.diseasealgorithm_set.all()
            algorithm_data = DiseaseAlgorithmSerializer(algorithms, many = True).data
            disease_data['algorithms'] = algorithm_data
            data.append(disease_data)
        return Response(data)
    elif request.method == 'POST':
         # Perform some logic with the symptoms data
        # For example, you could process the symptoms and return additional questions
        additional_questions = ['Do you have a fever?', 'Are you experiencing coughing or shortness of breath?']
        return Response({'additional_questions': additional_questions})

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


