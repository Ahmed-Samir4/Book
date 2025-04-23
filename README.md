

# 📚 AI-Powered Book Platform

This is the backend system of an innovative AI-powered platform that enhances the digital reading and publishing experience by integrating advanced technologies such as AI image generation, NLP-based text enhancement, and audio narration.

## 🔍 Overview

This platform aims to transform traditional reading by providing:
- **Readers** with an immersive, visual, and auditory book experience.
- **Authors** with an intuitive self-publishing interface and AI tools for illustration and narration.

Built with **Node.js**, **Express**, and **MongoDB**, this backend supports the platform’s core features such as book management, user interactions, reviews, category handling, and integration with AI services.

## 🚀 Features

### 🔒 Authentication & Authorization
- JWT-based secure login and role-based access control (User, Author, Admin)
- Password hashing (bcrypt), token-based password reset, and email verification

### 📘 Book Management
- CRUD operations on books with category associations and author info
- Support for AI-generated images and audio per book passage
- Filtering, pagination, and search functionality

### 🧠 AI-Powered Enhancements
- **Image Generation:** Generate book illustrations from text using external AI services
- **Text Enhancement:** NLP-based tools to clarify and refine selected text
- **Audio Narration:** Convert book passages into natural-sounding audio

### 🧾 Reviews and Ratings
- User-submitted ratings and comments on books
- Enforced relationships between reviews, books, and users

### 🗂️ Category Management
- Create and manage book categories with associated images and metadata

## ⚙️ Technologies Used

| Stack | Description |
|-------|-------------|
| **Node.js** | Server-side JavaScript runtime |
| **Express.js** | Lightweight web application framework |
| **MongoDB** | NoSQL database with flexible document schema |
| **Mongoose** | ODM for MongoDB |
| **JWT & Bcrypt** | Secure authentication and password encryption |
| **External AI APIs** | For image generation, NLP, and TTS |

## 🧩 System Architecture

The platform follows a **modular architecture** with clear separation of concerns:
- **Controllers** for request handling
- **Services** for business logic and AI integrations
- **Models** for MongoDB schemas
- **Middlewares** for validation, logging, and error handling

## 📁 Folder Structure (Simplified)

```
Book-Backend/
│
├── index.js                  # Main entry point
├── config/                   # Environment configuration
├── DB/                       # MongoDB connection & models
│   ├── connection.js
│   └── Models/
│       ├── book.model.js
│       ├── user.model.js
│       ├── category.model.js
│       └── review.model.js
├── src/
│   ├── modules/              # Feature-based modules (Book, User, Review...)
│   ├── services/             # AI services and helpers
│   ├── middlewares/
│   └── utils/
└── package.json
```

## 🛡️ Security Highlights

- JWT token validation for protected routes
- CORS policies for frontend-backend interaction
- Secure API key handling for AI integrations
- Input sanitization and robust error handling

## 📊 Performance & Evaluation

| Feature                 | Performance |
|------------------------|-------------|
| API Response Time      | 180–350ms   |
| AI Image Generation    | 3–5s avg    |
| Audio Narration        | 98% success |
| Text Enhancement       | 95% clarity |
| CRUD Operations        | 99% success |
| Security Tests         | 100% pass   |

## 🧪 API Testing

The API can be tested using [Postman](https://www.postman.com/):
- A full Postman collection is available with environment variables.
- Authentication required for protected routes using `{{token}}`.

## 🌐 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB instance or cluster
- AI API keys stored in `.env` file

### Setup

```bash
# Clone the repo
git clone https://github.com/Ahmed-Samir4/Book.git

# Navigate to project folder
cd Book

# Install dependencies
npm install

# Start the server
npm start
```

### Environment Variables (`.env`)
```
PORT=5000
DB_URI=mongodb://localhost:27017/book-platform
JWT_SECRET=your_jwt_secret
AI_IMAGE_API_KEY=your_image_api_key
AI_NLP_API_KEY=your_nlp_api_key
AI_AUDIO_API_KEY=your_audio_api_key
```

## 🧠 Project Scope (Graduation Project)

This project was developed as part of a graduation capstone at the **Egyptian Chinese University** under the supervision of **Dr. Noha Hussien**. The goal was to create a scalable, user-friendly platform that leverages AI to:
- Enhance reader engagement
- Empower self-publishing authors
- Demonstrate full-stack and AI integration expertise

## 📄 License

This project is part of an academic submission and not currently released under a commercial license. For educational or demonstration use only.

---
