"use client";

import { PageHeader } from "@/components/page-header";
import { PayoutManualForm } from "../_components/payout-manual-form";

export default function PayoutManualPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        backHref="/payouts"
        eyebrow="Back to payouts"
        title="Create Manual Payout"
        description="Select a workspace and submit a manual payout request."
      />
      <PayoutManualForm />
    </div>
  );
}
