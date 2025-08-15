// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Ban/Page.jsx

import React from "react";
import { Link, useParams } from "react-router";
import {
  Card,
  Button,
  Alert,
  Breadcrumb,
} from "../../../../../../components/UI";

function AdminStaffDetailMoreBanPage() {
  const { aid } = useParams();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail (More)", path: `/admin/staff/${aid}/more`, icon: "ℹ️" },
    { label: "Ban", icon: "🚫" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <Card>
        <Alert type="info">
          Ban functionality is not yet implemented. This feature would prevent
          the staff member from logging in.
        </Alert>

        <div style={{ marginTop: "20px" }}>
          <Link to={`/admin/staff/${aid}/more`}>
            <Button variant="secondary">← Back to Detail (More)</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailMoreBanPage;
