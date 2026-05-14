import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  StickyNote,
  TrendingUp,
  Upload,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import {
  Field,
  FeedbackPanel,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "../../components/ui/Modal";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { actionIcons } from "../../components/ui/actionButtonIcons";
import { athletePool } from "../events/eventsMockData";
import { coachRoles, coachStatuses, credentialStatuses, noteTypes, scheduleStatuses } from "./coachesMockData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Detailed Info" },
  { id: "athletes", label: "Assigned Athletes" },
  { id: "events", label: "Schedule" },
  { id: "certifications", label: "Credentials" },
  { id: "notes", label: "Notes" },
];

const tabCopy = {
  overview: {
    title: "Coach Snapshot",
    description: "Review current focus, roster coverage, schedule load, and recent coaching activity.",
  },
  details: {
    title: "Detailed Coach Information",
    description: "Maintain staff identity, contact details, employment profile, and coaching assignment.",
  },
  athletes: {
    title: "Assigned Athlete Roster",
    description: "Assign athletes, inspect roster coverage, and remove local assignments with confirmation.",
  },
  events: {
    title: "Schedule and Events",
    description: "Manage training sessions, meetings, competitions, duties, and schedule notes.",
  },
  certifications: {
    title: "Credentials and Certifications",
    description: "Track coaching credentials, renewal status, verification, and mock document uploads.",
  },
  notes: {
    title: "Coach Notes",
    description: "Capture internal observations, performance notes, roster remarks, and admin updates.",
  },
};

const emptyScheduleForm = {
  title: "",
  type: "Training",
  date: "",
  venue: "",
  status: "Scheduled",
  attendance: "0 athletes",
  responsibility: "",
  summary: "",
};

const emptyCredentialForm = {
  name: "",
  issuer: "",
  validUntil: "",
  status: "Pending Review",
  kind: "pdf",
  fileName: "",
  meta: "",
};

export function CoachProfile({
  coach,
  initialTab = "overview",
  onBack,
  onSelectTab,
  onUpdateCoach,
  onArchiveCoach,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [modal, setModal] = useState(null);
  const [assignmentFilters, setAssignmentFilters] = useState({ search: "", sport: "All sports", status: "All statuses" });
  const [noteFilter, setNoteFilter] = useState("All notes");
  const [activeOverflowMenuId, setActiveOverflowMenuId] = useState(null);
  const tabSectionRef = useRef(null);

  const activeCopy = tabCopy[activeTab] ?? tabCopy.overview;
  const assignedAthletes = coach.assignedAthletes ?? [];
  const scheduleItems = coach.schedule?.items ?? [];
  const credentials = coach.certifications ?? [];
  const qualifications = coach.qualifications ?? [];
  const notes = coach.notes ?? [];

  const switchTab = (tabId) => {
    setActiveOverflowMenuId(null);
    setActiveTab(tabId);
    onSelectTab?.(tabId);
  };

  useEffect(() => {
    if (!tabSectionRef.current) return;

    tabSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeTab]);

  const updateCoach = (updater, feedbackPayload) => {
    onUpdateCoach(coach.id, updater, feedbackPayload);
    setModal(null);
  };

  const statusTone =
    coach.status === "Active"
      ? "bg-green-50 text-green-700"
      : coach.status === "On Leave"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  const content = {
    overview: (
      <OverviewTab
        coach={coach}
        assignedAthletes={assignedAthletes}
        scheduleItems={scheduleItems}
        notes={notes}
        onOpenTab={switchTab}
        onOpenModal={setModal}
      />
    ),
    details: <DetailsTab coach={coach} onOpenModal={setModal} />,
    athletes: (
      <AssignedAthletesTab
        coach={coach}
        assignedAthletes={assignedAthletes}
        filters={assignmentFilters}
        setFilters={setAssignmentFilters}
        activeOverflowMenuId={activeOverflowMenuId}
        setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
    events: (
      <ScheduleTab
        coach={coach}
        scheduleItems={scheduleItems}
        activeOverflowMenuId={activeOverflowMenuId}
        setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
    certifications: (
      <CredentialsTab
        coach={coach}
        credentials={credentials}
        qualifications={qualifications}
        activeOverflowMenuId={activeOverflowMenuId}
        setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
    notes: (
      <NotesTab
        notes={notes}
        noteFilter={noteFilter}
        setNoteFilter={setNoteFilter}
        activeOverflowMenuId={activeOverflowMenuId}
        setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
  }[activeTab];

  return (
    <div className="animate-in mt-8 space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500 md:mt-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle/60 bg-surface-card px-4 py-2 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Coaches
      </button>

      <div className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <img
                src={coach.imageUrl}
                alt={coach.name}
                className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-soft"
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{coach.name}</h1>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone}`}>
                    {coach.status}
                  </span>
                </div>
                <p className="text-[15px] font-medium text-brand-blue">
                  {[coach.sport, coach.department].filter(Boolean).join(" | ")}
                </p>
                <p className="max-w-3xl text-[13px] leading-relaxed text-slate-500">{coach.overview?.summary}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={UserRound} label="Staff ID" value={coach.staffId} />
              <ProfileBadge icon={Users} label="Team" value={coach.team} />
              <ProfileBadge icon={TrendingUp} label="Role" value={coach.role} />
              <ProfileBadge icon={CalendarDays} label="Next Event" value={coach.nextEventLabel} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Profile Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setModal({ type: "edit-profile", values: profileToForm(coach), errors: {} })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <PencilLine className="h-4 w-4" />
                Edit Coach
              </button>
              <button
                type="button"
                onClick={() => switchTab("details")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                Open Detailed Info
              </button>
              <button
                type="button"
                onClick={() => setModal({ type: "status", status: coach.status, note: "" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Update Status
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div
        ref={tabSectionRef}
        className="relative isolate rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft"
      >
        <div className="border-b border-border-subtle/70 px-5 pb-6 pt-5">
          <div className="relative grid gap-4 lg:min-h-[6.5rem] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:justify-between">
            <div className="min-w-0 lg:max-w-[44rem]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Coach Workspace</p>
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">{activeCopy.title}</h2>
              <p className="mt-1 min-h-[2.75rem] text-[13px] leading-relaxed text-slate-500 lg:line-clamp-2">
                {activeCopy.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={`rounded-full px-4 py-2.5 text-[12px] font-bold tracking-wide transition-all ${
                    activeTab === tab.id
                      ? "bg-brand-blue text-white shadow-soft"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-0 mt-6">
          {content}
        </div>
      </div>

      <CoachProfileModal
        modal={modal}
        coach={coach}
        assignedAthletes={assignedAthletes}
        onClose={() => setModal(null)}
        onSetModal={setModal}
        updateCoach={updateCoach}
        onArchiveCoach={onArchiveCoach}
      />
    </div>
  );
}

function OverviewTab({ coach, assignedAthletes, scheduleItems, notes, onOpenTab, onOpenModal }) {
  const upcoming = scheduleItems.filter((item) => item.status === "Scheduled" || item.status === "Ongoing");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Status" value={coach.status} hint={coach.overview?.focusNote} tone="blue" />
        <MetricTile label="Assigned Athletes" value={String(assignedAthletes.length)} hint="Current roster link" tone="gold" />
        <MetricTile label="Experience" value={`${coach.experienceYears} years`} hint={coach.role} />
        <MetricTile label="Upcoming Duties" value={String(upcoming.length)} hint={coach.nextEventTitle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ProfileCard
          title="Current Focus and Alerts"
          action={<SmallAction icon={actionIcons.addNote} onClick={() => onOpenModal({ type: "note", values: emptyNoteForm("Performance"), errors: {} })}>Add note</SmallAction>}
        >
          <div className="rounded-2xl border border-border-subtle/60 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Program Summary</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{coach.overview?.summary}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {(coach.overview?.alerts ?? []).length === 0 ? (
              <EmptyState title="No active alerts" body="Focus items and staff alerts will appear here." />
            ) : (
              coach.overview.alerts.map((alert) => <AlertCard key={alert.title} alert={alert} />)
            )}
          </div>
        </ProfileCard>

        <ProfileCard title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard icon={Users} title="View assigned athletes" onClick={() => onOpenTab("athletes")} />
            <ActionCard icon={CalendarDays} title="View schedule" onClick={() => onOpenTab("events")} />
            <ActionCard icon={StickyNote} title="Add note" onClick={() => onOpenModal({ type: "note", values: emptyNoteForm(), errors: {} })} />
            <ActionCard icon={ShieldCheck} title="Update status" onClick={() => onOpenModal({ type: "status", status: coach.status, note: "" })} />
          </div>
          <div className="mt-5 rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Recent Activity</p>
            <div className="mt-3 space-y-3">
              {notes.slice(0, 3).length === 0 ? (
                <EmptyState title="No notes yet" body="Saved notes and local changes will appear here." />
              ) : (
                notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="rounded-xl bg-white p-3 text-[12px] text-slate-600">
                    <span className="font-semibold text-slate-900">{note.title}</span> - {note.body}
                  </div>
                ))
              )}
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}

function DetailsTab({ coach, onOpenModal }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <ProfileCard
        title="Staff Record"
        action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "staff", values: staffToForm(coach), errors: {} })}>Edit</SmallAction>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Full name" value={coach.name} />
          <DetailField label="Staff ID" value={coach.staffId} />
          <DetailField label="Department" value={coach.department} />
          <DetailField label="Office" value={coach.office} />
          <DetailField label="Experience" value={`${coach.experienceYears} years`} />
          <DetailField label="Status" value={coach.status} />
        </div>
      </ProfileCard>

      <ProfileCard
        title="Contact Details"
        action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "contact", values: contactToForm(coach), errors: {} })}>Edit</SmallAction>}
      >
        <div className="space-y-4">
          <InfoRow icon={Phone} label="Mobile" value={coach.phone} />
          <InfoRow icon={Mail} label="Email" value={coach.email} />
          <InfoRow icon={MapPin} label="Address" value={coach.address} />
        </div>
      </ProfileCard>

      <ProfileCard
        title="Personal Information"
        action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "personal", values: personalToForm(coach), errors: {} })}>Edit</SmallAction>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Birthdate" value={coach.profile?.birthdate} />
          <DetailField label="Age" value={coach.profile?.age} />
          <DetailField label="Gender" value={coach.profile?.gender} />
          <DetailField label="Nationality" value={coach.profile?.nationality} />
        </div>
      </ProfileCard>

      <ProfileCard
        title="Coaching Profile"
        action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "coaching", values: coachingToForm(coach), errors: {} })}>Edit</SmallAction>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Sport" value={coach.sport} />
          <DetailField label="Team" value={coach.team} />
          <DetailField label="Role" value={coach.role} />
          <DetailField label="Certification" value={coach.profile?.certificationLevel} />
          <div className="sm:col-span-2">
            <DetailField label="Specialization" value={coach.specialization} />
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}

