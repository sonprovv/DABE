from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
from langchain.prompts import PromptTemplate

import os
import sys
import json
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFacePipeline
from langchain.prompts import PromptTemplate

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
    debug_imports()
    print("\nStarting initialization...")

    # Add the parent directory to Python path to fix imports
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
        print(f"Added {parent_dir} to Python path")

    PERSIST_DIR = os.path.join(parent_dir, "chroma_db")
    print(f"Using Chroma DB directory: {PERSIST_DIR}")

    # --------- Load embeddings and vector store ---------
    print("Loading embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    print("Embeddings model loaded successfully")

    print("Initializing Chroma vector store...")
    vs = Chroma(
        persist_directory=PERSIST_DIR,
        embedding_function=embeddings
    )
    print("Chroma vector store initialized successfully")

except Exception as e:
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
llm = ChatOllama(model=LLM_MODEL)

# --------- Chat loop ---------
print("💬 Chat với tài liệu (embedding trước khi trả lời)\n")

queries = [
    "Ứng dụng có những danh mục nào?",
    "Dọn dẹp vệ sinh bao gồm những dịch vụ nào?",
    "Chăm sóc sức khỏe bao gồm những dịch vụ nào?",
    "Dịch vụ dọn dẹp Phòng khách bao gồm những công việc gì?",
    "Dịch vụ chăm sóc người khuyết tật phải làm những gì?",
    "Dịch vụ chăm sóc người lớn tuổi không làm những gì?"
]

for query in queries:
    print("\nBạn:", query)

    # --- 1. Embedding query ---
    query_vector = embeddings.embed_query(query)

    # --- 2. Search trong VectorDB ---
    docs = vs.similarity_search_by_vector(query_vector, k=4)
    context = "\n\n".join([d.page_content for d in docs])

    # --- 3. Gửi vào LLM ---
    prompt = CUSTOM_PROMPT.format(context=context, question=query)
    response = llm.invoke(prompt)

    print("\n🤖 Trả lời:", response.content)
    print("\n📚 Nguồn:")
    for d in docs:
        print(f" - {d.metadata.get('source')} | chunk_id={d.metadata.get('chunk_id')}")
    print("-" * 50)
