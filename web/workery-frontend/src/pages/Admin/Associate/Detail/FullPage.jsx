// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/FullPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import {
  TagsDisplay,
  SkillSetsDisplay,
  InsuranceRequirementsDisplay,
  HowHearAboutUsDisplay,
  ServiceFeeDisplay,
  VehicleTypesDisplay,
} from "../../../../components/Display";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_PHONE_TYPE_WORK = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
const ASSOCIATE_IS_JOB_SEEKER_NO = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_OTHER = 1;
const ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT = 2;
const ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN = 3;
const ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS = 4;
const ASSOCIATE_MARITAL_STATUS_OTHER = 1;
const ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER = 1;

// Option mappings for display
const ASSOCIATE_TYPE_OPTIONS = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

const ASSOCIATE_ORGANIZATION_TYPE_OPTIONS = {
  1: "Private",
  2: "Non-profit",
  3: "Government",
};

const GENDER_OPTIONS = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const PHONE_TYPE_OPTIONS = {
  1: "Mobile",
  2: "Work",
  3: "Home",
};

const ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS = {
  1: "Other",
  2: "Permanent Resident",
  3: "Naturalized Canadian Citizen",
  4: "Protected Persons",
};

const ASSOCIATE_MARITAL_STATUS_OPTIONS = {
  1: "Other",
  2: "Single",
  3: "Married",
  4: "Divorced",
  5: "Widowed",
};

const ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS = {
  1: "Other",
  2: "No formal education",
  3: "Elementary school",
  4: "High school",
  5: "College",
  6: "University",
  7: "Graduate school",
};

const IDENTIFY_AS_OPTIONS = {
  1: "Aboriginal",
  2: "Visible minority",
  3: "Person with disability",
  4: "Youth",
  5: "Senior",
  6: "Woman",
  7: "Newcomer",
};

