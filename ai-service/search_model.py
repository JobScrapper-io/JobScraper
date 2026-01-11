import pandas as pd
import sqlite3
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

DB_FILE = "../app/db/jobs.db"
NAZWA_TABELI = "job_offers"
EMBEDDING = "embedding"
ID = "id" 

try:
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(f"SELECT * FROM {NAZWA_TABELI};")
        rekordy = cursor.fetchall()

        if rekordy:
            rekordy = [dict(r) for r in rekordy]
            dt = pd.DataFrame(rekordy)
            print(f"Pobrano {len(dt)} rekordów.")
        else:
            print("Brak rekordów do pobrania.")
            dt = pd.DataFrame()
            exit()

except sqlite3.Error as e:
    print(f"Wystąpił błąd SQLite: {e}")
    dt = pd.DataFrame()
    exit()

dt['combined_text'] = dt['title'].str.cat(dt['skills'], sep=' | ', na_rep='')
print(f"Generowanie embeddingów dla {len(dt)} tekstów...")

embeddings = model.encode(dt['combined_text'].tolist(), convert_to_tensor=False)
dt['embeddings'] = [vec.tobytes() for vec in embeddings]
print("Generowanie i konwersja na BLOB zakończona.")

print(f"\n--- Aktualizacja bazy danych ({NAZWA_TABELI}) ---")
try:
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(f"ALTER TABLE {NAZWA_TABELI} DROP COLUMN {EMBEDDING};")
            print(f"Usunięto starą kolumnę '{EMBEDDING}'.")
        except sqlite3.OperationalError:
            print(f"Kolumna '{EMBEDDING}' nie istnieje lub nie można jej usunąć. Kontynuuję dodawanie.")
            pass 
        try:
             cursor.execute(f"ALTER TABLE {NAZWA_TABELI} ADD COLUMN {EMBEDDING} BLOB;")
             print(f"Pomyślnie dodano nową kolumnę '{EMBEDDING}'.")
        except sqlite3.OperationalError as e:
            print(f"Uwaga: Kolumna '{EMBEDDING}' istniała i zostanie nadpisana.")
            pass 

        for index, row in dt.iterrows():
            record_id = row[ID]
            
            embedding_bytes = row['embeddings']

            cursor.execute(
                f"UPDATE {NAZWA_TABELI} SET {EMBEDDING} = ? WHERE {ID} = ?",
                (embedding_bytes, record_id)
            )

        conn.commit()
        print(f"Pomyślnie zaktualizowano {len(dt)} rekordów w bazie danych nowymi embeddingami.")

except sqlite3.Error as e:
    print(f"Wystąpił błąd podczas zapisu do SQLite: {e}")