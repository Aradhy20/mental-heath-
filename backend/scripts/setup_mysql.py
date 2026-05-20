import pymysql
import sys

def setup_db():
    try:
        # Connect to MySQL Server
        conn = pymysql.connect(
            user='root',
            password='12345678',
            host='127.0.0.1',
            port=3306
        )
        
        cursor = conn.cursor()
        
        # Check if database mindful_ai exists
        cursor.execute("SHOW DATABASES LIKE 'mindful_ai'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Creating database 'mindful_ai'...")
            cursor.execute('CREATE DATABASE mindful_ai')
            print("✅ Database 'mindful_ai' created successfully!")
        else:
            print("✨ Database 'mindful_ai' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error setting up MySQL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_db()
