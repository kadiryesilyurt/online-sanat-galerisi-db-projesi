"use client";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function ArtworksPage() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⚖️ KARŞILAŞTIRMA STATE'LERİ
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/artworks`);
                if (response.ok) {
                    const data = await response.json();
                    setArtworks(data);
                }
            } catch (error) { console.error("Eserler çekilemedi:", error); }
            finally { setLoading(false); }
        };
        fetchArtworks();
    }, [backendUrl]);

    // ⚖️ KARŞILAŞTIRMA LİSTESİNE EKLE/ÇIKAR
    const toggleCompare = (eser) => {
        const exists = compareList.find(item => item.artwork_id === eser.artwork_id);
        if (exists) {
            setCompareList(compareList.filter(item => item.artwork_id !== eser.artwork_id));
        } else {
            if (compareList.length >= 3) {
                toast.error("En fazla 3 eser karşılaştırabilirsiniz!");
                return;
            }
            setCompareList([...compareList, eser]);
        }
    };

    // 💾 VERİTABANINA KAYDETME (API Rotası Düzeltildi)
    const handleSaveComparison = async () => {
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Giriş yapmalısın kanka!"); return; }

        const selectedIds = compareList.map(item => item.artwork_id);
        try {
            // 🔥 KRİTİK DÜZELTME: /api/panel/comparisons yerine /api/users/comparisons yazıldı!
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

    // Favorilere ekleme
    const handleAddFavorite = async (artworkId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { toast.error("Giriş yapmalısın!"); return; }
            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ artwork_id: artworkId })
            });
            if (response.ok) toast.success('Favorilere eklendi. 🎨');
            else toast.error('İşlem başarısız.');
        } catch (error) { toast.error('Sunucu hatası.'); }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-7xl relative pb-24">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sanat Galerisi</h1>
                <p className="text-gray-500 mt-3 text-lg">Özel koleksiyonumuzdaki eşsiz eserleri keşfedin.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-xl font-semibold text-gray-400 animate-pulse">Eserler yükleniyor kanka...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {artworks.map((eser) => {
                    const isSelected = compareList.some(item => item.artwork_id === eser.artwork_id);
                    return (
                        <div key={eser.artwork_id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all relative ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 hover:shadow-lg"}`}>
                            
                            {/* 🔥 BUTON BURADA: Kartın sağ üstünde, z-index ile en üstte */}
                            <button 
                                onClick={() => toggleCompare(eser)}
                                className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-md cursor-pointer ${isSelected ? "bg-indigo-600 border-white text-white" : "bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-600"}`}
                                title="Karşılaştır"
                            >
                                {isSelected ? "✓" : "⚖️"}
                            </button>

                            {/* Resim Alanı */}
                            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                {eser.image_url ? (
                                    <img src={eser.image_url} alt={eser.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🖼️</div>
                                )}
                            </div>

                            {/* Detaylar */}
                            <div className="p-5 h-48 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{eser.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Sanatçı: {eser.artist_name || "Bilinmiyor"}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-black text-indigo-600">{eser.price ? eser.price.toLocaleString("tr-TR") : "0"} ₺</span>
                                    <button onClick={() => handleAddFavorite(eser.artwork_id)} className="bg-gray-900 text-white hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">❤️ Favori</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            )}

            {/* ⚖️ FLOATING BUTON */}
            {compareList.length > 0 && (
                <div className="fixed bottom-8 right-8 z-40">
                    <button onClick={() => setIsCompareModalOpen(true)} className="bg-neutral-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 hover:bg-indigo-600 animate-bounce-short">
                        <span className="bg-white text-neutral-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">{compareList.length}</span>
                        Karşılaştır
                    </button>
                </div>
            )}

            {/* ⚖️ ESER KARŞILAŞTIRMA MODALI (TAM EKRAN SABİTLEME) */}
            {isCompareModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    {/* overflow-hidden eklendi ki hiçbir şey dışarı taşmasın */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        
                        {/* BAŞLIK (Beton gibi sabit - shrink-0) */}
                        <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-white z-10 shrink-0">
                            <h3 className="text-xl font-black text-neutral-900">Eser Karşılaştırması</h3>
                            <button onClick={() => setIsCompareModalOpen(false)} className="text-stone-400 hover:text-red-500 text-3xl leading-none font-light cursor-pointer">&times;</button>
                        </div>
                        
                        {/* İÇERİK (flex-1 eklendi - sadece burası kayacak) */}
                        <div className="p-6 flex flex-col md:flex-row gap-6 justify-center overflow-y-auto bg-stone-50/30 flex-1">
                            {compareList.map(item => (
                                <div key={`comp-${item.artwork_id}`} className="flex-1 bg-white rounded-xl p-5 border border-stone-100 shadow-sm relative h-fit">
                                    <button 
                                        onClick={() => toggleCompare(item)} 
                                        className="absolute top-2 right-2 w-6 h-6 bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 rounded-full flex items-center justify-center text-xs transition-colors"
                                    >
                                        ✕
                                    </button>
                                    <img src={item.image_url} className="w-full h-40 object-cover rounded-lg mb-4" />
                                    <h4 className="font-bold text-lg text-neutral-900 leading-tight border-b border-stone-100 pb-3">{item.title}</h4>
                                    
                                    <div className="mt-3 space-y-3 text-sm">
                                        <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                                            <span className="text-stone-500 font-medium">Sanatçı</span>
                                            <span className="font-bold text-neutral-800">{item.artist_name || "Bilinmiyor"}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                                            <span className="text-stone-500 font-medium">Kategori</span>
                                            <span className="font-bold text-neutral-800">{item.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                                            <span className="text-indigo-700 font-medium">Fiyat</span>
                                            <span className="font-black text-indigo-600 text-lg">{item.price ? item.price.toLocaleString("tr-TR") : "0"} ₺</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 💾 KAYDET BUTONU BÖLÜMÜ (Beton gibi sabit - shrink-0) */}
                        <div className="p-6 border-t border-stone-200 bg-gray-50 z-10 shrink-0 flex justify-between items-center">
                            <p className="text-xs text-stone-500 max-w-xs font-medium">Karşılaştırma sonuçlarını kaydederek profilinizden inceleyebilirsiniz.</p>
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