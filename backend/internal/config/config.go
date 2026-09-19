package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

const (
	defaultAppPort     = "8080"
	defaultGinMode     = "release"
	defaultCORSOrigins = "*"
)

type Config struct {
	AppPort     string
	DatabaseURL string
	GinMode     string
	CORSOrigins []string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		AppPort:     getEnv("APP_PORT", defaultAppPort),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		GinMode:     getEnv("GIN_MODE", defaultGinMode),
		CORSOrigins: getEnvList("CORS_ORIGINS", defaultCORSOrigins),
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

func getEnvList(key, fallback string) []string {
	raw := getEnv(key, fallback)

	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))

	for _, part := range parts {
		if value := strings.TrimSpace(part); value != "" {
			values = append(values, value)
		}
	}

	return values
}
