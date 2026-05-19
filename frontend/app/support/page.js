"use client";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Yeni talep formu state'i
    const [formData, setFormData] = useState({
        subject: "Siparişim Nerede?", // Varsayılan konu
        message: ""
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    // Kullanıcının mevcut taleplerini çekme
    const fetchTickets = async () => {
        const token = localStorage.getItem("token");
        if (!token) return; // Kullanıcı giriş yapmamışsa işlem yapma

        try {
            const res = await fetch(`${backendUrl}/api/support/my-tickets`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Biletler yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Yeni talep gönderme
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Talebiniz gönderiliyor...');
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${backendUrl}/api/support/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Talebiniz başarıyla alındı!', { id: toastId, style: { background: '#10B981', color: '#fff', borderRadius: '10px' } });
                setIsModalOpen(false);
                setFormData({ subject: "Siparişim Nerede?", message: "" });
                fetchTickets(); // Listeyi güncelle
            } else {
                toast.error('Talep oluşturulamadı.', { id: toastId, style: { background: '#EF4444', color: '#fff', borderRadius: '10px' } });
            }
        } catch (error) {
            toast.error('Sunucuya ulaşılamıyor.', { id: toastId, style: { background: '#EF4444', color: '#fff', borderRadius: '10px' } });
        }
    };

    // Duruma göre renkli rozet (Badge) üreten fonksiyon
    const getStatusBadge = (status) => {
        switch (status) {
            case "Açık":
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⏳ Açık (Bekliyor)</span>;
            case "İşlemde":
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">🔄 İşlemde</span>;
            case "Çözüldü":
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✅ Çözüldü</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">{status}</span>;
        }
    };

    if (loading) return <div className="p-8 font-bold text-stone-500 animate-pulse">Talepleriniz yükleniyor...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* ÜST BÖLÜM (BAŞLIK VE BUTON) */}
            <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-stone-900">Destek Taleplerim</h1>
                    <p className="text-stone-500 text-sm mt-1">Artebase ekibiyle iletişime geçin, sorularınıza hızlı yanıt alın.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                    + Yeni Talep Oluştur
                </button>
            </div>

            {/* TALEPLER LİSTESİ */}
            {tickets.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                    <span className="text-4xl mb-4 block">👋</span>
                    <h3 className="text-lg font-bold text-stone-700">Henüz bir destek talebiniz yok</h3>
                    <p className="text-stone-500 mt-2 text-sm">Bir sorununuz olduğunda çekinmeden bize yazabilirsiniz.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {tickets.map(ticket => (
                        <div key={ticket.ticket_id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900">{ticket.subject}</h3>
                                    <p className="text-xs text-stone-400 mt-1">Talep No: #{ticket.ticket_id} • {new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <div>
                                    {getStatusBadge(ticket.status)}
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-4">
                                <p className="text-sm text-stone-700 whitespace-pre-wrap">{ticket.message}</p>
                            </div>

                            {/* EĞER ADMİN CEVAP YAZDIYSA BURASI GÖRÜNECEK */}
                            {ticket.admin_response && (
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 relative">
                                    <span className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase">Artebase Destek Ekibi</span>
                                    <p className="text-sm text-stone-800 whitespace-pre-wrap mt-2">{ticket.admin_response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* YENİ TALEP OLUŞTURMA MODALI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm antialiased">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="text-lg font-black text-stone-800">Bize Ulaşın</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Konu Başlığı</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                    required
                                >
                                    <option value="Siparişim Nerede?">Siparişim Nerede?</option>
                                    <option value="İade ve İptal">İade ve İptal İşlemleri</option>
                                    <option value="Teknik Bir Sorun Bildir">Teknik Bir Sorun Bildir</option>
                                    <option value="Sanatçı Başvurusu">Sanatçı Başvurusu</option>
                                    <option value="Diğer Sorular">Diğer Sorular</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Mesajınız</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows="5"
                                    placeholder="Size nasıl yardımcı olabiliriz? Lütfen detayları buraya yazın..."
                                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer">
                                    İptal
                                </button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md cursor-pointer">
                                    Talebi Gönder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}