# OTP Authentication System

## 📌 Overview
This is an OTP-based authentication system with an **Admin Panel** for email registration. The authentication flow is as follows:
1. **Admin registers an email**.
2. **User logs in** using the registered email.
3. **Clicking on login sends an OTP** to the email.
4. **Verifying OTP** grants access to the **Dashboard**.
5. **Clicking on Logout** redirects the user back to the login page.

---

## 🏗️ Tech Stack
### Frontend:
- React.js
- React Router DOM
- Tailwind CSS

### Backend:
- Node.js
- Express.js
- MongoDB (for storing registered emails)
- Nodemailer (for sending OTP emails)

---

## 🖥️ Setup & Installation

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/Harshsukhija24/GREENDZINE.git
   cd otp-auth-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string

   JWT_SECRET=your_secret_key
   ```
4. Start the backend server:
   ```sh
   npm start
   ```
5. The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/Harshsukhija24/GREENDZINE.git
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm start
   ```
4. The frontend will run on `http://localhost:5173`.

---

## 📌 Frontend Routes
| Path         | Component             | Description             |
|-------------|----------------------|-------------------------|
| `/`         | `Login`               | User login page         |
| `/dashboard`| `AnalyticsDashboard`  | User dashboard (Protected) |
| `/signup`   | `Signup`              | User signup page        |
| `/admin`    | `AdminLogin`          | Admin login page        |

---

## 🔌 API Endpoints
### Authentication Routes (Backend)
| Method | Endpoint        | Description                       |
|--------|---------------|-----------------------------------|
| POST   | `/emaillogin`   | Logs in user via email & sends OTP |
| POST   | `/emailverify`  | Verifies OTP & grants access      |
| POST   | `/usersignup`   | Admin registers an email          |

---

## 🎯 Features
✅ **Email Registration** (Admin adds user emails)  
✅ **OTP-based Login System**  
✅ **Secure OTP Verification**  
✅ **Protected Dashboard** (Accessible only after OTP verification)  
✅ **Logout Functionality** (Redirects to login page)  

-