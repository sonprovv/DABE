# Build stage for Python dependencies
FROM python:3.9-slim as python-builder

WORKDIR /app/python
COPY src/ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM node:18-slim

# Install Python and copy built dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Python dependencies from builder
COPY --from=python-builder /usr/local/lib/python3.9/site-packages /opt/venv/lib/python3.9/site-packages

WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p src/chroma_db

# Set environment variables
ENV PYTHONPATH=/opt/venv/lib/python3.9/site-packages
ENV PATH="/opt/venv/bin:$PATH"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]