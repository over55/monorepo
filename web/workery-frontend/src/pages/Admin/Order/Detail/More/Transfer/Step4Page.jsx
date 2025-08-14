// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
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
} from "../../../../../../components/UI";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;

function AdminOrderDetailMoreTransferStep4Page() {
  const { oid } = useParams();
  const [searchParams] = useSearchParams();
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const actualSearchText = searchParams.get("q") || "";

  // State management
  const [associates, setAssociates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState("last_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Fetch associates
  const fetchAssociates = async () => {
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

      const data = await associateManager.getAssociates(params, () =>
        navigate("/login?unauthorized=true"),
      );

      setAssociates(data);
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors({ fetch: "Failed to load associates. Please try again." });
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

    fetchAssociates();
  }, [page, pageSize, sortBy, sortOrder]);

  // Helper function to get associate display name
  const getAssociateDisplayName = (associate) => {
    if (associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      return (
        associate.organizationName ||
        `${associate.firstName || ""} ${associate.lastName || ""}`.trim()
      );
    }
    return `${associate.firstName || ""} ${associate.lastName || ""}`.trim();
  };

  const handleSelectAssociate = (associateId, associate) => {
    // Construct the proper display name
    const associateName = getAssociateDisplayName(associate);

    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedAssociateID = associateId;
    transferOp.pickedAssociateName = associateName;
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-5`);
  };

  const handleSkip = () => {
    navigate(`/admin/order/${oid}/more/transfer/step-5`);
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
        <Loading message="Loading associates..." />
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
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Step 4 of 5</p>
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
              width: "80%",
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

        {associates && associates.results && associates.results.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {associates.results.map((associate) => {
                const displayName = getAssociateDisplayName(associate);

                return (
                  <Card
                    key={associate.id}
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
                      {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                        ? "🏢"
                        : "🏠"}{" "}
                      <strong>{displayName}</strong>
                    </h4>
                    <p style={{ fontSize: "14px", margin: "5px 0" }}>
                      {associate.addressLine1}
                      <br />
                      {associate.city}, {associate.region}
                    </p>
                    {associate.phone && (
                      <p style={{ fontSize: "14px", margin: "5px 0" }}>
                        📞 {associate.phone}
                      </p>
                    )}
                    {associate.email && (
                      <p style={{ fontSize: "14px", margin: "5px 0" }}>
                        ✉️ {associate.email}
                      </p>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        handleSelectAssociate(associate.id, associate)
                      }
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
                {associates.hasNextPage && (
                  <Button onClick={() => setPage(page + 1)} variant="outline">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <Alert type="info">
            No associates found.
            <Link
              to={`/admin/order/${oid}/more/transfer/step-3`}
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
          <Link to={`/admin/order/${oid}/more/transfer/step-3`}>
            <Button variant="outline">← Back to Step 3</Button>
          </Link>

          <Button variant="warning" onClick={handleSkip}>
            Skip →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep4Page;
