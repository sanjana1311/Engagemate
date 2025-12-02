// This script runs on LinkedIn pages
console.log("EngageMate AI: Content script loaded.");

// Helper to read rules from storage
async function getAutomationRules() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['rules', 'assets'], (result) => {
      resolve({ rules: result.rules || [], assets: result.assets || [] });
    });
  });
}

// Observer to detect new comments appearing in the DOM
const observer = new MutationObserver(async (mutations) => {
  for (const mutation of mutations) {
    // Note: LinkedIn class names are dynamic/obfuscated (e.g., 'comments-comment-item'). 
    // You will need to inspect the current LinkedIn DOM to find the exact class for 2024.
    // This is a generic selector example.
    if (mutation.addedNodes.length) {
      const addedNodes = Array.from(mutation.addedNodes);
      
      // Look for comment text containers
      const newComments = addedNodes.filter(node => 
        node.classList && node.classList.contains('comments-comment-item')
      );

      if (newComments.length > 0) {
        const { rules, assets } = await getAutomationRules();
        
        newComments.forEach(commentNode => {
          processCommentNode(commentNode, rules, assets);
        });
      }
    }
  }
});

function processCommentNode(node, rules, assets) {
  // Extract text content from the node
  // Specific selectors depend on LinkedIn's current HTML structure
  const textElement = node.querySelector('.comments-comment-item__main-content');
  const authorElement = node.querySelector('.comments-post-meta__name-text');
  
  if (!textElement || !authorElement) return;

  const commentText = textElement.innerText.toLowerCase();
  const authorName = authorElement.innerText;

  // Check against rules
  const matchedRule = rules.find(r => r.isActive && commentText.includes(r.keyword.toLowerCase()));

  if (matchedRule) {
    console.log(`EngageMate: Matched keyword "${matchedRule.keyword}" from ${authorName}`);
    
    // In a real scenario, you would:
    // 1. Click the "Reply" button programmatically.
    // 2. Call the Gemini API (via background script) to generate response.
    // 3. Insert text into the input field.
    // 4. Click "Post".
    
    // For safety, we alert for now:
    alert(`EngageMate found a match!\nUser: ${authorName}\nKeyword: ${matchedRule.keyword}\nAction: Sending ${matchedRule.assetId}`);
  }
}

// Start observing the feed or post modal
const targetNode = document.body;
observer.observe(targetNode, { childList: true, subtree: true });
