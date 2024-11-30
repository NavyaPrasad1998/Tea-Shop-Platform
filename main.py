from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify
from config import SQLALCHEMY_DATABASE_URI , SQLALCHEMY_TRACK_MODIFICATIONS

app = Flask(__name__)

#Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

db = SQLAlchemy(app)

#Database Model
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    phone_number = db.Column(db.String(15))
    shipping_address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<User {self.name}>'


class Product(db.Model):
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(200))
    stock_quantity = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<Product {self.name}>'


#API Routes

# User Management APIs

#User registration API
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

#User login API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 400

    return jsonify({'message': 'Login successful'}), 200

#Profile management - view and update user profile
@app.route('/profile', methods=['GET', 'PUT'])
def profile():
    if request.method == 'GET':
        data = request.get_json()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'shipping_address': user.shipping_address
        }), 200
        
    elif request.method == 'PUT':
        data = request.get_json()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        user.name = data.get('name')
        user.phone_number = data.get('phone_number')
        user.shipping_address = data.get('shipping_address')

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
       
#Password Reset
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, old_password):
        return jsonify({'message': 'Invalid credentials'}), 400

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'message': 'Password reset successful '}), 200

#Product Management APIs

#Get all products
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    } for product in products]), 200

#Get product by id
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    return jsonify({
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    }), 200

#Add new product
@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    category = data.get('category')
    image_url = data.get('image_url')
    stock_quantity = data.get('stock_quantity')

    new_product = Product(name=name, description=description, price=price, category=category, image_url=image_url, stock_quantity=stock_quantity)
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully'}), 201

#Update product
@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    data = request.get_json()
    product.name = data.get('name')
    product.description = data.get('description')
    product.price = data.get('price')
    product.category = data.get('category')
    product.image_url = data.get('image_url')
    product.stock_quantity = data.get('stock_quantity')

    db.session.commit()
    return jsonify({'message': 'Product updated successfully'}), 200


if __name__ == "__main__":    
    with app.app_context():
        db.create_all()
    app.run(debug=True)
