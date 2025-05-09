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
    
    // Update memory value display
    const valueDisplay = document.getElementById(`${slot}-value`);
    valueDisplay.textContent = formatNumber(value);
    
    // Visual feedback
    const button = document.querySelector(`[onclick="memoryStore('${slot}')"]`);
    button.style.backgroundColor = 'var(--equals-bg)';
    setTimeout(() => {
        button.style.backgroundColor = '';
    }, 200);
}

function memoryRecall(slot) {
    if (memory[slot] !== null) {
        const result = document.getElementById('result');
        result.value = formatNumber(memory[slot]);
        document.getElementById('expression').textContent = result.value;
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

// Converter definitions
const converterUnits = {
    currency: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 151.62,
        AUD: 1.52,
        CAD: 1.35,
        CHF: 0.90,
        CNY: 7.23,
        INR: 83.12
    },
    length: {
        'm': 1,
        'km': 0.001,
        'cm': 100,
        'mm': 1000,
        'in': 39.37,
        'ft': 3.28,
        'yd': 1.09,
        'mi': 0.00062
    },
    weight: {
        'kg': 1,
        'g': 1000,
        'mg': 1000000,
        'lb': 2.20462,
        'oz': 35.274,
        'ton': 0.001
    },
    area: {
        'm²': 1,
        'km²': 0.000001,
        'cm²': 10000,
        'mm²': 1000000,
        'in²': 1550,
        'ft²': 10.7639,
        'yd²': 1.19599,
        'ac': 0.000247
    },
    volume: {
        'L': 1,
        'mL': 1000,
        'm³': 0.001,
        'cm³': 1000,
        'gal': 0.264172,
        'qt': 1.05669,
        'pt': 2.11338,
        'fl oz': 33.814
    },
    temperature: {
        'C': 'C',
        'F': 'F',
        'K': 'K'
    },
    energy: {
        'J': 1,
        'kJ': 0.001,
        'cal': 0.239006,
        'kcal': 0.000239,
        'kWh': 0.000000277778,
        'Wh': 0.000277778
    },
    force: {
        'N': 1,
        'kN': 0.001,
        'lbf': 0.224809,
        'kgf': 0.101972
    }
};

function updateConverterOptions() {
    const type = document.getElementById('converterType').value;
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    
    // Clear existing options
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    // Add new options
    Object.keys(converterUnits[type]).forEach(unit => {
        fromUnit.add(new Option(unit, unit));
        toUnit.add(new Option(unit, unit));
    });
    
    // Set default "to" unit to something different
    if (toUnit.options.length > 1) {
        toUnit.selectedIndex = 1;
    }
    
    // Clear values
    document.getElementById('converterValue').value = '';
    document.getElementById('convertedValue').value = '';
}

function convert() {
    const type = document.getElementById('converterType').value;
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    const value = parseFloat(document.getElementById('converterValue').value);
    
    if (isNaN(value)) {
        document.getElementById('convertedValue').value = '';
        return;
    }
    
    let result;
    
    if (type === 'temperature') {
        // Special handling for temperature
        result = convertTemperature(value, fromUnit, toUnit);
    } else {
        // Convert through base unit
        const baseValue = value / converterUnits[type][fromUnit];
        result = baseValue * converterUnits[type][toUnit];
    }
    
    document.getElementById('convertedValue').value = formatNumber(result);
}

function convertTemperature(value, fromUnit, toUnit) {
    let celsius;
    
    // Convert to Celsius first
    switch (fromUnit) {
        case 'C':
            celsius = value;
            break;
        case 'F':
            celsius = (value - 32) * 5/9;
            break;
        case 'K':
            celsius = value - 273.15;
            break;
    }
    
    // Convert from Celsius to target unit
    switch (toUnit) {
        case 'C':
            return celsius;
        case 'F':
            return (celsius * 9/5) + 32;
        case 'K':
            return celsius + 273.15;
    }
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
    
    // Initialize memory displays
    ['M1', 'M2', 'M3', 'M4'].forEach(slot => {
        const valueDisplay = document.getElementById(`${slot}-value`);
        valueDisplay.textContent = memory[slot] !== null ? formatNumber(memory[slot]) : 'Empty';
    });
    
    // Initialize converter
    updateConverterOptions();
}); 