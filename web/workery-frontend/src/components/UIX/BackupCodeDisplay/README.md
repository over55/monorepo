# BackupCodeDisplay Component

A specialized component for displaying 2FA backup codes with copy functionality, security warnings, and mobile optimizations.

## Features

- ✅ **One-click copy** to clipboard with visual feedback
- ✅ **Large, readable code** - monospace font, center-aligned
- ✅ **Security warnings** - best practices and important notes
- ✅ **Mobile-optimized** - proper touch targets and font sizing
- ✅ **Theme-aware** - integrates with UIX theme system
- ✅ **Accessible** - proper labels and copy confirmations
- ✅ **Success indicators** - visual feedback when code is copied

## Usage

### Basic Example

```jsx
import React from "react";
import { BackupCodeDisplay } from "components/UIX";

function ShowBackupCode() {
  const backupCode = "ABC123XYZ789DEF456";

  return (
    <BackupCodeDisplay
      code={backupCode}
      label="Your 2FA Backup Code"
    />
  );
}
```

### With Copy Callback

```jsx
import React from "react";
import { BackupCodeDisplay } from "components/UIX";

function TrackCopy() {
  const backupCode = "ABC123XYZ789DEF456";

  const handleCopy = () => {
    // Track analytics event
    analytics.track("backup_code_copied");

    // Show additional guidance
    console.log("User copied backup code");
  };

  return (
    <BackupCodeDisplay
      code={backupCode}
      onCopy={handleCopy}
    />
  );
}
```

### Without Security Warnings

```jsx
import React from "react";
import { BackupCodeDisplay } from "components/UIX";

function CompactDisplay() {
  return (
    <BackupCodeDisplay
      code="ABC123XYZ789DEF456"
      label="Recovery Code"
      showWarnings={false}
    />
  );
}
```

### Complete 2FA Backup Code Page

```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BackupCodeDisplay,
  Button,
  Card,
  Alert,
  UIXThemeProvider,
} from "components/UIX";
import { useAuthManager } from "services/Services";
import { getRoleRedirectPath } from "constants/Roles";

function BackupCodePage() {
  const navigate = useNavigate();
  const authManager = useAuthManager();

  // Get backup code from sessionStorage (set during 2FA setup)
  const backupCode = sessionStorage.getItem("2fa_backup_code");

  // Remove from sessionStorage immediately after retrieval
  useEffect(() => {
    if (backupCode) {
      sessionStorage.removeItem("2fa_backup_code");
    }
  }, [backupCode]);

  const handleContinue = () => {
    const user = authManager.getCurrentUser();
    const redirectPath = getRoleRedirectPath(user.role);
    navigate(redirectPath);
  };

  if (!backupCode) {
    return (
      <Alert type="error">
        No backup code found. Please complete 2FA setup again.
      </Alert>
    );
  }

  return (
    <UIXThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-center mb-6">
              2FA Setup Complete!
            </h1>

            <p className="text-center text-gray-600 mb-8">
              Save this backup code securely. You'll need it if you lose access
              to your authenticator app.
            </p>

            <BackupCodeDisplay
              code={backupCode}
              showWarnings={true}
              onCopy={() => console.log("Code copied")}
            />

            <div className="mt-8 text-center">
              <Button
                onClick={handleContinue}
                variant="success"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </UIXThemeProvider>
  );
}

export default BackupCodePage;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | *required* | The backup code to display |
| `label` | `string` | `"Backup Code:"` | Label text for the code section |
| `showWarnings` | `boolean` | `true` | Whether to show security warning section |
| `onCopy` | `function` | - | Optional callback when code is copied |
| `className` | `string` | `""` | Additional CSS classes |

## Component Sections

### 1. Header Section
- Label text (customizable via `label` prop)
- Copy button with icon
- Visual feedback when copied (green background, checkmark icon)

### 2. Code Display
- Large textarea with backup code
- Monospace font for readability
- Center-aligned text
- Green border and background
- Read-only (prevents accidental editing)
- Helper text below

### 3. Security Warnings (Optional)
Amber-colored warning box with important notes:
- ✅ Code can only be used once
- ✅ Store in password manager or safe location
- ✅ Never share with anyone
- ✅ Need to set up 2FA again after using it

### 4. Success Indicator (Conditional)
- Shows green success message when code is copied
- Auto-dismisses after 3 seconds
- Reminds user to save securely

## Visual States

### Default State
- Gray copy button
- Green code display area
- Amber warning section

### Copied State (3 seconds)
- Green copy button with checkmark
- "Copied!" button text
- Green success banner appears
- Auto-resets to default after 3 seconds

### No Code State
- Component returns `null`
- Does not render anything

## Mobile Optimizations

### Touch Targets
- Copy button has minimum 44px height on mobile
- Proper touch-action handling
- No tap highlight color

### Font Sizing
- Prevents iOS zoom with 16px minimum
- Larger text on mobile (text-xl)
- Responsive sizing with breakpoints

### Layout
- Responsive spacing (sm: breakpoints)
- Proper safe area handling
- Mobile-friendly touch interactions

## Security Best Practices

### 1. Use sessionStorage (Not URL Parameters)
```jsx
// ✅ CORRECT - Secure
sessionStorage.setItem("2fa_backup_code", code);
navigate("/backup-code");

