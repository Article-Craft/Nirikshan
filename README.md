# Nirikshan (निरीक्षण)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)

> **Track. Understand. Act.**

---

## Overview

Nirikshan (निरीक्षण) is a citizen-centric government watchdog platform designed to promote transparency, accountability, and civic engagement in Nepal. The application bridges the information gap between public offices and citizens by providing accessible tools to monitor public works, track progress, and report local grievances. This platform was built as a final year academic project by a 5-member team.

## Key Features

* **Promise Tracker:** Track and view the status of political and government promises.
* **Budget vs Progress:** Compare local and federal budget allocations with actual physical project completion.
* **Grievance Heatmap:** Report municipal and public service issues anonymously on a visual heatmap.
* **Representative Report Cards:** Review profiles, contact information, and performance ratings of elected officials.
* **RTI Request Generator:** Generate formatted Right to Information (RTI) application templates.
* **Interactive Map of Nepal:** Explore constituency winners and view contact details for district Chief District Officers (CDOs).

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React, Tailwind CSS, Leaflet/Mapbox |
| **Backend** | Node.js (Express) or Django |
| **Database** | PostgreSQL with PostGIS extension |
| **Authentication** | JWT (JSON Web Tokens) with Anonymous Mode |
| **File Storage** | AWS S3 or Firebase Storage |
| **Hosting** | Vercel (Frontend), Render (Backend) |

## Screenshots

*Placeholders for application interface screenshots:*

```
[ Dashboard Mockup / Landing Page ]
[ Interactive Constituency Map ]
[ Grievance Heatmap UI ]
```

## Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL with PostGIS extension installed

### 1. Clone the Repository

```bash
git clone https://github.com/devashmit/Nirikshan.git
cd Nirikshan
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Backend Setup

```bash
cd ../server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/nirikshan
JWT_SECRET=your_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 4. Run Development Servers

Start the backend:
```bash
# Inside server directory
npm run dev
```

Start the frontend:
```bash
# Inside client directory
npm run start
```

## Project Structure

```text
Nirikshan/
├── client/                 # Frontend React application
│   ├── public/             # Static public assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page views (Map, Dashboard, RTI)
│       └── utils/          # Map rendering and helper utilities
├── server/                 # Backend API server
│   ├── config/             # Database and security configurations
│   ├── controllers/        # Request handlers
│   ├── models/             # Sequelize/PostgreSQL schema definitions
│   └── routes/             # API endpoint definitions
└── README.md
```

## Usage Guide

1. **Constituency Maps:** Open the main dashboard to view the map of Nepal. Click on any district or constituency to inspect the elected representative and CDO contact details.
2. **Grievance Heatmap:** Navigate to the reports page to submit a complaint. You can select a category, upload photo evidence, drop a pin on the map, and choose to submit anonymously.
3. **RTI Generator:** Go to the RTI section, fill in the step-by-step form detailing your query, and download the generated PDF in the official Nepali format.

## Contributing

We welcome contributions to Nirikshan. Please follow these guidelines:

1. **Branch Naming:** Use descriptive branch prefixes.
   * Features: `feature/feature-name`
   * Bug fixes: `bugfix/bug-name`
2. **Pull Requests:**
   * Create a pull request to the main branch.
   * Provide a clear description of the changes made and reference any related issues.
   * Ensure code builds locally before submitting.

## Team

This platform was developed as a final-year academic project by:

* Ashmit
* Sujit
* Samir
* Nischal
* Pritam

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact & Acknowledgements

* **Repository:** [https://github.com/devashmit/Nirikshan](https://github.com/devashmit/Nirikshan)
* Special thanks to our academic supervisors and mentors for their guidance during the development of this project.
