import os
import uuid
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Try to import ollama for AI-powered interviews
try:
    from ollama import chat
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️ Ollama not installed. Using rule-based interview system.")

app = Flask(__name__)
CORS(app)

# In-memory storage for interview sessions
interview_sessions = {}

# Question bank organized by skill
QUESTION_BANK = {
    "react": [
        "What is the difference between state and props in React?",
        "Explain the concept of React hooks and give examples.",
        "How does the Virtual DOM work in React?",
        "What are React lifecycle methods? Name a few.",
        "Explain the useEffect hook and its use cases.",
        "What is the difference between controlled and uncontrolled components?",
        "How do you optimize performance in React applications?",
        "What is Redux and when would you use it?"
    ],
    "javascript": [
        "Explain the difference between let, const, and var.",
        "What is closure in JavaScript? Give an example.",
        "Explain promises and async/await in JavaScript.",
        "What is the event loop in JavaScript?",
        "Explain the difference between == and === operators.",
        "What are arrow functions and how do they differ from regular functions?",
        "Explain prototypal inheritance in JavaScript.",
        "What is the 'this' keyword in JavaScript?"
    ],
    "typescript": [
        "What are the benefits of using TypeScript over JavaScript?",
        "Explain interfaces and types in TypeScript.",
        "What are generics in TypeScript?",
        "How does TypeScript handle type inference?",
        "What is the difference between 'any' and 'unknown' types?",
        "Explain union and intersection types.",
        "What are decorators in TypeScript?",
        "How do you handle null and undefined in TypeScript?"
    ],
    "python": [
        "Explain the difference between lists and tuples in Python.",
        "What are decorators in Python?",
        "Explain list comprehensions with an example.",
        "What is the difference between deep copy and shallow copy?",
        "Explain Python's GIL (Global Interpreter Lock).",
        "What are generators in Python?",
        "Explain the difference between @staticmethod and @classmethod.",
        "What is the purpose of __init__ and __new__ methods?"
    ],
    "node.js": [
        "What is Node.js and how does it work?",
        "Explain the event-driven architecture of Node.js.",
        "What is the difference between synchronous and asynchronous code?",
        "Explain middleware in Express.js.",
        "What is npm and what is package.json?",
        "How do you handle errors in Node.js?",
        "Explain streams in Node.js.",
        "What is the purpose of the cluster module?"
    ],
    "sql": [
        "What is the difference between INNER JOIN and OUTER JOIN?",
        "Explain normalization and denormalization.",
        "What are indexes and why are they important?",
        "Explain the difference between DELETE, TRUNCATE, and DROP.",
        "What is a primary key and foreign key?",
        "Explain ACID properties in databases.",
        "What are stored procedures?",
        "Explain the difference between WHERE and HAVING clauses."
    ],
    "general": [
        "Tell me about a challenging project you worked on.",
        "How do you approach debugging complex issues?",
        "Describe your experience with version control systems.",
        "How do you stay updated with new technologies?",
        "Explain your approach to code reviews.",
        "How do you handle tight deadlines?",
        "Describe a time when you had to learn a new technology quickly.",
        "What's your experience with agile methodologies?"
    ]
}

def generate_ai_question(skill, previous_qa=None):
    """Generate a question using AI based on skill and conversation history"""
    if not OLLAMA_AVAILABLE:
        return get_fallback_question(skill)
    
    try:
        context = f"You are conducting a technical interview for a {skill} position."
        if previous_qa:
            context += f"\n\nPrevious conversation:\n{previous_qa}"
        
        prompt = f"{context}\n\nGenerate one concise technical interview question about {skill}. Only return the question, nothing else."
        
        response = chat(
            model="llama2",
            messages=[{"role": "user", "content": prompt}]
        )
        
        if response and "message" in response and "content" in response["message"]:
            question = response["message"]["content"].strip()
            # Remove any quotes or extra formatting
            question = question.strip('"\'')
            return question
        else:
            return get_fallback_question(skill)
    except Exception as e:
        print(f"Error generating AI question: {e}")
        return get_fallback_question(skill)

