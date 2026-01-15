// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Badge,
  Button,
  Alert,
  EmptyState,
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../components/UIX";
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AssociateDashboardPage() {
  // Placeholder data - in real app this would come from API
  const stats = {
    activeOrders: 3,
    completedThisMonth: 12,
    totalClients: 8,
    pendingInvoices: 2,
  };

  const recentOrders = [
    {
      id: "W-1234",
      client: "John Smith",
      service: "Plumbing Repair",
      status: "in_progress",
      date: "Today, 2:00 PM",
    },
    {
      id: "W-1235",
      client: "Sarah Johnson",
      service: "Electrical Installation",
      status: "scheduled",
      date: "Tomorrow, 10:00 AM",
    },
    {
      id: "W-1236",
      client: "Mike Davis",
      service: "HVAC Maintenance",
      status: "completed",
      date: "Yesterday, 3:00 PM",
    },
  ];

  const upcomingSchedule = [
    {
      date: "Today",
      time: "2:00 PM - 4:00 PM",
      client: "John Smith",
      address: "123 Main St, London, ON",
    },
    {
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      client: "Sarah Johnson",
      address: "456 Oak Ave, London, ON",
    },
    {
      date: "Friday",
      time: "9:00 AM - 11:00 AM",
      client: "Emily Wilson",
      address: "789 Pine Rd, London, ON",
    },
  ];

  const notifications = [
    {
      type: "info",
      message: "New work order available in your area",
      time: "2 hours ago",
    },
    {
      type: "success",
      message: "Payment received for Order #W-1230",
      time: "Yesterday",
    },
    {
      type: "warning",
      message: "Insurance document expires in 30 days",
      time: "3 days ago",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="info">In Progress</Badge>;
      case "scheduled":
        return <Badge variant="warning">Scheduled</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "warning":
        return <ExclamationCircleIcon className="h-5 w-5 text-amber-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Associate", href: "/a/dashboard", icon: BriefcaseIcon },
          { label: "Dashboard" },
        ]}
        className="mb-6"
      />

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, Associate!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your work orders today.
        </p>
      </div>

      {/* Alert for Important Updates */}
      <Alert type="info" className="mb-6">
        <strong>System Update:</strong> New features have been added to help you
        manage your work orders more efficiently. Check out the help section for
        more details.
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeOrders}
              </p>
              <p className="text-sm text-green-600 mt-1">2 urgent</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completedThisMonth}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +20% from last month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalClients}
              </p>
              <p className="text-sm text-gray-500 mt-1">Active relationships</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Invoices</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingInvoices}
              </p>
              <p className="text-sm text-amber-600 mt-1">$3,450 total</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Work Orders */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Work Orders
              </h2>
              <Link
                to="/a/orders"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            {order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-gray-700 mb-1">
                          <span className="font-medium">Client:</span>{" "}
                          {order.client}
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                          <span className="font-medium">Service:</span>{" "}
                          {order.service}
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {order.date}
                        </p>
                      </div>
                      <Link
                        to={`/a/order/${order.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent orders"
                description="Your recent work orders will appear here"
                icon={BriefcaseIcon}
              />
            )}
          </Card>

          {/* Upcoming Schedule */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Schedule
              </h2>
              <Link
                to="/a/calendar"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View calendar
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSchedule.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {schedule.date}
                    </p>
                    <p className="text-gray-600 text-sm">{schedule.time}</p>
                    <p className="text-gray-700 text-sm mt-1">
                      {schedule.client}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {schedule.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                to="/a/orders"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">View My Work Orders</span>
              </Link>
              <Link
                to="/a/financials"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Check Financials</span>
              </Link>
              <Link
                to="/a/clients"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <UserGroupIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">My Clients</span>
              </Link>
              <Link
                to="/a/documents"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Documents</span>
              </Link>
              <Link
                to="/a/reports"
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <ChartBarIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">View Reports</span>
              </Link>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notifications
            </h2>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/a/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-2"
              >
                View all notifications
              </Link>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Access resources and support to help you succeed.
            </p>
            <Link to="/a/help">
              <Button variant="primary" className="w-full">
                Visit Help Center
              </Button>
            </Link>
          </Card>
        </div>
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
