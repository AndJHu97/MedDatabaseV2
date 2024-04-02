from rest_framework import serializers
from main.models import Disease, DiseaseAlgorithm, NextStep

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