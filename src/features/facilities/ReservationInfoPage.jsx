import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileQuestion,
  FileText,
  History,
  MapPin,
  PencilLine,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Modal";
import {
  documentBadgeClasses,
  formatDate,
  getReservationDateTime,
  reservationBadgeClasses,
} from "./facilityTypes";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "approval", label: "Approval" },
  { id: "activity", label: "Activity" },
];

export function ReservationInfoPage({
  reservation,
  facility,
  initialTab = "overview",
  onBack,
  onSelectTab,
  onSelectFacility,
  onOpenModal,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const activeTab = initialTab || "overview";

  if (!reservation) {
    return (
      <div className="space-y-6 pb-24">
        <BackButton onBack={onBack} />
        <EmptyState title="Reservation not found" body="The selected reservation is not available in local frontend state." />
      </div>
    );
  }

  const primaryAction = getPrimaryAction(reservation, onOpenModal);
  const PrimaryIcon = primaryAction.icon;
  const switchTab = (tabId) => onSelectTab?.(tabId);

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <BackButton onBack={onBack} />

      <header className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={reservation.status} className={reservationBadgeClasses[reservation.status]} />
              <Badge value={reservation.documentStatus} className={documentBadgeClasses[reservation.documentStatus] ?? "bg-slate-100 text-slate-600"} />
              <Badge value={reservation.requesterType} className="bg-slate-100 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{reservation.activityName}</h1>
              <p className="mt-2 text-[15px] font-medium text-brand-blue">{reservation.id} | {reservation.facilityName}</p>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">{reservation.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={CalendarCheck} label="Schedule" value={getReservationDateTime(reservation)} />
              <ProfileBadge icon={Users} label="Participants" value={String(reservation.participantCount)} />
              <ProfileBadge icon={Building2} label="Requester" value={reservation.organization} />
              <ProfileBadge icon={Clock3} label="Updated" value={formatDate(reservation.updatedAt)} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Reservation Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <PrimaryIcon className="h-4 w-4" />
                {primaryAction.label}
              </button>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectFacility(facility)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
                >
                  <MapPin className="h-4 w-4" />
                  Facility
                </button>
                <ActionMenu
                  label={`More actions for ${reservation.activityName}`}
                  open={openMenuId === "header"}
                  onToggle={() => setOpenMenuId((current) => (current === "header" ? null : "header"))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Upload Documents", icon: Upload, onClick: () => onOpenModal({ type: "document-upload", reservation }) },
                    { label: "Edit Reservation", icon: PencilLine, onClick: () => onOpenModal({ type: "reservation-form", mode: "edit", reservation }) },
                    { label: "Approve Request", icon: CheckCircle2, onClick: () => onOpenModal({ type: "review", action: "approve", reservation }) },
                    { label: "Reject Request", icon: XCircle, tone: "danger", onClick: () => onOpenModal({ type: "review", action: "reject", reservation }) },
                    { label: "Request Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "review", action: "request-documents", reservation }) },
                    { label: "Cancel Reservation", icon: Ban, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "cancel-reservation", reservation }) },
                    { label: "Mark Completed", icon: CheckCircle2, onClick: () => onOpenModal({ type: "confirm", action: "complete-reservation", reservation }) },
                    { label: "Mark No Show", icon: XCircle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "no-show-reservation", reservation }) },
                  ]}
                />
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="relative isolate overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="border-b border-border-subtle/70 pb-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                  activeTab === tab.id ? "bg-brand-blue text-white shadow-soft" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          {activeTab === "overview" && <OverviewTab reservation={reservation} facility={facility} onSelectFacility={onSelectFacility} />}
          {activeTab === "documents" && <DocumentsTab reservation={reservation} onOpenModal={onOpenModal} />}
          {activeTab === "approval" && <ApprovalTab reservation={reservation} onOpenModal={onOpenModal} />}
          {activeTab === "activity" && <ActivityTab reservation={reservation} />}
        </div>
      </section>
    </div>
  );
}

function OverviewTab({ reservation, facility, onSelectFacility }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <InfoTile label="Requester" value={reservation.requesterName} />
        <InfoTile label="Requester type" value={reservation.requesterType} />
        <InfoTile label="Organization" value={reservation.organization} />
        <InfoTile label="Use type" value={reservation.useType} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <DetailPanel title="Activity details" body={reservation.description} />
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Facility Details" description="Reserved athletics-managed space." />
          {facility ? (
            <button type="button" onClick={() => onSelectFacility(facility)} className="mt-4 w-full rounded-2xl border border-border-subtle/60 bg-white p-4 text-left transition-colors hover:bg-brand-blue-light">
              <p className="font-bold text-slate-950">{facility.name}</p>
              <p className="mt-1 text-[12px] text-brand-blue">{facility.type} | {facility.location}</p>
              <p className="mt-2 text-[12px] text-slate-500">{facility.capacity} capacity | {facility.operatingHours}</p>
            </button>
          ) : (
            <EmptyState title="Facility unavailable" body="The linked facility could not be found in local state." />
          )}
        </section>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoTile label="Date and time" value={getReservationDateTime(reservation)} />
        <InfoTile label="Participants" value={String(reservation.participantCount)} />
        <InfoTile label="Contact email" value={reservation.email} />
        <InfoTile label="Contact number" value={reservation.contactNumber} />
        <InfoTile label="Equipment needs" value={reservation.equipmentNeeds || "None requested"} />
        <InfoTile label="Requester notes" value={reservation.notes || "No notes"} />
      </div>
    </div>
  );
}

