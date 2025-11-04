import os
from ollama import chat

# Optional: Disable TensorFlow oneDNN warnings (if you see them often)
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

def generate_jd(prompt):
    """
    Generates a Job Description using the local Ollama LLaMA2 model.
    """
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
            return None

    except Exception as e:
        print(f"❌ Error while generating JD: {e}")
        return None


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

