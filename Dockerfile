# ── CommunityLink — Production Docker Image ──────────────────
# Optimised for Google Cloud Run

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend dependencies first (layer cache optimisation)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy frontend static files
COPY frontend/ ./frontend/

# Set working directory to backend (where app.py lives)
WORKDIR /app/backend

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Run with gunicorn for production
CMD exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 4 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    app:app
