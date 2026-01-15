# DataList Component

A reusable data listing component based on the SkillSet list page design with search, filters, table display, and pagination. Features wider layout (max-w-5xl) and uses existing UIX components.

## Features

- ✅ **Complete data listing solution** - Search, filters, table, pagination all in one
- ✅ **Based on SkillSet design** - Matches the proven SkillSet list page styling
- ✅ **Wider layout** - Uses max-w-5xl for larger data tables
- ✅ **UIX component integration** - Uses SearchFilter, Button, Alert, and other UIX components
- ✅ **Flexible column configuration** - Supports links, actions, custom rendering
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Loading and error states** - Built-in loading spinners and error handling
- ✅ **Empty state support** - Customizable empty state with actions
- ✅ **Style guide compliant** - Red gradient headers and consistent styling

## Basic Usage

```jsx
import { DataList } from "../../../components/UIX";

function MyListPage() {
  const columns = [
    {
      header: "Name",
      accessor: "name",
      type: "link",
      linkPath: "/admin/items/:id/detail"
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => <StatusBadge status={value} />
    },
    {
      header: "Actions",
      align: "right",
      type: "action",
      actionConfig: {
        label: "View",
        linkPath: "/admin/items/:id/detail"
      }
    }
  ];

  return (
    <DataList
      data={items}
      columns={columns}
      isLoading={isLoading}
      searchFilter={{
        searchTerm,
        tempSearchTerm,
        onSearchTermChange: setTempSearchTerm,
        onSearch: handleSearch,
        searchPlaceholder: "Search items...",
        statusOptions: [
          { value: "", label: "All Statuses" },
          { value: "1", label: "Active" },
          { value: "2", label: "Inactive" }
        ],
        statusFilter,
        onStatusFilterChange: setStatusFilter,
        // ... other search filter props
      }}
      pagination={{
        currentPage,
        totalCount,
        hasNextPage,
        onPageChange: setCurrentPage
      }}
    />
  );
}
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Array of data items to display |
| `columns` | Array | `[]` | Column configuration array |
| `isLoading` | boolean | `false` | Loading state |
| `errors` | Object | `{}` | Error state object |
| `successMessage` | string | `""` | Success message to display |
| `onSuccessMessageClose` | function | `() => {}` | Success message close handler |
| `className` | string | `""` | Additional CSS classes |

### Search Filter Props (searchFilter object)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchTerm` | string | `""` | Current search term |
| `tempSearchTerm` | string | `""` | Temporary search term (before search) |
| `onSearchTermChange` | function | `() => {}` | Search term change handler |
| `onSearch` | function | `() => {}` | Search execution handler |
| `searchPlaceholder` | string | `"Search..."` | Search input placeholder |
| `statusOptions` | Array | `[]` | Status filter options |
| `statusFilter` | string | `""` | Current status filter |
| `onStatusFilterChange` | function | `() => {}` | Status filter change handler |
| `sortOptions` | Array | `[]` | Sort options |
| `sortValue` | string | `""` | Current sort value |
| `onSortChange` | function | `() => {}` | Sort change handler |
| `pageSizeOptions` | Array | `[10, 25, 50, 100]` | Page size options |
| `pageSize` | number | `25` | Current page size |
| `onPageSizeChange` | function | `() => {}` | Page size change handler |
| `onClearFilters` | function | `() => {}` | Clear filters handler |
| `onRefresh` | function | `() => {}` | Refresh data handler |

### Pagination Props (pagination object)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | number | `1` | Current page number |
| `totalCount` | number | `0` | Total number of items |
| `hasNextPage` | boolean | `false` | Whether there's a next page |
| `onPageChange` | function | `() => {}` | Page change handler |

### Empty State Props (emptyState object)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | Component | `PlusIcon` | Icon component for empty state |
| `title` | string | `"No Items Found"` | Empty state title |
| `description` | string | `"No items have been created yet."` | Empty state description |
| `actionLabel` | string | `"Create First Item"` | Action button label |
| `onActionClick` | function | `() => {}` | Action button click handler |
| `showAction` | boolean | `true` | Whether to show action button |

## Column Configuration

### Basic Column

```jsx
{
  header: "Column Title",
  accessor: "dataProperty", // or key, field, dataIndex
  align: "left" // "left", "center", "right"
}
```

### Link Column

```jsx
{
  header: "Name",
  accessor: "name",
  type: "link",
  linkPath: "/admin/items/:id/detail" // :id will be replaced with item.id
}
```

### Action Column

```jsx
{
  header: "Actions",
  align: "right",
  type: "action",
  actionConfig: {
    label: "View",
    linkPath: "/admin/items/:id/detail",
    className: "custom-action-styles" // optional
  }
}
```

### Custom Render Column

