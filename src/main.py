from fastapi import FastAPI
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Hivebox"
    version: str
    env: str = "development"

    # This tells Pydantic where to look for the .env file
    model_config = SettingsConfigDict(env_file=".env")

# initialize app settings
settings = Settings()

app = FastAPI()

@app.get("/api")
async def root():
    return {"message": "Hello World"}

@app.get("/api/info")
async def getInfo():
    return {
        "app_name": settings.app_name,
        "version": settings.version,
        "environment": settings.env
    }

@app.get("/api/version")
async def getVersion():
    return { "version": settings.version }
