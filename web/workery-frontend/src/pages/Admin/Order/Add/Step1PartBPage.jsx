// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartBPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Select,
  FormGroup,
} from "../../../../components/UI";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

function AdminOrderAddStep1PartBPage() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get search parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customers, setCustomers] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Filter states
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const fetchList = useCallback(async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build filters map for the search (matching customer add pattern)
      const filtersMap = new Map();
      filtersMap.set("page_size", pageSize);

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
      if (typeOf && typeOf !== 0) {
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

      // IMPORTANT: Force refresh to bypass cache and get fresh results
      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true, // Force refresh to bypass cache
      );

      console.log("Customers data received:", customersData);

      setCustomers(customersData);
      setNextCursor(customersData.hasNextPage ? customersData.nextCursor : "");
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors(error);
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

  const onSelectCustomer = (customer) => {
    console.log(
      "Selected customer:",
      customer.id,
      customer.firstName,
      customer.lastName,
    );

    // Initialize order state with selected customer
    const orderState = {
      customerId: customer.id,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      startDate: null,
      isOngoing: null,
      isHomeSupportService: null,
      description: "",
      skillSets: [],
      additionalComment: "",
      tags: [],
    };

    orderCreationStorage.saveOrderCreation(orderState);
    navigate("/admin/orders/add/step-2");
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentCursor("");
    setPreviousCursors([]);
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchList();
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, status, typeOf]);

  // Build search description
  const getSearchDescription = () => {
    const parts = [];
    if (firstName) parts.push(`First Name: "${firstName}"`);
    if (lastName) parts.push(`Last Name: "${lastName}"`);
    if (email) parts.push(`Email: "${email}"`);
    if (phone) parts.push(`Phone: "${phone}"`);
    return parts.length > 0 ? parts.join(", ") : "All Customers";
  };

  if (isFetching) {
    return <Loading message="Searching customers..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Orders", path: "/admin/orders", icon: "🔧" },
          { label: "New", icon: "➕" },
        ]}
      />

      <h1>Orders</h1>
      <h4>New Order</h4>
      <hr />

      {/* Progress Wizard */}
      <Card title="Step 1 of 4">
        <progress value="25" max="100" style={{ width: "100%" }}>
          25%
        </progress>
      </Card>

      <br />

      {/* Results */}
      <Card title="Search results:">
        {errors.message && <Alert type="error">{errors.message}</Alert>}

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

        {/* Filters */}
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h5>Filtering & Sorting</h5>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <Select
              label="Status"
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />

            <Select
              label="Type"
              value={typeOf}
              onChange={(e) =>
                handleFilterChange(setTypeOf, parseInt(e.target.value))
              }
              options={[
                { value: 0, label: "All" },
                {
                  value: RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
                  label: "Residential",
                },
                { value: COMMERCIAL_CUSTOMER_TYPE_OF_ID, label: "Commercial" },
              ]}
            />

            <Select
              label="Show"
              value={pageSize}
              onChange={(e) =>
                handleFilterChange(setPageSize, parseInt(e.target.value))
              }
              options={[
                { value: 10, label: "10 per page" },
                { value: 25, label: "25 per page" },
                { value: 50, label: "50 per page" },
                { value: 100, label: "100 per page" },
              ]}
            />
          </div>
        </div>

        {/* Customer List */}
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
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {customers.results.map((customer) => (
                <Card key={customer.id} style={{ backgroundColor: "#e8f4fd" }}>
                  <h4>
                    {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                      <>
                        🏢{" "}
                        {customer.organizationName ||
                          `${customer.firstName} ${customer.lastName}`}
                      </>
                    ) : (
                      <>
                        🏠 {customer.firstName} {customer.lastName}
                      </>
                    )}
                  </h4>

                  {customer.addressLine1 && <p>{customer.addressLine1}</p>}
                  {(customer.city || customer.region) && (
                    <p>
                      {customer.city && customer.region
                        ? `${customer.city}, ${customer.region}`
                        : customer.city || customer.region}
                    </p>
                  )}
                  {customer.phone && <p>📞 {customer.phone}</p>}
                  {customer.email && <p>✉️ {customer.email}</p>}

                  <Button
                    onClick={() => onSelectCustomer(customer)}
                    variant="primary"
                    fullWidth
                  >
                    Select →
                  </Button>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #eee",
              }}
            >
              <div>
                Showing {customers.results.length} of{" "}
                {customers.count || customers.results.length} results
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {previousCursors.length > 0 && (
                  <Button onClick={onPreviousClicked} variant="secondary">
                    ← Previous
                  </Button>
                )}
                {customers.hasNextPage && (
                  <Button onClick={onNextClicked} variant="secondary">
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          !isFetching && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <h3>📊 No Customers Found</h3>
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

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <p>- OR -</p>
          <p>Do you wish to continue adding a NEW customer?</p>
        </div>

        <div
          style={{
            textAlign: "center",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <Link to="/admin/orders/add/step-1-search">
            <Button variant="secondary">← Search Again</Button>
          </Link>
          <a
            href="/admin/customers/add/step-2"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="success">Create New Customer</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderAddStep1PartBPage;
