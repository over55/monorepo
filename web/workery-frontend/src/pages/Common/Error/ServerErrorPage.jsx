// File Path: monorepo/web/workery-frontend/src/pages/Common/Error/ServerErrorPage.jsx
// @uix-page: ServerErrorPage
// Enhanced 500 Page using reusable ServerError component

import React from "react";
import { ServerError } from "../../../components/UIX";

function ServerErrorPage() {
  return (
    <ServerError
      title="Server Error"
      message="Something went wrong on our end. Our team has been notified and is working to fix the issue. Please try again in a few moments."
      showQuickLinks={true}
    />
  );
}

export default ServerErrorPage;
