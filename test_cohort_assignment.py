#!/usr/bin/env python3
"""
Cohort Assignment API Test Suite
Tests POST /api/admin/students/assign-cohort endpoint
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

# Global variables
admin_token = None
student_token = None
test_cohort_id = None
test_student_id = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_step_1_admin_login():
    """Step 1: Login admin -> adminToken"""
    print_test("Step 1: Admin Login")
    global admin_token
    
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
            return print_result(True, "Admin login successful")
        else:
            print(f"Response: {response.text}")
            return print_result(False, f"Admin login failed with status {response.status_code}")
    except Exception as e:
        return print_result(False, f"Admin login error: {str(e)}")

def test_step_2_create_cohort():
    """Step 2: POST /api/admin/cohorts to create test cohort"""
    print_test("Step 2: Create Test Cohort")
    global test_cohort_id
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/cohorts",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Assign Test Cohort",
                "track": "online",
                "startDate": "1 Sep 2026",
                "capacity": 20
            },
            timeout=10
        )
        print(f"Create cohort status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            test_cohort_id = data.get('cohort', {}).get('id')
            print(f"Cohort created with ID: {test_cohort_id}")
            return print_result(True, f"Cohort created successfully with ID: {test_cohort_id}")
        else:
            return print_result(False, f"Cohort creation failed with status {response.status_code}")
    except Exception as e:
        return print_result(False, f"Cohort creation error: {str(e)}")

def test_step_3_get_students():
    """Step 3: GET /api/admin/students and verify cohortId/cohortName fields"""
    print_test("Step 3: Get Students List")
    global test_student_id
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"Get students status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            students = data.get('students', [])
            print(f"Found {len(students)} students")
            
            # Check that each student has cohortId and cohortName fields
            all_have_fields = True
            for student in students:
                if 'cohortId' not in student or 'cohortName' not in student:
                    all_have_fields = False
                    print(f"Student {student.get('email')} missing cohortId or cohortName field")
                
                # Find the test student
                if student.get('email') == STUDENT_EMAIL:
                    test_student_id = student.get('id')
                    print(f"Found test student: {STUDENT_EMAIL} with ID: {test_student_id}")
                    print(f"  Current cohortId: {student.get('cohortId')}")
                    print(f"  Current cohortName: {student.get('cohortName')}")
            
            if not test_student_id:
                return print_result(False, f"Test student {STUDENT_EMAIL} not found in students list")
            
            if not all_have_fields:
                return print_result(False, "Not all students have cohortId and cohortName fields")
            
            return print_result(True, f"All students have cohortId/cohortName fields. Test student ID: {test_student_id}")
        else:
            print(f"Response: {response.text}")
            return print_result(False, f"Get students failed with status {response.status_code}")
    except Exception as e:
        return print_result(False, f"Get students error: {str(e)}")

def test_step_4_assign_cohort():
    """Step 4: POST /api/admin/students/assign-cohort to assign student to cohort"""
    print_test("Step 4: Assign Student to Cohort")
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "studentId": test_student_id,
                "cohortId": test_cohort_id
            },
            timeout=10
        )
        print(f"Assign cohort status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            # Verify the assignment by getting students again
            verify_response = requests.get(
                f"{BASE_URL}/admin/students",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            if verify_response.status_code == 200:
                students = verify_response.json().get('students', [])
                test_student = next((s for s in students if s.get('id') == test_student_id), None)
                
                if test_student:
                    cohort_id = test_student.get('cohortId')
                    cohort_name = test_student.get('cohortName')
                    print(f"After assignment - cohortId: {cohort_id}, cohortName: {cohort_name}")
                    
                    if cohort_id == test_cohort_id and cohort_name == "Assign Test Cohort":
                        return print_result(True, f"Student assigned successfully. cohortId={cohort_id}, cohortName={cohort_name}")
                    else:
                        return print_result(False, f"Assignment verification failed. Expected cohortId={test_cohort_id}, got {cohort_id}. Expected cohortName='Assign Test Cohort', got '{cohort_name}'")
                else:
                    return print_result(False, "Could not find test student in verification")
            else:
                return print_result(False, f"Verification GET failed with status {verify_response.status_code}")
        else:
            return print_result(False, f"Assign cohort failed with status {response.status_code}")
    except Exception as e:
        return print_result(False, f"Assign cohort error: {str(e)}")

def test_step_5_unassign_cohort():
    """Step 5: Unassign student from cohort (cohortId: null)"""
    print_test("Step 5: Unassign Student from Cohort")
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "studentId": test_student_id,
                "cohortId": None
            },
            timeout=10
        )
        print(f"Unassign cohort status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            # Verify the unassignment by getting students again
            verify_response = requests.get(
                f"{BASE_URL}/admin/students",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            if verify_response.status_code == 200:
                students = verify_response.json().get('students', [])
                test_student = next((s for s in students if s.get('id') == test_student_id), None)
                
                if test_student:
                    cohort_id = test_student.get('cohortId')
                    cohort_name = test_student.get('cohortName')
                    print(f"After unassignment - cohortId: {cohort_id}, cohortName: {cohort_name}")
                    
                    if cohort_id is None and cohort_name is None:
                        return print_result(True, f"Student unassigned successfully. cohortId=null, cohortName=null")
                    else:
                        return print_result(False, f"Unassignment verification failed. Expected cohortId=null, got {cohort_id}. Expected cohortName=null, got '{cohort_name}'")
                else:
                    return print_result(False, "Could not find test student in verification")
            else:
                return print_result(False, f"Verification GET failed with status {verify_response.status_code}")
        else:
            return print_result(False, f"Unassign cohort failed with status {response.status_code}")
    except Exception as e:
        return print_result(False, f"Unassign cohort error: {str(e)}")

def test_step_6_error_cases():
    """Step 6: Test error cases"""
    print_test("Step 6: Error Cases")
    
    all_passed = True
    
    # Test 6a: Missing studentId
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"cohortId": test_cohort_id},
            timeout=10
        )
        print(f"6a. Missing studentId - status: {response.status_code}")
        if response.status_code == 400:
            print_result(True, "Missing studentId correctly returns 400")
        else:
            print_result(False, f"Missing studentId should return 400, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Missing studentId test error: {str(e)}")
        all_passed = False
    
    # Test 6b: Invalid studentId
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"studentId": "does-not-exist", "cohortId": test_cohort_id},
            timeout=10
        )
        print(f"6b. Invalid studentId - status: {response.status_code}")
        if response.status_code == 404:
            print_result(True, "Invalid studentId correctly returns 404")
        else:
            print_result(False, f"Invalid studentId should return 404, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Invalid studentId test error: {str(e)}")
        all_passed = False
    
    # Test 6c: Invalid cohortId
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"studentId": test_student_id, "cohortId": "nope"},
            timeout=10
        )
        print(f"6c. Invalid cohortId - status: {response.status_code}")
        if response.status_code == 404:
            print_result(True, "Invalid cohortId correctly returns 404")
        else:
            print_result(False, f"Invalid cohortId should return 404, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"Invalid cohortId test error: {str(e)}")
        all_passed = False
    
    return all_passed

def test_step_7_security():
    """Step 7: Test security - no token and student token"""
    print_test("Step 7: Security Tests")
    global student_token
    
    all_passed = True
    
    # Test 7a: No token
    try:
        response = requests.post(
            f"{BASE_URL}/admin/students/assign-cohort",
            json={"studentId": test_student_id, "cohortId": test_cohort_id},
            timeout=10
        )
        print(f"7a. No token - status: {response.status_code}")
        if response.status_code == 401:
            print_result(True, "No token correctly returns 401")
        else:
            print_result(False, f"No token should return 401, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_result(False, f"No token test error: {str(e)}")
        all_passed = False
    
    # Test 7b: Student token (should be rejected)
    try:
        # First login as student to get token
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
            timeout=10
        )
        
        if login_response.status_code == 200:
            student_token = login_response.json().get('token')
            print(f"Student token obtained: {student_token[:20]}...")
            
            # Try to use student token for admin endpoint
            response = requests.post(
                f"{BASE_URL}/admin/students/assign-cohort",
                headers={"Authorization": f"Bearer {student_token}"},
                json={"studentId": test_student_id, "cohortId": test_cohort_id},
                timeout=10
            )
            print(f"7b. Student token - status: {response.status_code}")
            if response.status_code == 401:
                print_result(True, "Student token correctly rejected with 401")
            else:
                print_result(False, f"Student token should be rejected with 401, got {response.status_code}")
                all_passed = False
        else:
            print_result(False, f"Could not login as student to get token")
            all_passed = False
    except Exception as e:
        print_result(False, f"Student token test error: {str(e)}")
        all_passed = False
    
    return all_passed

def main():
    print("\n" + "="*80)
    print("COHORT ASSIGNMENT API TEST SUITE")
    print("="*80)
    
    results = []
    
    # Run all test steps in sequence
    results.append(("Step 1: Admin Login", test_step_1_admin_login()))
    
    if not results[-1][1]:
        print("\n❌ Cannot proceed without admin token")
        sys.exit(1)
    
    results.append(("Step 2: Create Cohort", test_step_2_create_cohort()))
    
    if not results[-1][1]:
        print("\n❌ Cannot proceed without test cohort")
        sys.exit(1)
    
    results.append(("Step 3: Get Students", test_step_3_get_students()))
    
    if not results[-1][1]:
        print("\n❌ Cannot proceed without test student")
        sys.exit(1)
    
    results.append(("Step 4: Assign Cohort", test_step_4_assign_cohort()))
    results.append(("Step 5: Unassign Cohort", test_step_5_unassign_cohort()))
    results.append(("Step 6: Error Cases", test_step_6_error_cases()))
    results.append(("Step 7: Security", test_step_7_security()))
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({int(passed/total*100)}% success rate)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print(f"\n❌ {total - passed} test(s) failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
