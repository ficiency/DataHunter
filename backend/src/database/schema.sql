-- Scans table - stores information about each scan request
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);


-- Findings table - store personal data found during scans
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    website_url VARCHAR(500) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    found_value TEXT NOT NULL,
    screenshot_path VARCHAR(500),
    found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time DECIMAL(10, 3)
);