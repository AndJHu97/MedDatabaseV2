from django.urls import path
from . import views


urlpatterns = [
    path('algorithms/', views.getDiseaseAndAlgorithmData, name = "DiseaseAlgorithm")
]