// Configuration
const API_URL = 'http://localhost:3000/api/optimize';
const MAX_CHARS = 5000;

// DOM Elements
const inputPrompt = document.getElementById('input-prompt');
const outputPrompt = document.getElementById('output-prompt');
const optimizeBtn = document.getElementById('optimize-btn');
const copyBtn = document.getElementById('copy-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const outputSection = document.getElementById('output-section');
const charCount = document.getElementById('char-count');

// Update character count
inputPrompt.addEventListener('input', () => {
  const count = inputPrompt.value.length;
  charCount.textContent = `${count} / ${MAX_CHARS}`;

  if (count > MAX_CHARS * 0.9) {
    charCount.style.color = '#ef4444';
  } else if (count > MAX_CHARS * 0.7) {
    charCount.style.color = '#f59e0b';
  } else {
    charCount.style.color = 'rgba(255, 255, 255, 0.8)';
  }
});

// Optimize prompt
optimizeBtn.addEventListener('click', async () => {
  const prompt = inputPrompt.value.trim();

  if (!prompt) {
    showError('Please enter a prompt to optimize');
    return;
  }

  if (prompt.length > MAX_CHARS) {
    showError(`Prompt must be less than ${MAX_CHARS} characters`);
    return;
  }

  // Show loading state
  hideError();
  outputSection.classList.add('hidden');
  loading.classList.remove('hidden');
  optimizeBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to optimize prompt');
    }

    if (data.success && data.optimizedPrompt) {
      outputPrompt.value = data.optimizedPrompt;
      outputSection.classList.remove('hidden');

      // Save to storage for later use
      chrome.storage.local.set({ lastOptimized: data.optimizedPrompt });
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    showError(err.message || 'An error occurred. Please try again.');
  } finally {
    loading.classList.add('hidden');
    optimizeBtn.disabled = false;
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputPrompt.value);

    // Show success feedback
    const originalHTML = copyBtn.innerHTML;
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
      <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      Copied!
    `;

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = originalHTML;
    }, 2000);
  } catch (err) {
    showError('Failed to copy to clipboard');
  }
});

// Keyboard shortcuts
inputPrompt.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    optimizeBtn.click();
  }
});

// Error handling
function showError(message) {
  errorMessage.textContent = message;
  error.classList.remove('hidden');
}

function hideError() {
  error.classList.add('hidden');
  errorMessage.textContent = '';
}

// Load last optimized prompt on startup
chrome.storage.local.get(['lastOptimized'], (result) => {
  if (result.lastOptimized) {
    outputPrompt.value = result.lastOptimized;
    outputSection.classList.remove('hidden');
  }
});
