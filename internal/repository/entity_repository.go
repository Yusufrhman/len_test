package repository

import (
	"context"

	"github.com/jmoiron/sqlx"

	"github.com/Yusufrhman/len_test/backend/internal/entity"
)

const entityColumns = `id, name, type, status, latitude, longitude, created_at, updated_at`

type EntityRepository struct {
	db *sqlx.DB
}

func NewEntityRepository(db *sqlx.DB) *EntityRepository {
	return &EntityRepository{
		db: db,
	}
}

func (r *EntityRepository) GetAll(ctx context.Context, entityType, status string) ([]entity.Entity, error) {
	query := `
		SELECT ` + entityColumns + `
		FROM entities
		WHERE ($1 = '' OR type = $1)
		  AND ($2 = '' OR status = $2)
		ORDER BY created_at DESC
	`

	entities := make([]entity.Entity, 0)
	if err := r.db.SelectContext(ctx, &entities, query, entityType, status); err != nil {
		return nil, err
	}

	return entities, nil
}
