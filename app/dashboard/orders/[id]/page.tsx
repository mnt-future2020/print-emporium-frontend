"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/orders?open=${id}`);
  }, [id, router]);

  return null;
}
