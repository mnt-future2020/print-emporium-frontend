import RedesignedContactPage from "@/components/contact-page-new";
import { constructMetadata } from "@/lib/metadata-utils";
import { Suspense } from "react";

export async function generateMetadata() {
  return await constructMetadata("contact");
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RedesignedContactPage />
    </Suspense>
  );
}
