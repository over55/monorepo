// File Path: web/workery-frontend/src/components/Layout/Sidebar.jsx
// Enhanced Responsive Sidebar Component with iOS and Android Optimizations
//
// iOS Optimizations Include:
// - Safe area support for devices with notch/home indicator
// - iOS Safari viewport height fixes
// - Hardware acceleration for smooth animations
// - iOS keyboard handling and viewport adjustments
// - Touch interaction improvements (tap highlight, callout prevention)
// - iOS-specific scrolling behavior (-webkit-overflow-scrolling: touch)
// - Gesture prevention (zoom, pinch) for better UX
// - iOS focus ring styling for accessibility
// - Body scroll prevention when sidebar is open
//
// Android Optimizations Include:
// - Android device and version detection
// - Chrome address bar hiding compensation
// - Android keyboard handling with smooth transitions
// - Android back button integration for sidebar navigation
// - Material Design ripple effects and touch feedback
// - Android navigation bar and status bar awareness
// - PWA (Progressive Web App) specific optimizations
// - Overscroll behavior control for better UX
// - Android-specific viewport handling (--android-vh)
// - Material Design focus ring styling (#1976D2)
// - Hardware acceleration optimized for Android Chrome

import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { Modal, Button } from "../UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  FireIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Sidebar({ isOpen, onClose, isMobile, taskItemActiveCount = 0 }) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  // iOS detection and optimization states
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [hasNotch, setHasNotch] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Android detection and optimization states
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [androidVersion, setAndroidVersion] = useState(0);
  const [hasNavigationBar, setHasNavigationBar] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Enhanced device detection
  const getDeviceType = useCallback(() => {
    const width = screenSize.width;
    if (width < 640) return "mobile";
    if (width < 1024) return "tablet";
    if (width < 1366) return "small-laptop";
    return "desktop";
  }, [screenSize.width]);

  const deviceType = getDeviceType();
  const isTablet = deviceType === "tablet";
  const isSmallLaptop = deviceType === "small-laptop";
  const isMobileDevice = deviceType === "mobile";
  const shouldShowMobileLayout =
    isMobileDevice || (isTablet && screenSize.width < 768);

  // iOS Detection and Setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // Detect Safari
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);

    // Detect devices with notch/safe areas
    const hasNotchDevice =
      iOS &&
      (window.screen.height === 812 || // iPhone X, XS
        window.screen.height === 896 || // iPhone XR, XS Max, 11, 11 Pro Max
        window.screen.height === 844 || // iPhone 12, 12 Pro, 13, 13 Pro, 14
        window.screen.height === 926 || // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
        window.screen.height === 932 || // iPhone 14 Pro Max
        window.screen.height === 852 || // iPhone 14 Pro
        window.screen.height === 1024); // iPad Pro with Face ID
    setHasNotch(hasNotchDevice);

    // iOS Viewport fixes
    if (iOS) {
      // Prevent zoom on double tap
      document.addEventListener("gesturestart", (e) => e.preventDefault());
      document.addEventListener("gesturechange", (e) => e.preventDefault());
      document.addEventListener("gestureend", (e) => e.preventDefault());

      // Fix iOS Safari viewport height issues
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };
      setVH();
      window.addEventListener("orientationchange", () => {
        setTimeout(setVH, 500); // Delay to account for iOS animation
      });

      // Handle iOS keyboard
      const handleKeyboard = () => {
        const initialHeight = window.innerHeight;
        const threshold = initialHeight * 0.75;

        const checkKeyboard = () => {
          const currentHeight = window.visualViewport
            ? window.visualViewport.height
            : window.innerHeight;
          setKeyboardVisible(currentHeight < threshold);
        };

        if (window.visualViewport) {
          window.visualViewport.addEventListener("resize", checkKeyboard);
          return () =>
            window.visualViewport.removeEventListener("resize", checkKeyboard);
        } else {
          // Fallback for older iOS versions
          window.addEventListener("resize", checkKeyboard);
          return () => window.removeEventListener("resize", checkKeyboard);
        }
      };

      const cleanup = handleKeyboard();
      return cleanup;
    }
  }, []);

  // Android Detection and Setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    if (android) {
      // Detect Chrome on Android
      const chrome =
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor);
      setIsChrome(chrome);

      // Get Android version
      const match = navigator.userAgent.match(/Android\s([0-9\.]*)/);
      const version = match ? parseFloat(match[1]) : 0;
      setAndroidVersion(version);

      // Detect if app is running in standalone mode (PWA)
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);

      // Detect navigation bar (rough heuristic)
      const hasNavBar = window.screen.height - window.innerHeight > 100;
      setHasNavigationBar(hasNavBar);

      // Android viewport fixes
      const setAndroidVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--android-vh", `${vh}px`);
      };
      setAndroidVH();

      // Handle Android keyboard and orientation changes
      const handleAndroidResize = () => {
        const initialHeight = window.innerHeight;
        const threshold = initialHeight * 0.75;

        const checkAndroidKeyboard = () => {
          const currentHeight = window.innerHeight;
          setKeyboardVisible(currentHeight < threshold);
          setAndroidVH();
        };

        window.addEventListener("resize", checkAndroidKeyboard);
        window.addEventListener("orientationchange", () => {
          setTimeout(() => {
            setAndroidVH();
            checkAndroidKeyboard();
          }, 300); // Android orientation change delay
        });

        return () => {
          window.removeEventListener("resize", checkAndroidKeyboard);
          window.removeEventListener("orientationchange", checkAndroidKeyboard);
        };
      };

      // Android back button handling
      const handleAndroidBack = () => {
        const handleBackButton = (event) => {
          if (shouldShowMobileLayout && isOpen) {
            event.preventDefault();
            onClose();
            return false;
          }
        };

        // Listen for Android back button
        window.addEventListener("popstate", handleBackButton);

        // Add history state when sidebar opens
        if (shouldShowMobileLayout && isOpen) {
          window.history.pushState({ sidebarOpen: true }, "");
        }

        return () => {
          window.removeEventListener("popstate", handleBackButton);
        };
      };

      const resizeCleanup = handleAndroidResize();
      const backCleanup = handleAndroidBack();

      // Android Chrome address bar handling
      if (chrome) {
        const handleChromeAddressBar = () => {
          // Force layout recalculation when Chrome address bar hides/shows
          const forceReflow = () => {
            document.body.style.height = window.innerHeight + "px";
            setTimeout(() => {
              document.body.style.height = "";
            }, 100);
          };

          let timeout;
          const debouncedReflow = () => {
            clearTimeout(timeout);
            timeout = setTimeout(forceReflow, 150);
          };

          window.addEventListener("resize", debouncedReflow);
          return () => {
            window.removeEventListener("resize", debouncedReflow);
            clearTimeout(timeout);
          };
        };

        const chromeCleanup = handleChromeAddressBar();

        return () => {
          resizeCleanup();
          backCleanup();
          chromeCleanup();
        };
      }

      return () => {
        resizeCleanup();
        backCleanup();
      };
    }
  }, [shouldShowMobileLayout, isOpen, onClose]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // iOS and Android body scroll prevention
  useEffect(() => {
    if ((isIOS || isAndroid) && shouldShowMobileLayout && isOpen) {
      // Prevent body scroll on mobile when sidebar is open
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;

      if (isIOS) {
        // iOS-specific scroll prevention
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
      } else if (isAndroid) {
        // Android-specific scroll prevention (less aggressive)
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";
        document.body.style.touchAction = "none";
      }

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.width = "";
        document.body.style.height = "";
        if (isAndroid) {
          document.body.style.overscrollBehavior = "";
          document.body.style.touchAction = "";
        }
      };
    }
  }, [isIOS, isAndroid, shouldShowMobileLayout, isOpen]);

  // Auto-collapse on small laptops to save space
  useEffect(() => {
    if (isSmallLaptop && !shouldShowMobileLayout) {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState === null) {
        setIsCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
      }
    }
  }, [isSmallLaptop, shouldShowMobileLayout]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const handleLinkClick = () => {
    if (shouldShowMobileLayout) {
      onClose();
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      // Close the modal first
      setShowLogoutWarning(false);

      // Navigate to the logout page which handles everything
      navigate("/logout");
    } catch (error) {
      console.error("Logout navigation failed:", error);
      // Fallback - try direct navigation
      window.location.href = "/logout";
    }
  };

  const toggleCollapse = () => {
    if (shouldShowMobileLayout) {
      onClose();
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      localStorage.setItem("sidebarCollapsed", newCollapsedState.toString());
      window.dispatchEvent(new Event("sidebarCollapsedChanged"));
    }
  };

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true" && !shouldShowMobileLayout) {
      setIsCollapsed(true);
    }
  }, [shouldShowMobileLayout]);

  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      if (!authManager.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        if (mounted) {
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Paths where sidebar should not be shown
  const hiddenPaths = [
    "/",
    "/register",
    "/register-successful",
    "/index",
    "/login",
    "/login/2fa",
    "/login/2fa/step-1",
    "/login/2fa/step-2",
    "/login/2fa/step-3",
    "/login/2fa/step-3/backup-code",
    "/login/2fa/backup-code",
    "/login/2fa/backup-code-recovery",
    "/logout",
    "/verify",
    "/forgot-password",
    "/password-reset",
    "/root/dashboard",
    "/root/tenants",
    "/root/tenant",
    "/terms",
    "/privacy",
  ];

  const shouldHideSidebar = hiddenPaths.some(
    (path) =>
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path)),
  );

  if (shouldHideSidebar || isLoading || !currentUser) {
    return null;
  }

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  // Icon mapping for menu items
  const iconMap = {
    Dashboard: HomeIcon,
    Tasks: ClipboardDocumentListIcon,
    Customers: UserGroupIcon,
    Clients: UserGroupIcon,
    Associates: UserIcon,
    "Work Orders": WrenchScrewdriverIcon,
    "My Service Requests": WrenchScrewdriverIcon,
    "My Work Orders": WrenchScrewdriverIcon,
    "Skill Sets": AcademicCapIcon,
    Incidents: FireIcon,
    "Job History": ChartBarIcon,
    Comments: ChatBubbleLeftRightIcon,
    Financials: CreditCardIcon,
    "My Financials": CreditCardIcon,
    Reports: DocumentChartBarIcon,
    Staff: UsersIcon,
    Settings: Cog6ToothIcon,
    "My Associates": UserIcon,
    "My Clients": UserGroupIcon,
    "Find Work": MagnifyingGlassIcon,
    "My Documents": DocumentTextIcon,
    "My Advisor": UsersIcon,
    "Learning & Goals": StarIcon,
    Help: QuestionMarkCircleIcon,
    "My Profile": UserCircleIcon,
    "Sign Off": ArrowRightOnRectangleIcon,
  };

  // Get menu items based on user role
  const getMenuSections = () => {
    const sections = [];

    const userRole = currentUser.role || currentUser.roleId;
    if (
      [EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
        userRole,
      )
    ) {
      sections.push({
        label: "Staff",
        items: [
          { path: "/admin/dashboard", label: "Dashboard" },
          {
            path: "/admin/tasks",
            label: "Tasks",
            badge: taskItemActiveCount > 0 ? taskItemActiveCount : null,
          },
          { path: "/admin/customers", label: "Clients" },
          { path: "/admin/associates", label: "Associates" },
          { path: "/admin/orders", label: "Work Orders" },
          { path: "/admin/skill-sets", label: "Skill Sets" },
          { path: "/admin/incidents", label: "Incidents" },
          { path: "/admin/job-history", label: "Job History" },
          { path: "/admin/all-comments", label: "Comments" },
        ],
      });

      sections.push({
        label: "Administration",
        items: [
          { path: "/admin/financials", label: "Financials" },
          { path: "/admin/reports", label: "Reports" },
          { path: "/admin/staff", label: "Staff" },
          { path: "/admin/settings", label: "Settings" },
        ],
      });
    }

    // Customer menu
    if (userRole === CUSTOMER_ROLE_ID) {
      sections.push({
        label: "Member",
        items: [
          { path: "/c/dashboard", label: "Dashboard" },
          { path: "/c/orders", label: "My Service Requests" },
          { path: "/c/financials", label: "My Financials" },
          { path: "/c/associates", label: "My Associates" },
        ],
      });
    }

    // Associate menu
    if (userRole === ASSOCIATE_ROLE_ID) {
      sections.push({
        label: "Associate",
        items: [
          { path: "/a/dashboard", label: "Dashboard" },
          { path: "/a/orders", label: "My Work Orders" },
          { path: "/a/financials", label: "My Financials" },
          { path: "/a/clients", label: "My Clients" },
        ],
      });
    }

    // Job Seeker menu
    if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
      sections.push({
        label: "Job Seeker",
        items: [
          { path: "/js/dashboard", label: "Dashboard" },
          { path: "/js/find-work", label: "Find Work" },
          { path: "/js/documents", label: "My Documents" },
          { path: "/js/advisor", label: "My Advisor" },
          { path: "/js/learning", label: "Learning & Goals" },
        ],
      });
    }

    return sections;
  };

  const menuSections = getMenuSections();

  // Determine sidebar width and positioning based on device
  const getSidebarClasses = () => {
    let baseClasses = `fixed left-0 bg-gray-900 text-gray-200 transform transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden custom-scrollbar`;

    // Add iOS-specific classes
    if (isIOS) {
      baseClasses += ` ios-optimized ios-safari-fix ios-accelerated ios-smooth-transition`;
    }

    // Add Android-specific classes
    if (isAndroid) {
      baseClasses += ` android-optimized android-accelerated android-smooth-scroll android-no-overscroll`;
      if (isStandalone) {
        baseClasses += ` android-pwa`;
      }
      if (isChrome) {
        baseClasses += ` android-chrome-fix`;
      }
      if (hasNavigationBar) {
        baseClasses += ` android-nav-bar`;
      }
    }

    // Handle positioning and height for different platforms
    let topPosition = "top-[60px]";
    let heightCalc = "h-[calc(100vh-60px)]";

    if (isIOS && hasNotch) {
      topPosition = "top-[calc(60px+env(safe-area-inset-top))]";
      heightCalc =
        "h-[calc(100vh-60px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]";
    } else if (isAndroid && keyboardVisible) {
      heightCalc = "android-keyboard-active";
    } else if (keyboardVisible && isIOS) {
      heightCalc = "ios-keyboard-active";
    }

    baseClasses += ` ${topPosition} ${heightCalc}`;

    if (shouldShowMobileLayout) {
      return `${baseClasses} w-72 z-[1000] ${isOpen ? "translate-x-0" : "-translate-x-full"}`;
    }

    if (isTablet) {
      return `${baseClasses} w-56 z-[1000] translate-x-0`;
    }

    if (isSmallLaptop) {
      const width = isCollapsed ? "w-16" : "w-52";
      return `${baseClasses} ${width} z-[1000] translate-x-0`;
    }

    // Desktop
    const width = isCollapsed ? "w-16" : "w-64";
    return `${baseClasses} ${width} z-[1000] translate-x-0`;
  };

  // Responsive padding and spacing
  const getContentPadding = () => {
    if (isMobileDevice) return "px-4 py-3";
    if (isTablet) return "px-3 py-2";
    if (isCollapsed && !shouldShowMobileLayout) return "px-2";
    return "px-3 py-2";
  };

  const getItemPadding = () => {
    if (isMobileDevice) return "px-4 py-2.5";
    if (isTablet) return "px-3 py-2";
    if (isCollapsed && !shouldShowMobileLayout)
      return "px-2 py-2 justify-center";
    return "px-3 py-2";
  };

  const shouldShowLabels = !isCollapsed || shouldShowMobileLayout;
  const shouldShowBadges = shouldShowLabels;

  return (
    <>
      {/* Overlay for mobile and tablet */}
      {isOpen && shouldShowMobileLayout && (
        <div
          className={`
            fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[999] touch-none
            ${
              isIOS && hasNotch
                ? "top-[calc(60px+env(safe-area-inset-top))]"
                : "top-[60px]"
            }
            ${isIOS ? "ios-optimized" : ""}
            ${isAndroid ? "android-optimized android-no-overscroll" : ""}
          `}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <style jsx>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }

        /* iOS-specific optimizations */
        .ios-optimized {
          -webkit-overflow-scrolling: touch;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        /* iOS Safari specific fixes */
        .ios-safari-fix {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Prevent iOS bounce scrolling on body */
        .ios-no-bounce {
          position: fixed;
          overflow: hidden;
        }

        /* iOS safe area support */
        .ios-safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        /* iOS keyboard adjustments */
        .ios-keyboard-active {
          height: calc(var(--vh, 1vh) * 100) !important;
        }

        /* Touch improvements for iOS */
        @supports (-webkit-touch-callout: none) {
          .sidebar-item {
            min-height: 44px;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            -webkit-touch-callout: none;
          }

          .sidebar-item:active {
            background-color: rgba(255, 255, 255, 0.1);
            transition: background-color 0.1s ease;
          }
        }

        /* iOS hardware acceleration */
        .ios-accelerated {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: transform;
        }

        /* iOS smooth transitions */
        .ios-smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* iOS focus styles */
        .ios-focus-ring:focus-visible {
          outline: 2px solid #007aff;
          outline-offset: 2px;
        }
      `}</style>

      <div className={getSidebarClasses()}>
        {/* Header with collapse button */}
        <div className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700 mb-3">
          <div className={`${isMobileDevice ? "p-3" : "p-2"}`}>
            <button
              onClick={toggleCollapse}
              className={`
                ${isMobileDevice ? "p-2" : "p-1.5"}
                rounded hover:bg-gray-800 transition-colors w-full flex
                ${isMobileDevice ? "justify-between items-center" : "justify-center"}
                sidebar-item
                ${isIOS ? "ios-focus-ring" : ""}
                ${isAndroid ? "android-focus-ring android-ripple android-touch-item" : ""}
              `}
              title={
                shouldShowMobileLayout
                  ? "Close menu"
                  : isCollapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
              }
            >
              {isMobileDevice ? (
                <>
                  <span className="text-white font-medium">Menu</span>
                  <XMarkIcon className="h-6 w-6 text-white" />
                </>
              ) : (
                <Bars3Icon className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Content */}
        <div className={getContentPadding()}>
          {/* Menu Sections */}
          {menuSections.map((section, index) => (
            <div
              key={index}
              className={`${shouldShowMobileLayout ? "mb-6" : "mb-5"}`}
            >
              {/* Section label */}
              {shouldShowLabels && (
                <div
                  className={`
                  text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2
                  ${isMobileDevice ? "px-4" : "px-3"}
                `}
                >
                  {section.label}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item, idx) => {
                  const Icon = iconMap[item.label] || HomeIcon;
                  const isActive = isActivePath(item.path);

                  return (
                    <li key={idx}>
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        title={!shouldShowLabels ? item.label : ""}
                        className={`
                          relative flex items-center ${shouldShowLabels ? "justify-between" : "justify-center"}
                          ${getItemPadding()} rounded-md
                          ${isMobileDevice ? "text-base" : "text-sm"}
                          transition-colors duration-200 sidebar-item
                          ${isIOS ? "ios-focus-ring" : ""}
                          ${isAndroid ? "android-focus-ring android-ripple android-touch-item" : ""}
                          ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <div
                          className={`flex items-center ${shouldShowLabels ? "" : "justify-center w-full"}`}
                        >
                          <Icon
                            className={`
                              ${isMobileDevice ? "h-6 w-6" : "h-5 w-5"}
                              ${shouldShowLabels ? (isMobileDevice ? "mr-4" : "mr-3") : ""}
                              flex-shrink-0
                            `}
                          />
                          {shouldShowLabels && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>
                        {item.badge && shouldShowBadges && (
                          <span
                            className={`
                            bg-green-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0
                            ${isMobileDevice ? "text-sm px-2.5 py-1" : ""}
                          `}
                          >
                            ({item.badge})
                          </span>
                        )}
                        {/* Show badge as dot when collapsed */}
                        {item.badge && !shouldShowBadges && (
                          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-green-600" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Account Menu */}
          <div className={`${isMobileDevice ? "mb-6" : "mb-5"}`}>
            {shouldShowLabels && (
              <div
                className={`
                text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2
                ${isMobileDevice ? "px-4" : "px-3"}
              `}
              >
                Account
              </div>
            )}
            <ul className="space-y-1">
              <li>
                <Link
                  to="/help"
                  onClick={handleLinkClick}
                  title={!shouldShowLabels ? "Help" : ""}
                  className={`
                    flex items-center ${getItemPadding()} rounded-md
                    ${isMobileDevice ? "text-base" : "text-sm"}
                    transition-colors duration-200 sidebar-item
                    ${isIOS ? "ios-focus-ring" : ""}
                    ${isAndroid ? "android-focus-ring android-ripple android-touch-item" : ""}
                    ${
                      isActivePath("/help")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <QuestionMarkCircleIcon
                    className={`
                      ${isMobileDevice ? "h-6 w-6" : "h-5 w-5"}
                      ${shouldShowLabels ? (isMobileDevice ? "mr-4" : "mr-3") : ""}
                      flex-shrink-0
                    `}
                  />
                  {shouldShowLabels && <span>Help</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={handleLinkClick}
                  title={!shouldShowLabels ? "My Profile" : ""}
                  className={`
                    flex items-center ${getItemPadding()} rounded-md
                    ${isMobileDevice ? "text-base" : "text-sm"}
                    transition-colors duration-200 sidebar-item
                    ${isIOS ? "ios-focus-ring" : ""}
                    ${isAndroid ? "android-focus-ring android-ripple android-touch-item" : ""}
                    ${
                      isActivePath("/account")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <UserCircleIcon
                    className={`
                      ${isMobileDevice ? "h-6 w-6" : "h-5 w-5"}
                      ${shouldShowLabels ? (isMobileDevice ? "mr-4" : "mr-3") : ""}
                      flex-shrink-0
                    `}
                  />
                  {shouldShowLabels && <span>My Profile</span>}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowLogoutWarning(true)}
                  title={!shouldShowLabels ? "Sign Off" : ""}
                  className={`
                    flex items-center w-full text-left ${getItemPadding()} rounded-md
                    ${isMobileDevice ? "text-base" : "text-sm"}
                    text-gray-300 hover:bg-gray-800 hover:text-white
                    transition-colors duration-200 sidebar-item
                    ${isIOS ? "ios-focus-ring" : ""}
                    ${isAndroid ? "android-focus-ring android-ripple android-touch-item" : ""}
                  `}
                >
                  <ArrowRightOnRectangleIcon
                    className={`
                      ${isMobileDevice ? "h-6 w-6" : "h-5 w-5"}
                      ${shouldShowLabels ? (isMobileDevice ? "mr-4" : "mr-3") : ""}
                      flex-shrink-0
                    `}
                  />
                  {shouldShowLabels && <span>Sign Off</span>}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutWarning}
        onClose={() => setShowLogoutWarning(false)}
        title="Are you sure?"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutWarning(false)}
            >
              No
            </Button>
            <Button variant="success" onClick={handleLogoutConfirm}>
              Yes
            </Button>
          </div>
        }
      >
        <p>
          You are about to log out of the system and you'll need to log in again
          next time. Are you sure you want to continue?
        </p>
      </Modal>
    </>
  );
}

export default Sidebar;
