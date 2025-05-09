// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function toggleTheme() {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', toggleTheme);

// Sample data generation
function generateSampleData() {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
            date: date.toISOString().split('T')[0],
            users: Math.floor(Math.random() * 1000) + 500,
            revenue: Math.floor(Math.random() * 5000) + 1000,
            sessions: Math.floor(Math.random() * 2000) + 800,
            conversion: (Math.random() * 5 + 1).toFixed(1)
        });
    }
    
    return data;
}

// Initialize charts
function initializeCharts(data) {
    // User Growth Chart
    new Chart(document.getElementById('userGrowthChart'), {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Users',
                data: data.map(d => d.users),
                borderColor: '#2563eb',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Revenue Distribution Chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Revenue',
                data: data.map(d => d.revenue),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Traffic Sources Chart
    new Chart(document.getElementById('trafficChart'), {
        type: 'doughnut',
        data: {
            labels: ['Direct', 'Organic', 'Referral', 'Social'],
            datasets: [{
                data: [30, 40, 15, 15],
                backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // User Engagement Chart
    new Chart(document.getElementById('engagementChart'), {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Sessions',
                data: data.map(d => d.sessions),
                borderColor: '#22c55e',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update metrics
function updateMetrics(data) {
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    document.getElementById('total-users').textContent = latest.users.toLocaleString();
    document.getElementById('revenue').textContent = `$${latest.revenue.toLocaleString()}`;
    document.getElementById('active-sessions').textContent = latest.sessions.toLocaleString();
    document.getElementById('conversion-rate').textContent = `${latest.conversion}%`;
}

// Populate table
function populateTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.users.toLocaleString()}</td>
            <td>$${row.revenue.toLocaleString()}</td>
            <td>${row.sessions.toLocaleString()}</td>
            <td>${row.conversion}%</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Search and filter functionality
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');

function filterTable(data) {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    const filteredData = data.filter(row => {
        const matchesSearch = Object.values(row).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        );
        
        if (filterValue === 'all') return matchesSearch;
        
        const value = row[filterValue];
        return matchesSearch && value !== undefined;
    });

    populateTable(filteredData);
}

searchInput.addEventListener('input', () => filterTable(sampleData));
filterSelect.addEventListener('change', () => filterTable(sampleData));

// Export functionality
document.getElementById('export-btn').addEventListener('click', () => {
    const csvContent = [
        ['Date', 'Users', 'Revenue', 'Sessions', 'Conversion'],
        ...sampleData.map(row => [
            row.date,
            row.users,
            row.revenue,
            row.sessions,
            row.conversion
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics-data.csv';
    link.click();
});

// Initialize dashboard
const sampleData = generateSampleData();
initializeCharts(sampleData);
updateMetrics(sampleData);
populateTable(sampleData);

// Simulate real-time updates
setInterval(() => {
    const newData = generateSampleData();
    initializeCharts(newData);
    updateMetrics(newData);
    populateTable(newData);
}, 30000); // Update every 30 seconds
