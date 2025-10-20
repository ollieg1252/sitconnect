# BabySitter Connect - Testing Guide

## How to Test the App

### ✅ Step 1: Create Your First Account

Since this is a new app, **you need to create an account before you can log in**.

1. Click on **"Sign up"** button on the login screen
2. Choose either **Student Babysitter** or **Parent** tab
3. Fill in the required fields (marked with *)
   - First Name
   - Last Name
   - Email (use any valid email format, like `test@example.com`)
   - Password (at least 6 characters)
   - Confirm Password
4. Optionally fill in additional profile information
5. Click **"Create Account"**

The app will automatically:
- Create your account in Supabase
- Sign you in
- Take you to your dashboard

### ✅ Step 2: Test the Login

Once you've created an account, you can test logging in:

1. Log out from your account (if logged in)
2. Go to the login screen
3. Enter your email and password
4. Click **"Sign In"**

### 🧪 Test Scenarios

#### As a Parent:
1. **Sign up** as a parent
2. **Create a babysitting notice** from your dashboard
3. Fill in all the required details:
   - Title (e.g., "Need babysitter for Friday night")
   - Description
   - Date & Time
   - Location
   - Pay Rate
   - Duration
   - Age Group
4. View your posted notices on the dashboard

#### As a Student:
1. **Sign up** as a student
2. Browse available **babysitting notices** on your dashboard
3. Click on a notice to **view details**
4. Click **"Apply"** to submit an application
5. View your applications (feature coming soon!)

#### As Both (Testing Full Flow):
1. Create a **parent account** and post a notice
2. Log out
3. Create a **student account** and apply to the notice
4. Log out and log back in as the parent
5. Review the applications (feature coming soon!)

### ❌ Common Errors & Solutions

**"Invalid login credentials"**
- ✅ Solution: You need to create an account first using the Sign Up page

**"Missing required fields"**
- ✅ Solution: Make sure all fields marked with * are filled in

**"Passwords do not match"**
- ✅ Solution: Ensure your password and confirm password are exactly the same

**"Password must be at least 6 characters long"**
- ✅ Solution: Use a longer password

### 🔍 Checking the Console

If you encounter any errors, check the browser console (F12 or right-click → Inspect → Console tab) for detailed error messages. The app now includes detailed logging to help debug issues.

### 📝 Sample Test Accounts

You can create these test accounts for testing:

**Parent Account:**
- Email: `parent@test.com`
- Password: `password123`
- Name: Sarah Johnson

**Student Account:**
- Email: `student@test.com`
- Password: `password123`
- Name: Alex Smith

---

## Next Steps

After testing basic functionality, we can build:
- ✨ Review Applications screen (for parents to choose babysitters)
- ✨ My Applications screen (for students to track their applications)
- ✨ Profile editing
- ✨ Better UI polish and mobile responsiveness
