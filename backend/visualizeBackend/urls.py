from django.urls import path
from . import views 

urlpatterns = [
    path('visualize/home/', views.home, name = 'visualize-home'),
]