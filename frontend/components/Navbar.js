"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Sayfa yüklendiğinde tarayıcıda token var mı kontrol ediyoruz
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // Oturumu güvenle kapatıp ana sayfaya fırlatma fonksiyonu
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        alert("Oturum başarıyla kapatıldı kanka!");
        window.location.href = "/"; // Tüm state'leri temizlemek için tam sayfa yenileme yapıyoruz
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Sol Taraf: Logo */}
                    <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                        Sanat<span className="text-gray-800">Galerisi</span>
                    </Link>

                    {/* Orta Kısım: Menü */}
                    <div className="hidden md:flex space-x-8 items-center font-medium text-gray-600">
                        <Link href="/" className="hover:text-indigo-600 transition-colors duration-200">
                            Keşfet
                        </Link>
                        <Link href="/etkinlikler" className="hover:text-indigo-600 transition-colors duration-200">
                            Atölyeler
                        </Link>
                        {/* Siparişlerim sekmesini sadece giriş yapılmışsa gösteriyoruz */}
                        {isLoggedIn && (
                            <Link href="/panel" className="hover:text-indigo-600 transition-colors duration-200">
                                Siparişlerim
                            </Link>
                        )}
                    </div>

                    {/* Sağ Taraf: Dinamik Giriş/Çıkış Butonları */}
                    <div className="flex items-center space-x-4">
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    href="/auth?mode=login"
                                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors hidden md:block"
                                >
                                    Giriş Yap
                                </Link>
                                <Link
                                    href="/auth?mode=signup"
                                    className="bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-indigo-600 transition-colors font-medium shadow-sm"
                                >
                                    Kayıt Ol
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/panel"
                                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hidden md:block"
                                >
                                    👤 Hesabım
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-600 px-5 py-2 rounded-md hover:bg-red-100 transition-colors font-medium shadow-sm cursor-pointer"
                                >
                                    🚪 Çıkış Yap
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}