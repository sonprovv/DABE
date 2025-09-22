from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
from langchain.prompts import PromptTemplate

# --------- Config ---------
import os
import sys
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama

# Add the parent directory to Python path to fix imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

PERSIST_DIR = os.path.join(parent_dir, "chroma_db")
EMBED_MODEL = "mxbai-embed-large:latest"
LLM_MODEL = "llama3"

# --------- Load vector store ---------
embeddings = OllamaEmbeddings(model=EMBED_MODEL)
vs = Chroma(
    persist_directory=PERSIST_DIR,
    embedding_function=embeddings
)

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
