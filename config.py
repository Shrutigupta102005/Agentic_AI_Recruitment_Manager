import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database - Using SQLite (No installation needed!)
    USE_SQLITE = True
    SQLITE_DB_PATH = 'recruitment.db'
    
    # LLM
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    LLM_MODEL = os.getenv('LLM_MODEL', 'gpt-4')
    
    # Paths
    UPLOAD_FOLDER_JD = 'uploads/jd'
    UPLOAD_FOLDER_RESUME = 'uploads/resumes'
    LOG_FOLDER = 'logs'
    
    # Create folders if they don't exist
    os.makedirs(UPLOAD_FOLDER_JD, exist_ok=True)
    os.makedirs(UPLOAD_FOLDER_RESUME, exist_ok=True)
    os.makedirs(LOG_FOLDER, exist_ok=True)