// Component retrieves and removes
const code = sessionStorage.getItem("2fa_backup_code");
sessionStorage.removeItem("2fa_backup_code");

// ❌ INCORRECT - Insecure (code in URL/logs)
navigate(`/backup-code?code=${code}`);
```

### 2. Remove After Display
```jsx
useEffect(() => {
  if (backupCode) {
    sessionStorage.removeItem("2fa_backup_code");
  }
}, [backupCode]);
```

### 3. Validate Code Exists
```jsx
if (!backupCode) {
  return <Alert type="error">No code found</Alert>;
}
```

### 4. Track Copy Events
```jsx
<BackupCodeDisplay
  code={code}
  onCopy={() => {
    analytics.track("backup_code_copied");
    logSecurityEvent("BACKUP_CODE_VIEWED");
  }}
/>
```

## Accessibility

- Proper label/button associations
- Visual copy feedback (not just color)
- Success message announced to screen readers
- Keyboard accessible copy button
- High contrast text and borders

## Theme Integration

The component is fully theme-aware:
- Label uses `text-primary` theme class
- Helper text uses `text-secondary` theme class
- Hover states use theme transform utilities
- Works with all UIX themes (blue, red, purple, green, charcoal)

## Copy Functionality

The component uses the modern Clipboard API:

```javascript
await navigator.clipboard.writeText(code);
```

### Browser Support
- ✅ Chrome/Edge 66+
- ✅ Firefox 63+
- ✅ Safari 13.1+
- ✅ Mobile browsers (iOS Safari 13+, Chrome Mobile)

### Error Handling
```javascript
try {
  await navigator.clipboard.writeText(code);
  setCopied(true);
} catch (error) {
  console.error("Failed to copy", error);
  // Optionally show error to user
}
```

## Complete Integration Example

### Step 1: Generate Backup Code (Step3Page.jsx)
```jsx
const verifyResponse = await twoFactorAuthManager.verifyOTP(token);

if (verifyResponse.otp_backup_code) {
  // Store in sessionStorage (NOT URL)
  sessionStorage.setItem("2fa_backup_code", verifyResponse.otp_backup_code);
  navigate("/login/2fa/backup-code");
}
```

### Step 2: Display Backup Code (BackupCodeGeneratePage.jsx)
```jsx
// Retrieve and remove from sessionStorage
const backupCode = sessionStorage.getItem("2fa_backup_code");
if (backupCode) {
  sessionStorage.removeItem("2fa_backup_code");
}

return (
  <BackupCodeDisplay
    code={backupCode}
    onCopy={() => analytics.track("backup_code_copied")}
  />
);
```

## Related Components

- `OTPInput` - For entering verification codes
- `Alert` - For error/success messages
- `Card` - For page layout
- `Button` - For navigation actions
- `useMobileOptimizations` - Hook for mobile device detection

## Best Practices

### 1. Always Remove from Storage After Display
```jsx
useEffect(() => {
  if (code) {
    sessionStorage.removeItem("2fa_backup_code");
  }
}, [code]);
```

### 2. Show Security Warnings by Default
```jsx
<BackupCodeDisplay
  code={code}
  showWarnings={true} // Default, emphasizes security
/>
```

### 3. Provide Next Step Navigation
```jsx
<BackupCodeDisplay code={code} />
<Button onClick={handleContinue}>
  Continue to Dashboard
</Button>
```

### 4. Track Security Events
```jsx
<BackupCodeDisplay
  code={code}
  onCopy={() => {
    logSecurityEvent("BACKUP_CODE_COPIED");
  }}
/>
```

## Migration from Raw HTML

### Before (Raw HTML - 100+ lines)
```jsx
<textarea readOnly value={backupCode} className="..." style={{...}} />
<button onClick={handleCopy} className="...">
  {copied ? "Copied!" : "Copy"}
</button>
<div className="warning-box">
  <ul>
    <li>Security note 1</li>
    <li>Security note 2</li>
    {/* etc... */}
  </ul>
</div>
```

### After (UIX Component - 1 line)
```jsx
<BackupCodeDisplay code={backupCode} onCopy={handleCopy} />
```

**Result**: ~100 lines reduced to 1 line, with better UX and security.