def get_fallback_question(skill):
    """Get a question from the question bank"""
    skill_lower = skill.lower()
    
    # Find matching skill in question bank
    for key in QUESTION_BANK.keys():
        if key in skill_lower or skill_lower in key:
            questions = QUESTION_BANK[key]
            return random.choice(questions)
    
    # Default to general questions if skill not found
    return random.choice(QUESTION_BANK["general"])

def evaluate_answer_ai(question, answer, skill):
    """Evaluate answer using AI"""
    if not OLLAMA_AVAILABLE:
        return evaluate_answer_fallback(answer)
    
    try:
        prompt = f"""You are evaluating a technical interview answer.
Question: {question}
Candidate's Answer: {answer}
Skill being tested: {skill}

Evaluate the answer and provide:
1. A score from 0-10
2. Brief feedback (2-3 sentences)

Format your response as:
Score: X
Feedback: Your feedback here"""

        response = chat(
            model="llama2",
            messages=[{"role": "user", "content": prompt}]
        )
        
        if response and "message" in response and "content" in response["message"]:
            content = response["message"]["content"].strip()
            
            # Parse score and feedback
            score = 5  # default
            feedback = "Answer received."
            
            lines = content.split('\n')
            for line in lines:
                if line.startswith('Score:'):
                    try:
                        score = int(line.split(':')[1].strip())
                        score = max(0, min(10, score))  # Clamp between 0-10
                    except:
                        pass
                elif line.startswith('Feedback:'):
                    feedback = line.split(':', 1)[1].strip()
            
            return {"score": score, "feedback": feedback}
        else:
            return evaluate_answer_fallback(answer)
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return evaluate_answer_fallback(answer)

