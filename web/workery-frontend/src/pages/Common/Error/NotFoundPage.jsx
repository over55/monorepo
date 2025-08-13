// File Path: monorepo/web/workery-frontend/src/pages/Common/Error/NotFoundPage.jsx
//
function NotFoundPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p style={{ marginTop: "20px" }}>
        <a href="/login">← Back to Login</a> | <a href="/">← Back to Home</a>
      </p>
    </div>
  );
}

export default NotFoundPage;
