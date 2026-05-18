"use client";
import { useState, useEffect } from "react";

const mockArtworks = [
    {
        id: 1,
        title: "Yıldızlı Gece Yansımaları",
        artist: "Ahmet Yılmaz",
        price: 15000,
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop",
        category: "Yağlı Boya",
        views: 142
    },
    {
        id: 2,
        title: "Soyut Düşünceler",
        artist: "Zeynep Kaya",
        price: 8500,
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=600&auto=format&fit=crop",
        category: "Dijital Sanat",
        views: 98
    },
    {
        id: 3,
        title: "Zamanın Dokusu",
        artist: "Caner Erol",
        price: 12000,
        imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=600&auto=format&fit=crop",
        category: "Akrilik",
        views: 210
    },
    {
        id: 4,
        title: "Sessizliğin Çığlığı",
        artist: "Zeynep Kaya",
        price: 22000,
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop",
        category: "Yağlı Boya",
        views: 340
    },
    {
        id: 5,
        title: "Kozmik Kaos",
        artist: "Murat Demir",
        price: 9500,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
        category: "Dijital Sanat",
        views: 85
    },
    {
        id: 6,
        title: "Antik Figür",
        artist: "Hasan Yıldız",
        price: 18500,
        imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop",
        category: "Heykel",
        views: 115
    }
];

export default function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");

    // 2. Veritabanından gelecek veriler için state oluşturduk. Varsayılan olarak mock listeyi verdik ki DB boşsa site boş durmasın kanka.
    const [artworks, setArtworks] = useState(mockArtworks);

    // 3. Sayfa yüklendiğinde yazdığımız API'ye istek atan fonksiyon
    useEffect(() => {
        // Kadir'in hazırladığı backend URL'ini ve eserleri çeken endpoint'i (örneğin /api/artworks) birleştirdik
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artworks`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setArtworks(data);
                }
            })
            .catch((err) => console.error("Kadir'in backend'ine bağlanılamadı, mock verilerle devam ediliyor:", err));
    }, []);

    const categories = ["Tümü", "Yağlı Boya", "Dijital Sanat", "Akrilik", "Heykel"];

    // 4. KRİTİK DEĞİŞİKLİK: Burada artık 'mockArtworks' yerine yukarıda oluşturduğumuz 'artworks' state'ini filtreliyoruz:
    const filteredArtworks = artworks.filter((artwork) => {
        const matchesCategory = selectedCategory === "Tümü" || artwork.category === selectedCategory;
        const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* HERO (KARŞILAMA) ALANI */}
            <div className="bg-neutral-950 text-white py-24 px-4 border-b border-neutral-900 relative overflow-hidden text-center">
                {/* Arka plan sanatsal derinlik efekti */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none"></div>

                <div className="container mx-auto max-w-3xl relative z-10">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                        Seçkin Dijital Sergi
                    </span>

                    <h1 className="text-4xl md:text-5xl font-serif font-light mt-5 tracking-wide text-neutral-100 leading-tight">
                        Ruhunuza Dokunan <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">Eserleri</span> Keşfedin
                    </h1>

                    <p className="text-neutral-400 mt-4 text-sm md:text-base font-light max-w-xl mx-auto tracking-wide leading-relaxed">
                        Seçkin sanatçıların orijinal yapıtlarını inceleyin, etkinliklere katılın ve koleksiyonunuzu genişletin.
                    </p>
                </div>
            </div>

            {/* YENİ NESİL ASILI VE KİBAR ARAMA ÇUBUĞU KONUMU */}
            <div className="container mx-auto px-4 relative z-20 -mt-7">
                <div className="max-w-lg mx-auto bg-white rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 focus-within:ring-4 focus-within:ring-amber-400/20 transition-all duration-300 flex items-center">

                    {/* Sol İkon */}
                    <div className="pl-3 text-gray-400 flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Arama Input */}
                    <input
                        type="text"
                        placeholder="Eser, sanatçı veya tarz arayın..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-2 pr-8 py-2.5 bg-transparent text-gray-800 placeholder-gray-400 text-xs font-medium focus:outline-none"
                    />

                    {/* Sağ Taraf Temizleme Butonu */}
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="pr-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            title="Aramayı Temizle"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Hızlı Arama Trend Etiketleri */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
                    <span className="font-light">Trend:</span>
                    <button onClick={() => setSearchQuery("Zeynep Kaya")} className="hover:text-amber-400 transition-colors cursor-pointer font-light">Zeynep Kaya</button>
                    <span className="opacity-20 text-neutral-700">•</span>
                    <button onClick={() => setSearchQuery("Yıldızlı Gece")} className="hover:text-amber-400 transition-colors cursor-pointer font-light">Yıldızlı Gece</button>
                    <span className="opacity-20 text-neutral-700">•</span>
                    <button onClick={() => setSearchQuery("Kozmik")} className="hover:text-amber-400 transition-colors cursor-pointer font-light">Kozmik</button>
                </div>
            </div>

            {/* KATEGORİ FİLTRELERİ */}
            <div className="container mx-auto px-4 mt-6">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${selectedCategory === category
                                ? "bg-indigo-600 text-white shadow-indigo-200 shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
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
                        {filteredArtworks.length} eser listeleniyor
                    </p>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-md">
                        📊 Eserleri Karşılaştır
                    </button>
                </div>

                {filteredArtworks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-4xl block mb-2">🎨</span>
                        <p className="text-gray-500 font-medium">Aradığınız kriterlere uygun eser bulunamadı.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArtworks.map((artwork) => (
                            <div
                                key={artwork.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden relative group border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="relative">
                                    <button
                                        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200 text-sm active:scale-95 cursor-pointer"
                                        title="Favorilere Ekle"
                                    >
                                        ❤️
                                    </button>

                                    <span className="absolute bottom-4 left-4 z-10 bg-gray-900/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                        {artwork.category}
                                    </span>

                                    <div className="h-64 overflow-hidden bg-gray-100">
                                        <img
                                            src={artwork.imageUrl}
                                            alt={artwork.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {artwork.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Sanatçı: <span className="font-semibold text-gray-700">{artwork.artist}</span>
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</span>
                                            <span className="text-2xl font-black text-gray-950">
                                                {artwork.price.toLocaleString("tr-TR")} ₺
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[11px] text-gray-400 font-medium">👁️ {artwork.views} görüntülenme</span>
                                            <button className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-bold text-xs shadow-sm cursor-pointer active:scale-95">
                                                İncele
                                            </button>
                                        </div>
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