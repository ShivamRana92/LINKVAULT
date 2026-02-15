LinkVault – Secure Temporary Content Sharing Platform

    A full-stack web application for secure, temporary sharing of text and files using unique links. The system supports password protection, auto-expiration, view limits, and manual deletion with proper security controls.

    Design Lab Project
    Shivam Rana (25CS60R76)
    MTech CSE, IIT Kharagpur
    February 2026


    Overview :-

        LinkVault allows users to generate temporary links to share text or files. Each shared item can be configured with:
        -> Expiry time
        -> Maximum view limits
        -> One-time view option
        -> Password protection
        -> Manual delete option

        The system ensures controlled access and automatic invalidation of expired or overused content.


    Features Implemented :-

        Core Features
        1. Text Sharing (up to 5000 characters)
        2. File Sharing (up to 5MB)
        3. Custom Expiry Date & Time
        4. Default Expiry (10 minutes if not specified)
        5. Maximum View Limit
        6. One-Time View (via maxViews = 1)
        7. Password Protection (bcrypt hashed)
        8. Manual Delete
        9. Secure File Upload Validation
        10. File Deletion from Disk on Manual Delete


    Security Features :-

        1. Passwords hashed using bcrypt
        2. Helmet middleware for secure HTTP headers
        3. CORS restricted to frontend origin
        4. Express rate limiting (100 requests per 15 minutes)
        5. File MIME type validation
        6. File extension validation
        7. File size limit (5MB)
        8. Proper HTTP status codes
        9. Centralized global error handling


    Tech Stack :-

        Frontend
            -> React (Vite)
            -> React Router DOM
            -> Axios
            -> Tailwind CSS

        Backend
            -> Node.js
            -> Express.js
            -> MongoDB (Mongoose)
            -> Multer (file uploads)
            -> bcrypt (password hashing)
            -> Helmet
            -> express-rate-limit
            -> CORS


    Setup Instructions :-

        Prerequisites
            -> Node.js (v18+ recommended)
            -> npm
            -> MongoDB (local or MongoDB Atlas)


        1. Clone Repository
            git clone https://github.com/ShivamRana92/LINKVAULT.git
            cd LINKVAULT

        2. Backend Setup
            cd backend
            npm install

            Create a .env file inside backend directory:
            PORT=5000
            MONGO_URI=your_mongodb_connection_string

            Start backend server:
            npm start

            Server runs at:
            http://localhost:5000

        3. Frontend Setup
            Open a new terminal:
            cd frontend
            npm install
            npm run dev

            Frontend runs at:
            http://localhost:5173


    API Overview :-

        1. Upload Content

            Endpoint:
            POST /api/content/upload

            Request Type: FormData

            Fields:
            -> text (optional if file provided)
            -> file (optional if text provided)
            -> expiryDateTime (optional)
            -> maxViews (optional)
            -> password (optional)

            Response:
            {
            "link": "http://localhost:5173/<content_id>"
            }

        2. Get Content

            Endpoint:
            POST /api/content/:id

            Note: POST is used instead of GET because password may be required.

            Body (if password protected):
            {
            "password": "your_password"
            }

            Response:
            {
            "type": "text" or "file",
            "text": "...",
            "fileUrl": "...",
            "fileName": "...",
            "expiresAt": "...",
            "maxViews": number,
            "viewsUsed": number
            }

            Possible Status Codes:
            200 – Success
            401 – Password required
            403 – Incorrect password
            404 – Content not found
            410 – Expired or max views exceeded

        3. Delete Content (Manual Delete)

            Endpoint:
            DELETE /api/content/:id

            Body (if password protected):
            {
            "password": "your_password"
            }

            Response:
            {
            "message": "Content deleted successfully"
            }

            Behavior:
            -> Deletes database entry
            -> Deletes associated file from disk (if file type)


    Design Decisions :-

        1. POST for Content Retrieval
            Since password may be required, POST is used instead of GET to securely transmit the password in the request body.

        2. Password Hashing
            Passwords are hashed using bcrypt before storing in MongoDB. Plain text passwords are never stored.

        3. View Counting Logic
            --> Views are incremented only after:
            --> Expiry validation
            --> Max view validation
            --> Password validation (if required)

            This prevents incorrect view increments.

        4. Default Expiry
            If no expiry is provided, content expires automatically after 10 minutes.

        5. File Storage
            Files are stored locally in the /uploads directory.
            On manual deletion, the file is removed from disk.

        6. Security Middleware
            --> Helmet for secure HTTP headers
            --> CORS restricted to frontend origin
            --> Rate limiting for abuse prevention
            --> Global error handler for multer and other runtime errors


    Assumptions :-

        1. MongoDB is running and accessible.
        2. Application runs in local development environment.
        3. HTTPS is assumed in production.
        4. Moderate traffic usage (academic project scale).


    Limitations :-

        1. No user authentication system.
        2. No background cleanup job for expired content.
        3. Files stored locally (not cloud storage).
        4. No virus scanning for uploaded files.
        5. No distributed concurrency control.
        6. No analytics or tracking system.
        7. No deployment configuration included.


    Project Structure :-

        LinkVault/
        │
        ├── backend/
        │   ├── src/
        │   │   ├── app.js
        │   │   ├── server.js
        │   │   ├── config/
        │   │   ├── controllers/
        │   │   │   └── contentController.js
        │   │   ├── models/
        │   │   │   └── Content.js
        │   │   ├── routes/
        │   │   │   └── contentRoutes.js
        │   │   └── utils/
        │   │
        │   ├── uploads/              # Uploaded files (ignored in Git)
        │   ├── package.json
        │   └── package-lock.json
        │
        ├── frontend/
        │   ├── public/
        │   │   └── vite.svg
        │   │
        │   ├── src/
        │   │   ├── App.jsx
        │   │   ├── App.css
        │   │   ├── index.css
        │   │   ├── main.jsx
        │   │   ├── assets/
        │   │   └── pages/
        │   │       ├── Upload.jsx
        │   │       └── View.jsx
        │   │
        │   ├── index.html
        │   ├── tailwind.config.js
        │   ├── postcss.config.js
        │   ├── vite.config.js
        │   ├── package.json
        │   └── package-lock.json
        │
        ├──  README.md
        │
        └──  DatabaseSchema.txt


    Academic Note :-

        This project was developed as part of the Design Lab coursework at IIT Kharagpur and focuses on secure temporary content sharing with configurable privacy controls.