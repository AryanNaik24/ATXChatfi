# Use the official Python 3.12 image from DockerHub
FROM python:3.12-slim

RUN pip install --upgrade pip

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     libpq-dev gcc \
#     --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# Install Python dependencies

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project files into the container
COPY . /app

COPY ./entrypoint.sh .
ENTRYPOINT ["sh","/app/entrypoint.sh"]

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port that Gunicorn will run on
EXPOSE 8000

# Start the Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
