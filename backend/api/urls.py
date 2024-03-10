from django.urls import path
from . import views


urlpatterns = [
    path('<str:dfk>/', views.getSelectiveDiseaseAlgorithmData),
    path('add/', views.addItem)
]