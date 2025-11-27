import os
import numpy as np
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
from sklearn.metrics.pairwise import cosine_similarity
import chromadb

JD_PATH = r"Intelligent_layer\data\data_scientist.txt"
resume_folder = r"Intelligent_layer\resumes"


# Step 1: Initialize model and Chroma client
model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection("jd_docs")

# Step 2: Get the latest stored JD embedding from Chroma
jd_data = collection.get(include=["documents", "embeddings"])
if not jd_data["documents"]:
    raise ValueError("No Job Description found. Please run JD Generator first!")

jd_text = jd_data["documents"][-1]  # get the most recent JD
jd_embedding = np.array(jd_data["embeddings"][-1]).reshape(1, -1)

# Step 3: Extract text from resumes
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

# Step 4: Rank resumes
 
resume_scores = []

for resume_file in os.listdir(resume_folder):
    if resume_file.endswith(".pdf"):
        resume_path = os.path.join(resume_folder, resume_file)
        resume_text = extract_text_from_pdf(resume_path)
        resume_embedding = model.encode(resume_text).reshape(1, -1)
        score = cosine_similarity(jd_embedding, resume_embedding)[0][0]
        resume_scores.append((resume_file, score))

# Step 5: Sort resumes by match score
resume_scores.sort(key=lambda x: x[1], reverse=True)

# Step 6: Display results
print("\n--- Resume Ranking Results ---\n")
for i, (name, score) in enumerate(resume_scores, 1):
    print(f"{i}. {name} --> Match Score: {score:.4f}")

top_resume = resume_scores[0][0] if resume_scores else "None"
print(f"\nTop Candidate: {top_resume}")
