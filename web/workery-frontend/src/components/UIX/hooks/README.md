# useMobileOptimizations Hook

A comprehensive React hook for iOS and Android mobile device optimizations, including viewport management, keyboard detection, touch events, and device-specific fixes.

## Purpose

This hook extracts 500+ lines of duplicated mobile optimization code from TwoFA pages into a single, reusable hook. It handles the complex iOS/Android viewport and keyboard issues that plague mobile web applications.

## Features

- ✅ **iOS Safari viewport fixes** - Handles address bar, keyboard, and orientation changes
- ✅ **Android keyboard detection** - Visual viewport API integration
- ✅ **Touch event optimization** - Prevents unwanted scroll behavior
- ✅ **Safe area insets** - Proper handling of iOS notches and Android navigation bars
- ✅ **Keyboard detection** - Adds CSS classes when virtual keyboard is open
- ✅ **Scroll position management** - Prevents overscroll bounce
- ✅ **Device detection** - Returns iOS/Android/Safari flags for conditional rendering
- ✅ **Auto-cleanup** - Properly removes all event listeners on unmount

## Usage

### Basic Example

```jsx
import React from "react";
import { useMobileOptimizations } from "components/UIX";

function MyMobileComponent() {
  const { isIOS, isAndroid, isMobile, isSafari } = useMobileOptimizations();

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isIOS && <p>iOS-specific content</p>}
      {isAndroid && <p>Android-specific content</p>}
      <p>This page is optimized for your device!</p>
    </div>
  );
}
```

### With Form Inputs

```jsx
import React, { useState } from "react";
import { useMobileOptimizations } from "components/UIX";

function LoginForm() {
  useMobileOptimizations(); // Activates optimizations

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ fontSize: "16px" }} // Prevents iOS zoom
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ fontSize: "16px" }} // Prevents iOS zoom
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Conditional Rendering Based on Device

```jsx
import React from "react";
import { useMobileOptimizations } from "components/UIX";

function ResponsiveComponent() {
  const { isIOS, isAndroid, isMobile } = useMobileOptimizations();

  return (
    <div>
      {isMobile ? (
        <MobileTouchOptimizedButton />
      ) : (
        <DesktopButton />
      )}

      {isIOS && (
        <div className="ios-safe-area">
          iOS Safe Area Content
        </div>
      )}

      {isAndroid && (
        <div className="android-layout">
          Android Material Design Layout
        </div>
      )}
    </div>
  );
}
```

### With OTPInput Component

```jsx
import React, { useState } from "react";
import { useMobileOptimizations } from "components/UIX";

function TwoFAVerification() {
  const { isMobile } = useMobileOptimizations();
  const [token, setToken] = useState("");

  return (
    <div className={isMobile ? 'mobile-optimized' : ''}>
      <input
        type="tel"
        inputMode="numeric"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className={isMobile ? 'text-3xl' : 'text-2xl'}
      />
    </div>
  );
}
```

## Return Values

The hook returns an object with device detection flags:

```typescript
{
  isIOS: boolean;      // True if running on iOS (iPhone, iPad, iPod)
  isAndroid: boolean;  // True if running on Android
  isMobile: boolean;   // True if running on iOS or Android
  isSafari: boolean;   // True if running on Safari browser
}
```

### Device Detection

```javascript
const { isIOS, isAndroid, isMobile, isSafari } = useMobileOptimizations();

