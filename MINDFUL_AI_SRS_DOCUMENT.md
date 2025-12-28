# Software Requirements Specification (SRS) - MindfulAI
**Project Title:** MindfulAI: Comprehensive Mental Health & Wellness Platform
**Version:** 1.0
**Date:** December 28, 2025

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to provide a detailed overview of the "MindfulAI" platform. It outlines the functional and non-functional requirements of the system, including AI-driven emotion analysis, wellness tracking, and mental health professional networking.

### 1.2 Scope
MindfulAI is a hybrid-architecture application designed to provide users with a safe, responsive, and intelligent environment for mental health management. The system integrates Next.js for a premium frontend experience, Express.js for core business logic, and Python FastAPI microservices for heavy AI/ML computations (Text, Voice, Face analysis).

### 1.3 Definitions, Acronyms, and Abbreviations
*   **SRS:** Software Requirements Specification
*   **MERN:** MongoDB, Express, React (Next.js), Node.js
*   **AI/ML:** Artificial Intelligence / Machine Learning
*   **OTP:** One-Time Password
*   **JWT:** JSON Web Token

---

## 2. Overall Description
### 2.1 Product Perspective
MindfulAI is an independent, cross-platform web application. It operates in a multi-service environment where a Node.js server acts as the central hub, coordinating data between a MongoDB database and a suite of Python-based AI microservices.

### 2.2 Product Functions
*   **Secure Authentication:** OTP-based login (Email/SMS) and standard credentials.
*   **Multi-modal AI Emotion Recognition:**
    *   **Text:** Sentiment and emotion analysis of journal entries.
    *   **Voice:** Stress level and mood detection from audio recordings.
    *   **Face:** Real-time facial expression analysis via webcam.
*   **Coping Strategies:** Intelligent suggestions based on detected emotional states.
*   **Specialist Finder:** Geospatial search for nearby mental health professionals.
*   **Mood Journaling:** Digital record of user emotional trends with visual analytics.

### 2.3 User Classes and Characteristics
*   **General User:** Individuals seeking mental health support and self-tracking.
*   **Specialist/Therapist:** Healthcare professionals listed in the directory.
*   **Administrator:** System overseers managing users and platform health.

### 2.4 Operating Environment
*   **Frontend:** Modern web browsers (Chrome, Firefox, Safari, Edge).
*   **Backend:** Node.js 18+, Python 3.11+.
*   **Database:** MongoDB (Atlas/Local).
*   **Deployment:** Cloud providers (Vercel for Frontend, Railway/Render for Backends).

---

## 3. System Features

### 3.1 System Feature: AI Emotion Fusion
**3.1.1 Description and Priority**
Priority: High. The system combines text, voice, and facial data to provide a "Fusion Score," representing the most accurate emotional assessment of the user.

**3.1.2 Functional Requirements**
*   **REQ-1:** System shall capture user text/audio/video input.
*   **REQ-2:** Python microservices shall process inputs using DistilRoBERTa (Text) and DeepFace (Face).
*   **REQ-3:** The Fusion Service shall weigh results to determine a final emotional state.

### 3.2 System Feature: Specialist Geolocation
**3.2.1 Description and Priority**
Priority: Medium. Helping users find physical help quickly.

**3.2.2 Functional Requirements**
*   **REQ-4:** System shall request user location coordinates via Browser API.
*   **REQ-5:** The database shall use 2dsphere indexing to find doctors within a 50km radius.
*   **REQ-6:** Results shall display distance, rating, and contact information.

---

## 4. External Interface Requirements
### 4.1 User Interfaces
*   **Design System:** Glassmorphism, Modern Dark Mode, Smooth Framer Motion animations.
*   **Compatibility:** Fully responsive for Desktop, Tablet, and Mobile.

### 4.2 Software Interfaces
*   **Auth:** Twilio (SMS), Nodemailer/Gmail (Email).
*   **AI Models:** HuggingFace Transformers, PyTorch, TensorFlow.
*   **Maps/Geo:** Browser Geolocation API.

---

## 5. Non-Functional Requirements
### 5.1 Performance Requirements
*   **Response Time:** AI analysis should return results in < 3 seconds.
*   **Scalability:** Microservices architecture allows independent scaling of AI models.

### 5.2 Security Requirements
*   **Data Protection:** Password hashing (Bcrypt), JWT for session management.
*   **Privacy:** Secure storage of personal journal entries.

### 5.3 Reliability
*   **Uptime:** The system shall maintain 99.9% availability via Railway auto-restarts.

---

## 6. Architecture & Tech Stack
*   **Frontend:** Next.js 14, TypeScript, Tailwind CSS.
*   **Main Backend:** Node.js (Express) - Port 5000.
*   **AI Microservices:** Python (FastAPI) - Ports 8002-8005.
*   **Database:** MongoDB.
*   **Infrastructure:** GitHub Actions (CI/CD), Docker.
