# Use Ubuntu as base image
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, npm, Python and build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Python packages
COPY src/ai/requirements.txt ./src/ai/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r src/ai/requirements.txt && \
    pip list

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p src/chroma_db

# Debug: xác nhận đang build bằng Dockerfile
RUN echo "=== BUILD BY DOCKERFILE ===" > /dockerfile_build_check.txt

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]