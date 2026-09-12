CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS my_flights (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 flight_number TEXT NOT NULL,
 flight_date DATE NOT NULL,
 origin TEXT NOT NULL,
 destination TEXT NOT NULL,
 airline TEXT,
 seat TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS my_flights_user_date_idx ON my_flights(user_id, flight_date DESC);
