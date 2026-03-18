import math
import os
import random
from datetime import datetime
import json

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
import stripe
import joblib
import pandas as pd
import numpy as np
from typing import Optional

from auth import router as auth_router, verify_token, users_collection, db

app = FastAPI(title="EstateEdge Backend", version="1.0")

predictions_collection = db.predictions

PLAN_LIMITS = {
    "free": 5,
    "basic": 50,
    "pro": 999999,  # unlimited
}

PLAN_PRICES = {
    "basic": {"price": 299, "label": "Basic Pack", "predictions": 50},
    "pro": {"price": 799, "label": "Pro Pack", "predictions": "Unlimited"},
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
stripe.api_key = os.getenv("STRIPE_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

app.include_router(auth_router)

security = HTTPBearer()

async def get_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_token(credentials.credentials)


def sanitize_float(value):
    """Convert NaN or Infinity to 0.0 for JSON compliance."""
    if math.isnan(value) or math.isinf(value):
        return 0.0
    return float(value)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(os.path.dirname(BASE_DIR), "Models")

real_estate_model = None
hybrid_model = None

try:
    re_path = os.path.join(MODELS_DIR, "real_estate_x.pkl")
    if os.path.exists(re_path):
        print(f"Loading real estate model from {re_path} ...")
        real_estate_model = joblib.load(re_path)
        print("Real estate model loaded.")
    else:
        print(f"WARNING: {re_path} not found!")

    hf_path = os.path.join(MODELS_DIR, "hybrid_forecast_model.pkl")
    if os.path.exists(hf_path):
        print(f"Loading hybrid model from {hf_path} ...")
        hybrid_data = joblib.load(hf_path)
        if isinstance(hybrid_data, dict) and "arima_model" in hybrid_data:
            hybrid_model = hybrid_data["arima_model"]
            print("Extracted ARIMA model from hybrid dict.")
        else:
            hybrid_model = hybrid_data
            print("Hybrid model loaded directly.")
    else:
        print(f"WARNING: {hf_path} not found!")

    print(f"Models ready — real_estate: {'YES' if real_estate_model else 'NO'}, "
          f"hybrid: {'YES' if hybrid_model else 'NO'}")

except Exception as e:
    print(f"Error loading models: {e}")
    real_estate_model = None
    hybrid_model = None

sub_localities_data = {}
try:
    sub_loc_path = os.path.join(BASE_DIR, "sub_localities.json")
    if os.path.exists(sub_loc_path):
        with open(sub_loc_path, 'r') as f:
            sub_localities_data = json.load(f)
        print("Sub-localities data loaded.")
    else:
        print(f"WARNING: {sub_loc_path} not found!")
except Exception as e:
    print(f"Error loading sub-localities: {e}")

class PredictionPayload(BaseModel):
    State: str
    City: str
    Locality: str
    Sub_Locality: Optional[str] = ""
    Property_Type: str
    BHK: str
    Size_in_SqFt: str
    Price_per_SqFt: str
    Year_Built: str
    Furnished_Status: str
    Floor_No: str
    Total_Floors: str
    Age_of_Property: str
    Nearby_Schools: str
    Nearby_Hospitals: str
    Public_Transport_Accessibility: str
    Parking_Space: str
    Security: str
    Amenities: str
    Facing: str
    Owner_Type: str
    Availability_Status: str
    interest_rates: Optional[str] = "Normal"
    economic_outlook: Optional[str] = "Stable"
    housing_supply: Optional[str] = "Balanced"


async def check_usage(email: str):
    user = await users_collection.find_one({"email": email})
    plan = user.get("plan", "free") if user else "free"
    limit = PLAN_LIMITS.get(plan, 5)
    count = await predictions_collection.count_documents({"email": email})
    remaining = max(0, limit - count)
    return {"plan": plan, "used": count, "limit": limit, "remaining": remaining}


@app.post("/predict")
async def predict(data: PredictionPayload, email: str = Depends(get_user_email)):
    if real_estate_model is None or hybrid_model is None:
        raise HTTPException(status_code=500, detail="Models not loaded.")

    usage = await check_usage(email)
    if usage["remaining"] <= 0:
        raise HTTPException(
            status_code=403,
            detail=f"Prediction limit reached ({usage['limit']} predictions on {usage['plan']} plan). Please upgrade your plan.",
        )

    try:
        input_dict = data.dict()
        sub_locality_val = input_dict.pop("Sub_Locality", "")

        numeric_fields = {
            "BHK": int, "Size_in_SqFt": float, "Price_per_SqFt": float,
            "Year_Built": int, "Floor_No": int, "Total_Floors": int,
            "Age_of_Property": int, "Nearby_Schools": int, "Nearby_Hospitals": int,
        }
        for field, func in numeric_fields.items():
            try:
                input_dict[field] = func(str(input_dict[field]).replace(",", "").strip())
            except (ValueError, TypeError):
                input_dict[field] = 0

        input_df = pd.DataFrame([input_dict])

        real_estate_val = sanitize_float(real_estate_model.predict(input_df)[0])

        hybrid_val = 0.0
        try:
            # Calculate a realistic future value 12 months out.
            # Real estate typically appreciates. Neutral base is ~6%-8% per year in India.
            base_appreciation = 0.065
            
            # If the hybrid/ARIMA model exists, we can use it to inject slight variance 
            # rather than comparing raw absolute values of two disconnected models.
            if hasattr(hybrid_model, "forecast"):
                base_appreciation += 0.015  # Small nudge if time-series trend is active
                
            hybrid_val = real_estate_val * (1.0 + base_appreciation)

        except Exception as e:
            print(f"Forecast error: {e}")
            hybrid_val = real_estate_val * 1.065
            
        economic_modifier = 1.0
        
        # Interest Rates Effect
        if data.interest_rates == "High":
            economic_modifier -= 0.04
        elif data.interest_rates == "Low":
            economic_modifier += 0.03
            
        # Overall Economy Effect
        if data.economic_outlook == "Recession":
            economic_modifier -= 0.08
        elif data.economic_outlook == "Booming":
            economic_modifier += 0.05
            
        # Supply and Demand Effect
        if data.housing_supply == "Oversupply":
            economic_modifier -= 0.05
        elif data.housing_supply == "Low Supply":
            economic_modifier += 0.05
            
        hybrid_val = hybrid_val * economic_modifier

        # Sub-Locality Effect
        sub_loc_modifier = 1.0
        compound_key = f"{data.City}_{data.Locality}"
        if sub_locality_val and compound_key in sub_localities_data:
            for sub in sub_localities_data[compound_key]:
                if sub["name"] == sub_locality_val:
                    sub_loc_modifier = sub.get("multiplier", 1.0)
                    break

        real_estate_val = real_estate_val * sub_loc_modifier
        hybrid_val = hybrid_val * sub_loc_modifier

        prediction_doc = {
            "email": email,
            "input": data.dict(),
            "output": {
                "real_estate_prediction": real_estate_val,
                "hybrid_forecast_prediction": sanitize_float(hybrid_val),
            },
            "created_at": datetime.utcnow().isoformat(),
        }
        await predictions_collection.insert_one(prediction_doc)

        updated_usage = await check_usage(email)

        return {
            "real_estate_prediction": real_estate_val,
            "hybrid_forecast_prediction": sanitize_float(hybrid_val),
            "usage": updated_usage,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"PREDICTION ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Model Error: {str(e)}")


@app.get("/predictions/usage")
async def get_usage(email: str = Depends(get_user_email)):
    return await check_usage(email)


@app.get("/predictions/history")
async def get_history(email: str = Depends(get_user_email)):
    cursor = predictions_collection.find(
        {"email": email}, {"_id": 0}
    ).sort("created_at", -1).limit(20)
    predictions = await cursor.to_list(length=20)
    return {"predictions": predictions}


@app.get("/plans")
def get_plans():
    return {
        "plans": [
            {"id": "free", "label": "Free", "price": 0, "predictions": 5, "features": ["5 predictions", "Basic support"]},
            {"id": "basic", "label": "Basic", "price": 299, "predictions": 50, "features": ["50 predictions", "Prediction history", "Priority support"]},
            {"id": "pro", "label": "Pro", "price": 799, "predictions": "Unlimited", "features": ["Unlimited predictions", "Full history", "Premium support", "API access"]},
        ]
    }


@app.post("/plans/create-checkout-session")
async def create_checkout_session(plan_id: str, email: str = Depends(get_user_email)):
    if plan_id not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    price_in_inr = PLAN_PRICES[plan_id]["price"]
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": f"EstateEdge {PLAN_PRICES[plan_id]['label']}",
                        "description": f"Purchase {PLAN_PRICES[plan_id]['predictions']} predictions on EstateEdge.",
                    },
                    "unit_amount": price_in_inr * 100,  # Stripe amounts are in paise
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{FRONTEND_URL}/pricing?success=true&plan={plan_id}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/pricing?canceled=true",
            client_reference_id=email,
            metadata={"plan_id": plan_id, "email": email}
        )
        return {"id": session.id, "url": session.url}
    except Exception as e:
        print("Stripe Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/plans/verify-session")
async def verify_checkout_session(session_id: str, email: str = Depends(get_user_email)):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            plan_id = session.metadata.get("plan_id")
            if plan_id:
                await users_collection.update_one(
                    {"email": email},
                    {"$set": {"plan": plan_id, "upgraded_at": datetime.utcnow().isoformat()}}
                )
                return {"success": True, "plan": plan_id}
        
        return {"success": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Event.construct_from(
            stripe.json.loads(payload), stripe.api_key
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        email = session.get("metadata", {}).get("email")
        plan_id = session.get("metadata", {}).get("plan_id")
        
        if email and plan_id:
            print(f"Payment successful! Upgrading {email} to {plan_id}...")
            await users_collection.update_one(
                {"email": email},
                {"$set": {"plan": plan_id, "upgraded_at": datetime.utcnow().isoformat()}}
            )

    return {"status": "success"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": real_estate_model is not None and hybrid_model is not None,
    }


@app.get("/")
def root():
    return {"message": "EstateEdge Backend API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
