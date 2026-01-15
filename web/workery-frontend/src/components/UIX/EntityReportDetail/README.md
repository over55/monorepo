# EntityReportDetail Component

A reusable whole-page UIX component for report detail pages. Provides a standardized layout with breadcrumb navigation, form card, success/error handling, and recent downloads section.

## Features

- ✅ Full-page layout with theme support
- ✅ Automatic breadcrumb generation
- ✅ Built-in success/error message handling
- ✅ Recent downloads section with filtering
- ✅ Info message support
- ✅ Flexible form content via children
- ✅ Responsive grid layout for downloads
- ✅ Theme-aware styling throughout

## Usage

### Basic Example

```jsx
import React, { useState } from "react";
import { EntityReportDetail, Button, Input, UIXThemeProvider } from "components/UIX";
import { BanknotesIcon, CalendarIcon } from "@heroicons/react/24/outline";

function MyReportPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const recentDownloads = []; // Get from your service

  return (
    <UIXThemeProvider>
      <EntityReportDetail
        reportTitle="Due Service Fees Report"
        reportDescription="Generate a report of outstanding service fees"
        reportBreadcrumbLabel="Due Service Fees"
        icon={BanknotesIcon}
        showSuccess={showSuccess}
        errors={errors}
        infoMessage="This report generates a CSV file with all outstanding fees."
        recentDownloads={recentDownloads}
        reportId={1}
        onDismissSuccess={() => setShowSuccess(false)}
        onDismissErrors={() => setErrors({})}
      >
        {/* Your form content goes here */}
        <form className="space-y-6">
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={setFromDate}
            icon={CalendarIcon}
          />

          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={setToDate}
            icon={CalendarIcon}
          />

          <Button type="submit" variant="success">
            Download Report
          </Button>
        </form>
      </EntityReportDetail>
    </UIXThemeProvider>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `reportTitle` | `string` | ✅ Yes | - | Title displayed in the card header |
| `reportDescription` | `string` | ✅ Yes | - | Description text below the title |
| `reportBreadcrumbLabel` | `string` | ❌ No | `reportTitle` | Label for the breadcrumb (defaults to reportTitle) |
| `icon` | `React.Component` | ✅ Yes | - | HeroIcon component for the report (e.g., `BanknotesIcon`) |
| `children` | `React.ReactNode` | ✅ Yes | - | Form content to render inside the card |
| `recentDownloads` | `Array` | ❌ No | `[]` | Array of recent download objects |
| `showSuccess` | `boolean` | ❌ No | `false` | Whether to show success message |
| `errors` | `Object` | ❌ No | `{}` | Error object for display |
| `infoMessage` | `string` | ❌ No | `""` | Info alert message to display |
| `onDismissSuccess` | `Function` | ❌ No | - | Callback when success message is dismissed |
| `onDismissErrors` | `Function` | ❌ No | - | Callback when errors are dismissed |
| `reportId` | `string\|number` | ❌ No | - | Report ID for filtering recent downloads |
| `reportType` | `string` | ❌ No | - | Report type for filtering recent downloads |

### Recent Downloads Array Format

Each item in the `recentDownloads` array should have:

```javascript
{
  filename: "report-2024-01-15.csv",        // Display name
  downloadedAt: "2024-01-15T10:30:00Z",     // ISO date string
  reportId: 1,                               // Optional: for filtering
  reportType: "Due Service Fees"             // Optional: for filtering
}
```

### Error Object Format

The `errors` object should be a key-value map:

```javascript
{
  fromDate: "Start date is required",
  toDate: "End date must be after start date",
  general: "Failed to generate report"
}
```

## Layout Structure

The component creates this structure:

```
┌─────────────────────────────────────────┐
│ Breadcrumb: Dashboard > Reports > ...  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📊 Report Title                     │ │
│ │    Report Description               │ │
│ ├─────────────────────────────────────┤ │
│ │ [Success/Error Messages]            │ │
│ │ [Info Message]                      │ │
│ │                                     │ │
│ │ {children - Your Form Content}      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🕒 Recent Downloads                 │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐            │ │
│ │ │file1│ │file2│ │file3│            │ │
│ │ └─────┘ └─────┘ └─────┘            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Styling & Themes

