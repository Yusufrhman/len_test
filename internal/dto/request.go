package dto

type GetEntitiesRequest struct {
	Type   string `form:"type"`
	Status string `form:"status"`
}
