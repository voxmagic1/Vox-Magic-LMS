#!/usr/bin/env python3
"""
Backend API test for Admin Integrations (Email/Storage Settings, Test Email, Audit Log)
Tests all integration endpoints with authentication, validation, and secret masking
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

# Real values from env (for PUT tests to keep integrations working)
REAL_RESEND_KEY = "re_bhWFRF8j_L9miWVqsB1xVgbkKvM4jw6wu"
REAL_BLOB_TOKEN = "vercel_blob_rw_FVVIdHr9jK6iigPR_rkVswmMREpO9uJq4L3uhVGNPG3fNqY"

def log(msg):
    print(f"✓ {msg}")

def error(msg):
    print(f"✗ {msg}")
    
def test_step(step_num, description):
    print(f"\n{'='*80}")
    print(f"TEST {step_num}: {description}")
    print('='*80)

# Test 1: Login admin and student
test_step(1, "Login admin and student")
try:
    # Login admin
    resp = requests.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if resp.status_code != 200:
        error(f"Admin login failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    admin_token = resp.json()["token"]
    log(f"Admin login successful, token: {admin_token[:20]}...")
    
    # Login student
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD})
    if resp.status_code != 200:
        error(f"Student login failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    student_token = resp.json()["token"]
    log(f"Student login successful, token: {student_token[:20]}...")
except Exception as e:
    error(f"Login test failed: {e}")
    sys.exit(1)

# Test 2: GET /api/admin/email-settings with various auth scenarios
test_step(2, "GET /api/admin/email-settings - Authentication and Response Structure")
try:
    # 2a: GET with admin token -> 200
    resp = requests.get(f"{BASE_URL}/admin/email-settings", headers={"Authorization": f"Bearer {admin_token}"})
    if resp.status_code != 200:
        error(f"GET with admin token failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    settings = data.get("settings", {})
    
    # Verify response structure
    required_fields = ["source", "configured", "apiKeyMasked", "mailFrom", "admissionsEmail"]
    for field in required_fields:
        if field not in settings:
            error(f"Missing required field in response: {field}")
            sys.exit(1)
    log(f"GET with admin token -> 200, settings has all required fields: {list(settings.keys())}")
    
    # CRITICAL: Verify full Resend API key is NOT in response
    response_text = resp.text
    if REAL_RESEND_KEY in response_text:
        error(f"CRITICAL SECURITY ISSUE: Full Resend API key found in response! Response: {response_text}")
        sys.exit(1)
    log("✓ CRITICAL: Full Resend API key NOT exposed in response (only masked form present)")
    
    # Verify apiKeyMasked is actually masked
    api_key_masked = settings.get("apiKeyMasked", "")
    if api_key_masked and "…" not in api_key_masked:
        error(f"apiKeyMasked does not appear to be masked: {api_key_masked}")
        sys.exit(1)
    log(f"✓ apiKeyMasked is properly masked: {api_key_masked}")
    
    # Verify configured is true
    if not settings.get("configured"):
        error(f"configured should be true but got: {settings.get('configured')}")
        sys.exit(1)
    log(f"✓ configured: true, source: {settings.get('source')}, mailFrom: {settings.get('mailFrom')}, admissionsEmail: {settings.get('admissionsEmail')}")
    
    # 2b: GET without token -> 401
    resp = requests.get(f"{BASE_URL}/admin/email-settings")
    if resp.status_code != 401:
        error(f"GET without token should return 401, got: {resp.status_code}")
        sys.exit(1)
    log("✓ GET without token -> 401")
    
    # 2c: GET with student token -> 401
    resp = requests.get(f"{BASE_URL}/admin/email-settings", headers={"Authorization": f"Bearer {student_token}"})
    if resp.status_code != 401:
        error(f"GET with student token should return 401, got: {resp.status_code}")
        sys.exit(1)
    log("✓ GET with student token -> 401 (student tokens properly rejected)")
except Exception as e:
    error(f"GET email-settings test failed: {e}")
    sys.exit(1)

# Test 3: GET /api/admin/storage-settings with various auth scenarios
test_step(3, "GET /api/admin/storage-settings - Authentication and Response Structure")
try:
    # 3a: GET with admin token -> 200
    resp = requests.get(f"{BASE_URL}/admin/storage-settings", headers={"Authorization": f"Bearer {admin_token}"})
    if resp.status_code != 200:
        error(f"GET with admin token failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    settings = data.get("settings", {})
    
    # Verify response structure
    required_fields = ["source", "configured", "tokenMasked"]
    for field in required_fields:
        if field not in settings:
            error(f"Missing required field in response: {field}")
            sys.exit(1)
    log(f"GET with admin token -> 200, settings has all required fields: {list(settings.keys())}")
    
    # CRITICAL: Verify full blob token is NOT in response
    response_text = resp.text
    if REAL_BLOB_TOKEN in response_text:
        error(f"CRITICAL SECURITY ISSUE: Full blob token found in response! Response: {response_text}")
        sys.exit(1)
    log("✓ CRITICAL: Full blob token NOT exposed in response (only masked form present)")
    
    # Verify tokenMasked is actually masked
    token_masked = settings.get("tokenMasked", "")
    if token_masked and "…" not in token_masked:
        error(f"tokenMasked does not appear to be masked: {token_masked}")
        sys.exit(1)
    log(f"✓ tokenMasked is properly masked: {token_masked}")
    
    # Verify configured is true
    if not settings.get("configured"):
        error(f"configured should be true but got: {settings.get('configured')}")
        sys.exit(1)
    log(f"✓ configured: true, source: {settings.get('source')}")
    
    # 3b: GET with student token -> 401
    resp = requests.get(f"{BASE_URL}/admin/storage-settings", headers={"Authorization": f"Bearer {student_token}"})
    if resp.status_code != 401:
        error(f"GET with student token should return 401, got: {resp.status_code}")
        sys.exit(1)
    log("✓ GET with student token -> 401 (student tokens properly rejected)")
except Exception as e:
    error(f"GET storage-settings test failed: {e}")
    sys.exit(1)

# Test 4: POST /api/admin/email-settings/test - Send test email
test_step(4, "POST /api/admin/email-settings/test - Send test email")
try:
    # 4a: POST with valid recipient (delivered@resend.dev is Resend's test inbox)
    resp = requests.post(f"{BASE_URL}/admin/email-settings/test",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={"to": "delivered@resend.dev"})
    if resp.status_code != 200:
        error(f"Test email send failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    if not data.get("ok"):
        error(f"Test email should return ok:true, got: {data}")
        sys.exit(1)
    log(f"✓ POST /api/admin/email-settings/test {{to:'delivered@resend.dev'}} -> 200 {data}")
    
    # 4b: POST without 'to' field -> 400
    resp = requests.post(f"{BASE_URL}/admin/email-settings/test",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        json={})
    if resp.status_code != 400:
        error(f"Test email without 'to' should return 400, got: {resp.status_code}")
        sys.exit(1)
    log("✓ POST without 'to' field -> 400")
    
    # 4c: POST without token -> 401
    resp = requests.post(f"{BASE_URL}/admin/email-settings/test",
                        json={"to": "test@example.com"})
    if resp.status_code != 401:
        error(f"Test email without token should return 401, got: {resp.status_code}")
        sys.exit(1)
    log("✓ POST without token -> 401")
except Exception as e:
    error(f"Test email send test failed: {e}")
    sys.exit(1)

# Test 5: GET /api/admin/audit-logs - Verify test email logged
test_step(5, "GET /api/admin/audit-logs - Verify audit log contains test_email_sent")
try:
    # 5a: GET with admin token -> 200
    resp = requests.get(f"{BASE_URL}/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    if resp.status_code != 200:
        error(f"GET audit logs failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    logs = data.get("logs", [])
    if not isinstance(logs, list):
        error(f"audit logs should be an array, got: {type(logs)}")
        sys.exit(1)
    log(f"✓ GET /api/admin/audit-logs -> 200 with {len(logs)} log entries")
    
    # Verify test_email_sent action exists
    test_email_logs = [log for log in logs if log.get("action") == "test_email_sent"]
    if not test_email_logs:
        error(f"No 'test_email_sent' action found in audit logs. Actions found: {[log.get('action') for log in logs[:5]]}")
        sys.exit(1)
    log(f"✓ Audit log contains 'test_email_sent' action (found {len(test_email_logs)} entries)")
    
    # 5b: GET with student token -> 401
    resp = requests.get(f"{BASE_URL}/admin/audit-logs", headers={"Authorization": f"Bearer {student_token}"})
    if resp.status_code != 401:
        error(f"GET audit logs with student token should return 401, got: {resp.status_code}")
        sys.exit(1)
    log("✓ GET with student token -> 401 (student tokens properly rejected)")
except Exception as e:
    error(f"Audit logs test failed: {e}")
    sys.exit(1)

# Test 6: PUT /api/admin/email-settings - Update email settings
test_step(6, "PUT /api/admin/email-settings - Update mailFrom and admissionsEmail")
try:
    # 6a: PUT with new mailFrom and admissionsEmail
    new_mail_from = "Vox Magic Admissions <contact@voxmagiconline.com>"
    new_admissions_email = "contact@voxmagiconline.com"
    resp = requests.put(f"{BASE_URL}/admin/email-settings",
                       headers={"Authorization": f"Bearer {admin_token}"},
                       json={"mailFrom": new_mail_from, "admissionsEmail": new_admissions_email})
    if resp.status_code != 200:
        error(f"PUT email settings failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    log(f"✓ PUT {{mailFrom:'{new_mail_from}', admissionsEmail:'{new_admissions_email}'}} -> 200")
    
    # 6b: GET email-settings to verify changes
    resp = requests.get(f"{BASE_URL}/admin/email-settings", headers={"Authorization": f"Bearer {admin_token}"})
    settings = resp.json().get("settings", {})
    if settings.get("mailFrom") != new_mail_from:
        error(f"mailFrom should be '{new_mail_from}', got: {settings.get('mailFrom')}")
        sys.exit(1)
    if settings.get("admissionsEmail") != new_admissions_email:
        error(f"admissionsEmail should be '{new_admissions_email}', got: {settings.get('admissionsEmail')}")
        sys.exit(1)
    log(f"✓ GET email-settings confirms mailFrom and admissionsEmail updated correctly")
    
    # 6c: GET audit-logs to verify email_settings_updated action
    resp = requests.get(f"{BASE_URL}/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    logs = resp.json().get("logs", [])
    email_settings_logs = [log for log in logs if log.get("action") == "email_settings_updated"]
    if not email_settings_logs:
        error(f"No 'email_settings_updated' action found in audit logs after PUT")
        sys.exit(1)
    log(f"✓ Audit log contains 'email_settings_updated' action (found {len(email_settings_logs)} entries)")
except Exception as e:
    error(f"PUT email settings test failed: {e}")
    sys.exit(1)

# Test 7: PUT /api/admin/storage-settings - Update storage settings
test_step(7, "PUT /api/admin/storage-settings - Update blobToken (using EXACT env value)")
try:
    # 7a: PUT with EXACT blob token from env (to keep uploads working)
    resp = requests.put(f"{BASE_URL}/admin/storage-settings",
                       headers={"Authorization": f"Bearer {admin_token}"},
                       json={"blobToken": REAL_BLOB_TOKEN})
    if resp.status_code != 200:
        error(f"PUT storage settings failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    log(f"✓ PUT {{blobToken:'<EXACT env value>'}} -> 200")
    
    # 7b: GET storage-settings to verify changes
    resp = requests.get(f"{BASE_URL}/admin/storage-settings", headers={"Authorization": f"Bearer {admin_token}"})
    settings = resp.json().get("settings", {})
    
    if not settings.get("configured"):
        error(f"configured should be true, got: {settings.get('configured')}")
        sys.exit(1)
    if settings.get("source") != "admin":
        error(f"source should be 'admin' after PUT, got: {settings.get('source')}")
        sys.exit(1)
    token_masked = settings.get("tokenMasked", "")
    if not token_masked or "…" not in token_masked:
        error(f"tokenMasked should be present and masked, got: {token_masked}")
        sys.exit(1)
    log(f"✓ GET storage-settings confirms: configured=true, source='admin', tokenMasked='{token_masked}'")
    
    # CRITICAL: Verify full blob token is still NOT in response after PUT
    response_text = resp.text
    if REAL_BLOB_TOKEN in response_text:
        error(f"CRITICAL: Full blob token found in response after PUT! Response: {response_text}")
        sys.exit(1)
    log("✓ CRITICAL: Full blob token still NOT exposed after PUT")
    
    # 7c: GET audit-logs to verify storage_settings_updated action
    resp = requests.get(f"{BASE_URL}/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    logs = resp.json().get("logs", [])
    storage_settings_logs = [log for log in logs if log.get("action") == "storage_settings_updated"]
    if not storage_settings_logs:
        error(f"No 'storage_settings_updated' action found in audit logs after PUT")
        sys.exit(1)
    log(f"✓ Audit log contains 'storage_settings_updated' action (found {len(storage_settings_logs)} entries)")
except Exception as e:
    error(f"PUT storage settings test failed: {e}")
    sys.exit(1)

# Test 8: Regression tests - Contact, Upload, Health
test_step(8, "REGRESSION - Contact form, File upload, Health check")
try:
    # 8a: POST /api/contact
    resp = requests.post(f"{BASE_URL}/contact",
                        json={"name": "Integration Test", "email": "integtest@example.com", "message": "Testing integrations"})
    if resp.status_code != 200:
        error(f"Contact form failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    log("✓ POST /api/contact -> 200")
    
    # 8b: POST /api/admin/upload (with admin token)
    resp = requests.post(f"{BASE_URL}/admin/upload?filename=test_integrations.txt",
                        headers={
                            "Authorization": f"Bearer {admin_token}",
                            "Content-Type": "text/plain"
                        },
                        data="Integration test upload content")
    if resp.status_code != 200:
        error(f"File upload failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    upload_url = data.get("url", "")
    if "blob.vercel-storage.com" not in upload_url:
        error(f"Upload URL should contain 'blob.vercel-storage.com', got: {upload_url}")
        sys.exit(1)
    log(f"✓ POST /api/admin/upload -> 200 with blob URL: {upload_url[:60]}...")
    
    # 8c: GET /api/health
    resp = requests.get(f"{BASE_URL}/health")
    if resp.status_code != 200:
        error(f"Health check failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    log("✓ GET /api/health -> 200")
except Exception as e:
    error(f"Regression tests failed: {e}")
    sys.exit(1)

print("\n" + "="*80)
print("✅ ALL TESTS PASSED - Admin Integrations API is working correctly")
print("="*80)
print("\nSUMMARY:")
print("✓ Admin and student login working")
print("✓ GET /api/admin/email-settings returns correct structure with masked API key")
print("✓ GET /api/admin/storage-settings returns correct structure with masked token")
print("✓ CRITICAL: Full Resend API key and blob token NEVER exposed in any response")
print("✓ Authentication working (401 without token, 401 with student token)")
print("✓ POST /api/admin/email-settings/test sends test email successfully")
print("✓ GET /api/admin/audit-logs returns logs with test_email_sent action")
print("✓ PUT /api/admin/email-settings updates mailFrom and admissionsEmail")
print("✓ PUT /api/admin/storage-settings updates blobToken (using exact env value)")
print("✓ Audit log tracks all settings changes (email_settings_updated, storage_settings_updated)")
print("✓ REGRESSION: Contact form, file upload, and health check all working")
print("\n🔒 SECURITY VERIFIED: All secrets properly masked in API responses")
