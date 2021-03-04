package formats

type GoogleDoc struct{}

func (gd GoogleDoc) GetName() string {
	return "Google Doc"
}

func (gd GoogleDoc) Export() error {
	return nil
}
