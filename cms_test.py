#!/usr/bin/env python3
"""
CMS Content API + Resend Email Regression Test Suite
Tests all CMS endpoints and email wiring for Vox Magic
"""

import requests
import json
import sys

# Base URL from environment
BASE_URL = "https://damichromes-vocal.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@voxmagic.test"
ADMIN_PASSWORD = "Admin1234"
STUDENT_EMAIL = "lms.tester@voxmagic.test"
STUDENT_PASSWORD = "Test1234"

# Global tokens
admin_token = None
student_token = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_1_public_content_initial():
    """Test 1: GET /api/content (PUBLIC) - verify initial defaults"""
    print_test("1. GET /api/content (PUBLIC) - Initial Defaults")
    
    try:
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        content = data.get("content")
        
        if not content:
            print_result(False, "No content object in response")
            return False
        
        # Verify all required keys
        required_keys = ["brand", "media", "hero", "about", "values", "programmes", 
                        "curriculum", "founder", "faculty", "events", "testimonials", 
                        "blog", "faq"]
        missing_keys = [k for k in required_keys if k not in content]
        
        if missing_keys:
            print_result(False, f"Missing required keys: {missing_keys}")
            return False
        
        # Verify programmes structure
        programmes = content.get("programmes", {})
        required_prog_keys = ["registration", "onlinePrice", "hybridPrice", 
                             "onlineFeatures", "hybridFeatures"]
        missing_prog = [k for k in required_prog_keys if k not in programmes]
        
        if missing_prog:
            print_result(False, f"Missing programmes keys: {missing_prog}")
            return False
        
        # Verify initial values
        hero = content.get("hero", {})
        hero_title = hero.get("titleTop")
        online_price = programmes.get("onlinePrice")
        
        print(f"hero.titleTop: '{hero_title}'")
        print(f"programmes.onlinePrice: {online_price}")
        
        if hero_title != "Cast The Spell":
            print_result(False, f"Expected hero.titleTop='Cast The Spell', got '{hero_title}'")
            return False
        
        if online_price != 80000:
            print_result(False, f"Expected programmes.onlinePrice=80000, got {online_price}")
            return False
        
        # Verify arrays
        if not isinstance(content.get("values"), list):
            print_result(False, "values should be an array")
            return False
        
        if not isinstance(content.get("curriculum"), list):
            print_result(False, "curriculum should be an array")
            return False
        
        if not isinstance(content.get("faculty"), list):
            print_result(False, "faculty should be an array")
            return False
        
        if not isinstance(content.get("events"), list):
            print_result(False, "events should be an array")
            return False
        
        if not isinstance(content.get("testimonials"), list):
            print_result(False, "testimonials should be an array")
            return False
        
        if not isinstance(content.get("blog"), list):
            print_result(False, "blog should be an array")
            return False
        
        if not isinstance(content.get("faq"), list):
            print_result(False, "faq should be an array")
            return False
        
        print_result(True, f"All required keys present. hero.titleTop='Cast The Spell', onlinePrice=80000")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_2_admin_content_auth():
    """Test 2: Admin content endpoint authentication"""
    print_test("2. Admin Content Authentication")
    global admin_token, student_token
    
    # Login as admin
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Admin login status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Admin login failed with {response.status_code}")
            return False
        
        data = response.json()
        admin_token = data.get("token")
        
        if not admin_token:
            print_result(False, "No admin token received")
            return False
        
        print_result(True, "Admin login successful, token received")
        
    except Exception as e:
        print_result(False, f"Admin login exception: {str(e)}")
        return False
    
    # GET /api/admin/content with admin token
    try:
        response = requests.get(
            f"{BASE_URL}/admin/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"GET /api/admin/content with admin token status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "content" not in data or "defaults" not in data:
            print_result(False, "Response should have both 'content' and 'defaults' keys")
            return False
        
        print_result(True, "Admin can access /api/admin/content with token (returns content + defaults)")
        
    except Exception as e:
        print_result(False, f"Admin content GET exception: {str(e)}")
        return False
    
    # GET /api/admin/content WITHOUT token
    try:
        response = requests.get(f"{BASE_URL}/admin/content", timeout=10)
        print(f"GET /api/admin/content without token status: {response.status_code}")
        
        if response.status_code != 401:
            print_result(False, f"Expected 401, got {response.status_code}")
            return False
        
        print_result(True, "Admin content without token correctly returns 401")
        
    except Exception as e:
        print_result(False, f"Admin content no token exception: {str(e)}")
        return False
    
    # Login as student
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
            timeout=10
        )
        print(f"Student login status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Student login failed with {response.status_code}")
            return False
        
        data = response.json()
        student_token = data.get("token")
        
        if not student_token:
            print_result(False, "No student token received")
            return False
        
        print_result(True, "Student login successful")
        
    except Exception as e:
        print_result(False, f"Student login exception: {str(e)}")
        return False
    
    # GET /api/admin/content with STUDENT token (CRITICAL SECURITY CHECK)
    try:
        response = requests.get(
            f"{BASE_URL}/admin/content",
            headers={"Authorization": f"Bearer {student_token}"},
            timeout=10
        )
        print(f"GET /api/admin/content with STUDENT token status: {response.status_code}")
        
        if response.status_code != 401:
            print_result(False, f"🚨 CRITICAL SECURITY FAILURE: Student token should be rejected (401), got {response.status_code}")
            return False
        
        print_result(True, "🔒 CRITICAL SECURITY CHECK PASSED: Student token correctly rejected from admin content (401)")
        return True
        
    except Exception as e:
        print_result(False, f"Student token test exception: {str(e)}")
        return False

