from django.urls import path
from . import trigger_view


urlpatterns = [
    path('showSelection/', trigger_view.showSelectionType, name = "show_selection_type"),
    path('showSymptoms/', trigger_view.showSymptoms, name = "show_symptoms"),
    path('submitTriggerForm/', trigger_view.PostTriggerForm, name = "submit_form"),
]