from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


VECTOR_STORE_PATH = "vector_store"


print("Loading vector database...")


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


vector_store = Chroma(
    persist_directory=VECTOR_STORE_PATH,
    embedding_function=embeddings
)


print("Vector database loaded successfully!")


while True:

    question = input("\nAsk a BIS question (or type 'exit'): ")

    if question.lower() == "exit":
        print("Goodbye!")
        break

    results = vector_store.similarity_search(
        question,
        k=3
    )

    print("\n--- RELEVANT BIS INFORMATION ---")

    if not results:
        print("No relevant information found.")
        continue

    for i, document in enumerate(results, start=1):

        print(f"\n--- RESULT {i} ---")
        print(document.page_content)
        print(f"Metadata: {document.metadata}")