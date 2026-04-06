"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Mail, RefreshCw } from "lucide-react";
import { use403Error } from "@/hooks/use-403-error";

export function AccessDeniedDisplay() {
  const { error, clearError } = use403Error();

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 w-full max-w-md"
        >
          <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 text-lg">
                    {error.title}
                  </h3>
                  <p className="text-red-700 text-sm mt-1">{error.message}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 shrink-0 ml-2"
                aria-label="Close error message"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Suggestions */}
            {error.suggestions && error.suggestions.length > 0 && (
              <div className="px-6 py-4 bg-red-50 border-t border-red-100">
                <p className="text-sm font-medium text-red-900 mb-3">
                  What you can do:
                </p>
                <ul className="space-y-2">
                  {error.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-red-800"
                    >
                      <span className="text-red-600 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-white border-t border-red-100 flex gap-2">
              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Re-login
              </button>

              <a
                href="/contact"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
            </div>

            {/* Timestamp (for debugging) */}
            <div className="px-6 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
              Error ID: {new Date(error.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
