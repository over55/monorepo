// monorepo/web/workery-frontend/src/pages/Admin/Help/Page.jsx

import React from "react";
import { Link } from "react-router";
import { Card, Breadcrumb, Button } from "../../../components/UI";
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Admin Help Page
 * Displays contact information and support details
 */
function AdminHelpPage() {
  // Contact information constants
  const CONTACT_INFO = {
    email: "support@workery.ca",
    phone: "+1(519)438-1111",
    location: {
      text: "London, ON Canada",
      mapUrl:
        "https://www.google.com/maps/place/Over+55+Skills+at+Work/@42.982378,-81.2639086,17z/data=!3m2!4b1!5s0x882ef1f1bda3c3d5:0xb6c19797240aed91!4m6!3m5!1s0x882ef1f195805b65:0xc74817a331752923!8m2!3d42.982378!4d-81.261339!16s%2Fg%2F1thq1brc?entry=ttu",
    },
    website: {
      text: "Official Website",
      url: "https://skillsatwork.ca",
    },
  };

  /**
   * Format phone number for display
   */
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const areaCode = cleaned.substring(1, 4);
      const firstPart = cleaned.substring(4, 7);
      const secondPart = cleaned.substring(7, 11);
      return `+1 (${areaCode}) ${firstPart}-${secondPart}`;
    }
    return phone;
  };

  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "You can reset your password by clicking on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password.",
    },
    {
      question: "How do I add a new customer?",
      answer:
        "Navigate to Customers → Add New Customer from the main menu. Fill in the required information and click Submit.",
    },
    {
      question: "How do I generate reports?",
      answer:
        "Go to the Reports section from the main menu. Select the type of report you need and specify the date range. Click Generate to create your report.",
    },
    {
      question: "How do I manage staff permissions?",
      answer:
        "Access the Staff section, select the staff member you want to modify, and click on 'Edit Permissions' to adjust their access levels.",
    },
    {
      question: "How do I create a new work order?",
      answer:
        "Go to Orders → Add New Order. Search for or create a customer, then fill in the job details, assign an associate if needed, and submit the order.",
    },
    {
      question: "How do I track task progress?",
      answer:
        "Navigate to the Tasks section to view all pending tasks. Click on any task to see its details and update its status.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              label: "Dashboard",
              href: "/admin/dashboard",
              icon: ChartBarIcon,
            },
            {
              label: "Help",
              icon: QuestionMarkCircleIcon,
            },
          ]}
        />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <QuestionMarkCircleIcon className="w-8 h-8 mr-3 text-gray-700" />
            Help & Support
          </h1>
          <p className="mt-2 text-gray-600">
            Get assistance and find answers to your questions
          </p>
        </div>

        {/* Contact Information Card */}
        <Card className="mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              If you have any questions or need assistance, don't hesitate to
              reach out to us!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <PhoneIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {formatPhoneNumber(CONTACT_INFO.phone)}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <a
                    href={CONTACT_INFO.location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors inline-flex items-center"
                  >
                    {CONTACT_INFO.location.text}
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Website</p>
                  <a
                    href={CONTACT_INFO.website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors inline-flex items-center"
                  >
                    {CONTACT_INFO.website.text}
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Support Hours and Emergency Contact Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Support Hours */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Support Hours
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Our support team is available:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">
                    Monday - Friday
                  </span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM EST</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Saturday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-medium">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> We observe all Canadian statutory
                  holidays.
                </p>
              </div>
            </div>
          </Card>

          {/* Emergency Support */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                Emergency Support
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                For urgent technical issues outside of business hours:
              </p>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <a
                  href="mailto:emergency@workery.ca"
                  className="text-red-700 hover:text-red-900 font-medium text-lg hover:underline inline-flex items-center"
                >
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  emergency@workery.ca
                </a>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> Emergency support is only for
                  critical system failures that prevent normal business
                  operations. Response times may vary.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Links Section */}
        <Card className="mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Quick Links</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/dashboard"
                className="group p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <ChartBarIcon className="w-6 h-6 text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Return to main dashboard
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>

              <Link
                to="/admin/settings"
                className="group p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Cog6ToothIcon className="w-6 h-6 text-green-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      System configuration
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
                </div>
              </Link>

              <Link
                to="/admin/reports"
                className="group p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <DocumentChartBarIcon className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Reports</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View system reports
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors flex items-center justify-between">
                    <span className="font-medium text-gray-900 pr-2">
                      {faq.question}
                    </span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Card>

        {/* Back to Top Button - Optional */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 rotate-90" />
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminHelpPage;
