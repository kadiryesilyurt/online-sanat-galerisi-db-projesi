"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

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

    const handleLogout = () => {
        console.log("Çıkış fonksiyonu tetiklendi");
        localStorage.removeItem("token");
        setIsLoggedIn(false);

        toast.success('Oturum başarıyla kapatıldı!', {
            duration: 2000, // 2 saniye ekranda kalsın
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
            },
            icon: '👋',
        });

        // Sayfayı hemen değil, toast mesajı göründükten sonra yönlendir
        setTimeout(() => {
            window.location.href = "/";
        }, 1500); // 1.5 saniye sonra yönlendir
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Sol Taraf: Logo */}
                    <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                        Arte<span className="text-gray-800">Base</span>
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