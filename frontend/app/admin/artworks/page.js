"use client";
import { useState, useEffect } from "react";

export default function AdminArtworksPage() {
    const [artworks, setArtworks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modallar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false); // 🚀 YENİ: Sanatçı Modalı

    const categories = ["Yağlı Boya", "Heykel", "Fotoğraf", "Dijital Sanat", "Karakelem", "Sulu Boya"];

    const [formData, setFormData] = useState({
        title: "", artist_id: "", price: "", image_url: "", category: "", stock_status: 1, description: ""
    });

    const [artistForm, setArtistForm] = useState({
        name: "", biography: ""
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchArtworks = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/artworks/`);
            if (res.ok) setArtworks(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchArtists = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/artists/`);
            if (res.ok) setArtists(await res.json());
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchArtworks(), fetchArtists()]);
            setLoading(false);
        };
        loadData();
    }, []);

    // ESER EKLEME FONKSİYONU
    const handleAddArtwork = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${backendUrl}/api/artworks/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock_status: parseInt(formData.stock_status),
                    artist_id: parseInt(formData.artist_id)
                })
            });
            if (res.ok) {
                alert("Eser eklendi!");
                setIsModalOpen(false);
                setFormData({ title: "", artist_id: "", price: "", image_url: "", category: "", stock_status: 1, description: "" });
                fetchArtworks();
            }
        } catch (error) { alert("Hata oluştu."); }
    };

    const handleAddArtist = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${backendUrl}/api/artists/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(artistForm)
            });
            if (res.ok) {
                alert("Sanatçı başarıyla eklendi!");
                setIsArtistModalOpen(false); // Modalı kapat
                setArtistForm({ name: "", biography: "" })
                fetchArtists(); // 🚀 Dropdown'u güncelle
            } else {
                alert("Sanatçı eklenemedi.");
            }
        } catch (error) { alert("Sunucu hatası."); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Bu eseri silmek istediğine emin misin?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${backendUrl}/api/artworks/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchArtworks();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 font-bold text-stone-500">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-stone-900">Eser Yönetimi</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer">
                    + Yeni Eser Ekle
                </button>
            </div>

            {/* TABLO BÖLÜMÜ */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 border-b text-stone-500 text-xs font-bold uppercase">
                            <th className="p-4">Görsel</th>
                            <th className="p-4">Eser Adı</th>
                            <th className="p-4">Fiyat</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {artworks.map((art) => (
                            <tr key={art.artwork_id} className="hover:bg-stone-50/50">
                                <td className="p-4"><img src={art.image_url} className="w-12 h-12 rounded-lg object-cover" alt="" /></td>
                                <td className="p-4 font-bold text-stone-900">{art.title}</td>
                                <td className="p-4 font-mono font-bold text-stone-900">{art.price} ₺</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(art.artwork_id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 text-sm cursor-pointer">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* YENİ ESER EKLEME MODALI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-6">Yeni Eser Ekle</h2>
                        <form onSubmit={handleAddArtwork} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Eser Adı</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl outline-none focus:border-indigo-500" />
                            </div>

                            {/* SANATÇI DROPDOWN VE HIZLI EKLE BUTONU */}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Sanatçı Seç</label>
                                <div className="flex gap-2">
                                    <select
                                        required
                                        value={formData.artist_id}
                                        onChange={e => setFormData({ ...formData, artist_id: e.target.value })}
                                        className="flex-1 p-2.5 border rounded-xl bg-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="" disabled>Seçiniz...</option>
                                        {artists.map(artist => (
                                            <option key={artist.artist_id} value={artist.artist_id}>
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsArtistModalOpen(true)}
                                        className="bg-stone-900 text-white px-4 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors"
                                    >
                                        + Yeni
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Kategori</label>
                                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
                                        <option value="" disabled>Seçiniz...</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Fiyat (₺)</label>
                                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Görsel URL</label>
                                <input required type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Vazgeç</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🚀 HIZLI SANATÇI EKLEME MODALI 🚀 */}
            {isArtistModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border-4 border-indigo-100">
                        <h2 className="text-xl font-black mb-4 text-indigo-900">👩‍🎨 Yeni Sanatçı Ekle</h2>
                        <form onSubmit={handleAddArtist} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Sanatçı Adı Soyadı</label>
                                <input required type="text" value={artistForm.name} onChange={e => setArtistForm({ ...artistForm, name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsArtistModalOpen(false)} className="flex-1 py-2.5 border rounded-xl font-bold">İptal</button>
                                <button type="submit" className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl font-bold">Sanatçıyı Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}