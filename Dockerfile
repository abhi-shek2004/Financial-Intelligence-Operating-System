# FIOS Backend Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for building C extensions (e.g., confluent-kafka)
RUN apt-get update && apt-get install -y \
    build-essential \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the monolithic Python codebase
COPY apps/ ./apps/
COPY packages/ ./packages/

# Expose the API Gateway port
EXPOSE 8000

# Set Python path to ensure local packages can be imported
ENV PYTHONPATH=/app

# Command to run the API Gateway using uvicorn
CMD ["uvicorn", "apps.api_gateway.main:gateway_app", "--host", "0.0.0.0", "--port", "8000"]
