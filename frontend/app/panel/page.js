"use client";
import { useState } from "react";

export default function PanelPage() {
    // Aktif sekmeyi tutar: 'orders', 'reservations', 'favorites', 'support'
    const [activeTab, setActiveTab] = useState("orders");

    // Ödev gereksinimlerini test etmek için mock verilerimiz (Neon DB'den gelecek)
    const [favorites, setFavorites] = useState([
        { id: 1, title: "Yıldızlı Gece Yansımaları", artist: "Ahmet Yılmaz", price: "15.000 ₺" },
        { id: 2, title: "Soyut Düşünceler", artist: "Zeynep Kaya", price: "8.500 ₺" }
    ]);

    const [reservations, setReservations] = useState([
        { id: 1, title: "Temel Yağlı Boya Atölyesi", date: "25 Mayıs 2026", count: 2, status: "Aktif" },
        { id: 2, title: "Dijital Sanata Giriş", date: "28 Mayıs 2026", count: 1, status: "İptal Edildi" }
    ]);

    const [orders, setOrders] = useState([
        { id: "ORD-9921", title: "Zamanın Dokusu", date: "12 Mayıs 2026", amount: "12.000 ₺", status: "Kargoya Verildi" }
    ]);

    const [tickets, setTickets] = useState([
        { id: 1, subject: "Ödeme Onayı Hakkında", date: "15 Mayıs 2026", status: "Cevaplandı" }
    ]);

    // Favorilerden Eser Çıkarma (Madde 3)
    const removeFavorite = (id) => {
        setFavorites(favorites.filter(item => item.id !== id));
        alert("Eser favorilerden çıkarıldı.");
    };

    // Rezervasyonu İptal Etme (Madde 5)
    const cancelReservation = (id) => {
        setReservations(reservations.map(res => res.id === id ? { ...res, status: "İptal Edildi" } : res));
        alert("Rezervasyonunuz iptal edildi.");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesap Paneli</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sol Taraf: Menü Sekmeleri */}
                <div className="flex flex-col space-y-2 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "orders" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        📦 Sipariş Takibi
                    </button>
                    <button
                        onClick={() => setActiveTab("reservations")}
                        className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "reservations" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        📅 Atölye Rezervasyonlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "favorites" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🤍 Favori Listem
                    </button>
                    <button
                        onClick={() => setActiveTab("support")}
                        className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "support" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        💬 Destek Taleplerim
                    </button>
                </div>

                {/* Sağ Taraf: İçerik Alanı */}
                <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

                    {/* SECKME 1: SİPARİŞ TAKİBİ (Madde 8) */}
                    {activeTab === "orders" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Geçmiş Siparişleriniz</h2>
                            {orders.map(order => (
                                <div key={order.id} className="border border-gray-100 rounded-lg p-4 mb-3 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-600">{order.id}</span>
                                        <h3 className="font-bold text-gray-800 mt-0.5">{order.title}</h3>
                                        <p className="text-xs text-gray-400">Tarih: {order.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900">{order.amount}</span>
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SEKME 2: REZERVASYONLARIM (Madde 5 ve 8) */}
                    {activeTab === "reservations" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Atölye Rezervasyon Durumları</h2>
                            {reservations.map(res => (
                                <div key={res.id} className="border border-gray-100 rounded-lg p-4 mb-3 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{res.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">📅 {res.date} | 👥 {res.count} Kişi</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${res.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {res.status}
                                        </span>
                                        {res.status === "Aktif" && (
                                            <button
                                                onClick={() => cancelReservation(res.id)}
                                                className="text-xs font-bold text-red-600 hover:underline border border-red-200 px-2 py-1 rounded bg-white"
                                            >
                                                İptal Et
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SEKME 3: FAVORİLERİM (Madde 3) */}
                    {activeTab === "favorites" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Beğendiğiniz Eserler</h2>
                            {favorites.length === 0 ? (
                                <p className="text-gray-400 text-sm">Favori listeniz boş.</p>
                            ) : (
                                favorites.map(fav => (
                                    <div key={fav.id} className="border border-gray-100 rounded-lg p-4 mb-3 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{fav.title}</h3>
                                            <p className="text-xs text-gray-400">Sanatçı: {fav.artist}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900 text-sm">{fav.price}</span>
                                            <button
                                                onClick={() => removeFavorite(fav.id)}
                                                className="text-xs font-bold text-gray-500 hover:text-red-600 bg-white border px-2 py-1 rounded"
                                            >
                                                Kaldır
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* SEKME 4: DESTEK TALEPLERİM (Madde 10) */}
                    {activeTab === "support" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Destek Talebi Geçmişi</h2>
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="border border-gray-100 rounded-lg p-4 mb-3 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-400">Oluşturma: {ticket.date}</p>
                                    </div>
                                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        {ticket.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}