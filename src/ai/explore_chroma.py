from chromadb import HttpClient

# Kết nối tới Chroma server (cần chạy: chroma run --path ./chroma_db)
client = HttpClient(host="localhost", port=8000)

# Liệt kê tất cả collections
collections = client.list_collections()
print("📚 Danh sách collections:")
for c in collections:
    print(f"- {c.name}")

print("\n=========================\n")

# Lấy dữ liệu trong từng collection
for c in collections:
    print(f"🔎 Collection: {c.name}")
    collection = client.get_collection(c.name)
    
    # Query tất cả documents (dùng where={}, để lấy toàn bộ)
    results = collection.get()
    
    ids = results.get("ids", [])
    docs = results.get("documents", [])
    
    if not ids:
        print("  (trống)")
    else:
        for idx, doc in zip(ids, docs):
            print(f"  ID: {idx}\n  Nội dung: {doc}\n")
    print("-------------------------")

#chroma run --path ./chroma_db --port 8000