// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/Index/Page.jsx
import { useNavigate } from "react-router";
import { Card, Button, UIXThemeProvider } from "../../../components/UIX";
import DebugEnv from "./DebugEnv";

function IndexPageContent() {
  const navigate = useNavigate();

  return (
    <div className="light min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to Workery
        </h1>
        <p className="text-gray-600 mb-6">
          Please log in to continue.
        </p>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Card>
      <DebugEnv />
    </div>
  );
}

// Wrapper with UIXThemeProvider forcing light mode for consistent branding
function IndexPage() {
  return (
    <UIXThemeProvider forceTheme="blue">
      <IndexPageContent />
    </UIXThemeProvider>
  );
}

export default IndexPage;
