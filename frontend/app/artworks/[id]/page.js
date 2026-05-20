"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";
import toast from 'react-hot-toast';

export default function ArtworkDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);

    // 💬 Yorum, Filtreleme ve İstatistik State'leri (Madde 12 & 13)
    const [reviews, setReviews] = useState([]);
    const [sortBy, setSortBy] = useState("newest"); // Varsayılan: En Yeni
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    
    // 👑 Yönetici Yanıt State'leri (Madde 14)
    const [replyingTo, setReplyingTo] = useState(null); // Hangi yorum ID'sine yanıt yazıldığını tutar
    const [replyText, setReplyText] = useState("");     // Yönetici yanıtının metnini tutar
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    // 🔍 Yorumları Akıllı Filtreye Göre Çeken Motor (Madde 13)
    const fetchReviews = async (sortParam = sortBy) => {
        try {
            // 1. Tüm yorumları çek
            const res = await fetch(`${backendUrl}/api/reviews/artwork/${id}?sort_by=${sortParam}`);
            
            if (res.ok) {
                let data = await res.json();
                
                // 2. Kullanıcı giriş yapmış mı kontrol et
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        // 3. Kullanıcının daha önce oy verdiği yorumların ID'lerini çek
                        const voteRes = await fetch(`${backendUrl}/api/reviews/user/my-votes`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        
                        if (voteRes.ok) {
                            const myVotes = await voteRes.json(); // Örn: [1, 5, 12]
                            
                            // 4. Gelen yorumlarla senin oylarını eşleştir (Mavi butonları geri getir)
                            data = data.map(rev => ({
                                ...rev,
                                is_voted: myVotes.includes(rev.review_id)
                            }));
                        }
                    } catch (err) {
                        console.error("Kullanıcı oyları çekilirken hata:", err);
                    }
                }
                
                // 5. Ekrana bas
                setReviews(data); 
            }
        } catch (err) { 
            console.error("Filtreleme hatası:", err); 
        }
    };

    // Sıralama değiştiğinde tetiklenecek efekt:
    useEffect(() => {
        fetchReviews(sortBy);
    }, [sortBy]); // Sadece sıralama değişince tekrar çek

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/artworks/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setArtwork(data);
                } else {
                    setError("Eser bulunamadı veya kaldırılmış olabilir.");
                }
            } catch (err) {
                setError("Kadir'in backend'ine bağlanılamadı.");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchArtwork();
            fetchReviews();
        }
    }, [id]);

    const handleAddReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Yorum yapmak için giriş yapmalısın kanka!");
            return;
        }
        if (!comment.trim()) {
            toast.error("Yorum metni boş bırakılamaz!");
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
                    item_type: "artwork",
                    item_id: parseInt(id),
                    rating: rating,
                    comment: comment
                })
            });

            if (res.ok) {
                toast.success("Değerlendirmeniz başarıyla eklendi! 🎉");
                setComment("");
                setRating(5);
                fetchReviews();
            } else {
                toast.error("Yorum eklenirken bir hata oluştu.");
            }
        } catch (err) { toast.error("Sunucu bağlantı hatası!"); }
    };

    const handleVoteHelpful = async (reviewId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Oy vermek için giriş yapmalısın kanka!");
            return;
        }

        // Tıklanan yorumu diziden bul
        const currentReview = reviews.find(r => r.review_id === reviewId);
        
        // Yorum daha önce oylandı mı? (localStorage yerine stateteki veriyi kullanıyoruz)
        const isVoted = currentReview.is_voted || false; 
        
        // Uca karar ver
        const endpoint = isVoted ? "remove-helpful" : "helpful";
        const newCount = isVoted ? -1 : 1;

        // 1. UI'da anında güncelle (Optimistic Update)
        setReviews(currentReviews => 
            currentReviews.map(rev => 
                rev.review_id === reviewId 
                    ? { 
                        ...rev, 
                        helpful_votes: Math.max(0, (rev.helpful_votes || 0) + newCount),
                        is_voted: !isVoted // Tıklanınca durumu tam tersine çevir
                      } 
                    : rev
            )
        );

        if (isVoted) {
            toast.success("Oylaman kaldırıldı.");
        } else {
            toast.success("Yorum faydalı olarak işaretlendi! 👍");
        }

        // 2. Backend'e bildir
        try {
            await fetch(`${backendUrl}/api/reviews/${reviewId}/${endpoint}`, { 
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}` 
                }
            });
        } catch (err) { 
            console.error("Oylama sırasında hata:", err); 
        }
    };

    // 👑 Yönetici Yanıt Fonksiyonu
    const handleAdminReply = async (reviewId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Giriş yapmalısın!");
            return;
        }
        if (!replyText.trim()) {
            toast.error("Yanıt boş olamaz!");
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/reviews/${reviewId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText })
            });

            if (res.ok) {
                toast.success("Yönetici yanıtı başarıyla eklendi! 👑");
                setReplyingTo(null); // Formu kapat
                setReplyText("");    // Metni temizle
                fetchReviews();      // Yorumları yenile ki yeni yanıt ekranda görünsün
            } else {
                toast.error("Buna yetkin yok veya bir hata oluştu.");
            }
        } catch (err) {
            toast.error("Sunucu bağlantı hatası!");
        }
    };

    const handleAddFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Favorilere eklemek için giriş yap kanka!");
            router.push("/auth?mode=login");
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ artwork_id: parseInt(id) }),
            });
            if (response.ok) setIsFavorite(!isFavorite);
        } catch (error) { console.error(error); }
    };

    const handlePurchase = async (method) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/orders/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    item_type: "art",
                    item_id: parseInt(id),
                    payment_method: method,
                    total_price: artwork.price
                })
            });
            if (response.ok) {
                toast.success('Harika bir seçim! Eser başarıyla satın alındı.', { duration: 4000, icon: '🖼️' });
                setIsModalOpen(false);
                router.push("/panel");
            } else { alert("Ödeme hatası."); }
        } catch (err) { alert("Sunucu hatası."); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !artwork) return <div className="min-h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-bold">Eyvah! Eser Bulunamadı.</h1><button onClick={() => router.back()} className="text-indigo-600 font-bold underline mt-4 cursor-pointer">← Geri Dön</button></div>;

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* STICKY TOP BAR */}
            <div className="border-b border-gray-100 bg-gray-50/50 sticky top-16 z-40 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors bg-white px-4 py-1.5 rounded-lg shadow-sm border border-gray-200">← Geri Dön</button>
                    <div className="hidden md:flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Link href="/" className="hover:text-indigo-600">Galeri</Link>
                        <span className="mx-3 opacity-30">/</span>
                        <span>{artwork.category || "Kategori Yok"}</span>
                        <span className="mx-3 opacity-30">/</span>
                        <span className="text-gray-900 truncate max-w-[200px]">{artwork.title}</span>
                    </div>
                </div>
            </div>

            {/* DEV GÖRSEL VE BİLGİLER */}
            <div className="container mx-auto px-4 py-10 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
                    <div className="w-full lg:w-1/2 xl:w-3/5">
                        <div className="sticky top-32 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl relative group border border-gray-100">
                            <button onClick={handleAddFavorite} className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-lg"><span className="text-2xl">{isFavorite ? "❤️" : "🤍"}</span></button>
                            {artwork.image_url ? <img src={artwork.image_url} alt={artwork.title} className="w-full h-auto max-h-[80vh] object-cover" /> : <div className="w-full h-[60vh] flex items-center justify-center text-6xl opacity-20">🖼️</div>}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col py-4">
                        <div className="mb-4 flex gap-3">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md">Orijinal Eser</span>
                            {artwork.stock_status > 0 && <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-md">Stokta Var</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{artwork.title}</h1>
                        <p className="text-lg text-gray-500 font-medium mb-8">Eser Sahibi: <span className="font-bold text-gray-900">{artwork.artist_name || "Bilinmiyor"}</span></p>

                        <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl mb-10 shadow-sm flex justify-between items-center">
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Eser Bedeli</span>
                                <span className="text-4xl font-black text-gray-900">{artwork.price ? artwork.price.toLocaleString("tr-TR") : "0"} ₺</span>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} disabled={artwork.stock_status <= 0} className={`px-8 py-4 rounded-xl font-black text-lg shadow-lg ${artwork.stock_status > 0 ? "bg-gray-900 text-white hover:bg-indigo-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>{artwork.stock_status > 0 ? "Satın Al" : "Tükendi"}</button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-6 h-px bg-indigo-600"></span> Eserin Hikayesi</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">{artwork.description || "Bu eser için henüz detaylı bir hikaye girilmemiş kanka."}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-3">👤 {artwork.artist_name || "Sanatçı"} Hakkında</h3>
                                <p className="text-gray-700 text-sm">{artwork.artist_biography || "Sanatçının biyografisi çok yakında burada olacak!"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 💬 YORUMLAR PANELİ (MADDE 12 & 13) */}
                <div className="mt-16 border-t border-gray-100 pt-12 max-w-4xl">
                    
                    {/* YORUM BAŞLIĞI VE AKILLI FİLTRELEME MENÜSÜ */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">💬 Kullanıcı Değerlendirmeleri ({reviews.length})</h2>
                        
                        {/* 📊 AKILLI FİLTRELEME SELECT BOX */}
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sırala:</span>
                            <select 
                                value={sortBy} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSortBy(value); 
                                    fetchReviews(value); 
                                }}
                                className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer"
                            >
                                <option value="newest">En Yeni Yorumlar</option>
                                <option value="most_helpful">En Faydalı Bulunanlar</option>
                            </select>
                        </div>
                    </div>

                    {/* YORUM YAZMA FORMU */}
                    <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Eseri Değerlendir ve Yorum Yap</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-semibold text-gray-500">Puanın:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setRating(star)} className="text-xl transition-transform active:scale-125">
                                        {star <= rating ? "⭐" : "☆"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Bu harika parça hakkında ne düşünüyorsun kanka? Görüşlerini buraya yaz..."
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                        />
                        <button type="submit" className="mt-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">Yorumu Gönder</button>
                    </form>

                    {/* LİSTELENEN YORUMLAR */}
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div key={rev.review_id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{rev.user_name || "Kullanıcı"}</h4>
                                            <div className="text-xs text-yellow-500 mt-0.5">{"⭐".repeat(rev.rating)}</div>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400">{new Date(rev.created_at).toLocaleDateString("tr-TR")}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{rev.comment}</p>
                                    
                                    {/* 👑 GALERİ YÖNETİCİSİ YANITI */}
                                    {rev.admin_reply && (
                                        <div className="mb-4 mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                            <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <span>👑</span> Galeri Yöneticisi Yanıtı
                                            </h5>
                                            <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                                {rev.admin_reply}
                                            </p>
                                        </div>
                                    )}

                                    {/* 🛠️ YÖNETİCİ YANIT YAZMA FORMU */}
                                    {replyingTo === rev.review_id ? (
                                        <div className="mb-4 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                            <textarea 
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Yönetici olarak yanıtınızı buraya yazın..."
                                                className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 mb-2"
                                                rows="2"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setReplyingTo(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700">İptal</button>
                                                <button onClick={() => handleAdminReply(rev.review_id)} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Gönder</button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* ALT KISIM (Yanıtla Butonu ve Faydalı Bul Butonu) */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-4">
                                    
                                    {/* 👑 YANITLA BUTONU (Sadece henüz yanıt verilmemişse görünür) */}
                                    {!rev.admin_reply ? (
                                        <button 
                                            onClick={() => setReplyingTo(rev.review_id)} 
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                        >
                                            👑 Yanıtla
                                        </button>
                                    ) : <div></div>}

                                    {/* 👍 FAYDALI BULMA BUTONU */}
                                    <button 
                                        onClick={() => handleVoteHelpful(rev.review_id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${rev.is_voted ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                                    >
                                        <span>{rev.is_voted ? "👍 Faydalı" : "👍 Faydalı Bul"} ({rev.helpful_votes || 0})</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {reviews.length === 0 && <p className="text-gray-400 text-sm italic text-center py-6">Bu esere henüz yorum yapılmamış. İlk yorumu sen yap kanka!</p>}
                    </div>
                </div>
            </div>

            <CheckoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} artwork={artwork} onConfirm={handlePurchase} />
        </div>
    );
}