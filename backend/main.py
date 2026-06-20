from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
from routes import chat, scam, simulator, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ArthaRakshak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(scam.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
@app.get("/")
def root():
    return {"status": "ArthaRakshak backend is running"}