from fastapi import FastAPI
from app.database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedNest API",
    description="WhatsApp medicine reminder app for elderly patients",
    version="1.0.0",
)

@app.get('/')
def root():
    return {
        "message" : "API Running!"
    }