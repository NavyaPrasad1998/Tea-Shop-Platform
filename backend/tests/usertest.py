import unittest
from flask import jsonify
from werkzeug.security import generate_password_hash
from itsdangerous import URLSafeTimedSerializer
from backend.main.app import app, redis_conn, db, User, mail
from flask_mail import Message


class TestUserManagement(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory SQLite database
        app.config['TESTING'] = True
        app.config['MAIL_USERNAME'] = 'test@example.com'
        self.client = app.test_client()

        with app.app_context():
            # Drop all tables and recreate them to ensure a clean state
            db.drop_all()
            db.create_all()

            # Create a default user
            self.default_user = User(
                name="Default User",
                email="default@example.com",
                password_hash=generate_password_hash("password123"),
                phone_number="1234567890",
                shipping_address="123 Main St"
            )
            db.session.add(self.default_user)
            db.session.commit()

            # Create a valid reset token
            self.serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
            self.valid_token = self.serializer.dumps(self.default_user.email, salt='reset-password')
            redis_conn.setex(f"reset_token:{self.valid_token}", 86400, "valid")


    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
        redis_conn.flushdb()

    def test_register_success(self):
        data = {
            "name": "New User",
            "email": "newuser@example.com",
            "password": "password123",
            "phone_number": "9876543210",
            "shipping_address": "456 Another St"
        }
        response = self.client.post('/register', json=data)
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.get_json()['message'])

        with app.app_context():
            new_user = User.query.filter_by(email="newuser@example.com").first()
            self.assertIsNotNone(new_user)

    def test_register_existing_email(self):
        data = {
            "name": "Duplicate User",
            "email": "default@example.com",  # Existing user email
            "password": "password123",
            "phone_number": "9876543210",
            "shipping_address": "456 Another St"
        }
        response = self.client.post('/register', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Email already exists', response.get_json()['message'])

    def test_login_success(self):
        data = {
            "email": "default@example.com",
            "password": "password123"
        }
        response = self.client.post('/login', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('Login successful', response.get_json()['message'])

    def test_login_invalid_credentials(self):
        data = {
            "email": "default@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post('/login', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid credentials', response.get_json()['message'])

    def test_login_nonexistent_user(self):
        data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = self.client.post('/login', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid credentials', response.get_json()['message'])

    from unittest.mock import patch

    @patch('backend.main.app.mail.send')
    def test_forgot_password_success(self, mock_mail_send):
        mock_mail_send.return_value = None  # Mock successful email send

        response = self.client.post('/forgot-password', json={
            'email': self.default_user.email
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Password reset email sent successfully', response.data)


    def test_forgot_password_user_not_found(self):
        data = {"email": "nonexistent@example.com"}
        response = self.client.post('/forgot-password', json=data)
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])

    def test_reset_password_success(self):
        data = {
            "token": self.valid_token,
            "password": "newpassword123"
        }
        response = self.client.post('/reset-password', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('Password successfully reset', response.get_json()['message'])

        with app.app_context():
            user = User.query.filter_by(email="default@example.com").first()
            self.assertTrue(user)
            self.assertTrue(user.password_hash != generate_password_hash("password123"))

    def test_reset_password_invalid_token(self):
        data = {
            "token": "invalidtoken",
            "password": "newpassword123"
        }
        response = self.client.post('/reset-password', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('The reset link is invalid or expired', response.get_json()['message'])

    def test_reset_password_user_not_found(self):
        # Create a token for a non-existent user
        fake_token = self.serializer.dumps("nonexistent@example.com", salt='reset-password')
        redis_conn.setex(f"reset_token:{fake_token}", 86400, "valid")

        data = {
            "token": fake_token,
            "password": "newpassword123"
        }
        response = self.client.post('/reset-password', json=data)
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])

    def test_reset_password_expired_token(self):
        redis_conn.delete(f"reset_token:{self.valid_token}")  # Simulate token expiration
        data = {
            "token": self.valid_token,
            "password": "newpassword123"
        }
        response = self.client.post('/reset-password', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('The reset link is invalid or expired', response.get_json()['message'])


if __name__ == '__main__':
    unittest.main()
