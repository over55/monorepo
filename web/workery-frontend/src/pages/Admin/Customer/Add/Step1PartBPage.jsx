// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";

// Customer type constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerAddStep1PartBPage() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const [searchParams] = useSearchParams();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component state
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState(null);
  const [selectedCustomerForDeletion, setSelectedCustomerForDeletion] =
    useState(null);
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build filters map for the search
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", "lastName");
      filtersMap.set("sortOrder", "ASC");

      if (firstName) filtersMap.set("firstName", firstName);
      if (lastName) filtersMap.set("lastName", lastName);
      if (email) filtersMap.set("email", email);
      if (phone) filtersMap.set("phone", phone);
      if (status) filtersMap.set("status", status);
      if (typeOf) filtersMap.set("type", typeOf);

      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
      );

      setCustomers(customersData);
      if (customersData.hasNextPage) {
        setNextCursor(customersData.nextCursor);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onAddClientClick = () => {
    navigate("/admin/customers/add/step-2");
  };

  const onSelectCustomerForDeletion = (customer) => {
    setSelectedCustomerForDeletion(customer);
  };

  const onDeselectCustomerForDeletion = () => {
    setSelectedCustomerForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    try {
      await customerManager.deleteCustomer(
        selectedCustomerForDeletion.id,
        onUnauthorized,
      );
      setSelectedCustomerForDeletion(null);
      // Refresh the list
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      setErrors(error);
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

        {/* Delete Customer Modal */}
        {selectedCustomerForDeletion && (
          <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectCustomerForDeletion}
                ></button>
              </header>
              <section className="modal-card-body">
                You are about to <b>archive</b> this user; it will no longer
                appear on your dashboard. This action can be undone but you'll
                need to contact the system administrator. Are you sure you would
                like to continue?
              </section>
              <footer className="modal-card-foot">
                <button
                  className="button is-success"
                  onClick={onDeleteConfirmButtonClick}
                >
                  Confirm
                </button>
                <button
                  className="button"
                  onClick={onDeselectCustomerForDeletion}
                >
                  Cancel
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* Progress Wizard */}
        <nav className="box has-background-light">
          <p className="subtitle is-5">Step 1 of 6</p>
          <progress className="progress is-success" value="17" max="100">
            17%
          </progress>
        </nav>

        {/* Page Table */}
        <nav className="box" style={{ borderRadius: "20px" }}>
          <p className="title is-4 pb-2">📊 Search results:</p>

          {/* Filter Panel */}
          <div
            className="columns has-background-light is-multiline p-2"
            style={{ borderRadius: "20px" }}
          >
            <div className="column is-12">
              <h1 className="subtitle is-5 is-underlined">
                🔽 Filtering & Sorting
              </h1>
            </div>

            <div className="column">
              <div className="field">
                <label className="label">Status</label>
                <div className="control">
                  <div className="select">
                    <select
                      value={status}
                      onChange={(e) => setStatus(parseInt(e.target.value))}
                    >
                      <option value="">Pick status</option>
                      <option value="1">Active</option>
                      <option value="2">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="field">
                <label className="label">Type</label>
                <div className="control">
                  <div className="select">
                    <select
                      value={typeOf}
                      onChange={(e) => setTypeOf(parseInt(e.target.value))}
                    >
                      <option value="0">Pick client type</option>
                      <option value={RESIDENTIAL_CUSTOMER_TYPE_OF_ID}>
                        Residential
                      </option>
                      <option value={COMMERCIAL_CUSTOMER_TYPE_OF_ID}>
                        Commercial
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Contents */}
          {isFetching ? (
            <div>Loading...</div>
          ) : (
            <>
              {errors.message && (
                <div className="notification is-danger">{errors.message}</div>
              )}

              <div className="container mb-6">
                {customers &&
                customers.results &&
                (customers.results.length > 0 || previousCursors.length > 0) ? (
                  <>
                    <div className="columns is-multiline">
                      {customers.results.map((customer) => (
                        <div className="column is-4" key={customer.id}>
                          <div className="card has-background-info-light m-4">
                            {/* HEADER */}
                            <header className="card-header">
                              <p className="card-header-title">
                                <Link to={`/admin/customer/${customer.id}`}>
                                  {customer.type ===
                                    COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                                    <strong>
                                      🏢 {customer.organizationName}
                                    </strong>
                                  )}
                                  {customer.type ===
                                    RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                                    <strong>
                                      🏠 {customer.firstName}{" "}
                                      {customer.lastName}
                                    </strong>
                                  )}
                                </Link>
                              </p>
                            </header>

                            {/* BODY */}
                            <div className="card-content">
                              <div className="content">
                                {customer.addressLine1}
                                <br />
                                {customer.city}, {customer.region}
                                <br />
                                {customer.phone ? (
                                  <a href={`tel:${customer.phone}`}>
                                    {customer.phone}
                                  </a>
                                ) : (
                                  <>-</>
                                )}
                                <br />
                                {customer.email ? (
                                  <a href={`mailto:${customer.email}`}>
                                    {customer.email}
                                  </a>
                                ) : (
                                  <>-</>
                                )}
                              </div>
                            </div>

                            {/* BOTTOM */}
                            <footer className="card-footer">
                              <Link
                                to={`/admin/customer/${customer.id}`}
                                className="card-footer-item"
                              >
                                Select →
                              </Link>
                            </footer>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="columns pt-4">
                      <div className="column is-half">
                        <div className="select">
                          <select
                            value={pageSize}
                            onChange={(e) =>
                              setPageSize(parseInt(e.target.value))
                            }
                          >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                          </select>
                        </div>
                      </div>
                      <div className="column is-half has-text-right">
                        {previousCursors.length > 0 && (
                          <button
                            className="button"
                            onClick={onPreviousClicked}
                          >
                            Previous
                          </button>
                        )}
                        {customers.hasNextPage && (
                          <button className="button" onClick={onNextClicked}>
                            Next
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <section className="hero is-medium has-background-white-ter">
                    <div className="hero-body">
                      <p className="title">📊 No Customers</p>
                      <p className="subtitle">
                        No customers found.{" "}
                        <b>
                          <Link to="/admin/customers/add/step-1-search">
                            Click here →
                          </Link>
                        </b>{" "}
                        to search again.
                      </p>
                    </div>
                  </section>
                )}
              </div>

              <p className="title is-4 has-text-centered">- OR -</p>

              <div className="columns pt-5">
                <div className="column has-text-centered">
                  <Link
                    className="button is-medium is-fullwidth-mobile"
                    to="/admin/customers/add/step-1-search"
                  >
                    ← Search Again
                  </Link>
                  &nbsp;
                  <button
                    className="button is-medium is-success is-fullwidth-mobile"
                    onClick={onAddClientClick}
                  >
                    ➕ Add client
                  </button>
                </div>
              </div>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

export default AdminCustomerAddStep1PartBPage;
