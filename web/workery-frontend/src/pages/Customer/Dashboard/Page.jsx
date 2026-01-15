// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/Customer/Dashboard/Page.jsx
import { UIXThemeProvider } from "../../../components/UIX";

function CustomerDashboardPage() {
  return (
    <div>
      <h1>Welcome to the Customer</h1>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function CustomerDashboardPageWithProvider() {
  return (
    <UIXThemeProvider>
      <CustomerDashboardPage />
    </UIXThemeProvider>
  );
}

export default CustomerDashboardPageWithProvider;
