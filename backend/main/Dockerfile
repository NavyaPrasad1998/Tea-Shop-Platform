# Base Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask app's port
EXPOSE 5000

# Define environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application
CMD ["flask", "run"]

# Apply migrations and start Flask
#CMD ["sh", "-c", "flask db upgrade && flask run --host=0.0.0.0 --port=5000"]

# Use the entrypoint script
#ENTRYPOINT ["/app/entrypoint.sh"]
