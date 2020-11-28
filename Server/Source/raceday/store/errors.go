package store

type BroadcastNotFoundError struct{}
type EventNotFoundError struct{}
type LocationNotFoundError struct{}
type SeriesNotFoundError struct{}

func (err BroadcastNotFoundError) Error() string {
	return "broadcast not found"
}

func (err EventNotFoundError) Error() string {
	return "event not found"
}

func (err LocationNotFoundError) Error() string {
	return "location not found"
}

func (err SeriesNotFoundError) Error() string {
	return "series not found"
}
