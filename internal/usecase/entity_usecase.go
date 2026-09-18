package usecase

import (
	"context"

	"github.com/Yusufrhman/len_test/backend/internal/dto"
	"github.com/Yusufrhman/len_test/backend/internal/entity"
)

type EntityRepository interface {
	GetAll(ctx context.Context, entityType, status string) ([]entity.Entity, error)
	GetByID(ctx context.Context, id string) (*entity.Entity, error)
	Create(ctx context.Context, e *entity.Entity) error
	Update(ctx context.Context, e *entity.Entity) error
}

type EntityUsecase struct {
	repository EntityRepository
}

func NewEntityUsecase(repository EntityRepository) *EntityUsecase {
	return &EntityUsecase{
		repository: repository,
	}
}

func (u *EntityUsecase) GetAll(ctx context.Context, req dto.GetEntitiesRequest) ([]dto.EntityResponse, error) {
	entities, err := u.repository.GetAll(ctx, req.Type, req.Status)
	if err != nil {
		return nil, err
	}

	responses := make([]dto.EntityResponse, 0, len(entities))
	for _, e := range entities {
		responses = append(responses, toEntityResponse(e))
	}

	return responses, nil
}

func (u *EntityUsecase) Create(ctx context.Context, req dto.CreateEntityRequest) (*dto.EntityResponse, error) {
	e := &entity.Entity{
		Name:      req.Name,
		Type:      req.Type,
		Status:    req.Status,
		Latitude:  *req.Latitude,
		Longitude: *req.Longitude,
	}

	if err := u.repository.Create(ctx, e); err != nil {
		return nil, err
	}

	response := toEntityResponse(*e)

	return &response, nil
}

func (u *EntityUsecase) GetByID(ctx context.Context, id string) (*dto.EntityResponse, error) {
	e, err := u.repository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := toEntityResponse(*e)

	return &response, nil
}

func (u *EntityUsecase) Update(ctx context.Context, id string, req dto.UpdateEntityRequest) (*dto.EntityResponse, error) {
	e := &entity.Entity{
		ID:        id,
		Name:      req.Name,
		Type:      req.Type,
		Status:    req.Status,
		Latitude:  *req.Latitude,
		Longitude: *req.Longitude,
	}

	if err := u.repository.Update(ctx, e); err != nil {
		return nil, err
	}

	response := toEntityResponse(*e)

	return &response, nil
}

func toEntityResponse(e entity.Entity) dto.EntityResponse {
	return dto.EntityResponse{
		ID:        e.ID,
		Name:      e.Name,
		Type:      e.Type,
		Status:    e.Status,
		Latitude:  e.Latitude,
		Longitude: e.Longitude,
		CreatedAt: e.CreatedAt.UTC(),
		UpdatedAt: e.UpdatedAt.UTC(),
	}
}
