// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
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
  const [sortByValue, setSortByValue] = useState("lexical_name,ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchList = async () => {
    setFetching(true);
    setErrors({});

    try {
      const params = {
        page: currentCursor ? currentCursor : 1,
        limit: pageSize,
        sortBy: sortByValue.split(",")[0],
        sortOrder: sortByValue.split(",")[1],
      };

      // Add search parameters
      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (email) params.email = email;
      if (phone) params.phone = phone;
      if (status) params.status = status;
      if (typeOf) params.type = typeOf;

      const response = await customerManager.getCustomers(
        params,
        onUnauthorized,
      );

      setCustomers(response);

      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const onNextClicked = () => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onAddOrderClick = (id, firstName, lastName) => {
    console.log("Selected customer:", id, firstName, lastName);

    // Initialize order state with selected customer
    const orderState = {
      customerId: id,
      customerFirstName: firstName,
      customerLastName: lastName,
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
  }, [currentCursor, pageSize, sortByValue, status, typeOf]);

  if (isFetching) {
    return <Loading message="Loading customers..." />;
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
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />

            <Select
              label="Type"
              value={typeOf}
              onChange={(e) => setTypeOf(parseInt(e.target.value))}
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
              label="Sort by"
              value={sortByValue}
              onChange={(e) => setSortByValue(e.target.value)}
              options={[
                { value: "last_name,ASC", label: "Last Name (A-Z)" },
                { value: "last_name,DESC", label: "Last Name (Z-A)" },
                { value: "created_at,DESC", label: "Newest First" },
                { value: "created_at,ASC", label: "Oldest First" },
              ]}
            />
          </div>
        </div>

        {/* Customer List */}
        {customers && customers.results && customers.results.length > 0 ? (
          <>
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
                      <>🏢 {customer.organizationName}</>
                    ) : (
                      <>
                        🏠 {customer.firstName} {customer.lastName}
                      </>
                    )}
                  </h4>

                  <p>{customer.addressLine1}</p>
                  <p>
                    {customer.city}, {customer.region}
                  </p>
                  <p>📞 {customer.phone || "-"}</p>
                  <p>✉️ {customer.email || "-"}</p>

                  <Button
                    onClick={() =>
                      onAddOrderClick(
                        customer.id,
                        customer.firstName,
                        customer.lastName,
                      )
                    }
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

              <div>
                {previousCursors.length > 0 && (
                  <Button onClick={onPreviousClicked} variant="secondary">
                    Previous
                  </Button>
                )}
                {customers.hasNextPage && (
                  <Button
                    onClick={onNextClicked}
                    variant="secondary"
                    style={{ marginLeft: "10px" }}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>No Customers Found</h3>
            <p>No customers match your search criteria.</p>
            <Link to="/admin/orders/add/step-1-search">
              <Button variant="primary">Search Again →</Button>
            </Link>
          </div>
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
