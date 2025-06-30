#!/usr/bin/env python3
"""
Simple test script to check if the FastAPI app can start
"""
import os
import sys
sys.path.append('/app/src')

def test_imports():
    """Test if all imports work"""
    try:
        print("Testing basic imports...")
        from fastapi import FastAPI
        print("✓ FastAPI import successful")
        
        import uvicorn
        print("✓ Uvicorn import successful")
        
        import requests
        print("✓ Requests import successful")
        
        print("Testing app imports...")
        from config import Config
        print("✓ Config import successful")
        
        # Test if we can create FastAPI app
        app = FastAPI()
        print("✓ FastAPI app creation successful")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_environment():
    """Test environment variables"""
    print("Testing environment variables...")
    port = os.environ.get('PORT', 'Not set')
    openai_key = os.environ.get('OPENAI_API_KEY', 'Not set')
    
    print(f"PORT: {port}")
    print(f"OPENAI_API_KEY: {'Set' if openai_key != 'Not set' else 'Not set'}")
    
    return True

if __name__ == "__main__":
    print("=== Railway Environment Test ===")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    
    success = test_imports() and test_environment()
    
    if success:
        print("✓ All tests passed! App should be able to start.")
        sys.exit(0)
    else:
        print("✗ Tests failed!")
        sys.exit(1)
