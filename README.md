# Student Chatbot Application

A MERN stack application that helps students create study plans, quizzes, and notes using AI-powered chat.

## Features

- AI-powered chatbot for answering student questions
- Create and manage study plans with tasks and progress tracking
- Generate quizzes based on topics
- Take notes and organize them with tags
- File upload support for attaching documents in chats

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Handling**: Multer
- **AI Integration**: OpenAI API

## Project Structure

```
student_chatbot/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.tsx          # Main app component with routing
│   └── ...
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Middleware functions
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Server entry point
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/student_chatbot.git
   cd student_chatbot
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Configure environment variables
   Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/student_chatbot
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Install frontend dependencies
   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- **Authentication**
  - POST `/api/auth/register` - Register a new user
  - POST `/api/auth/login` - Login user

- **Chat**
  - GET `/api/chats` - Get all chats for a user
  - POST `/api/chats` - Create a new chat
  - GET `/api/chats/:id` - Get a specific chat
  - PUT `/api/chats/:id` - Update a chat
  - DELETE `/api/chats/:id` - Delete a chat

- **Study Plans**
  - GET `/api/study-plans` - Get all study plans
  - POST `/api/study-plans` - Create a new study plan
  - GET `/api/study-plans/:id` - Get a specific study plan
  - PUT `/api/study-plans/:id` - Update a study plan
  - DELETE `/api/study-plans/:id` - Delete a study plan

- **Quizzes**
  - GET `/api/quizzes` - Get all quizzes
  - POST `/api/quizzes` - Create a new quiz
  - GET `/api/quizzes/:id` - Get a specific quiz
  - PUT `/api/quizzes/:id` - Update a quiz
  - DELETE `/api/quizzes/:id` - Delete a quiz

- **Notes**
  - GET `/api/notes` - Get all notes
  - POST `/api/notes` - Create a new note
  - GET `/api/notes/:id` - Get a specific note
  - PUT `/api/notes/:id` - Update a note
  - DELETE `/api/notes/:id` - Delete a note

- **File Upload**
  - POST `/api/uploads` - Upload files

## License

This project is licensed under the MIT License. 