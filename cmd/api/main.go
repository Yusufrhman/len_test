package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/Yusufrhman/len_test/backend/internal/config"
	"github.com/Yusufrhman/len_test/backend/internal/database"
	"github.com/Yusufrhman/len_test/backend/internal/handler"
	"github.com/Yusufrhman/len_test/backend/internal/repository"
	"github.com/Yusufrhman/len_test/backend/internal/usecase"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	gin.SetMode(cfg.GinMode)

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	router := gin.Default()
	api := router.Group("/api/v1")

	entityRepository := repository.NewEntityRepository(db)
	entityUsecase := usecase.NewEntityUsecase(entityRepository)
	handler.NewGinHandler(api, entityUsecase)

	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("run server: %v", err)
	}
}
