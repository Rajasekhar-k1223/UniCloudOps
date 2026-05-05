import os
import re
import sys
import pymysql
import redis
from pymongo import MongoClient

def parse_env():
    env_path = ".env"
    if not os.path.exists(env_path):
        print(f"Error: {env_path} not found in {os.getcwd()}")
        return None
    
    with open(env_path, "r") as f:
        return f.read()

def test_mysql(env_content):
    print("--- [1/3] MySQL Health Check ---")
    match = re.search(r"DATABASE_URL=mysql\+pymysql://(.*?):(.*?)@(.*?):(.*?)/(.*)", env_content)
    if not match:
        print("FAIL: Could not parse DATABASE_URL")
        return False
    
    try:
        connection = pymysql.connect(
            host="localhost",
            user=match.group(1),
            password=match.group(2).replace("%23", "#"),
            port=int(match.group(4)),
            database=match.group(5)
        )
        print(f"SUCCESS: Connected to MySQL ({match.group(5)})")
        connection.close()
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False

def test_mongo(env_content):
    print("\n--- [2/3] MongoDB Health Check ---")
    match = re.search(r"MONGO_URL=(.*)", env_content)
    if not match:
        print("FAIL: Could not parse MONGO_URL")
        return False
    
    url = match.group(1).replace("host.docker.internal", "localhost")
    try:
        client = MongoClient(url, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB")
        client.close()
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False

def test_redis(env_content):
    print("\n--- [3/3] Redis Health Check ---")
    match = re.search(r"REDIS_URL=(.*)", env_content)
    if not match:
        print("FAIL: Could not parse REDIS_URL")
        return False
    
    url = match.group(1).replace("host.docker.internal", "localhost")
    try:
        r = redis.from_url(url)
        r.ping()
        print("SUCCESS: Connected to Redis")
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False

if __name__ == "__main__":
    content = parse_env()
    if content:
        m_ok = test_mysql(content)
        mo_ok = test_mongo(content)
        r_ok = test_redis(content)
        
        print("\n" + "="*30)
        if all([m_ok, mo_ok, r_ok]):
            print("GLOBAL SYSTEM STATUS: [ HEALTHY ]")
        else:
            print("GLOBAL SYSTEM STATUS: [ DEGRADED ]")
        print("="*30)
