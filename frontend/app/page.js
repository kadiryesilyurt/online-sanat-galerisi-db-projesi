export default function HomePage() {
    // Veritabanı bağlanana kadar arayüzü test etmek için mock (sahte) verimiz.
    const artworks = [
        {
            id: 1,
            title: "Yıldızlı Gece Yansımaları",
            artist: "Ahmet Yılmaz",
            price: 15000,
            imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop",
            category: "Yağlı Boya"
        },
        {
            id: 2,
            title: "Soyut Düşünceler",
            artist: "Zeynep Kaya",
            price: 8500,
            imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=600&auto=format&fit=crop",
            category: "Dijital Sanat"
        },
        {
            id: 3,
            title: "Zamanın Dokusu",
            artist: "Caner Erol",
            price: 12000,
            imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=600&auto=format&fit=crop",
            category: "Akrilik"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Üst Kısım: Başlık */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Galerimizi Keşfedin</h1>
            </div>

            {/* Eserlerin Listelendiği Izgara (Grid) Yapısı */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks.map((artwork) => (
                    <div key={artwork.id} className="bg-white rounded-lg shadow-lg overflow-hidden relative group border border-gray-200">

                        {/* Favoriye Ekle Butonu */}
                        <button
                            className="absolute top-4 right-4 z-10 bg-white/90 p-2.5 rounded-full shadow hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
                            title="Favorilere Ekle"
                        >
                            🤍
                        </button>

                        {/* Eser Görseli */}
                        <div className="h-64 relative overflow-hidden bg-gray-200">
                            <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Eser Detayları ve Sanatçı Bilgisi */}
                        <div className="p-5">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                {artwork.category}
                            </span>
                            <h2 className="text-xl font-bold text-gray-800 mt-1 truncate">
                                {artwork.title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Sanatçı: <span className="font-medium text-gray-700">{artwork.artist}</span>
                            </p>

                            {/* Fiyat ve İncele Butonu */}
                            <div className="mt-5 flex justify-between items-center">
                                <span className="text-2xl font-extrabold text-gray-900">
                                    {artwork.price.toLocaleString('tr-TR')} ₺
                                </span>
                                <button className="bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-indigo-600 transition-colors duration-300 font-medium">
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