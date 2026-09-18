#!/usr/bin/env python3
"""
Secure File Upload + Authenticated File Proxy Test Suite
Tests POST /api/admin/upload and GET /api/file endpoints
"""

import requests
import sys
from urllib.parse import quote

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
uploaded_url = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_step_1_login():
    """Step 1: Login admin and student"""
    print_test("Step 1: Login Admin and Student")
    global admin_token, student_token
    
    # Login admin
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Admin login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get('token')
            print(f"Admin token obtained: {admin_token[:20]}...")
            print_result(True, f"Admin login successful")
        else:
            print_result(False, f"Admin login failed: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Admin login error: {str(e)}")
        return False
    
    # Login student
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
            timeout=10
        )
        print(f"Student login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            student_token = data.get('token')
            print(f"Student token obtained: {student_token[:20]}...")
            print_result(True, f"Student login successful")
            return True
        else:
            print_result(False, f"Student login failed: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Student login error: {str(e)}")
        return False

def test_step_2_upload():
    """Step 2: Upload file with admin token"""
    print_test("Step 2: Upload File with Admin Token")
    global uploaded_url
    
    if not admin_token:
        print_result(False, "No admin token available")
        return False
    
    try:
        upload_body = "Vox Magic secure upload test"
        response = requests.post(
            f"{BASE_URL}/admin/upload?filename=test.txt",
            data=upload_body,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "text/plain"
            },
            timeout=10
        )
        print(f"Upload status: {response.status_code}")
        print(f"Upload response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            uploaded_url = data.get('url')
            pathname = data.get('pathname')
            
            # Verify url contains blob.vercel-storage.com
            if uploaded_url and 'blob.vercel-storage.com' in uploaded_url:
                print(f"✓ URL contains blob.vercel-storage.com: {uploaded_url}")
                print(f"✓ Pathname: {pathname}")
                print_result(True, f"Upload successful with valid blob URL")
                return True
            else:
                print_result(False, f"URL does not contain blob.vercel-storage.com: {uploaded_url}")
                return False
        else:
            print_result(False, f"Upload failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Upload error: {str(e)}")
        return False

def test_step_3_upload_auth():
    """Step 3: Test upload authentication - no token and student token"""
    print_test("Step 3: Upload Authentication Tests")
    
    all_passed = True
    
    # Test 3a: Upload without Authorization
    try:
        response = requests.post(
            f"{BASE_URL}/admin/upload?filename=x.txt",
            data="test",
            headers={"Content-Type": "text/plain"},
            timeout=10
        )
        print(f"Upload without auth status: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "Upload without Authorization correctly returns 401")
        else:
            print_result(False, f"Upload without Authorization should return 401, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Upload without auth error: {str(e)}")
        all_passed = False
    
    # Test 3b: Upload with student token
    if student_token:
        try:
            response = requests.post(
                f"{BASE_URL}/admin/upload?filename=x.txt",
                data="test",
                headers={
                    "Authorization": f"Bearer {student_token}",
                    "Content-Type": "text/plain"
                },
                timeout=10
            )
            print(f"Upload with student token status: {response.status_code}")
            
            if response.status_code == 401:
                print_result(True, "Upload with student token correctly returns 401")
            else:
                print_result(False, f"Upload with student token should return 401, got {response.status_code}")
                all_passed = False
        except Exception as e:
            print_result(False, f"Upload with student token error: {str(e)}")
            all_passed = False
    else:
        print_result(False, "No student token available for testing")
        all_passed = False
    
    return all_passed

def test_step_4_proxy_serve():
    """Step 4: Test authenticated file proxy with student token"""
    print_test("Step 4: Proxy Serve File with Student Token")
    
    if not uploaded_url:
        print_result(False, "No uploaded URL available")
        return False
    
    if not student_token:
        print_result(False, "No student token available")
        return False
    
    try:
        encoded_url = quote(uploaded_url, safe='')
        response = requests.get(
            f"{BASE_URL}/file?u={encoded_url}&t={student_token}",
            timeout=10
        )
        print(f"Proxy serve status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            expected_body = "Vox Magic secure upload test"
            if response.text == expected_body:
                print_result(True, f"Proxy serve successful and body matches: '{response.text}'")
                return True
            else:
                print_result(False, f"Body mismatch. Expected: '{expected_body}', Got: '{response.text}'")
                return False
        else:
            print_result(False, f"Proxy serve failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Proxy serve error: {str(e)}")
        return False

def test_step_5_proxy_no_auth():
    """Step 5: Test proxy without authentication"""
    print_test("Step 5: Proxy Without Authentication")
    
    if not uploaded_url:
        print_result(False, "No uploaded URL available")
        return False
    
    try:
        encoded_url = quote(uploaded_url, safe='')
        response = requests.get(
            f"{BASE_URL}/file?u={encoded_url}",
            timeout=10
        )
        print(f"Proxy without auth status: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "Proxy without auth correctly returns 401")
            return True
        else:
            print_result(False, f"Proxy without auth should return 401, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Proxy without auth error: {str(e)}")
        return False

def test_step_6_ssrf_guard():
    """Step 6: Test SSRF guard - forbidden host"""
    print_test("Step 6: SSRF Guard - Forbidden Host")
    
    if not student_token:
        print_result(False, "No student token available")
        return False
    
    try:
        evil_url = "https://evil.com/x"
        encoded_url = quote(evil_url, safe='')
        response = requests.get(
            f"{BASE_URL}/file?u={encoded_url}&t={student_token}",
            timeout=10
        )
        print(f"SSRF guard status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 403:
            print_result(True, "SSRF guard correctly returns 403 for forbidden host")
            return True
        else:
            print_result(False, f"SSRF guard should return 403, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"SSRF guard error: {str(e)}")
        return False

def test_step_7_proxy_admin():
    """Step 7: Test proxy with admin token"""
    print_test("Step 7: Proxy Serve File with Admin Token")
    
    if not uploaded_url:
        print_result(False, "No uploaded URL available")
        return False
    
    if not admin_token:
        print_result(False, "No admin token available")
        return False
    
    try:
        encoded_url = quote(uploaded_url, safe='')
        response = requests.get(
            f"{BASE_URL}/file?u={encoded_url}&t={admin_token}",
            timeout=10
        )
        print(f"Proxy with admin token status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            expected_body = "Vox Magic secure upload test"
            if response.text == expected_body:
                print_result(True, f"Proxy with admin token successful and body matches")
                return True
            else:
                print_result(False, f"Body mismatch with admin token")
                return False
        else:
            print_result(False, f"Proxy with admin token failed: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Proxy with admin token error: {str(e)}")
        return False

def test_step_8_regression():
    """Step 8: Regression tests - contact and health"""
    print_test("Step 8: Regression Tests")
    
    all_passed = True
    
    # Test contact endpoint
    try:
        response = requests.post(
            f"{BASE_URL}/contact",
            json={"name": "T", "email": "t@example.com", "message": "hi"},
            timeout=10
        )
        print(f"Contact endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print_result(True, "Contact endpoint working")
        else:
            print_result(False, f"Contact endpoint failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Contact endpoint error: {str(e)}")
        all_passed = False
    
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Health endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print_result(True, "Health endpoint working")
        else:
            print_result(False, f"Health endpoint failed: {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Health endpoint error: {str(e)}")
        all_passed = False
    
    return all_passed

def main():
    print("\n" + "="*80)
    print("SECURE FILE UPLOAD + AUTHENTICATED FILE PROXY TEST SUITE")
    print("="*80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Step 1: Login", test_step_1_login()))
    results.append(("Step 2: Upload", test_step_2_upload()))
    results.append(("Step 3: Upload Auth", test_step_3_upload_auth()))
    results.append(("Step 4: Proxy Serve", test_step_4_proxy_serve()))
    results.append(("Step 5: Proxy No Auth", test_step_5_proxy_no_auth()))
    results.append(("Step 6: SSRF Guard", test_step_6_ssrf_guard()))
    results.append(("Step 7: Proxy Admin", test_step_7_proxy_admin()))
    results.append(("Step 8: Regression", test_step_8_regression()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({100*passed//total}% success rate)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
