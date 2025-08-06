import React from "react";
import {
  getAPIBaseURL,
  getAppBaseURL,
  ENV_CONFIG,
} from "../../../services/config/APIConfig";

/**
 * Simple Debug Component for Vite Environment
 * Add temporarily to test your environment: <DebugEnv />
 */
function DebugEnv() {
  const config = {
    apiURL: getAPIBaseURL(),
    appURL: getAppBaseURL(),
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    apiProtocol: import.meta.env.VITE_API_PROTOCOL,
    apiDomain: import.meta.env.VITE_API_DOMAIN,
    wwwProtocol: import.meta.env.VITE_WWW_PROTOCOL,
    wwwDomain: import.meta.env.VITE_WWW_DOMAIN,
    devMode: import.meta.env.VITE_DEV_MODE,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "white",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "15px",
        fontSize: "12px",
        fontFamily: "monospace",
        maxWidth: "350px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}
      >
        🔧 Vite Environment Debug
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>URLs:</strong>
        <div style={{ marginLeft: "10px", color: "#666" }}>
          <div>API: {config.apiURL}</div>
          <div>App: {config.appURL}</div>
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>Vite Environment:</strong>
        <div style={{ marginLeft: "10px", color: "#666" }}>
          <div>Mode: {config.mode}</div>
          <div>Dev: {config.dev ? "true" : "false"}</div>
          <div>Prod: {config.prod ? "true" : "false"}</div>
          <div>Dev Mode: {config.devMode}</div>
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>Raw Variables:</strong>
        <div style={{ marginLeft: "10px", color: "#666" }}>
          <div>VITE_API_PROTOCOL: {config.apiProtocol}</div>
          <div>VITE_API_DOMAIN: {config.apiDomain}</div>
          <div>VITE_WWW_PROTOCOL: {config.wwwProtocol}</div>
          <div>VITE_WWW_DOMAIN: {config.wwwDomain}</div>
        </div>
      </div>

      <div
        style={{
          padding: "8px",
          background: config.apiURL.includes("undefined")
            ? "#ffcdd2"
            : "#c8e6c9",
          borderRadius: "4px",
          marginTop: "10px",
        }}
      >
        <strong>Status:</strong>{" "}
        {config.apiURL.includes("undefined")
          ? "❌ Missing env vars"
          : "✅ Configured"}
      </div>
    </div>
  );
}

export default DebugEnv;
