import RedesignedAboutPage from "@/components/redesigned-about";
import { constructMetadata } from "@/lib/metadata-utils";

export async function generateMetadata() {
  return await constructMetadata('about');
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <RedesignedAboutPage />
    </div>
  );
}
