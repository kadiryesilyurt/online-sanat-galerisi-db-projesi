"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";
import toast from 'react-hot-toast';

export default function ArtworkDetailPage() {
    const params = useParams();
    const router = useRouter(); // Geri dönmek için bu motoru kullanacağız
    const { id } = params;
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state'i
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
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
        if (id) fetchArtwork();
    }, [id]);

    const handleAddFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Favorilere eklemek için giriş yap kanka!");
            router.push("/auth?mode=login");
            return;
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${backendUrl}/api/panel/favorites`, {
                method: "POST", // Hem ekleme hem silme için POST kullanıyoruz (Toggle mantığı)
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ artwork_id: parseInt(id) }),
            });

            if (response.ok) {
                setIsFavorite(!isFavorite); // Kalp ikonunu anında değiştir
            }
        } catch (error) {
            console.error("Favori işlemi hata verdi:", error);
        }
    };
    const handlePurchase = async (method) => {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

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
                toast.success('Harika bir seçim! Eser başarıyla satın alındı.', {
                    duration: 4000, // Satın alma olduğu için biraz daha uzun kalsın
                    style: {
                        background: '#10B981', // Başarı için yeşil tonu
                        color: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #059669',
                    },
                    icon: '🖼️', // Eser temasına uygun ikon
                });
                setIsModalOpen(false);
                router.push("/panel"); // Siparişlerime yönlendir
            } else {
                alert("Ödeme sırasında bir hata oluştu.");
            }
        } catch (err) {
            alert("Sunucuya ulaşılamadı.");
        }
    };
    const handleBuy = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Satın almak için giriş yapmalısın kanka!");
            router.push("/auth?mode=login");
            return;
        }
        // Modal'ı açan state'i tetikliyoruz
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !artwork) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center flex-col text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Eyvah! Eser Bulunamadı.</h1>
                <button onClick={() => router.back()} className="text-indigo-600 font-bold underline mt-4 cursor-pointer">← Geri Dön</button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* ÜST BİLGİ VE GERİ DÖNÜŞ BUTONU */}
            <div className="border-b border-gray-100 bg-gray-50/50 sticky top-16 z-40 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between">

                    {/* Geri Dön Butonu */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer bg-white px-4 py-1.5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md"
                    >
                        <span className="text-lg leading-none mb-[2px]">←</span> Geri Dön
                    </button>

                    {/* Sağ Taraf: Eser Yolu (Breadcrumb) */}
                    <div className="hidden md:flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Link href="/" className="hover:text-indigo-600 transition-colors">Galeri</Link>
                        <span className="mx-3 opacity-30">/</span>
                        <span>{artwork.category || "Kategori Yok"}</span>
                        <span className="mx-3 opacity-30">/</span>
                        <span className="text-gray-900 truncate max-w-[200px]">{artwork.title}</span>
                    </div>

                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

                    {/* SOL TARAF: DEV GÖRSEL */}
                    <div className="w-full lg:w-1/2 xl:w-3/5">
                        <div className="sticky top-32 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 relative group border border-gray-100">
                            <button
                                onClick={handleAddFavorite}
                                className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                            >
                                <span className="text-2xl leading-none block mt-[2px]">{isFavorite ? "❤️" : "🤍"}</span>
                            </button>

                            {artwork.image_url ? (
                                <img
                                    src={artwork.image_url}
                                    alt={artwork.title}
                                    className="w-full h-auto max-h-[80vh] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-[60vh] flex items-center justify-center text-6xl opacity-20">🖼️</div>
                            )}
                        </div>
                    </div>

                    {/* SAĞ TARAF: ESER & SANATÇI DETAYLARI */}
                    <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col py-4">

                        <div className="mb-4 flex gap-3">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md">
                                Orijinal Eser
                            </span>
                            {artwork.stock_status > 0 && (
                                <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-md uppercase tracking-wider">
                                    Stokta Var
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                            {artwork.title}
                        </h1>

                        <p className="text-lg text-gray-500 font-medium mb-8">
                            Eser Sahibi: <span className="font-bold text-gray-900">{artwork.artist_name || "Bilinmiyor"}</span>
                        </p>

                        <div className="bg-white border-2 border-gray-100 p-6 rounded-2xl mb-10 shadow-sm flex justify-between items-center">
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Eser Bedeli</span>
                                <span className="text-4xl font-black text-gray-900">
                                    {artwork.price ? artwork.price.toLocaleString("tr-TR") : "0"} ₺
                                </span>
                            </div>
                            <button
                                onClick={handleBuy}
                                disabled={artwork.stock_status <= 0}
                                className={`px-8 py-4 rounded-xl font-black text-lg shadow-lg transition-all duration-200 active:scale-95 cursor-pointer ${artwork.stock_status > 0
                                    ? "bg-gray-900 text-white hover:bg-indigo-600 hover:shadow-indigo-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {artwork.stock_status > 0 ? "Satın Al" : "Tükendi"}
                            </button>
                        </div>

                        {/* DETAYLI AÇIKLAMA VE BİYOGRAFİ BÖLÜMÜ */}
                        <div className="space-y-8">

                            {/* Eser Hakkında */}
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-px bg-indigo-600"></span> Eserin Hikayesi
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-light text-lg">
                                    {artwork.description || "Bu eser için henüz detaylı bir hikaye veya açıklama metni girilmemiş kanka."}
                                </p>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Sanatçı Hakkında */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    👤 {artwork.artist_name || "Sanatçı"} Hakkında
                                </h3>
                                <p className="text-gray-700 leading-relaxed font-medium text-sm">
                                    {artwork.artist_biography || "Sanatçının biyografisi henüz veritabanına eklenmemiş. Çok yakında burada olacak!"}
                                </p>
                            </div>

                        </div>

                        <p className="text-left text-xs font-medium text-gray-400 mt-8 flex items-center gap-2">
                            🔒 SSL Güvencesiyle 256-bit Şifrelenmiş Ödeme
                        </p>


                    </div>
                </div>
            </div>
            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                artwork={artwork}
                onConfirm={handlePurchase}
            />
        </div>
    );
}