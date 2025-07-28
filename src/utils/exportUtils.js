// Export utility functions for CSV and PDF generation

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data, filename) {
  // For PDF export, we'll create a simple HTML version and use the browser's print functionality
  // In a real application, you might want to use a library like jsPDF or PDFMake
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .export-date { color: #666; font-size: 12px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>${filename.charAt(0).toUpperCase() + filename.slice(1).replace(/-/g, ' ')} Report</h1>
      <div class="export-date">Generated on: ${new Date().toLocaleString()}</div>
  `;

  if (Array.isArray(data)) {
    // Table format for array data
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      htmlContent += `
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => `<td>${row[header] || 'N/A'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  } else {
    // Object format for single records or summaries
    htmlContent += `
      <div>
        ${Object.entries(data).map(([key, value]) => `
          <div style="margin-bottom: 10px;">
            <strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
            ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
          </div>
        `).join('')}
      </div>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 100);
  }, 500);
}