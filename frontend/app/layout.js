import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Online Sanat Galerisi",
  description: "Sanat eserleri inceleme ve atölye rezervasyon sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 min-h-screen flex flex-col antialiased">
        {/* Navbar'ı buraya ekledik, artık tüm sayfalarda en üstte çıkacak */}
        <Navbar />

        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}