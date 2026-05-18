import { neon } from '@neondatabase/serverless';

// .env.local dosyasındaki linki okuyarak veritabanı bağlantısını başlatır
export const sql = neon(process.env.DATABASE_URL);