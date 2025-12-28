"""
SQL Injection Prevention Utilities
Provides safe database query helpers
"""

from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, List, Any
import re


class SafeQueryBuilder:
    """Build safe SQL queries with parameterization"""
    
    @staticmethod
    def sanitize_table_name(table_name: str) -> str:
        """
        Sanitize table name to prevent SQL injection
        Only allows alphanumeric characters and underscores
        """
        if not re.match(r'^[a-zA-Z0-9_]+$', table_name):
            raise ValueError(f"Invalid table name: {table_name}")
        return table_name
    
    @staticmethod
    def sanitize_column_name(column_name: str) -> str:
        """
        Sanitize column name to prevent SQL injection
        Only allows alphanumeric characters and underscores
        """
        if not re.match(r'^[a-zA-Z0-9_]+$', column_name):
            raise ValueError(f"Invalid column name: {column_name}")
        return column_name
    
    @staticmethod
    def build_select_query(
        table: str,
        columns: List[str] = None,
        where: Dict[str, Any] = None,
        order_by: str = None,
        limit: int = None
    ) -> tuple[str, Dict[str, Any]]:
        """
        Build a safe SELECT query with parameterization
        
        Returns: (query_string, parameters)
        """
        # Sanitize table name
        table = SafeQueryBuilder.sanitize_table_name(table)
        
        # Build column list
        if columns:
            columns = [SafeQueryBuilder.sanitize_column_name(col) for col in columns]
            column_str = ", ".join(columns)
        else:
            column_str = "*"
        
        # Start query
        query = f"SELECT {column_str} FROM {table}"
        params = {}
        
        # Add WHERE clause
        if where:
            where_clauses = []
            for key, value in where.items():
                safe_key = SafeQueryBuilder.sanitize_column_name(key)
                param_name = f"param_{key}"
                where_clauses.append(f"{safe_key} = :{param_name}")
                params[param_name] = value
            
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add ORDER BY
        if order_by:
            safe_order = SafeQueryBuilder.sanitize_column_name(order_by)
            query += f" ORDER BY {safe_order}"
        
        # Add LIMIT
        if limit:
            query += f" LIMIT :limit"
            params["limit"] = int(limit)
        
        return query, params
    
    @staticmethod
    def execute_safe_query(db: Session, query: str, params: Dict[str, Any]) -> List:
        """Execute a parameterized query safely"""
        result = db.execute(text(query), params)
        return result.fetchall()


# Best practices for preventing SQL injection
SQL_INJECTION_PREVENTION_GUIDE = """
# SQL Injection Prevention Best Practices

1. **Always use parameterized queries**
   ✅ GOOD: db.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_id})
   ❌ BAD:  db.execute(f"SELECT * FROM users WHERE id = {user_id}")

2. **Use ORM methods when possible**
   ✅ GOOD: db.query(User).filter(User.id == user_id).first()
   ❌ BAD:  db.execute(f"SELECT * FROM users WHERE id = {user_id}")

3. **Sanitize table and column names**
   - Never accept user input directly for table/column names
   - Use whitelist validation
   - Use SafeQueryBuilder for dynamic queries

4. **Validate and sanitize all user input**
   - Use Pydantic models for validation
   - Implement input length limits
   - Reject suspicious patterns

5. **Use least privilege database accounts**
   - Application should not use root/admin accounts
   - Grant only necessary permissions
   - Use read-only accounts where possible

6. **Enable query logging in development**
   - Monitor for suspicious queries
   - Test with SQL injection payloads
   - Use automated security scanners
"""


# Example usage
def example_safe_queries():
    """Examples of safe database queries"""
    
    # Example 1: Safe SELECT with ORM
    # user = db.query(User).filter(User.email == email).first()
    
    # Example 2: Safe SELECT with parameterized query
    # query = text("SELECT * FROM users WHERE email = :email")
    # result = db.execute(query, {"email": email})
    
    # Example 3: Safe INSERT with ORM
    # new_user = User(email=email, username=username)
    # db.add(new_user)
    # db.commit()
    
    # Example 4: Safe UPDATE with parameterized query
    # query = text("UPDATE users SET last_login = :time WHERE id = :id")
    # db.execute(query, {"time": datetime.utcnow(), "id": user_id})
    
    pass
