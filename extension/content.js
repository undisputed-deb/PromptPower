// Content script for PromptPower extension
// Injects "Optimize with PromptPower" button into AI chat interfaces

(function() {
  'use strict';

  const SITE_CONFIGS = {
    'chat.openai.com': {
      name: 'ChatGPT',
      textareaSelector: '#prompt-textarea, textarea[data-id="root"]',
      buttonContainer: 'textarea',
      insertPosition: 'afterend'
    },
    'claude.ai': {
      name: 'Claude',
      textareaSelector: 'div[contenteditable="true"][role="textbox"]',
      buttonContainer: 'div[contenteditable="true"]',
      insertPosition: 'afterend'
    },
    'gemini.google.com': {
      name: 'Gemini',
      textareaSelector: 'rich-textarea[role="textbox"], div[contenteditable="true"]',
      buttonContainer: 'rich-textarea',
      insertPosition: 'afterend'
    }
  };

  const currentSite = Object.keys(SITE_CONFIGS).find(domain =>
    window.location.hostname.includes(domain)
  );

  if (!currentSite) {
    console.log('PromptPower: Not on a supported AI chat site');
    return;
  }

  const config = SITE_CONFIGS[currentSite];
  console.log(`PromptPower: Initializing for ${config.name}`);

  // Create optimize button
  function createOptimizeButton() {
    const button = document.createElement('button');
    button.id = 'promptpower-optimize-btn';
    button.className = 'promptpower-btn';
    button.innerHTML = `
      <svg class="promptpower-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span>Optimize with PromptPower</span>
    `;

    button.addEventListener('click', handleOptimize);
    return button;
  }

  // Handle optimization
  async function handleOptimize(e) {
    e.preventDefault();
    e.stopPropagation();

    const textarea = document.querySelector(config.textareaSelector);
    if (!textarea) {
      showNotification('Could not find text input', 'error');
      return;
    }

    // Get current text
    let currentText;
    if (textarea.isContentEditable) {
      currentText = textarea.textContent || textarea.innerText;
    } else {
      currentText = textarea.value;
    }

    if (!currentText || currentText.trim().length === 0) {
      showNotification('Please enter a prompt first', 'error');
      return;
    }

    // Show loading state
    const button = document.getElementById('promptpower-optimize-btn');
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <div class="promptpower-spinner"></div>
      <span>Optimizing...</span>
    `;

    try {
      // Send message to background script
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: 'optimizePrompt', prompt: currentText.trim() },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      if (response.success && response.optimizedPrompt) {
        // Replace text in textarea
        if (textarea.isContentEditable) {
          textarea.textContent = response.optimizedPrompt;
          // Trigger input event
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          textarea.value = response.optimizedPrompt;
          // Trigger input event
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
        }

        showNotification('Prompt optimized!', 'success');
      } else {
        throw new Error(response.error || 'Failed to optimize');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      showNotification(error.message || 'Optimization failed', 'error');

      // Update extension badge
      chrome.runtime.sendMessage({
        action: 'updateBadge',
        text: '!',
        color: '#ef4444'
      });
    } finally {
      button.disabled = false;
      button.innerHTML = originalHTML;
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `promptpower-notification promptpower-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Insert button into page
  function insertButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('promptpower-optimize-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const textarea = document.querySelector(config.textareaSelector);
    if (!textarea) {
      return;
    }

    // Find the parent container
    let container = textarea.parentElement;
    if (!container) {
      return;
    }

    // Create and insert button
    const button = createOptimizeButton();

    if (config.insertPosition === 'afterend') {
      container.insertAdjacentElement('afterend', button);
    } else {
      container.appendChild(button);
    }
  }

  // Watch for DOM changes and insert button
  const observer = new MutationObserver(() => {
    const textarea = document.querySelector(config.textareaSelector);
    const button = document.getElementById('promptpower-optimize-btn');

    if (textarea && !button) {
      insertButton();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial insertion
  setTimeout(insertButton, 1000);

  console.log('PromptPower: Content script loaded');
})();
