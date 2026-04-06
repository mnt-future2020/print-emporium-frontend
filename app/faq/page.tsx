import { constructMetadata } from "@/lib/metadata-utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata() {
  return await constructMetadata("faq");
}

const faqs = [
  {
    question: "What types of printing services do you offer?",
    answer:
      "We offer a wide range of printing services including document printing, business cards, banners & posters, photo printing, binding services, and custom printing solutions. Visit our Services page for the complete list.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Simply browse our services, select the one you need, upload your files, configure your print options (paper size, print type, quantity, etc.), and proceed to checkout. You can also request a custom quote for specialized requirements.",
  },
  {
    question: "What file formats do you accept?",
    answer:
      "We accept most common file formats including PDF, DOCX, JPG, PNG, TIFF, and AI files. For best results, we recommend uploading high-resolution PDF files.",
  },
  {
    question: "How long does it take to complete an order?",
    answer:
      "Standard orders are typically completed within 1-2 business days. Rush orders and bulk orders may vary. You can track your order status in real-time from your account dashboard.",
  },
  {
    question: "Do you offer bulk order discounts?",
    answer:
      "Yes! We offer competitive pricing for bulk orders. Contact us directly for a custom quote on large quantity orders.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit/debit cards, net banking, and cash on delivery for local orders. All online payments are processed securely.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "Orders can be cancelled or modified before they enter the production stage. Once printing has started, cancellations may not be possible. Please contact us as soon as possible if you need changes.",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "Yes, we offer delivery services within Chennai. Delivery charges may vary based on location and order size. You can also pick up your order from our store.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "If there is a quality issue with your order, we will reprint it at no extra cost or issue a full refund. Please report any issues within 24 hours of receiving your order.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach us via our Contact page, email, phone, or WhatsApp. Our team is available during business hours to assist you with any queries.",
  },
];

export default function FAQPage() {
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
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Find answers to common questions about our printing services, orders,
          and policies.
        </p>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-muted/50 border border-border p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? Our team is happy to
            help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
