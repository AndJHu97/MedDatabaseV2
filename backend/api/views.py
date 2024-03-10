from rest_framework.response import Response
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm
from .serializers import DiseaseSerializer, DiseaseAlgorithmSerializer

@api_view(['GET'])
def getDiseaseData(request):
    disease = Disease.objects.all()
    serializer = DiseaseSerializer(disease, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def getSelectiveDiseaseAlgorithmData(request, dfk):
    diseaseAlgorithm = DiseaseAlgorithm.objects.filter(Disease = dfk)
    serializer = DiseaseAlgorithmSerializer(diseaseAlgorithm, many = True)
    return Response(serializer.data)

@api_view(['POST'])
def addItem(request):
    serializer = DiseaseSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)