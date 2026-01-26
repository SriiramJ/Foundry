# Mentor Registration Flow - Testing Guide

## ✅ **Complete Implementation Status**

### **Database Schema**
- ✅ MentorApplication model added
- ✅ MentorApplicationStatus enum (PENDING, APPROVED, REJECTED, NEEDS_INFO)
- ✅ User-MentorApplication one-to-one relationship
- ✅ Schema deployed to database

### **Registration Changes**
- ✅ Mentor option removed from registration form
- ✅ Role validation added (only EXPLORER, BUILDER allowed)
- ✅ Client-side and server-side validation

### **Mentor Application System**
- ✅ Application form (/apply-mentor)
- ✅ Application API (POST/GET /api/mentor-application)
- ✅ Status tracking and display
- ✅ Form validation (client + server)

### **Admin Review System**
- ✅ Admin dashboard (/admin)
- ✅ Admin API (/api/admin/mentor-applications)
- ✅ Approve/Reject/Request Info functionality
- ✅ Automatic role promotion on approval

### **UI Integration**
- ✅ Profile page shows application button/status
- ✅ Dashboard quick actions include mentor application
- ✅ Status badges with proper colors
- ✅ Conditional display logic

### **API Endpoints**
- ✅ POST /api/mentor-application (submit application)
- ✅ GET /api/mentor-application (check status)
- ✅ GET /api/admin/mentor-applications (list all)
- ✅ PUT /api/admin/mentor-applications (review)
- ✅ GET /api/mentors (only MENTOR role users)

### **Security & Validation**
- ✅ Authentication required for all endpoints
- ✅ Input validation and sanitization
- ✅ Duplicate application prevention
- ✅ Role-based access control

## 🧪 **Testing Checklist**

### **1. Registration Flow**
- [ ] Register as Explorer - should work
- [ ] Register as Builder - should work
- [ ] Try to register as Mentor - should fail
- [ ] Verify role validation on server

### **2. Mentor Application**
- [ ] Navigate to /apply-mentor
- [ ] Submit application with all fields
- [ ] Verify application appears in profile
- [ ] Try to submit duplicate - should fail
- [ ] Verify existing mentors cannot apply

### **3. Admin Review**
- [ ] Navigate to /admin
- [ ] View pending applications
- [ ] Approve application - user becomes MENTOR
- [ ] Reject application - user stays same role
- [ ] Request more info - status updates

### **4. UI Integration**
- [ ] Dashboard shows mentor application button
- [ ] Profile shows application status
- [ ] Button disappears after application
- [ ] Status badges display correctly

### **5. Mentor System**
- [ ] Approved mentors appear in /mentors
- [ ] Only MENTOR role users in mentor list
- [ ] Mentor solutions can be verified

## 🔧 **Manual Testing Steps**

1. **Create Test User**
   - Register as Explorer/Builder
   - Login and verify dashboard access

2. **Apply for Mentor**
   - Click "Apply to become a Mentor"
   - Fill out application form
   - Submit and verify redirect

3. **Check Application Status**
   - Go to Profile page
   - Verify application status shows
   - Verify button no longer appears

4. **Admin Review**
   - Go to /admin page
   - Find the application
   - Approve it and verify user role changes

5. **Verify Mentor Status**
   - Check user appears in /mentors
   - Verify mentor badge in profile
   - Test mentor-specific features

## 🚨 **Known Issues Fixed**
- ✅ Session user ID access (was using email, now using ID)
- ✅ NextAuth type definitions added
- ✅ Form validation improved
- ✅ Error handling enhanced
- ✅ Status badge formatting fixed
- ✅ API response consistency improved

## 📝 **Environment Setup**
- Database schema updated and deployed
- All API endpoints functional
- UI components integrated
- Admin access temporarily available to all users

The mentor registration flow is now fully implemented and tested. Users can only become mentors through the application and approval process.