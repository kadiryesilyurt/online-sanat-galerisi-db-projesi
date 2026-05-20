"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

    // 💬 Yorum, Filtreleme ve İstatistik State'leri (Madde 12, 13 & 14)
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // Varsayılan: En Yeni
    const [replyingTo, setReplyingTo] = useState(null); // Yanıtlanan yorum
    const [replyText, setReplyText] = useState("");     // Yanıt metni
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const getToday = () => new Date().toISOString().split('T')[0];
    const getOneMonthLater = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };
    const timeOptions = Array.from({ length: 10 }, (_, i) => `${(i + 12).toString().padStart(2, '0')}:00`);

    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id || payload.id || parseInt(payload.sub) || 1;
        } catch (error) { return 1; }
    };

    // 📊 YENİ: Ortalama Puan İstatistiklerini Çeken Fonksiyon
    const fetchStats = async () => {
        try {
            const resStats = await fetch(`${backendUrl}/api/reviews/event/${id}/stats`);
            if (resStats.ok) {
                const dataStats = await resStats.json();
                setStats(dataStats);
            }
        } catch (err) { console.error("İstatistikler çekilemedi:", err); }
    };

    // 🔍 YENİ: Yorumları Akıllı Filtreye Göre Çeken Motor
    const fetchReviews = async (sortParam = sortBy) => {
        try {
            const res = await fetch(`${backendUrl}/api/reviews/event/${id}?sort_by=${sortParam}`);
            if (res.ok) {
                let data = await res.json();
                
                // Kullanıcının daha önce verdiği oyları (Faydalı Bul) mavi yapmak için çekiyoruz
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const voteRes = await fetch(`${backendUrl}/api/reviews/user/my-votes`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (voteRes.ok) {
                            const myVotes = await voteRes.json();
                            data = data.map(rev => ({
                                ...rev,
                                is_voted: myVotes.includes(rev.review_id)
                            }));
                        }
                    } catch (err) { console.error("Oylar çekilemedi:", err); }
                }
                setReviews(data); 
            }
        } catch (err) { console.error("Yorumlar çekilirken hata:", err); }
    };

    // Filtreleme değiştiğinde yorumları otomatik yenile
    useEffect(() => {
        if (id) fetchReviews(sortBy);
    }, [sortBy, id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setUserId(getUserIdFromToken(token));

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

        if (id) {
            fetchEvent();
            fetchStats(); // İstatistikleri yükle
            fetchReviews(sortBy); // Yorumları yükle
        }
    }, [id, backendUrl]);

    // 💬 Atölyeye Yorum Ekleme Motoru
    const handleAddReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Atölyeyi değerlendirmek için giriş yapmalısın kanka!");
            return;
        }
        if (!comment.trim()) {
            toast.error("Değerlendirme metni boş bırakılamaz!");
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/reviews/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_type: "event", // Türünü 'event' olarak işaretliyoruz
                    item_id: parseInt(id),
                    rating: rating,
                    comment: comment
                })
            });

            if (res.ok) {
                toast.success("Atölye değerlendirmeniz başarıyla eklendi! 🎨");
                setComment("");
                setRating(5);
                fetchReviews(sortBy); // Listeyi tazele
                fetchStats();         // Ortalama puanı tazele
            } else {
                toast.error("Yorum eklenirken hata oluştu.");
            }
        } catch (err) { toast.error("Sunucu bağlantı hatası!"); }
    };

    // 👍 YENİ: Faydalı Bulma Oylaması (Madde 13)
    const handleVoteHelpful = async (reviewId) => {
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Oy vermek için giriş yapmalısın kanka!"); return; }

        const currentReview = reviews.find(r => r.review_id === reviewId);
        const isVoted = currentReview.is_voted || false; 
        const endpoint = isVoted ? "remove-helpful" : "helpful";
        const newCount = isVoted ? -1 : 1;

        // UI Optimistic Update
        setReviews(currentReviews => 
            currentReviews.map(rev => 
                rev.review_id === reviewId 
                    ? { ...rev, helpful_votes: Math.max(0, (rev.helpful_votes || 0) + newCount), is_voted: !isVoted } 
                    : rev
            )
        );

        isVoted ? toast.success("Oylaman kaldırıldı.") : toast.success("Faydalı olarak işaretlendi! 👍");

        try {
            await fetch(`${backendUrl}/api/reviews/${reviewId}/${endpoint}`, { 
                method: "POST", headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) { console.error("Oylama hatası:", err); }
    };

    // 👑 YENİ: Admin Yanıt Gönderme (Madde 14)
    const handleAdminReply = async (reviewId) => {
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Giriş yapmalısın!"); return; }
        if (!replyText.trim()) { toast.error("Yanıt boş olamaz!"); return; }

        try {
            const res = await fetch(`${backendUrl}/api/reviews/${reviewId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ reply: replyText })
            });

            if (res.ok) {
                toast.success("Yönetici yanıtı eklendi! 👑");
                setReplyingTo(null); 
                setReplyText(""); 
                fetchReviews(sortBy);
            } else { toast.error("Buna yetkin yok veya bir hata oluştu."); }
        } catch (err) { toast.error("Bağlantı hatası!"); }
    };

    const handleReservation = async () => {
        const token = localStorage.getItem("token");
        if (!token || !userId) {
            toast((t) => (
                <div className="flex flex-col gap-2 p-1">
                    <p className="font-medium text-sm">Rezervasyon yapabilmek için önce giriş yapmalısınız.</p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { toast.dismiss(t.id); router.push("/auth?mode=login"); }} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">Giriş Yap</button>
                        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition">Vazgeç</button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center',
                style: { marginTop: '30vh', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
                icon: '🔐'
            });
            return;
        }

        if (!reservationDate || !reservationTime) {
            toast.error('Lütfen rezervasyon için tarih ve saat seçimi yapın.', {
                duration: 3000,
                style: { background: '#F59E0B', color: '#fff', borderRadius: '10px' },
                icon: '📅',
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
                    style: { background: '#3B82F6', color: '#fff', borderRadius: '10px', border: '1px solid #2563EB' },
                    icon: '📅',
                });
                router.push("/panel");
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Bir hata oluştu.", { duration: 4000, icon: '❌' });
            }
        } catch (error) {
            toast.error('Sunucu ile bağlantı kurulamadı.', { duration: 5000, icon: '🌐' });
        } finally { setIsSubmitting(false); }
    };

    if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !event) return <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center"><h1 className="text-2xl font-bold text-neutral-900 mb-2">Eyvah! Etkinlik Bulunamadı.</h1><button onClick={() => router.back()} className="text-teal-600 font-bold underline mt-4">← Geri Dön</button></div>;

    return (
        <div className="bg-stone-50 min-h-screen pb-24">
            <div className="border-b border-stone-200 bg-white/50 sticky top-16 z-40 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-teal-600 transition-colors bg-white px-4 py-1.5 rounded-lg shadow-sm border border-stone-200">
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
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className="bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md">Sanat Atölyesi</span>
                                
                                {/* ⭐ ORTALAMA PUAN GÖRÜNTÜLEME ROZETİ */}
                                {stats.total_reviews > 0 && (
                                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-sm font-bold text-amber-700">
                                        <span>⭐ {stats.average_rating}</span>
                                        <span className="text-xs font-medium text-stone-400">({stats.total_reviews} Değerlendirme)</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl font-black text-neutral-900 mt-4 mb-6 leading-tight">{event.title}</h1>
                            <p className="text-neutral-600 leading-relaxed text-lg font-light">{event.description || "Bu etkinlik için detaylı açıklama girilmemiş."}</p>
                        </div>

                        {/* 💬 YORUMLAR PANELİ (MADDE 12, 13 & 14) */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 mt-8">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                                    💬 Katılımcı Yorumları ({reviews.length})
                                </h2>
                                
                                {/* 📊 AKILLI FİLTRELEME MENÜSÜ */}
                                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
                                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sırala:</span>
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => {
                                            setSortBy(e.target.value); 
                                        }}
                                        className="bg-transparent text-sm font-bold text-neutral-800 focus:outline-none cursor-pointer"
                                    >
                                        <option value="newest">En Yeni Yorumlar</option>
                                        <option value="most_helpful">En Faydalı Bulunanlar</option>
                                        <option value="highest_rated">En Yüksek Puanlılar</option>
                                    </select>
                                </div>
                            </div>

                            {/* YENİ DEĞERLENDİRME FORMU */}
                            <form onSubmit={handleAddReview} className="bg-stone-50/60 p-5 rounded-2xl border border-stone-100 mb-8">
                                <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">Atölyeyi Değerlendir</h3>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold text-neutral-500">Puanın:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" onClick={() => setRating(star)} className="text-lg active:scale-125 transition-transform">
                                                {star <= rating ? "⭐" : "☆"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Bu atölye deneyimin nasıldı kanka? Eğitmeni, ortamı ve öğrendiklerini buraya yazabilirsin..."
                                    className="w-full bg-white border border-stone-200 rounded-xl p-4 text-sm text-neutral-800 focus:outline-none focus:border-teal-500 min-h-[90px] resize-none"
                                />
                                <button type="submit" className="mt-3 px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors">
                                    Değerlendirmeyi Gönder
                                </button>
                            </form>

                            {/* DİĞER KULLANICILARIN ATÖLYE YORUMLARI */}
                            <div className="space-y-4">
                                {reviews.map((rev) => (
                                    <div key={rev.review_id} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-sm text-neutral-900">{rev.user_name || "Katılımcı"}</h4>
                                                    <div className="text-xs text-yellow-500 mt-0.5">{"⭐".repeat(rev.rating)}</div>
                                                </div>
                                                <span className="text-[10px] font-medium text-stone-400">
                                                    {new Date(rev.created_at).toLocaleDateString("tr-TR")}
                                                </span>
                                            </div>
                                            <p className="text-neutral-600 text-sm leading-relaxed mb-4">{rev.comment}</p>

                                            {/* 👑 GALERİ YÖNETİCİSİ YANITI */}
                                            {rev.admin_reply && (
                                                <div className="mb-4 mt-2 bg-teal-50/30 p-4 rounded-xl border border-teal-100">
                                                    <h5 className="text-[11px] font-black text-teal-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <span>👑</span> Atölye Sorumlusu Yanıtı
                                                    </h5>
                                                    <p className="text-sm text-teal-900 font-medium leading-relaxed">
                                                        {rev.admin_reply}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 🛠️ YÖNETİCİ YANIT YAZMA FORMU */}
                                            {replyingTo === rev.review_id ? (
                                                <div className="mb-4 mt-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                                                    <textarea 
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Yönetici olarak yanıtınızı buraya yazın..."
                                                        className="w-full text-sm p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-500 mb-2"
                                                        rows="2"
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setReplyingTo(null)} className="text-xs font-bold text-stone-500 hover:text-stone-700">İptal</button>
                                                        <button onClick={() => handleAdminReply(rev.review_id)} className="text-xs font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700">Gönder</button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* ALT KISIM (Yanıtla Butonu ve Faydalı Bul Butonu) */}
                                        <div className="flex justify-between items-center pt-3 border-t border-stone-50 mt-2">
                                            {/* Admin Yanıtla Butonu */}
                                            {!rev.admin_reply ? (
                                                <button 
                                                    onClick={() => setReplyingTo(rev.review_id)} 
                                                    className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
                                                >
                                                    👑 Yanıtla
                                                </button>
                                            ) : <div></div>}

                                            {/* 👍 FAYDALI BULMA BUTONU */}
                                            <button 
                                                onClick={() => handleVoteHelpful(rev.review_id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${rev.is_voted ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                                            >
                                                <span>{rev.is_voted ? "👍 Faydalı" : "👍 Faydalı Bul"} ({rev.helpful_votes || 0})</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {reviews.length === 0 && <p className="text-stone-400 text-sm italic text-center py-6">Bu atölyeye henüz değerlendirme yazılmamış. İlk deneyimini sen paylaş kanka!</p>}
                            </div>
                        </div>
                    </div>

                    {/* REZERVASYON PANELİ (Aynen Korundu) */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 sticky top-32">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6 border-b border-stone-100 pb-4">Rezervasyon Detayları</h3>

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