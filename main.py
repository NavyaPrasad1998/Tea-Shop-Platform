from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify
from config import SQLALCHEMY_DATABASE_URI , SQLALCHEMY_TRACK_MODIFICATIONS
import json
import redis
from flask_redis import FlaskRedis
from redis import Redis 


app = Flask(__name__)
# Redis Connection
redis_conn = redis.Redis(host='localhost', port=6379, db=0)
#Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config['REDIS_URL'] = 'redis://localhost:6379/0'

db = SQLAlchemy(app)

# Initialize Redis instance
redis = FlaskRedis(app)

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

class Recommendation(db.Model):
    recommendation_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'))
    recommended_product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<Recommendation {self.recommendation_id}>'

class Subscription(db.Model):
    subscription_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'))
    frequency = db.Column(db.String(50))
    quantity = db.Column(db.Integer)
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<Subscription {self.subscription_id}>'

class ChatMessage(db.Model):
    chat_message_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    message = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<ChatMessage {self.chat_message_id}>'

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
    phone_number = data.get('phone_number')
    shipping_address = data.get('shipping_address')
    new_user = User(name=name, email=email, password_hash=hashed_password, phone_number=phone_number, shipping_address=shipping_address)
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
        cached_user = redis_conn.get(f'user_profile:{email}')
        if cached_user:
            return jsonify(json.loads(cached_user)), 200
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Cache the user profile with expiry time of 1 hour
        redis_conn.setex(f'user_profile:{email}', 3600, json.dumps({
            'name': user.name,
            'email': user.email,
            'phone_number': user.phone_number,
            'shipping_address': user.shipping_address
        }))

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
    cached_projets = redis_conn.get('products')
    if cached_projets:
        print("Cached Products")
        return jsonify(json.loads(cached_projets)), 200
    products = Product.query.all()
    products_data = [{
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    } for product in products]
    # Cache the products with expiry time of 1 hour
    redis_conn.setex('products', 3600, json.dumps(products_data))
    return jsonify(products_data), 200

#Get product by id
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    cached_product = redis_conn.get(f'product:{product_id}')
    if cached_product:
        print("Cached Product")
        return jsonify(json.loads(cached_product)), 200
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    product_data = {
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    }
    # Cache the product with expiry time of 1 hour
    redis_conn.setex(f'product:{product_id}', 3600, json.dumps(product_data))


    return jsonify(product_data), 200

@app.route('/view-product/<int:product_id>', methods=['POST'])
def view_product(product_id):
    email = request.get_json().get('email')
    
    # Get the user from the database
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Track the viewed product in Redis
    redis_conn.sadd(f"user:{user.user_id}:viewed_products", product_id)
    
    # Return a success message
    return jsonify({'message': f'Product {product_id} viewed successfully'}), 200



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

#Delete product
@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'}), 200


#Recommendation API
@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    email = request.args.get('email')
    cached_recommendations = redis_conn.get(f"user:{email}:recommendations")
    
    if cached_recommendations:
        return jsonify(eval(cached_recommendations)), 200  # Return cached recommendations
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    viewed_product_ids = redis_conn.smembers(f"user:{user.user_id}:viewed_products")
    
    if not viewed_product_ids:
        return jsonify({'message': 'No viewed products found'}), 404
    
    viewed_product_ids = [int(product_id) for product_id in viewed_product_ids]
    viewed_products = Product.query.filter(Product.product_id.in_(viewed_product_ids)).all()
    viewed_categories = set(product.category for product in viewed_products)
    recommended_products = Product.query.filter(Product.category.in_(viewed_categories)).filter(Product.product_id.notin_(viewed_product_ids)).limit(5).all()
    recommendations = [{
        'product_id': product.product_id,
        'name': product.name,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    } for product in recommended_products]
    
    # Cache the recommendations in Redis for 1 hour (3600 seconds)
    redis_conn.setex(f"user:{email}:recommendations", 3600, str(recommendations))
    
    return jsonify(recommendations), 200




#Subscription APIs
#Subscribe to a product
@app.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    email = data.get('email')
    product_id = data.get('product_id')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    new_subscription = Subscription(user_id=user.user_id, product_id=product_id)
    db.session.add(new_subscription)
    db.session.commit()
    return jsonify({'message': 'Subscribed successfully'}), 201

#Get subscriptions for a user
@app.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    subscriptions = Subscription.query.filter_by(user_id=user.user_id).all()
    return jsonify([{
        'subscription_id': subscription.subscription_id,
        'product_id': subscription.product_id
    } for subscription in subscriptions]), 200

#Unsubscribe from a product: update status to cancelled
@app.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    data = request.get_json()
    email = data.get('email')
    product_id = data.get('product_id')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    subscription = Subscription.query.filter_by(user_id=user.user_id, product_id=product_id).first()
    if not subscription:
        return jsonify({'message': 'Subscription not found'}), 404

    subscription.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Unsubscribed successfully'}), 200


#Update Subscription API
@app.route('/subscriptions', methods=['PUT'])
def update_subscriptions():
    data = request.get_json()
    email = data.get('email')
    product_id = data.get('product_id')
    frequency = data.get('frequency')
    quantity = data.get('quantity')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    subscription = Subscription.query.filter_by(user_id=user.user_id, product_id=product_id).first()
    if not subscription:
        return jsonify({'message': 'Subscription not found'}), 404

    subscription.frequency = frequency
    subscription.quantity = quantity

    db.session.commit()
    return jsonify({'message': 'Subscription updated successfully'}), 200

#Get Subscription status: Active, Paused, Cancelled
@app.route('/subscription-status', methods=['GET'])
def get_subscription_status():
    data = request.get_json()
    email = data.get('email')
    product_id = data.get('product_id')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    subscription = Subscription.query.filter_by(user_id=user.user_id, product_id=product_id).first()
    if not subscription:
        return jsonify({'message': 'Subscription not found'}), 404

    return jsonify({'status': subscription.status}), 200

#Get Subscription history
@app.route('/subscription-history', methods=['GET'])
def get_subscription_history():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    subscriptions = Subscription.query.filter_by(user_id=user.user_id).all()
    return jsonify([{
        'subscription_id': subscription.subscription_id,
        'product_id': subscription.product_id,
        'status': subscription.status
    } for subscription in subscriptions]), 200


#Live Chat APIs
# Chatbot APIs
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    message = data.get('message')

    # Perform chatbot logic here
    # For example, process the message and return a response

    return jsonify({'message': 'Chatbot response'}), 200

#User Chat APIs
#Send message
@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.get_json()
    email = data.get('email')
    message = data.get('message')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    new_message = ChatMessage(user_id=user.user_id, message=message)
    db.session.add(new_message)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully'}), 201

#Get messages for a user
@app.route('/messages', methods=['GET'])
def get_messages():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    messages = ChatMessage.query.filter_by(user_id=user.user_id).all()
    return jsonify([{
        'chat_message_id': message.chat_message_id,
        'message': message.message
    } for message in messages]), 200
    


if __name__ == "__main__":    
    with app.app_context():
        db.create_all()
    app.run(debug=True)
