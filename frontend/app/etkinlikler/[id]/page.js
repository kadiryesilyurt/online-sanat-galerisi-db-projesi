"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
export default function EtkinlikDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(null);

    // Rezervasyon State'leri
    const [participants, setParticipants] = useState(1);
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    // Tarih ve saat sınırları için yardımcılar
    const getToday = () => new Date().toISOString().split('T')[0];
    const getOneMonthLater = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };
    // 12:00 - 21:00 arası saatler
    const timeOptions = Array.from({ length: 10 }, (_, i) => `${(i + 12).toString().padStart(2, '0')}:00`);

    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id || payload.id || parseInt(payload.sub) || 1;
        } catch (error) {
            return 1;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setUserId(getUserIdFromToken(token));
        }

        const fetchEvent = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/events/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    setError("Etkinlik bulunamadı kanka.");
                }
            } catch (err) {
                setError("Kadir'in backend'ine bağlanılamadı.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchEvent();
    }, [id, backendUrl]);

    const handleReservation = async () => {
        const token = localStorage.getItem("token");
        if (!token || !userId) {
            toast((t) => (
                <div className="flex flex-col gap-2 p-1">
                    <p className="font-medium text-sm">Rezervasyon yapabilmek için önce giriş yapmalısınız.</p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                router.push("/auth?mode=login");
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                            Giriş Yap
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition"
                        >
                            Vazgeç
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center',
                style: {
                    marginTop: '30vh',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                },
                icon: '🔐'
            });
            return;
        }

        if (!reservationDate || !reservationTime) {
            toast.error('Lütfen rezervasyon için tarih ve saat seçimi yapın.', {
                duration: 3000,
                style: {
                    background: '#F59E0B', // Uyarılar için Amber/Sarı tonu
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '📅', // Tarih ve saat seçimi temalı ikon
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendUrl}/api/panel/reservations/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    event_id: parseInt(id),
                    reservation_date: reservationDate,
                    reservation_time: reservationTime,
                    participant_count: participants
                }),
            });

            if (response.ok) {
                toast.success('Rezervasyonunuz başarıyla oluşturuldu.', {
                    duration: 4000,
                    style: {
                        background: '#3B82F6', // Rezervasyonlar için "Mavi" kurumsal bir ton
                        color: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #2563EB',
                    },
                    icon: '📅', // Etkinlik/Rezervasyon temasına uygun ikon
                });
                router.push("/panel");
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.", {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    icon: '❌',
                });
            }
        } catch (error) {
            toast.error('Sunucu ile bağlantı kurulamadı. Lütfen internetinizi veya sunucunun aktif olduğunu kontrol edin.', {
                duration: 5000, // Hata mesajı olduğu için kullanıcının okuması için biraz daha uzun kalsın
                style: {
                    background: '#EF4444', // Hata için canlı kırmızı
                    color: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #B91C1C',
                },
                icon: '🌐', // Bağlantı/Sunucu temalı ikon
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>;

    if (error || !event) return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Eyvah! Etkinlik Bulunamadı.</h1>
            <button onClick={() => router.back()} className="text-teal-600 font-bold underline mt-4">← Geri Dön</button>
        </div>
    );

    return (
        <div className="bg-stone-50 min-h-screen pb-24">
            <div className="border-b border-stone-200 bg-white/50 sticky top-16 z-40 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-teal-600 transition-colors bg-white px-4 py-1.5 rounded-lg shadow-sm border border-stone-200 cursor-pointer">
                        <span>←</span> Geri Dön
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="w-full lg:w-3/5 space-y-8">
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-100 bg-white">
                            <img src={event.image_url || "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800"} alt={event.title} className="w-full h-[50vh] object-cover" />
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                            <span className="bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md">Sanat Atölyesi</span>
                            <h1 className="text-4xl font-black text-neutral-900 mt-4 mb-6 leading-tight">{event.title}</h1>
                            <p className="text-neutral-600 leading-relaxed text-lg font-light">{event.description || "Bu etkinlik için detaylı açıklama girilmemiş."}</p>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/5">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 sticky top-32">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6 border-b border-stone-100 pb-4">Rezervasyon Detayları</h3>

                            {/* TARİH VE SAAT SEÇİMİ */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Tarih Seçimi</label>
                                    <input
                                        type="date"
                                        min={getToday()}
                                        max={getOneMonthLater()}
                                        onChange={(e) => setReservationDate(e.target.value)}
                                        className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Saat Seçimi</label>
                                    <select
                                        onChange={(e) => setReservationTime(e.target.value)}
                                        className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                    >
                                        <option value="">Saat Seçin</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-neutral-700 mb-3">Katılımcı Sayısı</label>
                                <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-2">
                                    <button onClick={() => setParticipants(Math.max(1, participants - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm font-black text-xl hover:text-teal-600 transition-colors cursor-pointer">-</button>
                                    <span className="text-2xl font-black text-neutral-900">{participants}</span>
                                    <button onClick={() => setParticipants(Math.min(event.quota, participants + 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm font-black text-xl hover:text-teal-600 transition-colors cursor-pointer">+</button>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2 text-center">Kalan Kontenjan: <strong className="text-neutral-700">{event.quota} Kişi</strong></p>
                            </div>

                            <div className="border-t border-stone-100 pt-6">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Toplam Tutar</span>
                                    <span className="text-4xl font-black text-teal-600">{(event.price * participants).toLocaleString("tr-TR")} ₺</span>
                                </div>
                                <button onClick={handleReservation} disabled={isSubmitting || event.quota < 1} className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all duration-200 cursor-pointer ${event.quota > 0 ? "bg-neutral-900 text-white hover:bg-teal-600 active:scale-95" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
                                    {isSubmitting ? "İşleniyor..." : (event.quota > 0 ? "Rezervasyonu Onayla" : "Kontenjan Dolu")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}