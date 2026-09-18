package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
)

func CORS(origins []string) cors.Config {
	corsCfg := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	if len(origins) == 1 && origins[0] == "*" {
		corsCfg.AllowAllOrigins = true
		corsCfg.AllowCredentials = false
	} else {
		corsCfg.AllowOrigins = origins
	}

	return corsCfg
}
