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

@api_view(['POST'])
def PostTriggerForm(request):
    if request.method == 'POST':
        print(request.data)  

        #Get all the foreign IDs of symptoms
        symptom_ids = request.data.get('SelectedSymptomsIDs', [])
        symptoms = Symptoms.objects.filter(id__in=symptom_ids)

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
            triggerForm.SymptomItems.set(symptoms)
            return Response(triggerChecklistSerializer.data, status=201)
        else:
            print(triggerChecklistSerializer.errors)
            return Response(triggerChecklistSerializer.errors, status=400)



