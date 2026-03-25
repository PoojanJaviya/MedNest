from fastapi import FastAPI
from app.database import Base, engine
from app.routers.auth_router import router as auth_router
from app.routers.patient_router import router as patient_router
from app.routers.medicine_router import router as medicine_router
from app.routers.schedule_router import router as schedule_router
from app import models
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedNest API",
    description="WhatsApp medicine reminder app for elderly patients",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev server port
    allow_credentials=True,
    allow_methods=["*"],   # allows OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(medicine_router)
app.include_router(schedule_router)

@app.get('/')
def root():
    return {
        "message" : "API Running!"
    }