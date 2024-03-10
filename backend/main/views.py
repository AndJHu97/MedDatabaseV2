from django.shortcuts import render

diseases = [
    {
        'disease': 'Hypertension',
        'diagnosis': '>=130/80'
    },
    {
        'disease': 'Osteoarthritis',
        'diagnosis': 'Joint pain'
    }
]

def home(request):
    context = {
        'diseases': diseases
    }
    return render(request, 'main/home.html', context)

def about(request):
    return render(request, 'main/about.html', {'title': 'About'})
# Create your views here.
