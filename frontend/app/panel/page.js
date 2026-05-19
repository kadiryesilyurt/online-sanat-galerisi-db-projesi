"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Fallback (Sahte) Veriler
const mockOrders = [
    {
        id: "SP-9482",
        date: "12 Mayıs 2026",
        product: "Soyut Düşünceler",
        artist: "Zeynep Kaya",
        price: 8500,
        status: "Kargoya Verildi",
        estDelivery: "21 Mayıs 2026",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "SP-8310",
        date: "20 Nisan 2026",
        product: "Zamanın Dokusu",
        artist: "Caner Erol",
        price: 12000,
        status: "Teslim Edildi",
        estDelivery: "24 Nisan 2026",
        imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=600&auto=format&fit=crop"
    }
];

const mockReservations = [
    { id: 102, title: "Temel Yağlı Boya Atölyesi", date: "25 Mayıs 2026", time: "14:00 - 17:00", status: "Onaylandı" }
];

const mockFavorites = [
    { id: 4, title: "Sessizliğin Çığlığı", artist: "Zeynep Kaya", price: 22000, imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop" }
];

const mockTickets = [
    { id: 492, subject: "Kargo Hasar Bildirimi", date: "14 Mayıs 2026", status: "Cevaplandı" }
];
const ReservationItem = ({ rez, onCancel, onUpdate }) => {
    // Kartın içindeki geçici state'ler
    const [date, setDate] = useState(rez.date || rez.reservation_date);
    const [count, setCount] = useState(rez.participant_count || rez.participants || 1);

    return (
        <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm hover:border-indigo-200 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="font-bold text-gray-800 text-base block">{rez.title || rez.event_title || "Sanat Atölyesi"}</span>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 mt-1">{rez.status || "Onaylandı"}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded text-xs" />
                <input type="number" min="1" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="p-2 border rounded text-xs" />
            </div>

            <div className="flex gap-2">
                <button onClick={() => onUpdate(rez.id || rez.reservation_id, date, count)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Güncelle</button>
                <button onClick={() => onCancel(rez.id || rez.reservation_id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white">İptal Et</button>
            </div>
        </div>
    );
};
const ReservationCard = ({ rez, onCancel, onEdit }) => (
    <div className="p-5 border border-stone-100 bg-white rounded-2xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
        <div>
            <h3 className="font-bold text-gray-900 text-lg">{rez.title || "Sanat Atölyesi"}</h3>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                <span>🗓️ {rez.date}</span>
                <span className="bg-stone-100 px-2 py-1 rounded">👥 {rez.participant_count} Kişi</span>

                {/* 🚀 İŞTE EKSİK OLAN FİYAT KISMI BURASI! 🚀 */}
                <span className="font-black text-indigo-600 text-sm">
                    💰 {rez.total_amount ? rez.total_amount.toLocaleString("tr-TR") : (rez.participant_count * 100)} ₺
                </span>

            </div>
            <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                {rez.status || "Onaylandı"}
            </span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onEdit(rez)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">Düzenle</button>
            <button onClick={() => onCancel(rez.id)} className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">İptal Et</button>
        </div>
    </div>
);

const AccountSettings = () => {
    const [userData, setUserData] = useState({ first_name: "", last_name: "", email: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:8000/api/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            console.log("🔥 BACKEND'DEN GELEN JSON:", data); // F12 -> Console'da buna bak!

            if (res.ok) {
                setUserData(data);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/users/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (res.ok) {
            alert("Profil başarıyla güncellendi!");
            setIsEditing(false);
        } else {
            alert("Güncelleme başarısız oldu.");
        }
    };

    return (
        <div className="bg-white p-8 border border-stone-100 rounded-2xl shadow-sm max-w-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-stone-900">Profil Bilgileri</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">Düzenle</button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="Ad"
                        value={userData.first_name || ""}
                        onChange={e => setUserData({ ...userData, first_name: e.target.value })}
                    />
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="Soyad"
                        value={userData.last_name || ""}
                        onChange={e => setUserData({ ...userData, last_name: e.target.value })}
                    />
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="E-posta"
                        value={userData.email || ""}
                        onChange={e => setUserData({ ...userData, email: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="bg-stone-100 px-6 py-2 rounded-lg font-bold cursor-pointer">İptal</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold cursor-pointer hover:bg-indigo-700">Kaydet</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">Ad Soyad</p>
                        <p className="text-lg font-semibold text-stone-800">
                            {userData.first_name || ""} {userData.last_name || ""}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">E-posta</p>
                        <p className="text-lg font-semibold text-stone-800">{userData.email || ""}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
const EditReservationForm = ({ rez, onSave, onCancel }) => {
    // State'ler (zamanı da ekledik)
    const [date, setDate] = useState(rez.date || rez.reservation_date);
    const [time, setTime] = useState(rez.time || rez.reservation_time);
    const [count, setCount] = useState(rez.participant_count || rez.participants || 1);
    const [selectedOrder, setSelectedOrder] = useState(null); // Detay için seçili siparişi tutar
    // Tarih Sınırları
    const getToday = () => new Date().toISOString().split('T')[0];
    const getOneMonthLater = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };

    // 12:00 - 21:00 arası saatler
    const timeOptions = Array.from({ length: 10 }, (_, i) => `${(i + 12).toString().padStart(2, '0')}:00`);

    return (
        <div className="p-6 bg-white border border-indigo-100 rounded-2xl shadow-lg animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">Düzenle: {rez.title || "Sanat Atölyesi"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Yeni Tarih</label>
                    <input
                        type="date"
                        min={getToday()}
                        max={getOneMonthLater()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Yeni Saat</label>
                    <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                    >
                        {timeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Kişi Sayısı</label>
                    <input
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCount(val === "" ? "" : parseInt(val));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-lg"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    // Burada 'time' değişkenini de gönderiyoruz!
                    onClick={() => onSave(rez.id || rez.reservation_id, date, count, time)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                    Kaydet
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                    Vazgeç
                </button>
            </div>
        </div>
    );
};


export default function UserPanelPage() {

    const [selectedOrder, setSelectedOrder] = useState(null);
    const router = useRouter(); // Güvenlik yönlendirmesi için
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const [activeTab, setActiveTab] = useState("orders");

    // Canlı veritabanı durumları için statelerimiz kanka
    const [orders, setOrders] = useState(mockOrders);
    const [reservations, setReservations] = useState(mockReservations);
    const [favorites, setFavorites] = useState(mockFavorites);
    const [tickets, setTickets] = useState(mockTickets);
    const [editingRez, setEditingRez] = useState(null);
    // Rezervasyonları çeken fonksiyonu dışarıya çıkar ki istediğimiz zaman çağıralım
    const fetchReservations = async () => {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

        try {
            const response = await fetch(`${backendUrl}/api/panel/reservations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setReservations(data);
            } else if (data && data.reservations && Array.isArray(data.reservations)) {
                setReservations(data.reservations);
            } else {
                setReservations([]);
            }
        } catch (err) {
            console.error("Rezervasyonlar çekilemedi:", err);
        }
    };
    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/orders/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Siparişler çekilemedi:", err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        // 🚀 GÜVENLİK DUVARI
        if (!token) {
            router.push("/auth?mode=login");
            return;
        }

        fetchReservations();
        console.log("🔥 İstek atılan adres:", `${backendUrl}/api/panel/favorites`);
        const authHeaders = { "Authorization": `Bearer ${token}` };

        // 1. Siparişleri Çek - (Hata verdiği için yorum satırına aldık)
        // YENİ: Siparişleri Çeken Fonksiyon
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/orders/`, {
                    headers: authHeaders
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("📦 Siparişler başarıyla çekildi:", data);
                    setOrders(Array.isArray(data) ? data : []);
                } else {
                    console.error("Siparişler alınamadı, sunucu hata döndürdü.");
                }
            } catch (err) {
                console.error("Siparişler çekilirken bağlantı hatası oluştu:", err);
            }
        };
        fetchOrders();

        // 2. Rezervasyonları Çek
        fetch(`${backendUrl}/api/panel/reservations`, { headers: authHeaders })
            .then((res) => res.json())
            .then((data) => {
                console.log("🎯 BACKEND'DEN GELEN REZERVASYON VERİSİ:", data);
                if (Array.isArray(data)) {
                    setReservations(data);
                } else if (data && data.reservations && Array.isArray(data.reservations)) {
                    setReservations(data.reservations);
                } else {
                    setReservations([]);
                }
            })
            .catch((err) => console.error("Rezervasyonlar çekilemedi:", err));

        // 3. Favorileri Çek
        fetch(`${backendUrl}/api/panel/favorites`, { headers: authHeaders })
            .then((res) => {
                if (!res.ok) throw new Error(`Sunucu ${res.status} hatası döndürdü`);
                return res.json();
            })
            .then((data) => {
                console.log("⭐ BACKEND'DEN GELEN FAVORİLER:", data);
                if (Array.isArray(data)) setFavorites(data);
            })
            .catch((err) => {
                console.error("Favoriler çekilemedi, detay:", err);
            });

        // 4. Destek Taleplerini Çek - (Hata verdiği için yorum satırına aldık)
        // fetch(`${backendUrl}/api/panel/tickets`, { headers: authHeaders })...

    }, [router]);

    const handleCancelOrder = async (id) => {
        if (!confirm("Bu siparişi iptal etmek istediğine emin misin kanka?")) return;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${backendUrl}/api/orders/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Siparişin iptal edildi.");
                fetchOrders(); // Listeyi güncelle
            }
        } catch (err) {
            alert("İptal edilemedi.");
        }
    };

    // Ödev Maddesi 5: Rezervasyon İptal Etme Fonksiyonu
    const handleCancelReservation = async (id) => {
        if (!confirm("Bu atölye rezervasyonunu iptal etmek istediğine emin misin kanka?")) return;

        const token = localStorage.getItem("token");
        try {
            // 🚀 DELETE metoduyla rezervasyonu backend'den siliyoruz
            const response = await fetch(`${backendUrl}/api/panel/reservations/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Rezervasyonun iptal edildi ve kontenjan güncellendi kanka.");
                // Ekranı yenilemeden, direkt state üzerinden listeden siliyoruz
                setReservations(reservations.filter(rez => rez.id !== id));
            } else {
                alert("İptal işlemi başarısız oldu.");
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            alert("Sunucuyla bağlantı koptu.");
        }
    };
    // 🚀 Ödev Maddesi 5: Rezervasyon Güncelleme Fonksiyonu
    const handleUpdateReservation = async (reservationId, newDate, newCount, newTime) => {
        const token = localStorage.getItem("token");

        // Basit doğrulama: tarih seçilmiş mi ve kişi sayısı 1'den az mı?
        if (!newDate || newCount < 1) {
            alert("Geçerli bir tarih ve kişi sayısı gir kanka!");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/panel/reservations/${reservationId}`, {
                method: "PUT", // Backend'deki PUT route'una gidiyoruz
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    reservation_date: newDate,
                    reservation_time: newTime,
                    participant_count: newCount
                })
            });

            if (response.ok) {
                alert("Rezervasyon başarıyla güncellendi kanka!");
                setEditingRez(null); // Formu kapat
                fetchReservations();
            } else {
                const errorData = await response.json();
                alert(`Hata: ${errorData.detail || "Güncelleme başarısız."}`);
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            alert("Sunucuya ulaşılamadı.");
        }
    };
    const handleRemoveFavorite = async (artworkId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/panel/favorites`, {
                method: "POST", // Backend'deki aynı route'a gönderince zaten favoriyse siliyor
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ artwork_id: artworkId })
            });

            if (response.ok) {
                setFavorites(favorites.filter(f => f.artwork_id !== artworkId));
                alert("Favorilerden kaldırıldı.");
            }
        } catch (err) {
            alert("İşlem başarısız.");
        }
    };
    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Müşteri Kontrol Paneli</h1>
                <p className="text-gray-500 text-sm mt-1">Siparişlerinizi, rezervasyonlarınızı ve destek taleplerinizi buradan yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sol Taraf: Menü Sekmeleri */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit space-y-1">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "settings" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        ⚙️ Hesap Ayarlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "orders" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        📦 Sipariş Takibi
                    </button>
                    <button
                        onClick={() => setActiveTab("reservations")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "reservations" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🗓️ Atölye Rezervasyonlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "favorites" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        ❤️ Favori Eserlerim
                    </button>
                    <button
                        onClick={() => setActiveTab("support")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "support" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🎫 Destek Taleplerim
                    </button>
                </div>

                {/* Sağ Taraf: Dinamik İçerik Alanı */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    {activeTab === "settings" && <AccountSettings />}
                    {/* Siparişler Sekmesi */}
                    {activeTab === "orders" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Sipariş Geçmişiniz</h2>
                                <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-3 py-1 rounded-md">
                                    {orders.length} Sipariş Mevcut
                                </span>
                            </div>
                            {orders.map((order, index) => (
                                <div key={`order-${order.order_id || index}`} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-stone-300 transition-all duration-200">
                                    {/* Üst Bilgi Çubuğu */}
                                    <div className="bg-stone-50 border-b border-stone-100 px-5 py-3.5 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-4 text-sm">
                                            <p className="text-neutral-500 font-light">
                                                Sipariş No: <span className="font-mono font-bold text-neutral-900">{order.order_id}</span>
                                            </p>
                                            <span className="text-stone-300">|</span>
                                            <p className="text-neutral-500 font-light">
                                                Tarih: <span className="font-medium text-neutral-800">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : "Tarih Yok"}
                                                </span>
                                            </p>
                                        </div>
                                        {/* 🔥 DURUMA GÖRE DİNAMİK RENKLENEN BADGE 🔥 */}
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.status === "Ödendi" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            order.status === "Hazırlanıyor" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                order.status === "Kargoya Verildi" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                    order.status === "Teslim Edildi" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        "bg-red-50 text-red-700 border-red-200"
                                            }`}>
                                            ● {order.status}
                                        </span>
                                    </div>

                                    {/* Orta Gövde */}
                                    <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                {order.image_url ? (
                                                    <img
                                                        src={order.image_url}
                                                        alt={order.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl opacity-40">🎨</span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-neutral-900 leading-tight">{order.title}</h3>
                                                <p className="text-xs text-neutral-400 font-light mt-1">Sipariş Türü: Sanat Eseri</p>
                                            </div>
                                        </div>

                                        {/* Fiyat ve Aksiyon */}
                                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Toplam Tutar</span>
                                                <span className="text-xl font-black text-neutral-950">
                                                    {order.amount ? order.amount.toLocaleString("tr-TR") : "0"} ₺
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* 🔥 KARGO TAKİP BUTONU (Sadece kargoya verildiyse çıkar) 🔥 */}
                                                {order.status === "Kargoya Verildi" && (
                                                    <button
                                                        onClick={() => alert("Kargo Takip No: 1Z9999999999999999 (Aras Kargo)")}
                                                        className="bg-purple-600 text-white border border-purple-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
                                                    >
                                                        📦 Kargo Takip
                                                    </button>
                                                )}

                                                {/* 🔥 İPTAL BUTONU (Sadece iptal edilebilir aşamalarda çıkar) 🔥 */}
                                                {(order.status === "Ödendi" || order.status === "Hazırlanıyor") && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.order_id)}
                                                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        İptal Et
                                                    </button>
                                                )}

                                                {/* Sabit Sipariş Detayı Butonu */}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="bg-white border border-stone-200 text-neutral-600 hover:bg-stone-50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    Sipariş Detayı
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Rezervasyonlar Sekmesi */}
                    {activeTab === "reservations" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Atölye Kayıtlarınız</h2>

                            {editingRez ? (
                                <EditReservationForm
                                    rez={editingRez}
                                    onCancel={() => setEditingRez(null)}
                                    onSave={(id, d, c, t) => { // 4. parametre olan 't' (time) eklendi
                                        handleUpdateReservation(id, d, c, t); // Buradan da gönderiyoruz
                                        setEditingRez(null);
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {reservations.length === 0 && <p className="text-sm text-gray-500">Henüz bir atölye rezervasyonunuz bulunmuyor.</p>}
                                    {reservations.map((rez) => (
                                        <ReservationCard
                                            key={rez.id || rez.reservation_id}
                                            rez={rez}
                                            onCancel={() => handleCancelReservation(rez.id || rez.reservation_id)}
                                            onEdit={(r) => setEditingRez(r)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Favoriler Sekmesi */}
                    {activeTab === "favorites" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Favorilediğiniz Eserler</h2>
                            {favorites.length === 0 && <p className="text-sm text-gray-500">Henüz favorilere eklediğiniz bir eser bulunmuyor.</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {favorites.map((fav) => (
                                    <div key={`fav-${fav.artwork_id || index}`} className="border border-gray-100 rounded-lg overflow-hidden flex bg-gray-50 hover:shadow-md transition-shadow relative">
                                        <img src={fav.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=200"} alt={fav.title} className="w-24 h-24 object-cover flex-shrink-0" />
                                        <div className="p-3 flex flex-col justify-between text-sm w-full">
                                            <div>
                                                <h3 className="font-bold text-gray-800 truncate w-36">{fav.title}</h3>
                                                <p className="text-gray-400 text-xs">Sanatçı: {fav.artist_name || "Bilinmiyor"}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-indigo-600">{fav.price ? fav.price.toLocaleString("tr-TR") : "0"} ₺</span>

                                                {/* Favoriden Kaldırma Butonu */}
                                                <button
                                                    onClick={() => handleRemoveFavorite(fav.artwork_id || fav.id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer border border-red-100"
                                                >
                                                    🗑️ Kaldır
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Destek Talepleri Sekmesi */}
                    {activeTab === "support" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h2 className="text-xl font-bold text-gray-800">Destek Talepleriniz</h2>
                                <button className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm active:scale-95">
                                    ➕ Yeni Talep Oluştur
                                </button>
                            </div>
                            {tickets.length === 0 && <p className="text-sm text-gray-500">Açık bir destek talebiniz bulunmuyor.</p>}
                            {tickets.map((ticket) => (
                                <div key={`ticket-${ticket.id || index}`} className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm flex justify-between items-center hover:border-indigo-200 transition-colors">
                                    <div>
                                        <span className="font-mono text-xs text-indigo-600 block">#{ticket.id}</span>
                                        <span className="font-semibold text-gray-800">{ticket.subject}</span>
                                        <span className="text-gray-400 block text-xs mt-0.5">Oluşturma: {ticket.date}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ticket.status === "Cevaplandı" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{ticket.status}</span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            {/* Sipariş Detay Modalı */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">Sipariş Detayı</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Sipariş No:</span>
                                <span className="font-bold">#{selectedOrder.order_id}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Ürün:</span>
                                <span className="font-bold">{selectedOrder.title}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Tutar:</span>
                                <span className="font-bold">{selectedOrder.amount} ₺</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Durum:</span>
                                <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full mt-8 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}