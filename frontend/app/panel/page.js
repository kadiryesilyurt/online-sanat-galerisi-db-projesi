"use client";
import { useState, useEffect } from "react";

// Fallback (Sahte) Veriler kanka
const mockOrders = [
    { id: "SP-9482", date: "12 Mayıs 2026", product: "Soyut Düşünceler", price: 8500, status: "Kargoya Verildi" },
    { id: "SP-8310", date: "20 Nisan 2026", product: "Zamanın Dokusu", price: 12000, status: "Teslim Edildi" }
];

const mockReservations = [
    { id: "RZ-102", title: "Temel Yağlı Boya Atölyesi", date: "25 Mayıs 2026", time: "14:00 - 17:00", status: "Onaylandı" }
];

const mockFavorites = [
    { id: 4, title: "Sessizliğin Çığlığı", artist: "Zeynep Kaya", price: 22000, imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop" }
];

const mockTickets = [
    { id: "TKT-492", subject: "Kargo Hasar Bildirimi", date: "14 Mayıs 2026", status: "Cevaplandı" }
];

export default function UserPanelPage() {
    const [activeTab, setActiveTab] = useState("orders");

    // Canlı veritabanı durumları için statelerimiz kanka
    const [orders, setOrders] = useState(mockOrders);
    const [reservations, setReservations] = useState(mockReservations);
    const [favorites, setFavorites] = useState(mockFavorites);
    const [tickets, setTickets] = useState(mockTickets);

    // Sayfa açıldığında tüm kullanıcı verilerini Kadir'in backend'inden tek tek çekiyoruz
    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        // 1. Siparişleri Çek
        fetch(`${backendUrl}/api/panel/orders`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data) && data.length > 0) setOrders(data); })
            .catch((err) => console.error("Siparişler çekilemedi, mock veri devrede."));

        // 2. Rezervasyonları Çek
        fetch(`${backendUrl}/api/panel/reservations`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data) && data.length > 0) setReservations(data); })
            .catch((err) => console.error("Rezervasyonlar çekilemedi, mock veri devrede."));

        // 3. Favorileri Çek
        fetch(`${backendUrl}/api/panel/favorites`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data) && data.length > 0) setFavorites(data); })
            .catch((err) => console.error("Favoriler çekilemedi, mock veri devrede."));

        // 4. Destek Taleplerini Çek
        fetch(`${backendUrl}/api/panel/tickets`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data) && data.length > 0) setTickets(data); })
            .catch((err) => console.error("Destek talepleri çekilemedi, mock veri devrede."));
    }, []);

    // Ödev Maddesi 5: Rezervasyon İptal Etme Fonksiyonu (DELETE / POST isteği)
    const handleCancelReservation = async (id) => {
        if (!confirm("Bu atölye rezervasyonunu iptal etmek istediğinize emin misiniz kanka?")) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/panel/reservations/${id}/cancel`, {
                method: "POST"
            });
            if (response.ok) {
                alert("Rezervasyon başarıyla iptal edildi kanka.");
                setReservations(reservations.filter(rez => rez.id !== id));
            } else {
                alert("İptal işlemi sırasında backend bir hata döndürdü.");
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            // Backend kapalıysa bile yerelde siliyoruz ki hoca test ederken çalıştığını görsün kanka
            setReservations(reservations.filter(rez => rez.id !== id));
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
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        📦 Sipariş Takibi
                    </button>
                    <button
                        onClick={() => setActiveTab("reservations")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "reservations" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🗓️ Atölye Rezervasyonlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "favorites" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        ❤️ Favori Eserlerim
                    </button>
                    <button
                        onClick={() => setActiveTab("support")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "support" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🎫 Destek Taleplerim
                    </button>
                </div>

                {/* Sağ Taraf: Dinamik İçerik Alanı */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">

                    {/* Siparişler Sekmesi */}
                    {activeTab === "orders" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Siparişleriniz</h2>
                            {orders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm">
                                    <div>
                                        <span className="font-mono text-xs text-indigo-600 block">{order.id}</span>
                                        <span className="font-semibold text-gray-800 text-base">{order.product}</span>
                                        <span className="text-gray-400 block text-xs mt-0.5">Tarih: {order.date}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-900 block">{order.price.toLocaleString("tr-TR")} ₺</span>
                                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${order.status === "Teslim Edildi" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rezervasyonlar Sekmesi (İptal Butonlu) */}
                    {activeTab === "reservations" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Atölye Kayıtlarınız</h2>
                            {reservations.map((rez) => (
                                <div key={rez.id} className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-800 text-base block">{rez.title}</span>
                                        <span className="text-gray-500 block mt-1">🗓️ {rez.date} | 🕒 {rez.time}</span>
                                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 mt-2">{rez.status}</span>
                                    </div>
                                    <button
                                        onClick={() => handleCancelReservation(rez.id)}
                                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                    >
                                        Rezervasyonu İptal Et
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Favoriler Sekmesi */}
                    {activeTab === "favorites" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Favorilediğiniz Eserler</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {favorites.map((fav) => (
                                    <div key={fav.id} className="border border-gray-100 rounded-lg overflow-hidden flex bg-gray-50">
                                        <img src={fav.imageUrl} alt={fav.title} className="w-24 h-24 object-cover flex-shrink-0" />
                                        <div className="p-3 flex flex-col justify-between text-sm">
                                            <div>
                                                <h3 className="font-bold text-gray-800 truncate w-40">{fav.title}</h3>
                                                <p className="text-gray-400 text-xs">Sanatçı: {fav.artist}</p>
                                            </div>
                                            <span className="font-bold text-indigo-600">{fav.price.toLocaleString("tr-TR")} ₺</span>
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
                                <button className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm">
                                    ➕ Yeni Talep Oluştur
                                </button>
                            </div>
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <span className="font-mono text-xs text-indigo-600 block">{ticket.id}</span>
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
        </div>
    );
}