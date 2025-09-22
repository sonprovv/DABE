from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
from langchain.prompts import PromptTemplate
from langchain_community.embeddings import HuggingFaceEmbeddings

import sys
import pkg_resources
import os


# Only print debug info if running interactively (no sys.argv)
def debug_imports():
    print("\nDEBUG: Python Environment")
    print(f"Python Version: {sys.version}")
    print(f"Python Path: {sys.path}")
    print(f"Current Directory: {os.getcwd()}")
    print("\nDEBUG: Installed Packages")
    import pkg_resources
    installed_packages = [f"{dist.key} {dist.version}" for dist in pkg_resources.working_set]
    print("\n".join(installed_packages))

try:
    if len(sys.argv) == 1:
        debug_imports()
        print("\nStarting initialization...")

    # Add the parent directory to Python path to fix imports
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        if len(sys.argv) == 1:
            print(f"Added {parent_dir} to Python path")

    PERSIST_DIR = os.path.join(parent_dir, "chroma_db")
    if len(sys.argv) == 1:
        print(f"Using Chroma DB directory: {PERSIST_DIR}")

    # --------- Load embeddings and vector store ---------
    if len(sys.argv) == 1:
        print("Loading embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    if len(sys.argv) == 1:
        print("Embeddings model loaded successfully")

    if len(sys.argv) == 1:
        print("Initializing Chroma vector store...")
    vs = Chroma(
        persist_directory=PERSIST_DIR,
        embedding_function=embeddings
    )
    if len(sys.argv) == 1:
        print("Chroma vector store initialized successfully")

except Exception as e:
    if len(sys.argv) == 1:
        print(f"Error during initialization: {str(e)}", file=sys.stderr)
    raise

# --------- Prompt ép trả lời Tiếng Việt ---------
prompt_template = """
    Bạn là một trợ lý AI thông minh.
    Luôn luôn trả lời bằng TIẾNG VIỆT rõ ràng, tự nhiên, kể cả khi câu hỏi bằng ngôn ngữ khác.
    Nếu không biết hãy trả lời: "Không có thông tin", không bịa ra thông tin hoặc lấy từ bên ngoài.

    Ngữ cảnh từ tài liệu:
    {context}

    Câu hỏi: {question}

    Trả lời bằng Tiếng Việt:
"""

CUSTOM_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=prompt_template,
)


# --------- LLM ---------
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")  # Đặt giá trị mặc định là 'llama3' (mạnh hơn) nếu không có biến môi trường
llm = ChatOllama(model=LLM_MODEL)

# --------- Chat loop ---------
if len(sys.argv) == 1:
    print("Chat voi tai lieu (embedding truoc khi tra loi)\n")



import sys
import json

def answer_query(query):
    # --- 1. Embedding query ---
    query_vector = embeddings.embed_query(query)
    # --- 2. Search trong VectorDB ---
    docs = vs.similarity_search_by_vector(query_vector, k=4)
    context = "\n\n".join([d.page_content for d in docs])
    # --- 3. Gửi vào LLM ---
    prompt = CUSTOM_PROMPT.format(context=context, question=query)
    response = llm.invoke(prompt)
    sources = [
        {
            "source": d.metadata.get('source'),
            "chunk_id": d.metadata.get('chunk_id')
        } for d in docs
    ]
    return {
        "answer": response.content,
        "sources": sources
    }

if len(sys.argv) > 1:
    # Chạy từ API: nhận query từ dòng lệnh, trả về JSON
    query = " ".join(sys.argv[1:])
    result = answer_query(query)
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0)
else:
    # Chạy tương tác nhập tay
    while True:
        try:
            query = input("\nNhap cau hoi (hoac go 'exit' de thoat): ")
            if query.strip().lower() == 'exit':
                print("Da thoat.")
                break
            print("\nBan:", query)
            result = answer_query(query)
            print("\nTra loi:", result["answer"])
            print("\nNguon:")
            for s in result["sources"]:
                print(f" - {s['source']} | chunk_id={s['chunk_id']}")
            print("-" * 50)
        except KeyboardInterrupt:
            print("\nDa thoat.")
            sys.exit(0)
