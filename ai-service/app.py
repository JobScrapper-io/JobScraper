from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
from typing import List
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://app:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

embed_model = SentenceTransformer("all-MiniLM-L6-v2")

translator = pipeline("translation", model="Helsinki-NLP/opus-mt-pl-en")

tokenizer = AutoTokenizer.from_pretrained("gsarti/opus-mt-tc-en-pl")
model = AutoModelForSeq2SeqLM.from_pretrained("gsarti/opus-mt-tc-en-pl")

def translate(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    translated = model.generate(**tokens)
    return tokenizer.decode(translated[0], skip_special_tokens=True)

class TextPayload(BaseModel):
    text: str

class SimilarityPayload(BaseModel):
    a: List[float]
    b: List[float]

@app.post("/embed")
def embed_text(payload: TextPayload):
    embedding = embed_model.encode(payload.text).tolist()
    return {"embedding": embedding}

@app.post("/similarity")
def cosine_similarity_endpoint(payload: SimilarityPayload):
    sim = util.cos_sim(payload.a, payload.b).item()
    return {"similarity": sim}

@app.post("/translate_pl_en")
def translate_text(payload: TextPayload):
    result = translator(payload.text)[0]["translation_text"]
    return {"translated": result}

@app.post("/translate_en_pl")
def translate_text_pl(payload: TextPayload):
    result = translate(payload.text)
    return {"translated": result}