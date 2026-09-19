CREATE DATABASE len_db;

\c len_db

DROP TABLE IF EXISTS entities;

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT entities_latitude_check
        CHECK (latitude >= -90 AND latitude <= 90),

    CONSTRAINT entities_longitude_check
        CHECK (longitude >= -180 AND longitude <= 180)
);