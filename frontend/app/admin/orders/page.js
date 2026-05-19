"use client";
import { useState, useEffect } from "react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tüm siparişleri çek
    const fetchAllOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

            // Dikkat: Yeni yazdığımız /all endpointine gidiyoruz
            const res = await fetch(`${backendUrl}/api/orders/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Siparişler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Sipariş Statüsünü Güncelle
    const handleStatusChange = async (orderId, newStatus) => {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

        try {
            const res = await fetch(`${backendUrl}/api/orders/${orderId}/status?new_status=${newStatus}`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Sipariş durumu güncellendi!");
                fetchAllOrders(); // Tabloyu yenile
            } else {
                alert("Güncelleme başarısız oldu.");
            }
        } catch (error) {
            alert("Sunucu hatası.");
        }
    };

    if (loading) return <div className="p-8 text-stone-500 font-bold">Siparişler Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-stone-900">Sipariş Yönetimi</h1>
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">
                    Toplam {orders.length} Sipariş
                </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm font-bold uppercase tracking-wider">
                            <th className="p-4">ID</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Eser Adı</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum İşlemi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.map((order) => (
                            <tr key={order.order_id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-stone-900">#{order.order_id}</td>
                                <td className="p-4 text-sm text-stone-500">
                                    {new Date(order.created_at).toLocaleDateString("tr-TR")}
                                </td>
                                <td className="p-4 font-semibold text-stone-800">{order.title}</td>
                                <td className="p-4 font-black text-stone-900">{order.amount.toLocaleString("tr-TR")} ₺</td>
                                <td className="p-4">
                                    {/* 🔥 HOCANIN BAYILACAĞI KISIM: Statü Değiştirici 🔥 */}
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border outline-none cursor-pointer transition-colors ${order.status === "Ödendi" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                order.status === "Hazırlanıyor" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    order.status === "Kargoya Verildi" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                        order.status === "Teslim Edildi" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                            "bg-red-50 text-red-700 border-red-200"
                                            }`}
                                    >
                                        <option value="Ödendi">Ödendi</option>
                                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                                        <option value="Kargoya Verildi">Kargoya Verildi</option>
                                        <option value="Teslim Edildi">Teslim Edildi</option>
                                        <option value="İptal Edildi">İptal Edildi</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="p-8 text-center text-stone-400 font-semibold">
                        Henüz hiç sipariş yok kanka.
                    </div>
                )}
            </div>
        </div>
    );
}