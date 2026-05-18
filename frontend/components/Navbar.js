import Link from 'next/link';

export default function Navbar() {
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
                        <Link href="/panel" className="hover:text-indigo-600 transition-colors duration-200">
                            Siparişlerim
                        </Link>
                    </div>

                    {/* Sağ Taraf: Giriş ve Kayıt (Parametreler eklendi) */}
                    <div className="flex items-center space-x-4">
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
                    </div>

                </div>
            </div>
        </nav>
    );
}