// isIOS: Detects iPad, iPhone, iPod
// isAndroid: Detects Android devices
// isMobile: True if isIOS OR isAndroid
// isSafari: Detects Safari browser (excluding Chrome on iOS)
```

## What It Optimizes

### 1. iOS Safari Viewport Management

#### Problem
iOS Safari's address bar and keyboard cause viewport size changes, breaking fixed layouts.

#### Solution
```javascript
// Sets CSS custom properties that update dynamically
--ios-vh: <actual viewport height in vh units>
--ios-actual-vh: <actual viewport height in px>
```

**Usage in CSS:**
```css
.ios-full-height {
  min-height: 100vh;
  min-height: calc(var(--ios-vh, 1vh) * 100);
}
```

### 2. iOS Virtual Keyboard Detection

#### Problem
iOS doesn't fire resize events consistently when keyboard opens.

#### Solution
```javascript
// Adds CSS class when keyboard is detected
document.body.classList.add("ios-keyboard-open");
```

**Usage in CSS:**
```css
body.ios-keyboard-open .main-content {
  padding-bottom: 300px; /* Space for keyboard */
}
```

### 3. iOS Input Focus Optimization

#### Problem
iOS zooms in when focusing inputs with font-size < 16px.

#### Solution
```javascript
// Automatically sets font-size to 16px on focus
e.target.style.fontSize = "16px";

// Scrolls input into view with keyboard spacing
e.target.scrollIntoView({
  behavior: "smooth",
  block: "center",
});
```

### 4. iOS Scroll Bounce Prevention

#### Problem
iOS allows overscroll bounce, causing unwanted scroll behavior.

#### Solution
```javascript
// Prevents scroll beyond document bounds
if (scrollTop < 0) {
  document.documentElement.scrollTop = 0;
}
```

### 5. Android Visual Viewport Handling

#### Problem
Android's visual viewport API requires special handling for keyboard.

#### Solution
```javascript
// Sets CSS custom property for Android viewport
--android-vh: <visual viewport height in vh units>

// Adds CSS class when keyboard opens
document.body.classList.add("android-keyboard-open");
```

### 6. Enhanced Viewport Meta Tag (iOS)

#### Problem
Default viewport doesn't optimize for iOS form handling.

#### Solution
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content">
```

**Restored on cleanup:**
The hook saves the original viewport content and restores it when component unmounts.

## CSS Classes Added by Hook

The hook automatically adds CSS classes to `document.body` based on device state:

### iOS Classes
- `ios-keyboard-open` - When iOS virtual keyboard is detected

### Android Classes
- `android-keyboard-open` - When Android virtual keyboard is detected

**Example CSS:**
```css
/* Adjust layout when keyboard is open */
body.ios-keyboard-open .container,
body.android-keyboard-open .container {
  transform: translateY(-40px);
  transition: transform 0.3s ease;
}

/* Prevent scroll when keyboard is open */
body.android-keyboard-open {
  position: fixed;
  width: 100%;
  overflow: hidden;
}
```

## Event Listeners Managed

The hook manages the following event listeners and cleans them up on unmount:

### iOS Events
- `window.resize` - Viewport height changes
- `window.orientationchange` - Device rotation
- `document.touchstart` - Touch event optimization
- `document.focusin` - Input focus handling
- `document.scroll` - Scroll position management

### Android Events
- `window.visualViewport.resize` - Visual viewport changes
- `window.visualViewport.scroll` - Viewport scroll changes

### General Mobile Events
- `document.touchmove` - Touch scroll optimization

All listeners are properly removed when the component unmounts, preventing memory leaks.

## Browser Support

### iOS
- ✅ iOS 12+ (Safari, Chrome, Firefox)
- ✅ iPad OS 13+
- ✅ iPhone 6+ (all models)

### Android
- ✅ Android 5+ (Chrome, Firefox, Samsung Internet)
- ✅ Android Chrome 50+
- ✅ Visual Viewport API (Chrome 61+)

