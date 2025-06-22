#Create all the faiss index for all symptoms so can check score if needed
from django.utils.timezone import now
from datetime import datetime
from main.models import Symptoms
import os
import pickle
import faiss
from transformers import AutoTokenizer, AutoModel
import torch

INDEX_PATH = "main/faiss_index/symptom_index.faiss"
MAPPING_PATH = "main/faiss_index/symptom_mapping.pkl"

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state  # (batch_size, seq_len, hidden_size)
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size())
    return (token_embeddings * input_mask_expanded).sum(1) / input_mask_expanded.sum(1)

def build_faiss_index():
    if not Symptoms.objects.exists():
        print("No symptoms found. Skipping FAISS index build.")
        return

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

    #Update time 
    with open("main/faiss_index/last_index_time.txt", "w") as f:
        f.write(now().isoformat())

    print("Building FAISS index...")

    tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
    model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
    model.eval()

    symptoms = Symptoms.objects.all()
    #Store symptom id for each index
    #i.e. 0: 5, 1: 2, etc.
    symptom_mapping = {i: s.id for i, s in enumerate(symptoms)}
    #Get symptom name to embed
    symptom_names = [s.Name for s in symptoms]

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    inputs = tokenizer(symptom_names, padding=True, truncation = True, return_tensors = "pt")
    with torch.no_grad():
        model_output = model(**inputs)


    embeddings = mean_pooling(model_output, inputs['attention_mask'])
    embeddings = embeddings.cpu().numpy()

    #Build index to add the embeddings into
    #Get the dim size of each symptom (I assume 2 would be the amount of symptoms)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok = True)
    faiss.write_index(index, INDEX_PATH)

    with open(MAPPING_PATH, "wb") as f:
        pickle.dump(symptom_mapping, f)

    print("FAISS built with Clinical Bert")


    