def evaluate_answer_fallback(answer):
    """Simple rule-based answer evaluation"""
    answer_length = len(answer.split())
    
    if answer_length < 5:
        return {"score": 3, "feedback": "Answer is too brief. Try to provide more details."}
    elif answer_length < 20:
        return {"score": 6, "feedback": "Good attempt, but could be more comprehensive."}
    elif answer_length < 50:
        return {"score": 8, "feedback": "Well-explained answer with good detail."}
    else:
        return {"score": 9, "feedback": "Comprehensive and detailed answer."}

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Start a new interview session"""
    data = request.get_json()
    candidate_id = data.get('candidateId')
    candidate_name = data.get('candidateName', 'Candidate')
    skills = data.get('skills', [])
    num_questions = data.get('numQuestions', 5)
    
    if not candidate_id or not skills:
        return jsonify({"error": "candidateId and skills are required"}), 400
    
    # Create new session
    session_id = str(uuid.uuid4())
    
    # Generate first question
    first_skill = skills[0] if skills else "general"
    first_question = generate_ai_question(first_skill)
    
    session = {
        "id": session_id,
        "candidateId": candidate_id,
        "candidateName": candidate_name,
        "skills": skills,
        "messages": [
            {
                "id": str(uuid.uuid4()),
                "role": "interviewer",
                "content": f"Hello {candidate_name}! I'll be conducting your interview today. We'll be focusing on {', '.join(skills)}. Let's begin!",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "role": "interviewer",
                "content": first_question,
                "timestamp": datetime.now().isoformat(),
                "questionNumber": 1
            }
        ],
        "currentQuestion": 1,
        "totalQuestions": num_questions,
        "scores": [],
        "status": "active",
        "startedAt": datetime.now().isoformat()
    }
    
    interview_sessions[session_id] = session
    
    return jsonify({
        "sessionId": session_id,
        "message": session["messages"][-1],
        "progress": {
            "current": 1,
            "total": num_questions
        }
    })

@app.route('/api/interview/answer', methods=['POST'])
def submit_answer():
    """Submit an answer and get the next question"""
    data = request.get_json()
    session_id = data.get('sessionId')
    answer = data.get('answer', '').strip()
    
    if not session_id or session_id not in interview_sessions:
        return jsonify({"error": "Invalid session ID"}), 404
    
    if not answer:
        return jsonify({"error": "Answer is required"}), 400
    
    session = interview_sessions[session_id]
    
    if session["status"] != "active":
        return jsonify({"error": "Interview session is not active"}), 400
    
    # Get the last question
    last_question = None
    for msg in reversed(session["messages"]):
        if msg["role"] == "interviewer" and "questionNumber" in msg:
            last_question = msg["content"]
            break
    
    # Add candidate's answer to messages
    answer_msg = {
        "id": str(uuid.uuid4()),
        "role": "candidate",
        "content": answer,
        "timestamp": datetime.now().isoformat()
    }
    session["messages"].append(answer_msg)
    
    # Evaluate the answer
    current_skill = session["skills"][min(session["currentQuestion"] - 1, len(session["skills"]) - 1)]
    evaluation = evaluate_answer_ai(last_question, answer, current_skill)
    
    # Store evaluation
    answer_msg["evaluation"] = evaluation
    session["scores"].append(evaluation["score"])
    
    # Check if interview is complete
    if session["currentQuestion"] >= session["totalQuestions"]:
        session["status"] = "completed"
        session["completedAt"] = datetime.now().isoformat()
        
        # Calculate final score
        avg_score = sum(session["scores"]) / len(session["scores"]) if session["scores"] else 0
        final_score = round((avg_score / 10) * 100)  # Convert to percentage
        
        # Add completion message
        completion_msg = {
            "id": str(uuid.uuid4()),
            "role": "interviewer",
            "content": f"Thank you for completing the interview! Your overall score is {final_score}%. We'll review your responses and get back to you soon.",
            "timestamp": datetime.now().isoformat()
        }
        session["messages"].append(completion_msg)
        
        return jsonify({
            "message": completion_msg,
            "evaluation": evaluation,
            "completed": True,
            "finalScore": final_score
        })
    
    # Generate next question
    session["currentQuestion"] += 1
    next_skill = session["skills"][min(session["currentQuestion"] - 1, len(session["skills"]) - 1)]
    
    # Build conversation context for AI
    previous_qa = "\n".join([
        f"Q: {msg['content']}" if msg['role'] == 'interviewer' and 'questionNumber' in msg
        else f"A: {msg['content']}" if msg['role'] == 'candidate'
        else ""
        for msg in session["messages"][-6:]  # Last 3 Q&A pairs
    ])
    
    next_question = generate_ai_question(next_skill, previous_qa)
    
    question_msg = {
        "id": str(uuid.uuid4()),
        "role": "interviewer",
        "content": next_question,
        "timestamp": datetime.now().isoformat(),
        "questionNumber": session["currentQuestion"]
    }
    session["messages"].append(question_msg)
    
    return jsonify({
        "message": question_msg,
        "evaluation": evaluation,
        "completed": False,
        "progress": {
            "current": session["currentQuestion"],
            "total": session["totalQuestions"]
        }
    })

@app.route('/api/interview/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get interview session details"""
    if session_id not in interview_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = interview_sessions[session_id]
    
    # Calculate current score if available
    current_score = 0
    if session["scores"]:
        avg_score = sum(session["scores"]) / len(session["scores"])
        current_score = round((avg_score / 10) * 100)
    
    return jsonify({
        "session": session,
        "currentScore": current_score
    })

@app.route('/api/interview/end', methods=['POST'])
def end_interview():
    """End an interview session early"""
    data = request.get_json()
    session_id = data.get('sessionId')
    
    if not session_id or session_id not in interview_sessions:
        return jsonify({"error": "Invalid session ID"}), 404
    
    session = interview_sessions[session_id]
    session["status"] = "completed"
    session["completedAt"] = datetime.now().isoformat()
    
    # Calculate final score
    avg_score = sum(session["scores"]) / len(session["scores"]) if session["scores"] else 0
    final_score = round((avg_score / 10) * 100)
    
    return jsonify({
        "sessionId": session_id,
        "finalScore": final_score,
        "questionsAnswered": len(session["scores"])
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "ollama": OLLAMA_AVAILABLE})

