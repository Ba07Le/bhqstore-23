import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartByUserIdAsync, addToCartAsync, addToGuestCart } from '../features/cart/CartSlice';
import { selectLoggedInUser } from '../features/auth/AuthSlice';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AIChat = ({ onProductsFound }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào bạn! Mình là trợ lý ảo BHQ Store. Bạn cần tìm linh kiện nào? Thử hỏi "Tìm chuột gaming Razer" nhé!' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);

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

    const getUser = () => {
        try {
            const stored = localStorage.getItem('loggedInUser');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    };

    const handleAddToCart = async (productId, silent = false) => {
        try {
            console.log("Adding to cart:", productId);
            const user = getUser();

            if (user && user._id) {
                const result = await dispatch(addToCartAsync({
                    user: user._id,
                    product: productId,
                    quantity: 1
                }));

                if (result.meta.requestStatus === 'fulfilled') {
                    await dispatch(fetchCartByUserIdAsync(user._id));
                    if (!silent) alert("Added to cart successfully!");
                    return true;
                } else {
                    if (!silent) alert("Cannot add to cart!");
                    return false;
                }
            } else {
                dispatch(addToGuestCart({ _id: productId }));
                if (!silent) alert("Added to cart!");
                return true;
            }
        } catch (error) {
            console.error("Cart Error:", error);
            return false;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const threadId = localStorage.getItem('chat_thread_id');
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    threadId: threadId && threadId !== "undefined" ? threadId : null
                }),
            });

            const data = await response.json();
            console.log("data.products:", data.products);          // ← is it array of 10?
            console.log("onProductsFound type:", typeof onProductsFound); // ← is it 'function'?

           if (data.reply) {
    const products = data.products || [];
    console.log("products length:", products.length); 
    if (products.length > 0 && onProductsFound) {
        onProductsFound(products);
    }

                if (data.cartAction?.type === "ADD_TO_CART") {
                    const success = await handleAddToCart(data.cartAction.productId, true);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: success
                            ? 'Added to cart successfully!'
                            : 'Cannot add to cart. Please try again.',
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
                    content: `Error: ${data.details || data.error}`
                }]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Connection error. Please try again!'
            }]);
        } finally {
            setLoading(false);
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
                        Add to cart
                    </button>
                );
            }

            if (line.trim() === '---') {
                return <hr key={lineIdx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />;
            }

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

            return line ? (
                <div key={lineIdx} style={{ marginBottom: '2px' }}>{line}</div>
            ) : (
                <div key={lineIdx} style={{ height: '6px' }} />
            );
        });
    };

    return (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 10000 }}>

            {!isOpen && (
                <button onClick={() => setIsOpen(true)}
                    style={{
                        backgroundColor: '#2563eb', color: 'white', borderRadius: '50%',
                        width: '65px', height: '65px', border: 'none', cursor: 'pointer',
                        fontSize: '28px', boxShadow: '0 4px 15px rgba(37,99,235,0.4)'
                    }}
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
                    <div style={{
                        background: '#000', padding: '16px 20px', color: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>BHQ Store AI</div>
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
                        {loading && (
                            <div style={{
                                alignSelf: 'flex-start', padding: '10px 14px',
                                backgroundColor: 'white', borderRadius: '18px',
                                border: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b'
                            }}>
                                Searching...
                            </div>
                        )}
                    </div>

                    <div style={{
                        padding: '12px 15px', borderTop: '1px solid #e2e8f0',
                        display: 'flex', gap: '8px', backgroundColor: 'white'
                    }}>
                        <input
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: '10px',
                                border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none'
                            }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask for products..."
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading}
                            style={{
                                background: loading ? '#94a3b8' : '#000',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                padding: '0 16px', cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;