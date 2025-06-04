#Create all the faiss index for all symptoms so can check score if needed
from django.utils.timezone import now
from datetime import datetime
from main.models import Symptoms
import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer

INDEX_PATH = "main/faiss_index/symptom_index.faiss"
MAPPING_PATH = "main/faiss_index/symptom_mapping.pkl"

def build_faiss_index():

    #Will check if it should update FAISS based on the last update
    last_modified = Symptoms.objects.latest('updated_at').updated_at
    try:
        with open("main/faiss_index/last_index_time.txt", "r") as f:
            last_index_time = datetime.fromisoformat(f.read())
        if last_modified <= last_index_time:
            print("FAISS Index is up to date.")
            #return
    except FileNotFoundError:
        pass

    with open("main/faiss_index/last_index_time.txt", "w") as f:
        f.write(now().isoformat())

    print("Building FAISS index...")

    model = SentenceTransformer('all-MiniLM-L6-v2')

    symptoms = Symptoms.objects.all()
    #Store symptom id for each index
    #i.e. 0: 5, 1: 2, etc.
    symptom_mapping = {i: s.id for i, s in enumerate(symptoms)}
    #Get symptom name to embed
    symptom_names = [s.Name for s in symptoms]

    embeddings = model.encode(symptom_names, convert_to_numpy=True)

    #Build index to add the embeddings into
    #Get the dim size of each symptom (I assume 2 would be the amount of symptoms)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok = True)
    faiss.write_index(index, INDEX_PATH)

    with open(MAPPING_PATH, "wb") as f:
        pickle.dump(symptom_mapping, f)

    print("FAISS built")


    