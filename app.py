#####################################
#            MODULES
#####################################
from flask import Flask, redirect, url_for, request, session, render_template, flash
from dotenv import load_dotenv
load_dotenv()
import os
from database import Database
from datetime import timedelta

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time

###########################################
#            Application settings
###########################################
database = Database()
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv("secret")
app.permanent_session_lifetime = timedelta(days=14)
app.config['VERSION'] = int(time.time())  # Таймстамп при запуске

#####################################
#        Requests limiter
#####################################

limiter = Limiter(
    key_func=lambda: str(session.get("user_id")),
    default_limits=[],
)

limiter.init_app(app)

#####################################
#            Routes
#####################################

# Index
@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("profile"))
    return redirect(url_for("home"))

# Home
@app.route("/home")
def home():
    return render_template("home.html")

# Login
@app.route("/login", methods=["GET", "POST"])
@limiter.limit("2 per second")
def login():
    if request.method == "POST":
        # Get user data from form
        login = request.form.get("login").strip()
        password = request.form.get("password").strip()
        
        check_user = database.user_in_db(login, login)
        print(check_user)
        if not check_user[0]:
            flash("This user does not exist.", "error")
            return render_template("login.html", login=login, password=password)

        # Check login format
        login_type = "email" if "@" in login else "username"
        # Try to log in
        if login_type == "email":
            check_login = database.check_user_password_email(login, password)
        else:
            check_login = database.check_user_password_username(login, password)
        
        # Invalid try for login
        if not check_login:
            flash("Wrong login or password!", "error")
            return render_template("login.html", login=login, password=password)
        
        # Get user info by current login format
        if login_type == "email":
            user = database.get_user_for_login_email(login)
        else:
            user = database.get_user_for_login_username(login)
        
        # Add user id into session
        session.permanent = True
        session["user_id"] = user[0]

        return redirect(url_for("profile"))
    return render_template("login.html")

# Register
@app.route("/register", methods=["GET", "POST"])
@limiter.limit("2 per second")
def register():
    if request.method == "POST":
        # Get user info from form
        email = request.form.get("email")
        username = request.form.get("username")
        password = request.form.get("password")
        password_confirm = request.form.get("password_confirm")

        # Errors checker
        has_errors = False

        # Data Validation
        if not "@" in email:
            flash("Incorrect email", "error")
            has_errors = True
        elif len(username) < 3:
            flash("Username is too short", "error")
            has_errors = True
        elif len(password) < 8:
            flash("Password is too short", "error")
            has_errors = True
        elif password == password.lower():
            flash("Add one letter in upper case", "error")
            has_errors = True
        elif password != password_confirm:
            flash("Passwords must match!", "error")
            has_errors = True
        
        # Check user stock
        check_user = database.user_in_db(username, email)
        if check_user[0]:
            flash(f"An account with such {check_user[1]} already exists.", "error")
            has_errors = True
        
        # If errors - recreate form with current datas
        if has_errors:
            return render_template("register.html", 
                                email=email,
                                username=username,
                                password=password,
                                password_confirm=password_confirm)
        
        # Try to create user account
        create_result = database.create_user(username, email, password)
        if create_result[0] == False:
            flash(f"Error! Code: {create_result[1]}", "error")
            has_errors = True
        else:
            flash("Success! Log in!", "success")
            return redirect(url_for("login"))
    return render_template("register.html")

# Profile
@app.route("/profile")
@limiter.limit("2 per second")
def profile():
    # Check authorization
    print(url_for('delete_transaction', tx_id=1))
    if "user_id" not in session:
        return redirect(url_for("login"))
    # Get user info and render profile
    user_transactions = database.get_all_user_transactions(session.get("user_id"))
    transactions_count = len(user_transactions) if user_transactions else 0
    user_data = database.get_user_for_profile(session.get("user_id"))
    user_role = database.get_user_role(session.get("user_id"))
    return render_template("profile.html", user_data=user_data, transactions=user_transactions, transactions_count=transactions_count, role=user_role)

@app.route("/logout")
def logout():
    if "user_id" in session:
        session.clear()
        return redirect(url_for('home'))
    return redirect(url_for('home'))

#####################################
#            Transactions
#####################################

@app.route("/transaction/add", methods=["POST"])
@limiter.limit("2 per second")
def create_transaction():
    if not "user_id" in session:
        return redirect(url_for("login"))
    
    ##################
    #    Values
    ##################
    type = request.form.get("type")

    amount = request.form.get("amount")

    category = request.form['category']
    if category == 'Другое':
        category = request.form.get('custom_category', 'Другое')

    note = request.form.get("note")

    ####################
    #     Logic
    ####################
    result = database.create_transaction(session["user_id"], type, amount, category, note)
    if result:
        flash("Transaction succesfully added!", "success")
        return redirect(url_for("profile"))
    else:
        flash(result[1], "error")
        return redirect(url_for("profile"))
    

@app.route("/transaction/delete/<int:tx_id>", methods=["POST"])
@limiter.limit("2 per second")
def delete_transaction(tx_id):
    if not "user_id" in session:
        return redirect(url_for("login"))
    
    if not database.check_user_transaction_access(session.get("user_id"), tx_id):
        print("decline")
        return redirect(url_for("profile"))
    
    result = database.remove_transaction(tx_id)
    if result[0]:
        flash("Transaction succesfully removed!", "success")
        print(1)
        return redirect(url_for("profile"))
    else:
        flash(result[1], "error")
        print(result[1])
        return redirect(url_for("profile"))

#####################################
#            Admin-panel
#####################################

@app.route("/admin", strict_slashes=False)
def admin():
    if not "user_id" in session:
        return redirect(url_for("login"))

    if not database.get_user_role(session.get("user_id")) in ['admin', 'moderator']:
        flash("Вы не являетесь админом или модератором!")
        return redirect(url_for("profile"))
    
    return render_template("admin.html", users=database.get_all_users())

@app.route('/admin/edit/<int:user_id>', methods=["GET", "POST"])
def admin_edit_user(user_id):
    if not "user_id" in session:
        return redirect(url_for("login"))

    if not database.get_user_role(session.get("user_id")) in ['admin', 'moderator']:
        flash("Вы не являетесь админом или модератором!")
        return redirect(url_for("profile"))
        
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        role = request.form.get("role")
        result = database.edit_user(user_id, username, email, role)
        if result[0]:
            flash("Userdata succesfully changed!", "success")
            return redirect(url_for("admin"))
        flash(result[1], "error")
        return redirect(url_for("admin"))
    
    user_transactions = database.get_all_user_transactions(user_id)
    transactions_count = len(user_transactions) if user_transactions else 0
    user_data = database.get_user_for_profile(user_id)
    user_role = database.get_user_role(user_id)
    return render_template("admin_edit_user.html", tx_count=transactions_count, user=user_data, role=user_role, id=user_id)

@app.route('/admin/delete/<int:user_id>', methods=["GET"])
def admin_delete_user(user_id):
    if not "user_id" in session:
        return redirect(url_for("login"))

    if not database.get_user_role(session.get("user_id")) in ['admin', 'moderator']:
        flash("Вы не являетесь админом или модератором!")
        return redirect(url_for("profile"))
    
    result = database.delete_user(user_id)
    if result[0]:
        flash("User successfully deleted!")
        return(redirect(url_for("admin")))
    else:
        flash(result[1], "error")
        return(redirect(url_for("admin")))

@app.errorhandler(429)
def too_many_requests(e):
    return render_template("429.html"), 429

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404

#####################################
#            Launch
#####################################
if __name__ == "__main__":
    app.run(port=5000, debug=True)