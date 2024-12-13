# Tearoma - The Ultimate Tea Shop

Welcome to **Tearoma**, the online store dedicated to bringing you the finest selection of teas from around the world. Whether you're a tea connoisseur or a casual drinker, we have something for everyone. Our mission is to offer the best tea products, exceptional customer service, and a unique shopping experience.

---

## Features

- **Product Catalog**: Browse through a wide variety of teas, including loose leaves, teabags, blends, and more.
- **Personalized Recommendations**: Get product suggestions based on your preferences and past purchases.
- **Subscriptions**: Subscribe to your favorite teas and have them delivered to your doorstep regularly.
- **User Profiles**: Save your preferences, shipping address, and order history.
- **Live Chat**: Get instant support or ask our chatbot any questions related to products, recommendations, or tea brewing tips.

---

## Technologies Used

### **Backend**
- **Flask**: A lightweight Python web framework for handling backend logic and APIs.
- **SQLAlchemy**: ORM for managing database interactions with ease.
- **Redis**: In-memory key-value store used for caching product information, improving application performance.
- **Cloud SQL (PostgreSQL)**: A fully managed relational database service provided by Google Cloud Platform for reliable and scalable data storage.

### **Frontend**
- **React**: A JavaScript library for building an interactive and user-friendly interface.
- **HTML/CSS/JavaScript**: Additional tools for enhancing frontend design and interactivity.

### **Infrastructure**
- **Google Cloud Platform (GCP)**:
  - **Cloud SQL**: Managed PostgreSQL for scalable and secure database operations.
  - **Memorystore (Redis)**: Managed Redis service for high-performance caching.
  - **Google Kubernetes Engine (GKE)**: Orchestrates containerized applications for reliable and scalable deployment.

---

## Installation

### Prerequisites

Before getting started, ensure you have the following installed:

- Python 3.x
- Redis (running locally or remotely)
- Virtual Environment (optional, but recommended)

### Clone the Repository

```bash
git clone https://github.com/yourusername/tearoma.git
cd tearoma
```

### Set Up a Virtual Environment (Optional)
```bash
python -m venv .venv
source .venv/bin/activate  # For Windows: .venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Set Up the Database
Before running the application, you need to set up the database and create the necessary tables:
```bash
python
>>> from main import db
>>> db.create_all()
```

### Start Redis Server
Ensure you have Redis installed and running locally on your machine:
```bash
redis-server
```

### Running the Flask Application
To run the application locally, use the following command:
```bash
python main.py
```
This will start the Flask application on http://127.0.0.1:5000/

### Running the React Application

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:
```bash
npm install
```
Run this first to get Node Modules.

```bash
npm start
```
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Testing Unit Tests

```bash
python -m backend.tests.usertest
```
---

## Dockerization

#### Build Docker Image
```bash
docker build -t gcr.io/datacenter-project-444513/tearoma-backend .
```

#### Push Docker Image
```bash
docker push gcr.io/datacenter-project-444513/tearoma-backend
```

#### Set Up a GKE Cluster
```bash
gcloud container clusters create flask-cluster \
    --num-nodes=3 \
    --zone=us-central1-a
```

#### Connect to the Cluster
```bash
gcloud container clusters get-credentials flask-cluster --zone=us-central1-a
```

---

## Google Cloud Integration

### **Cloud SQL (PostgreSQL)**
Tearoma uses **Google Cloud SQL** for managing its relational data such as user profiles, product details, and order history. Cloud SQL offers high performance, automatic backups, and seamless scalability.

- **Setup**:
  - Database URI: `postgresql://admin:admin%40123@10.64.96.3:5432/tearoma`
  - Fully managed database with minimal maintenance.

### **Memorystore (Redis)**
For caching frequently accessed data like product information and user sessions, Tearoma leverages **Google Memorystore**. This managed Redis service ensures low latency and high throughput.

- **Setup**:
  - Redis URL: `redis://10.64.97.3:6379/0`
  - Ideal for caching to enhance performance and reduce database load.

---

## Kubernetes Deployment

### Create Kubernetes Secrets for Credentials/Config
```bash
kubectl create secret generic backend-secrets \
    --from-literal=DATABASE_URI='<YOUR_DATABASE_URI>' \
    --from-literal=REDIS_URL='<YOUR_REDIS_URL>' \
    --from-literal=MAIL_USERNAME='<YOUR_MAIL_USERNAME>' \
    --from-literal=MAIL_PASSWORD='<YOUR_MAIL_PASSWORD>' \
    --from-literal=SECRET_KEY='<YOUR_SECRET_KEY>'
```

### Apply Deployment and Service YAML Files
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Check the Service
```bash
kubectl get service <service-name>
kubectl get pods
```

### Updating the Image if Rebuilt
```bash
kubectl set image deployment/tearoma-backend tearoma-backend=gcr.io/datacenter-project-444513/tearoma-backend:latest
```

### Get External IP of the Service
```bash
kubectl get service tearoma-backend-service
```

---

## Troubleshooting

### If Pods Are Not Updating:
```bash
kubectl delete pods <pod-name>
kubectl delete pods -l app=tearoma-backend
```

---

## Conclusion
Tearoma leverages cutting-edge technologies and services provided by Google Cloud Platform to deliver a seamless and enjoyable tea shopping experience. With managed services like Cloud SQL and Memorystore, Tearoma ensures high availability, scalability, and performance for its users.

