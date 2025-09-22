FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Install LocalAI
RUN mkdir -p /usr/local/bin/localai
WORKDIR /usr/local/bin/localai
RUN curl -L -o localai.tar.gz https://github.com/go-skynet/LocalAI/releases/download/v1.41.0/local-ai-Linux-x86_64.tar.gz \
    && tar xvf localai.tar.gz \
    && rm localai.tar.gz

# Copy application files
WORKDIR /app
COPY . .

# Install dependencies
RUN npm install
RUN pip3 install -r src/ai/requirements.txt

# Download models
RUN mkdir -p models
RUN curl -L -o models/ggml-all-MiniLM-L6-v2.bin https://huggingface.co/TheBloke/ggml-all-MiniLM-L6-v2/resolve/main/ggml-model-q4_0.bin
RUN curl -L -o models/llama-2-7b-chat.Q4_K_M.gguf https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf

# Copy LocalAI configuration
COPY localai.yaml /usr/local/bin/localai/models.yaml

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000 8080

CMD ["/start.sh"]