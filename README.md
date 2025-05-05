# Patient Registration System

A frontend-only patient registration application using React and client-side data storage. This application provides patient management capabilities with cross-tab synchronization, allowing multiple browser tabs to work with the same data.

## Features

 Patient registration with form validation
 Patient data viewing and filtering
 SQL query execution against patient data
 Persistent data storage using localStorage
 Cross-tab synchronization for real-time data updates
 Data export functionality

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI, Material UI
- **Form Handling:** react-hook-form with zod validation
- **Data Storage:** localStorage with broadcast-channel for cross-tab syncing
- **Development:** Vite, Node.js

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd patient-registration-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage Guide

### Patient Registration

1. Navigate to the "Registration" tab
2. Fill out the patient information form with required fields (First Name, Last Name, Date of Birth, Phone)
3. Add any allergies if applicable
4. Click "Register Patient" to save the information
5. Recently registered patients will appear in the table below

### Viewing Patient Data

1. Click on the "Data" tab to see all registered patients
2. Use the search box to filter patients by name, email, or phone
3. Click on column headers to sort the data
4. Use the "Filter" button to apply more advanced filters
5. Click the "Export" button to download patient data as a CSV file

### Patient Actions

For each patient in the table, you can:
- View detailed information by clicking the eye icon
- Edit patient information by clicking the pencil icon
- Delete a patient by clicking the trash icon

### SQL Query Builder

1. Navigate to the "Query" tab
2. Type or select a SQL query to run against patient data
3. Click "Run Query" to execute
4. Results will display in a table below
5. You can save frequently used queries for later use
6. Export query results as a CSV file

### Common SQL Queries

The system supports various SQL operations including:

- Selecting all patients:
  ```sql
  SELECT * FROM patients ORDER BY last_name ASC;
  ```

- Filtering by date of birth:
  ```sql
  SELECT * FROM patients 
  WHERE date_of_birth < '2000-01-01' 
  ORDER BY last_name ASC;
  ```

- Getting registration statistics:
  ```sql
  SELECT 
    COUNT(*) as total_patients,
    MIN(registration_date) as first_registration,
    MAX(registration_date) as last_registration
  FROM patients;
  ```

## Data Persistence

All data is stored in your browser's localStorage. This means:

- Data persists across browser sessions
- Data is isolated to your browser (not shared with other users)
- Clearing browser data will erase all patient records
- Data is synchronized across tabs using the broadcast-channel API

## Development Notes

- The application uses a simulated SQL query engine for the SQL Query Builder
- This is a frontend-only application with no backend database requirements
- Cross-tab synchronization is implemented using the broadcast-channel package

## Project Structure

```
.
├── client/                  # Client-side code
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # UI components from shadcn
│   │   │   ├── header.tsx   # Application header component
│   │   │   ├── integrations.tsx # Integrations tab component
│   │   │   ├── patient-form.tsx # Patient registration form
│   │   │   ├── patient-table.tsx # Patient data table view
│   │   │   ├── query-builder.tsx # SQL query builder component
│   │   │   └── tab-navigation.tsx # Tab navigation component
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-mobile.tsx # Hook for mobile detection
│   │   │   └── use-toast.ts # Toast notification hook
│   │   ├── lib/             # Utility libraries
│   │   │   ├── localStorageDb.ts # localStorage database implementation
│   │   │   ├── pglite.ts    # PGlite integration (fallback)
│   │   │   ├── pgliteUtils.ts # PGlite utility functions (fallback)
│   │   │   ├── queryClient.ts # Query client configuration
│   │   │   └── utils.ts     # General utility functions
│   │   ├── pages/           # Page components
│   │   │   ├── home.tsx     # Main page component
│   │   │   └── not-found.tsx # 404 page component
│   │   ├── App.tsx          # Main application component
│   │   ├── index.css        # Global CSS
│   │   └── main.tsx         # Application entry point
│   └── index.html           # HTML template
├── db/                      # Database configuration
├── server/                  # Server configuration
├── shared/                  # Shared code between client and server
│   └── schema.ts            # Data schema definitions
├── components.json          # shadcn components configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

### Key Files and Their Purpose

#### Database Implementation

- `client/src/lib/localStorageDb.ts`: Provides a complete implementation of the database operations using browser's localStorage, including operations for patients, allergies, and saved queries.

#### User Interface

- `client/src/components/patient-form.tsx`: Handles patient registration and editing with form validation.
- `client/src/components/patient-table.tsx`: Displays patient data in a sortable, filterable table.
- `client/src/components/query-builder.tsx`: Provides an interface for writing and executing SQL queries against the patient data.
- `client/src/components/tab-navigation.tsx`: Manages the navigation between different sections of the application.

#### Data Schema

- `shared/schema.ts`: Defines the data structures for patients, allergies, and saved queries using Drizzle ORM and Zod validation.

## License

[Add appropriate license information here]