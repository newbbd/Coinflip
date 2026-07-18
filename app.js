'use strict';

const STORAGE_KEY = 'secure-coinflip-state-v1';
const THEME_KEY = 'secure-coinflip-theme';
const HISTORY_LIMIT = 20;

const elements = {
  coin: document.querySelector('#coin'),
  flipButton: document.querySelector('#flipButton'),
  resetButton: document.querySelector('#resetButton'),
  copyButton: document.querySelector('#copyButton'),
  themeButton: document.querySelector('#themeButton'),
  resultLabel: document.querySelector('#resultLabel'),
  resultText: document.querySelector('#resultText'),
  securityStatus: document.querySelector('#securityStatus'),
  headsCount: document.querySelector('#headsCount'),
  tailsCount: document.querySelector('#tailsCount'),
  totalCount: document.querySelector('#totalCount'),
  headsPercent: document.querySelector('#headsPercent'),
  tailsPercent: document.querySelector('#tailsPercent'),
  historyList: document.querySelector('#historyList')
};

let state = loadState();
let isFlipping = false;

function hasSecureRandomness() {
  return window.isSecureContext
    && typeof window.crypto !== 'undefined'
    && typeof window.crypto.getRandomValues === 'function';
}

function getSecureCoinFlip() {
  if (!hasSecureRandomness()) {
    throw new Error('Cryptographically secure randomness is unavailable.');
  }

  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  const randomValue = values[0];
  const bit = randomValue % 2;

  return {
    result: bit === 0 ? 'Heads' : 'Tails',
    bit,
    randomValue,
    hex: `0x${randomValue.toString(16).padStart(8, '0')}`,
    timestamp: new Date().toISOString()
  };
}

function loadState() {
  const fallback = { heads: 0, tails: 0, history: [] };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Number.isInteger(saved.heads) || !Number.isInteger(saved.tails) || !Array.isArray(saved.history)) {
      return fallback;
    }

    return {
      heads: Math.max(0, saved.heads),
      tails: Math.max(0, saved.tails),
      history: saved.history.slice(0, HISTORY_LIMIT)
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The flip still works if storage is blocked or full.
  }
}

function formatPercent(count, total) {
  return total === 0 ? '0%' : `${((count / total) * 100).toFixed(1)}%`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function renderStats() {
  const total = state.heads + state.tails;
  elements.headsCount.textContent = String(state.heads);
  elements.tailsCount.textContent = String(state.tails);
  elements.totalCount.textContent = String(total);
  elements.headsPercent.textContent = formatPercent(state.heads, total);
  elements.tailsPercent.textContent = formatPercent(state.tails, total);
  elements.resetButton.disabled = total === 0;
}

function renderHistory() {
  elements.historyList.replaceChildren();

  if (state.history.length === 0) {
    const item = document.createElement('li');
    item.className = 'empty-state';
    item.textContent = 'No flips yet';
    elements.historyList.append(item);
    elements.copyButton.disabled = true;
    return;
  }

  for (const flip of state.history) {
    const item = document.createElement('li');
    item.className = 'history-item';

    const result = document.createElement('span');
    result.className = `history-result ${flip.result.toLowerCase()}`;
    result.textContent = flip.result;

    const details = document.createElement('span');
    details.className = 'history-details';
    details.textContent = `${flip.hex} · bit ${flip.bit} · ${formatTime(flip.timestamp)}`;

    item.append(result, details);
    elements.historyList.append(item);
  }

  elements.copyButton.disabled = false;
}

function render() {
  renderStats();
  renderHistory();
}

function finishFlip(flip) {
  state[flip.result.toLowerCase()] += 1;
  state.history.unshift(flip);
  state.history = state.history.slice(0, HISTORY_LIMIT);
  saveState();

  elements.resultLabel.textContent = 'Result';
  elements.resultText.textContent = flip.result;
  elements.coin.classList.remove('flipping-heads', 'flipping-tails');
  elements.coin.classList.add(flip.result === 'Heads' ? 'show-heads' : 'show-tails');
  render();

  isFlipping = false;
  elements.flipButton.disabled = false;
  elements.flipButton.focus({ preventScroll: true });
}

function flipCoin() {
  if (isFlipping || !hasSecureRandomness()) {
    return;
  }

  let flip;
  try {
    flip = getSecureCoinFlip();
  } catch (error) {
    disableFlipping(error instanceof Error ? error.message : 'Secure randomness failed.');
    return;
  }

  isFlipping = true;
  elements.flipButton.disabled = true;
  elements.resultLabel.textContent = 'Flipping';
  elements.resultText.textContent = '...';

  elements.coin.classList.remove('show-heads', 'show-tails', 'flipping-heads', 'flipping-tails');
  void elements.coin.offsetWidth;
  elements.coin.classList.add(flip.result === 'Heads' ? 'flipping-heads' : 'flipping-tails');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => finishFlip(flip), reduceMotion ? 80 : 900);
}

function disableFlipping(message) {
  elements.flipButton.disabled = true;
  elements.securityStatus.className = 'security-status error';
  elements.securityStatus.textContent = message;
  elements.resultLabel.textContent = 'Unavailable';
  elements.resultText.textContent = 'Secure random source required';
}

function resetStats() {
  state = { heads: 0, tails: 0, history: [] };
  saveState();
  elements.resultLabel.textContent = 'Ready';
  elements.resultText.textContent = 'Flip the coin';
  elements.coin.classList.remove('show-tails', 'flipping-heads', 'flipping-tails');
  elements.coin.classList.add('show-heads');
  render();
}

async function copyLatestDetails() {
  const flip = state.history[0];
  if (!flip) {
    return;
  }

  const details = [
    `Result: ${flip.result}`,
    `Random uint32: ${flip.randomValue} (${flip.hex})`,
    `Selected bit: ${flip.bit}`,
    `Generated: ${flip.timestamp}`,
    'Source: Web Crypto API crypto.getRandomValues()'
  ].join('\n');

  try {
    await navigator.clipboard.writeText(details);
    elements.copyButton.textContent = 'Copied';
    window.setTimeout(() => {
      elements.copyButton.textContent = 'Copy details';
    }, 1200);
  } catch {
    elements.copyButton.textContent = 'Copy failed';
    window.setTimeout(() => {
      elements.copyButton.textContent = 'Copy details';
    }, 1200);
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Theme persistence is optional.
  }
}

function initializeTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch {
    // Use the system theme when storage is unavailable.
  }

  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
    return;
  }

  applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
}

function initializeSecurityStatus() {
  if (!hasSecureRandomness()) {
    disableFlipping('Secure randomness requires a modern browser over HTTPS.');
    return;
  }

  elements.securityStatus.className = 'security-status secure';
  elements.securityStatus.textContent = 'Secure source ready: Web Crypto API';
}

elements.flipButton.addEventListener('click', flipCoin);
elements.resetButton.addEventListener('click', resetStats);
elements.copyButton.addEventListener('click', copyLatestDetails);
elements.themeButton.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;

  if (event.code === 'Space' && !isTyping) {
    event.preventDefault();
    flipCoin();
  }
});

initializeTheme();
initializeSecurityStatus();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline support is optional and does not affect randomness.
    });
  });
}
