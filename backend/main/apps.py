from django.apps import AppConfig
import sys
import os

class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'

    def ready(self):
        if 'runserver' in sys.argv and os.getenv("DISABLE_FAISS_BUILD") != "1":
            from .faiss_index.faiss_index_builder import build_faiss_index
            build_faiss_index()
