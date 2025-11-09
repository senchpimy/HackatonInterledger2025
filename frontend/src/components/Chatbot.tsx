import React, { useState } from 'react';

interface ChatResponse {
  respuesta: string;
  action: string;
  url: string;
  button_text: string;
}

const Chatbot: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/chat', { // Corrected endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      const data: ChatResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error('Error al comunicarse con el chatbot:', err);
      setError(err.message || 'Error al comunicarse con el chatbot.');
    } finally {
      setLoading(false);
      setPrompt('');
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

      {response && (
        <div className="chatbot-response">
          <p>{response.respuesta}</p>
          {response.action === 'redirect' && response.url && response.button_text && (
            <a href={response.url} target="_blank" rel="noopener noreferrer">
              <button>{response.button_text}</button>
            </a>
          )}
          {/* Add more actions here if needed, e.g., 'display_info', 'show_modal' */}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
