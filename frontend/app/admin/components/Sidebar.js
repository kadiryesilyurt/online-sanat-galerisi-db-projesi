"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", path: "/admin", icon: "📊" },
        { name: "Sipariş Yönetimi", path: "/admin/orders", icon: "📦" },
        { name: "Eser Yönetimi", path: "/admin/artworks", icon: "🎨" },
        { name: "Rezervasyonlar", path: "/admin/reservations", icon: "📅" },
        { name: "Geri Dön", path: "/", icon: "🏠" },
    ];

    return (
        <aside className="w-64 bg-stone-900 text-white fixed h-full flex flex-col shadow-xl">
            <div className="p-6 border-b border-stone-800">
                <h2 className="text-xl font-black tracking-tighter text-indigo-400">GALERİ ADMİN</h2>
                <p className="text-[10px] text-stone-500 font-bold uppercase mt-1">Yönetim Paneli</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === item.path
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                            : "text-stone-400 hover:bg-stone-800 hover:text-white"
                            }`}
                    >
                        <span>{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-stone-800">
                <button className="w-full bg-stone-800 hover:bg-red-900/30 hover:text-red-400 text-stone-400 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}