// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// Customer type constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerAddStep2Page() {
  const navigate = useNavigate();

  // Component state
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [customerData, setCustomerData] = useState(() => {
    // Get any existing data from sessionStorage
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : { country: "Canada" };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSelectType = (typeOfId) => {
    // Update customer data with selected type
    const updatedCustomerData = {
      ...customerData,
      type: typeOfId,
      country: "Canada", // Default country
    };

    // Save to sessionStorage
    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    // Navigate to next step
    navigate("/admin/customers/add/step-3");
  };

  return (
    <div className="container">
      <section className="section">
        {/* Desktop Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-touch p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/dashboard" aria-current="page">
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/customers" aria-current="page">
                👥 Customers
              </Link>
            </li>
            <li className="is-active">
              <Link aria-current="page">➕ New</Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-desktop p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/customers" aria-current="page">
                ← Back to Customers
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page Title */}
        <h1 className="title is-2">👥 Customers</h1>
        <h4 className="subtitle is-4">➕ New Customer</h4>
        <hr />

        {/* Progress Wizard */}
        <nav className="box has-background-light">
          <p className="subtitle is-5">Step 2 of 6</p>
          <progress className="progress is-success" value="33" max="100">
            33%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          {/* Cancel Warning Modal */}
          {showCancelWarning && (
            <div className="modal is-active">
              <div className="modal-background"></div>
              <div className="modal-card">
                <header className="modal-card-head">
                  <p className="modal-card-title">Are you sure?</p>
                  <button
                    className="delete"
                    aria-label="close"
                    onClick={() => setShowCancelWarning(false)}
                  ></button>
                </header>
                <section className="modal-card-body">
                  Your Customer record will be cancelled and your work will be
                  lost. This cannot be undone. Do you want to continue?
                </section>
                <footer className="modal-card-foot">
                  <Link
                    className="button is-medium is-success"
                    to="/admin/customers/add/step-1-search"
                  >
                    Yes
                  </Link>
                  <button
                    className="button is-medium"
                    onClick={() => setShowCancelWarning(false)}
                  >
                    No
                  </button>
                </footer>
              </div>
            </div>
          )}

          <p className="title is-4">⚙️ Select Customer Type:</p>

          <p className="has-text-grey pb-4">
            Please select the type of customer this is.
          </p>

          <div className="container">
            <div className="columns">
              {/* Residential */}
              <div className="column">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <span style={{ color: "white", fontSize: "9rem" }}>
                        🏠
                      </span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">🏠 Residential User</p>
                      </div>
                    </div>

                    <div className="content">
                      Add a Residential Customer.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <button
                      onClick={() =>
                        onSelectType(RESIDENTIAL_CUSTOMER_TYPE_OF_ID)
                      }
                      type="button"
                      className="card-footer-item button is-primary is-large"
                    >
                      Pick →
                    </button>
                  </footer>
                </div>
              </div>

              {/* Business */}
              <div className="column">
                <div className="card">
                  <div className="card-image has-background-info">
                    <div
                      className="has-text-centered"
                      style={{ padding: "60px" }}
                    >
                      <span style={{ color: "white", fontSize: "9rem" }}>
                        🏢
                      </span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">🏢 Business User</p>
                      </div>
                    </div>

                    <div className="content">
                      Add a Commercial Customer.
                      <br />
                    </div>
                  </div>
                  <footer className="card-footer">
                    <button
                      onClick={() =>
                        onSelectType(COMMERCIAL_CUSTOMER_TYPE_OF_ID)
                      }
                      type="button"
                      className="card-footer-item button is-primary is-large"
                    >
                      Pick →
                    </button>
                  </footer>
                </div>
              </div>
            </div>

            <div className="columns pt-5">
              <div className="column is-half">
                <button
                  className="button is-medium is-fullwidth-mobile"
                  onClick={() => setShowCancelWarning(true)}
                >
                  ❌ Cancel
                </button>
              </div>
              <div className="column is-half has-text-right"></div>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
}

export default AdminCustomerAddStep2Page;
