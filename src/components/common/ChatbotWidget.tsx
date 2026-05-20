import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMessage = {
    sender: 'user' | 'bot';
    text: string;
};

type HistoryEntry = {
    role: 'user' | 'assistant';
    content: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_GREETING =
    'Xin chào! ☕ Tôi là trợ lý ảo Coffee Shop.\nTôi có thể giúp bạn tìm sản phẩm, gợi ý cà phê hoặc tra cứu đơn hàng.';

const QUICK_REPLIES = [
    { label: '☕ Gợi ý cà phê cho tôi', value: 'Gợi ý cho tôi một loại cà phê ngon nhé!' },
    { label: '📋 Xem menu & bảng giá', value: 'Cho tôi xem menu và bảng giá đầy đủ' },
    { label: '📦 Đơn hàng của tôi', value: 'Đơn hàng của tôi đang ở trạng thái nào?' },
    { label: '🚚 Chính sách giao hàng', value: 'Chính sách giao hàng của shop như thế nào?' },
];

/** Số lượt hội thoại tối đa gửi lên backend (mỗi lượt = 1 user + 1 bot) */
const MAX_HISTORY_PAIRS = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Render text với xuống dòng \n thành các đoạn */
function renderText(text: string): React.ReactNode {
    return text.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
        </React.Fragment>
    ));
}

/** Chuyển messages state → history format cho backend */
function buildHistory(messages: ChatMessage[]): HistoryEntry[] {
    // Bỏ qua greeting đầu tiên của bot, lấy MAX_HISTORY_PAIRS lượt cuối
    const relevant = messages.slice(1); // bỏ greeting
    const limited  = relevant.slice(-MAX_HISTORY_PAIRS * 2);
    return limited.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
    }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen]     = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: INITIAL_GREETING },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading]     = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loggedInUserId = user?.id ?? null;

    // Auto-scroll khi có tin mới
    useEffect(() => {
        if (!isOpen) return;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, loading, isOpen]);

    const toggleOpen = () => setIsOpen(prev => !prev);

    // ─── Send message ─────────────────────────────────────────────────────────

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setHasInteracted(true);
        const userMsg: ChatMessage = { sender: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        // Build history từ messages hiện tại (chưa gồm userMsg vừa thêm)
        const history = buildHistory([...messages, userMsg]);

        try {
            const response: any = await axiosClient.post('/chatbot/ask', {
                message: trimmed,
                userId: loggedInUserId,
                history,
            });

            const botText =
                typeof response === 'string'
                    ? response
                    : response?.data || response?.message || 'Xin lỗi, tôi không nhận được câu trả lời.';

            setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
        } catch {
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: 'Xin lỗi, trợ lý đang gặp sự cố. Vui lòng thử lại sau. 🙏' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => sendMessage(inputText);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickReply = (value: string) => sendMessage(value);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="chatbot-widget">
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">☕</div>
                            <div>
                                <strong>Trợ lý Coffee Shop</strong>
                                <p>Hỏi tôi về menu, gợi ý hoặc đơn hàng</p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={toggleOpen} aria-label="Đóng chatbot">
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chatbot-message ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="chatbot-bot-avatar">☕</div>
                                )}
                                <div className="chatbot-bubble">{renderText(msg.text)}</div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-bot-avatar">☕</div>
                                <div className="chatbot-bubble chatbot-typing">
                                    <span className="chatbot-typing-dot" />
                                    <span className="chatbot-typing-dot" />
                                    <span className="chatbot-typing-dot" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick reply chips — hiện khi chưa interact */}
                    {!hasInteracted && !loading && (
                        <div className="chatbot-chips">
                            {QUICK_REPLIES.map(chip => (
                                <button
                                    key={chip.value}
                                    className="chatbot-chip"
                                    onClick={() => handleQuickReply(chip.value)}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input row */}
                    <div className="chatbot-input-row">
                        <input
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập câu hỏi..."
                            disabled={loading}
                            autoComplete="off"
                        />
                        <button
                            className="chatbot-send-button"
                            onClick={handleSend}
                            disabled={loading || !inputText.trim()}
                            aria-label="Gửi"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                className={`chatbot-toggle-button ${isOpen ? 'open' : ''}`}
                onClick={toggleOpen}
                aria-label={isOpen ? 'Đóng trợ lý ảo' : 'Mở trợ lý ảo'}
            >
                {isOpen ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                )}
            </button>
        </div>
    );
}
