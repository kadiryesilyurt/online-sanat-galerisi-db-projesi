"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

// Her bir eser kartı için yıldız istatistiklerini çeken alt bileşen (Madde 13)
// Her bir eser kartı için istatistikleri (Yorum, Beğeni, Görüntülenme) çeken alt bileşen
const ArtworkRatingStats = ({ artworkId }) => {
    const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });
    const [extraStats, setExtraStats] = useState({ view_count: 0, like_count: 0 });

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                
                // 1. Yorum İstatistiklerini Çek
                const reviewRes = await fetch(`${backendUrl}/api/reviews/artwork/${artworkId}/stats`);
                if (reviewRes.ok) setReviewStats(await reviewRes.json());

                // 2. Beğeni ve Görüntülenme İstatistiklerini Çek
                const extraRes = await fetch(`${backendUrl}/api/artworks/${artworkId}/stats`);
                if (extraRes.ok) setExtraStats(await extraRes.json());
                
            } catch (err) { console.error("İstatistikler çekilemedi:", err); }
        };
        if (artworkId) fetchAllStats();
    }, [artworkId]);

    return (
        <div className="flex flex-col gap-1.5 items-end">
            {/* Yıldız ve Yorum */}
            {reviewStats.total_reviews > 0 ? (
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shadow-sm">
                    <span className="text-xs text-amber-500">⭐ {reviewStats.average_rating}</span>
                    <span className="text-[10px] font-medium text-amber-700">({reviewStats.total_reviews})</span>
                </div>
            ) : (
                <span className="text-[11px] text-gray-400 italic">Henüz yorum yok</span>
            )}
            
            {/* Beğeni ve Görüntülenme (Vitrin Özelliği) */}
            <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                    ❤️ {extraStats.like_count}
                </span>
                <span className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    👁️ {extraStats.view_count}
                </span>
            </div>
        </div>
    );
};

