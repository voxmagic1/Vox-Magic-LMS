#!/usr/bin/env python3
"""
Quick re-test of Flutterwave test connection endpoint after fix.
Tests only the /api/admin/payment-settings/test endpoint.
"""
import requests
import os

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://damichromes-vocal.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

def test_payment_settings_test_connection():
    """Test the Flutterwave test connection endpoint after fix"""
    print("\n" + "="*80)
    print("FLUTTERWAVE TEST CONNECTION ENDPOINT - QUICK RE-TEST")
    print("="*80)
    
    # Step 1: Login as admin to get token
    print("\n[Step 1] Admin login...")
    try:
        login_resp = requests.post(
            f"{API_BASE}/admin/login",
            json={"email": "admin@voxmagic.test", "password": "Admin1234"},
            timeout=10
        )
        print(f"  Status: {login_resp.status_code}")
        if login_resp.status_code != 200:
            print(f"  ❌ FAILED: Expected 200, got {login_resp.status_code}")
            print(f"  Response: {login_resp.text}")
            return False
        
        admin_data = login_resp.json()
        admin_token = admin_data.get('token')
        if not admin_token:
            print(f"  ❌ FAILED: No token in response")
            return False
        
        print(f"  ✅ SUCCESS: Admin logged in, token obtained")
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    # Step 2: POST /api/admin/payment-settings/test with NO body (should return 200 with ok:true)
    print("\n[Step 2] POST /api/admin/payment-settings/test with NO body (uses stored/env key)...")
    try:
        test_resp = requests.post(
            f"{API_BASE}/admin/payment-settings/test",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={},
            timeout=15
        )
        print(f"  Status: {test_resp.status_code}")
        print(f"  Response: {test_resp.text}")
        
        if test_resp.status_code != 200:
            print(f"  ❌ FAILED: Expected 200, got {test_resp.status_code}")
            return False
        
        test_data = test_resp.json()
        if not test_data.get('ok'):
            print(f"  ❌ FAILED: Expected ok:true, got {test_data}")
            return False
        
        print(f"  ✅ SUCCESS: Returns 200 with ok:true (Flutterwave /balances call successful)")
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    # Step 3: POST /api/admin/payment-settings/test with invalid key (should return 400 with ok:false)
    print("\n[Step 3] POST /api/admin/payment-settings/test with invalid secretKey...")
    try:
        invalid_resp = requests.post(
            f"{API_BASE}/admin/payment-settings/test",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"secretKey": "FLWSECK_TEST-invalidkey123"},
            timeout=15
        )
        print(f"  Status: {invalid_resp.status_code}")
        print(f"  Response: {invalid_resp.text}")
        
        if invalid_resp.status_code != 400:
            print(f"  ❌ FAILED: Expected 400, got {invalid_resp.status_code}")
            return False
        
        invalid_data = invalid_resp.json()
        if invalid_data.get('ok') != False:
            print(f"  ❌ FAILED: Expected ok:false, got {invalid_data}")
            return False
        
        print(f"  ✅ SUCCESS: Returns 400 with ok:false for invalid key")
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    # Step 4: POST /api/admin/payment-settings/test with NO token (should return 401)
    print("\n[Step 4] POST /api/admin/payment-settings/test with NO token...")
    try:
        no_auth_resp = requests.post(
            f"{API_BASE}/admin/payment-settings/test",
            json={},
            timeout=10
        )
        print(f"  Status: {no_auth_resp.status_code}")
        
        if no_auth_resp.status_code != 401:
            print(f"  ❌ FAILED: Expected 401, got {no_auth_resp.status_code}")
            print(f"  Response: {no_auth_resp.text}")
            return False
        
        print(f"  ✅ SUCCESS: Returns 401 without token")
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False
    
    print("\n" + "="*80)
    print("✅ ALL 4 TEST SCENARIOS PASSED")
    print("="*80)
    return True

if __name__ == '__main__':
    success = test_payment_settings_test_connection()
    exit(0 if success else 1)
