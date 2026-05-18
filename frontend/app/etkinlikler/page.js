export default function EtkinliklerPage() {
    // Veritabanı bağlanana kadar arayüzü test etmek için mock (sahte) verimiz.
    const events = [
        {
            id: 1,
            title: "Temel Yağlı Boya Atölyesi",
            date: "25 Mayıs 2026",
            time: "14:00 - 17:00",
            quota: 15,
            price: 500,
            description: "Yeni başlayanlar için temel yağlı boya teknikleri, renk teorisi ve fırça kullanımları üzerine uygulamalı atölye çalışması.",
            organizer: "Ahmet Yılmaz"
        },
        {
            id: 2,
            title: "Dijital Sanata Giriş",
            date: "28 Mayıs 2026",
            time: "18:00 - 20:00",
            quota: 20,
            price: 350,
            description: "Tablet ve dijital çizim programları kullanarak karakter tasarımı ve konsept sanatının temelleri.",
            organizer: "Zeynep Kaya"
        },
        {
            id: 3,
            title: "Seramik Heykel Şekillendirme",
            date: "02 Haziran 2026",
            time: "13:00 - 16:00",
            quota: 10,
            price: 750,
            description: "Kil ile 3 boyutlu form yaratma, doku verme ve temel seramik şekillendirme yöntemleri.",
            organizer: "Caner Erol"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Üst Kısım: Başlık ve Açıklama */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800">Yaklaşan Atölye ve Etkinlikler</h1>
                <p className="text-gray-500 mt-2">Sanatçılarımızla bir araya gelin, yeni yetenekler keşfedin.</p>
            </div>

            {/* Etkinliklerin Listelendiği Izgara */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow duration-300">

                        {/* Sol Taraf: Tarih Kutucuğu */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg p-4 h-24 w-24 md:h-full md:w-32 border border-indigo-100">
                            <span className="text-3xl font-extrabold">{event.date.split(' ')[0]}</span>
                            <span className="text-sm font-semibold uppercase tracking-wider">{event.date.split(' ')[1]}</span>
                        </div>

                        {/* Sağ Taraf: Etkinlik Detayları */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                                        {event.price} ₺
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{event.description}</p>
                                <p className="text-xs text-gray-400 mt-1">Eğitmen: {event.organizer}</p>
                            </div>

                            {/* Alt Bilgiler: Saat ve Kontenjan */}
                            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center gap-1.5">
                                    🕒 <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    👥 <span>Kontenjan: {event.quota} Kişi</span>
                                </div>
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="mt-5 flex gap-3">
                                <button className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                                    Rezervasyon Yap
                                </button>
                                <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium">
                                    İncele
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}