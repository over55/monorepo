// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Select,
  Table,
} from "../../../../../../components/UI";

// Constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 2;

function AdminOrderDetailMoreTransferStep2Page() {
  const { oid } = useParams();
  const [searchParams] = useSearchParams();
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const actualSearchText = searchParams.get("q") || "";

  // State management
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState("last_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // Add search parameters
      if (actualSearchText) params.search = actualSearchText;
      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (email) params.email = email;
      if (phone) params.phone = phone;

      const data = await customerManager.getCustomers(params, () =>
        navigate("/login?unauthorized=true"),
      );

      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors({ fetch: "Failed to load customers. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchCustomers();
  }, [page, pageSize, sortBy, sortOrder]);

  // Helper function to get customer display name
  const getCustomerDisplayName = (customer) => {
    if (customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      return (
        customer.organizationName ||
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      );
    }
    return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  };

  const handleSelectClient = (clientId, customer) => {
    // Construct the proper display name
    const clientName = getCustomerDisplayName(customer);

    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedClientID = clientId;
    transferOp.pickedClientName = clientName;
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  const handleSkip = () => {
    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "More", path: `/admin/order/${oid}/more`, icon: "⋯" },
    { label: "Transfer", icon: "🔄" },
  ];

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading customers..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ margin: 0 }}>🔧 Order</h1>
      <h4 style={{ margin: "5px 0 20px 0", color: theme.colors.secondary }}>
        ℹ️ Detail
      </h4>
      <hr />

      {/* Progress Bar */}
      <Card
        style={{ marginBottom: "20px", backgroundColor: theme.colors.light }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Step 2 of 5</p>
        <div
          style={{
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
            height: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.success,
              width: "40%",
              height: "100%",
              borderRadius: "10px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      <Card>
        <h3 style={{ marginBottom: "20px" }}>📋 Search Results</h3>

        {errors.fetch && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.fetch}
          </Alert>
        )}

        {customers && customers.results && customers.results.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {customers.results.map((customer) => {
                const displayName = getCustomerDisplayName(customer);

                return (
                  <Card
                    key={customer.id}
                    style={{
                      backgroundColor: theme.colors.infoBg,
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <h4 style={{ marginBottom: "10px" }}>
                      {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                        ? "🏢"
                        : "🏠"}{" "}
                      <strong>{displayName}</strong>
                    </h4>
                    <p style={{ fontSize: "14px", margin: "5px 0" }}>
                      {customer.addressLine1}
                      <br />
                      {customer.city}, {customer.region}
                    </p>
                    {customer.phone && (
                      <p style={{ fontSize: "14px", margin: "5px 0" }}>
                        📞 {customer.phone}
                      </p>
                    )}
                    {customer.email && (
                      <p style={{ fontSize: "14px", margin: "5px 0" }}>
                        ✉️ {customer.email}
                      </p>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleSelectClient(customer.id, customer)}
                      style={{ marginTop: "10px" }}
                    >
                      Select →
                    </Button>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                options={[
                  { value: 10, label: "10 per page" },
                  { value: 25, label: "25 per page" },
                  { value: 50, label: "50 per page" },
                  { value: 100, label: "100 per page" },
                ]}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                {page > 1 && (
                  <Button onClick={() => setPage(page - 1)} variant="outline">
                    Previous
                  </Button>
                )}
                {customers.hasNextPage && (
                  <Button onClick={() => setPage(page + 1)} variant="outline">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <Alert type="info">
            No customers found.
            <Link
              to={`/admin/order/${oid}/more/transfer/step-1`}
              style={{ marginLeft: "5px" }}
            >
              Click here to search again →
            </Link>
          </Alert>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Link to={`/admin/order/${oid}/more/transfer/step-1`}>
            <Button variant="outline">← Back to Step 1</Button>
          </Link>

          <Button variant="warning" onClick={handleSkip}>
            Skip →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep2Page;
