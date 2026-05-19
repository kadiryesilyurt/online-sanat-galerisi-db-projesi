"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // useRouter eklendi kanka!

const bgImages = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547891654-e66ed7edd96c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1722841109965-813cb98d7ab9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0"
];

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Yönlendirme için motoru çalıştırdık
    const mode = searchParams.get("mode");

    const [isLogin, setIsLogin] = useState(true);
    const [currentBg, setCurrentBg] = useState(0);
    const [prevBg, setPrevBg] = useState(0);
    const [loading, setLoading] = useState(false); // Butonu disable etmek için state ekledim

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        bgImages.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPrevBg(currentBg);
            setCurrentBg((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [currentBg]);

    useEffect(() => {
        if (mode === "signup") setIsLogin(false);
        else if (mode === "login") setIsLogin(true);
    }, [mode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // İŞTE BURASI TAMAMEN KADİR'İN BACKEND'İNE GÖRE YENİDEN YAZILDI 🚀
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Adresleri Kadir'in routerlarına göre düzelttik
        const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}${endpoint}`;

        try {
            let response;

            if (isLogin) {
                // GİRİŞ YAPMA: FastAPI OAuth2 Form Data standardı bekliyor
                const loginData = new URLSearchParams();
                loginData.append("username", formData.email); // Dikkat: email değil username olarak gidiyor!
                loginData.append("password", formData.password);

                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: loginData.toString(),
                });
            } else {
                // KAYIT OLMA: schemas.py'deki UserCreate şemasına uygun JSON
                const registerData = {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    password: formData.password
                };

                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(registerData),
                });
            }

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    // Sihirli anahtarı (Token) kaydediyoruz ki backend bizi tanısın!
                    localStorage.setItem("token", data.access_token);
                    alert("🎉 Giriş başarılı kanka! Ana sayfaya yönlendiriliyorsun.");

                    // 🚀 ROUTER PUSH YERİNE BURAYI BÖYLE DEĞİŞTİRİYORUZ:
                    window.location.href = "/"; // ✅ Sayfayı ve Navbar'ı tazeleyerek ana sayfaya fırlatır!
                } else {
                    alert("🎊 Kayıt başarıyla oluşturuldu! Şimdi giriş yapabilirsin.");
                    setIsLogin(true); // Başarılı kayıttan sonra giriş ekranına geçiriyoruz
                    setFormData({ ...formData, password: "" }); // Şifreyi temizliyoruz
                }
            } else {
                alert(`Hata: ${data.detail || "Bilgileri kontrol et kanka."}`);
            }
        } catch (error) {
            console.error("Backend bağlantı hatası:", error);
            alert("Kadir'in backend sunucusuna bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-neutral-950 overflow-y-auto antialiased font-sans">
            {/* ARKAPLAN GÖRSELLERİ (Senin harika tasarımın) */}
            {bgImages.map((imgUrl, index) => {
                let opacityClass = "opacity-0 z-0";
                let transitionClass = "transition-opacity duration-700 ease-in-out";
                if (index === currentBg) opacityClass = "opacity-100 z-20";
                else if (index === prevBg) { opacityClass = "opacity-100 z-10"; transitionClass = ""; }
                return (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center contrast-115 brightness-[0.55] ${transitionClass} ${opacityClass}`}
                        style={{ backgroundImage: `url('${imgUrl}')` }}
                    />
                );
            })}

            <div className="absolute inset-0 bg-neutral-950/30 pointer-events-none z-25"></div>

            {/* FORM KARTI */}
            <div className="relative z-30 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-8 md:p-10 border border-white/20 transform transition-all duration-300">

                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md uppercase">
                        Sanat Galerisi
                    </span>
                    <button type="button" onClick={() => router.push("/")} className="text-xs font-semibold text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer">
                        ← Galeriye Dön
                    </button>
                </div>

                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        {isLogin ? "Oturum Açın" : "Yeni Hesap Oluşturun"}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500 font-medium">
                        {isLogin ? "Topluluğa katılmak ister misiniz? " : "Zaten üye misiniz? "}
                        <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4 transition-colors cursor-pointer">
                            {isLogin ? "Kayıt Ol" : "Giriş Yap"}
                        </button>
                    </p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-3.5">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Adınız</label>
                                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200" placeholder="Ahmet" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Soyadınız</label>
                                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200" placeholder="Yılmaz" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">E-posta Adresi</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200" placeholder="ahmet@example.com" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Şifre</label>
                                {isLogin && <button type="button" className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors">Şifremi Unuttum?</button>}
                            </div>
                            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200" placeholder="••••••••" />
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex items-center pt-1">
                            <input id="remember-me" type="checkbox" className="h-4 w-4 text-neutral-950 focus:ring-teal-500 border-neutral-300 rounded-md accent-neutral-950" />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-neutral-400 font-medium select-none">Beni bu cihazda hatırla</label>
                        </div>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-neutral-950 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-950 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:bg-neutral-500">
                            {loading ? "Bekleniyor..." : (isLogin ? "Oturum Aç" : "Kayıt Ol ve Başla")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-neutral-950 flex items-center justify-center text-white font-bold">Yükleniyor...</div>}>
            <AuthForm />
        </Suspense>
    );
}