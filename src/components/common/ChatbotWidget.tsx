import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

type ChatMessage = {
    sender: 'user' | 'bot';
    text: string;
};

const initialGreeting = 'Xin chào! Tôi là trợ lý ảo Coffee Shop. Tôi có thể giúp bạn tìm sản phẩm, gợi ý cà phê hoặc tra cứu đơn hàng của bạn.';

export default function ChatbotWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: initialGreeting },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loggedInUserId = user?.id ?? null;

    useEffect(() => {
        if (!isOpen) return;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isOpen]);

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    const handleSend = async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText || loading) {
            return;
        }

        const userMessage: ChatMessage = { sender: 'user', text: trimmedText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response: any = await axiosClient.post('/chatbot/ask', {
                message: trimmedText,
                userId: loggedInUserId,
            });

            const botText = typeof response === 'string'
                ? response
                : response?.data || response?.message || 'Xin lỗi, tôi không nhận được câu trả lời từ trợ lý ảo.';

            setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: 'Xin lỗi, trợ lý ảo hiện đang gặp sự cố. Vui lòng thử lại sau.',
            }] );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatbot-widget">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div>
                            <strong>Trợ lý Coffee Shop</strong>
                            <p>Hỏi tôi về menu, gợi ý cà phê hoặc đơn hàng của bạn.</p>
                        </div>
                        <button className="chatbot-close" onClick={toggleOpen} aria-label="Đóng chatbot">
                            ×
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`chatbot-message ${message.sender}`}>
                                <div className="chatbot-bubble">{message.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-bubble chatbot-loading">Trợ lý đang trả lời...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-row">
                        <input
                            value={inputText}
                            onChange={event => setInputText(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi tôi về cà phê hoặc đơn hàng của bạn..."
                            disabled={loading}
                        />
                        <button className="chatbot-send-button" onClick={handleSend} disabled={loading || !inputText.trim()}>
                            Gửi
                        </button>
                    </div>
                </div>
            )}

            <button className="chatbot-toggle-button" onClick={toggleOpen} aria-label="Mở trợ lý ảo">
                💬
            </button>
        </div>
    );
}
