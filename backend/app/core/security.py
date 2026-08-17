import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_text: str, hash_pass: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_text.encode('utf-8'),
            hash_pass.encode('utf-8')
        )
    except ValueError:
        return False
