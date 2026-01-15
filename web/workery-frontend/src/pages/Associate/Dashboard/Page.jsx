// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Breadcrumb,
  Alert,
  Button,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../components/UIX";
import {
  HomeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

function AssociateDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: "Associate Dashboard", icon: HomeIcon }]}
        />

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HomeIcon className="w-8 h-8 mr-3 text-gray-700" />
            Associate Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Select an option below to get started.
          </p>
        </div>

        {/* Optional Alert for Important Messages */}
        <Alert type="info" className="mb-6">
          <strong>Reminder:</strong> Please ensure your insurance documents are
          up to date. Visit your profile to review your documents.
        </Alert>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  My Work Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <BriefcaseIcon className="w-10 h-10 text-blue-500" />
            </div>
            <Link
              to="/a/orders"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-4"
            >
              View Orders →
            </Link>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Active Jobs
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <WrenchScrewdriverIcon className="w-10 h-10 text-green-500" />
            </div>
            <Link
              to="/a/orders"
              className="inline-flex items-center text-sm text-green-600 hover:text-green-800 mt-4"
            >
              Manage Jobs →
            </Link>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  My Clients
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-purple-500" />
            </div>
            <Link
              to="/a/clients"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mt-4"
            >
              View Clients →
            </Link>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Pending Invoices
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <CreditCardIcon className="w-10 h-10 text-amber-500" />
            </div>
            <Link
              to="/a/financials"
              className="inline-flex items-center text-sm text-amber-600 hover:text-amber-800 mt-4"
            >
              View Financials →
            </Link>
          </div>
        </div>

        {/* Main Navigation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Work Management Section */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BriefcaseIcon className="w-5 h-5 mr-2" />
                Work Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/a/orders"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        My Work Orders
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage your assigned work orders
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/schedule"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Schedule</h3>
                      <p className="text-sm text-gray-600">
                        View your upcoming appointments
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/time-tracking"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <ClockIcon className="w-6 h-6 text-purple-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Time Tracking
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your work hours and activities
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Financial Section */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Financial Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/a/financials"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <CreditCardIcon className="w-6 h-6 text-amber-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        My Financials
                      </h3>
                      <p className="text-sm text-gray-600">
                        View invoices and payment history
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/earnings"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <ChartBarIcon className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Earnings Report
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your earnings and performance
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/tax-documents"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <DocumentChartBarIcon className="w-6 h-6 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Tax Documents
                      </h3>
                      <p className="text-sm text-gray-600">
                        Access your tax-related documents
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Client & Account Management Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Client Management Section */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Client Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/a/clients"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <UserGroupIcon className="w-6 h-6 text-purple-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Clients</h3>
                      <p className="text-sm text-gray-600">
                        Manage your client relationships
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/client-feedback"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Client Feedback
                      </h3>
                      <p className="text-sm text-gray-600">
                        View ratings and reviews
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Account & Support Section */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Account & Support
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/a/profile"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <UserCircleIcon className="w-6 h-6 text-indigo-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Profile</h3>
                      <p className="text-sm text-gray-600">
                        Update your personal information
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/documents"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-6 h-6 text-gray-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        My Documents
                      </h3>
                      <p className="text-sm text-gray-600">
                        Insurance, certifications, and more
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>

                <Link
                  to="/a/help"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-teal-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Help & Support
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get assistance and resources
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/a/notifications"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BellIcon className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  View system notifications
                </p>
              </Link>

              <Link
                to="/a/availability"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CalendarDaysIcon className="w-6 h-6 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">
                  Set Availability
                </h3>
                <p className="text-sm text-gray-600">
                  Update your work availability
                </p>
              </Link>

              <Link
                to="/a/reports"
                className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <ChartBarIcon className="w-6 h-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">View Reports</h3>
                <p className="text-sm text-gray-600">
                  Access performance reports
                </p>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AssociateDashboardPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AssociateDashboardPage />
    </UIXThemeProvider>
  );
}

export default AssociateDashboardPageWithProvider;
