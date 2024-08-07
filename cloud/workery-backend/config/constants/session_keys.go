package constants

type key int

const (
	SessionIsAuthorized key = iota
	SessionSkipAuthorization
	SessionID
	SessionIPAddress
	SessionProxies
	SessionUser
	SessionUserCompanyName
	SessionUserRole
	SessionUserHasStaffRole
	SessionUserID
	SessionUserUUID
	SessionUserTimezone
	SessionUserName
	SessionUserFirstName
	SessionUserLastName
	SessionUserTenantID
	SessionUserTenantName
	SessionUserOTPValidated
	SessionUserReferenceID
)
