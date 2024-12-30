from rest_framework import serializers
from main.models import Disease, Diagnosis, DiseaseAlgorithm, NextStep, TriggerChecklist, Symptoms, ExamType, SelectionType

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = '__all__'

class DiseaseAlgorithmSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseAlgorithm
        fields = '__all__'

class NextStepsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextStep
        fields = '__all__'

class TriggerChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriggerChecklist
        fields = '__all__'

class SelectionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectionType
        fields = '__all__'

class SymptomsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptoms
        fields = '__all__'  

class ExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = '__all__'