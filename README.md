# SmartSchool LK 🏫🇱🇰
### Sri Lankan Digital School Administration & Parent Communication Portal

SmartSchool LK is a modern, full-stack school management system custom-engineered to solve manual administration bottlenecks in Sri Lankan schools. It replaces traditional paper-based workflows (daily registry marking, physical exam report cards, notices dispatching, and emergency warning circulars) with a sleek, premium, role-based digital dashboard.

Designed specifically for the Sri Lankan curriculum, SmartSchool LK supports local grading systems, automated subject and class rankings, localized Sinhala (සිංහල) and Tamil (தமிழ்) translation interfaces, and background SMS alerts to parents when a child is absent.

---

## 🚀 Core Features

1.  **Role-Based Security & Dashboards:** Custom, high-fidelity views and access scopes for 4 system roles:
    *   **Admin / Principal:** Roster admissions CRUD, academic staff registries, timetables configuration, circular publisher, emergency broadcast blast center, and real-time absence tracking.
    *   **Teacher / Faculty:** Course lists assigned, interactive present/absent/late radio roll calls, term score sheets with real-time grade calculators, dynamic rank triggers, and direct parent messaging.
    *   **Student Parent:** Linked student switcher, arrival check-in tracker, progress report cards, circular bulletin feeds, and communication inbox drawers.
    *   **Student:** Self attendance rates, personal grades, and notices board calendars.
2.  ** Roster Attendance Markers:** Radio grid checklists allowing teachers to record daily general check-ins or subject courses.
3.  **Parent Absences SMS Alerts:** Saving an attendance register automatically dispatches mock SMS notifications to the absent student's parent, logged directly in our audit tables.
4.  ** dynamic Grading & Rankings:** Results entry grids calculate Sri Lankan grades (A, B, C, S, F) in real-time. On save, the backend recalculates class and subject ranks instantly based on descending marks.
5.  **Sri Lankan School Report Cards:** Pixel-perfect report card sheets showing term subject scores, ranks, and averages.
6.  **Print-Ready PDF Exports:** Custom media print stylesheets (`@media print`) and native `window.print()` support export reports and registers to clean, borderless PDFs.
7.  **Localized Switcher Context:** Complete in-app dictionary supporting English, Sinhala (සිංහල), and Tamil (தமிழ்) navigation and data labels.
8.  **Critical Emergency Broadcasts:** Admins can dispatch emergency blasts (simulating SMS/Email gateways) to all parents with a single click.

---

## 🛠️ Technology Stack

*   **Frontend Client:** React SPA, Tailwind CSS (harmonious slate & school navy layout), Recharts (weekly attendance bar graphs), and Lucide Icons.
*   **Backend Server:** Node.js, Express.js.
*   **Database Relational Engine:** SQLite (stored in a single local file `database.sqlite` with strict foreign key constraints, requiring zero setups or external DB servers).
*   **Authentication Portal:** JSON Web Tokens (JWT) signed and verified as cookies or authorization headers.
*   **Security Hashing:** bcryptjs pure-JS hashing (prevents C++ compiler failures on Windows systems).

---

## 🔑 Demo Login Accounts

To make portfolio reviews and faculty tests incredibly easy, the login screen includes **Quick-Click Presets** that pre-fill credentials for each role:

| Authorized Role | Email Address | Login Password | Profile Name |
| :--- | :--- | :--- | :--- |
| **School Administrator** | `admin@smartschool.lk` | `Admin123` | School Administrator |
| **Class Teacher** | `teacher@smartschool.lk` | `Teacher123` | Mr. Sunil Perera |
| **Student Guardian** | `parent@smartschool.lk` | `Parent123` | Mrs. Priyanthi Silva |
| **High School Student** | `student@smartschool.lk` | `Student123` | Kamal Silva |

---

## 💻 Installation & Local Execution

Follow these simple commands to boot the full-stack system on your machine:

### 1. Prerequisite Checks
Make sure you have Node.js (v18+) and npm installed.

### 2. Backend Server Boot
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Create your local `.env` active configuration (already pre-filled for local test ease-of-use):
    ```bash
    # Verified template
    PORT=5000
    JWT_SECRET=smartschool_lk_srilankan_digital_school_jwt_secret_2026_key
    SMS_API_KEY=mock_twilio_sms_api_key_smartschool_lk
    EMAIL_USER=notifications@smartschool.lk
    EMAIL_PASSWORD=mock_email_server_password_secure
    ```
4.  Run integration tests to verify database migrations & seeding:
    ```bash
    node test.js
    ```
5.  Launch development server API:
    ```bash
    npm run start
    ```
    *(The backend server will run on `http://localhost:5000` and automatically populate `database.sqlite` with comprehensive Sri Lankan sample data).*

### 3. Frontend Client Boot
1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Boot Vite dev compiler:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:5173`. Use the quick-click credentials to audit the portals!

---

## 📁 Repository Structure

```
School_project/
├── backend/
│   ├── config/
│   │   └── db.js            # DB connection & Relational Schema seedings
│   ├── database/
│   │   └── database.sqlite  # Generated SQLite Database (gitignored)
│   ├── middleware/
│   │   └── auth.js          # JWT & Role validation
│   ├── routes/
│   │   ├── auth.js          # Sessions & Login
│   │   ├── admin.js         # Student/Teacher/Class management
│   │   ├── teacher.js       # Attendance, Results entries, Parents SMS
│   │   ├── parent.js        # Children reports, Inbox alerts
│   │   ├── student.js       # Self dashboard, Grades
│   │   └── common.js        # Notices and delivery histories
│   ├── server.js            # App Entry Point
│   └── test.js              # Integration verification tests
├── frontend/
│   ├── src/
│   │   ├── components/      # Common layout (Sidebar, Header toolbar)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx  # Localized EN/සිංහල/தமிழ் Context
│   │   ├── pages/
│   │   │   ├── Login.jsx    # Sleek login page with presets
│   │   │   ├── Dashboard.jsx # Layout router wrapper
│   │   │   ├── admin/       # Administrative management screens
│   │   │   ├── teacher/     # Attendance roll calls & marks entry grids
│   │   │   ├── parent/      # Progress report cards & check-in calendars
│   │   │   └── student/     # Personal analytics & bulletins
│   │   ├── utils/
│   │   │   └── api.js        # Axios-like universal fetch gateway
│   │   ├── App.jsx          # Protected route map coordinates
│   │   ├── index.css        # Tailwind configs & Print Stylesheet (@media print)
│   │   └── main.jsx
│   ├── tailwind.config.js   # custom school-navy themes
│   └── vite.config.js
└── README.md                # Extensive Documentation
```

---

## 🔒 Security Practices

1.  **Hashed Passwords:** Plain text passwords are never stored in the database. `bcryptjs` hashes credentials during registry admissions.
2.  **JWT Verification:** All administrative and faculty endpoints are protected by JSON Web Token middleware, validating user scopes before processing queries.
3.  **Cascade Deletion Safeguards:** SQLite foreign keys cascade user removals to their respective profiles, maintaining clean relational mapping integrity.
