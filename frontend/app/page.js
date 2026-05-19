"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Yönlendirme için ekledik

export default function HomePage() {
    const router = useRouter(); // İncele butonuna basınca sayfaya gitmek için
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // YENİ: Favoriye alınanların ID'sini tuttuğumuz liste (Kalpleri kırmızı yapmak için)
    const [favorites, setFavorites] = useState([]);

    // YENİ: Karşılaştırma için seçilen eserlerin listesi ve Modal durumu
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

    // 1. FAVORİLERE EKLEME MOTURU (Görsel Tepki Eklendi)
    // 1. FAVORİLERE EKLEME MOTORU (Instagram Mantığı - Anında Kırmızı Olur)
    // 1. FAVORİLERE EKLEME MOTORU (Kimlik Doğrulamalı)
    const handleAddFavorite = async (e, artworkId) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyFavorite = favorites.includes(artworkId);

        // BEKLEMEDEN ANINDA KALBİ BOYUYORUZ (Kullanıcıya şov yapıyoruz)
        if (isCurrentlyFavorite) {
            setFavorites(favorites.filter(id => id !== artworkId));
        } else {
            setFavorites([...favorites, artworkId]);
        }

        // Arka planda sessizce backend'e bildiriyoruz
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

            // 🚀 İŞTE KRİTİK NOKTA: Tarayıcıdan giriş yaparken aldığımız Token'ı çekiyoruz
            const token = localStorage.getItem("token");
            console.log("🔥 Gönderilen Token:", token);

            if (!token) {
                alert("Eserleri favoriye eklemek için önce giriş yapmalısın kanka!");
                // Giriş yapmamışsa kalbi geri eski haline getiriyoruz
                if (isCurrentlyFavorite) setFavorites([...favorites, artworkId]);
                else setFavorites(favorites.filter(id => id !== artworkId));
                return;
            }

            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // 🔐 Güvenlik kapısını açan anahtarı ekledik!
                },
                // Kadir'in şeması (FavoriteCreate) sadece artwork_id bekliyor, fazlalıkları sildik
                body: JSON.stringify({ artwork_id: artworkId }),
            });

            // Eğer backend 404, 401 veya 422 hatası verirse kalbi çaktırmadan geri alıyoruz
            if (!response.ok) {
                console.error("Backend'e kaydedilemedi, işlem geri alınıyor.");
                if (isCurrentlyFavorite) {
                    setFavorites([...favorites, artworkId]);
                } else {
                    setFavorites(favorites.filter(id => id !== artworkId));
                }
            }
        } catch (error) {
            console.error("Sunucuya ulaşılamadı.");
        }
    };
    // 2. KARŞILAŞTIRMA LİSTESİNE EKLEME/ÇIKARMA MOTORU
    const toggleCompare = (artwork) => {
        const isAlreadyInList = compareList.some(item => item.artwork_id === artwork.artwork_id);

        if (isAlreadyInList) {
            // Varsa çıkar
            setCompareList(compareList.filter(item => item.artwork_id !== artwork.artwork_id));
        } else {
            // Yoksa ekle (Maksimum 3 eser sınırlandıralım ki ekran patlamasın)
            if (compareList.length >= 3) {
                alert("Karşılaştırmak için en fazla 3 eser seçebilirsin kanka!");
                return;
            }
            setCompareList([...compareList, artwork]);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen relative">

            {/* HERO VE ARAMA ÇUBUĞU (Aynı Bıraktım) */}
            <div className="bg-neutral-950 text-white py-24 px-4 border-b border-neutral-900 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none"></div>
                <div className="container mx-auto max-w-3xl relative z-10">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">Seçkin Dijital Sergi</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-light mt-5 tracking-wide text-neutral-100 leading-tight">
                        Ruhunuza Dokunan <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">Eserleri</span> Keşfedin
                    </h1>
                </div>
            </div>

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

            {/* ESERLERİN LİSTELENDİĞİ GRID YAPISI */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm font-semibold text-gray-500">
                        {loading ? "Eserler yükleniyor..." : `${filteredArtworks.length} eser listeleniyor`}
                    </p>

                    {/* KARŞILAŞTIRMA BUTONU (Seçili Eser Varsa Aktifleşir) */}
                    <button
                        onClick={() => {
                            if (compareList.length < 2) alert("Karşılaştırma için en az 2 eser seçmelisin kanka!");
                            else setIsCompareModalOpen(true);
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
                            // Kalp durumu ve karşılaştırma durumunu kontrol ediyoruz
                            const isFavorite = favorites.includes(artwork.artwork_id);
                            const isCompared = compareList.some(item => item.artwork_id === artwork.artwork_id);

                            return (
                                <div key={artwork.artwork_id} className={`bg-white rounded-xl shadow-md overflow-hidden relative group border-2 transition-all duration-300 flex flex-col justify-between ${isCompared ? "border-indigo-500 shadow-indigo-100" : "border-transparent"}`}>

                                    <div className="relative">
                                        {/* FAVORİ BUTONU */}
                                        {/* FAVORİ BUTONU */}
                                        <button
                                            onClick={(e) => handleAddFavorite(e, artwork.artwork_id)}
                                            className={`absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-md transition-all duration-200 text-sm cursor-pointer ${isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-500"}`}
                                        >
                                            {isFavorite ? "❤️" : "🤍"}
                                        </button>

                                        {/* KARŞILAŞTIRMA TİKİ (Checkbox mantığı) */}
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
                                            <h2 className="text-xl font-bold text-gray-900 truncate">{artwork.title}</h2>
                                            <p className="text-gray-500 text-sm mt-1">Sanatçı: <span className="font-semibold text-gray-700">{artwork.artist_name || "Bilinmiyor"}</span></p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div>
                                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</span>
                                                <span className="text-2xl font-black text-gray-950">{artwork.price ? artwork.price.toLocaleString("tr-TR") : "0"} ₺</span>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {/* İNCELE BUTONU (Yönlendirme yapar) */}
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

            {/* 3. KARŞILAŞTIRMA POP-UP'I (MODAL) */}
            {isCompareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Eser Karşılaştırması</h3>
                            <button onClick={() => setIsCompareModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold cursor-pointer">×</button>
                        </div>

                        <div className="p-6 flex flex-col md:flex-row gap-6 justify-center">
                            {compareList.map(item => (
                                <div key={`comp-${item.artwork_id}`} className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
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
                                            <span className="font-black text-indigo-600 text-lg">{item.price.toLocaleString("tr-TR")} ₺</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}