### Desktop
- ✅ No-op on desktop (returns device flags but doesn't activate optimizations)
- ✅ Works gracefully when tested in browser DevTools mobile emulation

## Performance Considerations

### 1. Runs Once on Mount
```javascript
useEffect(() => {
  // All optimizations run once
}, []); // Empty dependency array
```

### 2. Passive Event Listeners
```javascript
document.addEventListener("scroll", handler, { passive: true });
```

### 3. Conditional Execution
Only activates optimizations if running on iOS or Android:
```javascript
if (isIOS) {
  // iOS optimizations
} else if (isAndroid) {
  // Android optimizations
}
```

### 4. Proper Cleanup
```javascript
return () => {
  // Remove all listeners
  // Reset all classes
  // Restore original viewport
};
```

## Migration Guide

### Before (Duplicated in Every Page - 500+ lines)

```jsx
function MyPage() {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // 200 lines of iOS viewport handling
      const handleResize = () => {
        const actualVH = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--ios-vh", `${actualVH}px`);
        // ... more code
      };

      // 100 lines of keyboard detection
      // 100 lines of touch handling
      // 100 lines of scroll management

      window.addEventListener("resize", handleResize);
      // ... more listeners

      return () => {
        window.removeEventListener("resize", handleResize);
        // ... cleanup
      };
    }

    if (isAndroid && window.visualViewport) {
      // 200 lines of Android handling
      // ...
    }
  }, []);

  return <div>Content</div>;
}
```

### After (Using Hook - 1 line)

```jsx
import { useMobileOptimizations } from "components/UIX";

function MyPage() {
  const { isIOS, isAndroid, isMobile } = useMobileOptimizations();

  return <div>Content</div>;
}
```

**Result**: 500+ lines reduced to 1 line per component.

## Common Issues Solved

### Issue 1: iOS Zoom on Input Focus
**Problem:** iOS zooms in when font-size < 16px
**Solution:** Hook automatically sets 16px on focus

### Issue 2: iOS Keyboard Hiding Input
**Problem:** Virtual keyboard covers input field
**Solution:** Hook scrolls input into view with proper spacing

### Issue 3: iOS Address Bar Changing Height
**Problem:** Address bar hide/show changes viewport height
**Solution:** Hook updates CSS custom properties dynamically

### Issue 4: Android Keyboard Not Detected
**Problem:** No reliable keyboard detection on Android
**Solution:** Hook uses Visual Viewport API for accurate detection

### Issue 5: Overscroll Bounce
**Problem:** iOS allows scrolling beyond document bounds
**Solution:** Hook prevents negative scrollTop values

## Related Components

- `OTPInput` - Uses this hook for mobile optimizations
- `BackupCodeDisplay` - Uses this hook for touch target sizing
- `Input` - Can benefit from iOS zoom prevention

## Best Practices

### 1. Call Hook at Top of Component
```jsx
function MyComponent() {
  const { isMobile } = useMobileOptimizations(); // First hook call

  const [state, setState] = useState();
  // ... other hooks
}
```

### 2. Use Device Flags for Conditional Rendering
```jsx
const { isIOS, isMobile } = useMobileOptimizations();

return (
  <div className={isMobile ? 'mobile-spacing' : 'desktop-spacing'}>
    {isIOS && <IOSSpecificFeature />}
  </div>
);
```

### 3. Combine with CSS Custom Properties
```jsx
useMobileOptimizations();

// In CSS:
// .container {
//   height: calc(var(--ios-vh, 1vh) * 100);
// }
```

### 4. Don't Call Multiple Times
```jsx
// ❌ BAD - Don't call hook multiple times in same component
function MyComponent() {
  useMobileOptimizations();
  useMobileOptimizations(); // Duplicate listeners!
}

// ✅ GOOD - Call once at top level
function MyComponent() {
  const deviceInfo = useMobileOptimizations();
}
```

## Troubleshooting

### Viewport Not Updating on iOS
**Solution:** Check that CSS uses `var(--ios-vh)`:
```css
.container {
  min-height: calc(var(--ios-vh, 1vh) * 100);
}
```

### Keyboard Class Not Applied
**Solution:** Verify height change > 150px threshold:
```javascript
const heightChange = window.screen.height - window.innerHeight;
if (heightChange > 150) { // Keyboard detected
  document.body.classList.add("ios-keyboard-open");
}
```

### Input Still Zooms on iOS
**Solution:** Ensure font-size is at least 16px:
```jsx
<input style={{ fontSize: "16px" }} />
```

## Future Enhancements

Potential improvements for future versions:
- [ ] iPad Pro landscape detection
- [ ] Android split-screen mode handling
- [ ] Foldable device support
- [ ] iOS 17+ new viewport APIs
- [ ] Configurable keyboard detection threshold
- [ ] Optional debug mode with console logs
