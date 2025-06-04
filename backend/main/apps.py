from django.apps import AppConfig
import sys

class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'

    def ready(self):
        if 'runserver' in sys.argv:
            from .faiss_index.faiss_index_builder import build_faiss_index
            build_faiss_index()
