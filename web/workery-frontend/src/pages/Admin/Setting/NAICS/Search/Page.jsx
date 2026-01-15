// File Path: web/workery-frontend/src/pages/Admin/Setting/NAICS/Search/Page.jsx
// @uix-page: SettingNAICSSearchPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import {
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  HashtagIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  PageHeader,
  FormCard,
  Input,
  Alert,
  SearchCriteriaPage,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../components/UIX";

function SettingNAICSSearchPage() {
  return (
    <UIXThemeProvider>
      <SettingNAICSSearchPageContent />
    </UIXThemeProvider>
  );
}

const SettingNAICSSearchPageContent = memo(
  function SettingNAICSSearchPageContent() {
    const navigate = useNavigate();
    const { getThemeClasses } = useUIXTheme();

    // Component states
    const [errors, setErrors] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [actualSearchText, setActualSearchText] = useState("");
    const [code, setCode] = useState("");
    const [industryTitle, setIndustryTitle] = useState("");

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
        linkText: getThemeClasses("text-primary"),
        linkHover: getThemeClasses("text-primary-hover"),
        textMuted: getThemeClasses("text-muted"),
        textPrimary: getThemeClasses("text-primary"),
        accentText: getThemeClasses("text-accent"),
        badgeActiveBg: getThemeClasses("badge-active-bg"),
        badgeActiveText: getThemeClasses("badge-active-text"),
        badgeInactiveBg: getThemeClasses("badge-inactive-bg"),
        badgeInactiveText: getThemeClasses("badge-inactive-text"),
        loadingSpinner: getThemeClasses("loading-spinner"),
        errorText: getThemeClasses("text-error"),
        errorBg: getThemeClasses("bg-error-light"),
        errorBorder: getThemeClasses("border-error"),
        focusRing: getThemeClasses("focus-ring"),
        // Decorative blobs
        blobPrimary: getThemeClasses("blob-primary") || "bg-purple-200",
        blobSecondary: getThemeClasses("blob-secondary") || "bg-yellow-200",
        blobTertiary: getThemeClasses("blob-tertiary") || "bg-pink-200",
      }),
      [getThemeClasses],
    );

    // Event handling
    const onSubmitClick = useCallback(
      (e) => {
        e.preventDefault();
        if (import.meta.env.DEV) {
          console.log("onSubmitClick: Beginning...");
        }

        if (actualSearchText === "" && code === "" && industryTitle === "") {
          setErrors({
            message: "Please enter a value in at least one search field",
          });
          return;
        }

        // Clear errors
        setErrors({});

        // Build search URL with parameters
        const searchParams = new URLSearchParams();
        if (actualSearchText.trim()) {
          searchParams.append("q", actualSearchText.trim());
        }
        if (code.trim()) {
          searchParams.append("c", code.trim());
        }
        if (industryTitle.trim()) {
          searchParams.append("it", industryTitle.trim());
        }

        const searchURL = `/admin/settings/naics/search-result?${searchParams.toString()}`;
        navigate(searchURL);
      },
      [actualSearchText, code, industryTitle, navigate],
    );

    const handleClearForm = useCallback(() => {
      setActualSearchText("");
      setCode("");
      setIndustryTitle("");
      setErrors({});
    }, []);

    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter") {
          onSubmitClick(e);
        }
      },
      [onSubmitClick],
    );

    useEffect(() => {
      // Scroll to top when component mounts
      window.scrollTo(0, 0);

      // Reset loading state on mount
      setIsFetching(false);
    }, []);

    return (
      <div className={`min-h-screen ${themeClasses.bgGradientPrimary}`}>
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.blobPrimary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.blobSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.blobTertiary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                to: "/admin/dashboard",
                icon: HomeIcon,
              },
              {
                label: "Settings",
                to: "/admin/settings",
                icon: Cog6ToothIcon,
              },
              {
                label: "NAICS Search",
                icon: BuildingOffice2Icon,
                isActive: true,
              },
            ]}
          />

          {/* Page Header */}
          <PageHeader
            icon={BuildingOffice2Icon}
            title="NAICS"
            subtitle="North American Industry Classification System"
            backButton={{
              text: "Back to Settings",
              onClick: () => navigate("/admin/settings"),
            }}
          />

          {/* Error Alert */}
          {errors.message && (
            <Alert
              type="error"
              enhanced={true}
              dismissible={true}
              onDismiss={() => setErrors({})}
            >
              {errors.message}
            </Alert>
          )}

          {/* Main Search Form */}
          <FormCard
            title="Search NAICS Database"
            icon={MagnifyingGlassIcon}
            maxWidth="5xl"
          >
              <SearchCriteriaPage
                basicSearchFields={
                  <div>
                    <Input
                      type="text"
                      name="actualSearchText"
                      value={actualSearchText}
                      onChange={(value) => setActualSearchText(value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter industry, business type, or keywords..."
                      size="lg"
                      className="text-base sm:text-lg"
                      label="Search across all NAICS fields including titles, descriptions, and activities"
                      labelIcon={MagnifyingGlassIcon}
                    />
                  </div>
                }
                advancedSearchFields={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="NAICS Code"
                      name="code"
                      value={code}
                      onChange={(value) => setCode(value)}
                      placeholder="e.g., 541710"
                      helperText="Enter specific 6-digit NAICS code"
                      icon={HashtagIcon}
                      size="lg"
                    />
                    <Input
                      label="Industry Title"
                      name="industryTitle"
                      value={industryTitle}
                      onChange={(value) => setIndustryTitle(value)}
                      placeholder="e.g., Software Publishers"
                      helperText="Search by industry classification name"
                      icon={DocumentTextIcon}
                      size="lg"
                    />
                  </div>
                }
                onSubmit={onSubmitClick}
                onClear={handleClearForm}
                isSubmitting={isFetching}
                submitButtonText="Search NAICS"
                clearButtonText="Clear"
                submitIcon={MagnifyingGlassIcon}
                clearIcon={XMarkIcon}
              />
          </FormCard>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  },
);

SettingNAICSSearchPageContent.displayName = "SettingNAICSSearchPageContent";

export default SettingNAICSSearchPage;
