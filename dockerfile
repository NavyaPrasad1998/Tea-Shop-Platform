# Use a Python base image
FROM python:3.12

# Set the working directory inside the container
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the container
COPY src/ /app/

# Expose the port Flask will run on
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "main/main.py"]
