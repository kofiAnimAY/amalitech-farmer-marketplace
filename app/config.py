import logging
from os import environ
from dotenv import load_dotenv
import os

load_dotenv()  # load from .env file if exists

def get_required_environ(name: str, default=None) -> str:
    value = environ.get(name, default)
    if value is None:
        logging.warning(f"Environment variable {name} is not set, using default: {default}")
        return default
    if len(value.strip()) == 0:
        raise ValueError(f"Required environment variable {name} cannot be empty")
    return value

class Config(object):
    MONGO_URI = get_required_environ("MONGO_URI", "mongodb://localhost:27017/testdb")
    DB_NAME = get_required_environ("DB_NAME", "testdb")
    MOCK_DB = get_required_environ("MOCK_DB", "true").lower() == "true"
    DEBUG = get_required_environ("DEBUG", "true").lower() == "true"

class ProductionConfig(Config):
    DEBUG = False
    MOCK_DB = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    MOCK_DB = True
    DB_NAME = "testdb"
