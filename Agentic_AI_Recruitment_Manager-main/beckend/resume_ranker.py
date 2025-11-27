# app.py  — Resume Ranker (Flask backend)
# pip install flask flask-cors scikit-learn PyPDF2 python-docx

import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx
from Intelligent_layer.app import generate_jd

UPLOAD_DIR = "uploads"
ALLOWED = {"pdf", "docx"}

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
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

def extract_skills(resume_text: str, jd_text: str) -> dict:
    """Extract and match skills between resume and JD"""
    # Common technical skills and tools
    common_skills = [
        "python", "java", "javascript", "typescript", "react", "angular", "vue",
        "node.js", "nodejs", "express", "django", "flask", "spring", "sql",
        "mongodb", "postgresql", "mysql", "redis", "docker", "kubernetes",
        "aws", "azure", "gcp", "git", "ci/cd", "jenkins", "terraform",
        "machine learning", "ml", "ai", "data science", "deep learning",
        "html", "css", "rest api", "graphql", "microservices", "agile",
        "scrum", "jira", "linux", "bash", "powershell", "c++", "c#",
        "go", "rust", "php", "ruby", "rails", "scala", "kotlin", "swift"
    ]
    
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()
    
    # Find skills in both resume and JD
    matched_skills = []
    missing_skills = []
    
    for skill in common_skills:
        in_jd = skill in jd_lower
        in_resume = skill in resume_lower
        
        if in_jd and in_resume:
            matched_skills.append(skill.title())
        elif in_jd and not in_resume:
            missing_skills.append(skill.title())
    
    return {
        "matched": matched_skills[:10],  # Limit to top 10
        "missing": missing_skills[:5]     # Limit to top 5
    }

def extract_experience(resume_text: str) -> dict:
    """Extract experience information from resume"""
    # Look for years of experience patterns
    years_patterns = [
        r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
        r'experience[:\s]+(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience'
    ]
    
    years = "Not specified"
    for pattern in years_patterns:
        match = re.search(pattern, resume_text, re.IGNORECASE)
        if match:
            years = f"{match.group(1)}+ years"
            break
    
    # Look for education
    education_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "mba", "b.s", "m.s"]
    education = "Not specified"
    
    resume_lower = resume_text.lower()
    for keyword in education_keywords:
        if keyword in resume_lower:
            if "master" in keyword or "m.tech" in keyword or "m.s" in keyword:
                education = "Master's Degree"
            elif "phd" in keyword:
                education = "PhD"
            elif "bachelor" in keyword or "b.tech" in keyword or "b.s" in keyword:
                education = "Bachelor's Degree"
            elif "mba" in keyword:
                education = "MBA"
            break
    
    return {
        "years": years,
        "education": education
    }

def analyze_resume(resume_text: str, jd_text: str, score: float) -> dict:
    """Perform comprehensive resume analysis"""
    skills = extract_skills(resume_text, jd_text)
    experience = extract_experience(resume_text)
    
    # Generate strengths based on matched skills and score
    strengths = []
    if len(skills["matched"]) > 5:
        strengths.append("Strong technical skill alignment")
    if len(skills["matched"]) > 0:
        strengths.append(f"Proficient in {', '.join(skills['matched'][:3])}")
    if score > 75:
        strengths.append("Excellent overall match with job requirements")
    if "bachelor" in experience["education"].lower() or "master" in experience["education"].lower():
        strengths.append(f"Relevant education: {experience['education']}")
    
    # Generate weaknesses based on missing skills
    weaknesses = []
    if len(skills["missing"]) > 0:
        weaknesses.append(f"Limited experience with {', '.join(skills['missing'][:2])}")
    if score < 60:
        weaknesses.append("Overall skill match could be stronger")
    if experience["years"] == "Not specified":
        weaknesses.append("Experience level not clearly stated")
    
    # Generate recommendation
    if score >= 80:
        recommendation = "Strong Match - Highly Recommended"
    elif score >= 65:
        recommendation = "Good Fit - Recommended for Interview"
    elif score >= 50:
        recommendation = "Moderate Match - Consider for Review"
    else:
        recommendation = "Weak Match - May Not Meet Requirements"
    
    return {
        "matched_skills": skills["matched"],
        "missing_skills": skills["missing"],
        "experience_years": experience["years"],
        "education": experience["education"],
        "strengths": strengths if strengths else ["Resume submitted for review"],
        "weaknesses": weaknesses if weaknesses else ["No significant gaps identified"],
        "recommendation": recommendation
    }


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
            analysis = analyze_resume(text, jd, score)
            results.append({
                "resume": name, 
                "score": score,
                "analysis": analysis
            })
        except Exception as e:
            results.append({
                "resume": name, 
                "score": 0.0, 
                "error": str(e),
                "analysis": {
                    "matched_skills": [],
                    "missing_skills": [],
                    "experience_years": "Not specified",
                    "education": "Not specified",
                    "strengths": ["Error processing resume"],
                    "weaknesses": ["Could not analyze resume"],
                    "recommendation": "Error - Review Manually"
                }
            })

    results.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return jsonify(rankings=results, count=len(results))

@app.post("/generate-jd")
def generate_jd_route():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify(error="Missing 'prompt'"), 400
    
    jd_text = generate_jd(prompt)
    if not jd_text:
        return jsonify(error="Failed to generate JD"), 500
        
    return jsonify(markdown=jd_text)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
