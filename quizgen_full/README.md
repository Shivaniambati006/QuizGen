# QuizGen

An AI-powered quiz generation and assessment platform that transforms study material into structured, interactive quizzes using Google Gemini.

QuizGen accepts study material as text or PDF input, generates questions using an LLM, evaluates user responses, identifies weak topics, and provides targeted practice and performance insights.

---

## Overview

QuizGen is an AI-assisted learning application designed around:

- Large Language Model integration
- Grounded quiz generation
- Structured JSON generation
- Automated assessment
- Weak-topic identification
- Targeted practice
- PDF text extraction
- Quiz history and persistence
- Modular application architecture

The application uses Google Gemini for AI-powered quiz generation and PDF.js for client-side PDF text extraction.

---

## Features

### AI-Powered Quiz Generation

Generate quizzes from user-provided study material using Google Gemini.

Quiz configuration includes:

- Number of questions
- Difficulty level
- Question type
- Study material
- Targeted weak topics

Supported question types:

- Multiple Choice Questions
- True / False
- Fill in the Blank

---

### Study Material Input

Study material can be provided through:

- Direct text input
- PDF upload

PDF content is extracted using PDF.js before being passed into the quiz generation pipeline.

---

### Structured AI Output

QuizGen requests structured JSON from Gemini.

Example:

```json
{
  "question": "Which protocol provides reliable transport?",
  "type": "MCQ",
  "options": [
    "TCP",
    "UDP",
    "IP",
    "ARP"
  ],
  "answer": "TCP",
  "explanation": "TCP provides connection-oriented and reliable transport.",
  "topic": "Computer Networks",
  "difficulty": "Medium"
}
```

AI-generated responses are validated before being used by the application.

---

## Architecture

```text
                    +----------------------+
                    |        User          |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |       UI Layer       |
                    | Components / Views   |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |   Application State  |
                    +----------+-----------+
                               |
                +--------------+--------------+
                |                             |
                v                             v
       +------------------+          +------------------+
       | Quiz Generation  |          | PDF Extraction   |
       |    Service       |          |     Service      |
       +--------+---------+          +--------+---------+
                |                             |
                v                             |
       +------------------+                   |
       |   Prompt Layer   |                   |
       +--------+---------+                   |
                |                             |
                v                             |
       +------------------+                   |
       |   Gemini API     |                   |
       +--------+---------+                   |
                |
                v
       +------------------+
       | JSON Validation  |
       +--------+---------+
                |
                v
       +------------------+
       | Quiz Evaluation  |
       +--------+---------+
                |
                v
       +----------------------+
       | Results / Analytics  |
       +----------------------+
```

---

# Tech Stack

| Technology    | Purpose                              |
| ------------- | ------------------------------------ |
| JavaScript    | Application logic                    |
| Vite          | Development server and build tooling |
| Google Gemini | AI-powered quiz generation           |
| PDF.js        | PDF text extraction                  |
| HTML5         | Application structure                |
| CSS           | Application styling                  |
| Tailwind CSS  | UI styling                           |
| LocalStorage  | Client-side persistence              |

---

# Project Structure

```text
quizgen/
│
├── index.html
│
├── public/
│   └── assets/
│
├── src/
│   │
│   ├── api/
│   │   └── gemini.js
│   │
│   ├── components/
│   │   ├── apiKeyModal.js
│   │   ├── architectureGuide.js
│   │   ├── history.js
│   │   ├── home.js
│   │   ├── navigation.js
│   │   ├── quizCreator.js
│   │   ├── quizInterface.js
│   │   └── results.js
│   │
│   ├── config/
│   │   └── constants.js
│   │
│   ├── prompts/
│   │   └── quizPrompt.js
│   │
│   ├── services/
│   │   ├── pdfExtractor.js
│   │   └── quizEvaluator.js
│   │
│   ├── state/
│   │   └── appState.js
│   │
│   ├── storage/
│   │   └── historyStorage.js
│   │
│   ├── styles/
│   │   └── main.css
│   │
│   ├── validators/
│   │   └── quizValidator.js
│   │
│   └── app.js
│
├── data/
│   └── sampleNotes.js
│
├── docs/
│   ├── architecture.md
│   └── run.md
│
├── legacy/
│   └── original.html
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# How to Run

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* VS Code (recommended)

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

Example:

```text
v24.x.x
10.x.x
```

---

## 1. Clone the Repository

Clone the project:

```bash
git clone <repository-url>
```

Example:

```bash
git clone https://github.com/your-username/quizgen.git
```

Move into the project directory:

```bash
cd quizgen
```

Verify that the project contains `package.json`:

```bash
ls
```

You should see:

```text
index.html
package.json
src/
public/
data/
docs/
legacy/
```

---

# 2. Install Dependencies

Run:

```bash
npm install
```

This installs all dependencies defined in `package.json`.

---

# 3. Start the Development Server

Run:

```bash
npm run dev
```

Vite will start the development server.

You should see something similar to:

```text
VITE v7.x.x ready in xxx ms

