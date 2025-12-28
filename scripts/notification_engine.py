import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables for credentials
load_dotenv()

class NotificationEngine:
    """
    Professional Notification Engine for Mental Health App
    Supports Gmail (SMTP) and Twilio (SMS)
    """
    
    def __init__(self):
        self.gmail_user = os.getenv("GMAIL_USER")
        self.gmail_password = os.getenv("GMAIL_APP_PASSWORD") # Use App Password for Gmail
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

    def send_gmail_otp(self, receiver_email, otp_code):
        """Send OTP via Gmail SMTP"""
        if not self.gmail_user or not self.gmail_password:
            print("❌ Gmail credentials missing in .env")
            return False

        message = MIMEMultipart("alternative")
        message["Subject"] = "🔐 Your MindfulAI Security Code"
        message["From"] = f"MindfulAI Security <{self.gmail_user}>"
        message["To"] = receiver_email

        html = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <h2 style="color: #6366f1; margin-bottom: 20px;">Identity Verification</h2>
                    <p style="color: #475569; font-size: 16px;">Hello,</p>
                    <p style="color: #475569; font-size: 16px;">Use the following code to complete your secure authentication session. This code will expire in 10 minutes.</p>
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">{otp_code}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">If you did not request this code, please ignore this email or contact security support.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="text-align: center; color: #6366f1; font-weight: bold;">MindfulAI Protocol V3.0</p>
                </div>
            </body>
        </html>
        """
        
        message.attach(MIMEText(html, "html"))

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(self.gmail_user, self.gmail_password)
                server.sendmail(self.gmail_user, receiver_email, message.as_string())
            print(f"✅ OTP sent to {receiver_email} via Gmail")
            return True
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False

    def send_sms_otp(self, receiver_phone, otp_code):
        """Send OTP via Twilio SMS"""
        if not all([self.twilio_sid, self.twilio_token, self.twilio_phone]):
            print("❌ Twilio credentials missing in .env")
            # Fallback to console log for development
            print(f"DEBUG [SMS]: Sending code {otp_code} to {receiver_phone}")
            return True

        try:
            from twilio.rest import Client
            client = Client(self.twilio_sid, self.twilio_token)
            
            message = client.messages.create(
                body=f"Your MindfulAI verification code is: {otp_code}. Valid for 10 minutes.",
                from_=self.twilio_phone,
                to=receiver_phone
            )
            print(f"✅ SMS sent to {receiver_phone} (SID: {message.sid})")
            return True
        except ImportError:
            print("❌ Twilio library not installed. run 'pip install twilio'")
            return False
        except Exception as e:
            print(f"❌ Failed to send SMS: {e}")
            return False

if __name__ == "__main__":
    # Test script
    engine = NotificationEngine()
    print("--- Notification Engine Test ---")
    
    choice = input("Send test (1: Gmail, 2: SMS): ")
    target = input("Enter Email/Phone: ")
    
    if choice == "1":
        engine.send_gmail_otp(target, "123456")
    elif choice == "2":
        engine.send_sms_otp(target, "123456")
