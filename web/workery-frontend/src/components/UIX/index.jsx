// File: src/components/UIX/index.js
// Central export file for all UIX components
/* eslint-disable react-refresh/only-export-components */
//
// ⚠️ IMPORTANT: Circular Dependency Prevention
// Components exported from this index should NOT import other components from this index.
// If a component needs to use another UIX component, import it directly from its file:
//
// ✅ Correct: import Button from "../Button/Button";
// ❌ Incorrect: import { Button } from "../"; (can cause circular dependency)
//
// This prevents circular dependency issues where components can't be resolved at runtime.

// ActionCard Components (New - for action grids with standardized styling)
export { default as ActionCard } from "./ActionCard/ActionCard";
export { default as DeleteActionCard } from "./ActionCard/DeleteActionCard";

// Alert Components (Enhanced with modern styling)
export { default as Alert, Notification, Message } from "./Alert/Alert";

// Avatar Component (Theme-aware profile pictures)
export { default as Avatar } from "./Avatar/Avatar";

// Badge Component
export { default as Badge } from "./Badge/Badge";

// Breadcrumb Component (Enhanced with modern styling)
export { default as Breadcrumb } from "./Breadcrumb/Breadcrumb";

// Button Component (Enhanced with gradient support)
export { default as Button } from "./Button/Button";

// CreateButton Component (Green-themed for creation actions)
export { default as CreateButton } from "./CreateButton/CreateButton";

// CreateFirstButton Component (Green-themed for empty state creation actions)
export { default as CreateFirstButton } from "./CreateFirstButton/CreateFirstButton";

// BackButton Component (Flexible back navigation button with custom labels)
export { default as BackButton } from "./BackButton/BackButton";

// BackToListButton Component (Standardized back navigation button)
export { default as BackToListButton } from "./BackToListButton/BackToListButton";

// BackToDetailsButton Component (Standardized back to details navigation button)
export { default as BackToDetailsButton } from "./BackToDetailsButton/BackToDetailsButton";

// EditButton Component (Standardized edit action button)
export { default as EditButton } from "./EditButton/EditButton";

// DeleteButton Component (Standardized delete action button)
export { default as DeleteButton } from "./DeleteButton/DeleteButton";

// DetailPageIcon Component (Blue-themed icon for detail page headers)
export { default as DetailPageIcon } from "./DetailPageIcon/DetailPageIcon";

// DetailCard Component (Blue-themed card for detail page information display)
export { default as DetailCard } from "./DetailCard/DetailCard";

// Card Components
export { default as Card, Panel, Box } from "./Card/Card";

// ChangePasswordPage Component (Reusable change password page for any entity)
export { default as ChangePasswordPage } from "./ChangePasswordPage";

// DeleteConfirmationCard Component (New - for standardized delete confirmation flows)
export { default as DeleteConfirmationCard } from "./DeleteConfirmationCard/DeleteConfirmationCard";

// DetailLiteView Component (New - for reusable entity summary views)
export { default as DetailLiteView } from "./DetailLiteView/DetailLiteView";

// DetailFullView Component (New - for reusable comprehensive entity detail views)
export { default as DetailFullView } from "./DetailFullView/DetailFullView";

// EntityUpdatePage Component (New - for reusable entity update pages)
export { default as EntityUpdatePage } from "./EntityUpdatePage/EntityUpdatePage";

// EntityListPage Component (New - for reusable entity list pages)
export { default as EntityListPage } from "./EntityListPage/EntityListPage";

// EntityReportDetail Component (New - for reusable report detail pages)
export { default as EntityReportDetail } from "./EntityReportDetail/EntityReportDetail";

// EntityActionConfirmationPage Component (New - for reusable entity action confirmation pages like archive, delete, ban, etc.)
export { default as EntityActionConfirmationPage } from "./EntityActionConfirmationPage/EntityActionConfirmationPage";

// EntityAction* Page Components (Facade wrappers for common entity actions with sensible defaults)
export { EntityActionArchivePage } from "../business/views";
export { EntityActionUnarchivePage } from "../business/views";
export { EntityActionDeletePage } from "../business/views";
export { EntityActionBanPage } from "../business/views";
export { EntityActionUnbanPage } from "../business/views";
export { EntityAction2FAPage } from "../business/views";
export { EntityActionAvatarPage } from "../business/views";

