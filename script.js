const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const themeToggle = document.getElementById('theme-toggle');
const keys = document.querySelector('.controls');

let expression = '';
let current = '0';

const operatorMap = {
  '/': '÷',
  '*': '×',
  '-': '−',
  '+': '+'
};

function refreshDisplay() {
  resultEl.textContent = current;
  expressionEl.textContent = expression
    .replace(/\//g, operatorMap['/'])
    .replace(/\*/g, operatorMap['*'])
    .replace(/-/g, operatorMap['-']);
}

function safeEval(raw) {
  if (!raw) return 0;
  const clean = raw.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  if (!/^[\d+\-*/().\s]+$/.test(clean)) return 'Error';
  try {
    const value = Function(`"use strict"; return (${clean})`)();
    if (!Number.isFinite(value)) return 'Error';
    return Number(value.toFixed(10)).toString();
  } catch {
    return 'Error';
  }
}

function inputValue(value) {
  if (value === '.' && /(?:^|[+\-*/])\d*\.$/.test(expression)) return;

  if (current === '0' && /\d/.test(value) && expression === '') {
    expression = value;
  } else {
    expression += value;
  }

  const interim = safeEval(expression);
  current = interim === 'Error' ? '0' : interim;
  refreshDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  const interim = safeEval(expression);
  current = expression ? (interim === 'Error' ? '0' : interim) : '0';
  refreshDisplay();
}

function clearAll() {
  expression = '';
  current = '0';
  refreshDisplay();
}

function calculate() {
  const finalResult = safeEval(expression);
  if (finalResult === 'Error') {
    current = 'Error';
    expression = '';
  } else {
    current = finalResult;
    expression = finalResult;
  }
  refreshDisplay();
}

keys.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'clear') return clearAll();
  if (action === 'delete') return backspace();
  if (action === 'equals') return calculate();
  if (value) inputValue(value);
});

window.addEventListener('keydown', (event) => {
  if (/^[0-9.+\-*/%]$/.test(event.key)) inputValue(event.key);
  else if (event.key === 'Enter' || event.key === '=') calculate();
  else if (event.key === 'Backspace') backspace();
  else if (event.key.toLowerCase() === 'c') clearAll();
});

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'light') document.documentElement.classList.add('light');

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const theme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
});

refreshDisplay();
