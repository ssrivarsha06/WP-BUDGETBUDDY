# routes.py
import os
import requests
from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from models import User
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    if not all([first_name, last_name, email, password]):
        return jsonify({'message': 'Missing fields'}), 400

    # Check if user already exists
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password) # Hash the password
    new_user = User(first_name=first_name, last_name=last_name, email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201


@routes_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing credentials'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password): # Check hashed password
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token}), 200


@routes_bp.route('/google-signup', methods=['POST'])
def google_signup():
    data = request.get_json()
    token = data.get('token')
    print("Received Google token:", token)

    if not token:
        return jsonify({'message': 'Missing Google token'}), 400

    # Verify the token with Google
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    token_info_url = f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}'

    try:
        response = requests.get(token_info_url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        token_info = response.json()

        if token_info['aud'] != GOOGLE_CLIENT_ID:
            return jsonify({'message': 'Invalid Google Client ID'}), 400

        email = token_info['email']
        first_name = token_info.get('given_name', '')
        last_name = token_info.get('family_name', '')

        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            access_token = create_access_token(identity=email)
            return jsonify({'access_token': access_token, 'message': 'Login successful'}), 200

        # Create a new user
        # For Google Sign-In, you might not have a password.  Consider generating a random one.
        random_password = os.urandom(24).hex()  # Generate a random password
        hashed_password = generate_password_hash(random_password)
        new_user = User(first_name=first_name, last_name=last_name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=email)
        return jsonify({'access_token': access_token, 'message': 'Signup successful'}), 201

    except requests.exceptions.RequestException as e:
        print("RequestException:", e)
        return jsonify({'message': 'Invalid Google token'}), 400
    except Exception as e:
        print("Exception:", e)
        return jsonify({'message': 'Internal server error'}), 500


@routes_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email
    }), 200
