from fastapi import FastAPI
from app.database import Base, engine
from app.routers.auth_router import router as auth_router
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedNest API",
    description="WhatsApp medicine reminder app for elderly patients",
    version="1.0.0",
)
app.include_router(auth_router)

@app.get('/')
def root():
    return {
        "message" : "API Running!"
    }