"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

const ReservationItem = ({ rez, onCancel, onUpdate }) => {
    // Kartın içindeki geçici state'ler
    const [date, setDate] = useState(rez.date || rez.reservation_date);
    const [count, setCount] = useState(rez.participant_count || rez.participants || 1);

    return (
        <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm hover:border-indigo-200 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="font-bold text-gray-800 text-base block">{rez.title || rez.event_title || "Sanat Atölyesi"}</span>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 mt-1">{rez.status || "Onaylandı"}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded text-xs" />
                <input type="number" min="1" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="p-2 border rounded text-xs" />
            </div>

            <div className="flex gap-2">
                <button onClick={() => onUpdate(rez.id || rez.reservation_id, date, count)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Güncelle</button>
                <button onClick={() => onCancel(rez.id || rez.reservation_id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white">İptal Et</button>
            </div>
        </div>
    );
};

const ReservationCard = ({ rez, onCancel, onEdit }) => (
    <div className="p-5 border border-stone-100 bg-white rounded-2xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
        <div>
            <h3 className="font-bold text-gray-900 text-lg">{rez.title || "Sanat Atölyesi"}</h3>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                <span>🗓️ {rez.date}</span>
                <span className="bg-stone-100 px-2 py-1 rounded">👥 {rez.participant_count} Kişi</span>

                {/* 🚀 İŞTE EKSİK OLAN FİYAT KISMI BURASI! 🚀 */}
                <span className="font-black text-indigo-600 text-sm">
                    💰 {rez.total_amount ? rez.total_amount.toLocaleString("tr-TR") : (rez.participant_count * 100)} ₺
                </span>

            </div>
            <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                {rez.status || "Onaylandı"}
            </span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onEdit(rez)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">Düzenle</button>
            <button onClick={() => onCancel(rez.id)} className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">İptal Et</button>
        </div>
    </div>
);

// 🔥 YENİ EKLENEN BİLEŞEN: ID'leri alıp backend'den resim ve isimleri çeker
const ComparisonDetailFetcher = ({ type, idsString }) => {
    const [details, setDetails] = useState([]);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchDetails = async () => {
            if (!idsString) return;
            const ids = idsString.split(",");
            const fetchedItems = [];

            for (let id of ids) {
                try {
                    if (!id.trim()) continue;
                    const endpoint = `${backendUrl}/api/${type === 'event' ? 'events' : 'artworks'}/${id}`;
                    const res = await fetch(endpoint);

                    if (res.ok) {
                        const data = await res.json();
                        fetchedItems.push(data);
                    }
                } catch (err) { console.error("Detay çekilemedi:", err); }
            }
            setDetails(fetchedItems);
        };
        fetchDetails();
    }, [idsString, type, backendUrl]);

    if (details.length === 0) return <div className="p-2 text-xs text-gray-400 italic">Detaylar yükleniyor...</div>;

    return (
        <div className="flex flex-wrap gap-3 mt-3 w-full">
            {details.map((item, idx) => {
                // 1. Resim yolunu düzelt
                let imageUrl = item.image_url;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `${backendUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }

                // 🔥 2. ETKİNLİKLER İÇİN YEDEK RESİM (Veritabanında resim yoksa)
                if (!imageUrl && type === 'event') {
                    imageUrl = "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800";
                }

                return (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-stone-200 w-64 shadow-sm">
                        <div className="w-12 h-12 shrink-0 rounded overflow-hidden bg-stone-100 border">
                            <img
                                src={imageUrl || "https://placehold.co/48x48?text=Sanat"}
                                alt={item.title || "Öğe"}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = "https://placehold.co/48x48?text=Hata"}
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-gray-900 truncate" title={item.title || "Bilinmiyor"}>
                                {item.title || "Bilinmiyor"}
                            </span>
                            <span className="text-[11px] font-black text-indigo-600 mt-0.5">
                                {item.price ? `${Number(item.price).toLocaleString("tr-TR")} ₺` : "Ücretsiz"}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AccountSettings = () => {
    const [userData, setUserData] = useState({ first_name: "", last_name: "", email: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:8000/api/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            console.log("🔥 BACKEND'DEN GELEN JSON:", data); // F12 -> Console'da buna bak!

            if (res.ok) {
                setUserData(data);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/users/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (res.ok) {
            toast.success('Profil bilgileriniz başarıyla güncellendi.', {
                duration: 3000,
                style: {
                    background: '#3B82F6', // Profil/Hesap işlemleri için "Mavi" tonu
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '👤', // Profil temalı ikon
            });
            setIsEditing(false);
        } else {
            toast.error('Güncelleme işlemi gerçekleştirilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.', {
                duration: 4000,
                style: {
                    background: '#EF4444', // Hata için canlı kırmızı
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '⚠️',
            });
        }
    };

    return (
        <div className="bg-white p-8 border border-stone-100 rounded-2xl shadow-sm max-w-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-stone-900">Profil Bilgileri</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">Düzenle</button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="Ad"
                        value={userData.first_name || ""}
                        onChange={e => setUserData({ ...userData, first_name: e.target.value })}
                    />
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="Soyad"
                        value={userData.last_name || ""}
                        onChange={e => setUserData({ ...userData, last_name: e.target.value })}
                    />
                    <input
                        className="w-full p-3 border rounded-lg"
                        placeholder="E-posta"
                        value={userData.email || ""}
                        onChange={e => setUserData({ ...userData, email: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="bg-stone-100 px-6 py-2 rounded-lg font-bold cursor-pointer">İptal</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold cursor-pointer hover:bg-indigo-700">Kaydet</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">Ad Soyad</p>
                        <p className="text-lg font-semibold text-stone-800">
                            {userData.first_name || ""} {userData.last_name || ""}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">E-posta</p>
                        <p className="text-lg font-semibold text-stone-800">{userData.email || ""}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const EditReservationForm = ({ rez, onSave, onCancel }) => {

    const [activeTicketId, setActiveTicketId] = useState(null);
    const [date, setDate] = useState(rez.date || rez.reservation_date);
    const [time, setTime] = useState(rez.time || rez.reservation_time);
    const [count, setCount] = useState(rez.participant_count || rez.participants || 1);

    // Tarih Sınırları
    const getToday = () => new Date().toISOString().split('T')[0];
    const getOneMonthLater = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };

    // 12:00 - 21:00 arası saatler
    const timeOptions = Array.from({ length: 10 }, (_, i) => `${(i + 12).toString().padStart(2, '0')}:00`);

    return (
        <div className="p-6 bg-white border border-indigo-100 rounded-2xl shadow-lg animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">Düzenle: {rez.title || "Sanat Atölyesi"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Yeni Tarih</label>
                    <input
                        type="date"
                        min={getToday()}
                        max={getOneMonthLater()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Yeni Saat</label>
                    <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                    >
                        {timeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Kişi Sayısı</label>
                    <input
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCount(val === "" ? "" : parseInt(val));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-lg"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    // Burada 'time' değişkenini de gönderiyoruz!
                    onClick={() => onSave(rez.id || rez.reservation_id, date, count, time)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                    Kaydet
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                    Vazgeç
                </button>
            </div>
        </div>
    );
};


export default function UserPanelPage() {
    const [viewingComparison, setViewingComparison] = useState(null);
    const [activeTicketId, setActiveTicketId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const router = useRouter(); // Güvenlik yönlendirmesi için
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const [activeTab, setActiveTab] = useState("orders");

    // Canlı veritabanı durumları için statelerimiz kanka
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [editingRez, setEditingRez] = useState(null);

    const [savedComparisons, setSavedComparisons] = useState([]);

    // 🚀 TICKET İÇİN YENİ EKLENEN STATE'LER 🚀
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [ticketFormData, setTicketFormData] = useState({ subject: "Siparişim Nerede?", message: "" });


    // Rezervasyonları çeken fonksiyonu dışarıya çıkar ki istediğimiz zaman çağıralım
    const fetchReservations = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/panel/reservations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setReservations(data);
            } else if (data && data.reservations && Array.isArray(data.reservations)) {
                setReservations(data.reservations);
            } else {
                setReservations([]);
            }
        } catch (err) {
            console.error("Rezervasyonlar çekilemedi:", err);
        }
    };

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/orders/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Siparişler çekilemedi:", err);
        }
    };

    // 🚀 TICKETLARI ÇEKEN YENİ FONKSİYON 🚀
    const fetchTickets = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/support/my-tickets`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Talepler çekilemedi:", err);
        }
    };

    // ⚖️ YENİ: KARŞILAŞTIRMALARI ÇEKEN FONKSİYON
    const fetchComparisons = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/panel/comparisons`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSavedComparisons(data);
            }
        } catch (err) {
            console.error("Karşılaştırmalar çekilemedi:", err);
        }
    };

    // ⚖️ YENİ: KARŞILAŞTIRMA SİLME FONKSİYONU
    const handleDeleteComparison = async (compId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${backendUrl}/api/panel/comparisons/${compId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Kayıtlı karşılaştırma silindi.", { icon: '🗑️' });
                setSavedComparisons(savedComparisons.filter(c => c.comparison_id !== compId));
            } else {
                toast.error("Silinemedi.");
            }
        } catch (err) {
            toast.error("Bağlantı hatası.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        // 🚀 GÜVENLİK DUVARI
        if (!token) {
            router.push("/auth?mode=login");
            return;
        }

        const authHeaders = { "Authorization": `Bearer ${token}` };

        // Tüm verileri çek
        fetchOrders();
        fetchReservations();
        fetchTickets();  // 🚀 Sayfa yüklenince ticketları da çek
        fetchComparisons();


        // 3. Favorileri Çek
        fetch(`${backendUrl}/api/panel/favorites`, { headers: authHeaders })
            .then((res) => {
                if (!res.ok) throw new Error(`Sunucu ${res.status} hatası döndürdü`);
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setFavorites(data);
            })
            .catch((err) => {
                console.error("Favoriler çekilemedi, detay:", err);
            });

    }, [router]);


    // 🚀 YENİ TICKET GÖNDERME FONKSİYONU 🚀
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Talebiniz iletiliyor...');
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${backendUrl}/api/support/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(ticketFormData)
            });

            if (response.ok) {
                toast.success('Talebiniz başarıyla alındı.', { id: toastId, style: { background: '#10B981', color: '#fff', borderRadius: '10px' } });
                setIsTicketModalOpen(false);
                setTicketFormData({ subject: "Siparişim Nerede?", message: "" });
                fetchTickets(); // Listeyi güncelle
            } else {
                toast.error('Talep oluşturulamadı.', { id: toastId });
            }
        } catch (error) {
            toast.error('Sunucuya ulaşılamıyor.', { id: toastId });
        }
    };


    const handleCancelOrder = async (id) => {
        // 1. Kullanıcıya özel modern onay kutusu
        toast((t) => (
            <div className="flex flex-col gap-2 p-2">
                <p className="font-medium text-sm">Bu siparişi iptal etmek istediğinize emin misiniz?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id); // Onay kutusunu kapat

                            // 2. İptal işlemini başlat
                            const token = localStorage.getItem("token");
                            try {
                                const response = await fetch(`${backendUrl}/api/orders/${id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${token}` }
                                });

                                if (response.ok) {
                                    toast.success('Siparişiniz başarıyla iptal edildi.', { icon: '🗑️' });
                                    fetchOrders(); // Listeyi güncelle
                                } else {
                                    throw new Error("İptal işlemi başarısız.");
                                }
                            } catch (err) {
                                toast.error('Sipariş iptal edilemedi. Lütfen tekrar deneyiniz.', { icon: '⚠️' });
                            }
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                    >
                        Evet, İptal Et
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        ),
            {
                duration: Infinity,
                position: 'top-center',
                style: {
                    marginTop: '30vh', // Sayfanın dikey olarak merkezine yaklaştırır
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }
            });
    };

    // Ödev Maddesi 5: Rezervasyon İptal Etme Fonksiyonu
    const handleCancelReservation = async (id) => {
        // 1. Kullanıcıya özel modern onay kutusu
        toast((t) => (
            <div className="flex flex-col gap-2 p-2">
                <p className="font-medium text-sm">Bu atölye rezervasyonunu iptal etmek istediğinize emin misiniz?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id); // Onay kutusunu kapat

                            // 2. İptal işlemini başlat
                            const token = localStorage.getItem("token");
                            try {
                                const response = await fetch(`${backendUrl}/api/panel/reservations/${id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${token}` }
                                });

                                if (response.ok) {
                                    toast.success('Rezervasyonunuz iptal edildi ve kontenjan güncellendi.', {
                                        icon: '✅',
                                        style: { background: '#EF4444', color: '#fff', borderRadius: '10px' }
                                    });
                                    setReservations(reservations.filter(rez => rez.id !== id));
                                } else {
                                    throw new Error("İptal işlemi başarısız.");
                                }
                            } catch (err) {
                                toast.error('İptal işlemi gerçekleştirilemedi. Lütfen tekrar deneyiniz.', {
                                    icon: '⚠️',
                                    style: { background: '#EF4444', color: '#fff', borderRadius: '10px' }
                                });
                            }
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                    >
                        Evet, İptal Et
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        ),
            {
                duration: Infinity,
                position: 'top-center',
                style: {
                    marginTop: '30vh', // Ekranın ortasına yaklaştırmak için
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }
            });
    };

    // 🚀 Ödev Maddesi 5: Rezervasyon Güncelleme Fonksiyonu
    const handleUpdateReservation = async (reservationId, newDate, newCount, newTime) => {
        const token = localStorage.getItem("token");

        // Basit doğrulama: tarih seçilmiş mi ve kişi sayısı 1'den az mı?
        if (!newDate || newCount < 1) {
            toast.error('Lütfen geçerli bir tarih ve kişi sayısı seçtiğinizden emin olun.', {
                duration: 3000,
                style: {
                    background: '#F59E0B', // Uyarılar için "Amber/Sarı" tonu
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '📅', // Tarih/Etkinlik temalı ikon
            });
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/panel/reservations/${reservationId}`, {
                method: "PUT", // Backend'deki PUT route'una gidiyoruz
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    reservation_date: newDate,
                    reservation_time: newTime,
                    participant_count: newCount
                })
            });

            if (response.ok) {
                toast.success('Rezervasyon detaylarınız başarıyla güncellendi.', {
                    duration: 3000,
                    style: {
                        background: '#1F2937', // Kontrol paneliyle uyumlu koyu gri/siyah tonu
                        color: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #374151',
                    },
                    icon: '✅',
                });
                setEditingRez(null); // Formu kapat
                fetchReservations();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.detail || "Güncelleme işlemi başarısız oldu. Lütfen tekrar deneyin.";
                toast.error(errorMessage, {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    icon: '⚠️',
                });
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            toast.error('Sunucu ile iletişim kurulamadı. Lütfen ağ bağlantınızı kontrol edip tekrar deneyin.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '🔌', // Sunucu/Bağlantı temalı ikon
            });
        }
    };
    const handleRemoveFavorite = async (artworkId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/panel/favorites`, {
                method: "POST", // Backend'deki aynı route'a gönderince zaten favoriyse siliyor
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ artwork_id: artworkId })
            });

            if (response.ok) {
                setFavorites(favorites.filter(f => f.artwork_id !== artworkId));
                toast.success('Eser favorilerinizden kaldırıldı.', {
                    duration: 3000,
                    style: {
                        background: '#1F2937', // Koyu panel tonu
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    icon: '💔', // Favoriden çıkarma işlemine uygun ikon
                });
            }
        } catch (err) {
            toast.error('İşlem gerçekleştirilemedi. Lütfen tekrar deneyiniz.', {
                duration: 3500,
                style: {
                    background: '#EF4444', // Hata için canlı kırmızı
                    color: '#fff',
                    borderRadius: '10px',
                },
                icon: '❌',
            });
        }
    };
    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Müşteri Kontrol Paneli</h1>
                <p className="text-gray-500 text-sm mt-1">Siparişlerinizi, rezervasyonlarınızı ve destek taleplerinizi buradan yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {/* Sol Taraf: Menü Sekmeleri */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit space-y-1">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "settings" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        ⚙️ Hesap Ayarlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "orders" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        📦 Sipariş Takibi
                    </button>
                    <button
                        onClick={() => setActiveTab("reservations")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "reservations" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🗓️ Atölye Rezervasyonlarım
                    </button>
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "favorites" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        ❤️ Favori Eserlerim
                    </button>

                    <button onClick={() => setActiveTab("comparisons")} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "comparisons" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>⚖️ Karşılaştırmalarım</button>


                    <button
                        onClick={() => setActiveTab("support")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "support" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        🎫 Destek Taleplerim
                    </button>
                </div>

                {/* Sağ Taraf: Dinamik İçerik Alanı */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    {activeTab === "settings" && <AccountSettings />}
                    {/* Siparişler Sekmesi */}
                    {activeTab === "orders" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Sipariş Geçmişiniz</h2>
                                <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-3 py-1 rounded-md">
                                    {orders.length} Sipariş Mevcut
                                </span>
                            </div>
                            {orders.map((order, index) => (
                                <div key={`order-${order.order_id || index}`} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-stone-300 transition-all duration-200">
                                    {/* Üst Bilgi Çubuğu */}
                                    <div className="bg-stone-50 border-b border-stone-100 px-5 py-3.5 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-4 text-sm">
                                            <p className="text-neutral-500 font-light">
                                                Sipariş No: <span className="font-mono font-bold text-neutral-900">{order.order_id}</span>
                                            </p>
                                            <span className="text-stone-300">|</span>
                                            <p className="text-neutral-500 font-light">
                                                Tarih: <span className="font-medium text-neutral-800">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : "Tarih Yok"}
                                                </span>
                                            </p>
                                        </div>
                                        {/* 🔥 DURUMA GÖRE DİNAMİK RENKLENEN BADGE 🔥 */}
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.status === "Ödendi" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            order.status === "Hazırlanıyor" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                order.status === "Kargoya Verildi" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                    order.status === "Teslim Edildi" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        "bg-red-50 text-red-700 border-red-200"
                                            }`}>
                                            ● {order.status}
                                        </span>
                                    </div>

                                    {/* Orta Gövde */}
                                    <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                {order.image_url ? (
                                                    <img
                                                        src={order.image_url}
                                                        alt={order.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl opacity-40">🎨</span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-neutral-900 leading-tight">{order.title}</h3>
                                                <p className="text-xs text-neutral-400 font-light mt-1">Sipariş Türü: Sanat Eseri</p>
                                            </div>
                                        </div>

                                        {/* Fiyat ve Aksiyon */}
                                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Toplam Tutar</span>
                                                <span className="text-xl font-black text-neutral-950">
                                                    {order.amount ? order.amount.toLocaleString("tr-TR") : "0"} ₺
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* 🔥 KARGO TAKİP BUTONU (Sadece kargoya verildiyse çıkar) 🔥 */}
                                                {order.status === "Kargoya Verildi" && (
                                                    <button
                                                        onClick={() => {
                                                            toast.success('Kargo Takip No: 1Z9999999999999999 (Aras Kargo)', {
                                                                duration: 5000,
                                                                style: {
                                                                    background: '#10B981',
                                                                    color: '#fff',
                                                                    borderRadius: '10px',
                                                                },
                                                                icon: '📦',
                                                            });
                                                        }}
                                                        className="bg-purple-600 text-white border border-purple-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
                                                    >
                                                        📦 Kargo Takip
                                                    </button>
                                                )}

                                                {/* 🔥 İPTAL BUTONU (Sadece iptal edilebilir aşamalarda çıkar) 🔥 */}
                                                {(order.status === "Ödendi" || order.status === "Hazırlanıyor") && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.order_id)}
                                                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        İptal Et
                                                    </button>
                                                )}

                                                {/* Sabit Sipariş Detayı Butonu */}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="bg-white border border-stone-200 text-neutral-600 hover:bg-stone-50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    Sipariş Detayı
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ⚖️ YENİ: KARŞILAŞTIRMALARIM SEKME İÇERİĞİ */}
                    {activeTab === "comparisons" && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Kayıtlı Karşılaştırmalarım</h2>
                            {savedComparisons.length === 0 && <p className="text-sm text-gray-500">Henüz kaydedilmiş bir karşılaştırmanız bulunmuyor.</p>}

                            <div className="grid grid-cols-1 gap-4">
                                {savedComparisons.map(comp => (
                                    <div
                                        key={comp.comparison_id}
                                        onClick={() => setViewingComparison(comp)} // 🔥 TIKLAMA TETİKLEYİCİSİ BURADA
                                        className="p-5 border border-stone-200 bg-stone-50/50 rounded-xl flex flex-col hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${comp.item_type === 'event' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                                                    {comp.item_type === 'event' ? '🗓️ Etkinlik' : '🖼️ Eser'} Karşılaştırması
                                                </span>
                                                <span className="text-xs text-gray-400 block mt-2 font-medium">Kaydedilme Tarihi: {new Date(comp.created_at).toLocaleString('tr-TR')}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 🔥 Sil'e basınca modal açılmasın!
                                                    handleDeleteComparison(comp.comparison_id);
                                                }}
                                                className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors border border-red-200 shadow-sm"
                                            >
                                                Kayıtlardan Sil
                                            </button>
                                        </div>

                                        <ComparisonDetailFetcher type={comp.item_type} idsString={comp.item_ids} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🔥 MODAL TETİKLEYİCİSİ (Bunu sekmenin hemen altına veya UserPanelPage'in en sonuna ekle) */}
                    {viewingComparison && (
                        <SavedComparisonModal
                            comparison={viewingComparison}
                            onClose={() => setViewingComparison(null)}
                        />
                    )}
                    {/* Rezervasyonlar Sekmesi */}
                    {activeTab === "reservations" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Atölye Kayıtlarınız</h2>

                            {editingRez ? (
                                <EditReservationForm
                                    rez={editingRez}
                                    onCancel={() => setEditingRez(null)}
                                    onSave={(id, d, c, t) => { // 4. parametre olan 't' (time) eklendi
                                        handleUpdateReservation(id, d, c, t); // Buradan da gönderiyoruz
                                        setEditingRez(null);
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {reservations.length === 0 && <p className="text-sm text-gray-500">Henüz bir atölye rezervasyonunuz bulunmuyor.</p>}
                                    {reservations.map((rez) => (
                                        <ReservationCard
                                            key={rez.id || rez.reservation_id}
                                            rez={rez}
                                            onCancel={() => handleCancelReservation(rez.id || rez.reservation_id)}
                                            onEdit={(r) => setEditingRez(r)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Favoriler Sekmesi */}
                    {activeTab === "favorites" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Favorilediğiniz Eserler</h2>
                            {favorites.length === 0 && <p className="text-sm text-gray-500">Henüz favorilere eklediğiniz bir eser bulunmuyor.</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {favorites.map((fav, index) => (
                                    <div key={`fav-${fav.artwork_id || index}`} className="border border-gray-100 rounded-lg overflow-hidden flex bg-gray-50 hover:shadow-md transition-shadow relative">
                                        <img src={fav.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=200"} alt={fav.title} className="w-24 h-24 object-cover flex-shrink-0" />
                                        <div className="p-3 flex flex-col justify-between text-sm w-full">
                                            <div>
                                                <h3 className="font-bold text-gray-800 truncate w-36">{fav.title}</h3>
                                                <p className="text-gray-400 text-xs">Sanatçı: {fav.artist_name || "Bilinmiyor"}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-indigo-600">{fav.price ? fav.price.toLocaleString("tr-TR") : "0"} ₺</span>

                                                {/* Favoriden Kaldırma Butonu */}
                                                <button
                                                    onClick={() => handleRemoveFavorite(fav.artwork_id || fav.id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer border border-red-100"
                                                >
                                                    🗑️ Kaldır
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🔥 GÜNCELLENMİŞ DESTEK TALEPLERİ SEKME İÇERİĞİ 🔥 */}
                    {activeTab === "support" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h2 className="text-xl font-bold text-gray-800">Destek Talepleriniz</h2>
                                <button
                                    onClick={() => setIsTicketModalOpen(true)}
                                    className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm active:scale-95"
                                >
                                    ➕ Yeni Talep Oluştur
                                </button>
                            </div>

                            {tickets.length === 0 && <p className="text-sm text-gray-500">Açık bir destek talebiniz bulunmuyor.</p>}

                            {tickets.map((ticket, index) => (
                                <div key={`ticket-${ticket.ticket_id || ticket.id || index}`} className="p-4 border border-gray-100 bg-gray-50 rounded-lg flex flex-col gap-3 hover:border-indigo-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-mono text-xs text-indigo-600 block">Talep #{ticket.ticket_id || ticket.id}</span>
                                            <span className="font-bold text-gray-800 text-base">{ticket.subject}</span>
                                            <span className="text-gray-400 block text-xs mt-1">Oluşturma: {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('tr-TR') : ticket.date}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${ticket.status === "Çözüldü" || ticket.status === "Cevaplandı" ? "bg-emerald-100 text-emerald-700" : ticket.status === "İşlemde" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                                {ticket.status}
                                            </span>
                                            {/* 🔥 SOHBETİ BAŞLAT BUTONU 🔥 */}
                                            <button
                                                onClick={() => {
                                                    const id = ticket.ticket_id || ticket.id;
                                                    if (id) {
                                                        setActiveTicketId(id);
                                                    } else {
                                                        toast.error("Bilet ID'si bulunamadı!");
                                                    }
                                                }}
                                                className="..."
                                            >
                                                💬 Sohbeti Aç
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            {/* Sipariş Detay Modalı */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">Sipariş Detayı</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Sipariş No:</span>
                                <span className="font-bold">#{selectedOrder.order_id}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Ürün:</span>
                                <span className="font-bold">{selectedOrder.title}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Tutar:</span>
                                <span className="font-bold">{selectedOrder.amount} ₺</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-stone-500">Durum:</span>
                                <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full mt-8 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* 🔥 YENİ: DESTEK TALEBİ OLUŞTURMA MODALI (EN ALTA EKLENDİ, Z-INDEX 9999) 🔥 */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Bize Ulaşın</h3>
                            <button onClick={() => setIsTicketModalOpen(false)} className="text-xl font-bold text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Konu Başlığı</label>
                                <select
                                    value={ticketFormData.subject}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
                                    required
                                >
                                    <option>Siparişim Nerede?</option>
                                    <option>İade ve İptal İşlemleri</option>
                                    <option>Teknik Bir Sorun</option>
                                    <option>Sanatçı Başvurusu</option>
                                    <option>Diğer Sorular</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mesajınız</label>
                                <textarea
                                    value={ticketFormData.message}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, message: e.target.value })}
                                    rows="5"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Size nasıl yardımcı olabiliriz? Detayları yazın..."
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 cursor-pointer">İptal</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer shadow-md">Talebi Gönder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* 🔥 YENİ: DESTEK TALEBİ OLUŞTURMA MODALI (Z-INDEX 9999) 🔥 */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Bize Ulaşın</h3>
                            <button onClick={() => setIsTicketModalOpen(false)} className="text-xl font-bold text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Konu Başlığı</label>
                                <select
                                    value={ticketFormData.subject}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
                                    required
                                >
                                    <option>Siparişim Nerede?</option>
                                    <option>İade ve İptal İşlemleri</option>
                                    <option>Teknik Bir Sorun</option>
                                    <option>Sanatçı Başvurusu</option>
                                    <option>Diğer Sorular</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mesajınız</label>
                                <textarea
                                    value={ticketFormData.message}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, message: e.target.value })}
                                    rows="5"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Size nasıl yardımcı olabiliriz? Detayları yazın..."
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 cursor-pointer">İptal</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer shadow-md">Talebi Gönder</button>
                            </div>
                        </form>
                    </div>

                </div>
            )}
            {/* Sohbet Penceresini Ekrana Bas (UserPanel için false gönderiyoruz) */}
            {activeTicketId && (
                <ChatWindow
                    ticketId={activeTicketId}
                    onClose={() => setActiveTicketId(null)}
                    isAdminView={false}
                />
            )}
        </div>
    );
}
function ChatWindow({ ticketId, onClose, isAdminView }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchMessages = async () => {
        if (!ticketId || ticketId === "null" || ticketId === "undefined") return;
        const res = await fetch(`${backendUrl}/api/support/${ticketId}/messages`);
        if (res.ok) setMessages(await res.json());
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [ticketId]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        const token = localStorage.getItem("token");
        await fetch(`${backendUrl}/api/support/${ticketId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ message: text })
        });
        setText("");
        fetchMessages();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="font-bold text-lg">Canlı Destek #{ticketId}</h3>
                    <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="h-64 overflow-y-auto p-4 bg-stone-50 rounded-xl mb-4 space-y-3">
                    {messages.map((m, i) => {
                        const isMyMessage = isAdminView ? m.is_admin : !m.is_admin;
                        return (
                            <div key={i} className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${isMyMessage
                                ? 'bg-indigo-600 text-white ml-auto rounded-br-none'
                                : 'bg-white border border-stone-200 mr-auto rounded-bl-none'
                                }`}>
                                {m.message}
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded-xl text-sm" placeholder="Mesaj yaz..." />
                    <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700">Gönder</button>
                </div>
            </div>
        </div>
    );
}
const SavedComparisonModal = ({ comparison, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchDetails = async () => {
            if (!comparison?.item_ids) return;
            const ids = comparison.item_ids.split(",");
            const fetchedItems = [];
            for (let id of ids) {
                try {
                    const endpoint = `${backendUrl}/api/${comparison.item_type === 'event' ? 'events' : 'artworks'}/${id}`;
                    const res = await fetch(endpoint);
                    if (res.ok) fetchedItems.push(await res.json());
                } catch (err) { console.error(err); }
            }
            setDetails(fetchedItems);
            setLoading(false);
        };
        fetchDetails();
    }, [comparison, backendUrl]);

    // Resim yolunu güvenli hale getiren yardımcı
    const getImageUrl = (item) => {
        if (item.image_url) {
            return item.image_url.startsWith('http') ? item.image_url : `${backendUrl}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`;
        }
        return comparison.item_type === 'event'
            ? "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800"
            : "https://placehold.co/400x300?text=Sanat";
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Modal Başlığı */}
                <div className="flex justify-between items-center p-6 border-b bg-stone-50 shrink-0">
                    <h3 className="text-xl font-black text-gray-900">
                        {comparison.item_type === 'event' ? '🗓️ Etkinlik Karşılaştırması' : '🖼️ Eser Karşılaştırması'}
                    </h3>
                    <button onClick={onClose} className="text-3xl text-gray-400 hover:text-red-500 cursor-pointer">&times;</button>
                </div>

                {/* Modal İçeriği (Grid Yapısı) */}
                <div className="p-6 overflow-y-auto">
                    {loading ? <p className="text-center">Yükleniyor...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                            {details.map((item, idx) => (
                                <div key={idx} className="bg-white border border-stone-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <img src={getImageUrl(item)} className="w-full h-48 object-cover rounded-xl mb-4" alt={item.title} />
                                    <h4 className="font-black text-lg text-gray-900 mb-4">{item.title}</h4>

                                    {/* 🔥 AYRIM NOKTASI: KOŞULLU GÖSTERİM 🔥 */}
                                    {comparison.item_type === 'event' ? (
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                                                <span className="text-stone-500 font-medium">Tarih</span>
                                                <span className="font-bold text-gray-800">{item.event_date || item.date}</span>
                                            </div>
                                            <div className="flex justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                                                <span className="text-stone-500 font-medium">Kontenjan</span>
                                                <span className="font-bold text-gray-800">{item.quota || item.participant_count} Kişi</span>
                                            </div>
                                            <div className="flex justify-between bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                                                <span className="text-teal-700 font-bold">Katılım Bedeli</span>
                                                <span className="font-black text-teal-600">{item.price?.toLocaleString("tr-TR")} ₺</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                                                <span className="text-stone-500 font-medium">Sanatçı</span>
                                                <span className="font-bold text-gray-800">{item.artist_name || "Bilinmiyor"}</span>
                                            </div>
                                            <div className="flex justify-between bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                                                <span className="text-stone-500 font-medium">Kategori</span>
                                                <span className="font-bold text-gray-800">{item.category || "Tablo"}</span>
                                            </div>
                                            <div className="flex justify-between bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                                                <span className="text-indigo-700 font-bold">Fiyat</span>
                                                <span className="font-black text-indigo-600 text-lg">{item.price?.toLocaleString("tr-TR")} ₺</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};