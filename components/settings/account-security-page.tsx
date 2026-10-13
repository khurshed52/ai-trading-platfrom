import { LegalDocumentsCard, SignedAgreementsCard } from "./legal-documents-card";
import { SecurityActionsCard } from "./security-actions-card";

export function AccountSecurityPage() {
  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-3xl font-extrabold text-slate-950">
          Settings
        </h1>
        <p className="mb-0 mt-1 text-sm text-slate-600">
          Manage your security and legal agreements.
        </p>
      </header>

      <SecurityActionsCard />
      <LegalDocumentsCard />
      <SignedAgreementsCard />
    </div>
  );
}
