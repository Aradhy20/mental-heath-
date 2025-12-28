"""
Form Validation Utilities
Provides comprehensive validation for all form inputs
"""

import re
from typing import Optional, Dict, List
from pydantic import BaseModel, validator, EmailStr


class ValidationError(BaseModel):
    field: str
    message: str


class ValidationResult(BaseModel):
    valid: bool
    errors: List[ValidationError] = []


class Validators:
    """Collection of validation functions"""
    
    @staticmethod
    def validate_email(email: str) -> ValidationResult:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return ValidationResult(
                valid=False,
                errors=[ValidationError(field="email", message="Invalid email format")]
            )
        return ValidationResult(valid=True)
    
    @staticmethod
    def validate_password(password: str) -> ValidationResult:
        """
        Validate password strength
        Requirements:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        - At least one special character
        """
        errors = []
        
        if len(password) < 8:
            errors.append(ValidationError(
                field="password",
                message="Password must be at least 8 characters long"
            ))
        
        if not re.search(r'[A-Z]', password):
            errors.append(ValidationError(
                field="password",
                message="Password must contain at least one uppercase letter"
            ))
        
        if not re.search(r'[a-z]', password):
            errors.append(ValidationError(
                field="password",
                message="Password must contain at least one lowercase letter"
            ))
        
        if not re.search(r'\d', password):
            errors.append(ValidationError(
                field="password",
                message="Password must contain at least one number"
            ))
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(ValidationError(
                field="password",
                message="Password must contain at least one special character"
            ))
        
        return ValidationResult(valid=len(errors) == 0, errors=errors)
    
    @staticmethod
    def validate_username(username: str) -> ValidationResult:
        """Validate username format"""
        errors = []
        
        if len(username) < 3:
            errors.append(ValidationError(
                field="username",
                message="Username must be at least 3 characters long"
            ))
        
        if len(username) > 30:
            errors.append(ValidationError(
                field="username",
                message="Username must be at most 30 characters long"
            ))
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            errors.append(ValidationError(
                field="username",
                message="Username can only contain letters, numbers, and underscores"
            ))
        
        return ValidationResult(valid=len(errors) == 0, errors=errors)
    
    @staticmethod
    def validate_phone(phone: str) -> ValidationResult:
        """Validate phone number format"""
        # Remove common separators
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Check if it's a valid phone number (10-15 digits)
        if not re.match(r'^\+?\d{10,15}$', cleaned):
            return ValidationResult(
                valid=False,
                errors=[ValidationError(
                    field="phone",
                    message="Invalid phone number format"
                )]
            )
        
        return ValidationResult(valid=True)
    
    @staticmethod
    def validate_age(age: int) -> ValidationResult:
        """Validate age"""
        if age < 13:
            return ValidationResult(
                valid=False,
                errors=[ValidationError(
                    field="age",
                    message="You must be at least 13 years old"
                )]
            )
        
        if age > 120:
            return ValidationResult(
                valid=False,
                errors=[ValidationError(
                    field="age",
                    message="Please enter a valid age"
                )]
            )
        
        return ValidationResult(valid=True)
    
    @staticmethod
    def validate_text_length(text: str, min_length: int = 0, max_length: int = 5000, field_name: str = "text") -> ValidationResult:
        """Validate text length"""
        errors = []
        
        if len(text) < min_length:
            errors.append(ValidationError(
                field=field_name,
                message=f"{field_name.capitalize()} must be at least {min_length} characters long"
            ))
        
        if len(text) > max_length:
            errors.append(ValidationError(
                field=field_name,
                message=f"{field_name.capitalize()} must be at most {max_length} characters long"
            ))
        
        return ValidationResult(valid=len(errors) == 0, errors=errors)
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitize user input to prevent XSS"""
        # Remove HTML tags
        text = re.sub(r'<[^>]*>', '', text)
        
        # Remove script tags and content
        text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove event handlers
        text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
        
        # Remove javascript: protocol
        text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
        
        return text.strip()


# Global validator instance
validators = Validators()