```jsx
{
  header: "Status",
  accessor: "status",
  render: (value, item, rowIndex) => {
    return <StatusBadge status={value} />;
  }
}
```

## Complete Example

```jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DataList, Breadcrumb, PageHeader } from "../../../components/UIX";
import { useItemManager } from "../../../services/Services";

function ItemListPage() {
  const itemManager = useItemManager();
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Column configuration
  const columns = [
    {
      header: "Name",
      accessor: "name",
      type: "link",
      linkPath: "/admin/items/:id/detail"
    },
    {
      header: "Category",
      accessor: "category"
    },
    {
      header: "Status",
      accessor: "status",
      render: (status) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {status === 1 ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      header: "Actions",
      align: "right",
      type: "action",
      actionConfig: {
        label: "View",
        linkPath: "/admin/items/:id/detail"
      }
    }
  ];

  // Search filter configuration
  const searchFilterConfig = {
    searchTerm,
    tempSearchTerm,
    onSearchTermChange: setTempSearchTerm,
    onSearch: () => {
      setSearchTerm(tempSearchTerm);
      setCurrentPage(1);
    },
    searchPlaceholder: "Search by name or category...",
    statusOptions: [
      { value: "", label: "All Statuses" },
      { value: "1", label: "Active" },
      { value: "2", label: "Inactive" }
    ],
    statusFilter,
    onStatusFilterChange: (value) => {
      setStatusFilter(value);
      setCurrentPage(1);
    },
    sortOptions: [
      { value: "name,ASC", label: "Name (A-Z)" },
      { value: "name,DESC", label: "Name (Z-A)" },
      { value: "category,ASC", label: "Category (A-Z)" },
      { value: "created_at,DESC", label: "Created Date (Newest)" }
    ],
    sortValue: `${sortBy},${sortOrder}`,
    onSortChange: (value) => {
      const [field, order] = value.split(",");
      setSortBy(field);
      setSortOrder(order);
      setCurrentPage(1);
    },
    pageSize,
    onPageSizeChange: (value) => {
      setPageSize(value);
      setCurrentPage(1);
    },
    onClearFilters: () => {
      setTempSearchTerm("");
      setSearchTerm("");
      setStatusFilter("");
      setSortBy("name");
      setSortOrder("ASC");
      setCurrentPage(1);
    },
    onRefresh: () => fetchItems({ forceRefresh: true })
  };

  // Pagination configuration
  const paginationConfig = {
    currentPage,
    totalCount,
    hasNextPage,
    onPageChange: setCurrentPage
  };

  // Empty state configuration
  const emptyStateConfig = {
    icon: PlusIcon,
    title: "No Items Found",
    description: "No items have been created yet.",
    actionLabel: "Create First Item",
    onActionClick: () => navigate("/admin/items/create")
  };

  // Fetch data function
  const fetchItems = async (params = {}) => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await itemManager.getItems({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
        ...params
      });

      setItems(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
    } catch (error) {
      setErrors({ fetch: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on dependency changes
  useEffect(() => {
    fetchItems();
  }, [currentPage, pageSize, searchTerm, statusFilter, sortBy, sortOrder]);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Items', isActive: true }
      ]} />

      {/* Page Header */}
      <PageHeader
        title="Items"
        subtitle="Manage your items"
        actions={[
          <Button
            key="create"
            variant="primary"
            onClick={() => navigate("/admin/items/create")}
            icon={PlusIcon}
          >
            New Item
          </Button>
        ]}
      />

      {/* Data List */}
      <DataList
        data={items}
        columns={columns}
        isLoading={isLoading}
        errors={errors}
        successMessage={successMessage}
        onSuccessMessageClose={() => setSuccessMessage("")}
        searchFilter={searchFilterConfig}
        pagination={paginationConfig}
        emptyState={emptyStateConfig}
      />
    </div>
  );
}

export default ItemListPage;
```

## Use Cases

1. **Admin Settings Pages** - All settings list pages (Skills, Certifications, etc.)
2. **Staff Management** - Employee lists, role assignments
3. **Data Management** - Any paginated data listing with search and filters
4. **Report Views** - Displaying tabular report data
5. **Content Management** - Managing any collection of items

## Design Features

- **Wider Layout**: Uses `max-w-5xl` instead of the typical `max-w-4xl`
- **Red Gradient Headers**: Consistent with app theme (#8a1622 to #dc2626)
- **Animated Background**: Subtle blob animations matching app style
- **Hover Effects**: Row highlighting and smooth transitions
- **Responsive Pagination**: Different layouts for mobile vs desktop
- **Loading States**: Integrated loading spinners
- **Empty States**: Customizable empty state with call-to-action

This component provides a complete, reusable solution for any data listing needs in the application while maintaining consistency with the established design patterns.