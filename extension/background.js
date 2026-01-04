// Background service worker for PromptPower extension

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PromptPower extension installed');

    // Open welcome page
    chrome.tabs.create({
      url: 'http://localhost:3000'
    });
  } else if (details.reason === 'update') {
    console.log('PromptPower extension updated');
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'optimizePrompt') {
    // Forward optimization request to API
    optimizePrompt(request.prompt)
      .then(result => sendResponse({ success: true, optimizedPrompt: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open for async response
  }
});

// Optimize prompt using API
async function optimizePrompt(prompt) {
  const API_URL = 'http://localhost:3000/api/optimize';

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
      return data.optimizedPrompt;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Optimization error:', error);
    throw error;
  }
}

// Update badge on errors
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: request.text });
    chrome.action.setBadgeBackgroundColor({ color: request.color || '#ef4444' });

    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 3000);
  }
});