➜ Local: http://localhost:5173/
➜ Network: use --host to expose
```

Open the local URL in your browser:

```text
http://localhost:5173/
```

### If Port 5173 Is Already in Use

Vite automatically selects another available port.

For example:

```text
Port 5173 is in use, trying another one...
Port 5174 is in use, trying another one...

➜ Local: http://localhost:5175/
```

In this situation, open:

```text
http://localhost:5175/
```

Always use the URL printed by Vite.

---

# 4. Stop the Development Server

To stop the Vite development server:

```text
Ctrl + C
```

in the terminal.

---

# 5. Production Build

To create a production build:

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

---

# 6. Preview the Production Build

After running:

```bash
npm run build
```

run:

```bash
npm run preview
```

Vite will provide a local preview URL.

Example:

```text
➜ Local: http://localhost:4173/
```

Open that URL in your browser.

---

# Available npm Commands

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm install`     | Install project dependencies |
| `npm run dev`     | Start development server     |
| `npm run build`   | Create production build      |
| `npm run preview` | Preview production build     |

---

# Gemini API Configuration

QuizGen uses Google Gemini for AI-powered quiz generation.

The application requires a Gemini API key for AI generation.

Create a `.env` file from the provided example:

```bash
cp .env.example .env
```

Then configure:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit your real API key to Git.

The `.gitignore` file should contain:

```text
.env
.env.local
node_modules/
dist/
```

---

# Security Considerations

The current implementation is primarily designed as a client-side prototype.

If the Gemini API key is exposed to the browser, it should not be considered secure for a public production deployment.

A production architecture should use:

```text
Browser
   |
   v
Backend / Serverless API
   |
   v
Google Gemini API
```

The Gemini API key should remain on the server.

Recommended production improvements:

* Server-side API key management
* Authentication
* Rate limiting
* Request validation
* Usage limits
* Secure secret management
* Input validation
* Monitoring
* Error tracking

---

# AI Generation Pipeline

The quiz generation workflow is:

```text
Study Material
      |
      v
Text / PDF Extraction
      |
      v
Quiz Configuration
      |
      v
Prompt Construction
      |
      v
Gemini API
      |
      v
Structured JSON
      |
      v
Response Validation
      |
      v
Interactive Quiz
      |
      v
Quiz Evaluation
      |
      v
Weak Topic Detection
      |
      v
Targeted Practice
```

---

# Prompt Engineering

The prompt layer defines the requirements given to the Gemini model.

The generation request specifies:

* Question count
* Difficulty
* Question type
* Output format
* Answer options
* Correct answer
* Explanation
* Topic
* Grounding requirements

The application requests JSON output so that the response can be parsed and validated programmatically.

---

# Grounded Generation

QuizGen is designed to generate questions from the supplied study material.

The model receives the study material as context and is instructed to create questions based on that material.

This helps maintain alignment between:

```text
Source Material
      |
      v
AI Generated Questions
```

For a production-grade implementation, this can be extended with:

* Retrieval-Augmented Generation
* Document chunking
* Vector embeddings
* Semantic search
* Source citations
* Retrieval evaluation

---

# Quiz Evaluation

Scoring is performed programmatically.

The system tracks:

* Correct answers
* Incorrect answers
* Unanswered questions
* Total questions
* Score
* Question-level results
* Weak topics