// EntityActionDowngradePage Component (New - for entity type downgrade actions)
export { default as EntityActionDowngradePage } from "./EntityActionDowngradePage/EntityActionDowngradePage";

// EntityActionUpgradePage Component (New - for entity type upgrade actions with form)
export { default as EntityActionUpgradePage } from "./EntityActionUpgradePage/EntityActionUpgradePage";

// Checkbox Component
export { default as Checkbox, CheckBox } from "./Checkbox/Checkbox";

// CommentsView Component (New - for reusable entity comment management)
export { default as CommentsView } from "./CommentsView/CommentsView";

// AttachmentsView Component (New - for reusable entity attachment management)
export { default as AttachmentsView } from "./AttachmentsView/AttachmentsView";

// ContactLink Component (Theme-aware email and phone links)
export { default as ContactLink } from "./ContactLink/ContactLink";

// CheckboxGroup Component (New - for role configuration patterns)
export { default as CheckboxGroup } from "./CheckboxGroup/CheckboxGroup";

// Date Component
export { default as DateInput, Date } from "./Date/Date";

// Enhanced DatePicker Component
export { default as DatePicker } from "./DatePicker/DatePicker";

// DataField Component (New - for simple read-only label/value fields)
export { default as DataField } from "./DataField/DataField";

// DataList Component (New - for reusable data listing with search, filters, and pagination)
export { default as DataList } from "./DataList/DataList";

// DateTime Component
export { default as DateTime, DateTimePicker } from "./DateTime/DateTime";

// Divider Component
export { default as Divider } from "./Divider/Divider";

// EmptyState Component
export { default as EmptyState } from "./EmptyState/EmptyState";

// EmptyStateIcon Component (Blue-themed icon for empty states)
export { default as EmptyStateIcon } from "./EmptyStateIcon/EmptyStateIcon";

// Form Components
export { default as FormGroup } from "./Form/FormGroup";
export { default as FormRow } from "./Form/FormRow";
export { default as FormSection } from "./Form/FormSection";

// FormCard Component (New - for standardized form layouts)
export { default as FormCard } from "./FormCard/FormCard";

// InfoField Component (New - for displaying labeled information fields)
export { default as InfoField } from "./InfoField/InfoField";

// InfoCard Component (New - modern card for entity information with gradient header and flexible content layout)
export { default as InfoCard } from "./InfoCard/InfoCard";

// Input Component (Enhanced with character counts and modern styling)
export { default as Input } from "./Input/Input";

// OTPInput Component (New - specialized input for 6-digit OTP codes with mobile optimizations)
export { default as OTPInput } from "./OTPInput/OTPInput";

// BackupCodeDisplay Component (New - specialized component for displaying 2FA backup codes with copy functionality)
export { default as BackupCodeDisplay } from "./BackupCodeDisplay/BackupCodeDisplay";

// Loading Components
export {
  default as Loading,
  Loader,
  LoadingIndicator,
} from "./Loading/Loading";
export { default as LoadingOverlay } from "./Loading/LoadingOverlay";
export { default as Spinner, LoadingSpinner } from "./Loading/Spinner";

// Modal Component
export { default as Modal } from "./Modal/Modal";

// MultiSelect Component
export { default as MultiSelect } from "./MultiSelect/MultiSelect";

// NotFound Component (404 error page with theme support)
export { default as NotFound } from "./NotFound/NotFound";

// ServerError Component (500 error page with theme support)
export { default as ServerError } from "./ServerError/ServerError";

// PageHeader Component (New - for standardized page headers)
export { default as PageHeader } from "./PageHeader/PageHeader";

// Pagination Component
export { default as Pagination } from "./Pagination/Pagination";

// ProgressBar Component
export { default as ProgressBar } from "./ProgressBar/ProgressBar";

// Radio Component
export { default as Radio, RadioButton } from "./Radio/Radio";

// RadioGroup Component (New - for grouped radio button selections)
export { default as RadioGroup } from "./RadioGroup/RadioGroup";

// SectionHeader Component (New - for card section headers with optional icon)
export { default as SectionHeader } from "./SectionHeader/SectionHeader";

