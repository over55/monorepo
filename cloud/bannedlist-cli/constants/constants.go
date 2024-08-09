package constants

const (
	WorkeryBackendConsoleLogFilePath = "./static/log.txt"
	BannedIPsFilePath                = "./static/ips.json"
	BannedURLsFilePath               = "./static/urls.json"
)

var (
	workeryBackendIgnoreURLS = []string{
		"/api/v1/",
		"/api/v2/",
	}
)

// GetWorkeryBackendIgnoreURLS returns a copy of the ignore URLs slice
func GetWorkeryBackendIgnoreURLS() []string {
	return append([]string(nil), workeryBackendIgnoreURLS...)
}
