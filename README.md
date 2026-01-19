# Ledger & Reconciliation Take-Home Assignment

## 📌 Overview
Welcome! This exercise is designed to evaluate your ability to model a **ledger-based money movement system**, reason about **transaction correctness**, and demonstrate clean, testable backend engineering skills.  

You will implement a minimal backend service in **TypeScript/Node.js** backed by a relational database. The system should support **double-entry accounting**, **pending vs. settled transactions**, and **daily reconciliation reports** — including the ability to detect **out-of-order postings**.

---

## 🎯 Requirements

### Core Features
1. **Accounts & Balances**  
   - Support creating accounts that can hold funds.  
   - Accounts should be able to show a current balance derived from their activity.  
   - Every movement of money should be recorded in a way that allows balances to be verified and reconstructed later.  

2. **Transfers**  
   - Support transferring money between accounts.  
   - Transfers should be reliable and should not result in duplication or partial updates.  
   - Describe how your approach ensures correctness when transfers are retried or interrupted.  

3. **In-Flight vs. Finalized Transactions**  
   - Not all transfers will succeed or finalize immediately.  
   - Your design should make it possible to distinguish between money that is still “in flight” and money that is finalized.  
   - Provide a way to reflect these differences in account activity and balances.  

4. **Reconciliation & Reporting**  
   - Provide a mechanism to generate daily summaries of account activity and balances.  
   - The system should surface any discrepancies (e.g., mismatches, late-arriving events, or other anomalies).  
   - Reports should give enough clarity for someone to understand why balances are the way they are.  

---

## 🛠️ Technical Expectations
- **Language/Runtime:** TypeScript + Node.js  
- **Database:** Any relational DB (SQLite, Postgres, or MySQL)  
- **Testing:** Include automated tests for the areas you believe are most critical to demonstrate correctness and reliability. Use this as an opportunity to show what you consider important to validate in a system like this.
- No need for UI, Docker, or CI/CD. Focus on **correctness, clarity, and testability**.

---

## ✅ What We Will Evaluate
- How well your solution demonstrates an understanding of **backend system design** and the tradeoffs involved.  
- The **clarity and organization** of your code.  
- How you approach **correctness and reliability** in handling money movement, especially around avoiding duplication, preventing partial updates, and ensuring consistent balances.  
- The way you use **testing** to show confidence in your solution.  
- The quality of your **README explanation**, including design decisions, assumptions, and how you might extend the system.  

---

## 📖 Deliverables

- Create a new branch from `main` for your work (e.g., `feature/your-name-solution`).  
- Implement your solution in this branch (you may create new files, folders, or restructure as needed).
- When you are ready to submit, open a **Pull Request** from your branch into `main`.  
- In the PR description, include:  
  - A summary of your solution.  
  - Key design decisions and tradeoffs.  
  - Any assumptions you made.  
  - If relevant, what you would do next with more time.  

We will review your PR as if it were part of our normal code review process, looking both at your implementation and how you communicate your decisions.  

---

## 🕒 Time Expectations
- You have **48 hours** from receiving this prompt.  
- We expect ~2–4 hours of focused effort. Please don’t over-engineer — we value clarity over completeness.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Setup
**Note:** The provided project structure is a guideline to help you get started quickly. You are free to modify, restructure, or completely change the setup as needed, provided you use the core technologies: TypeScript, Node.js, and a relational database.
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npm run db:migrate
   ```

3. (Optional) Seed the database with example data:
   ```bash
   npm run db:seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:3001

5. Run tests:
   ```bash
   npm test
   ```

### Project Structure
```
src/
├── database/          # Database connection and migrations
├── models/           # Database models
├── services/         # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
tests/
├── unit/            # Unit tests
└── integration/     # Integration tests
```

### Development Approach
You are free to structure your project however you think best.  
If you’d like a loose starting point, you might consider:

1. Decide how to model accounts and transactions in your database.  
2. Implement basic money movement between accounts in a way that feels correct and reliable to you.  
3. Think about how to represent transactions that are still “in flight” versus finalized.  
4. Provide a way to generate daily views or reports of balances and activity, including how to handle events that arrive late or out of order.  
5. Tests in the areas you believe are most important to give confidence in your design.  
6. Error handling and logging.

---

## 💡 Notes
- If need be, feel free to stub/mock external integrations — no need for real bank APIs.  
- Document any assumptions you make.  
- If you run out of time, leave comments or TODOs describing what you would finish next.

---

## ✍️ Candidate’s Notes
*(This is where you add your explanation of design decisions, tradeoffs, and extensions. Please don’t skip this — it’s an important part of the evaluation.)*

---

Good luck, and thanks for taking the time to complete this exercise 🚀
