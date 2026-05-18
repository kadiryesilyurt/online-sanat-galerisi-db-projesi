"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthForm() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");

    const [isLogin, setIsLogin] = useState(true);

    // Form verilerini tek bir state içinde topluyoruz kanka
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        if (mode === "signup") {
            setIsLogin(false);
        } else if (mode === "login") {
            setIsLogin(true);
        }
    }, [mode]);

    // Inputlar değiştikçe state'i güncelleyen fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Kadir'in backend'ine istek atan asıl can alıcı fonksiyon
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Giriş mi kayıt mı olduğuna göre endpoint'i belirliyoruz
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`;

        // Kadir'e göndereceğimiz veri paketi
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : { first_name: formData.firstName, last_name: formData.lastName, email: formData.email, password: formData.password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert(isLogin ? "Giriş başarılı kanka!" : "Kayıt başarıyla oluşturuldu!");
                // Burada başarılı giriş sonrası token saklama (localStorage vb.) ve yönlendirme yapılabilir
            } else {
                alert(`Hata: ${data.message || "Bir şeyler ters gitti"}`);
            }
        } catch (error) {
            console.error("Backend bağlantı hatası:", error);
            alert("Kadir'in backend sunucusuna bağlanılamadı. Terminali ve portu kontrol edin.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {isLogin ? "Hesabınıza Giriş Yapın" : "Yeni Hesap Oluşturun"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? "Henüz üye değil misiniz? " : "Zaten hesabınız var mı? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-indigo-600 hover:text-indigo-500 underline transition-colors"
                        >
                            {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">

                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Adınız</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="Ahmet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Soyadınız</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="Yılmaz"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="ahmet@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Şifre</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">Yükleniyor...</div>}>
            <AuthForm />
        </Suspense>
    );
}