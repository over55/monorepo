// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Comment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/dateFormatter";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";

function AdminOrderDetailCommentListPage() {
  ////
  //// URL Parameters.
  ////
  const { oid } = useParams();

  ////
  //// Services
  ////
  const orderManager = useOrderManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [content, setContent] = useState("");
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  ////
  //// Event handling.
  ////
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick, content:", content);

    setErrors(null);
    setFetching(true);

    try {
      // Call the manager to create comment
      const response = await orderManager.createOrderComment(
        oid,
        content,
        onUnauthorized,
      );

      // Handle success
      setOrder(response);
      setContent("");

      // Add a temporary banner message
      setTopAlertMessage("Comment created");
      setTopAlertStatus("success");

      // Clear message after 2 seconds
      setTimeout(() => {
        console.log("onSuccess: Delayed for 2 seconds.");
        setTopAlertMessage("");
        setTopAlertStatus("");
      }, 2000);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  ////
  //// API Callbacks
  ////
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Effects
  ////
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetail = async () => {
      if (mounted) {
        window.scrollTo(0, 0);
        setFetching(true);

        try {
          const response = await orderManager.getOrderDetail(
            oid,
            onUnauthorized,
          );

          if (mounted) {
            setOrder(response);
          }
        } catch (error) {
          console.error("Error fetching order detail:", error);
          if (mounted) {
            setErrors(error);
          }
        } finally {
          if (mounted) {
            setFetching(false);
          }
        }
      }
    };

    fetchOrderDetail();

    return () => {
      mounted = false;
    };
  }, [oid]);

  ////
  //// Component rendering.
  ////

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        {/* Desktop Breadcrumbs */}
        <nav aria-label="breadcrumbs" style={{ marginBottom: "20px" }}>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "4px",
              display: window.innerWidth > 768 ? "block" : "none",
            }}
          >
            <Link to="/admin/dashboard" style={{ marginRight: "10px" }}>
              🏠 Dashboard
            </Link>
            &gt;
            <Link to="/admin/orders" style={{ margin: "0 10px" }}>
              🔧 Orders
            </Link>
            &gt;
            <span style={{ marginLeft: "10px" }}>
              ℹ️ Order #{oid} (Comments)
            </span>
          </div>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav aria-label="breadcrumbs" style={{ marginBottom: "20px" }}>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "4px",
              display: window.innerWidth <= 768 ? "block" : "none",
            }}
          >
            <Link to="/admin/orders">← Back to Orders</Link>
          </div>
        </nav>

        {/* Page banner for archived orders */}
        {order && order.status === ORDER_STATUS_ARCHIVED && (
          <div
            style={{
              padding: "15px",
              marginBottom: "20px",
              backgroundColor: "#d1ecf1",
              borderColor: "#bee5eb",
              border: "1px solid",
              borderRadius: "4px",
              color: "#0c5460",
            }}
          >
            Archived
          </div>
        )}

        {/* Top Alert Message */}
        {topAlertMessage && (
          <div
            style={{
              padding: "15px",
              marginBottom: "20px",
              backgroundColor:
                topAlertStatus === "success" ? "#d4edda" : "#f8d7da",
              borderColor: topAlertStatus === "success" ? "#c3e6cb" : "#f5c6cb",
              border: "1px solid",
              borderRadius: "4px",
              color: topAlertStatus === "success" ? "#155724" : "#721c24",
            }}
          >
            {topAlertMessage}
          </div>
        )}

        {/* Page Title */}
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>🔧 Order</h1>
        <h4 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#666" }}>
          ℹ️ Detail
        </h4>
        <hr />

        {/* Page Content */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {/* Title */}
          {order && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                💬 Comments
              </p>
            </div>
          )}

          {isFetching ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Error Box */}
              {errors && Object.keys(errors).length > 0 && (
                <div
                  style={{
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f8d7da",
                    borderColor: "#f5c6cb",
                    border: "1px solid",
                    borderRadius: "4px",
                    color: "#721c24",
                  }}
                >
                  <strong>Error:</strong>
                  <ul style={{ marginTop: "10px", marginBottom: "0" }}>
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order && (
                <div>
                  {/* Tab Navigation */}
                  <div
                    style={{
                      borderBottom: "2px solid #dee2e6",
                      marginBottom: "20px",
                    }}
                  >
                    <ul
                      style={{
                        display: "flex",
                        listStyle: "none",
                        padding: "0",
                        margin: "0",
                        flexWrap: "wrap",
                      }}
                    >
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Summary
                        </Link>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}/full`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Detail
                        </Link>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}/activity-sheets`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Activity Sheets
                        </Link>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}/tasks`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Tasks
                        </Link>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            color: "#007bff",
                            fontWeight: "bold",
                            borderBottom: "2px solid #007bff",
                          }}
                        >
                          Comments
                        </span>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}/attachments`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Attachments
                        </Link>
                      </li>
                      <li style={{ marginRight: "20px" }}>
                        <Link
                          to={`/admin/order/${oid}/more`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          More ⋯
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Comments List */}
                  {order.comments && order.comments.length > 0 && (
                    <div style={{ marginBottom: "30px" }}>
                      {order.comments.map((comment, i) => {
                        console.log(comment); // For debugging purposes only
                        return (
                          <div key={i} style={{ paddingBottom: "20px" }}>
                            <span
                              style={{
                                float: "right",
                                color: "#999",
                                fontSize: "0.9rem",
                              }}
                            >
                              {comment.createdByUserName !== "" ? (
                                comment.createdByUserName
                              ) : (
                                <>Hidden User</>
                              )}{" "}
                              at{" "}
                              <b>{formatDateForDisplay(comment.createdAt)}</b>
                            </span>
                            <br style={{ clear: "both" }} />
                            <div
                              style={{
                                backgroundColor:
                                  comment.orderIncidentId !== undefined &&
                                  comment.orderIncidentId !== null &&
                                  comment.orderIncidentId !== "" &&
                                  comment.orderIncidentId !==
                                    "000000000000000000000000"
                                    ? "#f8d7da"
                                    : "#f8f9fa",
                                border:
                                  comment.orderIncidentId !== undefined &&
                                  comment.orderIncidentId !== null &&
                                  comment.orderIncidentId !== "" &&
                                  comment.orderIncidentId !==
                                    "000000000000000000000000"
                                    ? "1px solid #f5c6cb"
                                    : "1px solid #dee2e6",
                                borderRadius: "4px",
                                padding: "15px",
                                marginTop: "10px",
                              }}
                            >
                              {comment.orderIncidentId !== undefined &&
                                comment.orderIncidentId !== null &&
                                comment.orderIncidentId !== "" &&
                                comment.orderIncidentId !==
                                  "000000000000000000000000" && <>🔥&nbsp;</>}
                              {comment.content}
                              {comment.orderIncidentId !== undefined &&
                                comment.orderIncidentId !== null &&
                                comment.orderIncidentId !== "" &&
                                comment.orderIncidentId !==
                                  "000000000000000000000000" && (
                                  <>
                                    <br />
                                    <Link
                                      style={{
                                        float: "right",
                                        fontStyle: "italic",
                                        textDecoration: "none",
                                        color: "#007bff",
                                      }}
                                      to={`/admin/order/${oid}/more/incident/${comment.orderIncidentId}`}
                                    >
                                      View incident →
                                    </Link>
                                    <br />
                                  </>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <div
                    style={{
                      backgroundColor: "#d4edda",
                      padding: "20px",
                      borderRadius: "4px",
                      marginTop: "30px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontWeight: "600",
                      }}
                    >
                      Write your comment here:{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      name="content"
                      placeholder="Text input"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "10px",
                        border:
                          errors && errors.content
                            ? "1px solid #dc3545"
                            : "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />
                    {errors && errors.content && (
                      <div
                        style={{
                          color: "#dc3545",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {errors.content}
                      </div>
                    )}
                  </div>

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
                    <div>
                      <Link
                        to="/admin/orders"
                        style={{
                          display: "inline-block",
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                        }}
                      >
                        ← Back to Orders
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={onSubmitClick}
                        disabled={
                          order.status === ORDER_STATUS_ARCHIVED || isFetching
                        }
                        style={{
                          padding: "10px 20px",
                          backgroundColor:
                            order.status === ORDER_STATUS_ARCHIVED
                              ? "#ccc"
                              : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            order.status === ORDER_STATUS_ARCHIVED
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            order.status === ORDER_STATUS_ARCHIVED ? 0.6 : 1,
                        }}
                      >
                        ✓ Save Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOrderDetailCommentListPage;
