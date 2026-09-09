-- NSS College Management System MySQL Schema

CREATE DATABASE IF NOT EXISTS nss_db;
USE nss_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Programme Officer', 'Admin', 'Super Admin') NOT NULL DEFAULT 'Student',
  status ENUM('Active', 'Inactive', 'Pending') NOT NULL DEFAULT 'Active',
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. NSS Units Table
CREATE TABLE IF NOT EXISTS nss_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_code VARCHAR(20) UNIQUE NOT NULL,
  unit_name VARCHAR(100) NOT NULL,
  po_name VARCHAR(100) DEFAULT '',
  capacity INT DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_label VARCHAR(30) UNIQUE NOT NULL,
  is_current TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) UNIQUE NOT NULL,
  nss_id VARCHAR(30) UNIQUE NULL,
  full_name VARCHAR(100) NOT NULL,
  register_number VARCHAR(50) NOT NULL,
  college_reg_no VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  profile_photo VARCHAR(255) DEFAULT '',
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  pin_code VARCHAR(20) NOT NULL,
  department_id INT NOT NULL,
  course VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  academic_year_id INT NOT NULL,
  nss_unit_id INT NOT NULL,
  joining_year VARCHAR(10) NOT NULL,
  student_phone VARCHAR(20) NOT NULL,
  student_email VARCHAR(100) NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  emergency_contact VARCHAR(20) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Inactive') DEFAULT 'Pending',
  total_events INT DEFAULT 0,
  volunteer_hours INT DEFAULT 0,
  attendance_pct DECIMAL(5,2) DEFAULT 0.00,
  verified_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (nss_unit_id) REFERENCES nss_units(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 6. Programme Officers Table
CREATE TABLE IF NOT EXISTS programme_officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) UNIQUE NOT NULL,
  po_id VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nss_unit_id INT NOT NULL,
  designation VARCHAR(100) NOT NULL,
  profile_photo VARCHAR(255) DEFAULT '',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nss_unit_id) REFERENCES nss_units(id) ON DELETE CASCADE
);

-- 7. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) UNIQUE NOT NULL,
  admin_id VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  role_type ENUM('Admin', 'Super Admin') DEFAULT 'Admin',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  event_time VARCHAR(20) NOT NULL,
  venue VARCHAR(150) NOT NULL,
  organizer VARCHAR(100) NOT NULL,
  nss_unit_id INT NOT NULL,
  max_participants INT DEFAULT 50,
  registered_count INT DEFAULT 0,
  registration_deadline DATETIME NOT NULL,
  event_poster VARCHAR(255) DEFAULT '',
  instructions TEXT DEFAULT '',
  hours_allocated INT DEFAULT 4,
  status ENUM('Registration Open', 'Full', 'Upcoming', 'Completed', 'Cancelled') DEFAULT 'Registration Open',
  created_by VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nss_unit_id) REFERENCES nss_units(id) ON DELETE CASCADE
);

-- 9. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Registered', 'Attended', 'Absent', 'Cancelled') DEFAULT 'Registered',
  remarks VARCHAR(255) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (event_id, student_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent') DEFAULT 'Present',
  hours_awarded INT DEFAULT 0,
  marked_by VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 11. Volunteer Hours Table
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  event_id INT NULL,
  hours INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  awarded_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 12. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority ENUM('Urgent', 'Important', 'General') DEFAULT 'General',
  attachment VARCHAR(255) DEFAULT '',
  published_by VARCHAR(100) NOT NULL,
  publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Published', 'Draft') DEFAULT 'Published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. NSS Information Table
CREATE TABLE IF NOT EXISTS nss_information (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  published TINYINT(1) DEFAULT 1,
  updated_by VARCHAR(100) NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 14. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  certificate_name VARCHAR(150) NOT NULL,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  event_id INT NULL,
  issue_date DATE NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 15. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  award_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  award_date DATE NOT NULL,
  given_by VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 16. Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  event_id INT NULL,
  nss_unit_id INT NULL,
  academic_year_id INT NULL,
  event_date DATE NULL,
  uploaded_by VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Profile Update Requests Table
CREATE TABLE IF NOT EXISTS profile_update_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  nss_id VARCHAR(30) NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  old_value VARCHAR(255) NOT NULL,
  new_value VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  reviewed_by VARCHAR(50) NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  link VARCHAR(255) DEFAULT '',
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  action VARCHAR(255) NOT NULL,
  module VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 20. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 21. Homepage Banners Table
CREATE TABLE IF NOT EXISTS homepage_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200) DEFAULT '',
  description TEXT DEFAULT '',
  image_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(100) DEFAULT 'Explore Events',
  button_link VARCHAR(200) DEFAULT 'public-events',
  display_order INT DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_by VARCHAR(50) DEFAULT 'NSSADMIN001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

