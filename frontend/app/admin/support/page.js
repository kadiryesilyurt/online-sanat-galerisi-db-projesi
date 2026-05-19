"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

function ChatWindow({ ticketId, onClose }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchMessages = async () => {
        const res = await fetch(`${backendUrl}/api/support/${ticketId}/messages`);
        if (res.ok) setMessages(await res.json());
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [ticketId]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        const token = localStorage.getItem("token");
        await fetch(`${backendUrl}/api/support/${ticketId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ message: text })
        });
        setText("");
        fetchMessages();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="font-bold text-lg">Canlı Destek #{ticketId}</h3>
                    <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="h-64 overflow-y-auto p-4 bg-stone-50 rounded-xl mb-4 space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`p-3 rounded-xl max-w-[80%] text-sm ${m.is_admin ? 'bg-indigo-600 text-white ml-auto' : 'bg-white border'}`}>
                            {m.message}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded-xl text-sm" placeholder="Mesaj yaz..." />
                    <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700">Gönder</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminSupportPage() {
    const [allTickets, setAllTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState({});
    const [activeTicketId, setActiveTicketId] = useState(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const router = useRouter();

    const fetchAllTickets = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${backendUrl}/api/support/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllTickets(data);
            } else if (res.status === 403) {
                toast.error("Yetkisiz erişim!");
                router.push("/");
            }
        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTickets();
    }, []);

    const handleUpdate = async (ticketId, currentStatus, currentResponse) => {
        const token = localStorage.getItem("token");
        const adminResponse = responses[ticketId] !== undefined ? responses[ticketId] : currentResponse;

        const res = await fetch(`${backendUrl}/api/support/${ticketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                status: currentStatus,
                admin_response: adminResponse
            })
        });

        if (res.ok) {
            toast.success("Talep güncellendi!");
            fetchAllTickets();
        } else {
            toast.error("Güncelleme başarısız.");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-stone-500">Yönetim paneli yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-stone-900">🛡️ Admin Destek Yönetimi</h1>
                <p className="text-stone-500">Müşteri taleplerini buradan takip edip yanıtlayabilirsiniz.</p>
            </div>

            <div className="space-y-6">
                {allTickets.length === 0 ? (
                    <div className="bg-stone-50 p-12 text-center rounded-2xl border-2 border-dashed border-stone-200">
                        <p className="text-stone-500 font-bold">Henüz bekleyen talep yok.</p>
                    </div>
                ) : (
                    allTickets.map(ticket => (
                        <div key={ticket.ticket_id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Kullanıcı ID: {ticket.user_id}</span>
                                    <h3 className="text-lg font-bold text-stone-900 mt-2">{ticket.subject}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTicketId(ticket.ticket_id || ticket.id)}
                                        className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
                                    >
                                        💬 Sohbeti Aç
                                    </button>
                                    <select
                                        defaultValue={ticket.status}
                                        onChange={(e) => handleUpdate(ticket.ticket_id, e.target.value, ticket.admin_response)}
                                        className="text-xs font-bold border border-stone-300 rounded-lg p-2 bg-stone-50 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Açık">⏳ Açık</option>
                                        <option value="İşlemde">🔄 İşlemde</option>
                                        <option value="Çözüldü">✅ Çözüldü</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-xl text-sm text-stone-700 mb-4 whitespace-pre-wrap border border-stone-100">
                                {ticket.message}
                            </div>

                            <div className="flex gap-4">
                                <textarea
                                    className="flex-grow p-3 text-sm border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Yanıtınızı buraya yazın..."
                                    defaultValue={ticket.admin_response}
                                    onChange={(e) => setResponses({ ...responses, [ticket.ticket_id]: e.target.value })}
                                />
                                <button
                                    onClick={() => handleUpdate(ticket.ticket_id, ticket.status, null)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-colors cursor-pointer self-end"
                                >
                                    Yanıtı Gönder
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {(activeTicketId !== null && activeTicketId !== undefined && activeTicketId !== "") && (
                <ChatWindow
                    ticketId={activeTicketId}
                    onClose={() => {
                        console.log("Modal kapatılıyor...");
                        setActiveTicketId(null);
                    }}
                    isAdminView={true}
                />
            )}
        </div>
    );
}