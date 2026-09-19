package err

import "errors"

var (
	ErrEntityNotFound = errors.New("entity not found")
	ErrInvalidInput   = errors.New("invalid input")
)
