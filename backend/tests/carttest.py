import unittest
from unittest.mock import patch
from backend.main.app import app, db
from backend.main.model import User, Product, Cart, CartItem

class CartApiTest(unittest.TestCase):

    def setUp(self):
        # Set up the Flask test client and initialize the database for testing
        self.app = app.test_client()
        self.app.testing = True

        # Mock database session
        self.patcher = patch('backend.main.main.db.session')
        self.mock_db_session = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    @patch('backend.main.app.Cart.query')
    @patch('backend.main.CartItem.query')
    def test_add_to_cart(self, mock_cart_item_query, mock_cart_query):
        # Mock cart and cart item
        mock_cart = Cart(cart_id=1, user_id=1)
        mock_cart_query.filter_by.return_value.first.return_value = mock_cart

        mock_cart_item = CartItem(cart_item_id=1, cart_id=1, product_id=1, quantity=1)
        mock_cart_item_query.filter_by.return_value.first.return_value = None

        # Test data
        response = self.app.post('/cart/add', json={
            'user_id': 1,
            'product_id': 1,
            'quantity': 2
        })

        # Verify response
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], 'Item added to cart successfully')
        
    @patch('backend.main.app.Cart.query')
    def test_view_cart(self, mock_cart_query):
        # Mock cart and items
        mock_cart_item = CartItem(cart_item_id=1, product_id=1, quantity=2)
        mock_cart_item.product = Product(product_id=1, name="Green Tea", price=10.0)
        mock_cart = Cart(cart_id=1, user_id=1, items=[mock_cart_item])
        mock_cart_query.filter_by.return_value.first.return_value = mock_cart

        # Test data
        response = self.app.get('/cart/1')

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['cart_id'], 1)
        self.assertEqual(len(response.json['items']), 1)
        self.assertEqual(response.json['items'][0]['product_name'], "Green Tea")

    @patch('backend.main.app.CartItem.query')
    def test_remove_from_cart(self, mock_cart_item_query):
        # Mock cart item
        mock_cart_item = CartItem(cart_item_id=1, cart_id=1, product_id=1, quantity=1)
        mock_cart_item_query.get.return_value = mock_cart_item

        # Test data
        response = self.app.delete('/cart/remove', json={
            'cart_item_id': 1
        })

        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Item removed from cart successfully')
        
if __name__ == '__main__':
    unittest.main()