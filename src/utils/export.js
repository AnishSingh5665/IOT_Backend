exports.exportToCSV = async (data) => {
    try {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No data to export');
        }

        // Get headers from the first data item
        const headers = Object.keys(data[0]);
        
        // Create CSV header
        let csv = headers.join(',') + '\n';
        
        // Add data rows
        data.forEach(item => {
            const row = headers.map(header => {
                const value = item[header];
                // Handle special cases (dates, arrays, etc.)
                if (value instanceof Date) {
                    return value.toISOString();
                } else if (Array.isArray(value)) {
                    return JSON.stringify(value);
                }
                return value;
            });
            csv += row.join(',') + '\n';
        });

        return csv;
    } catch (error) {
        console.error('Export to CSV error:', error);
        throw new Error('Error converting data to CSV format');
    }
}; 