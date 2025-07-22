import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [jokeMode, setJokeMode] = useState(false);

  // Simple jokes array
  const jokes = [
    "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
    "Why don’t skeletons fight each other? They don’t have the guts. 💀",
    "What do you call fake spaghetti? An impasta! 🍝",
    "Why did the math book look sad? Because it had too many problems. 📚",
    "I told my computer I needed a break, and it said 'No problem, I’ll go to sleep.' 😴"
  ];

  // Simple helpful responses
  const helpfulResponses = [
    { keywords: ['help', 'how', 'can you'], response: "I'm here to help! You can ask me for a joke, or type a question like 'How do I reset my password?'." },
    { keywords: ['reset password'], response: "To reset your password, click on 'Forgot password' on the login page and follow the instructions." },
    { keywords: ['weather'], response: "I can't check live weather, but you can use apps like Weather.com or your phone's weather app!" },
    { keywords: ['time'], response: `The current time is ${new Date().toLocaleTimeString()}.` },
    { keywords: ['date'], response: `Today's date is ${new Date().toLocaleDateString()}.` },
    { keywords: ['thank'], response: "You're welcome! 😊" }
  ];

  // Add more fallback responses for variety
  const fallbackResponses = [
    "Interesting! Tell me more.",
    "That's cool. What else would you like to talk about?",
    "I'm here to chat! Ask me anything or say 'joke mode on' for some fun.",
    "Could you elaborate on that?",
    "I'm listening! 😊",
    "Let's keep the conversation going!",
    "That's a good point. Want to ask me something else?",
    "I'm always here to help or tell a joke!"
  ];

  // Track last fallback index to avoid repeats
  const [lastFallbackIdx, setLastFallbackIdx] = useState(null);

  const getBotResponse = async (userMessage, currentJokeMode) => {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('joke mode on')) {
      setJokeMode(true);
      return "Joke mode activated! Ask me for a joke or say 'joke mode off' to return to normal.";
    }
    if (lowerMsg.includes('joke mode off')) {
      setJokeMode(false);
      return "Joke mode deactivated. Back to normal chat!";
    }
    if (currentJokeMode || lowerMsg.includes('tell me a joke')) {
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return joke;
    }
    // Check for helpful responses
    for (let item of helpfulResponses) {
      if (item.keywords.some(keyword => lowerMsg.includes(keyword))) {
        return item.response;
      }
    }
    if (lowerMsg.includes('hello')) {
      return "Hi there! 👋";
    }
    // Fallback: pick a random response, avoid repeating last one
    let idx;
    do {
      idx = Math.floor(Math.random() * fallbackResponses.length);
    } while (idx === lastFallbackIdx && fallbackResponses.length > 1);
    setLastFallbackIdx(idx);
    return fallbackResponses[idx];
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');

    // Pass the latest jokeMode value
    const botReply = await getBotResponse(input, jokeMode);
    setMessages((msgs) => [...msgs, { sender: 'bot', text: botReply }]);
  };

  return (
    <div className="App" style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>ChatGPT-like Bot {jokeMode && <span style={{color:'#ff9800'}}>🤡 Joke Mode</span>}</h2>
      <div style={{
        background: '#f4f4f8',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        height: 400,
        overflowY: 'auto',
        marginBottom: 16
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '8px 0'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? '#007bff' : '#e2e2e2',
                color: msg.sender === 'user' ? '#fff' : '#222',
                borderRadius: 16,
                padding: '8px 16px',
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={jokeMode ? "Ask for a joke or say 'joke mode off'..." : "Type your message..."}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 16,
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0 20px',
            borderRadius: 16,
            border: 'none',
            background: '#007bff',
            color: '#fff',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
