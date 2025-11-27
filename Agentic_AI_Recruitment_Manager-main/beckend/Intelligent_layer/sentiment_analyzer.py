from transformers import pipeline

# Load pretrained sentiment model (from Hugging Face)
# This one is lightweight and accurate for general English text.
analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")

def analyze_sentiment(text):
    """Analyze the sentiment of a given text and return label + score."""
    if not text.strip():
        return {"label": "Empty Text", "score": 0.0}

    result = analyzer(text)[0]
    return {"label": result['label'], "score": round(result['score'], 3)}

if __name__ == "__main__":
    print("Enter interview feedback or transcript snippet:")
    user_input = input("> ")

    result = analyze_sentiment(user_input)
    print("\n--- Sentiment Analysis Result ---")
    print(f"Sentiment: {result['label']} (confidence: {result['score']})")
