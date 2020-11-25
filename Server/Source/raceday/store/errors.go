package store

type EventNotFoundError struct{}

func (err EventNotFoundError) Error() string {
	return "event not found"
}