def test_3_update_content():
    """Test 3: PUT /api/admin/content - modify content"""
    print_test("3. PUT /api/admin/content - Update Content")
    
    # First, get current content
    try:
        response = requests.get(
            f"{BASE_URL}/admin/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            print_result(False, f"Failed to fetch current content: {response.status_code}")
            return False
        
        data = response.json()
        content = data.get("content")
        
        # Modify hero.titleTop and programmes.onlinePrice
        content["hero"]["titleTop"] = "CMS Test Title"
        content["programmes"]["onlinePrice"] = 90000
        
        print(f"Modified hero.titleTop to: 'CMS Test Title'")
        print(f"Modified programmes.onlinePrice to: 90000")
        
    except Exception as e:
        print_result(False, f"Failed to prepare content: {str(e)}")
        return False
    
    # PUT the modified content
    try:
        response = requests.put(
            f"{BASE_URL}/admin/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"content": content},
            timeout=10
        )
        print(f"PUT /api/admin/content status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        if not data.get("ok"):
            print_result(False, "Response should have ok:true")
            return False
        
        print_result(True, "Content updated successfully")
        return True
        
    except Exception as e:
        print_result(False, f"PUT content exception: {str(e)}")
        return False

def test_4_verify_content_live():
    """Test 4: GET /api/content (PUBLIC) - verify changes are live"""
    print_test("4. GET /api/content (PUBLIC) - Verify Changes Are Live")
    
    try:
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        content = data.get("content")
        
        hero = content.get("hero", {})
        programmes = content.get("programmes", {})
        
        hero_title = hero.get("titleTop")
        online_price = programmes.get("onlinePrice")
        
        print(f"hero.titleTop: '{hero_title}'")
        print(f"programmes.onlinePrice: {online_price}")
        
        if hero_title != "CMS Test Title":
            print_result(False, f"Expected hero.titleTop='CMS Test Title', got '{hero_title}'")
            return False
        
        if online_price != 90000:
            print_result(False, f"Expected programmes.onlinePrice=90000, got {online_price}")
            return False
        
        print_result(True, "CMS edits are live! hero.titleTop='CMS Test Title', onlinePrice=90000")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_5_update_validation():
    """Test 5: PUT /api/admin/content validation"""
    print_test("5. PUT /api/admin/content - Validation")
    
    # PUT without token
    try:
        response = requests.put(
            f"{BASE_URL}/admin/content",
            json={"content": {"test": "data"}},
            timeout=10
        )
        print(f"PUT without token status: {response.status_code}")
        
        if response.status_code != 401:
            print_result(False, f"Expected 401, got {response.status_code}")
            return False
        
        print_result(True, "PUT without token correctly returns 401")
        
    except Exception as e:
        print_result(False, f"PUT without token exception: {str(e)}")
        return False
    
    # PUT with content: null
    try:
        response = requests.put(
            f"{BASE_URL}/admin/content",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"content": None},
            timeout=10
        )
        print(f"PUT with content:null status: {response.status_code}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            return False
        
        print_result(True, "PUT with content:null correctly returns 400")
        return True
        
    except Exception as e:
        print_result(False, f"PUT with null content exception: {str(e)}")
        return False

def test_6_reset_content():
    """Test 6: POST /api/admin/content/reset - restore defaults"""
    print_test("6. POST /api/admin/content/reset - Restore Defaults")
    
    # Reset content
    try:
        response = requests.post(
            f"{BASE_URL}/admin/content/reset",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"POST /api/admin/content/reset status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get("ok"):
            print_result(False, "Response should have ok:true")
            return False
        
        print_result(True, "Content reset successful")
        
    except Exception as e:
        print_result(False, f"Reset exception: {str(e)}")
        return False
    
    # Verify defaults are restored
    try:
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        print(f"GET /api/content after reset status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        content = data.get("content")
        
        hero = content.get("hero", {})
        programmes = content.get("programmes", {})
        
        hero_title = hero.get("titleTop")
        online_price = programmes.get("onlinePrice")
        
        print(f"hero.titleTop: '{hero_title}'")
        print(f"programmes.onlinePrice: {online_price}")
        
        if hero_title != "Cast The Spell":
            print_result(False, f"Expected hero.titleTop='Cast The Spell', got '{hero_title}'")
            return False
        
        if online_price != 80000:
            print_result(False, f"Expected programmes.onlinePrice=80000, got {online_price}")
            return False
        
        print_result(True, "Defaults restored! hero.titleTop='Cast The Spell', onlinePrice=80000")
        return True
        
    except Exception as e:
        print_result(False, f"Verify defaults exception: {str(e)}")
        return False

def test_7_email_regression():
    """Test 7: REGRESSION - Email wiring (Resend)"""
    print_test("7. REGRESSION - Email Wiring (POST /api/contact)")
    
    # Valid contact submission
    try:
        response = requests.post(
            f"{BASE_URL}/contact",
            json={"name": "T", "email": "t@example.com", "message": "Hello CMS"},
            timeout=10
        )
        print(f"POST /api/contact with valid data status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200 (even if email fails internally), got {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        if not data.get("ok"):
            print_result(False, "Response should have ok:true")
            return False
        
        print_result(True, "Contact form returns 200 (email failure is internal, not surfaced as HTTP error)")
        
    except Exception as e:
        print_result(False, f"Contact form exception: {str(e)}")
        return False
    
    # Contact without message
    try:
        response = requests.post(
            f"{BASE_URL}/contact",
            json={"name": "T", "email": "t@example.com"},
            timeout=10
        )
        print(f"POST /api/contact without message status: {response.status_code}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            return False
        
        print_result(True, "Contact without message correctly returns 400")
        return True
        
    except Exception as e:
        print_result(False, f"Contact validation exception: {str(e)}")
        return False

def test_8_core_regression():
    """Test 8: Quick core regression tests"""
    print_test("8. Quick Core Regression")
    
    # Health check
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"GET /api/health status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Health check failed: {response.status_code}")
            return False
        
        print_result(True, "Health check: 200")
        
    except Exception as e:
        print_result(False, f"Health check exception: {str(e)}")
        return False
    
    # Create application
    app_id = None
    try:
        response = requests.post(
            f"{BASE_URL}/applications",
            json={"name": "CMS Test User", "email": "cmstest@example.com"},
            timeout=10
        )
        print(f"POST /api/applications status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Application creation failed: {response.status_code}")
            return False
        
        data = response.json()
        app_id = data.get("application", {}).get("id")
        
        if not app_id:
            print_result(False, "No application ID returned")
            return False
        
        print_result(True, f"Application created: {app_id}")
        
    except Exception as e:
        print_result(False, f"Application creation exception: {str(e)}")
        return False
    
    # Initialize payment
    try:
        response = requests.post(
            f"{BASE_URL}/payments/initialize",
            json={"plan": "registration", "applicationId": app_id},
            timeout=10
        )
        print(f"POST /api/payments/initialize status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Payment initialization failed: {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        link = data.get("link")
        
        if not link or "flutterwave" not in link.lower():
            print_result(False, f"Expected Flutterwave link, got: {link}")
            return False
        
        print_result(True, f"Payment initialization returns Flutterwave link: {link[:60]}...")
        
    except Exception as e:
        print_result(False, f"Payment initialization exception: {str(e)}")
        return False
    
    # Admin overview
    try:
        response = requests.get(
            f"{BASE_URL}/admin/overview",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"GET /api/admin/overview status: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Admin overview failed: {response.status_code}")
            return False
        
        data = response.json()
        stats = data.get("stats", {})
        
        required_stats = ["applications", "students", "revenue", "pendingApplications", 
                         "paidPayments", "ungradedSubmissions"]
        missing_stats = [s for s in required_stats if s not in stats]
        
        if missing_stats:
            print_result(False, f"Missing stats: {missing_stats}")
            return False
        
        print_result(True, f"Admin overview returns all stats: {json.dumps(stats)}")
        return True
        
    except Exception as e:
        print_result(False, f"Admin overview exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("VOX MAGIC CMS CONTENT API + RESEND EMAIL REGRESSION TEST SUITE")
    print("="*80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("1. Public Content Initial", test_1_public_content_initial()))
    results.append(("2. Admin Content Auth", test_2_admin_content_auth()))
    results.append(("3. Update Content", test_3_update_content()))
    results.append(("4. Verify Content Live", test_4_verify_content_live()))
    results.append(("5. Update Validation", test_5_update_validation()))
    results.append(("6. Reset Content", test_6_reset_content()))
    results.append(("7. Email Regression", test_7_email_regression()))
    results.append(("8. Core Regression", test_8_core_regression()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed}/{total} tests passed ({int(passed/total*100)}%)")
    print("="*80)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
