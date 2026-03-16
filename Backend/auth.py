import os
import certifi
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError
import httpx

# (If using standard oauth2 flow with ID tokens, we would use `id_token` from google.oauth2, 
# but the easiest flow given react-oauth access_tokens involves httpx fetching standard user info)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

MONGO_URL = os.getenv("MONGO_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
db = client.houseai
users_collection = db.users

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/test-db")
async def test_db():
    try:
        result = await client.admin.command("ping")
        return {"status": "connected", "ping": result}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


class RegisterRequest(BaseModel):
    name: str = ""
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    token: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class UpdateProfileRequest(BaseModel):
    name: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    name: str
    email: str
    created_at: str


def create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register")
async def register(data: RegisterRequest):
    existing = await users_collection.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    final_name = data.name.strip() if data.name.strip() else data.email.split("@")[0]
    email = data.email.lower().strip()
    password_hash = pwd_context.hash(data.password)

    user_data = {
        "name": final_name,
        "email": email,
        "password_hash": password_hash,
        "plan": "free",
        "icon": "User",
        "created_at": datetime.utcnow().isoformat()
    }
    await users_collection.insert_one(user_data)

    token = create_token(email)
    return {
        "token": token,
        "user": {"name": final_name, "email": email, "icon": "User"},
    }


@router.post("/login")
async def login(data: LoginRequest):
    user = await users_collection.find_one({"email": data.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["email"])
    return {
        "token": token,
        "user": {
            "name": user["name"], 
            "email": user["email"],
            "icon": user.get("icon", "User")
        },
    }

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    user = await users_collection.find_one({"email": data.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that email address.")
    
    # If they only signed up with google, they can't reset password this way
    if user.get("google_auth"):
        raise HTTPException(status_code=400, detail="This account uses Google Login. Please sign in with Google.")

    new_hash = pwd_context.hash(data.new_password)
    await users_collection.update_one(
        {"email": user["email"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password successfully reset."}

@router.post("/google_login")
async def google_login(data: GoogleLoginRequest):
    async with httpx.AsyncClient() as client:
        # Get user details from Google using the access_token
        google_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {data.token}"}
        )
    
    if google_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
        
    google_user = google_response.json()
    email = google_user.get("email").lower().strip()
    name = google_user.get("name")
    
    user = await users_collection.find_one({"email": email})
    
    # Implicit register if not exists
    if not user:
        # Since they logged in with Google, give them a randomly generated strong password hash
        # They will only log in with Google, but have the option to reset later if we add that flow
        import secrets
        random_password = secrets.token_urlsafe(16)
        password_hash = pwd_context.hash(random_password)

        user_data = {
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "plan": "free",
            "icon": "User",
            "created_at": datetime.utcnow().isoformat(),
            "google_auth": True
        }
        await users_collection.insert_one(user_data)
        user = user_data # Setup variable for token return

    token = create_token(email)
    return {
        "token": token,
        "user": {
            "name": user["name"], 
            "email": user["email"],
            "icon": user.get("icon", "User")
        },
    }


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "name": user["name"],
        "email": user["email"],
        "icon": user.get("icon", "User"),
        "created_at": user.get("created_at", ""),
    }

@router.post("/update-profile")
async def update_profile(data: UpdateProfileRequest, user=Depends(get_current_user)):
    await users_collection.update_one(
        {"email": user["email"]},
        {"$set": {"name": data.name.strip()}}
    )
    return {"message": "Username updated successfully"}

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, user=Depends(get_current_user)):
    if not pwd_context.verify(data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    new_hash = pwd_context.hash(data.new_password)
    await users_collection.update_one(
        {"email": user["email"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password changed successfully"}
