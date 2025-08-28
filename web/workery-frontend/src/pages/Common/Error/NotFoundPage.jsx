// File Path: monorepo/web/workery-frontend/src/pages/Common/Error/NotFoundPage.jsx
// Enhanced 404 Page with Modern UI matching Login Page design

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Card, Button } from "../../../components/UI";
import {
  HomeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
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

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .animate-bounce-slow {
            animation: bounce 2s infinite;
          }

          /* Error code styling */
          .error-code-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-100 to-blue-100 p-4 lg:p-5 rounded-full">
                    <ExclamationTriangleIcon className="h-12 w-12 lg:h-16 lg:w-16 text-purple-600 animate-bounce-slow" />
                  </div>
                </div>
              </div>

              {/* Error Code */}
              <h1 className="text-6xl lg:text-7xl font-bold mb-3 error-code-gradient">
                404
              </h1>

              {/* Error Message */}
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                Page Not Found
              </h2>

              <p className="text-gray-600 mb-5 max-w-md mx-auto text-sm lg:text-base">
                Oops! The page you're looking for seems to have wandered off. It
                might have been moved, deleted, or perhaps it never existed.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 sm:justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate("/")}
                  className="group w-full sm:w-auto px-5 py-2.5 desktop-button-fix"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  <span>Go to Homepage</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="group w-full sm:w-auto px-5 py-2.5 desktop-button-fix"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  <span>Go Back</span>
                </Button>
              </div>

              {/* Additional Links */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Need help? Try these quick links:
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Register
                  </Link>
                  <Link
                    to="/support"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Support
                  </Link>
                  <Link
                    to="/contact"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center mt-5 px-4">
              <p className="text-xs text-gray-500">
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

export default NotFoundPage;
