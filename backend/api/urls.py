from django.urls import path
from . import disease_views


urlpatterns = [
    path('algorithms/', disease_views.showDiseaseAlgorithmDataForTree, name = "DiseaseAlgorithm"),
    path('algorithmsForm/', disease_views.GetAndPostDiseaseAlgorithmDataForForm, name = "DiseaseAlgorithmForm"),
    path('updateNode/', disease_views.updateNode, name = "DiseaseUpdateNode"),
    path('updateLink/', disease_views.updateLink, name = "DiseaseUpdateLink"),
    path('deleteNode/', disease_views.deleteNode, name = "DiseaseDeleteNode"),
    path('add_symptom/', disease_views.add_symptom, name = "AddSymptom"),
    path('add_disease/', disease_views.add_disease, name = "AddDisease"),
    path('addFirstNode/', disease_views.Post_Initial_DiseaseAlgorithmNode, name = "AddFirstNode"),
]