function AdminAssociateDetailFullPage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate data
  const fetchAssociate = async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [aid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  const formatEmail = (email) => {
    if (!email) return "-";
    return (
      <a href={`mailto:${email}`} style={{ color: theme.colors.primary }}>
        {email}
      </a>
    );
  };

  const formatDriversLicenseClasses = (driversLicenseClass) => {
    if (!driversLicenseClass || driversLicenseClass.length === 0) return "-";
    return driversLicenseClass.map((license) => license.text).join(", ");
  };

  const formatMultiSelect = (selectedValues, options) => {
    if (!selectedValues || selectedValues.length === 0) return "-";
    return selectedValues
      .map((value) => options[value] || `Unknown (${value})`)
      .join(", ");
  };

  const formatAddress = (associate) => {
    if (!associate) return "-";
    const address =
      associate.fullAddressWithPostalCode ||
      `${associate.addressLine1 || ""} ${associate.city || ""} ${associate.region || ""} ${associate.postalCode || ""}`.trim();

    if (associate.fullAddressUrl) {
      return (
        <a
          href={associate.fullAddressUrl}
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.colors.primary }}
        >
          {address} 🔗
        </a>
      );
    }
    return address;
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  };

  // Table component
  const DetailTable = ({ title, children }) => (
    <table
      style={{
        width: "100%",
        marginBottom: "30px",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: theme.colors.dark }}>
          <th
            style={{
              color: "white",
              padding: "12px",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: "600",
            }}
            colSpan="2"
          >
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  // Table row component
  const DetailRow = ({ label, value, valueStyle = {} }) => (
    <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
      <th
        style={{
          backgroundColor: theme.colors.light,
          padding: "12px",
          width: "30%",
          fontWeight: "600",
          textAlign: "left",
        }}
      >
        {label}:
      </th>
      <td style={{ padding: "12px", ...valueStyle }}>{value}</td>
    </tr>
  );

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading associate details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>👷 Associate</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <Alert type="info">📁 This associate is archived</Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* Header with Actions */}
        {associate && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>📋 Detail</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link to={`/admin/associate/${aid}/edit`}>
                <Button variant="warning" disabled={associate.status === 2}>
                  ✏️ Edit
                </Button>
              </Link>
            </div>
          </div>
        )}

        {associate && (
          <>
            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                marginBottom: "30px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={`/admin/associate/${associate.id}`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Summary
              </Link>
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Detail
              </div>
              <Link
                to={`/admin/associate/${associate.id}/orders`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Orders
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/comments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {/* Personal Information Table */}
            <DetailTable title="Personal Information">
              <DetailRow
                label="Type"
                value={ASSOCIATE_TYPE_OPTIONS[associate.type] || "Unknown"}
              />
              <DetailRow
                label="First Name"
                value={associate.firstName || "-"}
              />
              <DetailRow label="Last Name" value={associate.lastName || "-"} />
              <DetailRow
                label="Date of Birth"
                value={formatDate(associate.birthDate)}
              />
              <DetailRow
                label="Gender"
                value={
                  associate.gender ? (
                    <>
                      {GENDER_OPTIONS[associate.gender] || "Unknown"}
                      {associate.gender === 1 &&
                        associate.genderOther &&
                        ` - ${associate.genderOther}`}
                    </>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="Description"
                value={associate.description || "-"}
              />
              <DetailRow
                label="Tags"
                value={
                  <TagsDisplay
                    values={extractIds(associate.tags)}
                    onUnauthorized={onUnauthorized}
                  />
                }
              />
              <DetailRow
                label="Skill Sets"
                value={
                  <SkillSetsDisplay
                    values={extractIds(associate.skillSets)}
                    onUnauthorized={onUnauthorized}
                  />
                }
              />
            </DetailTable>

            {/* Company Information Table (for Commercial associates) */}
            {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
              <DetailTable title="Company Information">
                <DetailRow
                  label="Company Name"
                  value={associate.organizationName || "-"}
                />
                <DetailRow
                  label="Company Type"
                  value={
                    ASSOCIATE_ORGANIZATION_TYPE_OPTIONS[
                      associate.organizationType
                    ] || "-"
                  }
                />
              </DetailTable>
            )}

            {/* Contact Point Table */}
            <DetailTable title="Contact Point">
              <DetailRow label="Email" value={formatEmail(associate.email)} />
              <DetailRow
                label="I agree to receive electronic email"
                value={associate.isOkToEmail ? "✅ Yes" : "❌ No"}
              />
              <DetailRow
                label="Phone"
                value={formatPhone(
                  associate.phone,
                  associate.phoneType === ASSOCIATE_PHONE_TYPE_WORK
                    ? associate.phoneExtension
                    : null,
                )}
              />
              <DetailRow
                label="Phone Type"
                value={PHONE_TYPE_OPTIONS[associate.phoneType] || "-"}
              />
              {associate.otherPhone && (
                <>
                  <DetailRow
                    label="Other Phone (Optional)"
                    value={formatPhone(
                      associate.otherPhone,
                      associate.otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK
                        ? associate.otherPhoneExtension
                        : null,
                    )}
                  />
                  <DetailRow
                    label="Other Phone Type (Optional)"
                    value={PHONE_TYPE_OPTIONS[associate.otherPhoneType] || "-"}
                  />
                </>
              )}
              <DetailRow
                label="I agree to receive texts to my phone"
                value={associate.isOkToText ? "✅ Yes" : "❌ No"}
              />
            </DetailTable>

            {/* Address Table */}
            <DetailTable title="Address">
              <DetailRow label="Location" value={formatAddress(associate)} />
            </DetailTable>

            {/* Account Table */}
            <DetailTable title="Account">
              <DetailRow
                label="Insurance Requirement(s)"
                value={
                  <InsuranceRequirementsDisplay
                    values={extractIds(associate.insuranceRequirements)}
                    onUnauthorized={onUnauthorized}
                  />
                }
              />
              {associate.serviceFeeId && (
                <DetailRow
                  label="Service Fee"
                  value={
                    <ServiceFeeDisplay
                      value={associate.serviceFeeId}
                      onUnauthorized={onUnauthorized}
                      showAmount={true}
                    />
                  }
                />
              )}
              <DetailRow
                label="Hourly salary desired (Optional)"
                value={
                  associate.hourlySalaryDesired
                    ? `$${associate.hourlySalaryDesired} / hr`
                    : "-"
                }
              />
              <DetailRow
                label="Limit special"
                value={associate.limitSpecial || "-"}
              />
              <DetailRow
                label="Dues Expiry"
                value={formatDate(associate.duesDate)}
              />
              <DetailRow
                label="Commercial insurance expiry date"
                value={formatDate(associate.commercialInsuranceExpiryDate)}
              />
              <DetailRow
                label="Auto Insurance Expiry Date"
                value={formatDate(associate.autoInsuranceExpiryDate)}
              />
              <DetailRow label="WSIB #" value={associate.wsibNumber || "-"} />
              <DetailRow
                label="WSIB Insurance Date"
                value={formatDate(associate.wsibInsuranceDate)}
              />
              <DetailRow
                label="Police check date"
                value={formatDate(associate.policeCheck)}
              />
              <DetailRow label="HST #" value={associate.taxId || "-"} />
              <DetailRow
                label="Drivers license class(es)"
                value={formatDriversLicenseClasses(
                  associate.driversLicenseClass,
                )}
              />
              <DetailRow
                label="Vehicle(s)"
                value={
                  <VehicleTypesDisplay
                    values={extractIds(associate.vehicleTypes)}
                    onUnauthorized={onUnauthorized}
                  />
                }
              />
              <DetailRow
                label="Account Balance"
                value={
                  associate.balanceOwingAmount
                    ? `$${associate.balanceOwingAmount}`
                    : "$0.00"
                }
              />
              <DetailRow
                label="Is active"
                value={associate.status === 1 ? "Active" : "Archive"}
              />
              <DetailRow
                label="Preferred Language"
                value={associate.preferredLanguage || "English"}
              />
            </DetailTable>

            {/* Emergency Contact Table */}
            <DetailTable title="Emergency Contact">
              <DetailRow
                label="Name"
                value={associate.emergencyContactName || "-"}
              />
              <DetailRow
                label="Relationship"
                value={associate.emergencyContactRelationship || "-"}
              />
              <DetailRow
                label="Telephone"
                value={formatPhone(associate.emergencyContactTelephone)}
              />
              <DetailRow
                label="Alternate Telephone"
                value={formatPhone(
                  associate.emergencyContactAlternativeTelephone,
                )}
              />
            </DetailTable>

            {/* Job Seeker Table */}
            <DetailTable title="Job Seeker">
              <DetailRow
                label="Is Job Seeker?"
                value={
                  associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES
                    ? "Yes"
                    : associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_NO
                      ? "No"
                      : "-"
                }
              />
              {associate.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                <>
                  <DetailRow
                    label="Job Seeker ID"
                    value={associate.jobSeekerId || "-"}
                  />
                  <DetailRow
                    label="Status in Country"
                    value={
                      ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS[
                        associate.statusInCountry
                      ] || "-"
                    }
                  />
                  {associate.statusInCountry ===
                    ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                    <DetailRow
                      label="Status in Country (Other)"
                      value={associate.statusInCountryOther || "-"}
                    />
                  )}
                  {(associate.statusInCountry ===
                    ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                    associate.statusInCountry ===
                      ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CANADIAN_CITIZEN ||
                    associate.statusInCountry ===
                      ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSONS) && (
                    <>
                      <DetailRow
                        label="Country of Origin"
                        value={associate.countryOfOrigin || "-"}
                      />
                      <DetailRow
                        label="Date of Entry into Country"
                        value={formatDate(associate.dateOfEntryIntoCountry)}
                      />
                    </>
                  )}
                  <DetailRow
                    label="Marital Status"
                    value={
                      ASSOCIATE_MARITAL_STATUS_OPTIONS[
                        associate.maritalStatus
                      ] || "-"
                    }
                  />
                  {associate.maritalStatus ===
                    ASSOCIATE_MARITAL_STATUS_OTHER && (
                    <DetailRow
                      label="Marital Status (Other)"
                      value={associate.maritalStatusOther || "-"}
                    />
                  )}
                  <DetailRow
                    label="Accomplished level of Education"
                    value={
                      ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS[
                        associate.accomplishedEducation
                      ] || "-"
                    }
                  />
                  {associate.accomplishedEducation ===
                    ASSOCIATE_ACCOMPLISHED_EDUCATION_OTHER && (
                    <DetailRow
                      label="Accomplished level of Education (Other)"
                      value={associate.accomplishedEducationOther || "-"}
                    />
                  )}
                </>
              )}
            </DetailTable>

            {/* Internal Metrics Table */}
            <DetailTable title="Internal Metrics">
              <DetailRow
                label="How did they discover us?"
                value={
                  associate.isHowDidYouHearAboutUsOther ? (
                    associate.howDidYouHearAboutUsOther
                  ) : (
                    <HowHearAboutUsDisplay
                      value={
                        associate.howDidYouHearAboutUsID ||
                        associate.howDidYouHearAboutUsId
                      }
                      onUnauthorized={onUnauthorized}
                    />
                  )
                }
              />
              <DetailRow
                label="Join date"
                value={formatDateTime(associate.joinDate)}
              />
              <DetailRow
                label="Do you identify as belonging to any of the following groups?"
                value={formatMultiSelect(
                  associate.identifyAs,
                  IDENTIFY_AS_OPTIONS,
                )}
              />
            </DetailTable>

            {/* System Table */}
            <DetailTable title="System">
              <DetailRow
                label="ID"
                value={associate.publicId || associate.id || "-"}
                valueStyle={{
                  fontFamily: "monospace",
                  backgroundColor: "#f9f9f9",
                }}
              />
              <DetailRow
                label="Created at"
                value={formatDateTime(associate.createdAt)}
              />
              <DetailRow
                label="Created by"
                value={associate.createdByUserName || "-"}
              />
              <DetailRow
                label="Created from"
                value={associate.createdFromIpAddress || "-"}
                valueStyle={{ fontFamily: "monospace" }}
              />
              <DetailRow
                label="Modified at"
                value={formatDateTime(associate.modifiedAt)}
              />
              <DetailRow
                label="Modified by"
                value={associate.modifiedByUserName || "-"}
              />
              <DetailRow
                label="Modified from"
                value={associate.modifiedFromIpAddress || "-"}
                valueStyle={{ fontFamily: "monospace" }}
              />
            </DetailTable>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to="/admin/associates">
                <Button variant="outline">← Back to Associates</Button>
              </Link>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to={`/admin/associate/${aid}/edit`}>
                  <Button variant="warning" disabled={associate.status === 2}>
                    ✏️ Edit
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!associate && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Associate Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <Button variant="primary">← Back to Associates</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailFullPage;
