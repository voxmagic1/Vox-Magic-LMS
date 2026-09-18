#!/usr/bin/env python3
"""
Admin LMS Manager API Test Suite for Vox Magic
Tests the new DB-driven LMS with admin management endpoints
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

# Global tokens and data
admin_token = None
student_token = None
student_id = None
original_config = None
bonus_lesson_id = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_step_1_auth_and_get_config():
    """
    Step 1: Login admin -> adminToken. GET /api/admin/lms (adminToken) -> 200 with config 
    containing modules (3), schedule (3), assignments (3), resources (4). 
    GET /api/admin/lms with NO token -> 401. 
    Login student -> studentToken; GET /api/admin/lms with studentToken -> MUST be 401.
    """
    print_test("Step 1: Authentication and GET /api/admin/lms")
    global admin_token, student_token, student_id, original_config
    
    # 1a. Admin login
    try:
        print("\n1a. Admin login...")
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Admin login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("token")
            staff = data.get("staff", {})
            
            if admin_token:
                print_result(True, f"Admin login successful. Staff: {staff.get('name', 'N/A')}")
            else:
                print_result(False, "Admin login returned 200 but missing token")
                return False
        else:
            print_result(False, f"Admin login failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Admin login exception: {str(e)}")
        return False
    
    # 1b. GET /api/admin/lms with admin token
    try:
        print("\n1b. GET /api/admin/lms with admin token...")
        response = requests.get(
            f"{BASE_URL}/admin/lms",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"GET /api/admin/lms status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            config = data.get("config", {})
            original_config = config
            
            modules = config.get("modules", [])
            schedule = config.get("schedule", [])
            assignments = config.get("assignments", [])
            resources = config.get("resources", [])
            
            print(f"Config structure: modules={len(modules)}, schedule={len(schedule)}, assignments={len(assignments)}, resources={len(resources)}")
            
            if len(modules) == 3 and len(schedule) == 3 and len(assignments) == 3 and len(resources) == 4:
                print_result(True, f"GET /api/admin/lms returned correct config: 3 modules, 3 schedule, 3 assignments, 4 resources")
            else:
                print_result(False, f"Config counts incorrect. Expected (3,3,3,4), got ({len(modules)},{len(schedule)},{len(assignments)},{len(resources)})")
                return False
        else:
            print_result(False, f"GET /api/admin/lms failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/admin/lms exception: {str(e)}")
        return False
    
    # 1c. GET /api/admin/lms with NO token
    try:
        print("\n1c. GET /api/admin/lms with NO token...")
        response = requests.get(f"{BASE_URL}/admin/lms", timeout=10)
        print(f"GET /api/admin/lms (no token) status: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "GET /api/admin/lms without token correctly returns 401")
        else:
            print_result(False, f"GET /api/admin/lms without token should return 401, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/admin/lms no token exception: {str(e)}")
        return False
    
    # 1d. Student login
    try:
        print("\n1d. Student login...")
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
            timeout=10
        )
        print(f"Student login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            student_token = data.get("token")
            student_data = data.get("student", {})
            student_id = student_data.get("id")
            
            if student_token:
                print_result(True, f"Student login successful. Student ID: {student_id}")
            else:
                print_result(False, "Student login returned 200 but missing token")
                return False
        else:
            print_result(False, f"Student login failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Student login exception: {str(e)}")
        return False
    
    # 1e. GET /api/admin/lms with STUDENT token (CRITICAL SECURITY CHECK)
    try:
        print("\n1e. GET /api/admin/lms with STUDENT token (CRITICAL SECURITY CHECK)...")
        response = requests.get(
            f"{BASE_URL}/admin/lms",
            headers={"Authorization": f"Bearer {student_token}"},
            timeout=10
        )
        print(f"GET /api/admin/lms (student token) status: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "🔒 CRITICAL SECURITY CHECK PASSED: Student token correctly rejected from /api/admin/lms (401)")
            return True
        else:
            print_result(False, f"🚨 CRITICAL SECURITY FAILURE: Student token should be rejected (401), got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/admin/lms with student token exception: {str(e)}")
        return False

def test_step_2_put_admin_lms():
    """
    Step 2: PUT /api/admin/lms (adminToken): take the config from step 1, 
    ADD a new schedule entry {title:"Admin Test Class", date:"Fri", time:"7PM", mode:"Online", joinUrl:"https://meet.google.com/x"} 
    and ADD a new module {title:"Bonus Month", weeks:"Extra", lessons:[{title:"Bonus Lesson", duration:"10 min", recordingUrl:"#"}]}. 
    Send the full config back. Expect 200 and the returned config should have auto-generated ids on the new items.
    """
    print_test("Step 2: PUT /api/admin/lms - Add new schedule and module")
    global original_config
    
    try:
        # Create modified config
        modified_config = {
            "modules": original_config.get("modules", []).copy(),
            "schedule": original_config.get("schedule", []).copy(),
            "assignments": original_config.get("assignments", []).copy(),
            "resources": original_config.get("resources", []).copy(),
        }
        
        # Add new schedule entry (without id - should be auto-generated)
        new_schedule = {
            "title": "Admin Test Class",
            "date": "Fri",
            "time": "7PM",
            "mode": "Online",
            "joinUrl": "https://meet.google.com/x"
        }
        modified_config["schedule"].append(new_schedule)
        
        # Add new module with lesson (without ids - should be auto-generated)
        new_module = {
            "title": "Bonus Month",
            "weeks": "Extra",
            "lessons": [
                {
                    "title": "Bonus Lesson",
                    "duration": "10 min",
                    "recordingUrl": "#"
                }
            ]
        }
        modified_config["modules"].append(new_module)
        
        print(f"\nSending PUT request with modified config...")
        print(f"Schedule count: {len(modified_config['schedule'])} (was {len(original_config.get('schedule', []))})")
        print(f"Modules count: {len(modified_config['modules'])} (was {len(original_config.get('modules', []))})")
        
        response = requests.put(
            f"{BASE_URL}/admin/lms",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"config": modified_config},
            timeout=10
        )
        print(f"PUT /api/admin/lms status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            returned_config = data.get("config", {})
            
            # Verify schedule has auto-generated id
            returned_schedule = returned_config.get("schedule", [])
            admin_test_class = None
            for s in returned_schedule:
                if s.get("title") == "Admin Test Class":
                    admin_test_class = s
                    break
            
            if not admin_test_class:
                print_result(False, "New schedule 'Admin Test Class' not found in returned config")
                return False
            
            if not admin_test_class.get("id"):
                print_result(False, "New schedule 'Admin Test Class' missing auto-generated id")
                return False
            
            print(f"✓ New schedule has auto-generated id: {admin_test_class.get('id')}")
            
            # Verify module has auto-generated id and lesson has id
            returned_modules = returned_config.get("modules", [])
            bonus_module = None
            for m in returned_modules:
                if m.get("title") == "Bonus Month":
                    bonus_module = m
                    break
            
            if not bonus_module:
                print_result(False, "New module 'Bonus Month' not found in returned config")
                return False
            
            if not bonus_module.get("id"):
                print_result(False, "New module 'Bonus Month' missing auto-generated id")
                return False
            
            print(f"✓ New module has auto-generated id: {bonus_module.get('id')}")
            
            bonus_lessons = bonus_module.get("lessons", [])
            if len(bonus_lessons) == 0:
                print_result(False, "New module 'Bonus Month' has no lessons")
                return False
            
            bonus_lesson = bonus_lessons[0]
            if not bonus_lesson.get("id"):
                print_result(False, "Bonus lesson missing auto-generated id")
                return False
            
            print(f"✓ Bonus lesson has auto-generated id: {bonus_lesson.get('id')}")
            
            print_result(True, f"PUT /api/admin/lms successful. New items have auto-generated IDs (schedule id: {admin_test_class.get('id')}, module id: {bonus_module.get('id')}, lesson id: {bonus_lesson.get('id')})")
            return True
        else:
            print_result(False, f"PUT /api/admin/lms failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"PUT /api/admin/lms exception: {str(e)}")
        return False

def test_step_3_student_get_lms():
    """
    Step 3: As STUDENT: GET /api/lms -> verify schedule now includes an item titled "Admin Test Class"; 
    modules include one titled "Bonus Month" containing "Bonus Lesson"; 
    and progress.total is now 13 (was 12). Capture the new bonus lesson's id.
    """
    print_test("Step 3: Student GET /api/lms - Verify new content")
    global bonus_lesson_id
    
    try:
        print("\nGET /api/lms as student...")
        response = requests.get(
            f"{BASE_URL}/lms",
            headers={"Authorization": f"Bearer {student_token}"},
            timeout=10
        )
        print(f"GET /api/lms status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check schedule includes "Admin Test Class"
            schedule = data.get("schedule", [])
            admin_test_class = None
            for s in schedule:
                if s.get("title") == "Admin Test Class":
                    admin_test_class = s
                    break
            
            if not admin_test_class:
                print_result(False, "Schedule does not include 'Admin Test Class'")
                return False
            
            print(f"✓ Schedule includes 'Admin Test Class'")
            
            # Check modules include "Bonus Month" with "Bonus Lesson"
            modules = data.get("modules", [])
            bonus_module = None
            for m in modules:
                if m.get("title") == "Bonus Month":
                    bonus_module = m
                    break
            
            if not bonus_module:
                print_result(False, "Modules do not include 'Bonus Month'")
                return False
            
            print(f"✓ Modules include 'Bonus Month'")
            
            bonus_lessons = bonus_module.get("lessons", [])
            bonus_lesson = None
            for l in bonus_lessons:
                if l.get("title") == "Bonus Lesson":
                    bonus_lesson = l
                    break
            
            if not bonus_lesson:
                print_result(False, "'Bonus Month' does not contain 'Bonus Lesson'")
                return False
            
            bonus_lesson_id = bonus_lesson.get("id")
            if not bonus_lesson_id:
                print_result(False, "'Bonus Lesson' missing id")
                return False
            
            print(f"✓ 'Bonus Month' contains 'Bonus Lesson' with id: {bonus_lesson_id}")
            
            # Check progress.total is now 13 (was 12)
            progress = data.get("progress", {})
            total = progress.get("total", 0)
            
            if total == 13:
                print(f"✓ progress.total is now 13 (was 12)")
                print_result(True, f"Student LMS verified: schedule includes 'Admin Test Class', modules include 'Bonus Month' with 'Bonus Lesson' (id: {bonus_lesson_id}), progress.total = 13")
                return True
            else:
                print_result(False, f"progress.total should be 13, got {total}")
                return False
        else:
            print_result(False, f"GET /api/lms failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/lms exception: {str(e)}")
        return False

def test_step_4_lesson_complete():
    """
    Step 4: As STUDENT: POST /api/lms/lesson/complete {lessonId: <bonus lesson id>} -> 200; 
    GET /api/lms -> that lesson.completed true and progress.done increased. 
    Also POST /api/lms/lesson/complete {lessonId:"totally-invalid"} -> 400.
    """
    print_test("Step 4: Student lesson completion")
    
    # 4a. Complete the bonus lesson
    try:
        print(f"\n4a. POST /api/lms/lesson/complete with bonus lesson id: {bonus_lesson_id}...")
        response = requests.post(
            f"{BASE_URL}/lms/lesson/complete",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"lessonId": bonus_lesson_id},
            timeout=10
        )
        print(f"POST /api/lms/lesson/complete status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            progress = data.get("progress", {})
            print(f"✓ Lesson completion successful. Progress: {progress}")
        else:
            print_result(False, f"POST /api/lms/lesson/complete failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"POST /api/lms/lesson/complete exception: {str(e)}")
        return False
    
    # 4b. Verify lesson.completed is true and progress.done increased
    try:
        print("\n4b. GET /api/lms to verify lesson completion...")
        response = requests.get(
            f"{BASE_URL}/lms",
            headers={"Authorization": f"Bearer {student_token}"},
            timeout=10
        )
        print(f"GET /api/lms status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Find the bonus lesson
            modules = data.get("modules", [])
            bonus_module = None
            for m in modules:
                if m.get("title") == "Bonus Month":
                    bonus_module = m
                    break
            
            if not bonus_module:
                print_result(False, "Bonus module not found")
                return False
            
            bonus_lessons = bonus_module.get("lessons", [])
            bonus_lesson = None
            for l in bonus_lessons:
                if l.get("id") == bonus_lesson_id:
                    bonus_lesson = l
                    break
            
            if not bonus_lesson:
                print_result(False, f"Bonus lesson with id {bonus_lesson_id} not found")
                return False
            
            if bonus_lesson.get("completed") != True:
                print_result(False, f"Bonus lesson completed should be true, got {bonus_lesson.get('completed')}")
                return False
            
            print(f"✓ Bonus lesson.completed is true")
            
            # Check progress.done increased
            progress = data.get("progress", {})
            done = progress.get("done", 0)
            
            if done > 0:
                print(f"✓ progress.done increased to {done}")
            else:
                print_result(False, f"progress.done should be > 0, got {done}")
                return False
        else:
            print_result(False, f"GET /api/lms failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/lms exception: {str(e)}")
        return False
    
    # 4c. Try to complete invalid lesson
    try:
        print("\n4c. POST /api/lms/lesson/complete with invalid lessonId...")
        response = requests.post(
            f"{BASE_URL}/lms/lesson/complete",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"lessonId": "totally-invalid"},
            timeout=10
        )
        print(f"POST /api/lms/lesson/complete (invalid) status: {response.status_code}")
        
        if response.status_code == 400:
            print(f"✓ Invalid lessonId correctly returns 400")
            print_result(True, "Lesson completion working: bonus lesson completed, progress increased, invalid lessonId returns 400")
            return True
        else:
            print_result(False, f"Invalid lessonId should return 400, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"POST /api/lms/lesson/complete (invalid) exception: {str(e)}")
        return False

def test_step_5_validation():
    """
    Step 5: Validation: PUT /api/admin/lms without token -> 401; PUT with {config:null} -> 400.
    """
    print_test("Step 5: Validation tests")
    
    # 5a. PUT without token
    try:
        print("\n5a. PUT /api/admin/lms without token...")
        response = requests.put(
            f"{BASE_URL}/admin/lms",
            json={"config": {"modules": [], "schedule": [], "assignments": [], "resources": []}},
            timeout=10
        )
        print(f"PUT /api/admin/lms (no token) status: {response.status_code}")
        
        if response.status_code == 401:
            print(f"✓ PUT without token correctly returns 401")
        else:
            print_result(False, f"PUT without token should return 401, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"PUT without token exception: {str(e)}")
        return False
    
    # 5b. PUT with config:null
    try:
        print("\n5b. PUT /api/admin/lms with config:null...")
        response = requests.put(
            f"{BASE_URL}/admin/lms",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"config": None},
            timeout=10
        )
        print(f"PUT /api/admin/lms (config:null) status: {response.status_code}")
        
        if response.status_code == 400:
            print(f"✓ PUT with config:null correctly returns 400")
            print_result(True, "Validation tests passed: PUT without token -> 401, PUT with config:null -> 400")
            return True
        else:
            print_result(False, f"PUT with config:null should return 400, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"PUT with config:null exception: {str(e)}")
        return False

def test_step_6_reset():
    """
    Step 6: POST /api/admin/lms/reset (adminToken) -> 200. 
    Then STUDENT GET /api/lms -> back to 3 modules and progress.total === 12; 
    schedule no longer has "Admin Test Class".
    """
    print_test("Step 6: Reset LMS config")
    
    # 6a. POST /api/admin/lms/reset
    try:
        print("\n6a. POST /api/admin/lms/reset...")
        response = requests.post(
            f"{BASE_URL}/admin/lms/reset",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"POST /api/admin/lms/reset status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            config = data.get("config", {})
            print(f"✓ Reset successful. Config returned with {len(config.get('modules', []))} modules")
        else:
            print_result(False, f"POST /api/admin/lms/reset failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"POST /api/admin/lms/reset exception: {str(e)}")
        return False
    
    # 6b. Student GET /api/lms to verify reset
    try:
        print("\n6b. Student GET /api/lms to verify reset...")
        response = requests.get(
            f"{BASE_URL}/lms",
            headers={"Authorization": f"Bearer {student_token}"},
            timeout=10
        )
        print(f"GET /api/lms status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check modules back to 3
            modules = data.get("modules", [])
            if len(modules) != 3:
                print_result(False, f"Modules should be 3 after reset, got {len(modules)}")
                return False
            
            print(f"✓ Modules back to 3")
            
            # Check progress.total back to 12
            progress = data.get("progress", {})
            total = progress.get("total", 0)
            
            if total != 12:
                print_result(False, f"progress.total should be 12 after reset, got {total}")
                return False
            
            print(f"✓ progress.total back to 12")
            
            # Check schedule no longer has "Admin Test Class"
            schedule = data.get("schedule", [])
            admin_test_class = None
            for s in schedule:
                if s.get("title") == "Admin Test Class":
                    admin_test_class = s
                    break
            
            if admin_test_class:
                print_result(False, "Schedule still contains 'Admin Test Class' after reset")
                return False
            
            print(f"✓ Schedule no longer has 'Admin Test Class'")
            
            print_result(True, f"Reset successful: 3 modules, progress.total = 12, 'Admin Test Class' removed")
            return True
        else:
            print_result(False, f"GET /api/lms failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/lms exception: {str(e)}")
        return False

def test_step_7_regression():
    """
    Step 7: Regression: STUDENT POST /api/lms/assignment/submit {assignmentId:"a1", content:"https://x.com/a"} -> 200; 
    admin GET /api/admin/submissions includes it; 
    admin POST /api/admin/submissions/grade {studentId:<student id>, assignmentId:"a1", grade:"B", feedback:"ok"} -> 200. 
    GET /api/content (public) 200. GET /api/health 200.
    """
    print_test("Step 7: Regression tests")
    
    # 7a. Student submit assignment
    try:
        print("\n7a. Student POST /api/lms/assignment/submit...")
        response = requests.post(
            f"{BASE_URL}/lms/assignment/submit",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"assignmentId": "a1", "content": "https://x.com/a"},
            timeout=10
        )
        print(f"POST /api/lms/assignment/submit status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ Student submitted assignment a1")
        else:
            print_result(False, f"POST /api/lms/assignment/submit failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"POST /api/lms/assignment/submit exception: {str(e)}")
        return False
    
    # 7b. Admin get submissions
    try:
        print("\n7b. Admin GET /api/admin/submissions...")
        response = requests.get(
            f"{BASE_URL}/admin/submissions",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        print(f"GET /api/admin/submissions status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            submissions = data.get("submissions", [])
            
            # Find a1 submission
            a1_submission = None
            for sub in submissions:
                if sub.get("assignmentId") == "a1" and sub.get("studentId") == student_id:
                    a1_submission = sub
                    break
            
            if a1_submission:
                print(f"✓ Admin submissions include a1 for student {student_id}")
            else:
                print_result(False, f"Admin submissions do not include a1 for student {student_id}")
                return False
        else:
            print_result(False, f"GET /api/admin/submissions failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/admin/submissions exception: {str(e)}")
        return False
    
    # 7c. Admin grade submission
    try:
        print("\n7c. Admin POST /api/admin/submissions/grade...")
        response = requests.post(
            f"{BASE_URL}/admin/submissions/grade",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"studentId": student_id, "assignmentId": "a1", "grade": "B", "feedback": "ok"},
            timeout=10
        )
        print(f"POST /api/admin/submissions/grade status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ Admin graded submission a1")
        else:
            print_result(False, f"POST /api/admin/submissions/grade failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"POST /api/admin/submissions/grade exception: {str(e)}")
        return False
    
    # 7d. GET /api/content (public)
    try:
        print("\n7d. GET /api/content (public)...")
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        print(f"GET /api/content status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ GET /api/content returns 200")
        else:
            print_result(False, f"GET /api/content failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/content exception: {str(e)}")
        return False
    
    # 7e. GET /api/health
    try:
        print("\n7e. GET /api/health...")
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"GET /api/health status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ GET /api/health returns 200")
            print_result(True, "Regression tests passed: assignment submit, admin grading, content, health all working")
            return True
        else:
            print_result(False, f"GET /api/health failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"GET /api/health exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("VOX MAGIC ADMIN LMS MANAGER API TEST SUITE")
    print("="*80)
    
    results = []
    
    # Run all test steps
    results.append(("Step 1: Auth and GET config", test_step_1_auth_and_get_config()))
    results.append(("Step 2: PUT admin/lms", test_step_2_put_admin_lms()))
    results.append(("Step 3: Student GET lms", test_step_3_student_get_lms()))
    results.append(("Step 4: Lesson complete", test_step_4_lesson_complete()))
    results.append(("Step 5: Validation", test_step_5_validation()))
    results.append(("Step 6: Reset", test_step_6_reset()))
    results.append(("Step 7: Regression", test_step_7_regression()))
    
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
    print(f"TOTAL: {passed}/{total} tests passed ({int(passed/total*100) if total > 0 else 0}%)")
    print("="*80)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
