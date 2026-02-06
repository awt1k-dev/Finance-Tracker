from database import Database
db = Database()
conn = db.get_conn()
conn.execute("UPDATE users SET role = ? WHERE id = ?", ('admin', 1))
conn.commit()
conn.close()