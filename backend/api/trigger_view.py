from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from main.models import TriggerChecklist, Symptoms, SelectionType, Disease
from .serializers import DiseaseSerializer, SymptomsSerializer, TriggerChecklistSerializer, DiagnosisSerializer, SelectionTypeSerializer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json

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

