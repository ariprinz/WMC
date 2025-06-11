function isPrime(num) {
    if (num <= 1) return false;
    
    if (num === 2) return true;
    
    if (num % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    
    return true;
}

function checkPrime() {
    const input = document.getElementById('numberInput');
    const result = document.getElementById('result');
    const button = document.getElementById('checkButton');
    
    
    const value = input.value.trim();
    
    result.className = '';
    result.classList.add('show');
    
    if (value === '') {
        result.textContent = 'Ungültiger Wert';
        result.classList.add('ungueltig');
        return;
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num) || num !== Math.floor(num) || num < 0) {
        result.textContent = 'Ungültiger Wert';
        result.classList.add('ungueltig');
        return;
    }
    
    if (isPrime(num)) {
        result.textContent = 'Primzahl';
        result.classList.add('primzahl');
    } else {
        result.textContent = 'Keine Primzahl';
        result.classList.add('keine-primzahl');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('numberInput');
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPrime();
        }
    });
    
    input.focus();
});