// SearchFilter Component (New - for standardized search and filter widgets)
export { default as SearchFilter } from "./SearchFilter/SearchFilter";

// SearchForm Component (Generic - for reusable search criteria forms)
export { default as SearchForm } from "./StaffSearchForm/StaffSearchForm";

// SearchCriteriaPage Component (New - for complete search criteria pages)
export { default as SearchCriteriaPage } from "./SearchCriteriaPage/SearchCriteriaPage";

// SearchCriteriaPageComponent Component (New - for reusable search criteria pages with full layout)
export { default as SearchCriteriaPageComponent } from "./SearchCriteriaPageComponent/SearchCriteriaPageComponent";

// SearchCriteriaPills Component (New - for displaying search criteria as pills/badges)
export { default as SearchCriteriaPills } from "./SearchCriteriaPills/SearchCriteriaPills";

// SearchStepPage Component (New - for wizard search steps)
export { default as SearchStepPage } from "./SearchStepPage/SearchStepPage";

// SearchResultsPage Component (New - for reusable search results pages)
export { default as SearchResultsPage } from "./SearchResultsPage/SearchResultsPage";

// StepWizard Component (New - for multi-step wizards)
export { default as StepWizard } from "./StepWizard/StepWizard";

// WizardSearchStep Component (New - for reusable wizard search steps)
export { default as WizardSearchStep } from "./WizardSearchStep/WizardSearchStep";

// WizardAddOrSearchStep Component (prioritizes Add action over search)
export { default as WizardAddOrSearchStep } from "./WizardAddOrSearchStep/WizardAddOrSearchStep";

// Staff-specific wizard components (New - for staff workflows)
export { default as StaffSearchForm } from "./StaffSearchForm/StaffSearchForm";
export { default as StaffWizardSearchResults } from "./StaffWizardSearchResults/StaffWizardSearchResults";
// WizardFormStep - Generic wizard form step component (formerly StaffWizardFormStep)
export { default as WizardFormStep, StaffWizardFormStep } from "./WizardFormStep/WizardFormStep";

// Generic wizard search results component (New - for reusable wizard search results)
export { default as WizardSearchResults } from "./WizardSearchResults/WizardSearchResults";

// Address form components (New - for reusable address collection)
export { default as AddressFormCard } from "./AddressFormCard/AddressFormCard";
export { default as ShippingAddressFormCard } from "./ShippingAddressFormCard/ShippingAddressFormCard";
export { default as AddressFormStep } from "./AddressFormStep/AddressFormStep";

// AddressDisplay Component (Theme-aware address display with Google Maps integration)
export { default as AddressDisplay } from "./AddressDisplay/AddressDisplay";

// Select Component
export { default as Select } from "./Select/Select";

// SelectButton Component (New - theme-aware selection button for tables and lists)
export { default as SelectButton } from "./SelectButton/SelectButton";

// SelectionCard Component (New - for option selection in wizards)
export { default as SelectionCard } from "./SelectionCard/SelectionCard";

// CardSelectionGrid Component (New - for 2-card and 4-card selection layouts)
export { default as CardSelectionGrid } from "./CardSelectionGrid/CardSelectionGrid";

// SettingsCard Component (New - for settings dashboard cards)
export { default as SettingsCard } from "./SettingsCard/SettingsCard";

// StatCard Component (New - for displaying statistics/metrics in styled boxes)
export { default as StatCard } from "./StatCard/StatCard";

// StatusBadge Component (New - for theme-aware entity status display)
export { default as StatusBadge, STATUS_CODES } from "./StatusBadge/StatusBadge";

// Tag Component (New - for inline reference tags and labels)
export { default as Tag } from "./Tag/Tag";

// TypeBadge Component (New - for theme-aware entity type display)
export { default as TypeBadge } from "./TypeBadge/TypeBadge";

// IconText Component (New - for theme-aware icon + text display)
export { default as IconText } from "./IconText/IconText";

// Text Component (New - for themed text with consistent typography)
export { default as Text } from "./Text/Text";

// SettingsGrid Component (New - for settings dashboard layout)
export { default as SettingsGrid } from "./SettingsGrid/SettingsGrid";

