"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "destructive" | "default";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "destructive",
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-background w-full max-w-sm rounded-[2rem] border border-border/50 shadow-2xl p-6 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`p-4 rounded-full ${variant === "destructive" ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"}`}
              >
                <AlertTriangle className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 hover:bg-muted"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant={variant}
                  className={`flex-1 rounded-2xl h-12 font-bold ${variant === "destructive" ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
