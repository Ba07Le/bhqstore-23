import React, { useState, useEffect, useRef } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartByUserIdAsync, addToCartAsync, addToGuestCart } from '../features/cart/CartSlice';
import { selectLoggedInUser } from '../features/auth/AuthSlice';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào bạn! Mình là trợ lý ảo BHQ Store. Bạn cần tìm linh kiện nào? Thử hỏi "Tìm chuột gaming Razer" nhé!' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const dispatch = useDispatch();

    const [position, setPosition] = useState({ x: 25, y: 25 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);

    const loggedInUser = useSelector(selectLoggedInUser);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setHasMoved(true);
            const newRight = window.innerWidth - e.clientX - dragStart.x;
            const newBottom = window.innerHeight - e.clientY - dragStart.y;
            setPosition({
                x: Math.max(0, newRight),
                y: Math.max(0, newBottom)
            });
        };
        const handleMouseUp = () => {
            setIsDragging(false);
        };
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleMouseDown = (e) => {
        if (e.target.tagName === 'BUTTON' && isOpen) return;
        setIsDragging(true);
        setHasMoved(false);
        setDragStart({
            x: (window.innerWidth - e.clientX) - position.x,
            y: (window.innerHeight - e.clientY) - position.y
        });
    };

    // Load chat history on mount
    useEffect(() => {
        const savedChat = localStorage.getItem('chat_history');
        if (savedChat) {
            try { setMessages(JSON.parse(savedChat)); } catch (e) {}
        }
    }, []);

    // Auto-scroll + save history
    useEffect(() => {
        if (messages.length > 1) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAddToCart = async (productId, silent = false) => {
        try {
            console.log("Adding to cart:", productId);

            if (loggedInUser && loggedInUser._id) {
                // Logged in — use Redux addToCartAsync
                console.log("Logged in:", loggedInUser._id);
                const result = await dispatch(addToCartAsync({
                    user: loggedInUser._id,
                    product: productId,
                    quantity: 1
                }));

                console.log("🛒 Dispatch result:", result);

                if (result.meta.requestStatus === 'fulfilled') {
                    await dispatch(fetchCartByUserIdAsync(loggedInUser._id));
                    if (!silent) alert(" Đã thêm vào giỏ hàng thành công!");
                    return true;
                } else {
                    console.error("addToCartAsync failed:", result.error);
                    if (!silent) alert("Không thể thêm vào giỏ hàng!");
                    return false;
                }
            } else {
                // ✅ Guest — use Redux guest cart
                console.log("👤 Guest — adding to guest cart");
                dispatch(addToGuestCart({ _id: productId }));
                if (!silent) alert("🛒 Đã thêm vào giỏ hàng!");
                return true;
            }
        } catch (error) {
            console.error("❌ Cart Error:", error);
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

            if (threadId === "undefined" || threadId === "null") {
            threadId = null;
        }

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    threadId: threadId && threadId !== "undefined" ? threadId : null
                }),
            });

            const data = await response.json();
            console.log("📨 Full response:", data);

            if (data.reply) {
                // ✅ Use cartAction from backend
                if (data.cartAction?.type === "ADD_TO_CART") {
                    const success = await handleAddToCart(data.cartAction.productId, true);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: success
                            ? '✅ Đã thêm sản phẩm vào giỏ hàng thành công!'
                            : '❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại.',
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
                    content: `❌ Lỗi: ${data.details || data.error}`
                }]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Lỗi kết nối server! Vui lòng thử lại.'
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
        const parts = text.split(/(!\[.*?\]\(.*?\))|(\[ID:\s*.*?\])/g).filter(Boolean);
        return parts.map((part, index) => {
            const imageMatch = part.match(/!\[.*?\]\((.*?)\)/);
            if (imageMatch) {
                const imgPath = imageMatch[1];
                const fullUrl = imgPath.startsWith('http') ? imgPath : `http://localhost:8000${imgPath}`;
                return (
                    <img key={index} src={fullUrl} alt="Product"
                        style={{ width: '100%', borderRadius: '12px', marginTop: '8px', display: 'block', border: '1px solid #eee' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                );
            }

            const idMatch = part.match(/\[ID:\s*(.*?)\]/);
            if (idMatch) {
                const pId = idMatch[1].trim();
                return (
                    <button key={index} onClick={() => handleAddToCart(pId)}
                        style={{
                            marginTop: '10px', width: '100%', padding: '10px',
                            backgroundColor: '#151716', color: 'white', border: 'none',
                            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                        }}
                    >
                        
                        Thêm vào giỏ hàng
                    </button>
                );
            }

            return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
        });
    };

    return (
        <div style={{ position: 'fixed', bottom: `${position.y}px`, right: `${position.x}px`, zIndex: 10000 }}>

            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    onMouseDown={handleMouseDown}
                    onClick={() => { if (!hasMoved) setIsOpen(true); }}
                    style={{
                        backgroundColor: '#111214', color: 'white', borderRadius: '50%',
                        width: '65px', height: '65px', border: 'none', cursor: isDragging ? 'grabbing' : 'pointer',
                        fontSize: '28px', boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
                        userSelect: 'none'
                    }}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '380px', height: '600px', backgroundColor: 'white',
                    borderRadius: '24px', display: 'flex', flexDirection: 'column',
                    border: '1px solid #e2e8f0', overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                }}>
                    {/* Header */}
                    <div 
                        onMouseDown={handleMouseDown}
                        style={{
                            background: '#000', padding: '16px 20px', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>🤖 BHQ Store AI</div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                                {loggedInUser ? ` ${loggedInUser.name || loggedInUser.email}` : '👤 Khách'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={handleClearChat}
                                title="Xoá lịch sử"
                                style={{
                                    color: 'white', background: 'none',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '6px', cursor: 'pointer',
                                    fontSize: '11px', padding: '4px 8px'
                                }}
                            >
                                Xoá
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
                                    backgroundColor: msg.role === 'user' ? '#0a0b0d' : msg.isSystem ? '#ecfdf5' : 'white',
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
                                🤖 Đang tìm kiếm...
                            </div>
                        )}
                    </div>

                    {/* Input */}
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
                            placeholder="Hỏi linh kiện..."
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
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;