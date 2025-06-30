import requests
import json

def test_new_openlens_endpoint():
    """Quick test of the new OpenLens /analyze-url endpoint"""
    
    # Test URL - using a public test image
    TEST_IMAGE_URL = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"
    OPENLENS_URL = "https://snap2sell-openlens-cdaacmjrpq-uc.a.run.app"
    
    print("🧪 Testing new OpenLens /analyze-url endpoint...")
    print(f"Service URL: {OPENLENS_URL}")
    print(f"Test Image: {TEST_IMAGE_URL}")
    print("-" * 50)
    
    try:
        # Test the new analyze-url endpoint
        response = requests.post(
            f"{OPENLENS_URL}/analyze-url",
            json={"imageUrl": TEST_IMAGE_URL},
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Response received:")
            print(f"  Request ID: {result.get('request_id', 'N/A')}")
            print(f"  Analysis Length: {len(result.get('analysis', ''))}")
            print(f"  Google Lens Links: {result.get('google_lens_links_found', 'N/A')}")
            print(f"  Scraped Content Length: {result.get('scraped_content_length', 'N/A')}")
            
            # Show first 200 chars of analysis
            analysis = result.get('analysis', '')
            if analysis:
                preview = analysis[:200] + "..." if len(analysis) > 200 else analysis
                print(f"  Analysis Preview: {preview}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out (this is normal for first request - cold start)")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ OpenLens Cloud Run deployment test completed!")
    print("\n📋 Next steps:")
    print("1. Deploy the updated Supabase Edge Function via dashboard")
    print("2. Test the full integration in your web app")
    print("3. Monitor logs for any issues")

if __name__ == "__main__":
    test_new_openlens_endpoint()
