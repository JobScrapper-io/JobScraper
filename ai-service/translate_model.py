import pandas as pd
import sqlite3
from transformers import pipeline, AutoTokenizer
import time
import sys
import torch
import math

DB_FILE = "../app/db/jobs.db"
NAZWA_TABELI = "job_offers"
DESC_EN = "description_en"  
DESC = "description"       
ID = "id"                   

MODEL_NAME = "Helsinki-NLP/opus-mt-pl-en"
MAX_LEN_MODELU = 512

try:
    translator = pipeline("translation", model=MODEL_NAME, device=0)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    print(f"Model tłumaczący '{MODEL_NAME}' i Tokenizer załadowane.")
except Exception as e:
    print(f"Błąd ładowania modelu tłumaczącego: {e}")
    sys.exit()


def translate_long_text(long_text: str) -> str:
    if pd.isna(long_text) or long_text is None or str(long_text).strip() == "":
        return ""

    input_ids = tokenizer.encode(
        long_text, 
        return_tensors="pt", 
        truncation=False, 
        add_special_tokens=True
    )[0]
    
    CHUNK_SIZE = math.floor(MAX_LEN_MODELU * 0.89)
    OVERLAP = 50 
    
    chunks = []

    for i in range(0, input_ids.size(0), CHUNK_SIZE - OVERLAP):
        chunks.append(input_ids[i:i + CHUNK_SIZE])
    
    if not chunks:
        return "" 

    text_chunks = [tokenizer.decode(c, skip_special_tokens=True) for c in chunks]
    
    translated_chunks_output = translator(
        text_chunks, 
        max_length=MAX_LEN_MODELU, 
        truncation=True
    )
    
    translated_texts = [item['translation_text'] for item in translated_chunks_output]
    
    return "\n\n".join(translated_texts)


try:
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT {ID}, {DESC} FROM {NAZWA_TABELI};")
        rekordy = cursor.fetchall()

        if rekordy:
            dt = pd.DataFrame([dict(r) for r in rekordy])
            print(f"Pobrano {len(dt)} rekordów z kolumnami '{ID}' i '{DESC}'.")
        else:
            print("Brak rekordów do pobrania. Anulowanie operacji.")
            sys.exit()

except sqlite3.Error as e:
    print(f"Wystąpił błąd SQLite podczas pobierania danych: {e}")
    sys.exit()

start_time = time.time()
print(f"\nRozpoczynanie tłumaczenia z chunkingiem dla {len(dt)} opisów...")

dt[DESC_EN] = dt[DESC].apply(translate_long_text)

end_time = time.time()
print(f"Tłumaczenie z chunkingiem zakończone w czasie: {end_time - start_time:.2f} sekundy.")

print(f"\n--- Aktualizacja bazy danych ({NAZWA_TABELI}) ---")
try:
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()

        try:
            cursor.execute(f"ALTER TABLE {NAZWA_TABELI} DROP COLUMN {DESC_EN};")
            print(f"Usunięto starą kolumnę '{DESC_EN}'.")
        except sqlite3.OperationalError:
            print(f"Kolumna '{DESC_EN}' nie istnieje lub nie można jej usunąć.")
            pass 

        try:
             cursor.execute(f"ALTER TABLE {NAZWA_TABELI} ADD COLUMN {DESC_EN} TEXT;")
             print(f"Pomyślnie dodano nową kolumnę '{DESC_EN}' (Typ TEXT).")
        except sqlite3.OperationalError:
            print(f"Uwaga: Kolumna '{DESC_EN}' istniała i zostanie nadpisana.")
            pass 

        for index, row in dt.iterrows():
            record_id = row[ID]
            translated_text = str(row[DESC_EN]).strip() 

            cursor.execute(
                f"UPDATE {NAZWA_TABELI} SET {DESC_EN} = ? WHERE {ID} = ?",
                (translated_text, record_id)
            )

        conn.commit()
        print(f"Pomyślnie zaktualizowano {len(dt)} rekordów w bazie danych.")

except sqlite3.Error as e:
    print(f"Wystąpił błąd podczas zapisu do SQLite: {e}")

print("Zakończono proces tłumaczenia z chunkingiem i zapisu do TEXT. ---")