function DocumentsTab({ reservation, onOpenModal }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Reservation Documents"
        description="Submitted, missing, and staff-reviewed documents."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "document-upload", reservation })}><Upload className="h-4 w-4" />Upload documents</PrimaryButton>}
      />
      {reservation.documents.length === 0 ? (
        <EmptyState title="No documents required" body="No document requirements are attached to this request." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reservation.documents.map((document) => (
            <article key={document.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{document.name}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{document.fileName || "No file uploaded"}</p>
                  {document.note ? <p className="mt-2 text-[12px] text-red-600">{document.note}</p> : null}
                </div>
                <Badge value={document.status} className={documentBadgeClasses[document.status] ?? "bg-slate-100 text-slate-600"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <SecondaryButton onClick={() => onOpenModal({ type: "document-upload", reservation, document })}><Upload className="h-3.5 w-3.5" />Replace</SecondaryButton>
                {document.fileName ? <SecondaryButton onClick={() => onOpenModal({ type: "document-view", reservation, document })}><Download className="h-3.5 w-3.5" />View file</SecondaryButton> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalTab({ reservation, onOpenModal }) {
  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Staff Review"
        description="Decision status, reviewer notes, and staff actions."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "review", action: "approve", reservation })}><CheckCircle2 className="h-4 w-4" />Approve request</PrimaryButton>}
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <InfoTile label="Current status" value={reservation.status} />
        <InfoTile label="Document status" value={reservation.documentStatus} />
        <InfoTile label="Reviewer" value={reservation.reviewer || "Pending"} />
        <InfoTile label="Last updated" value={formatDate(reservation.updatedAt)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <DetailPanel title="Approval / rejection notes" body={reservation.reviewNote || "No decision note recorded yet."} />
        <DetailPanel title="Staff note" body={reservation.staffNote || "No staff note recorded yet."} />
      </div>
      <div className="flex flex-wrap gap-3">
        <SecondaryButton onClick={() => onOpenModal({ type: "review", action: "approve", reservation })}><CheckCircle2 className="h-3.5 w-3.5" />Approve</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "review", action: "reject", reservation })}><XCircle className="h-3.5 w-3.5" />Reject</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "review", action: "request-documents", reservation })}><FileQuestion className="h-3.5 w-3.5" />Request documents</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "confirm", action: "cancel-reservation", reservation })}><Ban className="h-3.5 w-3.5" />Cancel</SecondaryButton>
      </div>
    </div>
  );
}

function ActivityTab({ reservation }) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Activity Log" description="Frontend audit trail for this reservation request." />
      {reservation.activityLog.length === 0 ? (
        <EmptyState title="No activity yet" body="Reservation updates will appear here." />
      ) : (
        <div className="space-y-3">
          {reservation.activityLog.map((entry, index) => (
            <div key={`${entry}-${index}`} className="flex gap-3 rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                <History className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-slate-600">{entry}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getPrimaryAction(reservation, onOpenModal) {
  if (reservation.status === "Pending Review") {
    return { label: "Approve Request", icon: CheckCircle2, onClick: () => onOpenModal({ type: "review", action: "approve", reservation }) };
  }
  if (reservation.documentStatus === "Missing" || reservation.documentStatus === "Rejected") {
    return { label: "Upload Documents", icon: Upload, onClick: () => onOpenModal({ type: "document-upload", reservation }) };
  }
  return { label: "View Documents", icon: FileText, onClick: () => onOpenModal({ type: "document-upload", reservation }) };
}

function BackButton({ onBack }) {
  return (
    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50">
      <ArrowLeft className="h-4 w-4" />
      Back to facilities
    </button>
  );
}

function SectionToolbar({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <SectionTitle title={title} description={description} />
      {action}
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}

function ProfileBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/80 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function DetailPanel({ title, body }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body || "Pending"}</p>
    </div>
  );
}

function Badge({ value, className }) {
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${className}`}>{value}</span>;
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
      <FileText className="mx-auto h-5 w-5 text-slate-300" />
      <p className="mt-3 text-[15px] font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}
