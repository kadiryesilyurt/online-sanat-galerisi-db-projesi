"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

// 📊 ETKİNLİK İSTATİSTİK DASHBOARD'U (Madde 16)
const EventStatsDashboard = ({ eventId, maxQuota }) => {
    const [stats, setStats] = useState({ total_reservations: 0, total_participants: 0, occupancy_rate: 0, average_rating: 0 });

    useEffect(() => {
        const fetchEventStats = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                const res = await fetch(`${backendUrl}/api/events/${eventId}/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) { console.error("Etkinlik istatistikleri alınamadı:", err); }
        };
        if (eventId) fetchEventStats();
    }, [eventId]);

    return (
        <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold text-neutral-600 bg-stone-50 border border-stone-100 p-3 rounded-xl my-4 shadow-inner">
            <div className="flex flex-col items-center border-r border-stone-200">
                <span className="text-stone-400 font-light text-[10px] uppercase">Doluluk</span>
                <span className="text-neutral-950 font-black mt-0.5">%{stats.occupancy_rate}</span>
                <span className="text-[9px] text-stone-400 font-normal">({stats.total_participants}/{maxQuota})</span>
            </div>
            <div className="flex flex-col items-center border-r border-stone-200">
                <span className="text-stone-400 font-light text-[10px] uppercase">Ort. Puan</span>
                <span className="text-amber-600 font-black mt-0.5">
                    {stats.average_rating > 0 ? `⭐ ${stats.average_rating}` : "⭐ -"}
                </span>
                <span className="text-[9px] text-stone-400 font-normal">Puan</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-stone-400 font-light text-[10px] uppercase">Rezervasyon</span>
                <span className="text-teal-600 font-black mt-0.5">🎟️ {stats.total_reservations}</span>
                <span className="text-[9px] text-stone-400 font-normal">İşlem</span>
            </div>
        </div>
    );
};

export default function EtkinliklerPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⚖️ KARŞILAŞTIRMA STATE'LERİ
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/events`);
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                } else {
                    console.error("Etkinlikler çekilemedi, backend hata döndürdü.");
                }
            } catch (error) {
                console.error("Kadir'in backend'ine bağlanılamadı:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [backendUrl]);

    // Tarihi gün ve ay olarak bölen yardımcı fonksiyon
    const formatDay = (dateString) => {
        if (!dateString) return "00";
        return new Date(dateString).getDate();
    };

    const formatMonth = (dateString) => {
        if (!dateString) return "AY";
        return new Date(dateString).toLocaleString('tr-TR', { month: 'short' });
    };

    // ⚖️ KARŞILAŞTIRMA LİSTESİNE EKLE/ÇIKAR FONKSİYONU
    const toggleCompare = (event) => {
        const exists = compareList.find(item => item.event_id === event.event_id);
        if (exists) {
            setCompareList(compareList.filter(item => item.event_id !== event.event_id));
        } else {
            if (compareList.length >= 3) {
                toast.error("En fazla 3 etkinlik karşılaştırabilirsiniz!");
                return;
            }
            setCompareList([...compareList, event]);
        }
    };

    // 💾 KARŞILAŞTIRMAYI VERİTABANINA KAYDETME (Madde 11)
    const handleSaveComparison = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Karşılaştırmayı kaydetmek için giriş yapmalısın kanka!");
            return;
        }

        const selectedIds = compareList.map(item => item.event_id);

        try {
            const res = await fetch(`${backendUrl}/api/users/comparisons`, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_type: "event", 
                    item_ids: selectedIds 
                })
            });

            if (res.ok) {
                toast.success("Etkinlik karşılaştırması başarıyla kaydedildi! 💾");
                setIsCompareModalOpen(false); // Modalı kapat
                setCompareList([]);          // Listeyi sıfırla
            } else {
                toast.error("Kaydedilirken bir hata oluştu.");
            }
        } catch (err) {
            toast.error("Bağlantı hatası!");
        }
    };

    return (
        <div className="bg-stone-50/40 min-h-screen pb-16 relative">

            {/* 1. ÜST BANNER */}
            <div className="bg-stone-200 text-neutral-900 py-20 px-4 border-b border-stone-300 relative overflow-hidden text-center mb-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-100/50 via-stone-200 to-stone-300 pointer-events-none"></div>

                <div className="container mx-auto max-w-3xl relative z-10">
                    <span className="bg-teal-500/10 text-teal-700 border border-teal-500/20 text-xs font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                        Yaratıcı Sanat Atölyeleri
                    </span>
                    <h1 className="text-4xl md:text-5xl font-sans font-light mt-5 tracking-wide text-neutral-950">
                        Seçkin Atölye ve <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">Etkinlikler</span>
                    </h1>
                    <p className="text-neutral-600 mt-4 text-sm md:text-base font-light max-w-xl mx-auto tracking-wide leading-relaxed">
                        Usta sanatçılarımızla sıcak bir stüdyo ortamında bir araya gelin, yeteneklerinizi keşfedin ve kendi özgün yapıtınızı tasarlayın.
                    </p>
                </div>
            </div>

            {/* 2. ETKİNLİK KARTLARI IZGARASI */}
            <div className="container mx-auto px-4 max-w-5xl">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 shadow-sm">
                        <span className="text-4xl block mb-3">🗓️</span>
                        <h3 className="text-lg font-bold text-neutral-900">Yaklaşan Etkinlik Yok</h3>
                        <p className="text-neutral-500 mt-1">Şu anda planlanmış bir atölye bulunmuyor kanka.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {events.map((event) => {
                            const isSelected = compareList.some(item => item.event_id === event.event_id);
                            
                            return (
                                <div
                                    key={event.event_id}
                                    className={`bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border transition-all duration-300 flex flex-col justify-between relative ${isSelected ? "border-teal-500 ring-2 ring-teal-500/20" : "border-stone-100 hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] hover:-translate-y-1"}`}
                                >
                                    {/* ⚖️ KARŞILAŞTIRMA CHECKBOX */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <button 
                                            onClick={() => toggleCompare(event)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isSelected ? "bg-teal-600 border-teal-600 text-white shadow-md" : "bg-white border-stone-200 text-stone-300 hover:border-teal-400 hover:text-teal-400"}`}
                                            title="Karşılaştırmak için seç"
                                        >
                                            {isSelected ? "✓" : "+"}
                                        </button>
                                    </div>

                                    {/* Üst Kısım: Detaylar ve Organik Sanatsal Tarih Rozeti */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between gap-4 mb-5">

                                            {/* Sanatsal Tarih Rozeti */}
                                            <div
                                                className="flex-shrink-0 flex flex-col items-center justify-center bg-teal-50 text-teal-700 p-3 w-16 h-16 border border-teal-100 shadow-sm"
                                                style={{ borderRadius: "55% 45% 40% 60% / 60% 40% 60% 40%" }}
                                            >
                                                <span className="text-2xl font-black tracking-tight leading-none">{formatDay(event.event_date)}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80 mt-1">{formatMonth(event.event_date)}</span>
                                            </div>

                                            {/* Başlık ve Eğitmen */}
                                            <div className="flex-1 pr-6">
                                                <h2 className="text-xl font-bold text-neutral-900 tracking-tight hover:text-teal-600 transition-colors duration-200 line-clamp-1">
                                                    {event.title}
                                                </h2>
                                                <p className="text-xs text-neutral-400 font-light mt-1 flex items-center gap-1">
                                                    <span>🎨 Kategori:</span> <span className="font-semibold text-neutral-600">Sanat Atölyesi</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Açıklama Metni */}
                                        <p className="text-neutral-600 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                            {event.description}
                                        </p>

                                        {/* 📊 YENİ: Akıllı İstatistik ve Raporlama Paneli */}
                                        <EventStatsDashboard eventId={event.event_id} maxQuota={event.quota} />
                                    </div>

                                    {/* Alt Kısım: Fiyat ve Rezervasyon Aksiyonu */}
                                    <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Katılım Bedeli</span>
                                            <span className="text-2xl font-black text-neutral-950">
                                                {event.price ? event.price.toLocaleString("tr-TR") : "0"} ₺
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/etkinlikler/${event.event_id}`)}
                                                className="bg-teal-600 text-white hover:bg-teal-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                                            >
                                                Rezervasyon Yap
                                            </button>
                                            <button
                                                onClick={() => router.push(`/etkinlikler/${event.event_id}`)}
                                                className="bg-white border border-stone-200 text-neutral-600 hover:bg-stone-50 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                                            >
                                                İncele
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ⚖️ FLOATING KARŞILAŞTIRMA BUTONU */}
            {compareList.length > 0 && (
                <div className="fixed bottom-8 right-8 z-40">
                    <button 
                        onClick={() => setIsCompareModalOpen(true)}
                        className="bg-neutral-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 hover:bg-teal-600 transition-colors animate-bounce-short"
                    >
                        <span className="bg-white text-neutral-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">{compareList.length}</span>
                        Etkinlikleri Karşılaştır
                    </button>
                </div>
            )}

            {/* ⚖️ ETKİNLİK KARŞILAŞTIRMA MODALI */}
            {isCompareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        
                        {/* BAŞLIK */}
                        <div className="flex justify-between items-center p-6 border-b border-stone-100 shrink-0">
                            <h3 className="text-xl font-black text-neutral-900">Etkinlik Karşılaştırması</h3>
                            <button onClick={() => setIsCompareModalOpen(false)} className="text-stone-400 hover:text-red-500 text-3xl leading-none font-light cursor-pointer">&times;</button>
                        </div>

                        {/* İÇERİK */}
                        <div className="p-6 flex flex-col md:flex-row gap-6 justify-center overflow-y-auto bg-stone-50/30">
                            {compareList.map(item => (
                                <div key={`comp-${item.event_id}`} className="flex-1 bg-white rounded-xl p-5 border border-stone-100 shadow-sm relative">
                                    <button 
                                        onClick={() => toggleCompare(item)} 
                                        className="absolute top-2 right-2 w-6 h-6 bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 rounded-full flex items-center justify-center text-xs transition-colors"
                                    >
                                        ✕
                                    </button>
                                    <img src={item.image_url || "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800"} className="w-full h-40 object-cover rounded-lg mb-4" />
                                    <h4 className="font-bold text-lg text-neutral-900 leading-tight border-b border-stone-100 pb-3">{item.title}</h4>

                                    {/* ETKİNLİK ÖZELLİKLERİ (Tarih, Kontenjan, Ücret) */}
                                    <div className="mt-3 space-y-3 text-sm">
                                        <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                                            <span className="text-stone-500 font-medium">Tarih</span>
                                            <span className="font-bold text-neutral-800">{new Date(item.event_date).toLocaleDateString("tr-TR") || "Belirtilmemiş"}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                                            <span className="text-stone-500 font-medium">Kontenjan</span>
                                            <span className="font-bold text-neutral-800">{item.quota} Kişi</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-teal-50/50 p-2 rounded-lg border border-teal-100/50">
                                            <span className="text-teal-700 font-medium">Katılım Bedeli</span>
                                            <span className="font-black text-teal-600 text-lg">{item.price.toLocaleString("tr-TR")} ₺</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 💾 KAYDET BUTONU BÖLÜMÜ */}
                        <div className="p-6 border-t border-stone-100 bg-white rounded-b-2xl flex justify-between items-center shrink-0">
                            <p className="text-xs text-stone-400 max-w-xs">Karşılaştırma sonuçlarını kaydederek daha sonra profilinizden inceleyebilirsiniz.</p>
                            <button 
                                onClick={handleSaveComparison}
                                className="px-6 py-3 bg-neutral-900 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                                <span className="text-lg">💾</span> Sonuçları Kaydet
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}