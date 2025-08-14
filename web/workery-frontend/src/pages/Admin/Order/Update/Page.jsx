// File Path: monorepo/web/workery-frontend/src/pages/Admin/Order/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useOrderManager,
  useSkillSetManager,
  useTagManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  TextArea,
  FormGroup,
} from "../../../../components/UI";

function AdminOrderUpdatePage() {
  // Hooks
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const skillSetManager = useSkillSetManager();
  const tagManager = useTagManager();
  const navigate = useNavigate();
  const { oid } = useParams();

  // State
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [order, setOrder] = useState(null);

  // Form fields
  const [startDate, setStartDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(0);
  const [isHomeSupportService, setIsHomeSupportService] = useState(0);
  const [description, setDescription] = useState("");
  const [skillSets, setSkillSets] = useState([]);
  const [tags, setTags] = useState([]);

  // Options for multi-selects
  const [skillSetOptions, setSkillSetOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrder = async () => {
    setFetching(true);
    setErrors({});

    try {
      const response = await orderManager.getOrderDetail(oid, onUnauthorized);

      console.log("Order details fetched:", response);
      setOrder(response);

      // Populate form fields with existing data
      setStartDate(response.startDate || "");
      setIsOngoing(response.isOngoing ? 1 : 2);
      setIsHomeSupportService(response.isHomeSupportService ? 1 : 2);
      setDescription(response.description || "");

      // Extract skill set IDs
      if (response.skillSets && Array.isArray(response.skillSets)) {
        const skillSetIds = response.skillSets.map((item) =>
          typeof item === "object" ? item.id : item,
        );
        setSkillSets(skillSetIds);
      }

      // Extract tag IDs
      if (response.tags && Array.isArray(response.tags)) {
        const tagIds = response.tags.map((item) =>
          typeof item === "object" ? item.id : item,
        );
        setTags(tagIds);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Fetch options for skill sets and tags
  const fetchOptions = async () => {
    try {
      // Fetch skill sets
      const skillSetsData =
        await skillSetManager.getSkillSetSelectOptions(onUnauthorized);
      if (skillSetsData) {
        setSkillSetOptions(skillSetsData);
      }

      // Fetch tags
      const tagsData = await tagManager.getTagSelectOptions(onUnauthorized);
      if (tagsData) {
        setTagOptions(tagsData);
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  };

  // Handle form submission
  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Validate
    let newErrors = {};
    let hasErrors = false;

    if (!description || description.trim() === "") {
      newErrors["description"] = "Description is required";
      hasErrors = true;
    }

    if (skillSets.length === 0) {
      newErrors["skillSets"] = "Please select at least one skill set";
      hasErrors = true;
    }

    if (isOngoing === 0) {
      newErrors["isOngoing"] =
        "Please select if this job is one-time or ongoing";
      hasErrors = true;
    }

    if (isHomeSupportService === 0) {
      newErrors["isHomeSupportService"] =
        "Please select if this is a home support service";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Validation errors found");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare payload
      const payload = {
        id: oid,
        isOngoing: isOngoing === 1,
        isHomeSupportService: isHomeSupportService === 1,
        startDate: startDate || null,
        description: description,
        skillSets: skillSets,
        tags: tags,
      };

      console.log("onSubmitClick: payload:", payload);

      // Update the order
      const response = await orderManager.updateOrder(
        oid,
        payload,
        onUnauthorized,
      );

      console.log("Order updated successfully:", response);

      // Show success message
      setSuccessMessage("Order updated successfully!");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/order/${oid}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update order:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skill set checkbox changes
  const handleSkillSetChange = (skillSetId) => {
    if (skillSets.includes(skillSetId)) {
      setSkillSets(skillSets.filter((id) => id !== skillSetId));
    } else {
      setSkillSets([...skillSets, skillSetId]);
    }
  };

  // Handle tag checkbox changes
  const handleTagChange = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter((id) => id !== tagId));
    } else {
      setTags([...tags, tagId]);
    }
  };

  // Initialize component
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrder();
      fetchOptions();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Render loading state
  if (isFetching) {
    return <Loading message="Loading order details..." />;
  }

  // Render form
  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Orders", path: "/admin/orders", icon: "🔧" },
          { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "ℹ️" },
          { label: "Update", icon: "✏️" },
        ]}
      />

      {/* Archived banner */}
      {order && order.status === 2 && (
        <Alert type="info">This order is archived</Alert>
      )}

      <h1>🔧 Order</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      <Card title="✏️ Update">
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        {errors.message && <Alert type="error">{errors.message}</Alert>}
        {errors.detail && <Alert type="error">{errors.detail}</Alert>}

        {order && (
          <form onSubmit={onSubmitClick}>
            <hr />

            <h4>🏢 General</h4>

            <FormGroup>
              <label>Is this job one time or ongoing? *</label>
              {errors.isOngoing && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.isOngoing}
                </div>
              )}
              <div>
                <label>
                  <input
                    type="radio"
                    name="isOngoing"
                    value="2"
                    checked={isOngoing === 2}
                    onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                    disabled={order.status === 2 || isSubmitting}
                  />{" "}
                  One-Time
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="isOngoing"
                    value="1"
                    checked={isOngoing === 1}
                    onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                    disabled={order.status === 2 || isSubmitting}
                  />{" "}
                  Ongoing
                </label>
              </div>
            </FormGroup>

            <FormGroup>
              <label>Is this job a home support service? *</label>
              {errors.isHomeSupportService && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.isHomeSupportService}
                </div>
              )}
              <div>
                <label>
                  <input
                    type="radio"
                    name="isHomeSupportService"
                    value="2"
                    checked={isHomeSupportService === 2}
                    onChange={(e) =>
                      setIsHomeSupportService(parseInt(e.target.value))
                    }
                    disabled={order.status === 2 || isSubmitting}
                  />{" "}
                  No
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="isHomeSupportService"
                    value="1"
                    checked={isHomeSupportService === 1}
                    onChange={(e) =>
                      setIsHomeSupportService(parseInt(e.target.value))
                    }
                    disabled={order.status === 2 || isSubmitting}
                  />{" "}
                  Yes
                </label>
              </div>
            </FormGroup>

            <FormGroup>
              <label>When should this job start? (Optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={order.status === 2 || isSubmitting}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "200px",
                }}
              />
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                Leave blank if nothing was specified by client.
              </div>
              {errors.startDate && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.startDate}
                </div>
              )}
            </FormGroup>

            <hr />
            <h4>🎓 Skill Sets</h4>

            <TextArea
              label="Describe the Job:"
              name="description"
              placeholder="Describe the work that needs to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              required
              rows={4}
              maxLength={1000}
              disabled={order.status === 2 || isSubmitting}
            />

            <FormGroup>
              <label>Please select required job skill(s): *</label>
              {errors.skillSets && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.skillSets}
                </div>
              )}
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "10px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {skillSetOptions.length > 0 ? (
                  skillSetOptions.map((option) => (
                    <div key={option.value}>
                      <label>
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={skillSets.includes(option.value)}
                          onChange={() => handleSkillSetChange(option.value)}
                          disabled={order.status === 2 || isSubmitting}
                        />{" "}
                        {option.label}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>Loading skill sets...</p>
                )}
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                Pick at least a single skill set at minimum.
              </div>
            </FormGroup>

            <hr />
            <h4>📊 Metrics</h4>

            <FormGroup>
              <label>Tags (Optional)</label>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "10px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {tagOptions.length > 0 ? (
                  tagOptions.map((option) => (
                    <div key={option.value}>
                      <label>
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={tags.includes(option.value)}
                          onChange={() => handleTagChange(option.value)}
                          disabled={order.status === 2 || isSubmitting}
                        />{" "}
                        {option.label}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>Loading tags...</p>
                )}
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
              >
                Pick the tags you would like to associate with this order.
              </div>
            </FormGroup>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
              }}
            >
              <Link to={`/admin/order/${oid}`}>
                <Button type="button" variant="secondary">
                  ← Back to Detail
                </Button>
              </Link>
              <Button
                type="submit"
                variant="success"
                disabled={order.status === 2 || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "✓ Save & Submit"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderUpdatePage;
