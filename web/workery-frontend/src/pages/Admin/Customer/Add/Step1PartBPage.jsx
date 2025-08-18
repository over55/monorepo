// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartBPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../components/UI";

// Customer type constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerAddStep1PartBPage() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const [searchParams] = useSearchParams();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component state
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [selectedCustomerForDeletion, setSelectedCustomerForDeletion] =
    useState(null);
  const [isFetching, setFetching] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const fetchCustomers = useCallback(async () => {
    setFetching(true);
    setError(null);

    try {
      // Build filters map for the search
      const filtersMap = new Map();
      filtersMap.set("page_size", pageSize);

      // Only set sort if we have search criteria
      // Use lexical_name for sorting to maintain alphabetical order
      filtersMap.set("sort_field", "lexical_name");
      filtersMap.set("sort_order", "ASC");

      // Add search filters - using snake_case as the backend expects
      if (firstName) {
        filtersMap.set("first_name", firstName);
      }
      if (lastName) {
        filtersMap.set("last_name", lastName);
      }
      if (email) {
        filtersMap.set("email", email);
      }
      if (phone) {
        filtersMap.set("phone", phone);
      }

      // Add status and type filters
      if (status) {
        filtersMap.set("status", status);
      }
      if (typeOf && typeOf !== "0") {
        filtersMap.set("type", typeOf);
      }

      // Add cursor for pagination
      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      console.log(
        "Fetching customers with filters:",
        Array.from(filtersMap.entries()),
      );

      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true, // Force refresh to bypass cache
      );

      console.log("Customers data received:", customersData);

      setCustomers(customersData);
      setNextCursor(customersData.hasNextPage ? customersData.nextCursor : "");
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error.message || "An unexpected error occurred.");
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  }, [
    customerManager,
    pageSize,
    firstName,
    lastName,
    email,
    phone,
    status,
    typeOf,
    currentCursor,
    onUnauthorized,
  ]);

  // Fetch customers on mount and when filters/pagination change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const onAddClientClick = () => {
    navigate("/admin/customers/add/step-2");
  };

  const onSelectCustomerForDeletion = (customer) => {
    setSelectedCustomerForDeletion(customer);
  };

  const onDeselectCustomerForDeletion = () => {
    setSelectedCustomerForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedCustomerForDeletion) return;
    try {
      await customerManager.deleteCustomer(
        selectedCustomerForDeletion.id,
        onUnauthorized,
      );
      setSelectedCustomerForDeletion(null);
      // Refresh the list
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError(error.message || "Failed to archive customer.");
    }
  };

  const onNextClicked = () => {
    setPreviousCursors((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    const newPreviousCursors = [...previousCursors];
    const previousCursor = newPreviousCursors.pop();
    setPreviousCursors(newPreviousCursors);
    setCurrentCursor(previousCursor);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentCursor("");
    setPreviousCursors([]);
  };

  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    backgroundColor: "white",
    fontSize: "16px",
    width: "100%",
  };

  const customerCardStyle = {
    border: `1px solid ${theme.colors.lightGrey || "#e0e0e0"}`,
    borderRadius: "8px",
    backgroundColor: theme.colors.infoBg || "#f8f9fa",
    margin: "10px 0",
    overflow: "hidden",
  };

  // Build search description
  const getSearchDescription = () => {
    const parts = [];
    if (firstName) parts.push(`First Name: "${firstName}"`);
    if (lastName) parts.push(`Last Name: "${lastName}"`);
    if (email) parts.push(`Email: "${email}"`);
    if (phone) parts.push(`Phone: "${phone}"`);
    return parts.length > 0 ? parts.join(", ") : "All Customers";
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
          { path: "/admin/customers", label: "Customers", icon: "👥" },
          { label: "New Customer", icon: "➕" },
        ]}
      />

      {selectedCustomerForDeletion && (
        <Modal
          isOpen={!!selectedCustomerForDeletion}
          onClose={onDeselectCustomerForDeletion}
          title="Are you sure?"
        >
          <p>
            You are about to <b>archive</b> this user; it will no longer appear
            on your dashboard. This action can be undone but you'll need to
            contact the system administrator. Are you sure you would like to
            continue?
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button variant="success" onClick={onDeleteConfirmButtonClick}>
              Confirm
            </Button>
            <Button variant="secondary" onClick={onDeselectCustomerForDeletion}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* Progress Indicator */}
      <Card>
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Step 1 of 6
          </p>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "17%",
                height: "100%",
                backgroundColor: theme.colors.success,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#6c757d", marginTop: "5px" }}>
            17% Complete
          </p>
        </div>
      </Card>

      <Card title="📊 Search results:">
        {/* Display search criteria */}
        <div
          style={{
            padding: "10px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <strong>🔍 Searching for:</strong> {getSearchDescription()}
        </div>

        {isFetching && <Loading message="Searching..." />}

        <div style={{ opacity: isFetching ? 0.6 : 1 }}>
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filter Panel */}
          <div
            style={{
              padding: "15px",
              backgroundColor: theme.colors.light || "#f8f9fa",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "15px",
                borderBottom: `1px solid ${theme.colors.lightGrey || "#e0e0e0"}`,
                paddingBottom: "10px",
              }}
            >
              🔽 Additional Filters
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: "600",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Status
                </label>
                <select
                  style={selectStyle}
                  value={status}
                  onChange={(e) =>
                    handleFilterChange(setStatus, e.target.value)
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="1">Active</option>
                  <option value="2">Archived</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontWeight: "600",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Type
                </label>
                <select
                  style={selectStyle}
                  value={typeOf}
                  onChange={(e) =>
                    handleFilterChange(setTypeOf, e.target.value)
                  }
                >
                  <option value="0">All Types</option>
                  <option value={RESIDENTIAL_CUSTOMER_TYPE_OF_ID}>
                    Residential
                  </option>
                  <option value={COMMERCIAL_CUSTOMER_TYPE_OF_ID}>
                    Commercial
                  </option>
                </select>
              </div>
            </div>
          </div>

          {customers && customers.results && customers.results.length > 0 ? (
            <>
              <p style={{ marginBottom: "15px", color: "#6c757d" }}>
                Found{" "}
                <strong>{customers.count || customers.results.length}</strong>{" "}
                customer(s) matching your criteria
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {customers.results.map((customer) => (
                  <div style={customerCardStyle} key={customer.id}>
                    <header
                      style={{
                        padding: "12px 15px",
                        borderBottom: `1px solid ${theme.colors.lightGrey || "#e0e0e0"}`,
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Link
                        to={`/admin/customer/${customer.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                          ? `🏢 ${customer.organizationName || `${customer.firstName} ${customer.lastName}`}`
                          : `🏠 ${customer.firstName} ${customer.lastName}`}
                      </Link>
                    </header>
                    <div style={{ padding: "15px", fontSize: "14px" }}>
                      {customer.addressLine1 && (
                        <>
                          {customer.addressLine1}
                          <br />
                        </>
                      )}
                      {(customer.city || customer.region) && (
                        <>
                          {customer.city && customer.region
                            ? `${customer.city}, ${customer.region}`
                            : customer.city || customer.region}
                          <br />
                        </>
                      )}
                      {customer.phone ? (
                        <>
                          📞{" "}
                          <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                          <br />
                        </>
                      ) : null}
                      {customer.email ? (
                        <>
                          ✉️{" "}
                          <a href={`mailto:${customer.email}`}>
                            {customer.email}
                          </a>
                        </>
                      ) : null}
                    </div>
                    <footer
                      style={{
                        padding: "12px 15px",
                        borderTop: `1px solid ${theme.colors.lightGrey || "#e0e0e0"}`,
                        textAlign: "right",
                      }}
                    >
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(`/admin/customer/${customer.id}`)
                        }
                      >
                        Select →
                      </Button>
                    </footer>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                  paddingTop: "20px",
                  borderTop: "1px solid #eee",
                }}
              >
                <div>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handleFilterChange(setPageSize, parseInt(e.target.value))
                    }
                    style={selectStyle}
                  >
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                    <option value="250">250 per page</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {previousCursors.length > 0 && (
                    <Button onClick={onPreviousClicked}>Previous</Button>
                  )}
                  {customers.hasNextPage && (
                    <Button onClick={onNextClicked}>Next</Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            !isFetching && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <p style={{ fontSize: "24px", fontWeight: "600" }}>
                  📊 No Customers Found
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#6c757d",
                    marginBottom: "20px",
                  }}
                >
                  No customers match your search criteria:
                  <br />
                  <strong>{getSearchDescription()}</strong>
                </p>
                <p style={{ fontSize: "14px", color: "#6c757d" }}>
                  You can try a different search or add a new customer.
                </p>
              </div>
            )
          )}

          {/* OR Divider */}
          <div
            style={{
              textAlign: "center",
              margin: "30px 0",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                right: "0",
                height: "1px",
                backgroundColor: "#ddd",
                zIndex: 0,
              }}
            />
            <span
              style={{
                background: "white",
                padding: "0 20px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#6c757d",
                position: "relative",
                zIndex: 1,
              }}
            >
              OR
            </span>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/customers/add/step-1-search")}
            >
              ← Search Again
            </Button>
            <Button variant="success" onClick={onAddClientClick}>
              ➕ Add New Customer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep1PartBPage;
