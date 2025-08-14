// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Table,
  Select,
} from "../../../../../../../components/UI";
import { ORDER_INCIDENT_SORT_OPTIONS } from "../../../../../../../constants/FieldOptions";

function AdminOrderDetailMoreIncidentListPage() {
  const { oid } = useParams();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [listData, setListData] = useState(null);
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch incidents list
  const fetchIncidentsList = async () => {
    setFetching(true);
    setErrors({});

    try {
      const params = {
        orderWjid: oid,
        sortBy: sortBy,
        page: currentPage,
        limit: pageSize,
      };

      const data = await orderIncidentManager.getOrderIncidents(
        params,
        onUnauthorized,
      );
      setListData(data);

      console.log(
        "AdminOrderDetailMoreIncidentListPage: Incidents loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentListPage: Failed to fetch incidents:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchIncidentsList();
    }

    return () => {
      mounted = false;
    };
  }, [oid, sortBy, currentPage, pageSize]);

  if (isFetching) {
    return <Loading message="Loading incidents..." />;
  }

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    {
      path: `/admin/order/${oid}/more`,
      label: `Order #${oid} (More)`,
      icon: "ℹ️",
    },
    { label: "Incidents", icon: "🔥" },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, row) => (
        <Link to={`/admin/order/${oid}/more/incident/${row.id}`}>{value}</Link>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) =>
        row.closingReason ? (
          <span style={{ color: "green" }}>Closed</span>
        ) : (
          <span style={{ color: "orange" }}>Open</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (value, row) => (
        <Link to={`/admin/order/${oid}/more/incident/${row.id}`}>
          <Button size="sm">View →</Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>🔥 Incidents</h1>
      <hr />

      {/* Page Menu Options */}
      <div style={{ marginBottom: "30px" }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link to={`/admin/order/${oid}/more/incidents/create`}>
              <Button variant="danger">➕ Add Incident</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Page Content */}
      <Card
        title="📋 List"
        actions={
          <Link to={`/admin/order/${oid}/more/incidents/create`}>
            <Button variant="primary">➕ New</Button>
          </Link>
        }
      >
        {/* Error Display */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            <div>
              <strong>There were errors:</strong>
              <ul style={{ margin: "10px 0 0 20px" }}>
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {/* Filter Panel */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: "200px" }}>
              <Select
                label="Sort by"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={ORDER_INCIDENT_SORT_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {listData && listData.results && listData.results.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={listData.results}
              onRowClick={(row) =>
                navigate(`/admin/order/${oid}/more/incident/${row.id}`)
              }
            />

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <div>Total Results: {listData.count || 0}</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {currentPage > 1 && (
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    variant="info"
                  >
                    Previous
                  </Button>
                )}
                {listData.hasNextPage && (
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    variant="info"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <Alert type="info">
            <p>
              <strong>📋 No Incidents</strong>
            </p>
            <p>
              No incidents found.{" "}
              <Link to={`/admin/order/${oid}/more/incidents/create`}>
                <strong>Click here →</strong>
              </Link>{" "}
              to get started creating your first incident.
            </p>
          </Alert>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link to={`/admin/order/${oid}/more`}>
            <Button variant="secondary">← Back to More</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreIncidentListPage;
