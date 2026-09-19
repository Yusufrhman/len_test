package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

func validationErrorFields(err error, req any) map[string]string {
	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		return validationFields(validationErrs, reflect.TypeOf(req))
	}

	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) {
		return map[string]string{
			typeErr.Field: fmt.Sprintf("%s must be a %s", typeErr.Field, jsonTypeName(typeErr.Type)),
		}
	}

	return nil
}

func validationFields(errs validator.ValidationErrors, reqType reflect.Type) map[string]string {
	names := jsonFieldNames(reqType)

	fields := make(map[string]string, len(errs))
	for _, fieldErr := range errs {
		name := names[fieldErr.StructField()]
		if name == "" {
			name = fieldErr.Field()
		}

		if _, exists := fields[name]; exists {
			continue
		}

		fields[name] = validationMessage(name, fieldErr, reqType)
	}

	return fields
}

func validationMessage(name string, fieldErr validator.FieldError, reqType reflect.Type) string {
	switch fieldErr.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", name)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", name, strings.ReplaceAll(fieldErr.Param(), " ", ", "))
	case "min", "max":
		min, max := bindingBounds(reqType, fieldErr.StructField())
		if min != "" && max != "" {
			return fmt.Sprintf("%s must be between %s and %s", name, min, max)
		}

		return fmt.Sprintf("%s must be %s %s", name, fieldErr.Tag(), fieldErr.Param())
	default:
		return fmt.Sprintf("%s is invalid", name)
	}
}

func bindingBounds(reqType reflect.Type, structField string) (string, string) {
	structType := dereference(reqType)
	if structType.Kind() != reflect.Struct {
		return "", ""
	}

	field, ok := structType.FieldByName(structField)
	if !ok {
		return "", ""
	}

	var min, max string
	for _, rule := range strings.Split(field.Tag.Get("binding"), ",") {
		switch {
		case strings.HasPrefix(rule, "min="):
			min = strings.TrimPrefix(rule, "min=")
		case strings.HasPrefix(rule, "max="):
			max = strings.TrimPrefix(rule, "max=")
		}
	}

	return min, max
}

func jsonFieldNames(reqType reflect.Type) map[string]string {
	structType := dereference(reqType)
	if structType.Kind() != reflect.Struct {
		return nil
	}

	names := make(map[string]string, structType.NumField())
	for i := 0; i < structType.NumField(); i++ {
		field := structType.Field(i)

		name := strings.Split(field.Tag.Get("json"), ",")[0]
		if name == "" || name == "-" {
			name = field.Name
		}

		names[field.Name] = name
	}

	return names
}

func dereference(t reflect.Type) reflect.Type {
	for t.Kind() == reflect.Pointer {
		t = t.Elem()
	}

	return t
}

func jsonTypeName(t reflect.Type) string {
	switch dereference(t).Kind() {
	case reflect.Bool:
		return "boolean"
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64,
		reflect.Float32, reflect.Float64:
		return "number"
	case reflect.String:
		return "string"
	case reflect.Slice, reflect.Array:
		return "array"
	case reflect.Map, reflect.Struct:
		return "object"
	default:
		return dereference(t).Kind().String()
	}
}
