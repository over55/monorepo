// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../../constants/Roles";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import {
  formatDate,
  formatDateTime,
  formatDateForDisplay,
} from "../../../../services/Helpers/DateFormatter";

/**
 * Account Detail Page for Admin Users
 * Displays profile information for Executive, Management, and Frontline staff
 */
function AdminAccountDetailPage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("detail");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch account details
  useEffect(() => {
    let mounted = true;

    const fetchAccountDetails = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const onUnauthorized = () => {
          authManager.clearAllTokens();
          navigate("/login?unauthorized=true");
        };

        const profileData =
          await accountManager.getAccountDetail(onUnauthorized);

        if (mounted) {
          // Validate that this is a staff user
          if (
            ![
              EXECUTIVE_ROLE_ID,
              MANAGEMENT_ROLE_ID,
              FRONTLINE_ROLE_ID,
            ].includes(profileData.role)
          ) {
            navigate("/501");
            return;
          }

          setCurrentUser(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch account details:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load account details" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAccountDetails();

    return () => {
      mounted = false;
    };
  }, [accountManager, authManager, navigate]);

  // Helper functions
  const getRoleDisplayName = (role) => {
    switch (role) {
      case EXECUTIVE_ROLE_ID:
        return "Executive Staff";
      case MANAGEMENT_ROLE_ID:
        return "Management Staff";
      case FRONTLINE_ROLE_ID:
        return "Frontline Staff";
      default:
        return "Staff";
    }
  };

  const getPhoneTypeDisplay = (phoneType) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === phoneType,
    );
    return option ? option.label : "-";
  };

  const getOrganizationTypeDisplay = (orgType) => {
    const option = STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === orgType,
    );
    return option ? option.label : "-";
  };

  const getGenderDisplay = (gender, genderOther) => {
    switch (gender) {
      case 1: // Other
        return genderOther || "Other";
      case 2:
        return "Male";
      case 3:
        return "Female";
      case 4:
        return "Prefer not to say";
      default:
        return "-";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <h1>Account Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (errors.general) {
    return (
      <div>
        <h1>Account Details</h1>
        <div style={{ color: "red" }}>
          <p>Error: {errors.general}</p>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentUser) {
    return (
      <div>
        <h1>Account Details</h1>
        <p>No account data found</p>
        <Link to="/admin/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div>
        <Link to="/admin/dashboard">← Back to Dashboard</Link>
        <h1>My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <hr />

      {/* Tab Navigation */}
      <div>
        <button
          onClick={() => setActiveTab("detail")}
          style={{ fontWeight: activeTab === "detail" ? "bold" : "normal" }}
        >
          Detail
        </button>
        {" | "}
        <button
          onClick={() => navigate("/account/2fa")}
          style={{ fontWeight: activeTab === "2fa" ? "bold" : "normal" }}
        >
          2FA
        </button>
        {" | "}
        <button
          onClick={() => navigate("/account/more")}
          style={{ fontWeight: activeTab === "more" ? "bold" : "normal" }}
        >
          More
        </button>
      </div>

      <hr />

      {/* Main Content */}
      {activeTab === "detail" && (
        <div>
          {/* Edit Button */}
          <div style={{ float: "right" }}>
            <Link to="/account/edit">
              <button disabled={currentUser.status === 2}>Edit Profile</button>
            </Link>
          </div>

          {/* Personal Information */}
          <h2>Personal Information</h2>
          <table
            border="1"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td style={{ width: "30%", fontWeight: "bold" }}>Role:</td>
                <td>{getRoleDisplayName(currentUser.role)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>First Name:</td>
                <td>{currentUser.firstName || "-"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Last Name:</td>
                <td>{currentUser.lastName || "-"}</td>
              </tr>
              {currentUser.role !== EXECUTIVE_ROLE_ID && (
                <>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Date of Birth:</td>
                    <td>{formatDateForDisplay(currentUser.birthDate)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Gender:</td>
                    <td>
                      {getGenderDisplay(
                        currentUser.gender,
                        currentUser.genderOther,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Description:</td>
                    <td>{currentUser.description || "-"}</td>
                  </tr>
                  {currentUser.tags && currentUser.tags.length > 0 && (
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Tags:</td>
                      <td>
                        {currentUser.tags.map((tag, index) => (
                          <span key={tag.id}>
                            {tag.text}
                            {index < currentUser.tags.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                  {currentUser.skillSets &&
                    currentUser.skillSets.length > 0 && (
                      <tr>
                        <td style={{ fontWeight: "bold" }}>Skill Sets:</td>
                        <td>
                          {currentUser.skillSets.map((skill, index) => (
                            <span key={skill.id}>
                              {skill.subCategory}
                              {index < currentUser.skillSets.length - 1 && ", "}
                            </span>
                          ))}
                        </td>
                      </tr>
                    )}
                </>
              )}
            </tbody>
          </table>

          {/* Contact Information */}
          <h2>Contact Information</h2>
          <table
            border="1"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td style={{ width: "30%", fontWeight: "bold" }}>Email:</td>
                <td>
                  {currentUser.email ? (
                    <a href={`mailto:${currentUser.email}`}>
                      {currentUser.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Agree to receive emails:</td>
                <td>{currentUser.isOkToEmail ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Phone:</td>
                <td>
                  {currentUser.phone ? (
                    <a href={`tel:${currentUser.phone}`}>{currentUser.phone}</a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Phone Type:</td>
                <td>{getPhoneTypeDisplay(currentUser.phoneType)}</td>
              </tr>
              {currentUser.otherPhone && (
                <>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Other Phone:</td>
                    <td>
                      <a href={`tel:${currentUser.otherPhone}`}>
                        {currentUser.otherPhone}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Other Phone Type:</td>
                    <td>{getPhoneTypeDisplay(currentUser.otherPhoneType)}</td>
                  </tr>
                </>
              )}
              <tr>
                <td style={{ fontWeight: "bold" }}>Agree to receive texts:</td>
                <td>{currentUser.isOkToText ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>

          {/* Address Information (Not for Executive role) */}
          {currentUser.role !== EXECUTIVE_ROLE_ID && (
            <>
              <h2>Address</h2>
              <table
                border="1"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "bold" }}>
                      Location:
                    </td>
                    <td>
                      {currentUser.fullAddressUrl ? (
                        <a
                          href={currentUser.fullAddressUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {currentUser.fullAddressWithPostalCode || "-"}
                        </a>
                      ) : (
                        currentUser.fullAddressWithPostalCode || "-"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Account Information (Management and Frontline only) */}
          {[MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
            currentUser.role,
          ) && (
            <>
              <h2>Account Information</h2>
              <table
                border="1"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {currentUser.insuranceRequirements &&
                    currentUser.insuranceRequirements.length > 0 && (
                      <tr>
                        <td style={{ width: "30%", fontWeight: "bold" }}>
                          Insurance Requirements:
                        </td>
                        <td>
                          {currentUser.insuranceRequirements.map(
                            (req, index) => (
                              <span key={req.id}>
                                {req.name}
                                {index <
                                  currentUser.insuranceRequirements.length -
                                    1 && ", "}
                              </span>
                            ),
                          )}
                        </td>
                      </tr>
                    )}
                  {currentUser.hourlySalaryDesired && (
                    <tr>
                      <td style={{ fontWeight: "bold" }}>
                        Hourly Salary Desired:
                      </td>
                      <td>${currentUser.hourlySalaryDesired}/hr</td>
                    </tr>
                  )}
                  {currentUser.limitSpecial && (
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Limit Special:</td>
                      <td>{currentUser.limitSpecial}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Dues Expiry:</td>
                    <td>{formatDateForDisplay(currentUser.duesDate)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>
                      Commercial Insurance Expiry:
                    </td>
                    <td>
                      {formatDateForDisplay(
                        currentUser.commercialInsuranceExpiryDate,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>
                      Auto Insurance Expiry:
                    </td>
                    <td>
                      {formatDateForDisplay(
                        currentUser.autoInsuranceExpiryDate,
                      )}
                    </td>
                  </tr>
                  {currentUser.wsibNumber && (
                    <tr>
                      <td style={{ fontWeight: "bold" }}>WSIB #:</td>
                      <td>{currentUser.wsibNumber}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: "bold" }}>WSIB Insurance Date:</td>
                    <td>
                      {formatDateForDisplay(currentUser.wsibInsuranceDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Police Check Date:</td>
                    <td>{formatDateForDisplay(currentUser.policeCheck)}</td>
                  </tr>
                  {currentUser.taxId && (
                    <tr>
                      <td style={{ fontWeight: "bold" }}>HST #:</td>
                      <td>{currentUser.taxId}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Status:</td>
                    <td>{currentUser.status === 1 ? "Active" : "Archived"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Preferred Language:</td>
                    <td>{currentUser.preferredLanguage || "English"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Emergency Contact (Management and Frontline only) */}
              <h2>Emergency Contact</h2>
              <table
                border="1"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "bold" }}>Name:</td>
                    <td>{currentUser.emergencyContactName || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Relationship:</td>
                    <td>{currentUser.emergencyContactRelationship || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Telephone:</td>
                    <td>
                      {currentUser.emergencyContactTelephone ? (
                        <a
                          href={`tel:${currentUser.emergencyContactTelephone}`}
                        >
                          {currentUser.emergencyContactTelephone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Alternate Telephone:</td>
                    <td>
                      {currentUser.emergencyContactAlternativeTelephone ? (
                        <a
                          href={`tel:${currentUser.emergencyContactAlternativeTelephone}`}
                        >
                          {currentUser.emergencyContactAlternativeTelephone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Internal Metrics */}
              <h2>Internal Metrics</h2>
              <table
                border="1"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "bold" }}>
                      How did they discover us:
                    </td>
                    <td>
                      {currentUser.isHowDidYouHearAboutUsOther
                        ? currentUser.howDidYouHearAboutUsOther
                        : currentUser.howDidYouHearAboutUsText || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Join Date:</td>
                    <td>{formatDateTime(currentUser.joinDate)}</td>
                  </tr>
                  {currentUser.identifyAs &&
                    currentUser.identifyAs.length > 0 && (
                      <tr>
                        <td style={{ fontWeight: "bold" }}>Identifies As:</td>
                        <td>
                          {currentUser.identifyAs
                            .map((id) => {
                              // Map identify as values to labels
                              const identifyAsLabels = {
                                1: "Other",
                                2: "Prefer not to say",
                                3: "Women",
                                4: "Newcomer",
                                5: "Racialized Person",
                                6: "Veteran",
                                7: "Francophone",
                                8: "Person with Disability",
                                9: "Inuit",
                                10: "First Nations",
                                11: "Métis",
                              };
                              return identifyAsLabels[id] || "";
                            })
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </>
          )}

          {/* System Information */}
          <h2>System Information</h2>
          <table
            border="1"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td style={{ width: "30%", fontWeight: "bold" }}>
                  Created At:
                </td>
                <td>{formatDateTime(currentUser.createdAt)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Modified At:</td>
                <td>{formatDateTime(currentUser.modifiedAt)}</td>
              </tr>
              {currentUser.id && (
                <tr>
                  <td style={{ fontWeight: "bold" }}>User ID:</td>
                  <td>{currentUser.id}</td>
                </tr>
              )}
              {currentUser.publicId && (
                <tr>
                  <td style={{ fontWeight: "bold" }}>Public ID:</td>
                  <td>{currentUser.publicId}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Action Buttons */}
          <div style={{ marginTop: "20px" }}>
            <Link to="/admin/dashboard">
              <button>← Back to Dashboard</button>
            </Link>{" "}
            <Link to="/account/edit">
              <button disabled={currentUser.status === 2}>Edit Profile</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccountDetailPage;
