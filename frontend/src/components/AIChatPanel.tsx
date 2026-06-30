import { useState } from 'react';
import { aiChatApi } from '../services/AIService';
import type { AIMessage } from '../models/AI';
import '../styles/AIChat.css';

const starterPrompts = [
    'What did I spend the most on last month.',
    'How much have I spent in total this month?',
    'What is my biggest transaction this month?'
];

function createMessage(role: 'user' | 'assistant', content: string): AIMessage {
    return {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role,
        content,
        createdAt: new Date().toISOString()
    };
}

export default function AIChatPanel() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([
        createMessage(
            'assistant',
            'Hi! I can analyze your transactions. Try asking what you spent the most on in a specific month.'
        )
    ]);

    const sendPrompt = async (rawPrompt?: string) => {
        const finalPrompt = (rawPrompt ?? prompt).trim();

        if (!finalPrompt || loading) return;

        const userMessage = createMessage('user', finalPrompt);

        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setLoading(true);

        try {
            const response = await aiChatApi({ prompt: finalPrompt });

            const assistantText =
                response?.data?.response ??
                'I could not generate a response.';

            const assistantMessage = createMessage('assistant', assistantText);

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            const fallback =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong while contacting the AI service.';

            setMessages(prev => [
                ...prev,
                createMessage('assistant', fallback)
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="ai-chat-panel animate-up">
            <div className="ai-chat-header animate-up delay-1">
                <div>
                    <h3>AI Finance Assistant</h3>
                    <p>Ask about your spending, categories, and monthly patterns.</p>
                </div>
            </div>

            <div className="ai-chat-starters">
                {starterPrompts.map((item, i) => (
                    <button
                        key={item}
                        type="button"
                        className="ai-starter-btn animate-up"
                        style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                        onClick={() => sendPrompt(item)}
                        disabled={loading}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="ai-chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            message.role === 'user'
                                ? 'ai-message ai-message-user animate-up'
                                : 'ai-message ai-message-assistant animate-up'
                        }
                    >
                        <div className="ai-message-role">
                            {message.role === 'user' ? 'You' : 'AI'}
                        </div>
                        <div className="ai-message-content">{message.content}</div>
                    </div>
                ))}

                {loading && (
                    <div className="ai-message ai-message-assistant loading-pulse animate-up">
                        <div className="ai-message-role">AI</div>
                        <div className="ai-message-content">Analyzing your transactions...</div>
                    </div>
                )}
            </div>

            <div className="ai-chat-input-row">
                <textarea
                    className="ai-chat-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask something like: What did I spend the most on in March?"
                    rows={3}
                    disabled={loading}
                />

                <button
                    type="button"
                    className="ai-send-btn"
                    onClick={() => sendPrompt()}
                    disabled={loading || !prompt.trim()}
                >
                    {loading ? 'Sending...' : 'Ask AI'}
                </button>
            </div>
        </section>
    );
}