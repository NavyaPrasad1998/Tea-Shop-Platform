import unittest
from src.main.main import app, db, redis_conn
from src.main.model import Product
import json
import warnings
from sqlalchemy.exc import LegacyAPIWarning


# Ignore specific warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)  # For Flask or SQLAlchemy user warnings
warnings.filterwarnings("ignore", category=LegacyAPIWarning)  # For SQLAlchemy's legacy API warning


class TestProductManagement(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory SQLite database for testing
        app.config['TESTING'] = True
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            # Add a test product (do not set `product_id`)
            self.test_product = Product(
                name="Test Product",
                description="This is a test product.",
                price=9.99,
                category="Test Category",
                image_url="http://example.com/test.png",
                stock_quantity=100
            )
            db.session.add(self.test_product)
            db.session.commit()


    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
            redis_conn.flushdb()  # Clear Redis cache

    def test_get_products_success(self):
        # Send GET request to /products
        response = self.client.get('/products')

        # Assert the response is 200 OK and contains the product data
        self.assertEqual(response.status_code, 200)
        response_data = response.get_json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]['name'], "Test Product")

    def test_get_products_cached(self):
        # Cache the product data in Redis
        products_data = [{
            "product_id": 1,
            "name": "Cached Product",
            "price": 19.99,
            "category": "Cached Category",
            "image_url": "http://example.com/cached.png"
        }]
        redis_conn.setex("products", 3600, json.dumps(products_data))

        # Send GET request to /products
        response = self.client.get('/products')

        # Assert the response is 200 OK and contains the cached data
        self.assertEqual(response.status_code, 200)
        response_data = response.get_json()
        self.assertEqual(response_data[0]['name'], "Cached Product")

    def test_get_product_success(self):
        # Send GET request to /products/<product_id>
        response = self.client.get('/products/1')

        # Assert the response is 200 OK and contains the product data
        self.assertEqual(response.status_code, 200)
        response_data = response.get_json()
        self.assertEqual(response_data['name'], "Test Product")

    def test_get_product_not_found(self):
        # Send GET request to /products/<product_id> with a non-existent product ID
        response = self.client.get('/products/99')

        # Assert the response is 404 Not Found with an appropriate message
        self.assertEqual(response.status_code, 404)
        self.assertIn('Product not found', response.get_json()['message'])

    def test_add_product_success(self):
        # Send POST request to /products to add a new product
        new_product_data = {
            "name": "New Product",
            "description": "This is a new product.",
            "price": 19.99,
            "category": "New Category",
            "image_url": "http://example.com/new.png",
            "stock_quantity": 50
        }
        response = self.client.post('/products', json=new_product_data)

        # Assert the response is 201 Created with a success message
        self.assertEqual(response.status_code, 201)
        self.assertIn('Product added successfully', response.get_json()['message'])

        # Verify the product is added to the database
        with app.app_context():
            product = Product.query.filter_by(name="New Product").first()
            self.assertIsNotNone(product)
            self.assertEqual(product.description, "This is a new product.")
            self.assertEqual(product.price, 19.99)


    def test_update_product_success(self):
        # Send PUT request to /products/<product_id> to update the product
        updated_product_data = {
            "product_id": 1,
            "name": "Updated Product",
            "description": "This is an updated product.",
            "price": 29.99,
            "category": "Updated Category",
            "image_url": "http://example.com/updated.png",
            "stock_quantity": 75
        }
        response = self.client.put('/products/1', json=updated_product_data)

        # Assert the response is 200 OK with a success message
        self.assertEqual(response.status_code, 200)
        self.assertIn('Product updated successfully', response.get_json()['message'])

        # Verify the product data is updated in the database
        with app.app_context():
            product = Product.query.get(1)
            self.assertEqual(product.name, "Updated Product")
            self.assertEqual(product.price, 29.99)

    def test_update_product_not_found(self):
        # Send PUT request to /products/<product_id> with a non-existent product ID
        response = self.client.put('/products/99', json={
            "product_id": 99,
            "name": "Non-existent Product"
        })

        # Assert the response is 404 Not Found
        self.assertEqual(response.status_code, 404)
        self.assertIn('Product not found', response.get_json()['message'])

    def test_delete_product_success(self):
        # Send DELETE request to /products/<product_id>
        response = self.client.delete('/products/1')

        # Assert the response is 200 OK with a success message
        self.assertEqual(response.status_code, 200)
        self.assertIn('Product deleted successfully', response.get_json()['message'])

        # Verify the product is deleted from the database
        with app.app_context():
            product = Product.query.get(1)
            self.assertIsNone(product)

    def test_delete_product_not_found(self):
        # Send DELETE request to /products/<product_id> with a non-existent product ID
        response = self.client.delete('/products/99')

        # Assert the response is 404 Not Found
        self.assertEqual(response.status_code, 404)
        self.assertIn('Product not found', response.get_json()['message'])

    def test_view_product_success(self):
        # Send POST request to /view-product/<product_id> to track a viewed product
        response = self.client.post('/view-product/1', json={"email": "test@example.com"})

        # Assert the response is 404 Not Found (no user added for this case)
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
