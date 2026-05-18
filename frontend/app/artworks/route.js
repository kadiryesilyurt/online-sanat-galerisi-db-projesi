import { sql } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Neon PostgreSQL veritabanındaki 'artworks' tablosundan tüm eserleri çekiyoruz
        // (Eğer tabloları henüz oluşturmadıysanız bu kod hata vermesin diye try-catch içinde)
        const artworks = await sql`SELECT * FROM artworks ORDER BY id DESC`;

        return NextResponse.json(artworks, { status: 200 });
    } catch (error) {
        console.error("Veritabanı hatası:", error);
        return NextResponse.json(
            { message: "Veritabanı bağlantısı kuruldu fakat tablo bulunamadı veya veri çekilemedi." },
            { status: 500 }
        );
    }
}