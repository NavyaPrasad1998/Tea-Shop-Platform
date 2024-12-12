import unittest
from main import app, db, Cart, CartItem, Product
from flask import jsonify

class TestCartRoutes(unittest.TestCase):
    # Setup a testing environment
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory SQLite database for testing
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['TESTING'] = True
        self.client = app.test_client()

        # Create tables in the in-memory database
        with app.app_context():
            db.create_all()

            # Add a product to the database for testing
            product = Product(name="Test Product", price=10.0)
            db.session.add(product)
            db.session.commit()

    def tearDown(self):
        # Cleanup after each test
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # Test adding an item to the cart
    def test_add_to_cart(self):
        user_id = 1
        product_id = 1
        quantity = 2
        
        data = {
            'user_id': user_id,
            'product_id': product_id,
            'quantity': quantity
        }
        
        response = self.client.post('/cart/add', json=data)

        # Assert that the response is a 201 Created and the message is correct
        self.assertEqual(response.status_code, 201)
        self.assertIn('Item added to cart successfully', response.get_json()['message'])

        # Verify the cart item was added
        with app.app_context():
            cart = Cart.query.filter_by(user_id=user_id).first()
            self.assertIsNotNone(cart)
            cart_item = CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
            self.assertIsNotNone(cart_item)
            self.assertEqual(cart_item.quantity, quantity)

    # Test viewing the cart when it's not empty
    def test_view_cart(self):
        user_id = 1
        product_id = 1
        quantity = 1

        # Add item to cart
        data = {'user_id': user_id, 'product_id': product_id, 'quantity': quantity}
        self.client.post('/cart/add', json=data)

        # View the cart
        response = self.client.get(f'/cart/{user_id}')
        
        # Assert that the response is a 200 OK and contains the correct data
        self.assertEqual(response.status_code, 200)
        cart_data = response.get_json()
        self.assertEqual(len(cart_data['items']), 1)
        self.assertEqual(cart_data['items'][0]['product_name'], 'Test Product')

    # Test viewing the cart when it's empty
    def test_view_empty_cart(self):
        user_id = 2
        
        response = self.client.get(f'/cart/{user_id}')

        # Assert that the response is a 200 OK and the cart is empty
        self.assertEqual(response.status_code, 200)
        self.assertIn('Cart is empty', response.get_json()['message'])

    # Test removing an item from the cart
    def test_remove_from_cart(self):
        user_id = 1
