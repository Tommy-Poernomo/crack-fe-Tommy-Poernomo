[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/PzCCy7VV)

# 🎨 DKV LMS - Frontend Client Application

The client-side interface for the Digital Visual Communication (DKV) and Photography Learning Management System. Built using Next.js, this application deliver state-driven dashboards tailored for Admin, Teacher, and Student user structures.

---

## 🔗 Live Deployment & Demo Links
* **Frontend Deployment:** [Live DKV LMS Portal](https://crack-fe-tommy-poernomo.vercel.app/)
* **Visual Screenshots & Asset Directory:** Located inside the `./assets/` directory

---

## 📝 Project Description

**DKV LMS Frontend** provides a responsive and intuitive user interface designed for vocational school environments. By utilizing static and dynamic rendering states, the client handles user tracking and creative module references smoothly.

The interface incorporates strict **Role-Based Access Control (RBAC)** across three explicit portals:
* **Admin Dashboard:** Managing active lecturer registries through a clean data table with comprehensive update triggers.
* **Teacher Workspace:** Providing complete autonomy over material uploading and assignment management using a clean dual-tab system interface.
* **Student Portal:** Allowing streamlined course exploration, immediate enrollment hooks, and status badge monitoring.

---

## 🚀 Key Client Features

* **Universal Profile Engine:** Single-portal layout configuration enabling users to modify credentials with instant client-side Navbar layout synchronization without triggering forced relog routines.
* **Deterministic Course Lists:** Memory-based client sorting (`.sort((a,b) => a.id - b.id)`) preventing component layout shift bugs when course chapters or tasks undergo inline modifications.
* **Interactive Loading Hooks:** Programmatic UI guarding using state indicators (`isSubmitting`, `isUpdating`) to prevent accidental duplicate submission inputs.
* **Hydration Protection Guard:** Equipped with strict layout boundary overrides (`suppressHydrationWarning`) to neutralize unexpected body attribute insertion conflicts caused by browser extension helpers.

---

## 🛠️ Tech Stack Used

* **Core Framework:** Next.js 16 (App Router Architecture)
* **Styling Utility:** Tailwind CSS
* **HTTP Client Broker:** Axios Client Instance featuring centralized header interceptors for JWT automated injections

---

## 📁 Frontend Project Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/      # Teacher profile CRUD workspace
│   │   ├── student/    # Course tracking catalog and progress monitors
│   │   ├── teacher/    # Content workspace (Materials & Inline Assignments)
│   │   ├── profile/    # Unified account profile configuration page
│   │   └── layout.tsx  # Universal dashboard shell with instant name synchronization
│   ├── login/          # Identity access form
│   ├── register/       # Identity setup form
│   └── page.tsx        # Public core catalog entrance
├── components/         # Shared presentation elements
├── lib/
│   └── axios.ts        # Modularized Axios base configuration instance
└── hooks/              # Stateful functional extractions
```


## 💻 Installation and Usage Instructions
1. Prerequisites

-    Node.js (v18 or higher)

-    NPM package manager

2. Steps to Run Locally
a.   Navigate into the frontend repository root directory:
```bash
      cd lms-dkv-fe
```
b.  Install all required packages:
```bash
      npm install
```
c. Establish a local environment configuration file named `.env.local` inside the root folder:
```
      NEXT_PUBLIC_API_URL="http://localhost:3000"
```
d. Fire up the Turbopack build engine:
```bash
      npm run dev
```
e. Launch your browser and explore the running module at `http://localhost:3001.`

---
## 📷 Screenshots & Visual Demo

### Public Landing Page
![Landing Page](./lms-dkv-fe/assets/Public%20Landing%20Page.jpg)

### Login page
![Login Page Layout](./lms-dkv-fe/assets/Login%20Page%20Rev1.jpg)

### Admin Panel & Teacher Register
![Admin CRUD](./lms-dkv-fe/assets/Dashboard%20-%20Admin%20&%20Register%20Page%20-%20Teacher%20Rev1.jpg)

### Teacher Course Dashboard
![Teacher Dashboard](./lms-dkv-fe/assets/Dashboard%20Teacher.jpg)

### Student Learning Tracking (Dashboard)
![Student Dashboard](./lms-dkv-fe/assets/Dashboard%20Student.jpg)

---
## 👩‍💻 Author

Created by Tommy Poernomo (2026) ✨

---

## 📄 License

This architecture is built for professional portfolio validation records. All rights reserved.
