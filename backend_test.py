#!/usr/bin/env python3
"""
Backend API test for Vox Magic password management features
Tests student password change, forgot password, reset password, and admin password reset
"""

import requests
import json
import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import subprocess

# Load environment variables
load_dotenv('/app/.env')

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_URL = f"{BASE_URL}/api"
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'your_database_name')

# Test credentials
STUDENT_EMAIL = "lms.tester@voxmagic.test"
STUDENT_PASSWORD = "Test1234"
ADMIN_EMAIL = "admin@voxmagic.test"
ADMIN_PASSWORD = "Admin1234"

# Global variable for reset token
RESET_TOKEN = None

def print_test(msg):
    print(f"\n{'='*80}")
    print(f"TEST: {msg}")
    print('='*80)

def print_success(msg):
    print(f"✅ SUCCESS: {msg}")

def print_error(msg):
    print(f"❌ ERROR: {msg}")

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

# Test 1: Student change password
def test_student_change_password():
    print_test("1. POST /api/students/change-password (as student)")
    
    try:
        # First login as student
        print_info("Logging in as student...")
        login_resp = requests.post(f"{API_URL}/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        
        if login_resp.status_code != 200:
            print_error(f"Student login failed: {login_resp.status_code} - {login_resp.text}")
            return False
        
        token = login_resp.json().get('token')
        print_success(f"Student login successful, token: {token[:20]}...")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1a: Missing fields
        print_info("Test 1a: Missing currentPassword or newPassword -> 400")
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": "Test1234"
        }, headers=headers)
        
        if resp.status_code == 400:
            print_success(f"Missing newPassword correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 1b: Wrong current password
        print_info("Test 1b: Wrong currentPassword -> 401")
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": "WrongPassword123",
            "newPassword": "NewPassword123"
        }, headers=headers)
        
        if resp.status_code == 401:
            print_success(f"Wrong currentPassword correctly returns 401")
        else:
            print_error(f"Expected 401, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 1c: New password too short
        print_info("Test 1c: newPassword < 8 chars -> 400")
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": STUDENT_PASSWORD,
            "newPassword": "Short1"
        }, headers=headers)
        
        if resp.status_code == 400:
            print_success(f"Short newPassword correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 1d: Valid password change
        print_info("Test 1d: Valid password change to 'StudentNew123' -> 200")
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": STUDENT_PASSWORD,
            "newPassword": "StudentNew123"
        }, headers=headers)
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Password changed successfully: {resp.json()}")
        else:
            print_error(f"Expected 200 with ok:true, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 1e: Verify new password works
        print_info("Test 1e: Verify new password 'StudentNew123' works by logging in")
        login_resp2 = requests.post(f"{API_URL}/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": "StudentNew123"
        })
        
        if login_resp2.status_code == 200:
            print_success(f"Login with new password successful")
            new_token = login_resp2.json().get('token')
        else:
            print_error(f"Login with new password failed: {login_resp2.status_code} - {login_resp2.text}")
            return False
        
        # Test 1f: Change password back to original
        print_info("Test 1f: Change password back to 'Test1234' to preserve defaults")
        headers_new = {"Authorization": f"Bearer {new_token}"}
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": "StudentNew123",
            "newPassword": STUDENT_PASSWORD
        }, headers=headers_new)
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Password changed back to original successfully")
        else:
            print_error(f"Failed to change password back: {resp.status_code}: {resp.text}")
            return False
        
        print_success("All student change-password tests passed!")
        return True
        
    except Exception as e:
        print_error(f"Exception in test_student_change_password: {str(e)}")
        return False

