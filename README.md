# 🦊 Firefox Job Uploader Extension

A lightweight Firefox browser extension that automates job posting by extracting job preview data and auto-filling posting forms. Designed for efficiency and minimal user interaction.

## ✨ Features

- ⚙️ **Auto-Population** – Automatically fills job posting forms using extracted job data.
- 🖱️ **One-Click Upload** – Speeds up publishing with minimal interaction.
- 🧠 **Configurable Logic** – Supports conditional workflows for different job types or platforms.
- 📦 **Data Persistence** – Locally caches extracted job info for reuse or audit.
- 🧪 **Dev-Friendly** – Modular architecture and detailed console logging for debugging and testing.

![Extension UI](https://d3d2prueitotgu.cloudfront.net/Screenshot%202025-05-12%20at%2009.00.30.png)
---

## 📦 Installation (Development Mode)

1. Open Firefox and go to `about:debugging`.
2. Click **"This Firefox"** in the sidebar.
3. Click **"Load Temporary Add-on"**.
4. Select the `manifest.json` file in the root of the project directory.

> ⚠️ This extension is not published on the Mozilla Add-ons store. Use the temporary load method for local development and testing.

---

## 🛠️ Development

### Prerequisites

- Firefox (latest)
- Node.js + npm/yarn (if using build tools or TypeScript compilation)
- TypeScript (optional, if you’re using `.ts` files)

### Clone & Setup

```bash
git clone https://github.com/your-username/job-extractor-extension.git
cd job-extractor-extension
npm install   # if using a bundler like Webpack or Vite
```

### 🔍 How It Works
	1.	The user visits a job preview page.
	2.	content.ts extracts job metadata from the page DOM.
	3.	Data is stored in browser storage (e.g. localStorage or storage.sync).
	4.	On the job board form, content.ts auto-fills fields using stored data.
	5.	A submit or “Go Live” action is optionally triggered via script.


### 🧪 Debugging
	•	Right-click the extension icon → Inspect
	•	Use the Console tab to view logs and error messages
	•	Reload the extension via about:debugging when changes are made


### 📄 License

MIT License — feel free to fork, modify, and enhance for your own team’s workflow.


### 📌 Roadmap
	•	Support multiple job boards
	•	Add job field mapping UI
	•	Store job logs externally (Google Sheets or Airtable)
	•	Publish to AMO (addons.mozilla.org)