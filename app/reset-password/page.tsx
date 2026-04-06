import { Suspense } from "react";
import ResetPasswordPage from "@/components/reset-password";

function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

export default ResetPasswordPageWrapper;
