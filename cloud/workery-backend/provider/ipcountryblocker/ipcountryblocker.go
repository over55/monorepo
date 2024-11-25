package ipcountryblocker

import (
	"github.com/jpillora/ipfilter"

	"github.com/over55/monorepo/cloud/workery-backend/config"
)

// Provider provides an interface for abstracting time.
type Provider interface {
	IsAllowedIPAddress(ipAddress string) bool
	CountryOfIPAddress(ipAddress string) string
}

type ipCountryBlockerProvider struct {
	ipFilter *ipfilter.IPFilter
}

// NewProvider Provider contructor that returns the default time provider.
func NewProvider(cfg *config.Conf) Provider {
	f := ipfilter.New(ipfilter.Options{
		AllowedCountries: cfg.AppServer.AllowedCountries,
		BlockByDefault:   true,
	})

	// DEVELOPERS NOTE:
	// What is `ZZ` ? -> \https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#ZZ

	return ipCountryBlockerProvider{
		ipFilter: f,
	}
}

func (p ipCountryBlockerProvider) IsAllowedIPAddress(ipAddress string) bool {
	return p.ipFilter.Allowed(ipAddress)
}

func (p ipCountryBlockerProvider) CountryOfIPAddress(ipAddress string) string {
	return p.ipFilter.IPToCountry(ipAddress)
}