function AssignedAthletesTab({
  coach,
  assignedAthletes,
  filters,
  setFilters,
  activeOverflowMenuId,
  setActiveOverflowMenuId,
  onOpenModal,
}) {
  const visibleAthletes = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return assignedAthletes.filter((athlete) => {
      const text = [athlete.name, athlete.studentId, athlete.sport, athlete.team, athlete.yearLevel, athlete.status, athlete.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesSport = filters.sport === "All sports" || athlete.sport === filters.sport;
      const matchesStatus = filters.status === "All statuses" || athlete.status === filters.status || athlete.participationStatus === filters.status;
      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [assignedAthletes, filters]);

  const sports = ["All sports", ...new Set(assignedAthletes.map((athlete) => athlete.sport).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Assigned Athletes" value={String(assignedAthletes.length)} hint="Current local roster" tone="blue" />
        <MetricTile label="Primary Team" value={coach.team} hint={coach.role} tone="gold" />
        <MetricTile label="Roster Sports" value={String(Math.max(1, sports.length - 1))} hint="Distinct sports" />
      </div>

      <ProfileCard
        title="Assigned Athlete Roster"
        action={
          <button
            type="button"
            onClick={() => onOpenModal({ type: "assign-athletes", search: "", sport: "All sports", selectedIds: [] })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign athlete
          </button>
        }
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search assigned athletes..."
              className="w-full rounded-full border border-border-subtle/50 bg-slate-50 py-2 pl-10 pr-4 text-[12px] text-slate-700 outline-none focus:border-brand-blue/30"
            />
          </div>
          <SelectInput value={filters.sport} onChange={(event) => setFilters((current) => ({ ...current, sport: event.target.value }))}>
            {sports.map((sport) => (
              <option key={sport}>{sport}</option>
            ))}
          </SelectInput>
          <SelectInput value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option>All statuses</option>
            <option>Assigned</option>
            <option>Confirmed</option>
            <option>Participated</option>
            <option>Completed</option>
          </SelectInput>
        </div>

        {visibleAthletes.length === 0 ? (
          <EmptyState
            title={assignedAthletes.length === 0 ? "No assigned athletes" : "No assigned athletes match"}
            body={assignedAthletes.length === 0 ? "Assign athletes from the available roster pool." : "Adjust the search or filters to see more assignments."}
          />
        ) : (
          <div className="space-y-3">
            {visibleAthletes.map((athlete) => (
              <div key={athlete.id} className="rounded-[22px] border border-border-subtle/60 bg-white p-4 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-slate-900">{athlete.name}</p>
                      <StatusChip value={athlete.participationStatus || athlete.status} />
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {athlete.studentId} | {athlete.sport} | {athlete.team}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {athlete.eventTitle ? `${athlete.eventTitle} on ${athlete.eventDate}` : athlete.role}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <ActionMenu
                      label={`Actions for ${athlete.name}`}
                      open={activeOverflowMenuId === `coach-athlete-${athlete.id}`}
                      onToggle={() =>
                        setActiveOverflowMenuId((current) =>
                          current === `coach-athlete-${athlete.id}` ? null : `coach-athlete-${athlete.id}`,
                        )
                      }
                      onClose={() => setActiveOverflowMenuId(null)}
                      widthClass="w-48"
                      items={[
                        {
                          icon: actionIcons.view,
                          label: "View",
                          onClick: () => onOpenModal({ type: "view-athlete", athlete }),
                        },
                        {
                          icon: actionIcons.remove,
                          label: "Remove",
                          tone: "danger",
                          onClick: () => onOpenModal({ type: "confirm-remove-athlete", athlete }),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

function ScheduleTab({
  coach,
  scheduleItems,
  activeOverflowMenuId,
  setActiveOverflowMenuId,
  onOpenModal,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Items" value={String(scheduleItems.length)} hint="Current schedule load" tone="blue" />
        <MetricTile label="Completed" value={String(scheduleItems.filter((item) => item.status === "Completed").length)} hint="Closed sessions" tone="gold" />
        <MetricTile label="Upcoming" value={String(scheduleItems.filter((item) => item.status === "Scheduled" || item.status === "Ongoing").length)} hint="Live schedule" />
        <MetricTile label="Athlete Coverage" value={`${coach.assignedAthleteCount ?? 0} assigned`} hint="Roster linked" />
      </div>

      <ProfileCard
        title="Schedule History"
        action={
          <button
            type="button"
            onClick={() => onOpenModal({ type: "schedule-form", mode: "add", values: { ...emptyScheduleForm, responsibility: coach.role }, errors: {} })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </button>
        }
      >
        {scheduleItems.length === 0 ? (
          <EmptyState title="No schedule items" body="Add a training session, competition duty, meeting, or event responsibility." />
        ) : (
          <div className="space-y-3">
            {scheduleItems.map((event) => (
              <div key={event.id} className="rounded-[22px] border border-border-subtle/60 bg-white p-4 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-slate-900">{event.title}</p>
                      <EventStatusPill value={event.status} />
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {event.type} | {event.date || "Date pending"} | {event.venue || "Venue pending"}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {event.summary || "No schedule summary recorded."}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <ActionMenu
                      label={`Actions for ${event.title}`}
                      open={activeOverflowMenuId === `coach-schedule-${event.id}`}
                      onToggle={() =>
                        setActiveOverflowMenuId((current) =>
                          current === `coach-schedule-${event.id}` ? null : `coach-schedule-${event.id}`,
                        )
                      }
                      onClose={() => setActiveOverflowMenuId(null)}
                      widthClass="w-48"
                      items={[
                        {
                          icon: actionIcons.view,
                          label: "View",
                          onClick: () => onOpenModal({ type: "view-schedule", event }),
                        },
                        {
                          icon: actionIcons.edit,
                          label: "Edit",
                          onClick: () =>
                            onOpenModal({
                              type: "schedule-form",
                              mode: "edit",
                              eventId: event.id,
                              values: scheduleToForm(event),
                              errors: {},
                            }),
                        },
                        {
                          icon: actionIcons.updateStatus,
                          label: "Status",
                          onClick: () =>
                            onOpenModal({ type: "schedule-status", eventId: event.id, status: event.status }),
                        },
                        {
                          icon: actionIcons.remove,
                          label: "Cancel",
                          tone: "danger",
                          onClick: () => onOpenModal({ type: "confirm-remove-schedule", event }),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

function CredentialsTab({
  credentials,
  qualifications,
  activeOverflowMenuId,
  setActiveOverflowMenuId,
  onOpenModal,
}) {
  return (
    <div className="space-y-6">
      <ProfileCard
        title="Certification Files"
        action={
          <button
            type="button"
            onClick={() => onOpenModal({ type: "credential-form", mode: "add", values: emptyCredentialForm, errors: {} })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Add credential
          </button>
        }
      >
        {credentials.length === 0 ? (
          <EmptyState title="No credentials uploaded" body="Add coaching certifications, licenses, or compliance files." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {credentials.map((document) => (
              <div key={document.id} className="rounded-2xl border border-border-subtle/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <DocumentIcon kind={document.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{document.name}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{document.meta || document.fileName || "No file selected"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusChip value={document.status} />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ActionMenu
                      label={`Actions for ${document.name}`}
                      open={activeOverflowMenuId === `coach-credential-${document.id}`}
                      onToggle={() =>
                        setActiveOverflowMenuId((current) =>
                          current === `coach-credential-${document.id}` ? null : `coach-credential-${document.id}`,
                        )
                      }
                      onClose={() => setActiveOverflowMenuId(null)}
                      items={[
                        {
                          icon: actionIcons.view,
                          label: "View",
                          onClick: () => onOpenModal({ type: "view-credential", credential: document }),
                        },
                        {
                          icon: actionIcons.edit,
                          label: "Edit",
                          onClick: () =>
                            onOpenModal({
                              type: "credential-form",
                              mode: "edit",
                              credentialId: document.id,
                              values: credentialToForm(document),
                              errors: {},
                            }),
                        },
                        {
                          icon: actionIcons.upload,
                          label: "Upload",
                          onClick: () =>
                            onOpenModal({ type: "upload-credential", credential: document, fileName: "", error: "" }),
                        },
                        {
                          icon: actionIcons.updateStatus,
                          label: "Verify",
                          onClick: () => onOpenModal({ type: "verify-credential", credential: document }),
                        },
                        {
                          icon: actionIcons.remove,
                          label: "Remove",
                          tone: "danger",
                          onClick: () => onOpenModal({ type: "confirm-remove-credential", credential: document }),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Qualifications and Compliance">
        {qualifications.length === 0 ? (
          <EmptyState title="No qualification records" body="Qualification rows will appear after credentials are added." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle/60 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  <th className="p-5 pl-0">Qualification</th>
                  <th className="p-5">Issuer</th>
                  <th className="p-5">Valid Until</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                {qualifications.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="p-5 pl-0 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-5 text-slate-600">{item.issuer}</td>
                    <td className="p-5 text-slate-600">{item.validUntil}</td>
                    <td className="p-5"><StatusChip value={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

function NotesTab({
  notes,
  noteFilter,
  setNoteFilter,
  activeOverflowMenuId,
  setActiveOverflowMenuId,
  onOpenModal,
}) {
  const visibleNotes = noteFilter === "All notes" ? notes : notes.filter((note) => note.type === noteFilter);

  return (
    <ProfileCard
      title="Internal Notes"
      action={
        <button
          type="button"
          onClick={() => onOpenModal({ type: "note", values: emptyNoteForm(), errors: {} })}
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add note
        </button>
      }
    >
      <div className="mb-5 max-w-xs">
        <SelectInput value={noteFilter} onChange={(event) => setNoteFilter(event.target.value)}>
          <option>All notes</option>
          {noteTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </SelectInput>
      </div>

      {visibleNotes.length === 0 ? (
        <EmptyState title="No notes found" body="Add a coach note or adjust the note filter." />
      ) : (
        <div className="space-y-3">
          {visibleNotes.map((note) => (
            <div key={note.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-slate-900">{note.title}</p>
                    <StatusChip value={note.type} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {note.owner} | {note.date}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{note.body}</p>
                </div>
                <div className="flex shrink-0 justify-end">
                  <ActionMenu
                    label={`Actions for ${note.title}`}
                    open={activeOverflowMenuId === `coach-note-${note.id}`}
                    onToggle={() =>
                      setActiveOverflowMenuId((current) =>
                        current === `coach-note-${note.id}` ? null : `coach-note-${note.id}`,
                      )
                    }
                    onClose={() => setActiveOverflowMenuId(null)}
                    widthClass="w-48"
                    items={[
                      {
                        icon: actionIcons.edit,
                        label: "Edit",
                        onClick: () => onOpenModal({ type: "note", noteId: note.id, values: noteToForm(note), errors: {} }),
                      },
                      {
                        icon: actionIcons.delete,
                        label: "Delete",
                        tone: "danger",
                        onClick: () => onOpenModal({ type: "confirm-delete-note", note }),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  );
}

function CoachProfileModal({
  modal,
  coach,
  assignedAthletes,
  onClose,
  onSetModal,
  updateCoach,
  onArchiveCoach,
}) {
  if (!modal) return null;

  const changeValues = (key, value) => {
    onSetModal((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
      errors: { ...current.errors, [key]: undefined },
    }));
  };

  const setModalField = (key, value) => onSetModal((current) => ({ ...current, [key]: value }));

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Update Status | ${coach.name}`}
        description="Update coach availability and leave an optional administrative note."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={() =>
                updateCoach(
                  (current) => ({
                    ...current,
                    status: modal.status,
                    notes: [
                      {
                        id: `NOTE-${Date.now()}`,
                        type: "Administrative",
                        title: "Status update",
                        owner: "Athletics Staff",
                        date: new Date().toLocaleDateString(),
                        body: modal.note.trim() || `Status changed to ${modal.status}.`,
                      },
                      ...(current.notes ?? []),
                    ],
                  }),
                  { title: "Status updated", message: `${coach.name} now shows ${modal.status}.` },
                )
              }
            >
              Save status
            </PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Status">
            <SelectInput value={modal.status} onChange={(event) => setModalField("status", event.target.value)}>
              {coachStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status note">
            <TextArea value={modal.note} onChange={(event) => setModalField("note", event.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "edit-profile") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Edit Coach"
        description="Update staff, contact, and coaching profile details."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => saveProfileForm(modal, onSetModal, updateCoach)}>Save coach</PrimaryButton>
          </>
        }
        size="lg"
      >
        <ProfileEditForm values={modal.values} errors={modal.errors} onChange={changeValues} />
      </Modal>
    );
  }

  if (modal.type === "edit-section") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Edit ${sectionTitle(modal.section)}`}
        description="Save changes locally until backend persistence is connected."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => saveSectionForm(modal, onSetModal, updateCoach)}>Save changes</PrimaryButton>
          </>
        }
      >
        <SectionEditForm section={modal.section} values={modal.values} errors={modal.errors} onChange={changeValues} />
      </Modal>
    );
  }

  if (modal.type === "note") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.noteId ? "Edit Note" : "Add Note"}
        description="Save a coach note to local frontend state."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => saveNote(modal, onSetModal, updateCoach)}><actionIcons.addNote className="h-3.5 w-3.5" />Save note</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <SelectInput value={modal.values.type} onChange={(event) => changeValues("type", event.target.value)}>
              {noteTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Title" error={modal.errors.title}>
            <TextInput value={modal.values.title} onChange={(event) => changeValues("title", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note" error={modal.errors.body}>
              <TextArea value={modal.values.body} onChange={(event) => changeValues("body", event.target.value)} />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "assign-athletes") {
    const assignedIds = new Set(assignedAthletes.map((athlete) => athlete.athleteId));
    const query = modal.search.trim().toLowerCase();
    const poolSports = ["All sports", ...new Set(athletePool.map((athlete) => athlete.sport))];
    const visiblePool = athletePool.filter((athlete) => {
      const text = [athlete.name, athlete.studentId, athlete.sport, athlete.team, athlete.yearLevel, athlete.role].join(" ").toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesSport = modal.sport === "All sports" || athlete.sport === modal.sport;
      return matchesSearch && matchesSport;
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={`Assign Athletes | ${coach.name}`}
        description="Search the available event athlete pool and assign one or more athletes locally."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => assignAthletes(modal, onSetModal, updateCoach)}><actionIcons.assign className="h-3.5 w-3.5" />Assign selected</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <TextInput value={modal.search} onChange={(event) => setModalField("search", event.target.value)} placeholder="Search athletes..." />
            <SelectInput value={modal.sport} onChange={(event) => setModalField("sport", event.target.value)}>
              {poolSports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {modal.error && (
              <FeedbackPanel tone="warning" title="Select an athlete">
                {modal.error}
              </FeedbackPanel>
            )}
            {visiblePool.length === 0 ? (
              <EmptyState title="No available athletes found" body="Adjust the search or sport filter." />
            ) : (
              visiblePool.map((athlete) => {
                const alreadyAssigned = assignedIds.has(athlete.id);
                const selected = modal.selectedIds.includes(athlete.id);
                return (
                  <button
                    key={athlete.id}
                    type="button"
                    disabled={alreadyAssigned}
                    onClick={() =>
                      setModalField(
                        "selectedIds",
                        selected
                          ? modal.selectedIds.filter((id) => id !== athlete.id)
                          : [...modal.selectedIds, athlete.id],
                      )
                    }
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected ? "border-brand-blue bg-brand-blue-light" : "border-border-subtle/60 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      <span className="block text-[13px] font-semibold text-slate-900">{athlete.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {athlete.studentId} | {athlete.sport} | {athlete.yearLevel}
                      </span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue">
                      {alreadyAssigned ? "Assigned" : selected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "view-athlete") {
    return (
      <Modal open onClose={onClose} title={modal.athlete.name} description="Athlete profile handoff placeholder." footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        <FeedbackPanel tone="info" title="Athlete profile action ready">
          This coach tab can link into the full Athletes module route when cross-module profile navigation is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm-remove-athlete") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Remove Athlete Assignment"
        description={`${modal.athlete.name} will be removed from ${coach.name}'s local assignment list.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton tone="danger" onClick={() => removeAssignedAthlete(modal.athlete, updateCoach)}><actionIcons.remove className="h-3.5 w-3.5" />Remove assignment</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          This only changes the local coach profile. Event roster sync can be wired later.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "schedule-form") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.mode === "edit" ? "Edit Schedule Item" : "Add Schedule Item"}
        description="Manage coach duties and events locally."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => saveSchedule(modal, onSetModal, updateCoach)}>Save schedule</PrimaryButton>
          </>
        }
        size="lg"
      >
        <ScheduleForm values={modal.values} errors={modal.errors} onChange={changeValues} />
      </Modal>
    );
  }

  if (modal.type === "view-schedule") {
    return (
      <Modal open onClose={onClose} title={modal.event.title} description={`${modal.event.type} | ${modal.event.date} | ${modal.event.venue}`} footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        <FeedbackPanel tone="info" title={modal.event.status}>
          {modal.event.summary || "No schedule summary recorded."}
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "schedule-status") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Update Schedule Status"
        description="Change the visible event or duty status locally."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => updateScheduleStatus(modal, updateCoach)}>Save status</PrimaryButton>
          </>
        }
      >
        <Field label="Status">
          <SelectInput value={modal.status} onChange={(event) => setModalField("status", event.target.value)}>
            {scheduleStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </SelectInput>
        </Field>
      </Modal>
    );
  }

  if (modal.type === "confirm-remove-schedule") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Cancel Schedule Item"
        description={`${modal.event.title} will be marked cancelled in the local schedule.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Keep item</SecondaryButton>
            <PrimaryButton tone="danger" onClick={() => cancelScheduleItem(modal.event, updateCoach)}>
              Cancel item
            </PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          Cancelled duties remain visible so staff can review schedule history.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "credential-form") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.mode === "edit" ? "Edit Credential" : "Add Credential"}
        description="Track certifications, licenses, training credentials, or compliance files."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => saveCredential(modal, onSetModal, updateCoach)}>Save credential</PrimaryButton>
          </>
        }
      >
        <CredentialForm values={modal.values} errors={modal.errors} onChange={changeValues} />
      </Modal>
    );
  }

  if (modal.type === "view-credential") {
    return (
      <Modal open onClose={onClose} title={modal.credential.name} description={modal.credential.meta} footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        <FeedbackPanel tone="success" title={modal.credential.status}>
          File preview and secure download can be connected when storage is ready. Current file: {modal.credential.fileName || "No file selected"}.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "upload-credential") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Upload Document | ${modal.credential.name}`}
        description="Mock frontend upload flow. The selected file name is saved locally."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => uploadCredential(modal, onSetModal, updateCoach)}><actionIcons.upload className="h-3.5 w-3.5" />Save file</PrimaryButton>
          </>
        }
      >
        <Field label="Selected file" error={modal.error}>
          <TextInput
            value={modal.fileName}
            onChange={(event) => setModalField("fileName", event.target.value)}
            placeholder="Coaching-license.pdf"
          />
        </Field>
      </Modal>
    );
  }

  if (modal.type === "verify-credential") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Verify Credential"
        description={`${modal.credential.name} will be marked valid in local state.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => verifyCredential(modal.credential, updateCoach)}>Mark verified</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="info" title="Verification action">
          This records a UI-level verification status until compliance workflows are connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm-remove-credential") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Remove Credential"
        description={`${modal.credential.name} will be removed from local coach credentials.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton tone="danger" onClick={() => removeCredential(modal.credential, updateCoach)}><actionIcons.remove className="h-3.5 w-3.5" />Remove credential</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          This does not delete a real file because storage is not connected yet.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm-delete-note") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Delete Note"
        description={`${modal.note.title} will be removed from this local coach profile.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton tone="danger" onClick={() => deleteNote(modal.note, updateCoach)}><actionIcons.delete className="h-3.5 w-3.5" />Delete note</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          Deleted notes are only removed from frontend state until backend persistence is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm-archive") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Archive Coach"
        description={`${coach.name} will be marked archived in local state.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton
              tone="danger"
              onClick={() => {
                onArchiveCoach(coach.id, "Archived");
                onClose();
              }}
            ><actionIcons.archive className="h-3.5 w-3.5" />
              Archive coach
            </PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          This action is local-only until backend persistence is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  return null;
}

function ProfileEditForm({ values, errors, onChange }) {
  return (
    <div className="space-y-5">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
          </Field>
          <Field label="Staff ID" error={errors.staffId}>
            <TextInput value={values.staffId} onChange={(event) => onChange("staffId", event.target.value)} />
          </Field>
          <Field label="Status">
            <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
              {coachStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Experience" error={errors.experienceYears}>
            <TextInput value={values.experienceYears} onChange={(event) => onChange("experienceYears", event.target.value)} />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Coaching Assignment">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport">
            <TextInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)} />
          </Field>
          <Field label="Team">
            <TextInput value={values.team} onChange={(event) => onChange("team", event.target.value)} />
          </Field>
          <Field label="Role">
            <SelectInput value={values.role} onChange={(event) => onChange("role", event.target.value)}>
              {coachRoles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Specialization">
            <TextInput value={values.specialization} onChange={(event) => onChange("specialization", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Summary">
              <TextArea value={values.summary} onChange={(event) => onChange("summary", event.target.value)} />
            </Field>
          </div>
        </div>
      </FormSection>
      <FormSection title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email}>
            <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
          </Field>
          <Field label="Department">
            <TextInput value={values.department} onChange={(event) => onChange("department", event.target.value)} />
          </Field>
          <Field label="Office">
            <TextInput value={values.office} onChange={(event) => onChange("office", event.target.value)} />
          </Field>
        </div>
      </FormSection>
    </div>
  );
}

function SectionEditForm({ section, values, errors, onChange }) {
  if (section === "contact") {
    return (
      <div className="grid gap-4">
        <Field label="Email" error={errors.email}>
          <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
        </Field>
        <Field label="Address">
          <TextInput value={values.address} onChange={(event) => onChange("address", event.target.value)} />
        </Field>
      </div>
    );
  }

  if (section === "personal") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {["birthdate", "age", "gender", "nationality"].map((key) => (
          <Field key={key} label={labelize(key)}>
            <TextInput value={values[key]} onChange={(event) => onChange(key, event.target.value)} />
          </Field>
        ))}
      </div>
    );
  }

  if (section === "coaching") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sport">
          <TextInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)} />
        </Field>
        <Field label="Team">
          <TextInput value={values.team} onChange={(event) => onChange("team", event.target.value)} />
        </Field>
        <Field label="Role">
          <SelectInput value={values.role} onChange={(event) => onChange("role", event.target.value)}>
            {coachRoles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Certification level">
          <TextInput value={values.certificationLevel} onChange={(event) => onChange("certificationLevel", event.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Specialization">
            <TextArea value={values.specialization} onChange={(event) => onChange("specialization", event.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {["name", "staffId", "department", "office", "experienceYears", "status"].map((key) => (
        <Field key={key} label={labelize(key)} error={errors[key]}>
          {key === "status" ? (
            <SelectInput value={values[key]} onChange={(event) => onChange(key, event.target.value)}>
              {coachStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          ) : (
            <TextInput value={values[key]} onChange={(event) => onChange(key, event.target.value)} />
          )}
        </Field>
      ))}
    </div>
  );
}

function ScheduleForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Title" error={errors.title}>
        <TextInput value={values.title} onChange={(event) => onChange("title", event.target.value)} />
      </Field>
      <Field label="Type">
        <TextInput value={values.type} onChange={(event) => onChange("type", event.target.value)} />
      </Field>
      <Field label="Date">
        <TextInput value={values.date} onChange={(event) => onChange("date", event.target.value)} placeholder="May 20, 2026" />
      </Field>
      <Field label="Venue">
        <TextInput value={values.venue} onChange={(event) => onChange("venue", event.target.value)} />
      </Field>
      <Field label="Status">
        <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
          {scheduleStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Responsibility">
        <TextInput value={values.responsibility} onChange={(event) => onChange("responsibility", event.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Summary">
          <TextArea value={values.summary} onChange={(event) => onChange("summary", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function CredentialForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Credential name" error={errors.name}>
        <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
      </Field>
      <Field label="Issuer">
        <TextInput value={values.issuer} onChange={(event) => onChange("issuer", event.target.value)} />
      </Field>
      <Field label="Valid until">
        <TextInput value={values.validUntil} onChange={(event) => onChange("validUntil", event.target.value)} placeholder="Nov 2027" />
      </Field>
      <Field label="Status">
        <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
          {credentialStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="File type">
        <SelectInput value={values.kind} onChange={(event) => onChange("kind", event.target.value)}>
          <option>pdf</option>
          <option>image</option>
          <option>doc</option>
        </SelectInput>
      </Field>
      <Field label="Selected file">
        <TextInput value={values.fileName} onChange={(event) => onChange("fileName", event.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes">
          <TextArea value={values.meta} onChange={(event) => onChange("meta", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function ProfileCard({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-[24px] border border-border-subtle/50 bg-surface-card p-6 shadow-soft ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/85 p-4">
      <div className="flex items-start gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-bold uppercase leading-[1.35] tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-[14px] font-semibold text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{value || "Pending"}</p>
      </div>
    </div>
  );
}

function MetricTile({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "blue"
      ? "bg-brand-blue-light text-brand-blue"
      : tone === "gold"
        ? "bg-brand-gold-light text-brand-gold-hover"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2.5 text-[20px] font-extrabold tracking-tight text-slate-900">{value}</p>
      <span className={`mt-2.5 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${toneClass}`}>
        {hint || "Local state"}
      </span>
    </div>
  );
}

function ActionCard({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle/60 bg-white p-4 text-left transition-colors hover:border-brand-blue/25 hover:bg-brand-blue-light/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[13px] font-bold text-slate-800">{title}</span>
    </button>
  );
}

function AlertCard({ alert }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${alert.level === "attention" ? "bg-amber-100 text-amber-700" : "bg-brand-blue-light text-brand-blue"}`}>
          {alert.level === "attention" ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{alert.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{alert.body}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
      <p className="text-[14px] font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function SmallAction({ children, icon: Icon, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
        tone === "danger"
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-brand-blue-light text-brand-blue hover:bg-slate-100"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function StatusChip({ value }) {
  const tone =
    value === "Valid" || value === "Current" || value === "Active" || value === "Confirmed" || value === "Completed"
      ? "bg-green-50 text-green-700"
      : value === "Expiring Soon" || value === "Renewal Due" || value === "Ongoing" || value === "Pending Review"
        ? "bg-amber-50 text-amber-700"
        : value === "Expired" || value === "Cancelled"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600";

  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{value}</span>;
}

function EventStatusPill({ value }) {
  return <StatusChip value={value} />;
}

function DocumentIcon({ kind }) {
  const iconClass =
    kind === "image"
      ? "bg-slate-100 text-slate-500"
      : kind === "doc"
        ? "bg-brand-blue-light text-brand-blue"
        : "bg-red-50 text-red-500";

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
      {kind === "image" ? <ImageIcon className="h-5 w-5" /> : kind === "doc" ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-5">
      <h3 className="mb-4 text-[14px] font-bold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function profileToForm(coach) {
  return {
    name: coach.name,
    staffId: coach.staffId,
    status: coach.status,
    experienceYears: String(coach.experienceYears ?? ""),
    sport: coach.sport,
    team: coach.team,
    role: coach.role,
    specialization: coach.specialization,
    summary: coach.overview?.summary ?? "",
    email: coach.email,
    phone: coach.phone,
    department: coach.department,
    office: coach.office,
  };
}

function staffToForm(coach) {
  return {
    name: coach.name,
    staffId: coach.staffId,
    department: coach.department,
    office: coach.office,
    experienceYears: String(coach.experienceYears ?? ""),
    status: coach.status,
  };
}

function contactToForm(coach) {
  return { email: coach.email, phone: coach.phone, address: coach.address };
}

function personalToForm(coach) {
  return {
    birthdate: coach.profile?.birthdate ?? "",
    age: coach.profile?.age ?? "",
    gender: coach.profile?.gender ?? "",
    nationality: coach.profile?.nationality ?? "",
  };
}

function coachingToForm(coach) {
  return {
    sport: coach.sport,
    team: coach.team,
    role: coach.role,
    certificationLevel: coach.profile?.certificationLevel ?? "",
    specialization: coach.specialization,
  };
}

function emptyNoteForm(type = "Administrative") {
  return { type, title: "", body: "" };
}

function noteToForm(note) {
  return { type: note.type, title: note.title, body: note.body };
}

function scheduleToForm(event) {
  return {
    title: event.title,
    type: event.type,
    date: event.date,
    venue: event.venue,
    status: event.status,
    attendance: event.attendance ?? "",
    responsibility: event.responsibility ?? event.coach ?? "",
    summary: event.summary ?? "",
  };
}

function credentialToForm(credential) {
  return {
    name: credential.name,
    issuer: credential.issuer ?? "",
    validUntil: credential.validUntil ?? "",
    status: credential.status ?? "Pending Review",
    kind: credential.kind ?? "pdf",
    fileName: credential.fileName ?? "",
    meta: credential.meta ?? "",
  };
}

function saveProfileForm(modal, onSetModal, updateCoach) {
  const errors = validateProfileForm(modal.values);
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateCoach(
    (coach) => ({
      ...coach,
      id: modal.values.staffId.trim(),
      name: modal.values.name.trim(),
      staffId: modal.values.staffId.trim(),
      status: modal.values.status,
      experienceYears: Number(modal.values.experienceYears || 0),
      sport: modal.values.sport.trim(),
      team: modal.values.team.trim(),
      role: modal.values.role,
      specialization: modal.values.specialization.trim(),
      email: modal.values.email.trim(),
      phone: modal.values.phone.trim(),
      department: modal.values.department.trim(),
      office: modal.values.office.trim(),
      overview: { ...coach.overview, summary: modal.values.summary.trim() || coach.overview?.summary },
    }),
    { title: "Coach updated", message: "Coach profile changes were saved locally." },
  );
}

function saveSectionForm(modal, onSetModal, updateCoach) {
  const errors = validateSectionForm(modal.section, modal.values);
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateCoach(
    (coach) => {
      if (modal.section === "contact") {
        return { ...coach, email: modal.values.email.trim(), phone: modal.values.phone.trim(), address: modal.values.address.trim() };
      }
      if (modal.section === "personal") {
        return { ...coach, profile: { ...coach.profile, ...modal.values } };
      }
      if (modal.section === "coaching") {
        return {
          ...coach,
          sport: modal.values.sport.trim(),
          team: modal.values.team.trim(),
          role: modal.values.role,
          specialization: modal.values.specialization.trim(),
          profile: { ...coach.profile, certificationLevel: modal.values.certificationLevel.trim() },
        };
      }
      return {
        ...coach,
        id: modal.values.staffId.trim(),
        name: modal.values.name.trim(),
        staffId: modal.values.staffId.trim(),
        department: modal.values.department.trim(),
        office: modal.values.office.trim(),
        experienceYears: Number(modal.values.experienceYears || 0),
        status: modal.values.status,
      };
    },
    { title: "Coach details updated", message: `${sectionTitle(modal.section)} was updated locally.` },
  );
}

function saveNote(modal, onSetModal, updateCoach) {
  const errors = {};
  if (!modal.values.title.trim()) errors.title = "Title is required.";
  if (!modal.values.body.trim()) errors.body = "Note body is required.";
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  const payload = {
    id: modal.noteId ?? `NOTE-${Date.now()}`,
    type: modal.values.type,
    title: modal.values.title.trim(),
    owner: "Athletics Staff",
    date: new Date().toLocaleDateString(),
    body: modal.values.body.trim(),
  };

  if (modal.noteId) {
    updateCoach(
      (current) => ({
        ...current,
        notes: (current.notes ?? []).map((note) => (note.id === modal.noteId ? payload : note)),
      }),
      { title: "Note updated", message: "Coach note was updated locally." },
    );
  } else {
    updateCoach(
      (current) => ({
        ...current,
        notes: [payload, ...(current.notes ?? [])],
      }),
      { title: "Note saved", message: "The coach note was saved locally." },
    );
  }
}

function assignAthletes(modal, onSetModal, updateCoach) {
  if (modal.selectedIds.length === 0) {
    onSetModal((current) => ({ ...current, error: "Choose at least one athlete before assigning." }));
    return;
  }

  updateCoach(
    (coach) => {
      const existingIds = new Set((coach.assignedAthletes ?? []).map((athlete) => athlete.athleteId));
      const additions = athletePool
        .filter((athlete) => modal.selectedIds.includes(athlete.id) && !existingIds.has(athlete.id))
        .map((athlete) => ({
          id: `LOCAL-${coach.id}-${athlete.id}-${Date.now()}`,
          athleteId: athlete.id,
          name: athlete.name,
          studentId: athlete.studentId,
          sport: athlete.sport,
          team: athlete.team,
          yearLevel: athlete.yearLevel,
          status: "Assigned",
          eligibility: "Pending review",
          role: athlete.role,
          participationStatus: "Assigned",
          eventTitle: "Direct coach assignment",
          eventDate: new Date().toLocaleDateString(),
          coachRemarks: "Assigned locally from coach profile.",
          strengthsObserved: athlete.role,
        }));
      const nextAssignments = [...(coach.assignedAthletes ?? []), ...additions];
      return {
        ...coach,
        assignedAthletes: nextAssignments,
        assignedAthleteCount: new Set(nextAssignments.map((athlete) => athlete.athleteId)).size,
        schedule: {
          ...coach.schedule,
          summary: summarizeSchedule(coach.schedule?.items ?? [], nextAssignments.length),
        },
      };
    },
    { title: "Athletes assigned", message: "Selected athletes were linked to this coach locally." },
  );
}

function removeAssignedAthlete(athlete, updateCoach) {
  updateCoach(
    (coach) => {
      const nextAssignments = (coach.assignedAthletes ?? []).filter((item) => item.id !== athlete.id);
      return {
        ...coach,
        assignedAthletes: nextAssignments,
        assignedAthleteCount: new Set(nextAssignments.map((item) => item.athleteId)).size,
        schedule: {
          ...coach.schedule,
          summary: summarizeSchedule(coach.schedule?.items ?? [], nextAssignments.length),
        },
      };
    },
    { tone: "warning", title: "Assignment removed", message: `${athlete.name} was removed from this coach locally.` },
  );
}

function saveSchedule(modal, onSetModal, updateCoach) {
  const errors = {};
  if (!modal.values.title.trim()) errors.title = "Schedule title is required.";
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateCoach(
    (coach) => {
      const item = {
        id: modal.mode === "edit" ? modal.eventId : `SCH-${Date.now()}`,
        title: modal.values.title.trim(),
        type: modal.values.type.trim() || "Training",
        date: modal.values.date.trim() || "Date pending",
        venue: modal.values.venue.trim() || "Venue pending",
        status: modal.values.status,
        attendance: modal.values.attendance || `${coach.assignedAthleteCount ?? 0} athletes`,
        result: modal.values.status === "Completed" ? "Event closed" : "Active roster",
        responsibility: modal.values.responsibility.trim() || coach.role,
        coach: modal.values.responsibility.trim() || coach.role,
        summary: modal.values.summary.trim(),
      };
      const currentItems = coach.schedule?.items ?? [];
      const nextItems =
        modal.mode === "edit"
          ? currentItems.map((event) => (event.id === modal.eventId ? item : event))
          : [item, ...currentItems];
      return {
        ...coach,
        nextEventLabel: nextItems.find((event) => event.status === "Scheduled" || event.status === "Ongoing")?.date ?? coach.nextEventLabel,
        nextEventTitle: nextItems.find((event) => event.status === "Scheduled" || event.status === "Ongoing")?.title ?? coach.nextEventTitle,
        schedule: {
          ...coach.schedule,
          items: nextItems,
          notes: nextItems.map((event) => ({ title: event.title, date: event.date, description: event.summary })),
          summary: summarizeSchedule(nextItems, coach.assignedAthleteCount ?? 0),
        },
      };
    },
    { title: "Schedule saved", message: "Coach schedule was updated locally." },
  );
}

function updateScheduleStatus(modal, updateCoach) {
  updateCoach(
    (coach) => {
      const nextItems = (coach.schedule?.items ?? []).map((event) =>
        event.id === modal.eventId ? { ...event, status: modal.status } : event,
      );
      return {
        ...coach,
        schedule: { ...coach.schedule, items: nextItems, summary: summarizeSchedule(nextItems, coach.assignedAthleteCount ?? 0) },
      };
    },
    { title: "Schedule status updated", message: "The schedule item status changed locally." },
  );
}

function cancelScheduleItem(event, updateCoach) {
  updateCoach(
    (coach) => {
      const nextItems = (coach.schedule?.items ?? []).map((item) =>
        item.id === event.id ? { ...item, status: "Cancelled", result: "Cancelled" } : item,
      );
      return {
        ...coach,
        schedule: { ...coach.schedule, items: nextItems, summary: summarizeSchedule(nextItems, coach.assignedAthleteCount ?? 0) },
      };
    },
    { tone: "warning", title: "Schedule item cancelled", message: `${event.title} was marked cancelled locally.` },
  );
}

function saveCredential(modal, onSetModal, updateCoach) {
  const errors = {};
  if (!modal.values.name.trim()) errors.name = "Credential name is required.";
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateCoach(
    (coach) => {
      const credential = {
        id: modal.mode === "edit" ? modal.credentialId : `CERT-${Date.now()}`,
        name: modal.values.name.trim(),
        issuer: modal.values.issuer.trim(),
        validUntil: modal.values.validUntil.trim(),
        status: modal.values.status,
        kind: modal.values.kind,
        fileName: modal.values.fileName.trim(),
        meta:
          modal.values.meta.trim() ||
          `${modal.values.status} | ${modal.values.validUntil.trim() || "Validity pending"}`,
      };
      const current = coach.certifications ?? [];
      const next = modal.mode === "edit" ? current.map((item) => (item.id === modal.credentialId ? credential : item)) : [credential, ...current];
      return { ...coach, certifications: next };
    },
    { title: "Credential saved", message: "Coach credential was updated locally." },
  );
}

function uploadCredential(modal, onSetModal, updateCoach) {
  if (!modal.fileName.trim()) {
    onSetModal((current) => ({ ...current, error: "Enter a selected file name." }));
    return;
  }

  updateCoach(
    (coach) => ({
      ...coach,
      certifications: (coach.certifications ?? []).map((item) =>
        item.id === modal.credential.id
          ? { ...item, fileName: modal.fileName.trim(), meta: `${item.status} | ${modal.fileName.trim()}` }
          : item,
      ),
    }),
    { title: "Credential file saved", message: "The selected file name was stored in local state." },
  );
}

function verifyCredential(credential, updateCoach) {
  updateCoach(
    (coach) => ({
      ...coach,
      certifications: (coach.certifications ?? []).map((item) =>
        item.id === credential.id ? { ...item, status: "Valid" } : item,
      ),
    }),
    { title: "Credential verified", message: `${credential.name} was marked valid locally.` },
  );
}

function removeCredential(credential, updateCoach) {
  updateCoach(
    (coach) => ({
      ...coach,
      certifications: (coach.certifications ?? []).filter((item) => item.id !== credential.id),
    }),
    { tone: "warning", title: "Credential removed", message: `${credential.name} was removed locally.` },
  );
}

function deleteNote(note, updateCoach) {
  updateCoach(
    (coach) => ({
      ...coach,
      notes: (coach.notes ?? []).filter((item) => item.id !== note.id),
    }),
    { tone: "warning", title: "Note deleted", message: "The coach note was removed locally." },
  );
}

function summarizeSchedule(items, athleteCount) {
  return {
    total: String(items.length),
    completed: String(items.filter((event) => event.status === "Completed").length),
    upcoming: String(items.filter((event) => event.status === "Scheduled" || event.status === "Ongoing").length),
    athleteCoverage: `${athleteCount} assigned`,
  };
}

function validateProfileForm(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Full name is required.";
  if (!values.staffId.trim()) errors.staffId = "Staff ID is required.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.phone && !/^[+()\d\s-]{7,}$/.test(values.phone)) errors.phone = "Enter a valid contact number.";
  if (values.experienceYears && (Number.isNaN(Number(values.experienceYears)) || Number(values.experienceYears) < 0)) {
    errors.experienceYears = "Experience must be a positive number.";
  }
  return errors;
}

function validateSectionForm(section, values) {
  if (section !== "contact" && section !== "staff") return {};
  const errors = {};
  if (section === "staff") {
    if (!values.name.trim()) errors.name = "Full name is required.";
    if (!values.staffId.trim()) errors.staffId = "Staff ID is required.";
    if (values.experienceYears && (Number.isNaN(Number(values.experienceYears)) || Number(values.experienceYears) < 0)) {
      errors.experienceYears = "Experience must be a positive number.";
    }
  }
  if (section === "contact") {
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
    if (values.phone && !/^[+()\d\s-]{7,}$/.test(values.phone)) errors.phone = "Enter a valid contact number.";
  }
  return errors;
}

function sectionTitle(section) {
  const titles = {
    staff: "Staff Details",
    contact: "Contact Details",
    personal: "Personal Information",
    coaching: "Coaching Profile",
  };
  return titles[section] ?? "Coach Details";
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
