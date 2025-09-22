FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements first (for better caching)
COPY src/ai/requirements.txt ./src/ai/

# Install Python dependencies
RUN cd src/ai && pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make sure the chroma_db directory exists
RUN mkdir -p src/chroma_db

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]