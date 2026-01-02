# Parquet Table Viewer

A lightweight web application for viewing and browsing Parquet files directly in the browser using Apache Arrow and parquet-wasm.

## Overview

This application loads Parquet files and displays them in a paginated table format with statistics. It uses WebAssembly to parse Parquet files entirely client-side, with no backend required.

## How It Works

### Architecture

The application consists of three main files:

- [index.html](index.html) - Main HTML structure with UI elements
- [index.js](index.js) - Core JavaScript logic for loading and rendering Parquet data
- [style.css](style.css) - Styling for the table viewer interface

### Key Dependencies

The script uses ES modules loaded from CDNs:

- **parquet-wasm** (v0.7.1) - WebAssembly-based Parquet parser that reads Parquet files and outputs Apache Arrow IPC streams
- **apache-arrow** (v21.1.0) - JavaScript library for working with Arrow data structures

### Data Flow

1. **Load Parquet File** ([index.js:62](index.js#L62))
   - Fetches the Parquet file from `public/data/sample_data.parquet`
   - Converts the response to an ArrayBuffer

2. **Parse with parquet-wasm** ([index.js:78](index.js#L78))
   - Reads the Parquet file using `parquet.readParquet()`
   - Converts to Arrow IPC stream format

3. **Convert to Arrow Table** ([index.js:82](index.js#L82))
   - Uses `tableFromIPC()` from apache-arrow to create an Arrow table
   - Extracts schema (column names and types) and row count

4. **Store and Render** ([index.js:93](index.js#L93))
   - Stores the Arrow table in global state
   - Updates statistics (row count, column count, file size)
   - Renders the current page of data

### Pagination

The viewer implements client-side pagination to handle large datasets efficiently:

- Default page size: 100 rows (configurable via input)
- Uses Arrow's `getChildAt()` and `get()` methods to access specific cells ([index.js:151](index.js#L151))
- Pagination controls: First, Previous, Next, Last

### Data Rendering

The `renderTable()` function ([index.js:124](index.js#L124)) handles displaying data:

- Creates table headers from Arrow schema fields
- Iterates through the current page's row range
- Accesses each cell using Arrow's columnar API
- Formats values (numbers with locale formatting, null handling)

## Running in Development

### Prerequisites

- A local web server (required due to ES modules and CORS restrictions)
- Modern web browser with WebAssembly support

### Option 1: npx serve (Recommended)

```bash
cd frontend
npx serve
```

Then open http://localhost:3000 in your browser (port shown in terminal output).

### Option 2: Python HTTP Server

```bash
cd frontend
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click [index.html](index.html)
3. Select "Open with Live Server"

### Option 4: Any static file server

Any static file server will work as long as it:
- Serves files with correct MIME types
- Supports CORS (or runs on localhost)
- Allows ES module loading

## Project Structure

```
frontend/
├── index.html              # Main HTML page
├── index.js                # JavaScript application logic
├── style.css               # Styling
├── public/
│   └── data/
│       └── sample_data.parquet  # Sample Parquet file
└── README.md              # This file
```

## Features

- Load and parse Parquet files in the browser
- Display file statistics (rows, columns, file size)
- Paginated table view with configurable page size
- Responsive design with hover effects
- Automatic number formatting
- Error handling and loading states

## Browser Compatibility

Requires a modern browser with support for:
- ES6 modules
- WebAssembly
- Async/await
- Fetch API

Tested on latest versions of Chrome, Firefox, Safari, and Edge.

## Troubleshooting

### "Failed to fetch parquet file" Error

- Ensure you're running a local web server (not opening the HTML file directly)
- Verify the parquet file exists at `public/data/sample_data.parquet`

### CORS Errors

- Run the app through a local server on localhost
- Browsers block ES modules when opening files directly via `file://` protocol

### Blank Table

- Check browser console for errors
- Verify the parquet file is valid and contains data
- Ensure parquet-wasm and apache-arrow libraries are loading correctly
