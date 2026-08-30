import os
import pandas as pd

from langchain_core.documents import Document
from langchain_ollama import OllamaLLM
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(BASE_DIR, "bis_products.csv")
VECTOR_STORE_PATH = os.path.join(BASE_DIR, "vector_store")


def load_bis_data():
    documents = []

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(
            f"Could not find BIS CSV file:\n{CSV_PATH}"
        )

    df = pd.read_csv(CSV_PATH)

    for _, row in df.iterrows():
        content = f"""
Product Category: {row.get('Product Category', '')}
Product Name: {row.get('Product Name', '')}
BIS Standard Number: {row.get('BIS Standard Number', '')}
Standard Title: {row.get('Standard Title', '')}
Key Requirements: {row.get('Key Requirements', '')}
Testing Requirements: {row.get('Testing Requirements', '')}
Certification Information: {row.get('Certification Information', '')}
Source: {row.get('Source', '')}
"""

        metadata = {
            "product": str(row.get("Product Name", "")),
            "source": "bis_products.csv",
            "standard": str(row.get("BIS Standard Number", ""))
        }

        documents.append(
            Document(
                page_content=content.strip(),
                metadata=metadata
            )
        )

    return documents


def create_vector_store(documents):
    print("Creating embeddings...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Creating vector store...")

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=VECTOR_STORE_PATH
    )

    print("Vector store created successfully!")

    return vector_store


def ask_question(vector_store, question):
    results = vector_store.similarity_search(
        question,
        k=3
    )

    context = "\n\n".join(
        [
            f"--- RESULT {i + 1} ---\n{doc.page_content}"
            for i, doc in enumerate(results)
        ]
    )

    prompt = f"""
You are a BIS (Bureau of Indian Standards) assistant.

Answer the user's question using ONLY the information
provided in the context below.

If the answer is not present in the context, say:
"I could not find this information in the BIS knowledge base."

Do not invent BIS standards, requirements, testing procedures,
or certification information.

Context:
{context}

User Question:
{question}

Answer:
"""

    llm = OllamaLLM(model="llama3.2")

    answer = llm.invoke(prompt)

    print("\n--- BIS RAG ANSWER ---")
    print(answer)

    print("\n--- SOURCES USED ---")

    for i, doc in enumerate(results, start=1):
        print(
            f"{i}. "
            f"{doc.metadata.get('product', 'Unknown')} | "
            f"{doc.metadata.get('standard', 'Unknown')}"
        )


if __name__ == "__main__":

    print("Starting BIS-RAG...")

    documents = load_bis_data()

    print(f"Loaded {len(documents)} BIS documents.")

    vector_store = create_vector_store(documents)

    print("\nBIS RAG SYSTEM READY!")

    while True:

        question = input(
            "\nAsk a BIS question (or type 'exit'): "
        )

        if question.lower().strip() == "exit":
            print("Exiting BIS-RAG. Goodbye!")
            break

        if not question.strip():
            continue

        ask_question(vector_store, question)