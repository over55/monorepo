package blacklist

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

// Provider provides an interface for abstracting time.
type Provider interface {
    IsBannedIPAddress(ipAddress string) bool
}

type blacklistProvider struct{
    bannedIPAddresses map[string]bool
}

// readBlacklistFileContent reads the contents of the blacklist file and returns
// the list of banned items (ex: IP, URLs, etc).
func readBlacklistFileContent(filePath string) ([]string, error) {
	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file %s does not exist", filePath)
	}

	// Read the file contents
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %v", filePath, err)
	}

	// Parse the contents as a list of IPs separated by commas
	ips := strings.Split(string(data), ",")

	// Trim spaces around each IP address
	for i := range ips {
		ips[i] = strings.TrimSpace(ips[i])
	}

	return ips, nil
}


// NewProvider Provider contructor that returns the default time provider.
func NewProvider() Provider {
    bannedIPAddresses := make(map[string]bool)
    bannedIPAddressesFilePath := "static/blacklist/ips.txt"
    ips, err := readBlacklistFileContent(bannedIPAddressesFilePath)
	if err == nil { // Aka: if the file exists...
        for _, ip := range ips {
            fmt.Println("Blacklisted IP", ip)
            bannedIPAddresses[ip] = true
        }
	}

	return blacklistProvider{
        bannedIPAddresses: bannedIPAddresses,
    }
}

// Now returns the current time.
func (p blacklistProvider) IsBannedIPAddress(ipAddress string) bool{
	return p.bannedIPAddresses[ipAddress]
}
