-- NSS College Management System Seed Data

-- Passwords for default accounts: "password123" -> bcrypt hash "$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2"

USE nss_db;

-- 1. Departments
INSERT IGNORE INTO departments (id, code, name) VALUES
(1, 'IT', 'Information Technology'),
(2, 'CSE', 'Computer Science and Engineering'),
(3, 'ECE', 'Electronics and Communication Engineering'),
(4, 'MECH', 'Mechanical Engineering'),
(5, 'EEE', 'Electrical and Electronics Engineering');

-- 2. NSS Units
INSERT IGNORE INTO nss_units (id, unit_code, unit_name, po_name, capacity) VALUES
(1, 'UNIT-01', 'NSS Unit I', 'Dr. R. Arunkumar', 100),
(2, 'UNIT-02', 'NSS Unit II', 'Prof. M. Selvam', 100),
(3, 'UNIT-03', 'NSS Unit III', 'Dr. S. Kavittha', 100);

-- 3. Academic Years
INSERT IGNORE INTO academic_years (id, year_label, is_current) VALUES
(1, '2025-2026', 1),
(2, '2026-2027', 0);

-- 4. Users (Super Admin, Admin, Programme Officer, Students)
INSERT IGNORE INTO users (id, user_id, email, password, role, status) VALUES
(1, 'NSSSA001', 'superadmin@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Super Admin', 'Active'),
(2, 'NSSADMIN001', 'admin@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Admin', 'Active'),
(3, 'NSSPO001', 'po1@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Programme Officer', 'Active'),
(4, 'NSS2026IT001', 'elamparuthi@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Active'),
(5, 'NSS2026CS002', 'priya@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Active'),
(6, 'NSS2026EC003', 'vikram@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Pending');

-- 5. Admins Detail
INSERT IGNORE INTO admins (id, user_id, admin_id, full_name, email, phone, designation, role_type, status) VALUES
(1, 'NSSSA001', 'NSSSA001', 'Dr. K. Super Administrator', 'superadmin@college.edu', '9876543210', 'Head of Student Affairs', 'Super Admin', 'Active'),
(2, 'NSSADMIN001', 'NSSADMIN001', 'Prof. V. Admin Officer', 'admin@college.edu', '9876543211', 'NSS Central Coordinator', 'Admin', 'Active');

-- 6. Programme Officers Detail
INSERT IGNORE INTO programme_officers (id, user_id, po_id, full_name, email, phone, nss_unit_id, designation, status) VALUES
(1, 'NSSPO001', 'NSSPO001', 'Dr. R. Arunkumar', 'po1@college.edu', '9876543212', 1, 'Associate Professor & PO Unit I', 'Active');