Example:

```text
Total Questions: 10
Correct: 8
Incorrect: 2
Score: 80%
```

---

# Weak Topic Analysis

Incorrect answers are associated with their corresponding topic.

Example:

```text
Weak Topics

Computer Networks
TCP Handshake
Error Control
```

These topics can be used to generate targeted practice questions.

---

# PDF Processing

PDF documents are processed using PDF.js.

The workflow is:

```text
PDF Upload
    |
    v
ArrayBuffer
    |
    v
PDF.js
    |
    v
Page Extraction
    |
    v
Text Content
    |
    v
Study Material
    |
    v
Quiz Generation
```

---

# Data Persistence

The current application uses browser LocalStorage for local persistence.

This allows quiz history to remain available without requiring a backend database.

For a production application, persistence could be moved to:

```text
Frontend
    |
    v
Backend API
    |
    v
Database
```

Potential database entities:

```text
User
Quiz
Question
QuizAttempt
Answer
Topic
PerformanceMetric
```

---

# Error Handling

The application should handle failures at each stage of the pipeline.

Potential failure cases include:

* Invalid PDF files
* PDF extraction failures
* Empty study material
* Invalid API keys
* Gemini API failures
* Network failures
* Invalid JSON
* Malformed AI responses
* Browser storage failures

AI-generated data should always be validated before being used by application logic.

---

# Development Workflow

Recommended workflow:

```bash
git checkout -b feature/feature-name
```

Make your changes and test locally:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Then commit your changes:

```bash
git add .
git commit -m "feat: add feature description"
```

Push the branch:

```bash
git push origin feature/feature-name
```

---

# Commit Convention

Recommended commit format:

```text
feat: add adaptive quiz generation
fix: validate malformed quiz responses
refactor: separate quiz evaluation service
docs: update architecture documentation
style: improve quiz interface
chore: update dependencies
```

---

# Testing Strategy

A production version should include:

## Unit Tests

```text
Prompt generation
Quiz validation
Answer normalization
Score calculation
Weak-topic classification
History storage
```

## Integration Tests

```text
PDF extraction
Gemini API integration
Quiz generation
Quiz submission
Result generation
```

## End-to-End Tests

```text
Upload study material
        |
Configure quiz
        |
Generate quiz
        |
Answer questions
        |
Submit quiz
        |
View results
        |
Review weak topics
        |
Generate targeted practice
```

---

# Current Limitations

The current version is primarily a client-side application.

Known limitations include:

* No user authentication
* LocalStorage-based persistence
* Client-side AI API integration
* No production database
* No server-side rate limiting
* No comprehensive automated test suite
* AI-generated content is not independently fact-checked
* Large documents may require chunking for production use

---

# Future Improvements

## AI

* Retrieval-Augmented Generation
* Document chunking
* Embeddings
* Semantic search
* Source citations
* Question quality scoring
* Duplicate question detection
* Adaptive difficulty

## Assessment

* Adaptive quizzes
* Personalized learning paths
* Spaced repetition
* Topic-level analytics
* Historical performance tracking
* Difficulty calibration

## Backend

* Node.js API
* Authentication
* PostgreSQL
* Server-side Gemini integration
* Rate limiting
* Secure API key management

## Infrastructure

* Automated testing
* CI/CD
* Production logging
* Monitoring
* Error tracking
* Performance monitoring

---

# Engineering Principles

QuizGen follows these principles:

1. Separate UI from application logic.
2. Isolate external AI integrations.
3. Validate model-generated data.
4. Keep deterministic operations outside the LLM.
5. Never expose production secrets unnecessarily.
6. Use structured AI outputs wherever possible.
7. Keep generated educational content grounded in source material.
8. Design the application for incremental modularization.
9. Keep AI services replaceable.
10. Treat LLM output as untrusted external data.

---

# License

Add the appropriate license before publishing the repository.

For example:

```text
MIT License
```

---

# Author

Developed as an AI application demonstrating:

* Generative AI integration
* LLM application development
* Prompt engineering
* Structured AI outputs
* AI-assisted assessment
* PDF document processing
* Frontend engineering
* Software architecture
* AI safety and validation practices