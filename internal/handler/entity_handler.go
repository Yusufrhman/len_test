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
	Create(ctx context.Context, req dto.CreateEntityRequest) (*dto.EntityResponse, error)
	Update(ctx context.Context, id string, req dto.UpdateEntityRequest) (*dto.EntityResponse, error)
	Delete(ctx context.Context, id string) error
}

type EntityHandler struct {
	usecase EntityUsecase
}

func NewEntityHandler(router *gin.RouterGroup, entityUsecase EntityUsecase) {
	handler := &EntityHandler{
		usecase: entityUsecase,
	}

	handler.registerRoutes(router)
}

func (h *EntityHandler) registerRoutes(router *gin.RouterGroup) {
	router.GET("/entities", h.GetEntities)
	router.GET("/entities/:id", h.GetEntity)
	router.POST("/entities", h.CreateEntity)
	router.PUT("/entities/:id", h.UpdateEntity)
	router.DELETE("/entities/:id", h.DeleteEntity)
}

func (h *EntityHandler) GetEntities(c *gin.Context) {
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

func (h *EntityHandler) GetEntity(c *gin.Context) {
	entity, err := h.usecase.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		writeError(c, err)
		return
	}

	writeData(c, http.StatusOK, entity)
}

func (h *EntityHandler) CreateEntity(c *gin.Context) {
	var req dto.CreateEntityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeValidationError(c, err, req)
		return
	}

	entity, err := h.usecase.Create(c.Request.Context(), req)
	if err != nil {
		writeError(c, err)
		return
	}

	writeData(c, http.StatusCreated, entity)
}

func (h *EntityHandler) UpdateEntity(c *gin.Context) {
	var req dto.UpdateEntityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeValidationError(c, err, req)
		return
	}

	entity, err := h.usecase.Update(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		writeError(c, err)
		return
	}

	writeData(c, http.StatusOK, entity)
}

func (h *EntityHandler) DeleteEntity(c *gin.Context) {
	if err := h.usecase.Delete(c.Request.Context(), c.Param("id")); err != nil {
		writeError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}
