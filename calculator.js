let currentTheme = 'light';
let memory = {
    M1: null,
    M2: null,
    M3: null,
    M4: null
};
let history = [];
let graph = null;

// Theme handling
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    const themeBtn = document.querySelector('.theme-btn');
    themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('calculator-theme', currentTheme);
}

// Tab handling
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.add('hidden'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'graph' && !graph) {
        initGraph();
    }
}

// Display handling
function appendToDisplay(value) {
    const result = document.getElementById('result');
    const expression = document.getElementById('expression');
    
    if (value === 'pi') {
        value = 'π';
    }
    
    if (result.value === 'Error' || result.value === '0') {
        result.value = '';
    }
    
    result.value += value;
    expression.textContent = result.value;
    
    // Add button press animation
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'translateY(-2px)';
    }, 100);
}

function clearDisplay() {
    document.getElementById('result').value = '0';
    document.getElementById('expression').textContent = '';
}

function deleteLastChar() {
    const result = document.getElementById('result');
    const expression = document.getElementById('expression');
    
    if (result.value === 'Error') {
        clearDisplay();
        return;
    }
    
    result.value = result.value.slice(0, -1);
    if (result.value === '') {
        result.value = '0';
    }
    expression.textContent = result.value;
}

function calculate() {
    const result = document.getElementById('result');
    const expression = document.getElementById('expression');
    let calculation = result.value;
    
    try {
        // Replace π with actual value
        calculation = calculation.replace(/π/g, '3.14159265359');
        
        // Handle special cases
        if (calculation.includes('^')) {
            calculation = calculation.replace(/\^/g, '**');
        }
        
        // Evaluate the expression
        const answer = math.evaluate(calculation);
        
        // Format the result
        result.value = formatNumber(answer);
        expression.textContent = calculation + ' =';
        
        // Add to history
        addToHistory(calculation, answer);
        
    } catch (error) {
        result.value = 'Error';
        expression.textContent = '';
    }
}

function formatNumber(number) {
    if (typeof number !== 'number') return number;
    
    // Handle very large or small numbers
    if (Math.abs(number) > 1e10 || (Math.abs(number) < 1e-10 && number !== 0)) {
        return number.toExponential(6);
    }
    
    // Format regular numbers
    return number.toLocaleString('en-US', {
        maximumFractionDigits: 8,
        minimumFractionDigits: 0
    });
}

// Memory functions
function memoryStore(slot) {
    const result = document.getElementById('result');
    if (result.value === 'Error') return;
    
    const value = parseFloat(result.value.replace(/,/g, ''));
    memory[slot] = value;
    
    // Visual feedback
    const button = document.querySelector(`[onclick="memoryStore('${slot}')"]`);
    button.style.backgroundColor = 'var(--equals-bg)';
    setTimeout(() => {
        button.style.backgroundColor = '';
    }, 200);
}

function memoryRecall(slot) {
    if (memory[slot] !== null) {
        document.getElementById('result').value = formatNumber(memory[slot]);
        document.getElementById('expression').textContent = `M${slot.slice(1)} =`;
    }
}

function addToHistory(expression, result) {
    history.unshift({
        expression,
        result,
        timestamp: new Date()
    });
    
    // Keep only last 10 calculations
    if (history.length > 10) {
        history.pop();
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div>${item.expression} = ${formatNumber(item.result)}</div>
            <div class="history-time">${item.timestamp.toLocaleTimeString()}</div>
        </div>
    `).join('');
}

// Graph functions
function initGraph() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Create graph
    graph = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Function',
                borderColor: 'rgb(75, 192, 192)',
                data: [],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function plotFunction() {
    const input = document.getElementById('functionInput').value;
    if (!input) return;
    
    try {
        const points = [];
        for (let x = -10; x <= 10; x += 0.1) {
            const y = math.evaluate(input.replace(/x/g, x));
            if (isFinite(y)) {
                points.push({x, y});
            }
        }
        
        graph.data.datasets[0].data = points;
        graph.update();
        
    } catch (error) {
        alert('Invalid function');
    }
}

function clearGraph() {
    if (graph) {
        graph.data.datasets[0].data = [];
        graph.update();
    }
    document.getElementById('functionInput').value = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.setAttribute('data-theme', currentTheme);
        document.querySelector('.theme-btn').textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
    
    // Initialize display
    clearDisplay();
}); 