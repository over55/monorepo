// File Path: monorepo/web/workery-frontend/src/pages/Common/Error/NotFoundPage.jsx
// @uix-page: NotFoundPage
// Enhanced 404 Page using reusable NotFound component

import React from "react";
import { NotFound } from "../../../components/UIX";

function NotFoundPage() {
  return (
    <NotFound
      title="Page Not Found"
      message="Oops! The page you're looking for seems to have wandered off. It might have been moved, deleted, or perhaps it never existed."
      showQuickLinks={true}
    />
  );
}

export default NotFoundPage;
