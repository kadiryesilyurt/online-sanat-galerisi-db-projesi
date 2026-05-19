"use client";
import { useState, useEffect } from "react";

export default function ArtworksPage() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sayfa açıldığında Kadir'in veritabanından eserleri çekiyoruz
    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                // Eğer .env okumazsa diye 127.0.0.1 adresini yedek (fallback) olarak bıraktık kanka
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                const response = await fetch(`${backendUrl}/api/artworks`);

                if (response.ok) {
                    const data = await response.json();
                    setArtworks(data);
                } else {
                    console.error("Backend'den eserler alınamadı (404 veya 500 hatası).");
                }
            } catch (error) {
                console.error("Sunucuya bağlanılamadı, backend çalışıyor mu kanka?:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtworks();
    }, []);

    // Favorilere ekleme motorumuz
    const handleAddFavorite = async (artworkId) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Şimdilik user_id: 1 olarak sabitliyoruz, giriş yapma (auth) sistemi gelince dinamik olacak
                body: JSON.stringify({ user_id: 1, artwork_id: artworkId })
            });

            if (response.ok) {
                alert("🎨 Eser başarıyla favorilerine eklendi kanka!");
            } else {
                alert("Eklenemedi, bir şeyler ters gitti.");
            }
        } catch (error) {
            alert("Sunucuya ulaşılamadı.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-7xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sanat Galerisi</h1>
                <p className="text-gray-500 mt-3 text-lg">Özel koleksiyonumuzdaki eşsiz eserleri keşfedin.</p>
            </div>

            {/* Yükleniyor Animasyonu */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-xl font-semibold text-gray-400 animate-pulse">Eserler veritabanından çekiliyor kanka...</p>
                </div>
            ) : artworks.length === 0 ? (
                <div className="text-center bg-gray-50 p-10 rounded-xl border border-gray-100">
                    <p className="text-gray-500">Şu an galeride hiç eser yok. Veritabanına eser eklememiz lazım.</p>
                </div>
            ) : (
                /* Dinamik Eser Kartları Izgarası */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {artworks.map((eser) => (
                        <div key={eser.artwork_id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">

                            {/* Resim Alanı */}
                            <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                                {eser.image_url ? (
                                    <img
                                        src={eser.image_url}
                                        alt={eser.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🖼️</div>
                                )}
                            </div>

                            {/* Detaylar ve Buton */}
                            <div className="p-5 flex flex-col justify-between h-48">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{eser.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Sanatçı: <span className="font-medium text-gray-700">{eser.artist_name || "Bilinmiyor"}</span></p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-black text-indigo-600">
                                        {eser.price ? eser.price.toLocaleString("tr-TR") : "0"} ₺
                                    </span>
                                    <button
                                        onClick={() => handleAddFavorite(eser.artwork_id)}
                                        className="bg-gray-900 text-white hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                                    >
                                        ❤️ Favoriye Al
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}