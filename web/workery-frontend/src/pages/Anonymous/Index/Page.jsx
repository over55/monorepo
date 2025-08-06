// File: monorepo/web/workery-frontend/src/pages/Anonymous/Index/Page.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import DebugEnv from "./DebugEnv";

function IndexPage() {
  return (
    <>
      <Link to="/login">Login</Link>
      <DebugEnv />
    </>
  );
}

export default IndexPage;
