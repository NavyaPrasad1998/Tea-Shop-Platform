import unittest
from unittest.mock import patch
from backend.main.app import app, db, redis_conn
from backend.main.model import User, Product

class RecommendRouteTest(unittest.TestCase):
    def setUp(self):
        # Set up the Flask test client and initialize the database for testing
        self.app = app.test_client()
        self.app.testing = True

        # Mock database session
        self.patcher = patch('src.main.main.db.session')
        self.mock_db_session = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    @patch('src.main.main.redis_conn')
    @patch('src.main.main.Product.query')
    @patch('src.main.main.User.query')
    def test_get_recommendations_success(self, mock_user_query, mock_product_query, mock_redis):
        # Mock user
        mock_user = User(user_id=1, email="test@example.com")
        mock_user_query.filter_by.return_value.first.return_value = mock_user

        # Mock Redis cache
        mock_redis.get.return_value = None
        
        # Mock viewed products in Redis
        mock_redis.smembers.return_value = {"1", "2"}

        # Mock product query
        mock_viewed_products = [
            Product(product_id=1, name="Green Tea", category="Tea", price=10.0, image_url="image1.jpg"),
            Product(product_id=2, name="Black Tea", category="Tea", price=15.0, image_url="image2.jpg")
        ]
        mock_recommended_products = [
            Product(product_id=3, name="Herbal Tea", category="Tea", price=20.0, image_url="image3.jpg")
        ]
        
        mock_product_query.filter.return_value.filter.return_value.limit.return_value.all.side_effect = [mock_viewed_products, mock_recommended_products]

        # Test data
        response = self.app.get('/recommendations?email=test@example.com')

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json[0]['name'], "Green Tea")


if __name__ == '__main__':
    unittest.main()