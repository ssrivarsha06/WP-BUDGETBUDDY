from werkzeug.security import generate_password_hash
from app import db
from flask import Flask
from flask import Flask, request, jsonify

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
if not user or not check_password_hash(user.password, password): # Check hashed password
        print(check_password_hash(user.password, password))  # <-- ADD THIS
        return jsonify({'message': 'Invalid credentials'}), 401
