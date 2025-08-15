// src/main.jsx - Fixed version without double Router
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./AppRouter";
import { ServiceProvider } from "./services/Services";
import "./styles/app.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong!
            </h1>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ServiceProvider>
        <App /> {/* AppRouter should contain BrowserRouter */}
      </ServiceProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

if (import.meta.env.DEV) {
  console.log("🚀 Workery Frontend Running in Development Mode");
  console.log(
    "API URL:",
    import.meta.env.VITE_API_URL || "http://localhost:8000",
  );
}
