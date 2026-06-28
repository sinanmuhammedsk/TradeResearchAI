# TradeResearch AI Deployment Guide

Follow these steps to push your project to GitHub and deploy it directly to Vercel.

---

## Step 1: Install Git on your Machine
Since background AI agents cannot approve Windows administrator (UAC) prompts, you should run the install command in your standard terminal:

1. Open a new **Command Prompt** or **PowerShell** window.
2. Run:
   ```cmd
   winget install --id Git.Git -e --source winget
   ```
3. A Windows UAC prompt will appear asking for administrator permission. Click **Yes** to approve and complete the installation.
4. Restart your editor (VS Code) or terminal window to reload your system PATH environment variables.

---

## Step 2: Push the Code to GitHub
Once Git is installed, navigate to your project directory (`c:\Users\ASUS\resarch app`) and run these commands to push the codebase to your GitHub repository:

1. Initialize the git workspace:
   ```bash
   git init
   ```
2. Add your GitHub remote origin:
   ```bash
   git remote add origin https://github.com/sinanmuhammedsk/TradeResearchAI.git
   ```
3. Set the default branch name to `main`:
   ```bash
   git branch -M main
   ```
4. Stage all changes (your `.gitignore` is pre-configured to safely ignore `.env.local` and `.next` build files):
   ```bash
   git add .
   ```
5. Commit the files:
   ```bash
   git commit -m "Initialize TradeResearch AI dashboard with premium gold-black theme"
   ```
6. Push the code to GitHub:
   ```bash
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/) and log in (e.g. using your GitHub account).
2. Click **Add New** → **Project**.
3. Import the `TradeResearchAI` repository.
4. **Environment Variables Config** (Critical):
   * Scroll down to the **Environment Variables** section.
   * Add a new key: `GEMINI_API_KEY`
   * Value: `<YOUR_GEMINI_API_KEY>` (copy this key from your local `.env.local` file).
5. Click **Deploy**.
6. Vercel will compile and host your AI investment scanner in under 2 minutes!
