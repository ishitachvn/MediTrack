# 💊 MediTrack – Smart Medicine Reminder & AI Health Tracking System

> An AI-powered healthcare web application that helps users manage medicines, track daily health habits, and receive personalized health insights.

Built for **SDG 3 – Good Health & Well-Being**.

---

## 🌍 SDG Alignment

MediTrack supports **United Nations Sustainable Development Goal 3 (Good Health and Well-Being)** by helping users:

- 💊 Never miss medicines
- ❤️ Build healthy daily habits
- 📊 Track personal health
- 🤖 Receive AI-powered health insights
- 📅 Stay consistent with medication schedules

---

# ✨ Features

## 🔐 Authentication

- Secure JWT Authentication
- User Registration
- User Login
- Protected Routes
- Logout

---

## 💊 Medicine Management

- Add Medicines
- Edit Medicines
- Delete Medicines
- Medicine Schedule
- Medicine Status
- Mark Medicine as Taken
- Mark Medicine as Missed
- Search Medicines

---

## ❤️ Health Tracker

Track daily:

- 💧 Water Intake
- 😴 Sleep Hours
- 🏃 Exercise Minutes

View your daily progress directly on the dashboard.

---

## 📊 Dashboard

The dashboard provides:

- Today's Medicines
- Medicine Adherence
- Health Summary
- Water Tracker
- Sleep Tracker
- Exercise Tracker
- AI Health Insight
- Statistics Cards

---

# 🤖 AI Health Agent

One of the main highlights of MediTrack is the **AI Health Agent** powered by **Google Gemini**.

Instead of acting as a generic chatbot, the AI understands the authenticated user's own health records.

### AI can answer:

- What medicines do I have today?
- What is my next medicine?
- Which medicines are still pending?
- How am I doing this week?
- Summarize my health.
- How much water have I consumed?
- How many hours did I sleep?
- How is my medicine adherence?

---

## 🧠 Hybrid AI Architecture

The AI follows a hybrid approach.

### Simple Questions

Answered directly from MongoDB.

Example:

- Today's medicines
- Next medicine
- Pending medicines
- Water intake
- Sleep logs

### Complex Questions

For summaries and personalized insights:

MongoDB data is securely provided as context to Google Gemini, which generates personalized responses.

This reduces unnecessary AI API calls while keeping responses grounded in user data.

---

# 🛠 Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Context API
- CSS
- Axios

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication

### AI

- Google Gemini API

### Charts

- Chart.js

---

# 📂 Project Structure

```
MediTrack/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── package.json
└── README.md
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/ishitachvn/MediTrack.git
```

---

## 2. Frontend

```bash
cd MediTrack
npm install
npm run dev
```

---

## 3. Backend

```bash
cd backend
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create:

```
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_api_key
```

---

# 📸 Screenshots

Add screenshots here.

Example:

- Home Page
- Login
- Dashboard
- Add Medicine
- Health Tracker
- AI Health Agent

---

# 🎯 Future Enhancements

- Voice-enabled AI Assistant
- Smart Medicine Notifications
- Doctor Dashboard
- Family Member Accounts
- OCR Prescription Scanner
- Wearable Device Integration
- Health Report PDF Export

---

# 🔒 Security

- JWT Authentication
- Protected API Routes
- User-specific MongoDB Queries
- Secure Environment Variables
- Password Hashing

---

# 👩‍💻 Author

**Ishita Chavan**

GitHub:
https://github.com/ishitachvn

LinkedIn:
(Add your LinkedIn profile)

---

# 🙏 Acknowledgements

- Google Gemini API
- MongoDB Atlas
- React
- Express.js
- Node.js
- Chart.js

---

# ⭐ If you like this project

Please consider giving this repository a ⭐ on GitHub.
