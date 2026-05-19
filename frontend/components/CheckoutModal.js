// CheckoutModal.js
import { useState } from 'react';

const CheckoutModal = ({ isOpen, onClose, artwork, onConfirm }) => {
    const [method, setMethod] = useState("Kredi Kartı");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">
                <h2 className="text-xl font-black mb-2">Ödemeyi Onayla</h2>
                <p className="text-stone-500 mb-6 text-sm">{artwork.title} için ödeme yöntemi seçin.</p>

                <select
                    className="w-full p-3 mb-6 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Havale">Havale / EFT</option>
                    <option value="Kapıda Ödeme">Kapıda Ödeme</option>
                </select>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 font-semibold">Vazgeç</button>
                    <button
                        onClick={() => onConfirm(method)}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold"
                    >
                        Siparişi Onayla
                    </button>
                </div>
            </div>
        </div>
    );
};
// components/CheckoutModal.js dosyanın en altına ekle
export default CheckoutModal;