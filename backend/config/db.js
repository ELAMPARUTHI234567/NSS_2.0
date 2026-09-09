const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
let sqlite3 = null;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nss_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

let dbMode = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

// Helper to run query regardless of engine
async function query(sql, params = []) {
  if (dbMode === 'mysql' && mysqlPool) {
    try {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('MySQL Query Error:', err.message, sql);
      throw err;
    }
  } else {
    // SQLite execution
    return new Promise((resolve, reject) => {
      // Convert MySQL style queries to SQLite if needed
      let sqliteSql = sql
        .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
        .replace(/ENGINE=InnoDB/gi, '')
        .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/TINYINT\(1\)/gi, 'INTEGER')
        .replace(/DECIMAL\(5,2\)/gi, 'REAL');

      if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('PRAGMA')) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sqliteSql, params, function (err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    });
  }
}

async function initializeDatabase() {
  // Try connecting to MySQL first
  try {
    try {
      const conn = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        port: DB_CONFIG.port,
        ssl: DB_CONFIG.ssl
      });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
      await conn.end();
    } catch (createDbErr) {
      console.warn('⚠️ CREATE DATABASE skipped (' + createDbErr.message + '). Attempting direct database connection pool...');
    }

    mysqlPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const testConn = await mysqlPool.getConnection();
    testConn.release();
    dbMode = 'mysql';
    console.log('✅ Connected to MySQL Database successfully!');

    // Initialize Schema & Seeds
    await initSchemaAndSeed();
  } catch (mysqlErr) {
    console.warn('⚠️ Could not connect to MySQL server (' + mysqlErr.message + '). Falling back to SQLite database for seamless operation.');
    dbMode = 'sqlite';

    if (!sqlite3) {
      sqlite3 = require('sqlite3').verbose();
    }

    const dbPath = path.join(__dirname, '../nss_database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    console.log('✅ Connected to SQLite database at:', dbPath);

    await initSqliteSchemaAndSeed();
  }
}

async function initSchemaAndSeed() {
  const schemaFile = path.join(__dirname, 'schema.sql');
  const seedFile = path.join(__dirname, 'seed.sql');

  if (fs.existsSync(schemaFile)) {
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE') && !s.startsWith('CREATE DATABASE'));

    for (const stmt of statements) {
      try {
        await mysqlPool.query(stmt);
      } catch (err) {
        // Ignore table exists or minor errors
      }
    }
  }

  if (fs.existsSync(seedFile)) {
    const seedSql = fs.readFileSync(seedFile, 'utf8');
    const statements = seedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    for (const stmt of statements) {
      try {
        await mysqlPool.query(stmt);
      } catch (err) {
        // Seed duplicate key errors are safely ignored
      }
    }
  }
}

