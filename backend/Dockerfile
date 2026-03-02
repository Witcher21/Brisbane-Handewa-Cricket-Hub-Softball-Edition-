# ── Brisbane Handewa Cricket Hub — FastAPI Backend ──────────────────
# Optimized for Google Cloud Run

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (layer caching)
COPY requirements.txt .

# Install Python dependencies (no psycopg2 needed if using Firestore)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Cloud Run uses PORT env variable (default 8080)
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# Start with uvicorn — Cloud Run requires 0.0.0.0 on $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1 --ws-ping-interval 20 --ws-ping-timeout 20"]
