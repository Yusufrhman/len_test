package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Yusufrhman/len_test/backend/internal/dto"
)

type EntityUsecase interface {
	GetAll(ctx context.Context, req dto.GetEntitiesRequest) ([]dto.EntityResponse, error)
	GetByID(ctx context.Context, id string) (*dto.EntityResponse, error)
}

type GinHandler struct {
	usecase EntityUsecase
}

func NewGinHandler(router *gin.RouterGroup, entityUsecase EntityUsecase) {
	handler := &GinHandler{
		usecase: entityUsecase,
	}

	handler.registerRoutes(router)
}

func (h *GinHandler) registerRoutes(router *gin.RouterGroup) {
	router.GET("/entities", h.GetEntities)
	router.GET("/entities/:id", h.GetEntity)
}

func (h *GinHandler) GetEntities(c *gin.Context) {
	var req dto.GetEntitiesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		writeValidationError(c, err, req)
		return
	}

	entities, err := h.usecase.GetAll(c.Request.Context(), req)
	if err != nil {
		writeError(c, err)
		return
	}

	writeData(c, http.StatusOK, entities)
}

func (h *GinHandler) GetEntity(c *gin.Context) {
	entity, err := h.usecase.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		writeError(c, err)
		return
	}

	writeData(c, http.StatusOK, entity)
}
