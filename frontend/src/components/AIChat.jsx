import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartByUserIdAsync, addToCartAsync, addToGuestCart } from '../features/cart/CartSlice';
import { selectLoggedInUser } from '../features/auth/AuthSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SUGGESTED_QUERIES = [
    'Tìm chuột gaming không dây',
    'Tai nghe chống ồn',
    'Bàn phím cơ RGB',
];

const AIChat = ({ onProductsFound }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào bạn! Mình là trợ lý ảo BHQ Store. Bạn cần tìm linh kiện nào? Thử hỏi "Tìm chuột gaming Razer" nhé!' }
    ]);
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);

    // ✅ Animated dots for loading indicator
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 400);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        const savedChat = localStorage.getItem('chat_history');
        if (savedChat) {
            try { setMessages(JSON.parse(savedChat)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (messages.length > 1) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // ✅ Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const getUser = () => {
        try {
            const stored = localStorage.getItem('loggedInUser');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    };

    const handleAddToCart = async (productId, silent = false) => {
        try {
            const user = getUser();
            if (user && user._id) {
                const result = await dispatch(addToCartAsync({
                    user: user._id,
                    product: productId,
                    quantity: 1
                }));
                if (result.meta.requestStatus === 'fulfilled') {
                    await dispatch(fetchCartByUserIdAsync(user._id));
                    if (!silent) alert("Đã thêm vào giỏ hàng!");
                    return true;
                } else {
                    if (!silent) alert("Không thể thêm vào giỏ!");
                    return false;
                }
            } else {
                dispatch(addToGuestCart({ _id: productId }));
                if (!silent) alert("Đã thêm vào giỏ hàng!");
                return true;
            }
        } catch (error) {
            console.error("Cart Error:", error);
            return false;
        }
    };

    const handleSend = async (messageText) => {
        const userMessage = (messageText || input).trim();
        if (!userMessage || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        // ✅ Abort previous request if still pending
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        try {
            const threadId = localStorage.getItem('chat_thread_id');
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    message: userMessage,
                    threadId: threadId && threadId !== "undefined" ? threadId : null
                }),
            });

            const data = await response.json();

            if (data.reply) {
                const products = data.products || [];
                if (products.length > 0 && onProductsFound) {
                    onProductsFound(products);
                }

                if (data.cartAction?.type === "ADD_TO_CART") {
                    const success = await handleAddToCart(data.cartAction.productId, true);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: success ? '✅ Đã thêm vào giỏ hàng!' : '❌ Không thể thêm vào giỏ.',
                        isSystem: true
                    }]);
                }

                const cleanReply = data.reply
                    .replace(/\[ACTION:\s*ADD_TO_CART\(.*?\)\]/g, '')
                    .trim();

                if (cleanReply) {
                    setMessages(prev => [...prev, { role: 'assistant', content: cleanReply }]);
                }

                if (data.threadId) {
                    localStorage.setItem('chat_thread_id', data.threadId);
                }
            } else if (data.error) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `❌ ${data.details || data.error}`
                }]);
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error("Fetch error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Lỗi kết nối. Vui lòng thử lại!'
            }]);
        } finally {
            setLoading(false);
            setDots('');
        }
    };

    const handleClearChat = () => {
        localStorage.removeItem('chat_history');
        localStorage.removeItem('chat_thread_id');
        setMessages([{
            role: 'assistant',
            content: 'Chào bạn! Mình là trợ lý ảo BHQ Store. Bạn cần tìm linh kiện nào?'
        }]);
    };

    const renderMessageContent = (text) => {
        const lines = text.split('\n');
        return lines.map((line, lineIdx) => {
            // Image
            const imageMatch = line.match(/!\[.*?\]\((.*?)\)/);
            if (imageMatch) {
                const imgPath = imageMatch[1];
                const fullUrl = imgPath.startsWith('http') ? imgPath : `${API_URL}${imgPath}`;
                return (
                    <img key={lineIdx} src={fullUrl} alt="Product"
                        style={{
                            width: '100%', borderRadius: '12px', marginTop: '8px',
                            display: 'block', border: '1px solid #eee',
                            maxHeight: '200px', objectFit: 'cover'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                );
            }

            // Specs block
            if (line.startsWith('🔧 Thông số kỹ thuật:')) {
                return (
                    <div key={lineIdx} style={{
                        marginTop: '6px', padding: '8px',
                        backgroundColor: '#f0f9ff', borderRadius: '8px',
                        fontSize: '12px', color: '#0369a1'
                    }}>
                        <strong>🔧 Thông số kỹ thuật:</strong>
                        <div style={{ marginTop: '4px' }}>
                            {line.replace('🔧 Thông số kỹ thuật:', '').trim()}
                        </div>
                    </div>
                );
            }

            // Add to cart button
            const idMatch = line.match(/\[ID:\s*(.*?)\]/);
            if (idMatch) {
                const pId = idMatch[1].trim();
                return (
                    <button key={lineIdx} onClick={() => handleAddToCart(pId)}
                        style={{
                            marginTop: '8px', width: '100%', padding: '10px',
                            backgroundColor: '#10b981', color: 'white', border: 'none',
                            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                        }}
                    >
                        🛒 Thêm vào giỏ
                    </button>
                );
            }

            // Divider
            if (line.trim() === '---') {
                return <hr key={lineIdx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />;
            }

            // Bold text
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <div key={lineIdx} style={{ marginBottom: '2px' }}>
                        {parts.map((part, i) =>
                            i % 2 === 1
                                ? <strong key={i}>{part}</strong>
                                : <span key={i}>{part}</span>
                        )}
                    </div>
                );
            }

            return line
                ? <div key={lineIdx} style={{ marginBottom: '2px' }}>{line}</div>
                : <div key={lineIdx} style={{ height: '6px' }} />;
        });
    };

    return (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 10000 }}>

            {/* Toggle button */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)}
                    style={{
                        backgroundColor: '#2563eb', color: 'white', borderRadius: '50%',
                        width: '65px', height: '65px', border: 'none', cursor: 'pointer',
                        fontSize: '28px', boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    💬
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: '400px', height: '620px', backgroundColor: 'white',
                    borderRadius: '24px', display: 'flex', flexDirection: 'column',
                    border: '1px solid #e2e8f0', overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#000', padding: '16px 20px', color: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                BHQ Store AI
                                {loading && (
                                    <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                                        đang tìm{dots}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                                {loggedInUser ? `${loggedInUser.name || loggedInUser.email}` : 'Guest'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={handleClearChat}
                                style={{
                                    color: 'white', background: 'none',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '6px', cursor: 'pointer',
                                    fontSize: '11px', padding: '4px 8px'
                                }}
                            >
                                Clear
                            </button>
                            <button onClick={() => setIsOpen(false)}
                                style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} style={{
                        flex: 1, overflowY: 'auto', padding: '15px',
                        backgroundColor: '#f8fafc', display: 'flex',
                        flexDirection: 'column', gap: '12px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%'
                            }}>
                                <div style={{
                                    padding: '10px 14px', borderRadius: '18px',
                                    fontSize: '14px', lineHeight: '1.5',
                                    backgroundColor: msg.role === 'user' ? '#2563eb' : msg.isSystem ? '#ecfdf5' : 'white',
                                    color: msg.role === 'user' ? 'white' : '#1e293b',
                                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
                                }}>
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        ))}

                        {/* ✅ Typing indicator */}
                        {loading && (
                            <div style={{
                                alignSelf: 'flex-start', padding: '12px 16px',
                                backgroundColor: 'white', borderRadius: '18px',
                                border: '1px solid #e2e8f0', display: 'flex', gap: '4px', alignItems: 'center'
                            }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        backgroundColor: '#94a3b8',
                                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                                <style>{`
                                    @keyframes bounce {
                                        0%, 60%, 100% { transform: translateY(0); }
                                        30% { transform: translateY(-6px); }
                                    }
                                `}</style>
                            </div>
                        )}

                        {/* ✅ Suggested queries — only show on first message */}
                        {messages.length === 1 && !loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '4px' }}>Gợi ý:</div>
                                {SUGGESTED_QUERIES.map((q, i) => (
                                    <button key={i} onClick={() => handleSend(q)}
                                        style={{
                                            alignSelf: 'flex-start', padding: '6px 12px',
                                            backgroundColor: 'white', border: '1px solid #e2e8f0',
                                            borderRadius: '12px', cursor: 'pointer', fontSize: '13px',
                                            color: '#2563eb', transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={e => e.target.style.backgroundColor = '#eff6ff'}
                                        onMouseLeave={e => e.target.style.backgroundColor = 'white'}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 15px', borderTop: '1px solid #e2e8f0',
                        display: 'flex', gap: '8px', backgroundColor: 'white'
                    }}>
                        <input
                            ref={inputRef}
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: '10px',
                                border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            placeholder="Hỏi về sản phẩm..."
                            disabled={loading}
                        />
                        <button onClick={() => handleSend()} disabled={loading}
                            style={{
                                background: loading ? '#94a3b8' : '#000',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                padding: '0 16px', cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold', transition: 'background 0.2s'
                            }}
                        >
                            {loading ? '⏳' : 'Gửi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;