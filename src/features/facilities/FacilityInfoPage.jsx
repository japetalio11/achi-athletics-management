import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CalendarX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileQuestion,
  FileText,
  MapPin,
  PencilLine,
  Plus,
  StickyNote,
  Trash2,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Modal";
import {
  documentBadgeClasses,
  formatDate,
  getFacilityAvailability,
  getNextReservation,
  maintenanceBadgeClasses,
  reservationBadgeClasses,
  statusBadgeClasses,
  toTwelveHour,
} from "./facilityTypes";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "reservations", label: "Reservations" },
  { id: "documents", label: "Documents" },
  { id: "maintenance", label: "Maintenance" },
  { id: "notes", label: "Notes/Policies" },
];

export function FacilityInfoPage({
  facility,
  reservations,
  canManageFacilities,
  initialTab = "overview",
  onBack,
  onSelectTab,
  onSelectReservation,
  onOpenModal,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date("2026-05-15T00:00:00"));
  const activeTab = initialTab || "overview";

  if (!facility) {
    return (
      <div className="space-y-6 pb-24">
        <BackButton onBack={onBack} />
        <EmptyState title="Facility not found" body="The selected facility is not available in local frontend state." />
      </div>
    );
  }

  const facilityReservations = reservations.filter((reservation) => reservation.facilityId === facility.id);
  const availability = getFacilityAvailability(facility, reservations, facility.maintenanceRecords);
  const nextReservation = getNextReservation(facility.id, reservations);
  const activeReservationCount = facilityReservations.filter((reservation) =>
    ["Pending Review", "Approved"].includes(reservation.status),
  ).length;

  const switchTab = (tabId) => onSelectTab?.(tabId);

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <BackButton onBack={onBack} />

      <header className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={availability} className={statusBadgeClasses[availability] ?? "bg-slate-100 text-slate-600"} />
              <Badge value={facility.type} className="bg-slate-100 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{facility.name}</h1>
              <p className="mt-2 text-[15px] font-medium text-brand-blue">{facility.id} | {facility.managingOffice}</p>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">{facility.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={MapPin} label="Location" value={facility.location} />
              <ProfileBadge icon={Users} label="Capacity" value={`${facility.capacity} people`} />
              <ProfileBadge icon={Clock3} label="Hours" value={facility.operatingHours} />
              <ProfileBadge icon={CalendarCheck} label="Active Requests" value={String(activeReservationCount)} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Facility Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => onOpenModal({ type: "reservation-form", mode: "add", facility })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <CalendarPlus className="h-4 w-4" />
                Reserve Facility
              </button>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => switchTab("schedule")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule
                </button>
                <ActionMenu
                  label={`More actions for ${facility.name}`}
                  open={openMenuId === "header"}
                  onToggle={() => setOpenMenuId((current) => (current === "header" ? null : "header"))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Edit Facility", icon: PencilLine, onClick: () => onOpenModal({ type: "facility-form", mode: "edit", facility }) },
                    { label: "Add Maintenance Blockout", icon: Wrench, onClick: () => onOpenModal({ type: "maintenance-form", mode: "add", facility }) },
                    { label: "View Reservations", icon: Eye, onClick: () => switchTab("reservations") },
                    { label: "Add Note", icon: StickyNote, onClick: () => onOpenModal({ type: "note-form", mode: "add", facility }) },
                    ...(canManageFacilities
                      ? [{ label: "Archive Facility", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "archive-facility", facility }) }]
                      : []),
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
          {activeTab === "overview" && (
            <OverviewTab facility={facility} nextReservation={nextReservation} onOpenModal={onOpenModal} onOpenTab={switchTab} />
          )}
          {activeTab === "schedule" && (
            <ScheduleTab
              facility={facility}
              reservations={facilityReservations}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              onSelectReservation={onSelectReservation}
              onOpenModal={onOpenModal}
            />
          )}
          {activeTab === "reservations" && (
            <ReservationsTab
              facility={facility}
              reservations={facilityReservations}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onSelectReservation={onSelectReservation}
              onOpenModal={onOpenModal}
            />
          )}
          {activeTab === "documents" && <DocumentsTab facility={facility} />}
          {activeTab === "maintenance" && (
            <MaintenanceTab
              facility={facility}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenModal={onOpenModal}
            />
          )}
          {activeTab === "notes" && (
            <NotesPoliciesTab
              facility={facility}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenModal={onOpenModal}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function OverviewTab({ facility, nextReservation, onOpenModal, onOpenTab }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <InfoTile label="Type" value={facility.type} />
        <InfoTile label="Status" value={facility.status} />
        <InfoTile label="Managing office" value={facility.managingOffice} />
        <InfoTile label="Contact" value={facility.contactPerson} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <DetailPanel title="Facility description" body={facility.description} />
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Quick Actions" description="Common facility reservation operations." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionCard icon={CalendarPlus} title="Reserve facility" onClick={() => onOpenModal({ type: "reservation-form", mode: "add", facility })} />
            <ActionCard icon={CalendarDays} title="View schedule" onClick={() => onOpenTab("schedule")} />
            <ActionCard icon={FileText} title="Required documents" onClick={() => onOpenTab("documents")} />
            <ActionCard icon={PencilLine} title="Edit details" onClick={() => onOpenModal({ type: "facility-form", mode: "edit", facility })} />
          </div>
        </section>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoTile label="Supported sports" value={facility.sports.join(", ")} />
        <InfoTile label="Operating hours" value={facility.operatingHours} />
        <InfoTile label="Rules summary" value={facility.rulesSummary} />
      </div>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Current or Next Reservation" description="Nearest active reservation for this facility." />
        {nextReservation ? (
          <DetailPanel
            title={nextReservation.activityName}
            body={`${nextReservation.requesterName} | ${formatDate(nextReservation.reservationDate)} from ${toTwelveHour(nextReservation.startTime)} to ${toTwelveHour(nextReservation.endTime)}.`}
          />
        ) : (
          <EmptyState title="No upcoming reservation" body="This facility has no pending or approved future reservation in local state." />
        )}
      </section>
    </div>
  );
}

function ScheduleTab({ facility, reservations, currentDate, setCurrentDate, onSelectReservation, onOpenModal }) {
  const calendarEvents = [
    ...reservations.map((reservation) => ({
      id: reservation.id,
      title: reservation.activityName,
      start: new Date(`${reservation.reservationDate}T${reservation.startTime}`),
      end: new Date(`${reservation.reservationDate}T${reservation.endTime}`),
      resource: { type: "reservation", reservation },
    })),
    ...(facility.maintenanceRecords ?? []).map((record) => ({
      id: record.id,
      title: `${record.title} - Blockout`,
      start: new Date(`${record.startDate}T${record.startTime}`),
      end: new Date(`${record.endDate}T${record.endTime}`),
      resource: { type: "maintenance", record },
    })),
  ];

  const availableSlots = ["06:00", "08:00", "10:00", "13:00", "15:00", "17:00"].map((startTime) => ({
    startTime,
    endTime: `${String(Number(startTime.slice(0, 2)) + 2).padStart(2, "0")}:00`,
  }));

  const jumpToToday = () => setCurrentDate(new Date("2026-05-15T00:00:00"));

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Schedule and Availability"
        description="Reservations, available time slots, and maintenance blockouts."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "reservation-form", mode: "add", facility })}><CalendarPlus className="h-4 w-4" />Reserve time</PrimaryButton>}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[24px] border border-border-subtle/60 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-4 border-b border-border-subtle/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Current month</p>
              <h3 className="mt-1 text-[22px] font-bold tracking-tight text-slate-950">{format(currentDate, "MMMM yyyy")}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle/70 bg-white text-slate-500 shadow-soft transition-colors hover:bg-slate-50 hover:text-brand-blue"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={jumpToToday}
                className="inline-flex items-center rounded-full border border-border-subtle/70 bg-slate-50 px-4 py-2.5 text-[12px] font-bold text-slate-700 shadow-soft transition-colors hover:bg-white"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                aria-label="Next month"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle/70 bg-white text-slate-500 shadow-soft transition-colors hover:bg-slate-50 hover:text-brand-blue"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-border-subtle/60">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={setCurrentDate}
              view="month"
              views={["month"]}
              toolbar={false}
              popup
              className="adnu-events-calendar facility-calendar"
              style={{ minHeight: 620 }}
              onSelectEvent={(event) => {
                if (event.resource.type === "reservation") onSelectReservation(event.resource.reservation);
                if (event.resource.type === "maintenance") onOpenModal({ type: "maintenance-form", mode: "edit", facility, record: event.resource.record });
              }}
            />
          </div>
        </div>
        <aside className="space-y-4">
          <section className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-5">
            <SectionTitle title="Available Slots" description="Sample frontend slots for quick reservation starts." />
            <div className="mt-4 space-y-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => onOpenModal({ type: "reservation-form", mode: "add", facility, slot })}
                  className="flex w-full items-center justify-between rounded-2xl border border-border-subtle/60 bg-white px-4 py-3 text-left text-[13px] font-bold text-slate-700 transition-colors hover:bg-brand-blue-light hover:text-brand-blue"
                >
                  <span>{toTwelveHour(slot.startTime)} - {toTwelveHour(slot.endTime)}</span>
                  <CalendarPlus className="h-4 w-4" />
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-5">
            <SectionTitle title="Blockouts" description="Maintenance and closure windows." />
            <div className="mt-4 space-y-3">
              {facility.maintenanceRecords.length === 0 ? (
                <EmptyState title="No blockouts" body="Maintenance records will appear here." />
              ) : (
                facility.maintenanceRecords.map((record) => <MaintenanceCard key={record.id} record={record} compact />)
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ReservationsTab({ facility, reservations, openMenuId, setOpenMenuId, onSelectReservation, onOpenModal }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Facility Reservations"
        description="Pending, approved, completed, cancelled, and rejected requests for this facility."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "reservation-form", mode: "add", facility })}><CalendarPlus className="h-4 w-4" />New request</PrimaryButton>}
      />
      {reservations.length === 0 ? (
        <EmptyState title="No reservations yet" body="Requests for this facility will appear here." />
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => {
            const menuId = `reservation-${reservation.id}`;
            return (
              <article key={reservation.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_150px_auto] lg:items-center">
                  <button type="button" onClick={() => onSelectReservation(reservation)} className="min-w-0 text-left">
                    <p className="truncate font-bold text-slate-950">{reservation.activityName}</p>
                    <p className="mt-1 text-[12px] text-slate-500">{reservation.requesterName} | {reservation.requesterType}</p>
                    <p className="mt-1 text-[12px] text-brand-blue">{formatDate(reservation.reservationDate)} | {toTwelveHour(reservation.startTime)} - {toTwelveHour(reservation.endTime)}</p>
                  </button>
                  <Badge value={reservation.status} className={reservationBadgeClasses[reservation.status]} />
                  <Badge value={reservation.documentStatus} className={documentBadgeClasses[reservation.documentStatus] ?? "bg-slate-100 text-slate-600"} />
                  <div className="flex justify-end gap-2">
                    <SecondaryButton onClick={() => onSelectReservation(reservation)}><Eye className="h-3.5 w-3.5" />View</SecondaryButton>
                    <ActionMenu
                      label={`Actions for ${reservation.activityName}`}
                      open={openMenuId === menuId}
                      onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                      onClose={() => setOpenMenuId(null)}
                      items={[
                        { label: "Upload Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "document-upload", reservation }) },
                        { label: "Approve Request", icon: CheckCircle2, onClick: () => onOpenModal({ type: "review", action: "approve", reservation }) },
                        { label: "Reject Request", icon: XCircle, tone: "danger", onClick: () => onOpenModal({ type: "review", action: "reject", reservation }) },
                        { label: "Request Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "review", action: "request-documents", reservation }) },
                        { label: "Cancel Reservation", icon: CalendarX, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "cancel-reservation", reservation }) },
                      ]}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ facility }) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Required Documents" description="Documents differ for internal, student organization, staff, athlete/coach, external, and partner requests." />
      <div className="grid gap-3 md:grid-cols-2">
        {facility.requiredDocuments.map((document) => (
          <article key={document.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{document.name}</p>
                <p className="mt-2 text-[12px] leading-5 text-slate-500">Applies to: {document.appliesTo.join(", ")}</p>
              </div>
              <Badge value={document.required ? "Required" : "Optional"} className={document.required ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MaintenanceTab({ facility, openMenuId, setOpenMenuId, onOpenModal }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Maintenance and Blockouts"
        description="Closures, unavailable times, repairs, inspections, and blockout records."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "maintenance-form", mode: "add", facility })}><Wrench className="h-4 w-4" />Add blockout</PrimaryButton>}
      />
      {facility.maintenanceRecords.length === 0 ? (
        <EmptyState title="No maintenance records" body="Facility closures and maintenance records will appear here." />
      ) : (
        <div className="space-y-3">
          {facility.maintenanceRecords.map((record) => (
            <MaintenanceCard
              key={record.id}
              record={record}
              menu={
                <ActionMenu
                  label={`Actions for ${record.title}`}
                  open={openMenuId === record.id}
                  onToggle={() => setOpenMenuId((current) => (current === record.id ? null : record.id))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Edit Blockout", icon: PencilLine, onClick: () => onOpenModal({ type: "maintenance-form", mode: "edit", facility, record }) },
                    { label: "Mark Resolved", icon: CheckCircle2, onClick: () => onOpenModal({ type: "confirm", action: "resolve-maintenance", facility, record }) },
                    { label: "Delete Blockout", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "delete-maintenance", facility, record }) },
                  ]}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotesPoliciesTab({ facility, openMenuId, setOpenMenuId, onOpenModal }) {
  const publicNotes = facility.notes.filter((note) => note.visibility === "Public");
  const internalNotes = facility.notes.filter((note) => note.visibility === "Internal");

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Notes and Policies"
        description="Usage rules, public reminders, and staff-only notes."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "note-form", mode: "add", facility })}><Plus className="h-4 w-4" />Add note</PrimaryButton>}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Policies" description="Current facility rules and activity boundaries." />
          <div className="mt-4 grid gap-3">
            <DetailPanel title="Allowed activities" body={facility.allowedActivities.join(", ")} />
            <DetailPanel title="Prohibited activities" body={facility.prohibitedActivities.join(", ")} />
            <DetailPanel title="Reservation policies" body={facility.policies.join(" ")} />
          </div>
        </section>
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Public Notes" description="Visible guidance for requesters." />
          <NoteCards notes={publicNotes} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} facility={facility} onOpenModal={onOpenModal} emptyTitle="No public notes" />
        </section>
      </div>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Internal Staff Notes" description="Staff-only operations notes." />
        <NoteCards notes={internalNotes} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} facility={facility} onOpenModal={onOpenModal} emptyTitle="No internal notes" />
      </section>
    </div>
  );
}

