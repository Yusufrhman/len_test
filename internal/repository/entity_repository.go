package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jmoiron/sqlx"

	"github.com/Yusufrhman/len_test/backend/internal/entity"
	apperr "github.com/Yusufrhman/len_test/backend/internal/err"
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

func (r *EntityRepository) GetByID(ctx context.Context, id string) (*entity.Entity, error) {
	query := `SELECT ` + entityColumns + ` FROM entities WHERE id = $1`

	var e entity.Entity
	if err := r.db.GetContext(ctx, &e, query, id); err != nil {
		return nil, translateError(err)
	}

	return &e, nil
}

func translateError(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return apperr.ErrEntityNotFound
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "22P02" {
		return apperr.ErrEntityNotFound
	}

	return err
}
