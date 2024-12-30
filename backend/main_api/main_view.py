from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import Disease, DiseaseAlgorithm, TriggerChecklist, Symptoms, ExamType, NextStep, Symptoms, Diagnosis
from .main_serializers import DiseaseSerializer, DiseaseAlgorithmSerializer, NextStepsSerializer, SymptomsSerializer, ExamTypeSerializer, TriggerChecklistSerializer, DiagnosisSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json

@api_view(['GET'])
def showSymptoms(request):
    if request.method == 'GET':
        symptoms = Symptoms.objects.all()
        symptomsSerializer = SymptomsSerializer(symptoms, many = True)
        return Response(symptomsSerializer.data)