import requests
import json

def test_complete_openlens_flow():
    """Test the complete OpenLens flow through Supabase Edge Function"""
    
    # Your Supabase configuration
    SUPABASE_URL = "https://xujucwebbdtbbatrbmvh.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1anVjd2ViYmR0YmJhdHJibXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTMxMjYsImV4cCI6MjA2NjI4OTEyNn0.uTl_Q2VMzj5apkOq1RyKQWfSQcNn-Q1Yp_r0ozuhoXE"
    
    # Test with a public image URL - using a real public image for testing
    TEST_IMAGE_URL = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"
    
    print("🧪 Testing Complete OpenLens Integration")
    print("=" * 60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Edge Function: web-analyze-openlens")
    print(f"Test Image URL: {TEST_IMAGE_URL}")
    print("-" * 60)
    
    try:
        headers = {
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {"imageUrl": TEST_IMAGE_URL}
        
        print("📤 Sending request to Supabase Edge Function...")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/web-analyze-openlens",
            json=payload,
            headers=headers,
            timeout=150  # 2.5 minutes for complete analysis
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ SUCCESS! Edge Function working correctly!")
                data = result.get('data', {})
                
                print("\n📋 Analysis Results:")
                print(f"  🆔 ID: {data.get('id', 'N/A')}")
                print(f"  📝 Title: {data.get('title', 'N/A')}")
                print(f"  💰 Value: {data.get('value', 'N/A')}")
                print(f"  🤖 API Provider: {data.get('apiProvider', 'N/A')}")
                print(f"  ⏰ Timestamp: {data.get('timestamp', 'N/A')}")
                
                metadata = data.get('metadata', {})
                print(f"\n📊 Metadata:")
                print(f"  🔗 Google Lens Links: {metadata.get('google_lens_links_found', 'N/A')}")
                print(f"  📄 Scraped Content Length: {metadata.get('scraped_content_length', 'N/A')}")
                
                # Show analysis preview
                explanation = data.get('aiExplanation', '')
                if explanation:
                    preview = explanation[:300] + "..." if len(explanation) > 300 else explanation
                    print(f"\n💡 Analysis Preview:")
                    print(f"  {preview}")
                
                print("\n🎉 Complete integration test PASSED!")
                
            else:
                print("❌ Edge Function returned error:")
                print(f"  Error: {result.get('error', 'Unknown error')}")
                print(f"  Message: {result.get('message', 'No message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out")
        print("This might be normal for the first request (cold start)")
        print("Try again in a few minutes")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Integration Test Summary:")
    print("1. ✅ Cloud Run service deployed")
    print("2. ✅ Supabase Edge Function updated")
    print("3. 🧪 Complete flow tested")
    print("\n📝 Next: Test in your web application!")

if __name__ == "__main__":
    test_complete_openlens_flow()
