"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast';

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
    const router = useRouter();
    const mode = searchParams.get("mode");

    // GÖRÜNÜM KONTROLÜ: 'login', 'signup', 'forgot-password', 'verify-code', 'reset-password'
    const [view, setView] = useState("login");
    const [currentBg, setCurrentBg] = useState(0);
    const [prevBg, setPrevBg] = useState(0);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        code: "",          // Onay kodu için
        newPassword: ""    // Şifre sıfırlama için
    });

    // Görsel Slider Mantığı (Sabit Kaldı)
    useEffect(() => {
        bgImages.forEach((src) => { const img = new Image(); img.src = src; });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPrevBg(currentBg);
            setCurrentBg((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [currentBg]);

    // URL'den gelen mode'a göre görünümü ayarla
    useEffect(() => {
        if (mode === "signup") setView("signup");
        else setView("login");
    }, [mode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        let endpoint = "";
        let options = { method: "POST", headers: {} };

        try {
            if (view === "login") {
                endpoint = "/api/users/login";
                const loginData = new URLSearchParams();
                loginData.append("username", formData.email);
                loginData.append("password", formData.password);
                options.headers["Content-Type"] = "application/x-www-form-urlencoded";
                options.body = loginData.toString();
            }
            else if (view === "signup") {
                endpoint = "/api/users/register";
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    password: formData.password
                });
            }
            else if (view === "forgot-password") {
                // KADİR: Şifre sıfırlama kodu gönderen endpoint
                endpoint = "/api/users/forgot-password";
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify({ email: formData.email });
            }
            else if (view === "verify-code") {
                // KADİR: Kodu doğrulayan endpoint
                endpoint = "/api/users/verify-code";
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify({ email: formData.email, code: formData.code });
            }
            else if (view === "reset-password") {
                // KADİR: Yeni şifreyi kaydeden endpoint
                endpoint = "/api/users/reset-password";
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify({
                    email: formData.email,
                    code: formData.code,
                    new_password: formData.newPassword
                });
            }

            const response = await fetch(`${backendUrl}${endpoint}`, options);
            const data = await response.json();

            if (response.ok) {
                if (view === "login") {
                    localStorage.setItem("token", data.access_token);
                    toast.success('Giriş işleminiz başarıyla tamamlandı.', { icon: '✅' });
                    setTimeout(() => window.location.assign("/"), 1500);
                }
                else if (view === "signup") {
                    toast.success('Kaydınız başarıyla oluşturuldu.', { icon: '🎉' });
                    setView("login");
                }
                else if (view === "forgot-password") {
                    toast.success('Onay kodu e-postanıza gönderildi.', { icon: '📧' });
                    setView("verify-code");
                }
                else if (view === "verify-code") {
                    toast.success('Kod doğrulandı. Yeni şifrenizi belirleyin.', { icon: '🔓' });
                    setView("reset-password");
                }
                else if (view === "reset-password") {
                    toast.success('Şifreniz başarıyla güncellendi.', { icon: '✨' });
                    setView("login");
                }
            } else {
                toast.error(data.detail || "İşlem gerçekleştirilemedi.", { icon: '⚠️' });
            }
        } catch (error) {
            toast.error('Sunucu ile iletişim kurulamadı.', { icon: '🔌' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-neutral-950 overflow-y-auto antialiased font-sans">
            {/* ARKAPLAN GÖRSELLERİ (Aynı Kaldı) */}
            {bgImages.map((imgUrl, index) => (
                <div key={index} className={`absolute inset-0 bg-cover bg-center contrast-115 brightness-[0.55] transition-opacity duration-700 ease-in-out ${index === currentBg ? "opacity-100 z-20" : index === prevBg ? "opacity-100 z-10" : "opacity-0 z-0"}`} style={{ backgroundImage: `url('${imgUrl}')` }} />
            ))}
            <div className="absolute inset-0 bg-neutral-950/30 pointer-events-none z-25"></div>

            {/* FORM KARTI */}
            <div className="relative z-30 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-8 md:p-10 border border-white/20">

                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md uppercase">Sanat Galerisi</span>
                    <button type="button" onClick={() => (view === 'login' ? router.push("/") : setView('login'))} className="text-xs font-semibold text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer">
                        {view === 'login' ? "← Galeriye Dön" : "← Girişe Dön"}
                    </button>
                </div>

                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        {view === "login" && "Oturum Açın"}
                        {view === "signup" && "Yeni Hesap"}
                        {view === "forgot-password" && "Şifremi Unuttum"}
                        {view === "verify-code" && "Kodu Doğrula"}
                        {view === "reset-password" && "Yeni Şifre Belirle"}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500 font-medium">
                        {view === "login" && (
                            <>Hesabınız yok mu? <button onClick={() => setView('signup')} className="font-bold text-teal-600 underline cursor-pointer">Kayıt Ol</button></>
                        )}
                        {view === "signup" && (
                            <>Zaten üye misiniz? <button onClick={() => setView('login')} className="font-bold text-teal-600 underline cursor-pointer">Giriş Yap</button></>
                        )}
                        {view === "forgot-password" && "E-posta adresinize bir doğrulama kodu göndereceğiz."}
                        {view === "verify-code" && `${formData.email} adresine gelen 6 haneli kodu girin.`}
                        {view === "reset-password" && "Güçlü ve hatırlayabileceğiniz bir şifre seçin."}
                    </p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-3.5">

                        {/* KAYIT OLMA ALANLARI */}
                        {view === "signup" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Ad</label>
                                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" placeholder="Ahmet" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Soyad</label>
                                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" placeholder="Yılmaz" />
                                </div>
                            </div>
                        )}

                        {/* E-POSTA ALANI (Reset Password hariç her yerde var) */}
                        {view !== "reset-password" && view !== "verify-code" && (
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase">E-posta</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" placeholder="ornek@mail.com" />
                            </div>
                        )}

                        {/* ŞİFRE ALANI (Sadece Login ve Signup) */}
                        {(view === "login" || view === "signup") && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Şifre</label>
                                    {view === "login" && (
                                        <button type="button" onClick={() => setView('forgot-password')} className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer">Şifremi Unuttum?</button>
                                    )}
                                </div>
                                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" placeholder="••••••••" />
                            </div>
                        )}

                        {/* KOD DOĞRULAMA ALANI */}
                        {view === "verify-code" && (
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">6 Haneli Kod</label>
                                <input type="text" name="code" maxLength="6" required value={formData.code} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-2xl font-black tracking-[1em]" placeholder="000000" />
                            </div>
                        )}

                        {/* YENİ ŞİFRE ALANI */}
                        {view === "reset-password" && (
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase">Yeni Şifre</label>
                                <input type="password" name="newPassword" required value={formData.newPassword} onChange={handleInputChange} className="mt-1 block w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" placeholder="••••••••" />
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-neutral-950 hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:bg-neutral-500 cursor-pointer">
                            {loading ? "İşleniyor..." : (
                                view === "login" ? "Oturum Aç" :
                                    view === "signup" ? "Hesap Oluştur" :
                                        view === "forgot-password" ? "Kod Gönder" :
                                            view === "verify-code" ? "Kodu Doğrula" : "Şifreyi Güncelle"
                            )}
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