export default function ExplorePage() { // Klasörle bağlantılı nizamî bileşen ismi yapıldı!
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                const response = await fetch(`${backendUrl}/api/artworks`);
                if (response.ok) {
                    const data = await response.json();
                    setArtworks(data);
                }
            } catch (error) {
                console.error("Backend'e bağlanılamadı kanka:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtworks();
    }, []);

    const categories = ["Tümü", "Tablo", "Heykel", "Dijital Sanat", "Fotoğraf"];

    const filteredArtworks = artworks.filter((artwork) => {
        const matchesCategory = selectedCategory === "Tümü" || artwork.category === selectedCategory;
        const artistName = artwork.artist_name || "";
        const matchesSearch =
            artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artistName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddFavorite = async (e, artworkId) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyFavorite = favorites.includes(artworkId);

        if (isCurrentlyFavorite) {
            setFavorites(favorites.filter(id => id !== artworkId));
        } else {
            setFavorites([...favorites, artworkId]);
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error('Eserleri favorilerinize eklemek için lütfen önce giriş yapın.', {
                    duration: 3000,
                    style: {
                        background: '#3B82F6',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    icon: '👤',
                });
                if (isCurrentlyFavorite) setFavorites([...favorites, artworkId]);
                else setFavorites(favorites.filter(id => id !== artworkId));
                return;
            }

            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ artwork_id: artworkId }),
            });

            if (!response.ok) {
                if (isCurrentlyFavorite) setFavorites([...favorites, artworkId]);
                else setFavorites(favorites.filter(id => id !== artworkId));
            }
        } catch (error) {
            console.error("Sunucuya ulaşılamadı.");
        }
    };

    const toggleCompare = (artwork) => {
        const isAlreadyInList = compareList.some(item => item.artwork_id === artwork.artwork_id);

        if (isAlreadyInList) {
            setCompareList(compareList.filter(item => item.artwork_id !== artwork.artwork_id));
        } else {
            if (compareList.length >= 3) {
                toast.error('Karşılaştırma yapmak için en fazla 3 eser seçebilirsiniz.', {
                    duration: 3500,
                    style: {
                        background: '#F59E0B',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    icon: '⚖️',
                });
                return;
            }
            setCompareList([...compareList, artwork]);
        }
    };

const handleSaveComparison = async () => {
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Giriş yapmalısın kanka!"); return; }

        const selectedIds = compareList.map(item => item.artwork_id);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

        try {
            const res = await fetch(`${backendUrl}/api/users/comparisons`, { 
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ item_type: "artwork", item_ids: selectedIds })
            });
            if (res.ok) {
                toast.success("Eser karşılaştırması profilinize kaydedildi! 💾");
                setIsCompareModalOpen(false);
                setCompareList([]);
            } else { toast.error("Kaydedilirken hata oluştu."); }
        } catch (err) { toast.error("Bağlantı hatası!"); }
    };

    return (
        <div className="bg-gray-50 min-h-screen relative">
            {/* HERO BANNER */}
            <div className="bg-neutral-950 text-white py-24 px-4 border-b border-neutral-900 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none"></div>
                <div className="container mx-auto max-w-3xl relative z-10">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">Seçkin Dijital Sergi</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-light mt-5 tracking-wide text-neutral-100 leading-tight">
                        Ruhunuza Dokunan <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">Eserleri</span> Keşfedin
                    </h1>
                </div>
            </div>

            {/* ARAMA BARU */}
            <div className="container mx-auto px-4 relative z-20 -mt-7">
                <div className="max-w-lg mx-auto bg-white rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 flex items-center">
                    <input
                        type="text"
                        placeholder="Eser, sanatçı veya tarz arayın..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 bg-transparent text-gray-800 text-sm focus:outline-none"
                    />
                </div>
            </div>

            {/* KATEGORİ SEÇİM BUTONLARI */}
            <div className="container mx-auto px-4 mt-6">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${selectedCategory === category ? "bg-indigo-600 text-white shadow-indigo-200 shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRID İÇERİĞİ */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm font-semibold text-gray-500">
                        {loading ? "Eserler yükleniyor..." : `${filteredArtworks.length} eser listeleniyor`}
                    </p>

                    <button
                        onClick={() => {
                            if (compareList.length < 2) {
                                toast.error('Karşılaştırma yapabilmek için en alta en az 2 eser seçmelisiniz.', {
                                    duration: 3000,
                                    style: { background: '#F59E0B', color: '#fff', borderRadius: '10px' },
                                    icon: '⚖️',
                                });
                            } else {
                                setIsCompareModalOpen(true);
                            }
                        }}
                        className={`text-xs font-bold px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${compareList.length > 0 ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700" : "bg-indigo-50 text-indigo-400"}`}
                    >
                        📊 Eserleri Karşılaştır {compareList.length > 0 && <span className="bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px]">{compareList.length}</span>}
                    </button>
                </div>

                {!loading && filteredArtworks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-4xl block mb-2">🎨</span><p className="text-gray-500">Aradığınız kriterlere uygun eser bulunamadı.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArtworks.map((artwork) => {
                            const isFavorite = favorites.includes(artwork.artwork_id);
                            const isCompared = compareList.some(item => item.artwork_id === artwork.artwork_id);

                            return (
                                <div key={artwork.artwork_id} className={`bg-white rounded-xl shadow-md overflow-hidden relative group border-2 transition-all duration-300 flex flex-col justify-between ${isCompared ? "border-indigo-500 shadow-indigo-100" : "border-transparent"}`}>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => handleAddFavorite(e, artwork.artwork_id)}
                                            className={`absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-md transition-all duration-200 text-sm cursor-pointer ${isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-500"}`}
                                        >
                                            {isFavorite ? "❤️" : "🤍"}
                                        </button>

                                        <button
                                            onClick={() => toggleCompare(artwork)}
                                            className={`absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1.5 rounded-full shadow-md cursor-pointer transition-all ${isCompared ? "bg-indigo-600 text-white" : "bg-white/90 text-gray-600 hover:bg-indigo-50"}`}
                                        >
                                            {isCompared ? "✓ Seçildi" : "+ Karşılaştır"}
                                        </button>

                                        <span className="absolute bottom-4 left-4 z-10 bg-gray-900/70 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                                            {artwork.category || "Genel"}
                                        </span>

                                        <div className="h-64 overflow-hidden bg-gray-100">
                                            {artwork.image_url ? (
                                                <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🖼️</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h2 className="text-xl font-bold text-gray-900 truncate flex-1">{artwork.title}</h2>
                                                {/* ⭐ YENİ: ORTALAMA YILDIZ VE YORUM SAYISI (Madde 13) */}
                                                <ArtworkRatingStats artworkId={artwork.artwork_id} />
                                            </div>
                                            <p className="text-gray-500 text-sm">Sanatçı: <span className="font-semibold text-gray-700">{artwork.artist_name || "Bilinmiyor"}</span></p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div>
                                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</span>
                                                <span className="text-2xl font-black text-gray-950">{artwork.price ? artwork.price.toLocaleString("tr-TR") : "0"} ₺</span>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/artworks/${artwork.artwork_id}`)}
                                                    className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-bold text-xs shadow-sm cursor-pointer"
                                                >
                                                    İncele
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* KARŞILAŞTIRMA MODALI */}
            {isCompareModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        
                        {/* BAŞLIK */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10 shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">Eser Karşılaştırması</h3>
                            <button onClick={() => setIsCompareModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold cursor-pointer">×</button>
                        </div>

                        {/* İÇERİK */}
                        <div className="p-6 flex flex-col md:flex-row gap-6 justify-center overflow-y-auto bg-stone-50/30 flex-1">
                            {compareList.map(item => (
                                <div key={`comp-${item.artwork_id}`} className="flex-1 bg-white rounded-xl p-4 border border-gray-100 relative h-fit">
                                    <img src={item.image_url} className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm" />
                                    <h4 className="font-bold text-lg text-gray-900 leading-tight">{item.title}</h4>

                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Sanatçı</span>
                                            <span className="font-semibold">{item.artist_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Kategori</span>
                                            <span className="font-semibold">{item.category}</span>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-gray-500">Fiyat</span>
                                            <span className="font-black text-indigo-600 text-lg">{item.price ? item.price.toLocaleString("tr-TR") : "0"} ₺</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 💾 KAYDET BUTONU */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 z-10 shrink-0 flex justify-between items-center">
                            <p className="text-xs text-gray-500 max-w-xs font-medium">Karşılaştırma sonuçlarını kaydederek profilinizden inceleyebilirsiniz.</p>
                            <button
                                onClick={handleSaveComparison}
                                className="px-6 py-3 bg-neutral-900 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
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