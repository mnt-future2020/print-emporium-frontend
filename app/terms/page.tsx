import { constructMetadata } from "@/lib/metadata-utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata() {
  return await constructMetadata("terms");
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-12">
          Last updated: March 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using The Print Emporium&apos;s website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Print Emporium provides printing services including but not limited to document printing, business cards, banners, photo printing, and binding services. We reserve the right to modify, suspend, or discontinue any service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Orders and Payments</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>All orders are subject to acceptance and availability.</li>
              <li>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>Payment must be completed before or at the time of order delivery/pickup, depending on the payment method selected.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. File Upload and Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are responsible for ensuring that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You have the right to print the content you upload.</li>
              <li>Uploaded files do not infringe on any third-party copyrights, trademarks, or intellectual property rights.</li>
              <li>Content does not contain illegal, offensive, or harmful material.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We reserve the right to refuse to print any content that violates these terms or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Quality and Reprints</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive for the highest print quality. If you receive a defective order due to our error (e.g., misprints, wrong specifications), we will reprint the order at no additional cost or issue a refund. Claims must be reported within 24 hours of receiving the order with supporting photographs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cancellations and Refunds</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Orders may be cancelled before production begins for a full refund.</li>
              <li>Once an order is in production, cancellation may not be possible.</li>
              <li>Refunds for quality issues are processed within 5-7 business days.</li>
              <li>Custom quotation orders are non-refundable once production has started.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Delivery</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estimated delivery times are provided as guidelines and are not guaranteed. We are not liable for delays caused by factors beyond our control, including but not limited to weather, transportation issues, or unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Print Emporium&apos;s liability is limited to the value of the order in question. We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to update these Terms of Service at any time. Continued use of our services after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
