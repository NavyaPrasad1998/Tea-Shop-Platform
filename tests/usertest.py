import unittest
from main import app, db, User
from werkzeug.security import generate_password_hash
from flask import jsonify

class TestRegister(unittest.TestCase):
    # Setup a testing environment
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory SQLite database for testing
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['TESTING'] = True
        self.client = app.test_client()

        # Create all tables in the in-memory database
        with app.app_context():
            db.create_all()

    def tearDown(self):
        # Cleanup after each test
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # Test User Registration - Successful Case
    def test_register_success(self):
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "phone_number": "1234567890",
            "shipping_address": "123 Main St"
        }
        
        # Send POST request to the /register route
        response = self.client.post('/register', json=user_data)

        # Assert that the response is a 201 Created and has the correct message
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.get_json()['message'])

        # Verify the user was added to the database
        with app.app_context():
            user = User.query.filter_by(email="john@example.com").first()
            self.assertIsNotNone(user)
            self.assertEqual(user.name, "John Doe")
            self.assertEqual(user.email, "john@example.com")

    # Test User Registration - Handling Existing Email
    def test_register_existing_email(self):
        # First user registration
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "phone_number": "1234567890",
            "shipping_address": "123 Main St"
        }
        self.client.post('/register', json=user_data)

        # Attempt to register with the same email
        duplicate_user_data = {
            "name": "Jane Doe",
            "email": "john@example.com",
            "password": "newpassword123",
            "phone_number": "0987654321",
            "shipping_address": "456 Main St"
        }
        
        response = self.client.post('/register', json=duplicate_user_data)

        # Assert that the response is a 400 Bad Request and contains the appropriate error message
        self.assertEqual(response.status_code, 400)
        self.assertIn('Email already exists', response.get_json()['message'])

if __name__ == '__main__':
    unittest.main()
