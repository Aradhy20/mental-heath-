# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV and Audio processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY backend/requirements.txt .
COPY backend/requirements_all.txt .
COPY backend/shared/requirements.txt ./backend/shared/

# Install dependencies (incorporating all requirement files)
# Using --no-cache-dir to minimize image size
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements_all.txt

# Copy backend source code
COPY backend ./backend

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
