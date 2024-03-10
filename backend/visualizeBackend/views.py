from django.shortcuts import render
from main.models import Disease, DiseaseAlgorithm

def home(request):
    diseases = Disease.objects.all()
    
     # List of tuples to store disease and its associated disease algorithms
    disease_algorithm_list = []
    
    # Fetch associated DiseaseAlgorithm instances for each Disease model
    for disease in diseases:
        #Get the diseasealgorithm for disease
        disease_algorithms = DiseaseAlgorithm.objects.filter(Disease=disease)
        disease_algorithm_list.append((disease, disease_algorithms))
    return render(request, 'visualizeBackend/visualize.html', {'disease_algorithm_list': disease_algorithm_list})
