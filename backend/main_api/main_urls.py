from django.urls import path
from . import main_view


urlpatterns = [
    path('showSymptoms/', main_view.showSymptoms, name = "show_symptoms"),
    path('showExamTypes/', main_view.showExamTypes, name = "show_exam_types"),
    path('getMatchedDefaultTriggers/', main_view.GetDefaultMatchingTriggerChecklists, name = "get_default_matched_triggers"),
    path('showDiseases/', main_view.showDiseases, name = "show_disease"),
    path('showDiseaseById/', main_view.showDiseaseById, name = "show_disease_by_id"),
    path('getDiseaseAlgorithms/', main_view.GetDefaultDiseaseAlgorithms, name = "get_disease_algorithms"),
    path('showDiseaseAlgorithms/', main_view.showDiseaseAlgorithm, name = "show_disease_algorithms"),
    path('showNextSteps/', main_view.showNextSteps, name = "show_next_steps"),
    path('semanticSymptomSearch/', main_view.semantic_symptom_search, name = "semantic_symptom_search")
]