The component is fully theme-aware and uses:
- `bg-gradient-primary` for page background
- `bg-card` and `card-border` for card styling
- `bg-gradient-header` for card headers
- `text-primary`, `text-secondary` for text
- `text-success`, `text-error` for status colors

All colors automatically adapt to the active theme (blue, red, purple, green, charcoal).

## Best Practices

### 1. Form Structure

Wrap your form content in a `<form>` tag and use UIX Input/Select components:

```jsx
<EntityReportDetail {...props}>
  <form onSubmit={handleSubmit} className="space-y-6">
    <Input ... />
    <Select ... />
    <div className="flex justify-between pt-6 border-t">
      <Button variant="secondary">Back</Button>
      <Button variant="success">Submit</Button>
    </div>
  </form>
</EntityReportDetail>
```

### 2. Error Handling

Use proper error structure and dismiss callbacks:

```jsx
const [errors, setErrors] = useState({});

// In your submit handler:
try {
  await submitReport();
} catch (error) {
  if (typeof error === "object") {
    setErrors(error);
  } else {
    setErrors({ general: "Failed to submit" });
  }
}

// In component:
<EntityReportDetail
  errors={errors}
  onDismissErrors={() => setErrors({})}
  ...
/>
```

### 3. Success Messages

Show success temporarily with auto-dismiss:

```jsx
const [showSuccess, setShowSuccess] = useState(false);

// After successful submission:
setShowSuccess(true);
setTimeout(() => setShowSuccess(false), 5000);

// In component:
<EntityReportDetail
  showSuccess={showSuccess}
  onDismissSuccess={() => setShowSuccess(false)}
  ...
/>
```

### 4. Recent Downloads

Fetch from your report service and filter by ID/type:

```jsx
const recentDownloads = reportManager.getReportHistory();

<EntityReportDetail
  recentDownloads={recentDownloads}
  reportId={1}
  reportType="Due Service Fees"
  ...
/>
```

The component automatically:
- Filters by `reportId` OR `reportType` if provided
- Limits to 5 most recent downloads
- Hides the section if no downloads exist

## Integration with Services

### Expected Service Methods

Your report service should provide:

```javascript
class ReportManager {
  // Get recent download history
  getReportHistory() {
    // Returns array of download objects
  }

  // Validate report parameters
  validateReportParams(fromDate, toDate) {
    // Returns error object or empty object
  }

  // Download report
  async downloadReport(params, onUnauthorized) {
    // Triggers file download
  }

  // Get/set preferences
  getReportPreferences() {
    // Returns saved preferences
  }
}
```

## Complete Example

See [example-usage.jsx](./example-usage.jsx) for a complete working example with:
- Form state management
- Date range inputs
- Status filter select
- Submit handler with validation
- Success/error handling
- Recent downloads integration
- Navigation callbacks

## Migration from Legacy Pattern

### Before (Manual Layout):

```jsx
<div className="container">
  <nav>...</nav>
  <Card>
    <div className="header">...</div>
    <div className="body">
      {showSuccess && <Alert />}
      {errors && <Alert />}
      <form>...</form>
    </div>
  </Card>
  <Card>Recent Downloads</Card>
</div>
```

### After (Using EntityReportDetail):

```jsx
<EntityReportDetail
  reportTitle="..."
  reportDescription="..."
  icon={Icon}
  showSuccess={showSuccess}
  errors={errors}
  recentDownloads={downloads}
>
  <form>...</form>
</EntityReportDetail>
```

## Related Components

- `EntityListPage` - For entity list pages
- `EntityUpdatePage` - For entity update pages
- `SearchCriteriaPage` - For search criteria pages
- `Breadcrumb` - Used internally for navigation
- `Alert` - Used internally for messages

## Browser Support

Supports all modern browsers. Uses:
- CSS Grid for responsive layouts
- Flexbox for internal alignment
- CSS transitions for hover effects
