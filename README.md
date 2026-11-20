# Basecampy

A Role-Based Access Control (RBAC) backend inspired by Basecamp, featuring secure email authentication, project management, task tracking, and team collaboration workflows.

---

## Features

### Authentication & Security
- **Email & Password Auth:** User registration, login, and logout with hashed passwords (`bcrypt`).
- **Email Verification:** Automated verification links sent on signup with token expiration and resend support.
- **Password Recovery:** Secure forgot-password and reset-password flows via emailed tokens.
- **JWT Session Management:** Short-lived access tokens paired with HTTP-only refresh tokens.

### Role-Based Access Control (RBAC)
- Granular, project-scoped permissions enforced via middleware.
- Support for distinct workspace roles (**Admin**, **Project Admin**, and **Member**).
- Route-level protection ensuring users can only access or mutate resources within their assigned projects and permission tiers.

### Basecamp-Inspired Collaboration
- **Projects:** Create, update, and manage team workspaces with member invitations and role assignments.
- **Tasks & Subtasks:** Organize work into tasks with status tracking (`TODO`, `IN_PROGRESS`, `DONE`), assignees, and file attachments.
- **Project Notes / Message Board:** Centralized announcements, meeting notes, and shared documentation per project.
- **Healthcheck Endpoint:** Built-in API status monitoring for uptime checks and deployments.

---

## Roles & Permissions Matrix

| Action | Admin | Project Admin | Member |
| :--- | :---: | :---: | :---: |
| Create / Delete Project | ✅ | ❌ | ❌ |
| Update Project Details | ✅ | ✅ | ❌ |
| Add / Remove Project Members | ✅ | ✅ | ❌ |
| Assign / Change Member Roles | ✅ | ❌ | ❌ |
| Create / Edit / Delete Tasks | ✅ | ✅ | ❌ |
| Update Assigned Subtask Status | ✅ | ✅ | ✅ |
| Create / Edit / Delete Project Notes | ✅ | ✅ | ❌ |
| View Projects, Tasks & Notes | ✅ | ✅ | ✅ |

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Email Service:** Nodemailer & Mailgen (SMTP / Mailtrap)
- **Validation:** Express Validator / Zod

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas)
- SMTP credentials (e.g., Mailtrap for development, Gmail/Resend/SES for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Azan-Aly/basecampy.git](https://github.com/Azan-Aly/basecampy.git)
   cd basecampy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/basecampy
   CORS_ORIGIN=http://localhost:3000

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
   MAILTRAP_SMTP_PORT=2525
   MAILTRAP_SMTP_USER=your_smtp_user
   MAILTRAP_SMTP_PASS=your_smtp_pass
   MAIL_FROM=noreply@basecampy.dev

   FORGOT_PASSWORD_REDIRECT_URL=http://localhost:3000/reset-password
   ```

4. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## API Overview

Base URL: `/api/v1`

### Auth
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user & send verification email | Public |
| `POST` | `/auth/login` | Authenticate user & issue tokens | Public |
| `POST` | `/auth/logout` | Clear session cookies & invalidate refresh token | Authenticated |
| `GET` | `/auth/verify-email/:token` | Verify user email address | Public |
| `POST` | `/auth/resend-email-verification` | Resend verification email | Authenticated |
| `POST` | `/auth/refresh-token` | Issue a new access token | Public |
| `POST` | `/auth/forgot-password` | Send password reset email | Public |
| `POST` | `/auth/reset-password/:token` | Reset password using token | Public |
| `POST` | `/auth/change-password` | Update current password | Authenticated |
| `GET` | `/auth/current-user` | Get logged-in user profile | Authenticated |

### Projects
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | List all projects for the current user | Authenticated |
| `POST` | `/projects` | Create a new project | Authenticated |
| `GET` | `/projects/:projectId` | Get project details | Member+ |
| `PUT` | `/projects/:projectId` | Update project details | Project Admin+ |
| `DELETE` | `/projects/:projectId` | Delete a project | Admin |
| `GET` | `/projects/:projectId/members` | List project members | Member+ |
| `POST` | `/projects/:projectId/members` | Add a member to the project | Project Admin+ |
| `PUT` | `/projects/:projectId/members/:userId` | Update a member's role | Admin |
| `DELETE` | `/projects/:projectId/members/:userId` | Remove a member from the project | Project Admin+ |

### Tasks & Subtasks
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks/:projectId` | List all tasks in a project | Member+ |
| `POST` | `/tasks/:projectId` | Create a new task | Project Admin+ |
| `GET` | `/tasks/:projectId/t/:taskId` | Get task details | Member+ |
| `PUT` | `/tasks/:projectId/t/:taskId` | Update a task | Project Admin+ |
| `DELETE` | `/tasks/:projectId/t/:taskId` | Delete a task | Project Admin+ |
| `POST` | `/tasks/:projectId/t/:taskId/subtasks` | Create a subtask | Project Admin+ |
| `PUT` | `/tasks/:projectId/st/:subTaskId` | Update subtask status/details | Member+ |
| `DELETE` | `/tasks/:projectId/st/:subTaskId` | Delete a subtask | Project Admin+ |

### Notes
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/notes/:projectId` | List all notes for a project | Member+ |
| `POST` | `/notes/:projectId` | Create a project note | Project Admin+ |
| `GET` | `/notes/:projectId/n/:noteId` | Get a specific note | Member+ |
| `PUT` | `/notes/:projectId/n/:noteId` | Update a note | Project Admin+ |
| `DELETE` | `/notes/:projectId/n/:noteId` | Delete a note | Project Admin+ |

### Healthcheck
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/healthcheck` | Verify API server status | Public |

---

## Project Structure

```text
basecampy/
├── src/
│   ├── controllers/      # Route handler logic
│   ├── db/               # Database connection setup
│   ├── middlewares/      # Auth, RBAC, multer, and validation middlewares
│   ├── models/           # Mongoose schemas (User, Project, Task, Subtask, Note)
│   ├── routes/           # Express API route definitions
│   ├── utils/            # ApiError, ApiResponse, asyncHandler, mail helper
│   ├── validators/       # Request payload validation rules
│   ├── app.js            # Express app configuration
│   └── index.js          # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "feat: add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---
