import argparse
import getpass
import sys
from pathlib import Path

# Add backend directory to path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User


def create_admin(name: str, email: str, password: str) -> None:
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email.strip().lower()).first()
        if existing_user:
            print(f"Error: User with email '{email}' already exists.")
            sys.exit(1)

        admin = User(
            name=name.strip(),
            email=email.strip().lower(),
            password_hash=hash_password(password),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Admin user created successfully (ID: {admin.id}, Email: {admin.email}).")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create an admin/initial user in the database.")
    parser.add_argument("--name", type=str, help="User's full name")
    parser.add_argument("--email", type=str, help="User's email address")
    parser.add_argument("--password", type=str, help="User password (will prompt if omitted)")

    args = parser.parse_args()

    name = args.name or input("Full Name: ").strip()
    email = args.email or input("Email: ").strip()
    password = args.password or getpass.getpass("Password: ")

    if not name or not email or not password:
        print("Error: Name, email, and password must not be empty.")
        sys.exit(1)

    create_admin(name=name, email=email, password=password)


if __name__ == "__main__":
    main()

