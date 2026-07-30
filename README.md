# Nirikshan (निरीक्षण)

[![License: MIT](https://img.shields.io/badge/License-MIT-2E2418)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-9C7A3C)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-2E2418)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-9C7A3C)](https://www.postgresql.org/)

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
* **Interactive Map of Nepal:** Explore constituency winners and view contact details for district Chief District Officers (CDOs). Note that this map reflects the real 2026 Nepal general election results (165 FPTP constituencies, sourced from the Election Commission of Nepal) rather than placeholder or mockup data.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React, Tailwind CSS, Leaflet/Mapbox |
| **Backend** | Node.js (Express) |
| **Database** | PostgreSQL with PostGIS extension (SQLite fallback for local/testing) |
| **Authentication** | JWT (JSON Web Tokens) with Anonymous Mode |
| **File Storage** | Local Disk Storage (with optional AWS S3 integration) |
| **Hosting** | Vercel (Frontend), Render (Backend) |

## Screenshots

### Promise Tracker Dashboard
![Promise Tracker Dashboard](client/public/screenshots/promise_tracker_dashboard.png)

### Interactive Map (Constituency & CDO Modes)
#### Constituency Winners Mode
![Constituency Winners Mode](client/public/screenshots/interactive_map_constituency.png)

#### District CDO Contact Mode
![District CDO Contact Mode](client/public/screenshots/interactive_map_cdo.png)

### Representative Report Card
![Representative Report Card](client/public/screenshots/representative_report_card.png)

### Budget Visualiser
![Budget Visualiser](client/public/screenshots/budget_visualiser.png)

### Complaint Heatmap
![Complaint Heatmap](client/public/screenshots/complaint_heatmap.png)

### RTI Assistant
![RTI Assistant](client/public/screenshots/rti_assistant.png)

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

### 3.5. Seed the Database (Optional)

To populate the local SQLite or PostgreSQL database with default provinces, districts, constituencies, representative winners (2026 ECN data), and demo promises:

```bash
# From the root directory
npm run seed
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

## Testing & Continuous Integration

### Local Testing
The backend API server includes an integration test suite to verify route behavior, database constraints, and user authentication scopes.

To run the tests locally:
```bash
cd server
npm test
```

### Test Coverage
The suite (`server/tests/routes.test.js`) runs on an in-memory SQLite database and covers:
* **Complaints API**: Anonymous submissions, validation of fields (such as coordinates, ward, and service type), and public feed visibility logic (ensuring pending complaints do not display).
* **Representatives API**: Verification of endpoint initialization, CRUD actions requiring administrator authorization, and client-side rating/review submissions.

### Continuous Integration
Continuous Integration is configured via GitHub Actions (`.github/workflows/ci.yml`). On every push or pull request to any branch, the workflow automatically:
1. Provisions an `ubuntu-latest` environment.
2. Spawns a matrix of Node.js environments (`18.x` and `20.x`).
3. Installs backend dependencies.
4. Executes the test suite to ensure no regressions are merged.

## Team

This platform was developed as a Team project by:

* **Ashmit** — Promise Tracker & System Architecture
* **Sujit** — Representative Report Cards
* **Samir** — Interactive Map (Constituency & CDO details)
* **Nischal** — Budget Visualiser & Complaint Heatmap
* **Pritam** — RTI Assistant & Civic Map

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact & Acknowledgements

* **Repository:** [https://github.com/devashmit/Nirikshan](https://github.com/devashmit/Nirikshan)
