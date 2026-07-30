-- Create enums if they do not exist
CREATE TYPE budget_evidence_status AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE complaint_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE rti_status AS ENUM ('draft', 'submitted', 'processing', 'completed', 'appealed');

-- Create Districts table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    cdo_name VARCHAR(255),
    dao_address TEXT,
    dao_contact VARCHAR(255),
    dao_office_hours VARCHAR(255)
);

-- Create Constituencies table
CREATE TABLE IF NOT EXISTS constituencies (
    id VARCHAR(255) PRIMARY KEY, -- KTM-1, etc.
    name VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    winner_representative_id INTEGER,
    slug VARCHAR(255) UNIQUE NOT NULL,
    map_identifier VARCHAR(255) NOT NULL,
    election_year INTEGER DEFAULT 2026,
    vote_count VARCHAR(255) DEFAULT 'pending_verification',
    victory_margin VARCHAR(255) DEFAULT 'pending_verification'
);

-- Create Representatives table
CREATE TABLE IF NOT EXISTS representatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    party VARCHAR(255) NOT NULL,
    constituency_id VARCHAR(255) REFERENCES constituencies(id) ON DELETE SET NULL,
    position VARCHAR(255),
    attendance_percent INTEGER,
    bills_sponsored INTEGER,
    contact_info TEXT,
    bio TEXT
);

-- Add foreign key constraint to constituencies for winner_representative_id
ALTER TABLE constituencies ADD CONSTRAINT fk_constituency_winner FOREIGN KEY (winner_representative_id) REFERENCES representatives(id) ON DELETE SET NULL;

-- Create Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    representative_id INTEGER REFERENCES representatives(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create BudgetProjects table
CREATE TABLE IF NOT EXISTS budget_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    completion_percent INTEGER DEFAULT 0,
    evidence_status budget_evidence_status DEFAULT 'unverified',
    description TEXT
);

-- Create Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    ward VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    photo_url TEXT,
    status complaint_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RtiRequests table
CREATE TABLE IF NOT EXISTS rti_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    target_office VARCHAR(255) NOT NULL,
    letter_content TEXT NOT NULL,
    status rti_status DEFAULT 'submitted',
    submitted_date DATE DEFAULT CURRENT_DATE,
    deadline_date DATE
);

-- Create CivicEvents table
CREATE TABLE IF NOT EXISTS civic_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    organizer VARCHAR(255) NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_constituencies_district ON constituencies(district_id);
CREATE INDEX IF NOT EXISTS idx_representatives_constituency ON representatives(constituency_id);
CREATE INDEX IF NOT EXISTS idx_ratings_representative ON ratings(representative_id);
CREATE INDEX IF NOT EXISTS idx_budget_projects_district ON budget_projects(district_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_rti_requests_user ON rti_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_events_verified ON civic_events(verified);
