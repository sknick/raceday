package store

type BroadcastNotFoundError struct{}
type EventNotFoundError struct{}

func (err BroadcastNotFoundError) Error() string {
	return "broadcast not found"
}

func (err EventNotFoundError) Error() string {
	return "event not found"
}
