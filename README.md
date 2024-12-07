# Tearoma - The Ultimate Tea Shop

Welcome to **Tearoma**, the online store dedicated to bringing you the finest selection of teas from around the world. Whether you're a tea connoisseur or a casual drinker, we have something for everyone. Our mission is to offer the best tea products, exceptional customer service, and a unique shopping experience.

## Features

- **Product Catalog**: Browse through a wide variety of teas, including loose leaves, teabags, blends, and more.
- **Personalized Recommendations**: Get product suggestions based on your preferences and past purchases.
- **Subscriptions**: Subscribe to your favorite teas and have them delivered to your doorstep regularly.
- **User Profiles**: Save your preferences, shipping address, and order history.
- **Live Chat**: Get instant support or ask our chatbot any questions related to products, recommendations, or tea brewing tips.

## Technologies Used

- **Flask**: Python web framework for the backend.
- **SQLAlchemy**: ORM for handling database operations.
- **Redis**: In-memory key-value store used for caching product information and improving performance.
- **SQLite**: Database for storing user, product, and subscription data.
- **React/HTML/CSS/JavaScript**: Frontend for creating a user-friendly interface.

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

### Setup a virtual environment (optional but recommended)
```bash
python -m venv .venv
source .venv/bin/activate  # For Windows: .venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Set Up the Database
Before running the application, you need to set up the database and create the necessary tables.
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

### Running the Application
To run the application locally, use the following command:
```bash
python main.py
```

This will start the Flask application on http://127.0.0.1:5000/

