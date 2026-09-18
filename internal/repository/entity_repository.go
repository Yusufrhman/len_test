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

func (r *EntityRepository) Create(ctx context.Context, e *entity.Entity) error {
	query := `
		INSERT INTO entities (name, type, status, latitude, longitude)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowxContext(ctx, query, e.Name, e.Type, e.Status, e.Latitude, e.Longitude).
		Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *EntityRepository) GetByID(ctx context.Context, id string) (*entity.Entity, error) {
	query := `SELECT ` + entityColumns + ` FROM entities WHERE id = $1`

	var e entity.Entity
	if err := r.db.GetContext(ctx, &e, query, id); err != nil {
		return nil, translateError(err)
	}

	return &e, nil
}

func (r *EntityRepository) Update(ctx context.Context, e *entity.Entity) error {
	query := `
		UPDATE entities
		SET name = $1, type = $2, status = $3, latitude = $4, longitude = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING created_at, updated_at
	`

	if err := r.db.QueryRowxContext(ctx, query, e.Name, e.Type, e.Status, e.Latitude, e.Longitude, e.ID).
		Scan(&e.CreatedAt, &e.UpdatedAt); err != nil {
		return translateError(err)
	}

	return nil
}

func (r *EntityRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM entities WHERE id = $1`, id)
	if err != nil {
		return translateError(err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected == 0 {
		return apperr.ErrEntityNotFound
	}

	return nil
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
