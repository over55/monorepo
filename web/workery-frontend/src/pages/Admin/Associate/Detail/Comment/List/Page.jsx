// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/Comment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateManager } from "../../../../../../services/Services";

function AdminAssociateDetailCommentListPage() {
  ////
  //// URL Parameters.
  ////
  const { aid } = useParams();

  ////
  //// Services
  ////
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState({});
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
      const response = await associateManager.createAssociateComment(
        aid,
        content,
        onUnauthorized,
      );

      // Handle success
      setAssociate(response);
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

    const fetchAssociateDetail = async () => {
      if (mounted) {
        window.scrollTo(0, 0);
        setFetching(true);

        try {
          const response = await associateManager.getAssociateDetail(
            aid,
            onUnauthorized,
          );

          if (mounted) {
            setAssociate(response);
          }
        } catch (error) {
          console.error("Error fetching associate detail:", error);
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

    fetchAssociateDetail();

    return () => {
      mounted = false;
    };
  }, [aid]);

  ////
  //// Component rendering.
  ////

  // Format date/time
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
            <Link to="/admin/associates" style={{ margin: "0 10px" }}>
              👷 Associates
            </Link>
            &gt;
            <span style={{ marginLeft: "10px" }}>ℹ️ Detail</span>
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
            <Link to="/admin/associates">← Back to Associates</Link>
          </div>
        </nav>

        {/* Page banner for archived associates */}
        {associate && associate.status === 2 && (
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
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>👷 Associate</h1>
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
          {associate && (
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

              {associate && (
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
                          to={`/admin/associate/${aid}`}
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
                          to={`/admin/associate/${aid}/detail`}
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
                          to={`/admin/associate/${aid}/orders`}
                          style={{
                            display: "inline-block",
                            padding: "10px 0",
                            textDecoration: "none",
                            color: "#666",
                            borderBottom: "2px solid transparent",
                          }}
                        >
                          Orders
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
                          to={`/admin/associate/${aid}/attachments`}
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
                          to={`/admin/associate/${aid}/more`}
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
                  {associate.comments && associate.comments.length > 0 && (
                    <div style={{ marginBottom: "30px" }}>
                      {associate.comments.map((comment, i) => {
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
                              at <b>{formatDateTime(comment.createdAt)}</b>
                            </span>
                            <br style={{ clear: "both" }} />
                            <div
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                padding: "15px",
                                marginTop: "10px",
                              }}
                            >
                              {comment.content}
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
                        to="/admin/associates"
                        style={{
                          display: "inline-block",
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                        }}
                      >
                        ← Back to Associates
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={onSubmitClick}
                        disabled={associate.status === 2 || isFetching}
                        style={{
                          padding: "10px 20px",
                          backgroundColor:
                            associate.status === 2 ? "#ccc" : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            associate.status === 2 ? "not-allowed" : "pointer",
                          opacity: associate.status === 2 ? 0.6 : 1,
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

export default AdminAssociateDetailCommentListPage;
