// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";

function AdminCustomerAddStep1PartAPage() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // Component state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Clear form data on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  // Event handling
  const onAddClientClick = (e) => {
    console.log("Navigate to add client step 2");
    navigate("/admin/customers/add/step-2");
  };

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "please enter a value",
      });
      return;
    }

    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams();
    if (firstName) searchParams.append("fn", firstName);
    if (lastName) searchParams.append("ln", lastName);
    if (email) searchParams.append("e", email);
    if (phone) searchParams.append("p", phone);

    navigate(`/admin/customers/add/step-1-results?${searchParams.toString()}`);
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
          <p className="subtitle is-5">Step 1 of 6</p>
          <progress className="progress is-success" value="17" max="100">
            17%
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
                    to="/admin/customers"
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

          <p className="title is-4">🔍 Search for existing customer:</p>

          {isFetching ? (
            <div>Loading...</div>
          ) : (
            <>
              {errors.message && (
                <div className="notification is-danger">{errors.message}</div>
              )}

              <div className="container">
                <div className="field">
                  <label className="label">First Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="help is-danger">{errors.firstName}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Last Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="help is-danger">{errors.lastName}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="Text input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.email && (
                    <p className="help is-danger">{errors.email}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Phone</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ maxWidth: "150px" }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="help is-danger">{errors.phone}</p>
                  )}
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
                  <div className="column is-half has-text-right">
                    <button
                      className="button is-medium is-primary is-fullwidth-mobile"
                      onClick={onSubmitClick}
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>

                <p className="title is-4 has-text-centered">- OR -</p>

                <div className="columns pt-5">
                  <div className="column has-text-centered">
                    <button
                      className="button is-medium is-success is-fullwidth-mobile"
                      onClick={onAddClientClick}
                    >
                      ➕ Add client
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

export default AdminCustomerAddStep1PartAPage;
