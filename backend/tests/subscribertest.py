import unittest
import sys
import os
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from backend.main.app import app, db
from backend.main.model import User, Product, Subscription

class SubscribeRouteTest(unittest.TestCase):

    def setUp(self):
        # Set up the Flask test client and initialize the database for testing
        self.app = app.test_client()
        self.app.testing = True

        # Mock database session
        self.patcher = patch('src.main.main.db.session')
        self.mock_db_session = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    @patch('src.main.main.User.query')
    @patch('src.main.main.Product.query')
    def test_subscribe_success(self, mock_product_query, mock_user_query):
        # Mock user and product
        mock_user = User(user_id=1, email="test@example.com")
        mock_product = Product(product_id=1, name="Green Tea")

        mock_user_query.filter_by.return_value.first.return_value = mock_user
        mock_product_query.get.return_value = mock_product

        # Test data
        payload = {
            "email": "test@example.com",
            "product_id": 1
        }

        response = self.app.post('/subscribe', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["message"], "Subscribed successfully")

        # Verify database commit
        self.assertTrue(self.mock_db_session.add.called)
        self.assertTrue(self.mock_db_session.commit.called)


    @patch('src.main.main.User.query')
    @patch('src.main.main.Subscription.query')
    def test_get_subscriptions_success(self, mock_subscription_query, mock_user_query):
        # Mock user and subscriptions
        mock_user = User(user_id=1, email="test@example.com")
        mock_user_query.filter_by.return_value.first.return_value = mock_user

        mock_subscriptions = [
            Subscription(subscription_id=1, user_id=1, product_id=101),
            Subscription(subscription_id=2, user_id=1, product_id=102)
        ]
        mock_subscription_query.filter_by.return_value.all.return_value = mock_subscriptions

        # Test data
        payload = {
            "email": "test@example.com"
        }

        response = self.app.get('/subscriptions', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]["subscription_id"], 1)
        self.assertEqual(response.json[0]["product_id"], 101)
    
    @patch('src.main.main.User.query')
    @patch('src.main.main.Subscription.query')
    def test_unsubscribe_success(self, mock_subscription_query, mock_user_query):
        # Mock user and subscription
        mock_user = User(user_id=1, email="test@example.com")
        mock_subscription = Subscription(subscription_id=1, user_id=1, product_id=101, status='active')

        mock_user_query.filter_by.return_value.first.return_value = mock_user
        mock_subscription_query.filter_by.return_value.first.return_value = mock_subscription

        # Test data
        payload = {
            "email": "test@example.com",
            "product_id": 101
        }

        response = self.app.post('/unsubscribe', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Unsubscribed successfully")
        self.assertEqual(mock_subscription.status, 'cancelled')
        
    @patch('src.main.main.User.query')
    @patch('src.main.main.Subscription.query')
    def test_update_subscription_success(self, mock_subscription_query, mock_user_query):
        # Mock user and subscription
        mock_user = User(user_id=1, email="test@example.com")
        mock_subscription = Subscription(subscription_id=1, user_id=1, product_id=101, frequency="monthly", quantity=1)

        mock_user_query.filter_by.return_value.first.return_value = mock_user
        mock_subscription_query.filter_by.return_value.first.return_value = mock_subscription

        # Test data
        payload = {
            "email": "test@example.com",
            "product_id": 101,
            "frequency": "weekly",
            "quantity": 2
        }

        response = self.app.put('/subscriptions', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Subscription updated successfully")
        self.assertEqual(mock_subscription.frequency, "weekly")
        self.assertEqual(mock_subscription.quantity, 2)
    
    @patch('src.main.main.User.query')
    @patch('src.main.main.Subscription.query')
    def test_get_subscription_status_success(self, mock_subscription_query, mock_user_query):
        # Mock user and subscription
        mock_user = User(user_id=1, email="test@example.com")
        mock_subscription = Subscription(subscription_id=1, user_id=1, product_id=101, status='active')

        mock_user_query.filter_by.return_value.first.return_value = mock_user
        mock_subscription_query.filter_by.return_value.first.return_value = mock_subscription

        # Test data
        payload = {
            "email": "test@example.com",
            "product_id": 101
        }

        response = self.app.get('/subscription-status', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "active")

    @patch('src.main.main.User.query')
    @patch('src.main.main.Subscription.query')
    def test_get_subscription_history_success(self, mock_subscription_query, mock_user_query):
        # Mock user and subscriptions
        mock_user = User(user_id=1, email="test@example.com")
        mock_user_query.filter_by.return_value.first.return_value = mock_user

        mock_subscriptions = [
            Subscription(subscription_id=1, user_id=1, product_id=101, status='active'),
            Subscription(subscription_id=2, user_id=1, product_id=102, status='cancelled')
        ]
        mock_subscription_query.filter_by.return_value.all.return_value = mock_subscriptions

        # Test data
        payload = {
            "email": "test@example.com"
        }

        response = self.app.get('/subscription-history', json=payload)

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]["subscription_id"], 1)
        self.assertEqual(response.json[0]["status"], "active")


if __name__ == '__main__':
    unittest.main()