import os

# Try to import ollama, but don't fail if it's not available
try:
    from ollama import chat
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️ Ollama not installed. Using fallback JD generation.")

# Optional: Disable TensorFlow oneDNN warnings (if you see them often)
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

def generate_fallback_jd(prompt):
    """
    Generates a fallback job description when Ollama is not available.
    """
    # Extract role from prompt if possible
    role = "Software Engineer"
    if "role:" in prompt.lower():
        parts = prompt.split("role:")
        if len(parts) > 1:
            role = parts[1].split("\n")[0].strip().rstrip(".")
    elif len(prompt) < 200:  # If prompt is short, it might be just the role
        role = prompt.strip()
    
    return f"""# {role}

## About the Role
We are seeking a talented {role} to join our growing team. This is an exciting opportunity to work on cutting-edge projects and make a significant impact.

## Key Responsibilities
- Design, develop, and maintain high-quality software solutions
- Collaborate with cross-functional teams to deliver exceptional products
- Participate in code reviews and contribute to technical discussions
- Mentor junior team members and share knowledge
- Stay updated with the latest industry trends and technologies

## Requirements
- Strong technical skills relevant to the role
- Excellent problem-solving and analytical abilities
- Effective communication and teamwork skills
- Bachelor's degree in Computer Science or related field (or equivalent experience)
- {prompt.strip() if len(prompt) < 200 else "Experience with modern development tools and practices"}

## Nice to Have
- Experience with cloud platforms (AWS, Azure, GCP)
- Contributions to open-source projects
- Strong understanding of software design patterns
- Agile/Scrum experience

## What We Offer
- Competitive salary and benefits package
- Flexible work arrangements (remote/hybrid options)
- Professional development opportunities
- Collaborative and innovative work environment
- Health insurance and wellness programs

**Note:** This is a template job description. For AI-generated descriptions, please install Ollama with the llama2 model.
"""

def generate_jd(prompt):
    """
    Generates a Job Description using the local Ollama LLaMA2 model.
    Falls back to template generation if Ollama is not available.
    """
    # Try Ollama first if available
    if OLLAMA_AVAILABLE:
        try:
            # Send the prompt to LLaMA2 model via Ollama
            response = chat(
                model="llama2",
                messages=[{"role": "user", "content": prompt}]
            )

            # Extract the text content safely
            if response and "message" in response and "content" in response["message"]:
                return response["message"]["content"].strip()
            else:
                print("⚠️ No valid response received from the model.")
                return generate_fallback_jd(prompt)

        except Exception as e:
            error_msg = str(e)
            print(f"❌ Error while generating JD with Ollama: {error_msg}")
            
            # If it's a model not found error, use fallback
            if "404" in error_msg or "not found" in error_msg.lower():
                print("⚠️ Ollama model not found. Using fallback generation.")
                return generate_fallback_jd(prompt)
            
            return None
    else:
        # Ollama not installed, use fallback
        return generate_fallback_jd(prompt)


if __name__ == "__main__":
    print("=== AI Job Description Generator (LLaMA2 + Ollama) ===")
    print("Make sure you have 'llama2' model pulled in Ollama before running.\n")
    print("👉 To install: run  ollama pull llama2\n")

    # Step 1: Take input
    role = input("Enter role title (e.g. Data Scientist at Fintech Startup): ").strip()

    # Step 2: Build the prompt
    prompt = f"""
    Generate a detailed, professional job description for the role: {role}.
    The JD should include:
    - Company overview (Fintech domain, innovative tone)
    - Role responsibilities
    - Key requirements (skills, tools, qualifications)
    - Desired experience level
    - Any additional nice-to-have attributes
    Make it formatted and clear.
    """

    # Step 3: Generate JD
    jd_text = generate_jd(prompt)

    # Step 4: Display result
    print("\n--- Generated Job Description ---\n")
    if jd_text:
        print(jd_text)
    else:
        print("⚠️ The model returned no output. Check if LLaMA2 is installed correctly.")

