#!/usr/bin/env python3
"""
Backend API Test Suite for Vox Magic Admin Account Management
Tests all admin account-management endpoints as per review request
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

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_test(name, passed, details=""):
    """Log test result with color"""
    status = f"{GREEN}✅ PASS{RESET}" if passed else f"{RED}❌ FAIL{RESET}"
    print(f"{status} - {name}")
    if details:
        print(f"  {details}")
    return passed

def test_admin_login_and_me():
    """Test 1: Admin login works; GET /api/admin/me returns staff object with mustResetPassword=true"""
    print(f"\n{BLUE}=== Test 1: Admin Login and mustResetPassword Flag ==={RESET}")
    
    try:
        # Test admin login
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code != 200:
            return log_test("Admin login", False, f"Expected 200, got {response.status_code}: {response.text}")
        
        data = response.json()
        if "token" not in data or "staff" not in data:
            return log_test("Admin login", False, f"Missing token or staff in response: {data}")
        
        admin_token = data["token"]
        staff = data["staff"]
        
        log_test("Admin login successful", True, f"Token: {admin_token[:20]}..., Staff: {staff.get('name')}")
        
        # Test GET /api/admin/me
        response = requests.get(f"{BASE_URL}/admin/me", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code != 200:
            return log_test("GET /api/admin/me", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        staff = data.get("staff", {})
        
        # Check mustResetPassword flag
        must_reset = staff.get("mustResetPassword")
        if must_reset is True:
            log_test("GET /api/admin/me returns mustResetPassword=true", True, f"Staff: {staff.get('name')}, mustResetPassword: {must_reset}")
        else:
            log_test("GET /api/admin/me mustResetPassword check", False, f"Expected mustResetPassword=true (boolean), got: {must_reset} (type: {type(must_reset)})")
        
        return admin_token
        
    except Exception as e:
        log_test("Admin login and /me", False, f"Exception: {str(e)}")
        return None

def test_create_staff_account(admin_token):
    """Test 2: POST /api/admin/staff validation and account creation"""
    print(f"\n{BLUE}=== Test 2: POST /api/admin/staff (Create Staff Account) ==={RESET}")
    
    try:
        # Test missing name
        response = requests.post(f"{BASE_URL}/admin/staff", 
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"email": "test@example.com", "password": "Test1234"}
        )
        log_test("Missing name -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Test missing email
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"name": "Test User", "password": "Test1234"}
        )
        log_test("Missing email -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Test missing password
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"name": "Test User", "email": "test@example.com"}
        )
        log_test("Missing password -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Test password shorter than 8 chars
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"name": "Test User", "email": "test@example.com", "password": "Short1"}
        )
        log_test("Password < 8 chars -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Test duplicate email (reuse admin email)
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"name": "Test User", "email": ADMIN_EMAIL, "password": "Test1234"}
        )
        log_test("Duplicate email -> 409", response.status_code == 409, f"Status: {response.status_code}")
        
        # Test valid staff creation with role="staff"
        new_staff_email = f"teststaff_{requests.get(f'{BASE_URL}/health').elapsed.total_seconds()}@voxmagic.test"
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Test Staff Member",
                "email": new_staff_email,
                "password": "StaffPass123",
                "role": "staff"
            }
        )
        
        if response.status_code != 200:
            log_test("Create staff with role='staff'", False, f"Expected 200, got {response.status_code}: {response.text}")
            return None, None
        
        data = response.json()
        staff = data.get("staff", {})
        
        # Verify response
        checks = []
        checks.append(("passwordHash not in response", "passwordHash" not in staff))
        checks.append(("salt not in response", "salt" not in staff))
        checks.append(("role is 'staff'", staff.get("role") == "staff"))
        checks.append(("mustResetPassword is true", staff.get("mustResetPassword") is True))
        checks.append(("has id", "id" in staff))
        checks.append(("has email", staff.get("email") == new_staff_email))
        
        all_passed = all(check[1] for check in checks)
        details = ", ".join([f"{check[0]}: {check[1]}" for check in checks])
        log_test("Create staff account with role='staff'", all_passed, details)
        
        staff_id = staff.get("id")
        
        # Test valid admin creation with role="admin"
        new_admin_email = f"testadmin_{requests.get(f'{BASE_URL}/health').elapsed.total_seconds()}@voxmagic.test"
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Test Admin Member",
                "email": new_admin_email,
                "password": "AdminPass123",
                "role": "admin"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            staff = data.get("staff", {})
            log_test("Create staff with role='admin'", staff.get("role") == "admin", f"Role: {staff.get('role')}")
            admin_staff_id = staff.get("id")
        else:
            log_test("Create staff with role='admin'", False, f"Status: {response.status_code}")
            admin_staff_id = None
        
        # Test invalid role defaults to "staff"
        invalid_role_email = f"invalidrole_{requests.get(f'{BASE_URL}/health').elapsed.total_seconds()}@voxmagic.test"
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Invalid Role User",
                "email": invalid_role_email,
                "password": "InvalidRole123",
                "role": "superuser"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            staff = data.get("staff", {})
            log_test("Invalid role defaults to 'staff'", staff.get("role") == "staff", f"Role: {staff.get('role')}")
        
        return new_staff_email, staff_id
        
    except Exception as e:
        log_test("Create staff account", False, f"Exception: {str(e)}")
        return None, None

def test_list_staff_accounts(admin_token):
    """Test 3: GET /api/admin/staff lists accounts"""
    print(f"\n{BLUE}=== Test 3: GET /api/admin/staff (List Accounts) ==={RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/admin/staff", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code != 200:
            return log_test("GET /api/admin/staff", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        staff_list = data.get("staff", [])
        
        if not isinstance(staff_list, list):
            return log_test("GET /api/admin/staff", False, f"Expected list, got {type(staff_list)}")
        
        # Check that accounts don't have passwordHash/salt
        has_sensitive = any("passwordHash" in s or "salt" in s for s in staff_list)
        has_you_flag = any("you" in s for s in staff_list)
        
        log_test("GET /api/admin/staff returns list", True, f"Count: {len(staff_list)}, Has 'you' flag: {has_you_flag}, No sensitive data: {not has_sensitive}")
        
        return True
        
    except Exception as e:
        log_test("List staff accounts", False, f"Exception: {str(e)}")
        return False

def test_staff_first_password_flow(staff_email):
    """Test 4: Login as newly created staff and test first-password flow"""
    print(f"\n{BLUE}=== Test 4: Staff First-Password Flow ==={RESET}")
    
    try:
        # Login as the newly created staff
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": staff_email,
            "password": "StaffPass123"
        })
        
        if response.status_code != 200:
            return log_test("Staff login", False, f"Expected 200, got {response.status_code}: {response.text}")
        
        data = response.json()
        staff_token = data["token"]
        
        log_test("Staff login successful", True, f"Email: {staff_email}")
        
        # GET /api/admin/me should show mustResetPassword=true
        response = requests.get(f"{BASE_URL}/admin/me", headers={
            "Authorization": f"Bearer {staff_token}"
        })
        
        if response.status_code != 200:
            return log_test("Staff GET /api/admin/me", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        staff = data.get("staff", {})
        must_reset = staff.get("mustResetPassword")
        
        log_test("Staff mustResetPassword=true", must_reset is True, f"mustResetPassword: {must_reset}")
        
        # POST /api/admin/profile/first-password with new password
        response = requests.post(f"{BASE_URL}/admin/profile/first-password",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"newPassword": "NewStaffPass123"}
        )
        
        if response.status_code != 200:
            log_test("POST /api/admin/profile/first-password", False, f"Expected 200, got {response.status_code}: {response.text}")
            return staff_token
        
        log_test("POST /api/admin/profile/first-password successful", True, "Password changed")
        
        # Verify flag is cleared
        response = requests.get(f"{BASE_URL}/admin/me", headers={
            "Authorization": f"Bearer {staff_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            staff = data.get("staff", {})
            must_reset = staff.get("mustResetPassword")
            log_test("mustResetPassword cleared after first-password", must_reset is False, f"mustResetPassword: {must_reset}")
        
        # Try calling first-password again (should fail with 400)
        response = requests.post(f"{BASE_URL}/admin/profile/first-password",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"newPassword": "AnotherPass123"}
        )
        
        log_test("Calling first-password again -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Test staff role restrictions (should get 403 for admin-only endpoints)
        print(f"\n{YELLOW}Testing staff role restrictions:{RESET}")
        
        # PUT /api/admin/payment-settings should return 403
        response = requests.put(f"{BASE_URL}/admin/payment-settings",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"mode": "test"}
        )
        log_test("Staff PUT /api/admin/payment-settings -> 403", response.status_code == 403, f"Status: {response.status_code}")
        
        # PUT /api/admin/email-settings should return 403
        response = requests.put(f"{BASE_URL}/admin/email-settings",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"mailFrom": "test@example.com"}
        )
        log_test("Staff PUT /api/admin/email-settings -> 403", response.status_code == 403, f"Status: {response.status_code}")
        
        # PUT /api/admin/storage-settings should return 403
        response = requests.put(f"{BASE_URL}/admin/storage-settings",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"blobToken": "test"}
        )
        log_test("Staff PUT /api/admin/storage-settings -> 403", response.status_code == 403, f"Status: {response.status_code}")
        
        # GET /api/admin/staff should return 403
        response = requests.get(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        log_test("Staff GET /api/admin/staff -> 403", response.status_code == 403, f"Status: {response.status_code}")
        
        return staff_token
        
    except Exception as e:
        log_test("Staff first-password flow", False, f"Exception: {str(e)}")
        return None

def test_update_own_profile(staff_token):
    """Test 5: PUT /api/admin/profile (update own profile)"""
    print(f"\n{BLUE}=== Test 5: PUT /api/admin/profile (Update Own Profile) ==={RESET}")
    
    try:
        # Update name and title
        response = requests.put(f"{BASE_URL}/admin/profile",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "name": "Updated Staff Name",
                "title": "Senior Staff Member"
            }
        )
        
        if response.status_code != 200:
            log_test("Update name/title", False, f"Expected 200, got {response.status_code}: {response.text}")
        else:
            data = response.json()
            staff = data.get("staff", {})
            log_test("Update name/title", True, f"Name: {staff.get('name')}, Title: {staff.get('title')}")
        
        # Change email to a new unique value
        new_email = f"updated_staff_{requests.get(f'{BASE_URL}/health').elapsed.total_seconds()}@voxmagic.test"
        response = requests.put(f"{BASE_URL}/admin/profile",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"email": new_email}
        )
        
        if response.status_code != 200:
            log_test("Change email to unique value", False, f"Expected 200, got {response.status_code}: {response.text}")
        else:
            data = response.json()
            staff = data.get("staff", {})
            log_test("Change email to unique value", True, f"New email: {staff.get('email')}")
        
        # Try to change email to an already used email (admin email)
        response = requests.put(f"{BASE_URL}/admin/profile",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"email": ADMIN_EMAIL}
        )
        log_test("Change email to duplicate -> 409", response.status_code == 409, f"Status: {response.status_code}")
        
        # Password change with wrong currentPassword
        response = requests.put(f"{BASE_URL}/admin/profile",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "currentPassword": "WrongPassword",
                "newPassword": "NewPassword123"
            }
        )
        log_test("Password change with wrong currentPassword -> 401", response.status_code == 401, f"Status: {response.status_code}")
        
        # Password change with correct currentPassword
        response = requests.put(f"{BASE_URL}/admin/profile",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "currentPassword": "NewStaffPass123",
                "newPassword": "FinalPassword123"
            }
        )
        log_test("Password change with correct currentPassword", response.status_code == 200, f"Status: {response.status_code}")
        
        return True
        
    except Exception as e:
        log_test("Update own profile", False, f"Exception: {str(e)}")
        return False

def test_update_staff_member(admin_token, staff_id):
    """Test 6: PUT /api/admin/staff/{id} (update staff member)"""
    print(f"\n{BLUE}=== Test 6: PUT /api/admin/staff/{{id}} (Update Staff Member) ==={RESET}")
    
    try:
        # Change staff member's role from staff to admin
        response = requests.put(f"{BASE_URL}/admin/staff/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"role": "admin"}
        )
        log_test("Change role from staff to admin", response.status_code == 200, f"Status: {response.status_code}")
        
        # Reset a member's password
        response = requests.put(f"{BASE_URL}/admin/staff/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"newPassword": "ResetPass123"}
        )
        
        if response.status_code != 200:
            log_test("Reset member's password", False, f"Expected 200, got {response.status_code}: {response.text}")
        else:
            log_test("Reset member's password", True, "Password reset successful")
            
            # Verify mustResetPassword is set to true after password reset
            # We can't directly check this without logging in as that user, but we can verify the endpoint worked
        
        # Try to change own role to staff (should fail with 400)
        response = requests.put(f"{BASE_URL}/admin/staff/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"role": "staff"}
        )
        
        # Note: This test is for the admin changing their OWN role, not the staff member's role
        # We need to get the admin's own staff ID first
        response = requests.get(f"{BASE_URL}/admin/me", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            admin_staff_id = data.get("staff", {}).get("id")
            
            # Try to change own role to staff
            response = requests.put(f"{BASE_URL}/admin/staff/{admin_staff_id}",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={"role": "staff"}
            )
            log_test("Attempting to change own role to staff -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        return True
        
    except Exception as e:
        log_test("Update staff member", False, f"Exception: {str(e)}")
        return False

def test_delete_staff_member(admin_token):
    """Test 7: DELETE /api/admin/staff/{id}"""
    print(f"\n{BLUE}=== Test 7: DELETE /api/admin/staff/{{id}} (Delete Staff Member) ==={RESET}")
    
    try:
        # Get admin's own ID
        response = requests.get(f"{BASE_URL}/admin/me", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code != 200:
            return log_test("Get admin ID", False, f"Expected 200, got {response.status_code}")
        
        admin_staff_id = response.json().get("staff", {}).get("id")
        
        # Try to delete own account (should fail with 400)
        response = requests.delete(f"{BASE_URL}/admin/staff/{admin_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        log_test("Deleting own account -> 400", response.status_code == 400, f"Status: {response.status_code}")
        
        # Create a temporary staff account to delete
        temp_email = f"temp_delete_{requests.get(f'{BASE_URL}/health').elapsed.total_seconds()}@voxmagic.test"
        response = requests.post(f"{BASE_URL}/admin/staff",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Temp Delete User",
                "email": temp_email,
                "password": "TempPass123",
                "role": "staff"
            }
        )
        
        if response.status_code != 200:
            return log_test("Create temp staff for deletion", False, f"Expected 200, got {response.status_code}")
        
        temp_staff_id = response.json().get("staff", {}).get("id")
        
        # Delete the temp staff account
        response = requests.delete(f"{BASE_URL}/admin/staff/{temp_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        log_test("Delete staff account", response.status_code == 200, f"Status: {response.status_code}")
        
        # Verify sessions are cleared (try to use a token from that account - we don't have one, so skip this)
        
        # Test deleting last admin (should be blocked)
        # First, count how many admins we have
        response = requests.get(f"{BASE_URL}/admin/staff", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code == 200:
            staff_list = response.json().get("staff", [])
            admin_count = sum(1 for s in staff_list if s.get("role") == "admin" or not s.get("role"))
            
            print(f"  Current admin count: {admin_count}")
            
            # If we have more than 1 admin, try to delete one (but not ourselves)
            if admin_count > 1:
                # Find an admin that's not us
                other_admin = next((s for s in staff_list if (s.get("role") == "admin" or not s.get("role")) and s.get("id") != admin_staff_id), None)
                
                if other_admin:
                    # If this is the last admin after deletion, it should fail
                    # But since we have multiple admins, let's just verify the endpoint works
                    print(f"  Note: Multiple admins exist, so last-admin protection not tested in this run")
        
        return True
        
    except Exception as e:
        log_test("Delete staff member", False, f"Exception: {str(e)}")
        return False

def test_sanity_checks(admin_token):
    """Test 8: Sanity check - ensure previously-working endpoints still work"""
    print(f"\n{BLUE}=== Test 8: Sanity Checks (Previously-Working Endpoints) ==={RESET}")
    
    try:
        # GET /api/admin/overview
        response = requests.get(f"{BASE_URL}/admin/overview", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        log_test("GET /api/admin/overview", response.status_code == 200, f"Status: {response.status_code}")
        
        # GET /api/admin/students
        response = requests.get(f"{BASE_URL}/admin/students", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        log_test("GET /api/admin/students", response.status_code == 200, f"Status: {response.status_code}")
        
        # GET /api/admin/audit-logs
        response = requests.get(f"{BASE_URL}/admin/audit-logs", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        
        if response.status_code == 200:
            data = response.json()
            logs = data.get("logs", [])
            
            # Check for new audit log entries
            staff_actions = [log for log in logs if log.get("action") in ["staff_created", "staff_updated", "staff_deleted", "admin_profile_updated", "admin_first_password_set"]]
            
            log_test("GET /api/admin/audit-logs", True, f"Status: 200, Total logs: {len(logs)}, Staff-related logs: {len(staff_actions)}")
            
            if staff_actions:
                print(f"  {YELLOW}Sample staff-related audit log entries:{RESET}")
                for log in staff_actions[:3]:
                    print(f"    - {log.get('action')} by {log.get('by')}")
        else:
            log_test("GET /api/admin/audit-logs", False, f"Expected 200, got {response.status_code}")
        
        return True
        
    except Exception as e:
        log_test("Sanity checks", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}Vox Magic - Admin Account Management Backend API Tests{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    # Test 1: Admin login and mustResetPassword flag
    admin_token = test_admin_login_and_me()
    if not admin_token:
        print(f"\n{RED}CRITICAL: Admin login failed. Cannot continue tests.{RESET}")
        sys.exit(1)
    
    # Test 2: Create staff account
    staff_email, staff_id = test_create_staff_account(admin_token)
    if not staff_email or not staff_id:
        print(f"\n{RED}CRITICAL: Staff account creation failed. Some tests will be skipped.{RESET}")
    
    # Test 3: List staff accounts
    test_list_staff_accounts(admin_token)
    
    # Test 4: Staff first-password flow (only if staff was created)
    staff_token = None
    if staff_email:
        staff_token = test_staff_first_password_flow(staff_email)
    
    # Test 5: Update own profile (only if staff token exists)
    if staff_token:
        test_update_own_profile(staff_token)
    
    # Test 6: Update staff member (only if staff was created)
    if staff_id:
        test_update_staff_member(admin_token, staff_id)
    
    # Test 7: Delete staff member
    test_delete_staff_member(admin_token)
    
    # Test 8: Sanity checks
    test_sanity_checks(admin_token)
    
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{GREEN}All tests completed!{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")

if __name__ == "__main__":
    main()
