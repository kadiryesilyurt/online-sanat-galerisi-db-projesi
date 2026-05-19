"use client";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function AdminArtworksPage() {
    const [artworks, setArtworks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modallar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

    // 🚀 YENİ: Düzenleme Modalı State'leri
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        price: "",
        image_url: "",
        artist_id: ""
    });

    const categories = ["Yağlı Boya", "Heykel", "Fotoğraf", "Dijital Sanat", "Karakalem", "Sulu Boya"]; // Ufak bir typo düzelttim: Karakelem -> Karakalem

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
                toast.success('Eser başarıyla listeye eklendi.', {
                    duration: 3000,
                    style: { background: '#10B981', color: '#fff', borderRadius: '10px' },
                    icon: '✅',
                });
                setIsModalOpen(false);
                setFormData({ title: "", artist_id: "", price: "", image_url: "", category: "", stock_status: 1, description: "" });
                fetchArtworks();
            }
        } catch (error) {
            toast.error('Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.', {
                duration: 3000,
                style: { background: '#EF4444', color: '#fff', borderRadius: '10px' },
                icon: '❌',
            });
        }
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
                toast.success('Sanatçı başarıyla kaydedildi.', {
                    duration: 3000,
                    style: { background: '#10B981', color: '#fff', borderRadius: '10px' },
                    icon: '👨‍🎨',
                });
                setIsArtistModalOpen(false);
                setArtistForm({ name: "", biography: "" })
                fetchArtists();
            } else {
                toast.error('Sanatçı kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.', {
                    duration: 3500,
                    style: { background: '#EF4444', color: '#fff', borderRadius: '10px' },
                    icon: '🚫',
                });
            }
        } catch (error) {
            toast.error('Sunucu tarafında bir hata oluştu.', {
                duration: 4000,
                style: { background: '#EF4444', color: '#fff', borderRadius: '10px' },
                icon: '💻',
            });
        }
    };

    // 🚀 YENİ: ESER GÜNCELLEME (DÜZENLEME) FONKSİYONLARI
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Eser güncelleniyor...');
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${backendUrl}/api/artworks/${selectedArtwork.artwork_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editFormData,
                    price: parseFloat(editFormData.price),
                    artist_id: parseInt(editFormData.artist_id)
                }),
            });

            if (res.ok) {
                toast.success('Eser başarıyla güncellendi!', { id: toastId, style: { background: '#10B981', color: '#fff', borderRadius: '10px' } });
                setIsEditModalOpen(false);
                fetchArtworks();
            } else {
                const data = await res.json();
                toast.error(data.detail || 'Güncelleme başarısız oldu.', { id: toastId, style: { background: '#EF4444', color: '#fff', borderRadius: '10px' } });
            }
        } catch (error) {
            toast.error('Sunucuya ulaşılamıyor.', { id: toastId, style: { background: '#EF4444', color: '#fff', borderRadius: '10px' } });
        }
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
                                {/* 🚀 YENİ: DÜZENLE VE SİL BUTONLARI YAN YANA */}
                                <td className="p-4 text-right space-x-3">
                                    <button
                                        onClick={() => {
                                            setSelectedArtwork(art);
                                            setEditFormData({
                                                title: art.title,
                                                description: art.description || "",
                                                price: art.price,
                                                image_url: art.image_url,
                                                artist_id: art.artist_id ? String(art.artist_id) : ""
                                            });
                                            setIsEditModalOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 text-sm cursor-pointer transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                    <button onClick={() => handleDelete(art.artwork_id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 text-sm cursor-pointer transition-colors">
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

// YENİ ESER EKLEME MODALI (Biyografi ve Açıklama eklendi)
            {isModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-6">Yeni Eser Ekle</h2>
                        <form onSubmit={handleAddArtwork} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Eser Adı</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl outline-none focus:border-indigo-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Sanatçı Seç</label>
                                <div className="flex gap-2">
                                    <select required value={formData.artist_id} onChange={e => setFormData({ ...formData, artist_id: e.target.value })} className="flex-1 p-2.5 border rounded-xl bg-white outline-none focus:border-indigo-500">
                                        <option value="" disabled>Seçiniz...</option>
                                        {artists.map(artist => (
                                            <option key={artist.artist_id} value={String(artist.artist_id)}>
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setIsArtistModalOpen(true)} className="bg-stone-900 text-white px-4 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">
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

                            {/* 🚀 YENİ: ESER AÇIKLAMASI EKLENDİ */}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Eser Açıklaması</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full p-2.5 border rounded-xl outline-none focus:border-indigo-500 resize-none" placeholder="Eserin tekniği, hikayesi vb..."></textarea>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Vazgeç</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HIZLI SANATÇI EKLEME MODALI */}
            {isArtistModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border-4 border-indigo-100">
                        <h2 className="text-xl font-black mb-4 text-indigo-900">👩‍🎨 Yeni Sanatçı Ekle</h2>
                        <form onSubmit={handleAddArtist} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Sanatçı Adı Soyadı</label>
                                <input required type="text" value={artistForm.name} onChange={e => setArtistForm({ ...artistForm, name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                            </div>

                            {/* 🚀 YENİ: BİYOGRAFİ EKLENDİ */}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Biyografi (İsteğe Bağlı)</label>
                                <textarea value={artistForm.biography} onChange={e => setArtistForm({ ...artistForm, biography: e.target.value })} rows="3" className="w-full p-2.5 border rounded-xl outline-none focus:border-indigo-500 resize-none" placeholder="Sanatçı hakkında kısa bir bilgi..."></textarea>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsArtistModalOpen(false)} className="flex-1 py-2.5 border rounded-xl font-bold">İptal</button>
                                <button type="submit" className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl font-bold">Sanatçıyı Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🚀 YENİ: ESER DÜZENLEME MODALI 🚀 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm antialiased">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="text-lg font-black text-stone-800">Eseri Düzenle</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer text-xl font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Eser Adı</label>
                                <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Fiyat (₺)</label>
                                    <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Sanatçı</label>
                                    <select name="artist_id" value={editFormData.artist_id} onChange={handleEditChange} className="w-full px-3 py-2.5 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required>
                                        <option value="" disabled>Seçiniz...</option>
                                        {artists.map(artist => (
                                            <option key={artist.artist_id} value={artist.artist_id}>
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Görsel URL</label>
                                <input type="text" name="image_url" value={editFormData.image_url} onChange={handleEditChange} className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Açıklama</label>
                                <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows="3" className="w-full px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer">
                                    İptal
                                </button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md cursor-pointer">
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}