-- 7. Students Detail
INSERT IGNORE INTO students (id, user_id, nss_id, full_name, register_number, college_reg_no, dob, gender, blood_group, profile_photo, address, city, district, state, pin_code, department_id, course, year, section, semester, academic_year_id, nss_unit_id, joining_year, student_phone, student_email, parent_name, parent_phone, emergency_contact, status, total_events, volunteer_hours, attendance_pct) VALUES
(1, 'NSS2026IT001', 'NSS2026IT001', 'K. Elamparuthi', '722123104031', 'REG-2023-IT031', '2005-05-12', 'Male', 'O+', '', '123 Gandhi Street', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641001', 1, 'B.Tech IT', 'III Year', 'A', 'V Sem', 1, 1, '2023', '9876500001', 'elamparuthikp@gmail.com', 'M. Karuppasamy', '9876500002', '9876500002', 'Approved', 8, 24, 92.50),
(2, 'NSS2026CS002', 'NSS2026CS002', 'S. Priya', '722123104015', 'REG-2023-CS015', '2005-08-20', 'Female', 'A+', '', '45 College Road', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641002', 2, 'B.E CSE', 'III Year', 'B', 'V Sem', 1, 2, '2023', '9876500003', 'priya@student.college.edu', 'S. Sundaram', '9876500004', '9876500004', 'Approved', 6, 18, 88.00),
(3, 'NSS2026EC003', 'NSS2026EC003', 'R. Vikram', '722123104022', 'REG-2023-EC022', '2004-11-05', 'Male', 'B+', '', '88 Anna Nagar', 'Salem', 'Salem', 'Tamil Nadu', '636001', 3, 'B.E ECE', 'III Year', 'A', 'V Sem', 1, 1, '2023', '9876500005', 'vikram@student.college.edu', 'R. Ramachandran', '9876500006', '9876500006', 'Pending', 0, 0, 0.00);

-- 8. Events
INSERT IGNORE INTO events (id, event_name, description, category, event_date, event_time, venue, organizer, nss_unit_id, max_participants, registered_count, registration_deadline, hours_allocated, status, created_by) VALUES
(1, 'Mass Tree Plantation Drive', 'Planting 500 saplings inside college campus and surrounding community parks as part of Green Earth Initiative.', 'Environmental Care', '2026-09-15', '08:30 AM', 'College Campus Grounds', 'NSS Unit I & II', 1, 100, 48, '2026-09-14 18:00:00', 4, 'Registration Open', 'NSSPO001'),
(2, 'Blood Donation Camp', 'Annual Voluntary Blood Donation Camp organized in collaboration with Government Blood Bank.', 'Health & Wellness', '2026-09-20', '09:00 AM', 'Main Auditorium', 'NSS Unit I', 1, 80, 50, '2026-09-19 17:00:00', 6, 'Registration Open', 'NSSPO001'),
(3, 'Clean Campus & E-Waste Awareness', 'Plogging drive across the campus and neighboring village with focus on e-waste disposal techniques.', 'Swachh Bharat', '2026-08-10', '07:30 AM', 'Campus Square & Kovilpalayam', 'NSS Unit II', 2, 60, 60, '2026-08-09 20:00:00', 5, 'Completed', 'NSSADMIN001'),
(4, 'International Yoga Day Workshop', 'Guided yoga, pranayama and mental well-being workshop for college students and staff.', 'Health & Wellness', '2026-06-21', '06:30 AM', 'College Indoor Sports Complex', 'NSS Unit III', 3, 120, 110, '2026-06-20 18:00:00', 3, 'Completed', 'NSSADMIN001');

-- 9. Event Registrations
INSERT IGNORE INTO event_registrations (id, event_id, student_id, nss_id, registration_date, status) VALUES
(1, 1, 1, 'NSS2026IT001', '2026-09-02 10:15:00', 'Registered'),
(2, 2, 1, 'NSS2026IT001', '2026-09-03 11:20:00', 'Registered'),
(3, 3, 1, 'NSS2026IT001', '2026-08-01 09:00:00', 'Attended'),
(4, 4, 1, 'NSS2026IT001', '2026-06-15 14:30:00', 'Attended'),
(5, 3, 2, 'NSS2026CS002', '2026-08-02 11:00:00', 'Attended');

-- 10. Attendance
INSERT IGNORE INTO attendance (id, event_id, student_id, nss_id, attendance_date, status, hours_awarded, marked_by) VALUES
(1, 3, 1, 'NSS2026IT001', '2026-08-10', 'Present', 5, 'NSSPO001'),
(2, 4, 1, 'NSS2026IT001', '2026-06-21', 'Present', 3, 'NSSADMIN001'),
(3, 3, 2, 'NSS2026CS002', '2026-08-10', 'Present', 5, 'NSSPO001');

-- 11. Volunteer Hours
INSERT IGNORE INTO volunteer_hours (id, student_id, nss_id, event_id, hours, description, awarded_date) VALUES
(1, 1, 'NSS2026IT001', 3, 5, 'Participation in Clean Campus & E-Waste Drive', '2026-08-10'),
(2, 1, 'NSS2026IT001', 4, 3, 'Participation in Yoga Day Workshop', '2026-06-21'),
(3, 1, 'NSS2026IT001', NULL, 16, 'Special Community Service Rally & Orphanage Support', '2026-05-15'),
(4, 2, 'NSS2026CS002', 3, 5, 'Participation in Clean Campus & E-Waste Drive', '2026-08-10');

-- 12. Announcements
INSERT IGNORE INTO announcements (id, title, description, category, priority, published_by, publish_date) VALUES
(1, 'NSS Orientation Program 2026 for First Year Volunteers', 'All newly registered NSS volunteers are requested to attend the orientation session on September 12 at Seminar Hall A.', 'General', 'Urgent', 'NSS Programme Officer', '2026-09-05 09:00:00'),
(2, 'Registration Open for Mass Tree Plantation Drive', 'Join us in planting 500 saplings. Register now through your student dashboard before seats fill up!', 'Events', 'Important', 'NSS Unit I', '2026-09-01 10:00:00'),
(3, 'Collection of NSS T-Shirts & Badges', 'Approved NSS volunteers of batch 2025-2027 can collect their official NSS badges and T-shirts from NSS Office Room 102.', 'Notice', 'General', 'NSS Central Office', '2026-08-25 14:00:00');

-- 13. NSS Information
INSERT IGNORE INTO nss_information (id, section_key, title, content, published, updated_by) VALUES
(1, 'about', 'About NSS', 'The National Service Scheme (NSS) is a Central Sector Scheme of Government of India, Ministry of Youth Affairs & Sports. It provides opportunity to the student youth of 11th & 12th Class of (+2) stage at Higher Secondary School level and student youth of Technical Institution, Graduate & Post Graduate at Colleges and University level of India to take part in various government-led community service activities & programmes.', 1, 'NSSADMIN001'),
(2, 'motto', 'NSS Motto', 'Not Me But You - reflecting the essence of democratic living and upholding the need for selfless service.', 1, 'NSSADMIN001'),
(3, 'vision', 'NSS Vision', 'To build patriotic, disciplined, socially responsible and selfless youth dedicated to the service of the nation.', 1, 'NSSADMIN001'),
(4, 'mission', 'NSS Mission', 'To enable student volunteers to understand community needs, develop civic consciousness, foster teamwork, and render active voluntary social services.', 1, 'NSSADMIN001'),
(5, 'rules', 'Volunteer Guidelines', '1. Every volunteer must complete 120 hours of regular service per year.\n2. Active participation in Special Camping program (7 days) is mandatory.\n3. Maintain discipline, punctuality, and wear NSS badge during events.\n4. Maintain 80%+ event attendance for NSS Certification.', 1, 'NSSADMIN001');

-- 14. Certificates
INSERT IGNORE INTO certificates (id, certificate_number, certificate_name, student_id, nss_id, event_id, issue_date, file_url) VALUES
(1, 'CERT-NSS-2026-001', 'Certificate of Merit - Clean Campus Drive', 1, 'NSS2026IT001', 3, '2026-08-15', '/uploads/cert_722123104031_001.pdf'),
(2, 'CERT-NSS-2026-002', 'Certificate of Participation - Yoga Workshop', 1, 'NSS2026IT001', 4, '2026-06-25', '/uploads/cert_722123104031_002.pdf');

-- 15. Achievements
INSERT IGNORE INTO achievements (id, title, student_id, nss_id, award_type, description, award_date, given_by) VALUES
(1, 'Best NSS Volunteer Award 2025-2026', 1, 'NSS2026IT001', 'Best Volunteer', 'Awarded for extraordinary dedication, logging over 100 community service hours and leading the Swachh Bharat drive.', '2026-08-15', 'Principal & NSS PO'),
(2, 'Blood Donation Excellence Badge', 1, 'NSS2026IT001', 'Special Recognition', 'Recognized for donating blood 3 times in college camps and mobilizing 20+ peer donors.', '2026-01-26', 'Rotary & Blood Bank');

-- 16. Gallery
INSERT IGNORE INTO gallery (id, title, category, image_url, event_id, nss_unit_id, uploaded_by) VALUES
(1, 'Plantation Drive Green Campus', 'Tree Plantation', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop', 1, 1, 'NSSPO001'),
(2, 'Voluntary Blood Donors Group', 'Blood Donation', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&auto=format&fit=crop', 2, 1, 'NSSPO001'),
(3, 'Swachh Bharat Cleanliness Camp', 'Community Service', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop', 3, 2, 'NSSADMIN001'),
(4, 'International Yoga Day Session', 'Awareness Rally', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop', 4, 3, 'NSSADMIN001');

-- 17. Profile Update Requests
INSERT IGNORE INTO profile_update_requests (id, student_id, nss_id, field_name, old_value, new_value, reason, status, reviewed_by) VALUES
(1, 1, 'NSS2026IT001', 'nss_unit_id', 'NSS Unit I', 'NSS Unit II', 'Reassigned due to department scheduling alignment', 'Pending', NULL);

-- 18. Notifications
INSERT IGNORE INTO notifications (id, user_id, title, message, type, link) VALUES
(1, 'NSS2026IT001', 'Registration Approved!', 'Your NSS Volunteer registration has been verified and approved. Welcome to NSS!', 'success', '/profile'),
(2, 'NSS2026IT001', 'New Event Available', 'Mass Tree Plantation Drive is now open for registration.', 'info', '/events'),
(3, 'NSS2026IT001', 'Certificate Issued', 'Your Certificate for Clean Campus Drive is now available for download.', 'certificate', '/certificates');

-- 19. Activity Logs
INSERT IGNORE INTO activity_logs (id, user_id, user_name, role, action, module, ip_address) VALUES
(1, 'NSSADMIN001', 'Prof. V. Admin Officer', 'Admin', 'Verified and Approved student K. Elamparuthi (NSS2026IT001)', 'Student Management', '127.0.0.1'),
(2, 'NSSPO001', 'Dr. R. Arunkumar', 'Programme Officer', 'Created event: Mass Tree Plantation Drive', 'Event Management', '127.0.0.1'),
(3, 'NSSADMIN001', 'Prof. V. Admin Officer', 'Admin', 'Updated NSS Motto and Objectives information', 'NSS Info Management', '127.0.0.1');

-- 20. System Settings
INSERT IGNORE INTO system_settings (id, setting_key, setting_value, description) VALUES
('college_name', 'XYZ College of Engineering & Technology', 'Official institution name'),
('nss_motto', 'Not Me But You', 'NSS Official Motto'),
('registration_open', 'true', 'Allow new student registrations'),
('academic_year', '2025-2026', 'Active academic year');
