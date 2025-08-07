// File Path: web/workery-frontend/src/pages/Admin/Customer/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  TextArea,
  Select,
} from "../../../../components/UI";

function AdminCustomerListPage() {
  return (
    <>
      <h1>Welcome to AdminCustomerListPage</h1>
      {/* TODO: Implement */}
    </>
  );
}

export default AdminCustomerListPage;
