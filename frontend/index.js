import * as parquet from 'https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm.js';

// Global state
let parquetData = null;
let currentPage = 0;
let rowsPerPage = 100;
let totalRows = 0;

// DOM elements
const loadBtn = document.getElementById('loadBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const totalRowsSpan = document.getElementById('totalRows');
const totalColumnsSpan = document.getElementById('totalColumns');
const fileSizeSpan = document.getElementById('fileSize');
const rowsPerPageInput = document.getElementById('rowsPerPage');
const paginationInfo = document.getElementById('paginationInfo');
const firstBtn = document.getElementById('firstBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const lastBtn = document.getElementById('lastBtn');

// Initialize parquet-wasm
await parquet.default();

// Event listeners
loadBtn.addEventListener('click', loadParquetFile);
rowsPerPageInput.addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 0;
    renderTable();
});

firstBtn.addEventListener('click', () => {
    currentPage = 0;
    renderTable();
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderTable();
    }
});

nextBtn.addEventListener('click', () => {
    if ((currentPage + 1) * rowsPerPage < totalRows) {
        currentPage++;
        renderTable();
    }
});

lastBtn.addEventListener('click', () => {
    currentPage = Math.floor((totalRows - 1) / rowsPerPage);
    renderTable();
});

// Load parquet file
async function loadParquetFile() {
    try {
        showLoading(true);
        hideError();

        // Fetch the parquet file
        const response = await fetch('public/data/sample_data.parquet');

        if (!response.ok) {
            throw new Error(`Failed to fetch parquet file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Parse parquet file
        parquetData = parquet.readParquet(uint8Array);

        // Get metadata
        totalRows = parquetData.numRows;
        const columns = parquetData.schema.fields.map(field => field.name);

        // Update stats
        totalRowsSpan.textContent = totalRows.toLocaleString();
        totalColumnsSpan.textContent = columns.length;
        fileSizeSpan.textContent = formatFileSize(arrayBuffer.byteLength);

        // Reset pagination
        currentPage = 0;

        // Render table
        renderTable();

        loadBtn.textContent = 'Reload Data';
        showLoading(false);

    } catch (error) {
        console.error('Error loading parquet file:', error);
        showError(error.message);
        showLoading(false);
    }
}

// Render table with current page
function renderTable() {
    if (!parquetData) return;

    const columns = parquetData.schema.fields.map(field => field.name);

    // Render table header
    tableHead.innerHTML = '';
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Calculate pagination
    const startIdx = currentPage * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);

    // Render table body
    tableBody.innerHTML = '';

    for (let i = startIdx; i < endIdx; i++) {
        const row = document.createElement('tr');

        columns.forEach(column => {
            const td = document.createElement('td');
            const columnData = parquetData.getColumn(column);
            const value = columnData.get(i);

            // Format value
            if (value === null || value === undefined) {
                td.textContent = '-';
            } else if (typeof value === 'number') {
                td.textContent = value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            } else {
                td.textContent = value;
            }

            row.appendChild(td);
        });

        tableBody.appendChild(row);
    }

    // Update pagination info
    updatePaginationInfo(startIdx, endIdx);
    updatePaginationButtons();
}

// Update pagination info text
function updatePaginationInfo(startIdx, endIdx) {
    paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${totalRows.toLocaleString()} rows`;
}

// Update pagination button states
function updatePaginationButtons() {
    firstBtn.disabled = currentPage === 0;
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = (currentPage + 1) * rowsPerPage >= totalRows;
    lastBtn.disabled = (currentPage + 1) * rowsPerPage >= totalRows;
}

// Utility functions
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Auto-load data on page load
window.addEventListener('load', () => {
    loadParquetFile();
});