async function initSqliteSchemaAndSeed() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Student',
      status TEXT NOT NULL DEFAULT 'Active',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS nss_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_code TEXT UNIQUE NOT NULL,
      unit_name TEXT NOT NULL,
      po_name TEXT DEFAULT '',
      capacity INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year_label TEXT UNIQUE NOT NULL,
      is_current INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      nss_id TEXT UNIQUE,
      full_name TEXT NOT NULL,
      register_number TEXT NOT NULL,
      college_reg_no TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      profile_photo TEXT DEFAULT '',
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      course TEXT NOT NULL,
      year TEXT NOT NULL,
      section TEXT NOT NULL,
      semester TEXT NOT NULL,
      academic_year_id INTEGER NOT NULL,
      nss_unit_id INTEGER NOT NULL,
      joining_year TEXT NOT NULL,
      student_phone TEXT NOT NULL,
      student_email TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      total_events INTEGER DEFAULT 0,
      volunteer_hours INTEGER DEFAULT 0,
      attendance_pct REAL DEFAULT 0.00,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS programme_officers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      po_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      nss_unit_id INTEGER NOT NULL,
      designation TEXT NOT NULL,
      profile_photo TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      admin_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      designation TEXT NOT NULL,
      role_type TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      organizer TEXT NOT NULL,
      nss_unit_id INTEGER NOT NULL,
      max_participants INTEGER DEFAULT 50,
      registered_count INTEGER DEFAULT 0,
      registration_deadline DATETIME NOT NULL,
      event_poster TEXT DEFAULT '',
      instructions TEXT DEFAULT '',
      hours_allocated INTEGER DEFAULT 4,
      status TEXT DEFAULT 'Registration Open',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Registered',
      remarks TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      attendance_date TEXT NOT NULL,
      status TEXT DEFAULT 'Present',
      hours_awarded INTEGER DEFAULT 0,
      marked_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS volunteer_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      event_id INTEGER,
      hours INTEGER NOT NULL,
      description TEXT NOT NULL,
      awarded_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT DEFAULT 'General',
      attachment TEXT DEFAULT '',
      published_by TEXT NOT NULL,
      publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS nss_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      updated_by TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_number TEXT UNIQUE NOT NULL,
      certificate_name TEXT NOT NULL,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      event_id INTEGER,
      issue_date TEXT NOT NULL,
      file_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      award_type TEXT NOT NULL,
      description TEXT NOT NULL,
      award_date TEXT NOT NULL,
      given_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      event_id INTEGER,
      nss_unit_id INTEGER,
      academic_year_id INTEGER,
      event_date TEXT,
      uploaded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS profile_update_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      nss_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      old_value TEXT NOT NULL,
      new_value TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      reviewed_by TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      link TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      description TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS homepage_banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      button_text TEXT DEFAULT 'Explore Events',
      button_link TEXT DEFAULT 'public-events',
      display_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'NSSADMIN001',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const sql of tables) {
    await new Promise((resolve) => sqliteDb.run(sql, () => resolve()));
  }

  // Populate seeds if empty
  const userCheck = await query('SELECT COUNT(*) as count FROM users');
  if (userCheck[0].count === 0) {
    console.log('🌱 Populating initial database seed records...');
    const seedQueries = [
      `INSERT INTO departments (id, code, name) VALUES (1, 'IT', 'Information Technology'), (2, 'CSE', 'Computer Science'), (3, 'ECE', 'Electronics & Comm'), (4, 'MECH', 'Mechanical Engg'), (5, 'EEE', 'Electrical Engg');`,
      `INSERT INTO nss_units (id, unit_code, unit_name, po_name, capacity) VALUES (1, 'UNIT-01', 'NSS Unit I', 'Dr. R. Arunkumar', 100), (2, 'UNIT-02', 'NSS Unit II', 'Prof. M. Selvam', 100), (3, 'UNIT-03', 'NSS Unit III', 'Dr. S. Kavittha', 100);`,
      `INSERT INTO academic_years (id, year_label, is_current) VALUES (1, '2025-2026', 1), (2, '2026-2027', 0);`,
      `INSERT INTO users (id, user_id, email, password, role, status) VALUES 
        (1, 'NSSSA001', 'superadmin@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Super Admin', 'Active'),
        (2, 'NSSADMIN001', 'admin@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Admin', 'Active'),
        (3, 'NSSPO001', 'po1@college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Programme Officer', 'Active'),
        (4, 'NSS2026IT001', 'elamparuthi@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Active'),
        (5, 'NSS2026CS002', 'priya@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Active'),
        (6, 'NSS2026EC003', 'vikram@student.college.edu', '$2b$10$e.R.H.3x.3V.Zg1K.O.X.e32J69s9P15rJ/J20W48z2M5/F4kY2W2', 'Student', 'Pending');`,
      `INSERT INTO admins (id, user_id, admin_id, full_name, email, phone, designation, role_type, status) VALUES 
        (1, 'NSSSA001', 'NSSSA001', 'Dr. K. Super Administrator', 'superadmin@college.edu', '9876543210', 'Head of Student Affairs', 'Super Admin', 'Active'),
        (2, 'NSSADMIN001', 'NSSADMIN001', 'Prof. V. Admin Officer', 'admin@college.edu', '9876543211', 'NSS Central Coordinator', 'Admin', 'Active');`,
      `INSERT INTO programme_officers (id, user_id, po_id, full_name, email, phone, nss_unit_id, designation, status) VALUES 
        (1, 'NSSPO001', 'NSSPO001', 'Dr. R. Arunkumar', 'po1@college.edu', '9876543212', 1, 'Associate Professor & PO Unit I', 'Active');`,
      `INSERT INTO students (id, user_id, nss_id, full_name, register_number, college_reg_no, dob, gender, blood_group, profile_photo, address, city, district, state, pin_code, department_id, course, year, section, semester, academic_year_id, nss_unit_id, joining_year, student_phone, student_email, parent_name, parent_phone, emergency_contact, status, total_events, volunteer_hours, attendance_pct) VALUES 
        (1, 'NSS2026IT001', 'NSS2026IT001', 'K. Elamparuthi', '722123104031', 'REG-2023-IT031', '2005-05-12', 'Male', 'O+', '', '123 Gandhi Street', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641001', 1, 'B.Tech IT', 'III Year', 'A', 'V Sem', 1, 1, '2023', '9876500001', 'elamparuthikp@gmail.com', 'M. Karuppasamy', '9876500002', '9876500002', 'Approved', 8, 24, 92.50),
        (2, 'NSS2026CS002', 'NSS2026CS002', 'S. Priya', '722123104015', 'REG-2023-CS015', '2005-08-20', 'Female', 'A+', '', '45 College Road', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641002', 2, 'B.E CSE', 'III Year', 'B', 'V Sem', 1, 2, '2023', '9876500003', 'priya@student.college.edu', 'S. Sundaram', '9876500004', '9876500004', 'Approved', 6, 18, 88.00),
        (3, 'NSS2026EC003', 'NSS2026EC003', 'R. Vikram', '722123104022', 'REG-2023-EC022', '2004-11-05', 'Male', 'B+', '', '88 Anna Nagar', 'Salem', 'Salem', 'Tamil Nadu', '636001', 3, 'B.E ECE', 'III Year', 'A', 'V Sem', 1, 1, '2023', '9876500005', 'vikram@student.college.edu', 'R. Ramachandran', '9876500006', '9876500006', 'Pending', 0, 0, 0.00);`,
      `INSERT INTO events (id, event_name, description, category, event_date, event_time, venue, organizer, nss_unit_id, max_participants, registered_count, registration_deadline, hours_allocated, status, created_by) VALUES 
        (1, 'Mass Tree Plantation Drive', 'Planting 500 saplings inside college campus and surrounding community parks as part of Green Earth Initiative.', 'Environmental Care', '2026-09-15', '08:30 AM', 'College Campus Grounds', 'NSS Unit I & II', 1, 100, 48, '2026-09-14 18:00:00', 4, 'Registration Open', 'NSSPO001'),
        (2, 'Blood Donation Camp', 'Annual Voluntary Blood Donation Camp organized in collaboration with Government Blood Bank.', 'Health & Wellness', '2026-09-20', '09:00 AM', 'Main Auditorium', 'NSS Unit I', 1, 80, 50, '2026-09-19 17:00:00', 6, 'Registration Open', 'NSSPO001'),
        (3, 'Clean Campus & E-Waste Awareness', 'Plogging drive across the campus and neighboring village with focus on e-waste disposal techniques.', 'Swachh Bharat', '2026-08-10', '07:30 AM', 'Campus Square & Kovilpalayam', 'NSS Unit II', 2, 60, 60, '2026-08-09 20:00:00', 5, 'Completed', 'NSSADMIN001'),
        (4, 'International Yoga Day Workshop', 'Guided yoga, pranayama and mental well-being workshop for college students and staff.', 'Health & Wellness', '2026-06-21', '06:30 AM', 'College Indoor Sports Complex', 'NSS Unit III', 3, 120, 110, '2026-06-20 18:00:00', 3, 'Completed', 'NSSADMIN001');`,
      `INSERT INTO event_registrations (id, event_id, student_id, nss_id, registration_date, status) VALUES 
        (1, 1, 1, 'NSS2026IT001', '2026-09-02 10:15:00', 'Registered'),
        (2, 2, 1, 'NSS2026IT001', '2026-09-03 11:20:00', 'Registered'),
        (3, 3, 1, 'NSS2026IT001', '2026-08-01 09:00:00', 'Attended'),
        (4, 4, 1, 'NSS2026IT001', '2026-06-15 14:30:00', 'Attended'),
        (5, 3, 2, 'NSS2026CS002', '2026-08-02 11:00:00', 'Attended');`,
      `INSERT INTO attendance (id, event_id, student_id, nss_id, attendance_date, status, hours_awarded, marked_by) VALUES 
        (1, 3, 1, 'NSS2026IT001', '2026-08-10', 'Present', 5, 'NSSPO001'),
        (2, 4, 1, 'NSS2026IT001', '2026-06-21', 'Present', 3, 'NSSADMIN001'),
        (3, 3, 2, 'NSS2026CS002', '2026-08-10', 'Present', 5, 'NSSPO001');`,
      `INSERT INTO volunteer_hours (id, student_id, nss_id, event_id, hours, description, awarded_date) VALUES 
        (1, 1, 'NSS2026IT001', 3, 5, 'Participation in Clean Campus & E-Waste Drive', '2026-08-10'),
        (2, 1, 'NSS2026IT001', 4, 3, 'Participation in Yoga Day Workshop', '2026-06-21'),
        (3, 1, 'NSS2026IT001', NULL, 16, 'Special Community Service Rally & Orphanage Support', '2026-05-15'),
        (4, 2, 'NSS2026CS002', 3, 5, 'Participation in Clean Campus & E-Waste Drive', '2026-08-10');`,
      `INSERT INTO announcements (id, title, description, category, priority, published_by, publish_date) VALUES 
        (1, 'NSS Orientation Program 2026 for First Year Volunteers', 'All newly registered NSS volunteers are requested to attend the orientation session on September 12 at Seminar Hall A.', 'General', 'Urgent', 'NSS Programme Officer', '2026-09-05 09:00:00'),
        (2, 'Registration Open for Mass Tree Plantation Drive', 'Join us in planting 500 saplings. Register now through your student dashboard before seats fill up!', 'Events', 'Important', 'NSS Unit I', '2026-09-01 10:00:00'),
        (3, 'Collection of NSS T-Shirts & Badges', 'Approved NSS volunteers of batch 2025-2027 can collect their official NSS badges and T-shirts from NSS Office Room 102.', 'Notice', 'General', 'NSS Central Office', '2026-08-25 14:00:00');`,
      `INSERT INTO nss_information (id, section_key, title, content, published, updated_by) VALUES 
        (1, 'about', 'About NSS', 'The National Service Scheme (NSS) is a Central Sector Scheme of Government of India, Ministry of Youth Affairs & Sports. It provides opportunity to the student youth to take part in various community service activities & programmes.', 1, 'NSSADMIN001'),
        (2, 'motto', 'NSS Motto', 'Not Me But You - reflecting the essence of democratic living and upholding the need for selfless service.', 1, 'NSSADMIN001'),
        (3, 'vision', 'NSS Vision', 'To build patriotic, disciplined, socially responsible and selfless youth dedicated to the service of the nation.', 1, 'NSSADMIN001'),
        (4, 'mission', 'NSS Mission', 'To enable student volunteers to understand community needs, develop civic consciousness, foster teamwork, and render active voluntary social services.', 1, 'NSSADMIN001'),
        (5, 'rules', 'Volunteer Guidelines', '1. Every volunteer must complete 120 hours of regular service per year.\n2. Active participation in Special Camping program (7 days) is mandatory.\n3. Maintain discipline, punctuality, and wear NSS badge during events.\n4. Maintain 80%+ event attendance for NSS Certification.', 1, 'NSSADMIN001');`,
      `INSERT INTO certificates (id, certificate_number, certificate_name, student_id, nss_id, event_id, issue_date, file_url) VALUES 
        (1, 'CERT-NSS-2026-001', 'Certificate of Merit - Clean Campus Drive', 1, 'NSS2026IT001', 3, '2026-08-15', '/uploads/cert_722123104031_001.pdf'),
        (2, 'CERT-NSS-2026-002', 'Certificate of Participation - Yoga Workshop', 1, 'NSS2026IT001', 4, '2026-06-25', '/uploads/cert_722123104031_002.pdf');`,
      `INSERT INTO achievements (id, title, student_id, nss_id, award_type, description, award_date, given_by) VALUES 
        (1, 'Best NSS Volunteer Award 2025-2026', 1, 'NSS2026IT001', 'Best Volunteer', 'Awarded for extraordinary dedication, logging over 100 community service hours and leading the Swachh Bharat drive.', '2026-08-15', 'Principal & NSS PO'),
        (2, 'Blood Donation Excellence Badge', 1, 'NSS2026IT001', 'Special Recognition', 'Recognized for donating blood 3 times in college camps and mobilizing 20+ peer donors.', '2026-01-26', 'Rotary & Blood Bank');`,
      `INSERT INTO gallery (id, title, category, image_url, event_id, nss_unit_id, uploaded_by) VALUES 
        (1, 'Plantation Drive Green Campus', 'Tree Plantation', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop', 1, 1, 'NSSPO001'),
        (2, 'Voluntary Blood Donors Group', 'Blood Donation', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&auto=format&fit=crop', 2, 1, 'NSSPO001'),
        (3, 'Swachh Bharat Cleanliness Camp', 'Community Service', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop', 3, 2, 'NSSADMIN001'),
        (4, 'International Yoga Day Session', 'Awareness Rally', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop', 4, 3, 'NSSADMIN001');`,
      `INSERT INTO profile_update_requests (id, student_id, nss_id, field_name, old_value, new_value, reason, status) VALUES 
        (1, 1, 'NSS2026IT001', 'nss_unit_id', 'NSS Unit I', 'NSS Unit II', 'Reassigned due to department scheduling alignment', 'Pending');`,
      `INSERT INTO notifications (id, user_id, title, message, type, link) VALUES 
        (1, 'NSS2026IT001', 'Registration Approved!', 'Your NSS Volunteer registration has been verified and approved. Welcome to NSS!', 'success', '/profile'),
        (2, 'NSS2026IT001', 'New Event Available', 'Mass Tree Plantation Drive is now open for registration.', 'info', '/events'),
        (3, 'NSS2026IT001', 'Certificate Issued', 'Your Certificate for Clean Campus Drive is now available for download.', 'certificate', '/certificates');`,
      `INSERT INTO activity_logs (id, user_id, user_name, role, action, module) VALUES 
        (1, 'NSSADMIN001', 'Prof. V. Admin Officer', 'Admin', 'Verified and Approved student K. Elamparuthi (NSS2026IT001)', 'Student Management'),
        (2, 'NSSPO001', 'Dr. R. Arunkumar', 'Programme Officer', 'Created event: Mass Tree Plantation Drive', 'Event Management'),
        (3, 'NSSADMIN001', 'Prof. V. Admin Officer', 'Admin', 'Updated NSS Motto and Objectives information', 'NSS Info Management');`,
      `INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
        ('college_name', 'XYZ College of Engineering & Technology', 'Official institution name'),
        ('nss_motto', 'Not Me But You', 'NSS Official Motto');`
    ];

    for (const q of seedQueries) {
      await query(q);
    }
  }

  // Ensure homepage_banners initial seed if empty
  const bannerCheck = await query('SELECT COUNT(*) as count FROM homepage_banners');
  if (bannerCheck[0].count === 0) {
    console.log('🌱 Populating default homepage activity banners...');
    const bannerSeeds = [
      `INSERT INTO homepage_banners (id, title, subtitle, description, image_url, button_text, button_link, display_order, is_active) VALUES
        (1, 'Serve. Learn. Grow. Make a Difference.', 'Not Me But You', 'Join National Service Scheme and empower youth through active voluntary community service and nation building.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&auto=format&fit=crop&q=80', 'Join NSS', 'register', 1, 1),
        (2, 'Green Earth Drive: Mass Tree Plantation', 'Environmental Stewardship', 'Over 500+ saplings planted across college campus & rural communities to combat climate change.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80', 'Explore Events', 'public-events', 2, 1),
        (3, 'Voluntary Blood Donation Camp', 'Health & Lifesaving Initiative', 'Collaborating with Government Hospitals to save lives. Over 150 units of blood collected annually.', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600&auto=format&fit=crop&q=80', 'View Activities', 'activities', 3, 1),
        (4, 'Adopted Village Development Scheme', 'Rural Community Service', 'Promoting literacy, sanitation, hygiene awareness & digital skills in Kovilpalayam village.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&auto=format&fit=crop&q=80', 'Read Story', 'about', 4, 1),
        (5, 'Youth Swachh Bharat Awareness Rally', 'Civic Consciousness & Unity', 'Student rallies promoting road safety, anti-plastic pledge, and environmental conservation.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&auto=format&fit=crop&q=80', 'View Gallery', 'public-gallery', 5, 1),
        (6, 'Unified Student Volunteer Power', 'NSS Batch 2025-2027', 'Dedicated team of 220+ student volunteers rendering selfless service for society and the nation.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&auto=format&fit=crop&q=80', 'Contact Office', 'contact', 6, 1);`
    ];
    for (const bq of bannerSeeds) {
      await query(bq);
    }
  }
}

function getMode() {
  return dbMode;
}

module.exports = {
  initializeDatabase,
  query,
  getMode
};