# Test 2: Forgot password
def test_forgot_password():
    print_test("2. POST /api/auth/forgot-password (no auth)")
    
    try:
        # Test 2a: Missing email
        print_info("Test 2a: Missing email -> 400")
        resp = requests.post(f"{API_URL}/auth/forgot-password", json={})
        
        if resp.status_code == 400:
            print_success(f"Missing email correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 2b: Valid email (student exists)
        print_info(f"Test 2b: Valid email {STUDENT_EMAIL} -> 200 with generic message")
        resp = requests.post(f"{API_URL}/auth/forgot-password", json={
            "email": STUDENT_EMAIL
        })
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Forgot password returns 200: {resp.json()}")
        else:
            print_error(f"Expected 200 with ok:true, got {resp.status_code}: {resp.text}")
            return False
        
        # Verify password_resets doc was created in MongoDB
        print_info("Verifying password_resets doc was created in MongoDB...")
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        reset_doc = db.password_resets.find_one({"email": STUDENT_EMAIL}, sort=[("createdAt", -1)])
        
        if reset_doc:
            print_success(f"Password reset doc created: token={reset_doc['token'][:20]}..., used={reset_doc['used']}, expiresAt={reset_doc['expiresAt']}")
            # Store token for later use
            global RESET_TOKEN
            RESET_TOKEN = reset_doc['token']
        else:
            print_error(f"No password_resets doc found for {STUDENT_EMAIL}")
            return False
        
        # Test 2c: Non-existent email (should also return 200 to avoid enumeration)
        print_info("Test 2c: Non-existent email -> 200 (no enumeration)")
        resp = requests.post(f"{API_URL}/auth/forgot-password", json={
            "email": "nobody-doesnotexist@example.com"
        })
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Non-existent email also returns 200 (correct)")
        else:
            print_error(f"Expected 200 with ok:true, got {resp.status_code}: {resp.text}")
            return False
        
        # Verify NO password_resets doc was created for non-existent email
        print_info("Verifying NO password_resets doc was created for non-existent email...")
        reset_doc2 = db.password_resets.find_one({"email": "nobody-doesnotexist@example.com"})
        
        if not reset_doc2:
            print_success(f"Correctly, no password_resets doc created for non-existent email")
        else:
            print_error(f"Unexpectedly found password_resets doc for non-existent email")
            return False
        
        client.close()
        print_success("All forgot-password tests passed!")
        return True
        
    except Exception as e:
        print_error(f"Exception in test_forgot_password: {str(e)}")
        return False

# Test 3: Reset password
def test_reset_password():
    print_test("3. POST /api/auth/reset-password (no auth)")
    
    try:
        # Test 3a: Invalid token
        print_info("Test 3a: Invalid token -> 400")
        resp = requests.post(f"{API_URL}/auth/reset-password", json={
            "token": "garbage",
            "newPassword": "Whatever123"
        })
        
        if resp.status_code == 400:
            print_success(f"Invalid token correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 3b: New password too short
        print_info("Test 3b: newPassword < 8 chars -> 400")
        resp = requests.post(f"{API_URL}/auth/reset-password", json={
            "token": "sometoken",
            "newPassword": "Short1"
        })
        
        if resp.status_code == 400:
            print_success(f"Short newPassword correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 3c: Valid token and password (HAPPY PATH)
        print_info(f"Test 3c: Valid token with newPassword 'ResetFlow123' -> 200")
        resp = requests.post(f"{API_URL}/auth/reset-password", json={
            "token": RESET_TOKEN,
            "newPassword": "ResetFlow123"
        })
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Password reset successful: {resp.json()}")
        else:
            print_error(f"Expected 200 with ok:true, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 3d: Try to use the same token again (should fail - token now used)
        print_info("Test 3d: Reusing same token -> 400 (token now used)")
        resp = requests.post(f"{API_URL}/auth/reset-password", json={
            "token": RESET_TOKEN,
            "newPassword": "AnotherPassword123"
        })
        
        if resp.status_code == 400:
            print_success(f"Reused token correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 3e: Verify student can log in with new password
        print_info("Test 3e: Verify student can log in with 'ResetFlow123'")
        login_resp = requests.post(f"{API_URL}/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": "ResetFlow123"
        })
        
        if login_resp.status_code == 200:
            print_success(f"Login with reset password successful")
            token = login_resp.json().get('token')
        else:
            print_error(f"Login with reset password failed: {login_resp.status_code} - {login_resp.text}")
            return False
        
        # Test 3f: Change password back to original using change-password
        print_info("Test 3f: Change password back to 'Test1234' via change-password")
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{API_URL}/students/change-password", json={
            "currentPassword": "ResetFlow123",
            "newPassword": STUDENT_PASSWORD
        }, headers=headers)
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Password changed back to original successfully")
        else:
            print_error(f"Failed to change password back: {resp.status_code}: {resp.text}")
            return False
        
        print_success("All reset-password tests passed!")
        return True
        
    except Exception as e:
        print_error(f"Exception in test_reset_password: {str(e)}")
        return False

# Test 4: Admin reset student password
def test_admin_reset_student_password():
    print_test("4. POST /api/admin/students/reset-password (as admin)")
    
    try:
        # First login as admin
        print_info("Logging in as admin...")
        login_resp = requests.post(f"{API_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_resp.status_code != 200:
            print_error(f"Admin login failed: {login_resp.status_code} - {login_resp.text}")
            return False
        
        admin_token = login_resp.json().get('token')
        print_success(f"Admin login successful, token: {admin_token[:20]}...")
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get student ID
        print_info("Getting student list to find lms.tester's studentId...")
        resp = requests.get(f"{API_URL}/admin/students", headers=admin_headers)
        
        if resp.status_code != 200:
            print_error(f"Failed to get students: {resp.status_code} - {resp.text}")
            return False
        
        students = resp.json().get('students', [])
        student = next((s for s in students if s['email'] == STUDENT_EMAIL), None)
        
        if not student:
            print_error(f"Student {STUDENT_EMAIL} not found in students list")
            return False
        
        student_id = student['id']
        print_success(f"Found student ID: {student_id}")
        
        # Test 4a: Missing fields
        print_info("Test 4a: Missing studentId or newPassword -> 400")
        resp = requests.post(f"{API_URL}/admin/students/reset-password", json={
            "studentId": student_id
        }, headers=admin_headers)
        
        if resp.status_code == 400:
            print_success(f"Missing newPassword correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 4b: New password too short
        print_info("Test 4b: newPassword < 8 chars -> 400")
        resp = requests.post(f"{API_URL}/admin/students/reset-password", json={
            "studentId": student_id,
            "newPassword": "Short1"
        }, headers=admin_headers)
        
        if resp.status_code == 400:
            print_success(f"Short newPassword correctly returns 400")
        else:
            print_error(f"Expected 400, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 4c: Unknown studentId
        print_info("Test 4c: Unknown studentId -> 404")
        resp = requests.post(f"{API_URL}/admin/students/reset-password", json={
            "studentId": "unknown-student-id-12345",
            "newPassword": "ValidPassword123"
        }, headers=admin_headers)
        
        if resp.status_code == 404:
            print_success(f"Unknown studentId correctly returns 404")
        else:
            print_error(f"Expected 404, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 4d: Valid reset
        print_info("Test 4d: Valid reset with newPassword 'AdminSet123' -> 200")
        resp = requests.post(f"{API_URL}/admin/students/reset-password", json={
            "studentId": student_id,
            "newPassword": "AdminSet123"
        }, headers=admin_headers)
        
        if resp.status_code == 200 and resp.json().get('ok') == True:
            print_success(f"Admin password reset successful: {resp.json()}")
        else:
            print_error(f"Expected 200 with ok:true, got {resp.status_code}: {resp.text}")
            return False
        
        # Test 4e: Verify mustResetPassword is true in MongoDB
        print_info("Verifying mustResetPassword=true in MongoDB...")
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        student_doc = db.students.find_one({"id": student_id})
        
        if student_doc and student_doc.get('mustResetPassword') == True:
            print_success(f"mustResetPassword is correctly set to true")
        else:
            print_error(f"mustResetPassword is not true: {student_doc.get('mustResetPassword')}")
            return False
        
        # Test 4f: Verify prior student sessions were removed
        print_info("Verifying prior student sessions were removed...")
        session_count = db.sessions.count_documents({"studentId": student_id})
        
        if session_count == 0:
            print_success(f"All prior student sessions removed (count: {session_count})")
        else:
            print_error(f"Found {session_count} sessions for student (expected 0)")
            return False
        
        # Test 4g: Verify audit log entry
        print_info("Verifying audit log entry for 'student_password_reset'...")
        resp = requests.get(f"{API_URL}/admin/audit-logs", headers=admin_headers)
        
        if resp.status_code == 200:
            logs_data = resp.json()
            # Handle both array and object with logs key
            logs = logs_data if isinstance(logs_data, list) else logs_data.get('logs', [])
            reset_log = next((log for log in logs if isinstance(log, dict) and log.get('action') == 'student_password_reset'), None)
            if reset_log:
                print_success(f"Found audit log entry: {reset_log}")
            else:
                print_error(f"No 'student_password_reset' audit log entry found")
                return False
        else:
            print_error(f"Failed to get audit logs: {resp.status_code} - {resp.text}")
            return False
        
        client.close()
        print_success("All admin reset-password tests passed!")
        return True
        
    except Exception as e:
        print_error(f"Exception in test_admin_reset_student_password: {str(e)}")
        return False

# Test 5: Final cleanup
def test_final_cleanup():
    print_test("5. FINAL CLEANUP - Run seed script to restore defaults")
    
    try:
        print_info("Running: node /app/scripts/seed_test_student.js")
        result = subprocess.run(
            ["node", "/app/scripts/seed_test_student.js"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        print_info(f"Seed script output:\n{result.stdout}")
        
        if result.returncode != 0:
            print_error(f"Seed script failed with exit code {result.returncode}")
            print_error(f"Error output: {result.stderr}")
            return False
        
        print_success("Seed script executed successfully")
        
        # Verify admin login works
        print_info("Verifying admin login with Admin1234...")
        login_resp = requests.post(f"{API_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_resp.status_code == 200:
            admin_data = login_resp.json()
            print_success(f"Admin login successful: token={admin_data.get('token')[:20]}...")
        else:
            print_error(f"Admin login failed: {login_resp.status_code} - {login_resp.text}")
            return False
        
        # Verify student login works
        print_info("Verifying student login with Test1234...")
        login_resp = requests.post(f"{API_URL}/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        
        if login_resp.status_code == 200:
            student_data = login_resp.json()
            student = student_data.get('student', {})
            print_success(f"Student login successful: token={student_data.get('token')[:20]}...")
            print_success(f"Student mustResetPassword={student.get('mustResetPassword')}")
            
            if student.get('mustResetPassword') == False:
                print_success("Student mustResetPassword is correctly False")
            else:
                print_error(f"Student mustResetPassword should be False, got {student.get('mustResetPassword')}")
                return False
        else:
            print_error(f"Student login failed: {login_resp.status_code} - {login_resp.text}")
            return False
        
        print_success("Final cleanup completed successfully!")
        return True
        
    except Exception as e:
        print_error(f"Exception in test_final_cleanup: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("VOX MAGIC PASSWORD MANAGEMENT BACKEND TESTS")
    print("="*80)
    
    results = []
    
    # Run all tests
    results.append(("Student change-password", test_student_change_password()))
    results.append(("Forgot password", test_forgot_password()))
    results.append(("Reset password", test_reset_password()))
    results.append(("Admin reset student password", test_admin_reset_student_password()))
    results.append(("Final cleanup", test_final_cleanup()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
