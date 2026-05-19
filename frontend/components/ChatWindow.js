function ChatWindow({ ticketId, onClose, isAdminView }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true); // Yüklenme durumu
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchMessages = async () => {
        // 🔥 EKLENEN KONTROL: ID null, undefined veya "null" stringi ise dur!
        if (!ticketId || ticketId === "null" || ticketId === "undefined") {
            console.warn("Geçersiz ticketId:", ticketId);
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/support/${ticketId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Fetch hatası:", err);
        }
    };

    useEffect(() => {
        console.log("Açılan Ticket ID:", ticketId); // F12 -> Konsol'dan bunu kontrol et
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [ticketId]);

    // ... sendMessage fonksiyonu aynı kalacak ...

    return (
        // DIŞTAKİ DIV'E onClick={onClose} EKLEDİK (Dışarı tıklayınca kapanır)
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            {/* Modalın içine tıklayınca kapanmaması için stopPropagation ekledik */}
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="font-bold text-lg">Canlı Destek #{ticketId}</h3>
                    <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-stone-400">Yükleniyor...</div>
                ) : (
                    <div className="h-64 overflow-y-auto p-4 bg-stone-50 rounded-xl mb-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-center text-xs text-stone-400 pt-10">Henüz mesaj yok.</p>
                        ) : (
                            messages.map((m, i) => {
                                const isMyMessage = isAdminView ? m.is_admin : !m.is_admin;
                                return (
                                    <div key={i} className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${isMyMessage
                                        ? 'bg-indigo-600 text-white ml-auto rounded-br-none'
                                        : 'bg-white border border-stone-200 mr-auto rounded-bl-none'
                                        }`}>
                                        {m.message}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded-xl text-sm" placeholder="Mesaj yaz..." />
                    <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700">Gönder</button>
                </div>
            </div>
        </div>
    );
}