function NoteCards({ notes, openMenuId, setOpenMenuId, facility, onOpenModal, emptyTitle }) {
  if (!notes.length) return <EmptyState title={emptyTitle} body="Saved notes will appear here." />;
  return (
    <div className="mt-4 space-y-3">
      {notes.map((note) => {
        const menuId = `note-${note.id}`;
        return (
          <article key={note.id} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{note.title}</p>
                <p className="mt-1 text-[12px] text-slate-500">{note.visibility} | {note.author} | {formatDate(note.createdAt)}</p>
              </div>
              <ActionMenu
                label={`Actions for ${note.title}`}
                open={openMenuId === menuId}
                onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                onClose={() => setOpenMenuId(null)}
                items={[
                  { label: "Edit Note", icon: PencilLine, onClick: () => onOpenModal({ type: "note-form", mode: "edit", facility, note }) },
                  { label: "Delete Note", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "delete-note", facility, note }) },
                ]}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{note.body}</p>
          </article>
        );
      })}
    </div>
  );
}

function MaintenanceCard({ record, menu, compact = false }) {
  return (
    <article className={`rounded-2xl border border-border-subtle/60 bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{record.title}</p>
          <p className="mt-1 text-[12px] text-slate-500">
            {formatDate(record.startDate)} {toTwelveHour(record.startTime)} - {formatDate(record.endDate)} {toTwelveHour(record.endTime)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={record.status} className={maintenanceBadgeClasses[record.status]} />
          {menu}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{record.reason}</p>
      {record.notes ? <p className="mt-2 text-[12px] text-slate-500">{record.notes}</p> : null}
    </article>
  );
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

function ActionCard({ icon: Icon, title, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-border-subtle/60 bg-white p-4 text-left transition-colors hover:border-brand-blue/20 hover:bg-brand-blue-light/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue shadow-soft">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-[14px] font-bold text-slate-900">{title}</h3>
    </button>
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
