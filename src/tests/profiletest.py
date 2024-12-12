import unittest
from src.main.main import app, db, redis_conn
from src.main.model import User
from werkzeug.security import generate_password_hash
import json


class TestUserProfile(unittest.TestCase):
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

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
            redis_conn.flushdb()  # Clear Redis cache

    def test_get_profile_success(self):
        # Send GET request to /profile
        response = self.client.get('/profile', json={"email": "john@example.com"})

        # Assert the response is 200 OK and the profile data matches the user
        self.assertEqual(response.status_code, 200)
        response_data = response.get_json()
        self.assertEqual(response_data['name'], "John Doe")
        self.assertEqual(response_data['email'], "john@example.com")
        self.assertEqual(response_data['phone_number'], "1234567890")
        self.assertEqual(response_data['shipping_address'], "123 Main St")

    def test_get_profile_user_not_found(self):
        # Send GET request to /profile with a non-existent email
        response = self.client.get('/profile', json={"email": "nonexistent@example.com"})

        # Assert the response is 404 Not Found with an appropriate message
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])

    def test_get_profile_cached(self):
        # Manually cache the user profile in Redis
        redis_conn.setex(
            f"user_profile:john@example.com", 3600,
            json.dumps({
                "name": "John Doe",
                "email": "john@example.com",
                "phone_number": "1234567890",
                "shipping_address": "123 Main St"
            })
        )

        # Send GET request to /profile
        response = self.client.get('/profile', json={"email": "john@example.com"})

        # Assert the response is 200 OK and the profile data is correct
        self.assertEqual(response.status_code, 200)
        response_data = response.get_json()
        self.assertEqual(response_data['name'], "John Doe")
        self.assertEqual(response_data['email'], "john@example.com")
        self.assertEqual(response_data['phone_number'], "1234567890")
        self.assertEqual(response_data['shipping_address'], "123 Main St")

    def test_update_profile_success(self):
        # Send PUT request to /profile to update the user profile
        updated_data = {
            "email": "john@example.com",
            "name": "John Updated",
            "phone_number": "0987654321",
            "shipping_address": "456 Updated St"
        }
        response = self.client.put('/profile', json=updated_data)

        # Assert the response is 200 OK with a success message
        self.assertEqual(response.status_code, 200)
        self.assertIn('Profile updated successfully', response.get_json()['message'])

        # Verify that the user data is updated in the database
        with app.app_context():
            user = User.query.filter_by(email="john@example.com").first()
            self.assertEqual(user.name, "John Updated")
            self.assertEqual(user.phone_number, "0987654321")
            self.assertEqual(user.shipping_address, "456 Updated St")

    def test_update_profile_user_not_found(self):
        # Send PUT request to /profile with a non-existent email
        updated_data = {
            "email": "nonexistent@example.com",
            "name": "John Updated",
            "phone_number": "0987654321",
            "shipping_address": "456 Updated St"
        }
        response = self.client.put('/profile', json=updated_data)

        # Assert the response is 404 Not Found with an appropriate message
        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found', response.get_json()['message'])


if __name__ == '__main__':
    unittest.main()
