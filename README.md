# 🌌 TaskVerse 2.0 — Enterprise SaaS Task Management Hub

TaskVerse 2.0 is a premium, high-fidelity, production-ready enterprise SaaS task management application designed for modern agile squads. It features a complete server-proxied architecture with beautiful dark-mode first design guidelines inspired by Linear, Notion, and Stripe.

---

## 🚀 Key Modules & Capabilities

### 1. 📊 Interactive Workspace Dashboard (Landing Page)
An intelligence-augmented dashboard that serves as the central cockpit of your operations right after login:
*   **KPI Scorecards:** Interactive cards displaying *Total Scope*, *Completed Goals*, *Active In-Progress tasks*, and *Overdue alerts* featuring live-rendered mini-sparklines.
*   **Velocity & Scope Distribution:** Rich analytics widgets built using `recharts` mapping completion rates, weekly task trends, and project load shares.
*   **Personal Focus Meter:** Interactive widgets reporting user focus coefficients, streaks, daily goals progress, and estimated effort remaining.
*   **Dynamic Local AI Insights:** Non-blocking client-computed recommendations flagging high-priority blockers, celebrating completed goals, and reporting project velocity.
*   **Quick Actions Console:** Hotkeys to rapidly dispatch tasks, establish new projects, invite collaborators, and instantly switch views.
*   **Data Portability (CSV):** Seamless options to export active project data to CSV spreadsheets and parse incoming scope lists.

### 2. 🎚️ Advanced Multi-Role Authentication
A polished security portal separating corporate permissions elegantly:
*   **Sign-In Panel:** Dedicated sections for **Administrator Credentials** (e.g., password `admin123`) and **Employee Account** selection (e.g., password `user123`).
*   **Sign-Up Form:** Form validation to register new employees or admins on the fly.
*   **Instant Shortcuts:** High-contrast hotkey bypass buttons for rapid admin and employee profile emulation during reviews or pitches.
*   **Secure Session Termination:** A custom, animated **Logout Page** with dynamic time-delays that safely tears down active client sessions and returns to the gatekeeper portal.

### 3. 📋 Elite Kanban Workspace
A drag-and-drop workflow tracker that integrates directly with custom projects and folder sub-structures. Fully featured with task creation, priorities (High, Medium, Low), task details editing, status tracking, and inline descriptions.

### 4. 📅 Integrated Calendar Matrix
A high-contrast visual timeline mapping upcoming milestones, deadlines, and project releases over the current week or month.

### 5. 🔔 Live Activity Feed & Audit Trail
A persistent audit trail displaying recent actions, workspace assignments, comment signals, and status upgrades in real-time.

---

## 🛠️ Technical Stack

*   **Frontend:** React 18, Vite, TypeScript
*   **Styling:** Tailwind CSS (Modern `@import "tailwindcss";` custom theme layout)
*   **Charts & Visuals:** Recharts (Area charts, Pie charts, and sparklines)
*   **Animations:** Framer Motion (Page transitions, card entries, micro-interactions)
*   **Icons:** Lucide React
*   **Backend Support:** Node.js, Express, CJS compilation

---

## 💾 Local Setup & Installation

Follow these steps to run TaskVerse 2.0 locally on your computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### 1. Extract and Install Dependencies
In your terminal, navigate to the project directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` and fill in any required variables:
```bash
cp .env.example .env
```

### 3. Launch Development Server
Launch the full-stack development workspace:
```bash
npm run dev
```
The application will automatically bind and run locally. Open your browser to the port shown in your terminal.

### 4. Build for Production
To bundle static assets and build the compiled server-side build pipeline:
```bash
npm run build
npm start
```

---

## 🐙 How to Upload this Project to GitHub

Follow these simple steps to host this project on your personal GitHub profile to share with recruiters or peers:

### Option A: The Git Terminal Route

1. **Create a New Repository on GitHub:**
   Go to [github.com/new](https://github.com/new). Name your repository (e.g., `taskverse-2.0`) and leave it public. Do **not** check the boxes for adding a README, `.gitignore`, or License (as they are already provided in this workspace!).

2. **Initialize Git Locally:**
   Open your terminal in this workspace folder and run:
   ```bash
   # Initialize Git
   git init

   # Stage all workspace files
   git add .

   # Create your initial production commit
   git commit -m "feat: complete TaskVerse 2.0 application with high-fidelity SaaS dashboard and secure auth flow"
   ```

3. **Link to GitHub and Push:**
   Copy the remote repository URL from your GitHub setup screen and run:
   ```bash
   # Rename default branch to main
   git branch -M main

   # Add remote link (replace with your actual GitHub URL)
   git remote add origin https://github.com/YOUR_USERNAME/taskverse-2.0.git

   # Push to main
   git push -u origin main
   ```

### Option B: The Export & Drag-and-Drop Route (No Terminal)

1. **Export Code from AI Studio:**
   * Open the **Settings** menu inside the Google AI Studio project interface.
   * Click **Export Workspace as ZIP** to download the entire codebase to your machine.
   * Unzip the archive on your local computer.

2. **Upload directly on GitHub Web:**
   * Go to [github.com/new](https://github.com/new) and create your repository.
   * Click the **"uploading an existing file"** link in the setup instructions banner.
   * Drag-and-drop the unzipped project folder contents directly into the browser.
   * Commit the changes to the `main` branch.

---

## 🔒 Security & Roles Cheat Sheet (Demo Accounts)

Use these credentials to instantly explore and showcase user permission hierarchies:

*   **Administrator Role:**
    *   **Username:** `Aarav Gogia`
    *   **Password:** `admin123`
*   **Employee/User Role:**
    *   **Account:** Select any profile (e.g., `Jane Doe`)
    *   **Password:** `user123`
