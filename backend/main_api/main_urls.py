from django.urls import path
from . import main_view


urlpatterns = [
    path('showSymptoms/', main_view.showSymptoms, name = "show_symptoms"),
]