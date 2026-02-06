import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
import datetime
import os

import secrets

class Database:
    def __init__(self):
        self.create_db()

    def get_conn(self) -> sqlite3.Connection:
        db_path = os.getenv("DB_PATH", "database.db")
        return sqlite3.connect("database.db", timeout=10)

    def create_db(self):
        conn = self.get_conn()
        # Users Table
        conn.execute("""CREATE TABLE IF NOT EXISTS users (
                     id INTEGER PRIMARY KEY,
                     username TEXT UNIQUE,
                     email TEXT UNIQUE,
                     password_hash TEXT,
                     balance INTEGER,
                     role TEXT DEFAULT user,
                     tg_id TEXT DEFAULT NULL,
                     tg_token TEXT DEFAULT NULL,
                     tg_verify TEXT DEFAULT "False")""")
        
        # Transactions Table
        conn.execute("""CREATE TABLE IF NOT EXISTS transactions (
                     tx_id INTEGER PRIMARY KEY,
                     user_id INTEGER,
                     type TEXT,
                     amount INTEGER,
                     category TEXT,
                     note TEXT,
                     created_at DATETIME)""")
        
        conn.commit()
        conn.close()
    
    ##################################################################
    #                         Users
    ##################################################################
    def user_in_db(self, username: str, email: str) -> tuple[bool, str]:
        """Return (True, "Username") - if username in db. (True, "Email") if email in db. (False, None) - else"""
        conn = self.get_conn()
        # Check user and email exists
        user_username = conn.execute("SELECT id FROM users WHERE username = ?", (username, )).fetchone()
        user_email = conn.execute("SELECT id FROM users WHERE email = ?", (email, )).fetchone()
        conn.close()
        # Returning info
        if user_username:
            return (True, "Username")
        elif user_email:
            return (True, "Email")
        else:
            return (False, None)
    
    def check_user_password(self, login: str, password: str) -> bool:
        conn = self.get_conn()
        # Check login type and getting user
        if "@" in login:
            user_password = conn.execute("SELECT password_hash FROM users WHERE email = ?", (login, )).fetchone()
        else:
            user_password = conn.execute("SELECT password_hash FROM users WHERE username = ?", (login, )).fetchone()
        conn.close()
        # Checking password
        if check_password_hash(user_password[0], password):
            return True
        else:
            return False
    
    def create_user(self, username: str, email: str, password: str) -> tuple[bool, str]:
        """Return tuple (True, "Succes") - if success. (False, Error) - else"""
        conn = self.get_conn()
        try:
            password_hash = generate_password_hash(password)
            conn.execute("INSERT INTO users (username, email, password_hash, balance) VALUES (?, ?, ?, ?)", (username, email, password_hash, 0))
            conn.commit()
            conn.close()
            return (True, "Success")
        except Exception as e:
            conn.close()
            return (False, str(e))

    def get_user_id(self, login: str) -> int:
        """Return tuple (id, username, email)"""
        conn = self.get_conn()
        # Getting user info
        if "@" in login:
            user_id = conn.execute("SELECT id FROM users WHERE email = ?", (login, )).fetchone()
        else:
            user_id = conn.execute("SELECT id FROM users WHERE username = ?", (login, )).fetchone()
        conn.close()
        return int(user_id[0])
    
    def get_user_for_profile(self, user_id: int) -> tuple[str, str, int]:
        """Returning [username, email, balance]"""
        conn = self.get_conn()
        conn.row_factory = sqlite3.Row
        user_data = conn.execute("SELECT username, email, balance FROM users WHERE id = ?", (user_id, )).fetchone()
        return user_data
    
    def check_telegram_verify(self, user_id: int) -> bool:
        """Checking verify telegram"""
        conn = self.get_conn()
        user = conn.execute("SELECT tg_verify FROM users WHERE id = ?", (user_id, )).fetchone()
        if user:
            verify = user[0]
            return True if verify == "True" else False
        

    def get_tg_token(self, user_id) -> str | None:
        conn = self.get_conn()
        # Getting token for current user_id
        token = conn.execute("SELECT tg_token FROM users WHERE id = ?", (user_id, )).fetchone()
        if token:
            return str(token[0])
        else:
            return None

    def tg_token_create(self, user_id: int) -> dict[bool, str, str]:
        """Return example:
        ```{
        "status": True,
        "exception": "None",
        "token": token: str
        }"""
        token = secrets.token_hex(6)
        try:
            conn = self.get_conn()
            conn.execute("UPDATE users SET tg_token = ? WHERE id = ?", (token, user_id))
            conn.commit()
            return {
                "status": True,
                "exception": "None",
                "token": token
            }
        except Exception as e:
            conn.close()
            return {
                "status": False,
                "exception": "None",
                "token": "None"
            }

    def link_tg_user(self, token:str, tg_id: str) -> bool:
        """Linking user's telegram account id to his web-interface"""
        conn = self.get_conn()
        # Get user for current token
        user = conn.execute("SELECT id FROM users WHERE tg_token = ?", (token, )).fetchone()
        if user:
            # Getting user_id if user
            user_id = user[0]
            try:
                conn.execute("""
                    UPDATE users 
                    SET tg_id = ?, tg_verify = 'True', tg_token = NULL 
                    WHERE id = ?
                """, (str(tg_id), user_id))
                conn.commit()
                conn.close()
                return True
            except Exception as e:
                print(f"Error linking: {e}")
                conn.close()
                return False
        conn.close()
        return False

    def search_user_by_tg(self, tg_id: int) -> dict[bool, int | None]:
        """Getting user_id for current tg_id
        ```{
        "status": True | False,
        "id": int | None
        }"""
        conn = self.get_conn()
        user = conn.execute("SELECT id FROM users WHERE tg_id = ?", (tg_id, )).fetchone()
        conn.close()
        if user:
            return {
                "status": True,
                "id": user[0]
            }
        else:
            return {
                "status": False,
                "id": None
            }
    
    def unlink_tg_user(self, user_id: int):
        """Setting tg_verify to "False", automatically create new token, removing tg_id from DB"""
        conn = self.get_conn()
        token_status = self.tg_token_create(user_id)
        if token_status.get("status"):
            token = token_status.get("token")
            try:
                conn.execute("UPDATE users SET tg_id = NULL, tg_token = NULL, tg_verify = ? WHERE id = ?", ("False", user_id))
                conn.commit()
                conn.close()
                return {
                    "status": True,
                    "exception": None
                }
            except Exception as e:
                conn.close()
                return {
                    "status": False,
                    "exception": "Failed to update DB"
                }
        else:
            return {
                "status": False,
                "exception": "Failed to create a token"
            }
    
    ##################################################################
    #                         Transactions
    ##################################################################
    
    def get_all_user_transactions(self, user_id: int) -> list[sqlite3.Row]:
        """Returning list of transactions. Work with row looks like: 
        ```data = get_all_user_transactions(10)
        for row in data:
            print(row["id"])"""
        conn = self.get_conn()
        conn.row_factory = sqlite3.Row
        transactions = conn.execute("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", (user_id, )).fetchall()
        return transactions
    
    def check_user_transaction_access(self, user_id: int, tx_id: int) -> bool:
        """Checking is user the owner of transaction
        ```True | False"""
        conn = self.get_conn()
        # If tx with current id and current user id exists - user have access
        data = conn.execute("SELECT tx_id, user_id FROM transactions WHERE tx_id = ? AND user_id = ?", (tx_id, user_id)).fetchone()
        conn.close()
        if data:
            return True
        else:
            return False
    
    def remove_transaction(self, tx_id: int) -> tuple[bool, str]:
        try:
            conn = self.get_conn()
            user_id = conn.execute("SELECT user_id FROM transactions WHERE tx_id = ?", (tx_id, )).fetchone()[0]
            conn.execute("DELETE FROM transactions WHERE tx_id=?", (tx_id, ))
            conn.commit()
            conn.close()
            self.calculate_new_balance(user_id)
            return (True, "Success")
        except Exception as e:
            return (False, f"Error: {e}")
    
    def create_transaction(self, user_id: int, type: str, amount: int, category: str, note: str | None) -> tuple[bool, str]:
        now = datetime.datetime.now().isoformat(sep=" ", timespec="seconds") # CUrrent date in iso format
        try:
            conn = self.get_conn()
            conn.execute("INSERT INTO transactions (user_id, type, amount, category, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                         (user_id, type, amount, category, note, now))
            conn.commit()
            conn.close()
            self.calculate_new_balance(user_id)
            return (True, "Success")
        except Exception as e:
            return (False, f"Error: {e}")
        
    def get_current_balance(self, user_id: int) -> int:
        conn = self.get_conn()
        balance = conn.execute("SELECT balance FROM users WHERE id = ?", (user_id, )).fetchone()[0]
        conn.close()
        return balance
    
    def calculate_new_balance(self, user_id: int):
        """Updating balance column in db for current user"""
        conn = self.get_conn()
        incomes = []
        expenses = []
        for tx in self.get_all_user_transactions(user_id):
            if tx['type'] == 'income':
                incomes.append(tx['amount'])
            else:
                expenses.append(tx['amount'])

        balance = sum(incomes)-sum(expenses)
        conn.execute("UPDATE users SET balance = ? WHERE id = ?", (balance, user_id))
        conn.commit()
        conn.close()

    def get_user_role(self, user_id: int) -> str:
        conn = self.get_conn()
        role = conn.execute("SELECT role FROM users WHERE id = ?", (user_id, )).fetchone()[0]
        conn.close()
        return role

    def get_all_users(self) -> list[dict]:
        """Returning list of dicts format: 
        ```{
        'id': int,
        'username': str,
        'email': str,
        'balance': int,
        'tx_count': int,
        'role', str
        }"""
        conn = self.get_conn()
        conn.row_factory = sqlite3.Row
        users = conn.execute("SELECT * FROM users").fetchall()
        result_users = []
        for user in users:
            try:
                user_tx_count = conn.execute("SELECT COUNT(*) FROM transactions WHERE user_id = ?", (user['id'], )).fetchone()[0]
                result_users.append({"id": user["id"], "username": user['username'], "email": user['email'], "balance": user['balance'], "tx_count": user_tx_count, "role": user['role']})
            except:
                pass
        
        conn.close()
        return result_users
    
    def edit_user(self, user_id: int, username: str, email: str, role: str) -> tuple[bool, str]:
        conn = self.get_conn()
        try:
            if username is not None:
                conn.execute("UPDATE users SET username = ? WHERE id = ?", (username, user_id))
            if email is not None:
                conn.execute("UPDATE users SET email = ? WHERE id = ?", (email, user_id))
            if role is not None:
                conn.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
            conn.commit()
            conn.close()
            return (True, "success")
        except Exception as e:
            conn.close()
            return (False, str(e))
    
    def delete_user(self, user_id: int) -> tuple[bool, str]:
        conn = self.get_conn()
        try:
            conn.execute("DELETE FROM users WHERE id=?", (user_id, ))
            conn.execute("DELETE FROM transactions WHERE user_id=?", (user_id, ))
            conn.commit()
            conn.close()
            return (True, "success")
        except Exception as e:
            conn.close()
            return (False, str(e))

    def get_last_user_transaction(self, user_id: int) -> dict:
        conn = self.get_conn()
        conn.row_factory = sqlite3.Row
        tx = conn.execute("SELECT * FROM transactions WHERE user_id = ? ORDER BY tx_id DESC LIMIT 1", (user_id, )).fetchone()
        return dict(tx)