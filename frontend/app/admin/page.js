"use client";
import { useState, useEffect } from "react";

// 1. StatCard bileşenini dışarıda tanımlıyoruz
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h3 className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">{title}</h3>
        <p className="text-2xl font-black text-stone-900 mt-2">{value}</p>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total_sales: 0, pending_orders: 0, active_artworks: 0 });
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        // İstatistikleri çek
        fetch("http://127.0.0.1:8000/api/orders/dashboard-stats", { headers })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // Son aktiviteleri çek
        fetch("http://127.0.0.1:8000/api/orders/recent-activities", { headers })
            .then(res => res.json())
            .then(data => setActivities(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-stone-900 mb-8">Hoş Geldin, Patron! 👋</h1>

            {/* İstatistik Kutucukları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="TOPLAM SATIŞ" value={`${stats.total_sales.toLocaleString("tr-TR")} ₺`} />
                <StatCard title="BEKLEYEN SİPARİŞ" value={`${stats.pending_orders} Adet`} />
                <StatCard title="AKTİF ESER" value={`${stats.active_artworks} Eser`} />
            </div>

            {/* Son Aktiviteler Listesi */}
            <div className="mt-8 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <h3 className="text-sm font-black text-stone-900 mb-4">Son Aktiviteler</h3>
                <div className="space-y-4">
                    {activities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0">
                            <div>
                                <p className="text-sm font-bold text-stone-800">{act.description}</p>
                                <p className="text-[10px] font-medium text-stone-400">{act.date}</p>
                            </div>
                            <span className="text-sm font-black text-emerald-600">+{act.amount.toLocaleString("tr-TR")} ₺</span>
                        </div>
                    ))}
                    {activities.length === 0 && <p className="text-stone-400 text-xs italic">Henüz bir aktivite yok.</p>}
                </div>
            </div>
        </div>
    );
}