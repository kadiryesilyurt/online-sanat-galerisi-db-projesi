import Navbar from "../components/Navbar";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Online Sanat Galerisi",
  description: "Sanat eserleri inceleme ve atölye rezervasyon sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 min-h-screen flex flex-col antialiased">
        {/* Bildirimlerin her sayfada çalışması için Toaster burada */}
        <Toaster position="top-center" reverseOrder={false} />

        {/* Navbar her sayfada en üstte */}
        <Navbar />

        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}