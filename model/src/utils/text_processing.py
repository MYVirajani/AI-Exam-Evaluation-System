import re
import string
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def clean_text(text: str) -> str:
    """Clean and normalize input text."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text.strip()

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two strings."""
    texts = [clean_text(text1), clean_text(text2)]
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform(texts)
    sim_matrix = cosine_similarity(tfidf[0:1], tfidf[1:2])
    return float(sim_matrix[0][0])

def tokenize_sentences(text: str) -> List[str]:
    """Split text into individual sentences."""
    return re.split(r'(?<=[.!?])\s+', text.strip())

def chunk_text(text, chunk_size=1000):
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]
