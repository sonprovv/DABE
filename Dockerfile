# Use an official Python runtime as a parent image
FROM python:3.9.18-alpine3.18

# Install Node.js and npm
RUN apk add --no-cache \
    nodejs \
    npm \
    gcc \
    g++ \
    make \
    python3-dev \
    musl-dev \
    linux-headers

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements and install
COPY src/ai/requirements.txt ./src/ai/
RUN cd src/ai && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p src/chroma_db

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]