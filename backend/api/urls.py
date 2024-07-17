from django.urls import path
from . import disease_views


urlpatterns = [
    path('algorithms/', disease_views.showDiseaseAlgorithmDataForTree, name = "DiseaseAlgorithm"),
    path('algorithmsForm/', disease_views.showDiseaseAlgorithmDataForForm, name = "DiseaseAlgorithmForm"),
    path('updateNode/', disease_views.updateNode, name = "DiseaseUpdateNode"),
    path('updateLink/', disease_views.updateLink, name = "DiseaseUpdateLink"),
    path('deleteNode/', disease_views.deleteNode, name = "DiseaseDeleteNode")
]