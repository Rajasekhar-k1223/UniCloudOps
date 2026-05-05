from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UniCloudOps"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    DATABASE_URL: str
    MONGO_URL: str
    REDIS_URL: str
    ENVIRONMENT: str = "development"
    AUTO_SEED_DATA: bool = True
    AUTO_SEED_ADMIN: bool = True
    DEFAULT_ADMIN_EMAIL: str = "admin@unicloudops.com"
    DEFAULT_ADMIN_PASSWORD: str = "change-me"
    
    # Optional secrets that may be stored here or per-account
    DOCKER_HOST: str = "unix:///var/run/docker.sock"
    
    class Config:
        env_file = ".env"

settings = Settings()
