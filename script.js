document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // Store the conversation history to send to the backend
  const conversationHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add user's message to the chat box and history
    appendMessage(text, 'user');
    conversationHistory.push({ role: 'user', text: text });
    
    // Clear the input field
    userInput.value = '';

    // 2. Show a temporary "Thinking..." bot message
    const botMessageEl = appendMessage('Thinking...', 'model');

    // 3. Send the POST request to the backend
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation: conversationHistory })
      });

      if (!response.ok) {
        // Attempt to parse the error message from the backend
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 4. Replace the "Thinking..." message with the AI's reply
      if (data && data.result) {
        botMessageEl.textContent = data.result;
        conversationHistory.push({ role: 'model', text: data.result });
      } else {
        botMessageEl.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      // 5. Handle errors by updating the bot message element
      botMessageEl.textContent = `Error: ${error.message}`;
    }
  });

  function appendMessage(text, role) {
    const messageDiv = document.createElement('div');
    // You can use these classes in your CSS (e.g., .user-message, .model-message)
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = text;
    
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageDiv;
  }
});