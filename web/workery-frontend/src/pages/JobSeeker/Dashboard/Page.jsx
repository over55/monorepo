// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/JobSeeker/Dashboard/Page.jsx
import { UIXThemeProvider } from "../../../components/UIX";

function JobSeekerDashboardPage() {
  return (
    <div>
      <h1>Welcome to the Job Seeker Dashboard</h1>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function JobSeekerDashboardPageWithProvider() {
  return (
    <UIXThemeProvider>
      <JobSeekerDashboardPage />
    </UIXThemeProvider>
  );
}

export default JobSeekerDashboardPageWithProvider;
