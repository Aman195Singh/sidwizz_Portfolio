-- ==============================================================================
-- SIDD.WHIZZ — Official Neon PostgreSQL Database Schema & Seed Script
-- Event Host, Emcee & Moderator Siddharth "Sid" Maurya Portfolio
-- ==============================================================================

-- 1. Enable UUID Extension (Optional for UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users & Authentication Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'password123',
    role VARCHAR(32) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'member')),
    organization VARCHAR(255),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. User Sessions Table (Session token tracking)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Stage Booking Inquiries Table (From /contact & managed in /admin)
CREATE TABLE IF NOT EXISTS booking_requests (
    id VARCHAR(64) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    clean_phone VARCHAR(64),
    date VARCHAR(64),
    city VARCHAR(128) NOT NULL,
    venue VARCHAR(255),
    crowd_size VARCHAR(128),
    format VARCHAR(128) NOT NULL,
    budget VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Discussion', 'Confirmed', 'Declined')),
    brief TEXT,
    notes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created ON booking_requests(created_at DESC);

-- 5. Confirmed Events & Bookings Table (Run of show & contracts)
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    enquiry_id VARCHAR(64) REFERENCES booking_requests(id) ON DELETE SET NULL,
    event_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64),
    venue VARCHAR(255) NOT NULL,
    city VARCHAR(128) NOT NULL,
    format VARCHAR(128) NOT NULL,
    fee VARCHAR(64),
    advance_paid BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Pending')),
    contract_ref VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Media Library Assets Table (Photos, Videos, Audio clips, PDF Tech Riders)
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
    category VARCHAR(64) NOT NULL,
    size VARCHAR(32) NOT NULL,
    duration VARCHAR(32),
    dimensions VARCHAR(32),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);

-- 7. Client Testimonials & Endorsements
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(64) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_role VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    event_type VARCHAR(128),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Developer Support & Issue Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    priority VARCHAR(32) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- INITIAL SEED DATA (Default System State)
-- ==============================================================================

-- Seed Users (Default logins)
INSERT INTO users (id, name, email, password_hash, role, organization)
VALUES
    ('usr_admin_01', 'Siddharth Maurya', 'admin@siddwhizz.com', 'sid123', 'admin', 'SIDD.WHIZZ Official'),
    ('usr_client_01', 'Priya Sharma', 'priya@techsummit.io', 'password123', 'client', 'Apex Global Tech Summits'),
    ('usr_member_01', 'Amit Verma', 'amit.verma@example.com', 'password123', 'member', 'Event Community Pass')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Booking Enquiries
INSERT INTO booking_requests (id, event_name, client_name, organization, email, phone, clean_phone, date, city, venue, crowd_size, format, budget, status, brief, notes)
VALUES
    ('ENQ-101', 'Global FinTech Summit 2026', 'Arjun Nair', 'FinTech India Association', 'arjun.nair@fintechsummit.in', '+91 98201 54321', '919820154321', '2026-12-14', 'Mumbai', 'Jio World Convention Centre, BKC', '1,500+ CXOs & Founders', 'Tech Summit & Keynotes', '₹3,50,000 - ₹5,00,000', 'New', 'Looking for high energy hosting for 2 full days, opening keynote moderation, and evening gala awards.', ARRAY['Client requested host showreel video link', 'Preferred date is firm']),
    ('ENQ-102', 'Deloitte Leadership Conclave & Gala', 'Rohan Kapoor', 'Deloitte India Events', 'rohan.kapoor@deloitte.com', '+91 98112 99887', '919811299887', '2026-11-28', 'Bengaluru', 'The Leela Palace Ballroom', '800 Senior Partners', 'Corporate Gala & Awards', '₹2,50,000 - ₹4,00,000', 'In Discussion', 'Annual leadership meet requiring polished stage delivery, partner award distribution, and interactive audience segments.', ARRAY['Commercial quotation sent on Nov 3', 'Awaiting confirmation from executive sponsor']),
    ('ENQ-103', 'Sunburn Arena Live Festival Showcase', 'Karan Mehta', 'Percept Live Entertainment', 'karan.mehta@perceptlive.in', '+91 99300 44556', '919930044556', '2026-12-31', 'Goa', 'Vagator Main Arena', '15,000+ Music Lovers', 'Music Festival & Live Arena', '₹5,00,000+', 'Confirmed', 'Prime NYE stage crowd hyping, international DJ artist introductions, and midnight countdown.', ARRAY['Advance deposit received', 'Tech rider signed'])
ON CONFLICT (id) DO NOTHING;

-- Seed Confirmed Events
INSERT INTO events (id, enquiry_id, event_name, client_name, organization, date, time, venue, city, format, fee, advance_paid, status, contract_ref)
VALUES
    ('BK-901', 'ENQ-101', 'Apex Global Tech Summits 2026', 'Priya Sharma', 'Apex Global Tech Summits Pvt Ltd', '2026-12-14', '09:00 AM - 05:30 PM', 'Jio World Convention Centre', 'Mumbai', 'Technology Summit & Panel Moderation', '₹4,00,000', TRUE, 'Confirmed', 'REF: SID-CONF-2026-88'),
    ('BK-902', 'ENQ-103', 'Sunburn Arena Live Festival Showcase', 'Karan Mehta', 'Percept Live Entertainment', '2026-12-31', '07:00 PM - 01:00 AM', 'Vagator Main Arena', 'Goa', 'Music Festival & Live Arena', '₹5,50,000', TRUE, 'Confirmed', 'REF: SID-CONF-2026-92')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Media Assets
INSERT INTO media_assets (id, title, type, category, size, duration, dimensions, url)
VALUES
    ('med-1', 'Official Host Emcee Showreel (4K 60fps)', 'video', 'Showreels', '84.2 MB', '2:45 min', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ('med-2', 'Siddharth Maurya High-Res Stage Anchor Shot', 'image', 'Portraits', '2.4 MB', NULL, '3840 x 2160', 'https://sidwizz-portfolio.vercel.app/assets/host-purple.jpg'),
    ('med-3', 'Concert Finale Confetti Blast Arena', 'image', 'Festivals', '3.1 MB', NULL, '4000 x 2667', 'https://sidwizz-portfolio.vercel.app/assets/confetti-concert.jpg'),
    ('med-4', 'Siddharth Maurya Technical Stage Rider & Hospitality Guide (PDF)', 'document', 'Riders & Specs', '1.2 MB', NULL, NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    ('med-5', 'High-Impact Emcee Intro Voiceover & BGM', 'audio', 'Audio Clips', '4.8 MB', '0:42 sec', NULL, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
    ('med-6', 'Black Bowtie Gala Host Portrait', 'image', 'Headshots', '1.8 MB', NULL, '2400 x 3000', 'https://sidwizz-portfolio.vercel.app/assets/host-bowtie.jpg')
ON CONFLICT (id) DO NOTHING;

