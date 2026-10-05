# Real-Time Code Collaborator

A browser-based collaborative coding platform where multiple users can join the same room, edit code in real time, run programs with custom input, and save their workspaces.

Built with **React, Node.js, Express, Socket.io, MongoDB, JWT, Monaco Editor, and the Wandbox API**.

---

## Features

* Real-time collaborative code editing with Socket.io
* Room-based collaboration using unique room IDs
* Live code and language synchronization
* Active collaborator list
* Code execution for:

  * C++
  * Python
  * JavaScript
  * Java
* Custom standard input
* Shared execution output
* 400 ms debounce for code synchronization
* JWT-based authentication
* Save, update, open, and delete workspaces
* MongoDB-backed persistent storage
* Dashboard for saved workspaces
* Download code files
* API rate limiting
* Helmet and CORS configuration

---

## Live Demo

[Open the Live Application](https://real-time-code-collaborator-iota.vercel.app/)

---

## Tech Stack

### Frontend

* React
* React Router
* Axios
* Socket.io Client
* Monaco Editor
* Tailwind CSS
* React Hot Toast

### Backend

* Node.js
* Express
* Socket.io
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Axios
* Helmet
* Morgan
* express-rate-limit

### Code Execution

* Wandbox API

---

## Architecture

```text
                         ┌──────────────────────┐
                         │     React Client     │
                         │                      │
                         │  Monaco Editor       │
                         │  Workspace UI        │
                         │  Dashboard           │
                         │  Authentication      │
                         └──────────┬───────────┘
                                    │
                     HTTP / REST    │    WebSocket
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌───────────────────┐              ┌───────────────────┐
        │    Express API    │              │     Socket.io     │
        │                   │              │                   │
        │ Auth              │              │ Room management   │
        │ Code              │              │ Code sync         │
        │ Rooms             │              │ Language sync     │
        └─────────┬─────────┘              │ Output broadcast  │
                  │                        └─────────┬─────────┘
                  │                                  │
          ┌───────┴────────┐                         │
          │                │                         │
          ▼                ▼                         ▼
   ┌─────────────┐   ┌──────────────┐      ┌────────────────┐
   │   MongoDB   │   │   Wandbox    │      │ In-Memory Room │
   │             │   │     API      │      │     State      │
   │ Users       │   │ Code         │      │                │
   │ Saved Code  │   │ Execution    │      │ Code           │
   └─────────────┘   └──────────────┘      │ Language       │
                                           │ Connected Users│
                                           └────────────────┘
```

### Data Storage

**MongoDB** is used for persistent data such as:

* User accounts
* Saved workspaces
* Code
* Workspace ownership
* Code metadata

**In-memory room state** is used for active collaboration:

* Current room code
* Selected language
* Connected users

---

## How It Works

### 1. Authentication

Users can register or log in and receive a JWT.

```text
Register / Login
      │
      ▼
   JWT Token
      │
      ▼
Browser Storage
      │
      ▼
Authorization Header
      │
      ▼
Backend Verification
```

The frontend attaches the token to protected API requests, and the backend verifies it before allowing access to protected resources.

---

### 2. Creating or Joining a Room

Users can create a room or join an existing room using a room ID.

When entering a workspace, the client connects to Socket.io and sends:

```javascript
join-room
```

along with the room ID and username.

The server then:

1. Adds the socket to the room.
2. Registers the user.
3. Initializes the room state when needed.
4. Sends the current code, language, and connected users.
5. Notifies existing participants when a new user joins.

---

## Real-Time Code Synchronization

Code synchronization is handled through Socket.io.

The editor updates local state immediately, but socket synchronization is delayed until **400 ms of inactivity**.

```text
User Types
    │
    ▼
Monaco Editor
    │
    ▼
Local State Update
    │
    ▼
400 ms Debounce
    │
    ▼
code-change
    │
    ▼
Socket.io Server
    │
    ▼
Broadcast to Other Clients
    │
    ▼
code-update
    │
    ▼
Other Editors
```

The server keeps the latest room code in memory and broadcasts updates to the other connected clients.

This reduces unnecessary socket events while keeping the local editor responsive.

---

## Collaborator Presence

The server keeps track of users currently connected to each room.

When a user joins:

```text
user-joined
```

is sent to the room.

When a user disconnects:

```text
user-left
```

is sent to the remaining participants.

The workspace displays the currently connected collaborators.

---

## Language Synchronization

The selected language is also synchronized through Socket.io.

```text
Language Change
      │
      ▼
language-change
      │
      ▼
Socket.io Server
      │
      ▼
language-update
      │
      ▼
Other Clients
```

Supported languages:

* C++
* Python
* JavaScript
* Java

---

## Code Execution

Code execution is handled through the **Wandbox API**.

The frontend sends the selected language, source code, and optional standard input to:

```text
POST /api/code/compile
```

The backend then:

1. Validates the requested language.
2. Selects a suitable Wandbox compiler.
3. Sends the source code and input to Wandbox.
4. Receives compilation and execution results.
5. Returns the result to the frontend.
6. Broadcasts the execution output to other users in the room.

Compiler versions are resolved dynamically from Wandbox, with fallback versions defined in the backend.

---

## Persistent Workspaces

Saved workspaces are stored in MongoDB using Mongoose.

A saved code document contains fields such as:

```text
title
language
code
owner
roomId
createdAt
updatedAt
```

Users can:

* Open saved workspaces
* Save changes
* Update existing workspaces
* Delete saved workspaces

The backend checks workspace ownership before allowing access, updates, or deletion.

---

## Authentication & Security

The project uses JWT-based authentication with bcryptjs password hashing.

Additional backend protections include:

* Helmet for security-related HTTP headers
* CORS for cross-origin communication
* express-rate-limit for request throttling
* Protected routes using JWT middleware
* Ownership checks for saved workspaces

---

## API Rate Limiting

Two levels of rate limiting are configured.

### Global API Limit

```text
100 requests per 15 minutes
```

for `/api` routes.

### Code Execution Limit

```text
10 requests per minute
```

for code compilation requests.

This helps control excessive requests to the code execution service.

---

## Project Structure

```text
real-time-code-collaborator/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EditorWindow
│   │   │   └── TerminalWindow
│   │   │
│   │   ├── pages/
│   │   │   ├── Home
│   │   │   ├── Workspace
│   │   │   ├── Dashboard
│   │   │   └── Auth
│   │   │
│   │   ├── services/
│   │   │   ├── api
│   │   │   └── socket
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── backend/
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── codeController.js
    │   └── roomController.js
    │
    ├── middleware/
    │   └── authMiddleware.js
    │
    ├── models/
    │   ├── User.js
    │   └── Code.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── codeRoutes.js
    │   └── roomRoutes.js
    │
    ├── services/
    │   ├── socketService.js
    │   └── wandboxService.js
    │
    ├── app.js
    ├── server.js
    └── package.json
```

---

## Local Setup

### Prerequisites

* Node.js
* npm
* MongoDB
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/premsingh16/real-time-code-collaborator.git
cd real-time-code-collaborator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

Backend:

```text
http://localhost:3000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend

| Variable     | Purpose                                      |
| ------------ | -------------------------------------------- |
| `PORT`       | Backend server port                          |
| `MONGO_URI`  | MongoDB connection string                    |
| `JWT_SECRET` | Secret used for JWT signing and verification |
| `JWT_EXPIRE` | JWT expiration duration                      |
| `CLIENT_URL` | Frontend origin                              |
| `NODE_ENV`   | Application environment                      |

### Frontend

| Variable           | Purpose         |
| ------------------ | --------------- |
| `VITE_BACKEND_URL` | Backend API URL |

> Keep your actual `.env` files and secret values out of GitHub. The variable names can be documented here, but credentials and secrets should never be committed.

---

## Engineering Decisions

### Socket.io for Collaboration

REST APIs handle authentication, saving workspaces, loading data, and code execution.

Socket.io handles state that needs to move between active collaborators in real time.

### Debounced Code Synchronization

The editor updates locally immediately, while socket synchronization waits for **400 ms of inactivity**.

This reduces unnecessary socket events during continuous typing.

### In-Memory Room State

Active room state is stored in a server-side `Map` containing the current code, language, and connected users.

MongoDB is used for persistent users and saved workspaces.

Because active room state is process-local, the current implementation is not designed for horizontally scaled backend instances.

### Backend Ownership Checks

Saved workspaces are associated with the authenticated user's ID.

The backend verifies ownership before allowing a workspace to be retrieved, updated, or deleted.

### External Code Execution

Code is sent to the Wandbox API instead of being executed directly on the application server.

The backend acts as the bridge between the editor and the external execution service.

---

## Testing & Observations

The collaboration workflow was manually tested using multiple simultaneous clients/tabs.

* Approximately **6–7 simultaneous clients** were tested.
* No missed synchronization updates were observed during the testing performed.
* Code execution was observed to typically take around **2–4 seconds**, depending on the program and external service response.

These are manual observations, not formal performance benchmarks.

---


## Future Improvements

* Redis-backed room state and Socket.io adapter for multi-instance deployments
* Persistent active-room state for recovery after backend restarts
* OT/CRDT-based synchronization for more advanced collaborative editing
* Stronger code execution quotas and resource controls
* Collaborator cursors and selections

---

## Author

Prem Singh

[GitHub](https://github.com/premsingh16)
[LinkedIn](https://www.linkedin.com/in/premsingh16/)

---

## License

This project is currently provided without a specified open-source license.
