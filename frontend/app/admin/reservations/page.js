"use client";
import { useState, useEffect } from "react";

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchReservations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/api/panel/reservations/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setReservations(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${backendUrl}/api/panel/reservations/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchReservations(); // Onayladığında tabloyu tazele
            } else {
                alert("İşlem başarısız.");
            }
        } catch (error) {
            alert("Sunucu hatası.");
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const handleUpdateGuests = async (id, currentCount, type, resDate) => {
        const token = localStorage.getItem("token");
        const newCount = type === "increase" ? currentCount + 1 : currentCount - 1;

        if (newCount < 1) return;

        try {
            const res = await fetch(`${backendUrl}/api/panel/reservations/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    participant_count: newCount,
                    reservation_date: resDate
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Sadece listeyi yeniliyoruz, alert ile rahatsız etmiyoruz
                fetchReservations();
            } else {
                // 🚀 Backend'den gelen KURAL hatasını yakala (Aynı gün hatası vs.)
                alert(data.detail || "Güncelleme başarısız.");
            }
        } catch (error) {
            alert("Sistem hatası.");
        }
    };

    if (loading) return <div className="p-8 font-bold text-stone-500">Rezervasyonlar yükleniyor...</div>;

    return (
        <div>
            <h1 className="text-3xl font-black text-stone-900 mb-8">Etkinlik Rezervasyonları</h1>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 border-b text-stone-500 text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Rez ID</th>
                            <th className="p-4">Etkinlik</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4 text-center">Kişi Sayısı</th>
                            <th className="p-4 text-right">Toplam Tutar</th>
                            <th className="p-4">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {reservations.map((res) => {
                            const isToday = new Date(res.reservation_date).toDateString() === new Date().toDateString();

                            return (
                                <tr key={res.reservation_id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-stone-900">#{res.reservation_id}</td>
                                    <td className="p-4 font-semibold text-stone-700">{res.event_title}</td>
                                    <td className="p-4 text-sm font-medium">
                                        {new Date(res.reservation_date).toLocaleDateString("tr-TR")}
                                        {isToday && <span className="ml-2 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">BUGÜN!</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleUpdateGuests(res.reservation_id, res.participant_count, "decrease", res.reservation_date)}
                                                className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-6 text-stone-900 text-lg">{res.participant_count}</span>
                                            <button
                                                onClick={() => handleUpdateGuests(res.reservation_id, res.participant_count, "increase", res.reservation_date)}
                                                className="w-7 h-7 rounded-lg bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors shadow-md shadow-stone-900/20 cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-black text-stone-900 text-lg">
                                        {res.total_amount?.toLocaleString("tr-TR")} ₺
                                    </td>
                                    {/* 🔥 BURASI GÜNCELLENDİ: Onay/Red Butonları Geldi! 🔥 */}
                                    <td className="p-4">
                                        {res.status === "Beklemede" ? (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-amber-100 text-amber-700 border border-amber-200 font-bold text-[10px] uppercase px-2 py-1 rounded-md animate-pulse">
                                                    Onay Bekliyor
                                                </span>
                                                <button
                                                    onClick={() => handleStatusChange(res.reservation_id, "Onaylandı")}
                                                    className="w-7 h-7 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                                                    title="Onayla"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(res.reservation_id, "Reddedildi")}
                                                    className="w-7 h-7 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                                                    title="Reddet"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`font-bold text-xs px-2.5 py-1 rounded-md border ${res.status === "Onaylandı" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                res.status === "Reddedildi" ? "bg-red-50 text-red-700 border-red-200" :
                                                    "bg-gray-50 text-gray-700 border-gray-200"
                                                }`}>
                                                {res.status || "Bilinmiyor"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}