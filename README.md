
# 💰 Budget Buddy – Personal Finance Tracker

**Budget Buddy** is a full-stack web application designed to help users manage personal expenses, monitor financial habits, and visualize spending through interactive dashboards.

---

## 🌟 Features

- ➕ Add, edit, and delete expenses
- 📊 Visualize spending patterns with charts
- 🔐 Secure user login and session management
- 📁 Category and date-wise transaction tracking
- 📱 Fully responsive design using HTML, CSS, and JavaScript

---

## 🛠️ Tech Stack

### 🔧 Frontend
- **HTML5**
- **CSS3**
- **JavaScript**
### ⚙️ Backend
- **Flask** (Python-based web framework)
- **SQLite / MongoDB** (choose whichever you're using)
- **Jinja2 Templating**

---

## 🗂️ Project Structure

```bash
WP-BUDGETBUDDY/
├── static/                 # CSS, JS, images
│   ├── style.css
│   └── script.js
├── templates/              # HTML files using Jinja2
│   ├── index.html
│   ├── login.html
│   └── dashboard.html
├── app.py                  # Flask backend
├── database.db             # SQLite DB (if applicable)
├── requirements.txt
└── README.md
```

---

## 🚀 Running the App Locally

### 1. Clone the repository

```bash
git clone https://github.com/ssrivarsha06/WP-BUDGETBUDDY.git
cd WP-BUDGETBUDDY
```

### 2. Set up the Python environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the Flask server

```bash
python app.py
```

Access the app at `http://localhost:5000`

---

## 🔐 Authentication

- User login credentials securely stored
- Sessions handled via Flask’s `session` management

---

## 📈 Future Enhancements

- Income tracking and savings goal system
- Export expenses to CSV or PDF
- Google login integration
- Notifications for overspending

---

## 🙋‍♀️ Author

Developed by **Srivarsha Sivakumar, Ramya Nakshathra, Shruti**   
[LinkedIn-Srivarsha](https://linkedin.com/in/srivarsha-sivakumar)
[LinkedIn-Ramya](https://www.linkedin.com/in/ramya-nakshathra) - Developed Personal Budgeting Features & Led Frontend Development for Budget Buddy

[LinkedIn-Shruti](https://www.linkedin.com/in/shrutiselvakkumar)

---

## 📄 License

This project is licensed under the MIT License.
