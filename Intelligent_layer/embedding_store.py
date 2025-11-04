from sentence_transformers import SentenceTransformer
import chromadb
import os

# Initialize embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize Chroma client (creates local vector DB)
chroma_client = chromadb.PersistentClient(path="chroma_store")

collection = chroma_client.get_or_create_collection("jd_docs")

# Loop over all text files in /data
data_folder = "data"
for file in os.listdir(data_folder):
    if file.endswith(".txt"):
        with open(os.path.join(data_folder, file), "r", encoding="utf-8") as f:
            content = f.read()
            embedding = model.encode(content).tolist()
            collection.add(
                documents=[content],
                embeddings=[embedding],
                ids=[file]
            )
        print(f"✅ Embedded and stored: {file}")

print("All embeddings saved successfully in ChromaDB.")
