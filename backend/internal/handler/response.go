package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	apperr "github.com/Yusufrhman/len_test/backend/internal/err"
)

const (
	codeValidationError = "VALIDATION_ERROR"
	codeEntityNotFound  = "ENTITY_NOT_FOUND"
	codeInternalError   = "INTERNAL_SERVER_ERROR"

	messageValidationError = "Invalid request data"
	messageEntityNotFound  = "Entity not found"
	messageInternalError   = "An unexpected error occurred"
)

type dataResponse struct {
	Data any `json:"data"`
}

type errorResponse struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

func writeData(c *gin.Context, status int, data any) {
	c.JSON(status, dataResponse{Data: data})
}

func writeError(c *gin.Context, err error) {
	if errors.Is(err, apperr.ErrEntityNotFound) {
		writeErrorBody(c, http.StatusNotFound, codeEntityNotFound, messageEntityNotFound, nil)
		return
	}

	log.Printf("unexpected error: %v", err)
	writeErrorBody(c, http.StatusInternalServerError, codeInternalError, messageInternalError, nil)
}

func writeValidationError(c *gin.Context, err error, req any) {
	writeErrorBody(c, http.StatusBadRequest, codeValidationError, messageValidationError, validationErrorFields(err, req))
}

func writeErrorBody(c *gin.Context, status int, code, message string, fields map[string]string) {
	c.JSON(status, errorResponse{
		Error: errorBody{
			Code:    code,
			Message: message,
			Fields:  fields,
		},
	})
}
