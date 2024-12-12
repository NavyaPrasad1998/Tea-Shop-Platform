import unittest
import sys
import os
from src.main.main import app, s , redis_conn
from src.main.model import db, User
from werkzeug.security import generate_password_hash
from flask import jsonify

class TestRegister(unittest.TestCase):
    # Setup a testing environment
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory SQLite database for testing
        app.config['TESTING'] = True
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            # Add a test user
            self.test_user = User(
                name="John Doe",
                email="john@example.com",
                password_hash=generate_password_hash("password123"),
                phone_number="1234567890",
                shipping_address="123 Main St"
            )
            db.session.add(self.test_user)
            db.session.commit()

            # Create a valid token
            self.valid_token = s.dumps(self.test_user.email, salt='reset-password')
            redis_conn.setex(f"reset_token:{self.valid_token}", 86400, "valid")


    def tearDown(self):
        # Cleanup after each test
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # Test User Registration - Successful Case
    def test_register_success(self):
        user_data = {
            "name": "John Doe",
            "email": "john1@example.com",
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

    # Test login - Successful Case
    def test_login_success(self):
        # Register a user
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "phone_number": "1234567890",
            "shipping_address": "123 Main St"
        }
        self.client.post('/register', json=user_data)

        # Login with the registered user
        login_data = {
            "email": "john@example.com",
            "password": "password123"
        }   
        response = self.client.post('/login', json=login_data)

        # Assert that the response is a 200 OK and contains the correct message
        self.assertEqual(response.status_code, 200)
        self.assertIn('Login successful', response.get_json()['message'])

    # Test login - Handling Non-Existent User
    def test_login_non_existent_user(self):
        # Attempt to login with a non-existent user
        login_data = {
            "email": "john1@example.com",
            "password": "password123"
        }
        response = self.client.post('/login', json=login_data)

        # Assert that the response is a 404 Not Found and contains the appropriate error message
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid credentials', response.get_json()['message'])

    # Test login - Handling Incorrect Password
    def test_login_incorrect_password(self):
        # Register a user
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "phone_number": "1234567890",
            "shipping_address": "123 Main St"
        }
        self.client.post('/register', json=user_data)

        # Attempt to login with the wrong password
        login_data = {
            "email": "john@example.com",
            "password": "password1234"
        }
        response = self.client.post('/login', json=login_data)

        # Assert that the response is a 400 Bad Request and contains the appropriate error message
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid credentials', response.get_json()['message'])

    def test_forgot_password_success(self):
        # Register a user
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "phone_number": "1234567890",
            "shipping_address": "123 Main St"
        }
        self.client.post('/register', json=user_data)

        # Send POST request to /forgot-password with a valid email
        response = self.client.post('/forgot-password', json={"email": "john@example.com"})
        
        # Assert that the response is 200 and contains the success message
        print(response.get_json())
        self.assertEqual(response.status_code, 200)
        self.assertIn('Password reset email sent successfully', response.get_json()['message'])


    def test_forgot_password_user_not_found(self):
        # Send POST request to /forgot-password with a non-existent email
        response = self.client.post('/forgot-password', json={"email": "nonexistent@example.com"})
        
        # Assert that the response is 404 and contains the correct error message
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])

    def test_forgot_password_missing_email(self):
        # Send POST request to /forgot-password without an email
        response = self.client.post('/forgot-password', json={})
        
        # Assert that the response is 400 Bad Request due to missing email
        self.assertEqual(response.status_code, 404)

    def test_reset_password_success(self):
        # Send POST request to /reset-password with a valid token and new password
        response = self.client.post('/reset-password', json={
            "token": self.valid_token,
            "password": "newpassword123"
        })
        
        # Assert that the response is 200 and contains the success message
        self.assertEqual(response.status_code, 200)
        self.assertIn('Password successfully reset', response.get_json()['message'])

        # Verify the password was updated
        with app.app_context():
            user = User.query.filter_by(email="john@example.com").first()
            self.assertTrue(user)
            self.assertTrue(user.password_hash != generate_password_hash("password123"))

    def test_reset_password_invalid_token(self):
        # Send POST request to /reset-password with an invalid token
        response = self.client.post('/reset-password', json={
            "token": "invalidtoken",
            "password": "newpassword123"
        })
        
        # Assert that the response is 400 and contains the error message
        self.assertEqual(response.status_code, 400)
        self.assertIn('The reset link is invalid or expired', response.get_json()['message'])

    def test_reset_password_user_not_found(self):
        # Create a valid token for a non-existent user
        fake_token = s.dumps("nonexistent@example.com", salt='reset-password')
        redis_conn.setex(f"reset_token:{fake_token}", 86400, "valid")

        # Send POST request to /reset-password
        response = self.client.post('/reset-password', json={
            "token": fake_token,
            "password": "newpassword123"
        })
        
        # Assert that the response is 404 and contains the correct error message
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])

    def test_reset_password_expired_token(self):
        # Create a valid token
        expired_token = s.dumps(self.test_user.email, salt='reset-password')

        # Simulate token expiration by deleting it from Redis
        redis_conn.delete(f"reset_token:{expired_token}")

        # Attempt to use the expired token to reset the password
        response = self.client.post('/reset-password', json={
            "token": expired_token,
            "password": "newpassword123"
        })

        # Assert that the response is 400 and contains the appropriate error message
        self.assertEqual(response.status_code, 400)
        self.assertIn('The reset link is invalid or expired', response.get_json()['message'])



if __name__ == '__main__':
    unittest.main()
