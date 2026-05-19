// app/admin/layout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth?mode=login");
                return;
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
                // Kullanıcının kim olduğuna bak (Senin backend'deki endpointin neyse ona göre düzelt)
                const res = await fetch(`${backendUrl}/api/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const userData = await res.json();
                    if (userData.is_admin === true) {
                        setIsAuthorized(true); // Patron geldi, kapıları aç!
                    } else {
                        alert("Bu sayfaya erişim yetkiniz yok!");
                        router.push("/"); // Normal kullanıcıyı anasayfaya kovala
                    }
                } else {
                    router.push("/auth?mode=login");
                }
            } catch (error) {
                router.push("/");
            }
        };

        checkAdmin();
    }, [router]);

    // Yetki kontrolü bitene kadar beyaz ekran veya loading göster
    if (!isAuthorized) return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white font-bold">Yetki Kontrolü Yapılıyor...</div>;

    return (
        <div className="flex min-h-screen bg-stone-50">
            <Sidebar />
            <main className="flex-1 p-8 md:ml-64">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}