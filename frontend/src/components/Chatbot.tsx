import React, { useState } from 'react';

interface ChatResponse {
  respuesta: string;
  action: string;
  url: string;
  button_text: string;
}

interface ChatMessage {
  userMessage: string;
  botResponse: ChatResponse;
}

const Chatbot: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt) return;

    setLoading(true);
    setError(null);
    setPrompt(''); // Clear prompt immediately

    try {
      const res = await fetch('/api/chat', { // Corrected endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      const data: ChatResponse = await res.json();
      console.log('Raw chatbot response:', data);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { userMessage: currentPrompt, botResponse: data },
      ]);
    } catch (err: any) {
      console.error('Error al comunicarse con el chatbot:', err);
      setError(err.message || 'Error al comunicarse con el chatbot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h2>Chatbot de GoFundMe</h2>
      <form onSubmit={handleSubmit} className="chatbot-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Pregúntale algo al bot..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {error && <p className="chatbot-error">Error: {error}</p>}

      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div key={index} className="chat-message-pair">
            <div className="user-message">
              <strong>Tú:</strong> {message.userMessage}
            </div>
            <div className="bot-message">
              <strong>RAG-Bot:</strong> {message.botResponse.respuesta}
              {(message.botResponse.action === 'offer_details' || message.botResponse.action === 'offer_donation') &&
                message.botResponse.url &&
                message.botResponse.button_text && (
                  <a href={message.botResponse.url} target="_blank" rel="noopener noreferrer">
                    <button className="chatbot-button">{message.botResponse.button_text}</button>
                  </a>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;
