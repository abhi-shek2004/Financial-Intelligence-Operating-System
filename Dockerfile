# FIOS Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for confluent-kafka C extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (layer cached separately from code)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY apps/ ./apps/
COPY packages/ ./packages/

EXPOSE 8000

ENV PYTHONPATH=/app

# Use the direct script invocation (folder name has a hyphen, not valid Python module)
CMD ["python", "apps/api-gateway/main.py"]
