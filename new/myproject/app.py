import os
from flask import Flask, send_file, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS
from flask import session, redirect, url_for, render_template

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app and set the correct template folder
app = Flask(__name__, template_folder='templates', static_folder='static')

# Configure the app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_default_secret_key')  # Use a strong, random secret key
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY', "super-secret")  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Token expiration time

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Import and register routes
from auth_routes import routes_bp
app.register_blueprint(routes_bp)

# Define the database models
from models import User  # Import the User model

# Define routes for rendering HTML templates
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    # Clear session data if any
    session.clear()
    return render_template('landing.html')  # or redirect if you have a route


@app.route('/landing')
def landing():
    return render_template('landing.html')
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')
@app.route('/shared')
def shared():
    return render_template('shared.html')

@app.route('/')
def home():
    return render_template('landing.html')  # Changed to landing.html (assuming it's the homepage)

@app.route('/signup')
def signup():
    return render_template('signup.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