@app.route('/api/interview/results/<session_id>', methods=['GET'])
def get_interview_results(session_id):
    """Get detailed interview results with analysis"""
    if session_id not in interview_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = interview_sessions[session_id]
    
    # Calculate overall score
    avg_score = sum(session["scores"]) / len(session["scores"]) if session["scores"] else 0
    overall_score = round((avg_score / 10) * 100)
    
    # Calculate skill-wise scores
    skill_scores = []
    questions_per_skill = len(session["scores"]) // len(session["skills"]) if session["skills"] else 1
    
    for i, skill in enumerate(session["skills"]):
        start_idx = i * questions_per_skill
        end_idx = start_idx + questions_per_skill
        skill_score_subset = session["scores"][start_idx:end_idx] if start_idx < len(session["scores"]) else session["scores"]
        
        if skill_score_subset:
            avg_skill_score = sum(skill_score_subset) / len(skill_score_subset)
            skill_scores.append({
                "skill": skill,
                "score": round(avg_skill_score, 1),
                "percentage": round((avg_skill_score / 10) * 100)
            })
    
    # Generate strengths and weaknesses
    strengths = []
    weaknesses = []
    
    if overall_score >= 80:
        strengths.append("Excellent overall performance")
    if overall_score >= 70:
        strengths.append("Strong technical knowledge")
    
    high_skill_scores = [s for s in skill_scores if s["score"] >= 8]
    if high_skill_scores:
        strengths.append(f"Proficient in {', '.join([s['skill'] for s in high_skill_scores[:2]])}")
    
    if overall_score < 70:
        weaknesses.append("Could improve overall technical depth")
    
    low_skill_scores = [s for s in skill_scores if s["score"] < 6]
    if low_skill_scores:
        weaknesses.append(f"Needs improvement in {', '.join([s['skill'] for s in low_skill_scores[:2]])}")
    
    # Generate recommendation
    if overall_score >= 80:
        recommendation = "Highly Recommended - Strong Candidate"
    elif overall_score >= 65:
        recommendation = "Recommended - Good Fit"
    elif overall_score >= 50:
        recommendation = "Consider for Review - Moderate Fit"
    else:
        recommendation = "Not Recommended - Weak Performance"
    
    # Build transcript
    transcript = []
    question_num = 1
    for msg in session["messages"]:
        if msg["role"] == "interviewer" and "questionNumber" in msg:
            question = msg["content"]
            # Find corresponding answer
            answer_msg = None
            eval_data = None
            for next_msg in session["messages"][session["messages"].index(msg)+1:]:
                if next_msg["role"] == "candidate":
                    answer_msg = next_msg
                    eval_data = next_msg.get("evaluation")
                    break
            
            if answer_msg:
                transcript.append({
                    "question": question,
                    "answer": answer_msg["content"],
                    "score": eval_data["score"] if eval_data else 0,
                    "feedback": eval_data["feedback"] if eval_data else ""
                })
    
    # Calculate duration
    start_time = datetime.fromisoformat(session["startedAt"])
    end_time = datetime.fromisoformat(session.get("completedAt", datetime.now().isoformat()))
    duration_minutes = round((end_time - start_time).total_seconds() / 60)
    
    return jsonify({
        "sessionId": session_id,
        "candidateId": session["candidateId"],
        "candidateName": session["candidateName"],
        "skills": session["skills"],
        "overallScore": overall_score,
        "totalQuestions": session["totalQuestions"],
        "questionsAnswered": len(session["scores"]),
        "skillScores": skill_scores,
        "strengths": strengths if strengths else ["Completed interview"],
        "weaknesses": weaknesses if weaknesses else ["No significant gaps identified"],
        "recommendation": recommendation,
        "completedAt": session.get("completedAt", datetime.now().isoformat()),
        "duration": f"{duration_minutes} minutes",
        "transcript": transcript
    })

@app.route('/api/interview/all-results', methods=['GET'])
def get_all_results():
    """Get all completed interview results"""
    completed_sessions = [
        session for session in interview_sessions.values()
        if session["status"] == "completed"
    ]
    
    results = []
    for session in completed_sessions:
        avg_score = sum(session["scores"]) / len(session["scores"]) if session["scores"] else 0
        overall_score = round((avg_score / 10) * 100)
        
        results.append({
            "sessionId": session["id"],
            "candidateId": session["candidateId"],
            "candidateName": session["candidateName"],
            "overallScore": overall_score,
            "questionsAnswered": len(session["scores"]),
            "totalQuestions": session["totalQuestions"],
            "completedAt": session.get("completedAt", "")
        })
    
    return jsonify({"results": results, "count": len(results)})

if __name__ == '__main__':
    print("🎤 Interview Agent API starting...")
    print(f"AI Mode: {'Ollama/LLaMA2' if OLLAMA_AVAILABLE else 'Rule-based'}")
    app.run(debug=True, port=5000)
