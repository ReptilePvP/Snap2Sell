import requests
import json
import base64
import os
import sys

def test_openlens_endpoints():
    """Test both the direct API and Supabase edge function endpoints"""
    
    # Configuration
    CLOUD_RUN_URL = "https://snap2sell-openlens-156064765830.us-central1.run.app"
    SUPABASE_URL = "https://lzkqrsbezfcxrbdfijwi.supabase.co"
    SUPABASE_ANON_KEY = "your-anon-key-here"  # Replace with actual key
    
    # Test image URL from Supabase storage
    TEST_IMAGE_URL = "https://lzkqrsbezfcxrbdfijwi.supabase.co/storage/v1/object/public/images/test-image.jpg"
    
    print("🧪 Testing OpenLens Architecture Optimization")
    print("=" * 50)
    
    # Test 1: Direct Cloud Run API with URL endpoint
    print("\n1️⃣ Testing Cloud Run API /analyze-url endpoint...")
    try:
        response = requests.post(
            f"{CLOUD_RUN_URL}/analyze-url",
            json={"imageUrl": TEST_IMAGE_URL},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Cloud Run URL endpoint working!")
            print(f"   Request ID: {result.get('request_id', 'N/A')}")
            print(f"   Analysis length: {len(result.get('analysis', ''))}")
            print(f"   Links found: {result.get('google_lens_links_found', 'N/A')}")
        else:
            print(f"❌ Cloud Run API failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Cloud Run API error: {e}")
    
    # Test 2: Supabase Edge Function
    print("\n2️⃣ Testing Supabase Edge Function...")
    try:
        headers = {
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/web-analyze-openlens",
            json={"imageUrl": TEST_IMAGE_URL},
            headers=headers,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Supabase Edge Function working!")
                data = result.get('data', {})
                print(f"   Analysis ID: {data.get('id', 'N/A')}")
                print(f"   Title: {data.get('title', 'N/A')}")
                print(f"   API Provider: {data.get('apiProvider', 'N/A')}")
            else:
                print(f"❌ Edge Function returned error: {result.get('error', 'Unknown')}")
        else:
            print(f"❌ Edge Function failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Edge Function error: {e}")
    
    # Test 3: Health check
    print("\n3️⃣ Testing Cloud Run health...")
    try:
        response = requests.get(f"{CLOUD_RUN_URL}/", timeout=10)
        if response.status_code == 200:
            print("✅ Cloud Run service is healthy!")
            print(f"   Message: {response.json().get('message', 'N/A')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")
    print("\nNext steps:")
    print("1. Deploy your updated Cloud Run service")
    print("2. Update your Supabase Edge Function via dashboard")
    print("3. Test the frontend integration")

if __name__ == "__main__":
    test_openlens_endpoints()
