package formats

type ExportFormat interface {
	GetName() string
	Export() error
}
