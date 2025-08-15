# Leads Sync

A simple React app for uploading CSV files containing lead data and importing valid contacts to HubSpot CRM.

## Features

- Upload CSV files containing leads.
- Validates each record for a valid email or phone number.
- Displays the number of valid records.
- Imports valid records to HubSpot via a backend API.
- Shows success or error messages after import.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd leads-sync
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the App

Start the development server:

```sh
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Building for Production

```sh
npm run build
```

## Usage

1. Click the file upload area or drag and drop a CSV file.
2. Ensure your CSV has columns for `email` and/or `phone`.
3. The app will validate records and show how many are valid.
4. Click **Import to Hubspot** to send valid records to the backend.

## CSV Format

- The first row should contain headers (e.g., `firstname, lastname,email,phone,...`).
- Each subsequent row should represent a lead.

## Environment Variables

You can use a `.env` file for configuration.
