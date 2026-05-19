"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EtkinliklerPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                // Kadir'in backend'indeki route'a gidiyoruz
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
    }, []);

    // Tarihi gün ve ay olarak bölen yardımcı fonksiyon (Senin rozet tasarımın için)
    const formatDay = (dateString) => {
        if (!dateString) return "00";
        return new Date(dateString).getDate();
    };

    const formatMonth = (dateString) => {
        if (!dateString) return "AY";
        return new Date(dateString).toLocaleString('tr-TR', { month: 'short' });
    };

    return (
        <div className="bg-stone-50/40 min-h-screen pb-16">

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
                        {events.map((event) => (
                            <div
                                key={event.event_id}
                                className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-stone-100 overflow-hidden hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                            >
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
                                        <div className="flex-1">
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

                                    {/* Alt Bilgi Çubuğu (Saat ve Kontenjan) */}
                                    {/* Alt Bilgi Çubuğu (Sadece Kontenjan Kaldı) */}
                                    <div className="flex items-center justify-center text-xs font-semibold text-neutral-600 bg-stone-50 border border-stone-100 p-3.5 rounded-xl">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">👥</span>
                                            <span className="font-normal tracking-wide">Kontenjan: <strong className="font-bold text-neutral-950">{event.quota} Kişi</strong></span>
                                        </div>
                                    </div>
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
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}