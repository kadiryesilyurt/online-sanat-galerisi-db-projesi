"use client";
import { useState } from "react";

export default function CheckoutModal({ isOpen, onClose, product, onConfirm }) {
    const [paymentMethod, setPaymentMethod] = useState("credit_card");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100">
                <h2 className="text-2xl font-black mb-6">Ödeme Bilgileri</h2>

                <div className="mb-6">
                    <p className="text-sm text-stone-500 mb-2">Seçilen Ürün:</p>
                    <p className="font-bold text-lg">{product.title}</p>
                    <p className="text-teal-600 font-black text-xl">{product.price.toLocaleString("tr-TR")} ₺</p>
                </div>

                <div className="space-y-3 mb-8">
                    <label className={`block p-4 border rounded-xl cursor-pointer ${paymentMethod === "credit_card" ? "border-indigo-600 bg-indigo-50" : "border-stone-200"}`}>
                        <input type="radio" value="credit_card" checked={paymentMethod === "credit_card"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2" />
                        Kredi Kartı
                    </label>
                    <label className={`block p-4 border rounded-xl cursor-pointer ${paymentMethod === "wallet" ? "border-indigo-600 bg-indigo-50" : "border-stone-200"}`}>
                        <input type="radio" value="wallet" checked={paymentMethod === "wallet"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2" />
                        Dijital Cüzdan
                    </label>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-stone-100 py-3 rounded-xl font-bold hover:bg-stone-200">Vazgeç</button>
                    <button onClick={() => onConfirm(paymentMethod)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Ödemeyi Tamamla</button>
                </div>
            </div>
        </div>
    );
}