let display = document.getElementById('result');
let currentInput = '';
let memory = 0;

function formatNumber(number) {
    // Convert to string and handle negative numbers
    let numStr = number.toString();
    let isNegative = numStr.startsWith('-');
    if (isNegative) {
        numStr = numStr.substring(1);
    }

    // Split into integer and decimal parts
    let parts = numStr.split('.');
    
    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Join parts and restore negative sign
    let result = parts.join('.');
    return isNegative ? '-' + result : result;
}

function appendNumber(number) {
    currentInput += number;
    updateDisplay();
}

function appendOperator(operator) {
    if (currentInput !== '' && !isOperator(currentInput[currentInput.length - 1])) {
        currentInput += operator;
        updateDisplay();
    }
}

function isOperator(char) {
    return ['+', '-', '*', '/', '%'].includes(char);
}

function clearDisplay() {
    currentInput = '';
    updateDisplay();
}

function deleteLastChar() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    try {
        // Format the display with commas while typing
        let displayValue = currentInput;
        
        // Split the input by operators while preserving them
        let parts = displayValue.split(/([\+\-\*\/])/);
        
        // Format each number part with commas
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] && !isOperator(parts[i])) {
                let num = parseFloat(parts[i]);
                if (!isNaN(num)) {
                    parts[i] = formatNumber(num);
                }
            }
        }
        
        // Join the parts back together
        display.value = parts.join('');
    } catch (error) {
        display.value = currentInput;
    }
}

function calculate() {
    try {
        // Remove commas before calculation
        let expression = currentInput.replace(/,/g, '');
        // Replace × with * for calculation
        expression = expression.replace('×', '*');
        let result = eval(expression);
        
        // Handle decimal places
        if (result.toString().includes('.')) {
            result = parseFloat(result.toFixed(8));
        }
        
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
}

// Scientific Functions
function calculateScientific(func) {
    try {
        let num = parseFloat(currentInput);
        let result;

        switch(func) {
            case 'sin':
                result = Math.sin(num * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(num * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(num * Math.PI / 180);
                break;
            case 'sqrt':
                result = Math.sqrt(num);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'pow':
                result = Math.pow(num, 2);
                break;
            case 'pi':
                result = Math.PI;
                break;
        }

        if (result.toString().includes('.')) {
            result = parseFloat(result.toFixed(8));
        }
        
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
}

// Memory Functions
function memoryStore() {
    try {
        memory = parseFloat(currentInput);
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
}

function memoryRecall() {
    currentInput = memory.toString();
    updateDisplay();
}

function memoryClear() {
    memory = 0;
}

function memoryAdd() {
    try {
        memory += parseFloat(currentInput);
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
} 