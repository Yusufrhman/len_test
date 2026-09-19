package dto

type GetEntitiesRequest struct {
	Type   string `form:"type"`
	Status string `form:"status"`
}

type CreateEntityRequest struct {
	Name      string   `json:"name" binding:"required,notblank,max=255"`
	Type      string   `json:"type" binding:"required,oneof=vehicle iot_device facility"`
	Status    string   `json:"status" binding:"required,max=50"`
	Latitude  *float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude *float64 `json:"longitude" binding:"required,min=-180,max=180"`
}

type UpdateEntityRequest struct {
	Name      string   `json:"name" binding:"required,notblank,max=255"`
	Type      string   `json:"type" binding:"required,oneof=vehicle iot_device facility"`
	Status    string   `json:"status" binding:"required,max=50"`
	Latitude  *float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude *float64 `json:"longitude" binding:"required,min=-180,max=180"`
}
