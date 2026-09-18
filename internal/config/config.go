package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

const (
	defaultAppPort = "8080"
	defaultGinMode = "release"
)

type Config struct {
	AppPort     string
	DatabaseURL string
	GinMode     string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		AppPort:     getEnv("APP_PORT", defaultAppPort),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		GinMode:     getEnv("GIN_MODE", defaultGinMode),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
