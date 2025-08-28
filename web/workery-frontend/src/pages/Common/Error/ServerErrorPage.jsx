// File Path: monorepo/web/workery-frontend/src/pages/Common/Error/ServerErrorPage.jsx
// Enhanced Server Error Page with Modern UI matching Login/404 Page design

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Card, Button } from "../../../components/UI";
import {
  HomeIcon,
  ArrowPathIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function ServerErrorPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div>
      <style>
        {`
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

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-up {
            animation: slide-up 0.5s ease-out;
          }

          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          .animate-pulse-slow {
            animation: pulse-slow 3s infinite;
          }

          /* Error code styling */
          .error-code-gradient {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }

          /* Desktop-specific fixes */
          @media (min-width: 1024px) {
            .desktop-button-fix {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.5rem !important;
              white-space: nowrap !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50">
        {/* Animated background blobs - using warmer colors for error state */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-orange-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-red-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-yellow-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-4">
          <div className="w-full max-w-lg">
            {/* Logo */}
            <div className="text-center mb-4 lg:mb-5 animate-fade-in">
              <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-2xl shadow-lg">
                <img
                  src="/img/workery-logo.jpeg"
                  alt="Workery"
                  className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                />
              </div>
            </div>

            {/* Main Card */}
            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl animate-slide-up p-6 lg:p-8 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-red-100 to-orange-100 p-4 lg:p-5 rounded-full">
                    <div className="relative">
                      <ServerStackIcon className="h-12 w-12 lg:h-16 lg:w-16 text-red-600" />
                      <WrenchScrewdriverIcon className="absolute -bottom-1 -right-1 h-6 w-6 lg:h-8 lg:w-8 text-orange-600 bg-white rounded-full p-1 animate-spin-slow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Code */}
              <h1 className="text-6xl lg:text-7xl font-bold mb-3 error-code-gradient">
                500
              </h1>

              {/* Error Message */}
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                Server Error
              </h2>

              <p className="text-gray-600 mb-5 max-w-md mx-auto text-sm lg:text-base">
                Something went wrong on our end. Our team has been notified and
                is working to fix the issue. Please try again in a few moments.
              </p>

              {/* Status Message */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-5">
                <div className="flex items-center justify-center text-sm text-orange-800">
                  <div className="animate-pulse-slow flex items-center">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Our engineers are investigating the issue
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 sm:justify-center">
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  className="group w-full sm:w-auto px-5 py-2.5 desktop-button-fix"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-180" />
                  <span>Try Again</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="group w-full sm:w-auto px-5 py-2.5 desktop-button-fix"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  <span>Go to Homepage</span>
                </Button>
              </div>

              {/* Additional Links */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Need immediate assistance?
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <Link
                    to="/status"
                    className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    System Status
                  </Link>
                  <Link
                    to="/support"
                    className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    Contact Support
                  </Link>
                  <a
                    href="mailto:support@workery.ca"
                    className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center mt-5 px-4">
              <p className="text-xs text-gray-500">
                Error Reference: {new Date().getTime()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                © 2024 Over 55 (London) Inc. All rights reserved.
              </p>
              <div className="mt-2 space-x-4">
                <Link
                  to="/privacy"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerErrorPage;
