// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
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
import {
  SkillSetsMultiSelect,
  TagsMultiSelect,
} from "../../../../components/Form";

function AdminOrderAddStep3Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
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

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
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

    if (!skillSets || skillSets.length === 0) {
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

  const handleSkillSetsChange = (value) => {
    setSkillSets(value);
    // Clear error when user selects skill sets
    if (errors.skillSets && value.length > 0) {
      setErrors((prev) => ({ ...prev, skillSets: undefined }));
    }
  };

  const handleTagsChange = (value) => {
    setTags(value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    // Clear error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
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
            label="Describe the Job"
            name="description"
            placeholder="Describe the work that needs to be done..."
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
            required
            rows={4}
            maxLength={1000}
            helperText="Please provide a clear description of the work required"
          />

          {/* Skill Sets Multi-Select */}
          <SkillSetsMultiSelect
            value={skillSets}
            onChange={handleSkillSetsChange}
            error={errors.skillSets}
            required={true}
            label="Required Job Skills"
            placeholder="Select required skill sets..."
            helperText="Pick at least one skill set that is required for this job"
            onUnauthorized={onUnauthorized}
          />

          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <h4>📊 Metrics</h4>
          </div>

          {/* Tags Multi-Select */}
          <TagsMultiSelect
            value={tags}
            onChange={handleTagsChange}
            error={errors.tags}
            required={false}
            label="Tags (Optional)"
            placeholder="Select tags..."
            helperText="Pick any tags you would like to associate with this order"
            onUnauthorized={onUnauthorized}
          />

          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <h4>💬 Comments</h4>
          </div>

          <TextArea
            label="Additional Comments (Optional)"
            name="additionalComment"
            placeholder="Any additional comments or special instructions..."
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            error={errors.additionalComment}
            rows={4}
            maxLength={1000}
            helperText="Add any additional information that might be helpful"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid #ddd",
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
