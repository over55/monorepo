# OTPInput Component

A specialized input component for One-Time Password (OTP) verification codes, optimized for mobile devices with iOS/Android specific enhancements.

## Features

- ✅ **Numeric-only input** with proper mobile keyboard
- ✅ **Auto-complete support** for SMS codes (iOS/Android)
- ✅ **Visual feedback** - success state when complete, error state on validation failure
- ✅ **Mobile-optimized** - iOS/Android viewport and keyboard handling
- ✅ **Theme-aware** - integrates with UIX theme system
- ✅ **Accessible** - proper labels, ARIA attributes, and error messages
- ✅ **Large, readable text** - monospace font with center alignment
- ✅ **Character counter** - shows progress toward completion

## Usage

### Basic Example

```jsx
import React, { useState } from "react";
import { OTPInput } from "components/UIX";

function TwoFAVerification() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (token.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // Verify token...
  };

  return (
    <OTPInput
      label="Enter Verification Code"
      value={token}
      onChange={setToken}
      error={error}
      helperText="Enter the 6-digit code from your authenticator app"
      autoFocus
    />
  );
}
```

### With Form Submission

```jsx
import React, { useState } from "react";
import { OTPInput, Button } from "components/UIX";

function TwoFALogin() {
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (token.length !== 6) {
      setErrors({ token: "Code must be 6 digits" });
      return;
    }

    setIsLoading(true);
    try {
      await authManager.validateOTP(token);
      // Success - redirect
    } catch (error) {
      setErrors({ token: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <OTPInput
        label="Verification Code"
        value={token}
        onChange={setToken}
        error={errors.token}
        disabled={isLoading}
        required
      />

      <Button
        type="submit"
        disabled={isLoading || token.length !== 6}
        loading={isLoading}
      >
        Verify Code
      </Button>
    </form>
  );
}
```

### With Auto-Submit on Complete

```jsx
import React, { useState, useEffect } from "react";
import { OTPInput } from "components/UIX";

function AutoSubmitOTP() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token.length === 6) {
      // Auto-submit when code is complete
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (code) => {
    try {
      await authManager.validateOTP(code);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <OTPInput
      label="Enter Code"
      value={token}
      onChange={setToken}
      error={error}
      helperText="Code will auto-submit when complete"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text for the input |
| `value` | `string` | `""` | Current OTP value |
| `onChange` | `function` | - | Change handler (receives value directly, NOT event) |
| `onKeyDown` | `function` | - | Optional keyDown handler for Enter key submission |
| `error` | `string` | - | Error message to display |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `required` | `boolean` | `false` | Whether the input is required |
| `maxLength` | `number` | `6` | Maximum number of digits |
| `placeholder` | `string` | `"000000"` | Placeholder text |
| `helperText` | `string` | - | Helper text below input |
| `autoFocus` | `boolean` | `false` | Whether to auto-focus on mount |
| `className` | `string` | `""` | Additional CSS classes |
| `ref` | `React.Ref` | - | Forward ref support |

### Important: onChange Behavior

**The `onChange` prop receives the value directly, NOT the event object.**

✅ **Correct:**
```jsx
<OTPInput onChange={(value) => setToken(value)} />
// or
<OTPInput onChange={setToken} />
```

❌ **Incorrect:**
```jsx
<OTPInput onChange={(e) => setToken(e.target.value)} />
```

## Visual States

### Normal State
- Gray border
- White background
- No icons

### Complete State (6 digits entered)
- Green border
- Light green background
- Green checkmark icon
- "Code complete" message

### Error State
- Red border
- Light red background
- Red error icon
- Error message displayed

### Disabled State
- Gray background
- Reduced opacity
- Non-interactive

## Mobile Optimizations

### iOS Support
- Prevents zoom on focus (16px font size)
- Auto-scrolls input into view when keyboard opens
- Supports iOS autofill for SMS codes
- Proper safe area handling
- Touch-optimized tap targets

### Android Support
- Visual viewport handling
- Keyboard detection and layout adjustment
- Proper input mode for numeric keyboard
- Material Design touch feedback

### SMS Auto-Fill
The component uses `autoComplete="one-time-code"` which enables:
- iOS 12+ SMS code auto-fill
- Android SMS code auto-fill
- Browser autofill for verification codes

## Accessibility

- Proper `<label>` association via `htmlFor`
- Required field indicator (red asterisk)
- Error messages announced to screen readers
- Clear visual states for all interactions
- Keyboard navigation support

## Integration with useMobileOptimizations Hook

The component automatically uses the `useMobileOptimizations` hook internally to:
- Detect iOS/Android devices
- Apply platform-specific CSS classes
- Optimize font sizes to prevent zoom
- Handle viewport and keyboard events

## Character Counter

The component includes a built-in character counter in the bottom-right:
- Gray when incomplete
- Green when complete (6/6)
- Red when there's an error

## Theme Integration

The component is fully theme-aware and adapts to the active UIX theme:
- Border colors use theme primary color
- Focus rings use theme accent color
- Text colors use theme text hierarchy
- Success/error states use semantic colors

## Best Practices

### 1. Always Provide Helper Text
```jsx
<OTPInput
  helperText="Enter the 6-digit code from your authenticator app"
/>
```

### 2. Clear Errors When User Types
```jsx
const handleChange = (value) => {
  setToken(value);
  if (error) setError(""); // Clear error on input
};
```

### 3. Disable During Submission
```jsx
<OTPInput
  disabled={isLoading}
  value={token}
  onChange={setToken}
/>
```

### 4. Auto-Focus for Better UX
```jsx
<OTPInput autoFocus />
```

### 5. Use with Form Validation
```jsx
const validateToken = (token) => {
  if (!token) return "Code is required";
  if (token.length !== 6) return "Code must be 6 digits";
  if (!/^\d+$/.test(token)) return "Code must contain only numbers";
  return null;
};
```

## Browser Support

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (iOS 12+, macOS)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## Related Components

- `Input` - General-purpose input component
- `BackupCodeDisplay` - For displaying backup codes
- `useMobileOptimizations` - Hook for mobile device detection and optimizations
