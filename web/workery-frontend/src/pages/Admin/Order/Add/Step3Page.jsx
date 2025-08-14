// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
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

function AdminOrderAddStep3Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const skillSetManager = useSkillSetManager();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const existingOrder = orderCreationStorage.getOrderCreation();

  // Form fields
  const [description, setDescription] = useState(
    existingOrder?.description || "",
  );
  const [skillSets, setSkillSets] = useState(existingOrder?.skillSets || []);
  const [additionalComment, setAdditionalComment] = useState(
    existingOrder?.additionalComment || "",
  );
  const [tags, setTags] = useState(existingOrder?.tags || []);

  // Options
  const [skillSetOptions, setSkillSetOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

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

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    console.log("onSubmitClick: Success");

    // Update order state
    const updatedOrder = {
      ...existingOrder,
      description: description,
      skillSets: skillSets,
      additionalComment: additionalComment,
      tags: tags,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-4");
  };

  const handleSkillSetChange = (skillSetId) => {
    if (skillSets.includes(skillSetId)) {
      setSkillSets(skillSets.filter((id) => id !== skillSetId));
    } else {
      setSkillSets([...skillSets, skillSetId]);
    }
  };

  const handleTagChange = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter((id) => id !== tagId));
    } else {
      setTags([...tags, tagId]);
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

      // Check if we have order state
      if (!existingOrder || !existingOrder.customerId) {
        // No customer selected, redirect to step 1
        navigate("/admin/orders/add/step-1-search");
        return;
      }

      fetchOptions();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading message="Loading..." />;
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
      <Card title="Step 3 of 4">
        <progress value="75" max="100" style={{ width: "100%" }}>
          75%
        </progress>
      </Card>

      <br />

      {/* Cancel Warning Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setShowCancelWarning(false)}
              variant="secondary"
            >
              No
            </Button>
            <Button
              onClick={() => {
                orderCreationStorage.clearOrderCreation();
                navigate("/admin/orders");
              }}
              variant="success"
            >
              Yes
            </Button>
          </>
        }
      >
        <p>
          Your Order record will be cancelled and your work will be lost. This
          cannot be undone. Do you want to continue?
        </p>
      </Modal>

      {/* Skills and Description Form */}
      <Card title="🎓 Skills and Description">
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Please fill out all the required fields before submitting this form.
        </p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <form onSubmit={onSubmitClick}>
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
                      />{" "}
                      {option.label}
                    </label>
                  </div>
                ))
              ) : (
                <p>Loading skill sets...</p>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              Pick at least a single skill set at minimum.
            </div>
          </FormGroup>

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
                      />{" "}
                      {option.label}
                    </label>
                  </div>
                ))
              ) : (
                <p>Loading tags...</p>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              Pick the tags you would like to associate with this order.
            </div>
          </FormGroup>

          <h4>💬 Comments</h4>

          <TextArea
            label="Additional comment(s): (Optional)"
            name="additionalComment"
            placeholder="Additional comments go here..."
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            error={errors.additionalComment}
            rows={4}
            maxLength={1000}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Link to="/admin/orders/add/step-2">
              <Button type="button" variant="secondary">
                ← Back
              </Button>
            </Link>
            <Button type="submit" variant="primary">
              Next →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminOrderAddStep3Page;
