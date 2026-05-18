-- 1. KULLANICI YÖNETİMİ
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('customer', 'admin', 'organizer')) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SANATÇILAR
CREATE TABLE Artists (
    artist_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    biography TEXT
);

-- 3. ESERLER
CREATE TABLE Artworks (
    artwork_id SERIAL PRIMARY KEY,
    artist_id INT REFERENCES Artists(artist_id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50),
    stock_status INT DEFAULT 1
);

-- 4. ETKİNLİKLER VE ATÖLYELER
CREATE TABLE Events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    quota INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    organizer_id INT REFERENCES Users(user_id)
);

-- 5. FAVORİLER
CREATE TABLE Favorites (
    user_id INT REFERENCES Users(user_id),
    artwork_id INT REFERENCES Artworks(artwork_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, artwork_id)
);

-- 6. REZERVASYONLAR
CREATE TABLE Reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    event_id INT REFERENCES Events(event_id),
    participant_count INT NOT NULL,
    reservation_status VARCHAR(20) CHECK (reservation_status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. İNDİRİM VE KAMPANYALAR
CREATE TABLE Coupons (
    coupon_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2),
    valid_until DATE
);

-- 8. SİPARİŞ VE SATIN ALMA
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    coupon_id INT REFERENCES Coupons(coupon_id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) CHECK (payment_method IN ('credit_card', 'bank_transfer')) NOT NULL,
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. SİPARİŞ DETAYLARI
CREATE TABLE Order_Items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id),
    artwork_id INT REFERENCES Artworks(artwork_id),
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- 10. YORUMLAR
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    item_type VARCHAR(20) CHECK (item_type IN ('artwork', 'event')) NOT NULL,
    item_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_votes INT DEFAULT 0,
    admin_reply TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. DESTEK TALEPLERİ
CREATE TABLE Support_Tickets (
    ticket_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);