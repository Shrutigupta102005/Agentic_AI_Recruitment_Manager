# app.py  — Resume Ranker (Flask backend)
# pip install flask scikit-learn PyPDF2 python-docx

import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx

UPLOAD_DIR = "uploads"
ALLOWED = {"pdf", "docx"}

app = Flask(__name__)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------- helpers ----------

def _allowed(name: str) -> bool:
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def read_pdf(path: str) -> str:
    text = []
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for p in reader.pages:
            text.append(p.extract_text() or "")
    return "\n".join(text)

def read_docx(path: str) -> str:
    d = docx.Document(path)
    return "\n".join([p.text for p in d.paragraphs])

def read_any(path: str) -> str:
    ext = path.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        return read_pdf(path)
    if ext == "docx":
        return read_docx(path)
    return ""

def score_similarity(resume_text: str, jd_text: str) -> float:
    # simple, fast baseline: TF-IDF + cosine
    vec = TfidfVectorizer(stop_words="english")
    X = vec.fit_transform([resume_text, jd_text])
    score = cosine_similarity(X[0], X[1])[0][0]
    return round(float(score) * 100, 2)  # 0–100

# ---------- routes ----------

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/rank")
def rank():
    jd = request.form.get("jd", "").strip()
    if not jd:
        return jsonify(error="Missing 'jd' in form-data"), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify(error="Upload at least one file under 'files'"), 400

    results = []
    for f in files:
        if not f or not _allowed(f.filename):
            continue
        name = secure_filename(f.filename)
        path = os.path.join(UPLOAD_DIR, name)
        f.save(path)

        try:
            text = read_any(path)
            score = score_similarity(text, jd)
            results.append({"resume": name, "score": score})
        except Exception as e:
            results.append({"resume": name, "score": 0.0, "error": str(e)})

    results.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return jsonify(rankings=results, count=len(results))

if __name__ == "__main__":
    app.run(debug=True, port=5000)
