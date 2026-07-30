-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create role enum
CREATE TYPE user_role AS ENUM ('citizen', 'moderator', 'admin');

-- Create status enum
CREATE TYPE promise_status AS ENUM ('promised', 'in_progress', 'delayed', 'fulfilled', 'broken');

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'citizen',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Promises table
CREATE TABLE IF NOT EXISTS promises (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    official_role VARCHAR(255) NOT NULL,
    constituency VARCHAR(255) NOT NULL,
    status promise_status DEFAULT 'promised',
    date_promised DATE NOT NULL,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_url TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT FALSE
);

-- Create Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    location GEOMETRY(Point, 4326), -- PostGIS Point for map visualization / reports
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create StatusHistory table
CREATE TABLE IF NOT EXISTS status_history (
    id SERIAL PRIMARY KEY,
    promise_id INTEGER REFERENCES promises(id) ON DELETE CASCADE,
    old_status promise_status,
    new_status promise_status NOT NULL,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    evidence_id INTEGER REFERENCES evidence(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_constituency ON promises(constituency);
CREATE INDEX IF NOT EXISTS idx_evidence_promise ON evidence(promise_id);
CREATE INDEX IF NOT EXISTS idx_status_history_promise ON status_history(promise_id);
CREATE INDEX IF NOT EXISTS idx_evidence_location ON evidence USING gist(location);