// SystemInfo Component (New - for displaying system metadata)
export { default as SystemInfo } from "./SystemInfo/SystemInfo";

// Table Component
export { default as Table } from "./Table/Table";

// Tabs Component
export { default as Tabs } from "./Tabs/Tabs";

// TagInput Component (New - for autocomplete tag input with pill-shaped tags)
export { default as TagInput } from "./TagInput/TagInput";

// SkillSetTagPicker Component (New - dropdown multi-select with removable tags)
export { default as SkillSetTagPicker } from "./SkillSetTagPicker/SkillSetTagPicker";

// Textarea Component
export { default as Textarea, TextArea } from "./Textarea/Textarea";

// Tooltip Component
export { default as Tooltip } from "./Tooltip/Tooltip";

// UrgencyBadge Component (New - for urgency indicators with icon and color)
export { default as UrgencyBadge } from "./UrgencyBadge/UrgencyBadge";

// ViewButton Component (New - for standardized view action buttons in list pages)
export { default as ViewButton } from "./ViewButton/ViewButton";

// Theme System (New - self-contained theming for UIX components)
export {
  UIXThemeProvider,
  useUIXTheme,
  useUIXThemeClasses,
  withUIXTheme,
  UIX_THEMES,
  DEFAULT_UIX_THEME
} from "./themes/useUIXTheme.jsx";

// Mobile Optimizations Hook (New - iOS/Android viewport and keyboard handling)
export { default as useMobileOptimizations } from "./hooks/useMobileOptimizations.jsx";

// ThemeTester Component (Development tool for testing theme system)
export { default as ThemeTester } from "./ThemeTester/ThemeTester";

// ThemeSelector Component (User-facing theme selection component)
export { default as ThemeSelector } from "./ThemeSelector/ThemeSelector";

// UniversalListPage Component (New - for reusable entity list pages with conference-style layout)
export { default as UniversalListPage } from "./UniversalListPage/UniversalListPage";

// EntityAttachmentListPage Component (New - for reusable entity attachment list pages)
export { default as EntityAttachmentListPage } from "./EntityAttachmentListPage/EntityAttachmentListPage";

// LegacyAttachmentListPage Component (Fallback - preserved from original implementation)
export { default as LegacyAttachmentListPage } from "./LegacyAttachmentListPage/LegacyAttachmentListPage";

// EntityAttachmentDetailPage Component (New - for reusable entity attachment detail pages)
export { default as EntityAttachmentDetailPage } from "./EntityAttachmentDetailPage/EntityAttachmentDetailPage";

// EntityAttachmentUpdatePage Component (New - for reusable entity attachment update pages)
export { default as EntityAttachmentUpdatePage } from "./EntityAttachmentUpdatePage/EntityAttachmentUpdatePage";

// EntityCommentsPage Component (New - for reusable entity comments list pages)
export { default as EntityCommentsPage } from "./EntityCommentsPage/EntityCommentsPage";

// EntityEventContractListPage Component (New - for reusable event contract list pages)
export { default as EntityEventContractListPage } from "./EntityEventContractListPage/EntityEventContractListPage";

// EntityEventOrderListPage Component (New - for reusable event order list pages)
export { default as EntityEventOrderListPage } from "./EntityEventOrderListPage/EntityEventOrderListPage";

// EntityAttachmentAddPage Component (New - for reusable entity attachment add pages)
export { default as EntityAttachmentAddPage } from "./EntityAttachmentAddPage/EntityAttachmentAddPage";

// EntityAttachmentDeletePage Component (New - for reusable entity attachment delete pages)
export { default as EntityAttachmentDeletePage } from "./EntityAttachmentDeletePage/EntityAttachmentDeletePage";

// Root Page Components (New - for Root admin section pages)
export { default as RootDashboardPage } from "./RootDashboardPage/RootDashboardPage";
export { default as RootTenantListPage } from "./RootTenantListPage/RootTenantListPage";
export { default as RootTenantDetailPage } from "./RootTenantDetailPage/RootTenantDetailPage";
export { default as RootTenantAddPage } from "./RootTenantAddPage/RootTenantAddPage";
export { default as RootTenantUpdatePage } from "./RootTenantUpdatePage/RootTenantUpdatePage";
