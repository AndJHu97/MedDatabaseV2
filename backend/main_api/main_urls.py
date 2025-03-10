from django.urls import path
from . import main_view


urlpatterns = [
    path('showSymptoms/', main_view.showSymptoms, name = "show_symptoms"),
    path('getMatchedDefaultTriggers/', main_view.GetDefaultMatchingTriggerChecklists, name = "get_default_matched_triggers"),
    path('showDiseases/', main_view.showDiseases, name = "show_disease"),
    path('getDiseaseAlgorithms/', main_view.GetDefaultDiseaseAlgorithms, name = "get_disease_algorithms")
]