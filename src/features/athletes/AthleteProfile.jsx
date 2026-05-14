import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  PencilLine,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Upload,
  UserRound,
  Trophy,
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
import { academicStandings, athleteStatuses, scholarshipTypes, sports, yearLevels } from "./athletesMockData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Detailed Info" },
  { id: "academics", label: "Academics" },
  { id: "events", label: "Events" },
  { id: "assets", label: "Documents & Gear" },
];

const tabCopy = {
  overview: {
    title: "Athlete Snapshot",
    description: "Latest profile summary, priorities, alerts, and recent activity.",
  },
  details: {
    title: "Detailed Athlete Information",
    description: "Identity, contact, emergency, physical, sport, and team assignment details.",
  },
  academics: {
    title: "Academic Monitoring",
    description: "Track GPA, eligibility, attendance, adviser notes, and recent updates.",
  },
  events: {
    title: "Events Participation",
    description: "Review assigned events, participation status, results, and result notes.",
  },
  assets: {
    title: "Documents and Equipment",
    description: "Manage required documents, file statuses, issued gear, and return workflows.",
  },
};

const equipmentIcons = {
  shoe: ImageIcon,
  strength: Dumbbell,
  monitor: Activity,
  default: Package,
};

export function AthleteProfile({
  athlete,
  initialTab = "overview",
  onBack,
  onSelectTab,
  onUpdateAthlete,
  onAddNote,
  onArchiveAthlete,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [modal, setModal] = useState(null);
  const [eventPage, setEventPage] = useState(0);
  const [activeOverflowMenuId, setActiveOverflowMenuId] = useState(null);
  const tabSectionRef = useRef(null);
  const eventsPerPage = 3;

  const activeCopy = tabCopy[activeTab];

  const updateAthlete = (updater, feedback) => {
    onUpdateAthlete(athlete.id, updater, feedback);
  };

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

  const statusTone =
    athlete.status === "Cleared"
      ? "bg-green-50 text-green-700"
      : athlete.status === "Pending Review"
        ? "bg-amber-50 text-amber-700"
        : athlete.status === "Archived" || athlete.status === "Inactive"
          ? "bg-slate-100 text-slate-600"
          : "bg-red-50 text-red-700";

  const eventSummary = useMemo(() => {
    const items = athlete.eventsParticipation?.items ?? [];
    const completed = items.filter((item) => item.status === "Completed").length;
    const upcoming = items.filter((item) => item.status === "Upcoming" || item.status === "Ongoing").length;
    const present = items.filter((item) => item.attendance === "Present").length;
    const attendance = items.length ? `${Math.round((present / items.length) * 100)}%` : "No data";

    return {
      total: String(items.length),
      completed: String(completed),
      upcoming: String(upcoming),
      attendance,
    };
  }, [athlete.eventsParticipation]);

  const currentTabContent = {
    overview: (
      <OverviewTab
        athlete={athlete}
        onOpenTab={switchTab}
        onOpenModal={setModal}
      />
    ),
    details: <DetailsTab athlete={athlete} onOpenModal={setModal} />,
    academics: <AcademicsTab athlete={athlete} onOpenModal={setModal} />,
    events: (
      <EventsTab
        athlete={athlete}
        summary={eventSummary}
        eventPage={eventPage}
        eventsPerPage={eventsPerPage}
        setEventPage={setEventPage}
          activeOverflowMenuId={activeOverflowMenuId}
          setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
    assets: (
      <AssetsTab
        athlete={athlete}
        activeOverflowMenuId={activeOverflowMenuId}
        setActiveOverflowMenuId={setActiveOverflowMenuId}
        onOpenModal={setModal}
      />
    ),
  }[activeTab];

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roster
      </button>

      <div className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <img
                src={athlete.imageUrl}
                alt={athlete.name}
                className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-soft"
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{athlete.name}</h1>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone}`}>
                    {athlete.status}
                  </span>
                </div>
                <p className="text-[15px] font-medium text-brand-blue">
                  {[athlete.sport, athlete.department].filter(Boolean).join(" | ")}
                </p>
                <p className="max-w-3xl text-sm leading-6 text-slate-500">{athlete.overview.summary}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={UserRound} label="Student ID" value={athlete.id} />
              <ProfileBadge icon={CalendarDays} label="Year Level" value={athlete.year} />
              <ProfileBadge icon={ShieldCheck} label="Standing" value={athlete.standing} />
              <ProfileBadge icon={Clock3} label="Coach" value={athlete.coach || "Unassigned"} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Profile Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setModal({ type: "edit-profile", values: profileToForm(athlete), errors: {} })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <PencilLine className="h-4 w-4" />
                Edit Athlete
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
                onClick={() => setModal({ type: "status", status: athlete.status, scholarship: athlete.scholarship, note: "" })}
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
        className="relative isolate overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft"
      >
        <section className="border-b border-border-subtle/70 bg-surface-card pb-6 pt-5 shadow-[0_1px_0_0_rgba(241,245,249,0.95),0_14px_24px_-24px_rgba(15,58,110,0.55)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Athlete Workspace</p>
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">{activeCopy.title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{activeCopy.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
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
        </section>
        <div className="relative z-0 pt-5">
          {currentTabContent}
        </div>
      </div>

      <AthleteProfileModal
        modal={modal}
        athlete={athlete}
        onClose={() => setModal(null)}
        onSetModal={setModal}
        onUpdateAthlete={updateAthlete}
        onAddNote={onAddNote}
        onArchiveAthlete={onArchiveAthlete}
        switchTab={switchTab}
      />
    </div>
  );
}

function OverviewTab({ athlete, onOpenTab, onOpenModal }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Eligibility" value={athlete.overview.eligibility} hint={athlete.overview.eligibilityNote} tone="blue" />
        <MetricTile label="Training Load" value={athlete.overview.trainingLoad} hint={athlete.overview.trainingNote} tone="gold" />
        <MetricTile label="Next Review" value={athlete.overview.nextReview} hint={athlete.overview.reviewOwner} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ProfileCard
          title="Quick Actions"
          action={
            <button
              type="button"
              onClick={() => onOpenModal({ type: "note", value: "", error: "" })}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
            >
              <actionIcons.addNote className="h-3.5 w-3.5" />
              Add note
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard icon={FileText} title="View full details" onClick={() => onOpenTab("details")} />
            <ActionCard icon={ShieldCheck} title="Update status" onClick={() => onOpenModal({ type: "status", status: athlete.status, scholarship: athlete.scholarship, note: "" })} />
            <ActionCard icon={CalendarDays} title="View events" onClick={() => onOpenTab("events")} />
            <ActionCard icon={Package} title="View documents" onClick={() => onOpenTab("assets")} />
          </div>
        </ProfileCard>

        <ProfileCard title="Current Focus and Alerts">
          {(athlete.overview.alerts ?? []).length === 0 ? (
            <EmptyState title="No active alerts" body="Any staff alerts or current focus items will appear here." />
          ) : (
            <div className="grid gap-3">
              {athlete.overview.alerts.map((alert) => (
                <AlertCard key={alert.title} alert={alert} />
              ))}
            </div>
          )}
        </ProfileCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileCard title="Milestones and Recognition">
          {(athlete.achievements ?? []).length === 0 ? (
            <EmptyState title="No milestones yet" body="Recognition and notable athlete milestones will appear after staff add them." />
          ) : (
            <div className="space-y-3">
              {athlete.achievements.map((item) => (
                <div key={`${item.date}-${item.title}`} className="flex gap-4 rounded-2xl border border-border-subtle/60 bg-white p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gold-light text-brand-gold-hover">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-[12px] text-slate-500">{item.date}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>

        <ProfileCard title="Recent Activity">
          {(athlete.overview.recentActivity ?? []).length === 0 ? (
            <EmptyState title="No recent activity" body="Saved notes and local changes will appear here." />
          ) : (
            <div className="space-y-3">
              {athlete.overview.recentActivity.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4 text-[13px] leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}

function DetailsTab({ athlete, onOpenModal }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <ProfileCard
          title="Personal Record"
          action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "personal", values: personalToForm(athlete) })}>Edit</SmallAction>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Full name" value={athlete.name} />
            <DetailField label="Student ID" value={athlete.id} />
            <DetailField label="Birthdate" value={athlete.personal.birthdate || "Pending"} />
            <DetailField label="Age" value={athlete.personal.age || "Pending"} />
            <DetailField label="Gender" value={athlete.personal.gender || "Pending"} />
            <DetailField label="Nationality" value={athlete.personal.nationality || "Pending"} />
            <DetailField label="Height" value={athlete.personal.height || "Pending"} />
            <DetailField label="Weight" value={athlete.personal.weight || "Pending"} />
            <DetailField label="Blood type" value={athlete.personal.bloodType || "Pending"} />
            <DetailField label="Dominant side" value={athlete.personal.side || "Pending"} />
          </div>
        </ProfileCard>

        <ProfileCard
          title="Sport Profile"
          action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "sport", values: sportToForm(athlete) })}>Edit</SmallAction>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Sport / Team" value={athlete.sport} />
            <DetailField label="Event / Position" value={athlete.event || "Pending"} />
            <DetailField label="Coach" value={athlete.coach || "Unassigned"} />
            <DetailField label="Scholarship" value={athlete.scholarship} />
          </div>
        </ProfileCard>
      </div>

      <div className="space-y-6">
        <ProfileCard
          title="Contact Details"
          action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "contact", values: contactToForm(athlete) })}>Edit</SmallAction>}
        >
          <div className="space-y-4">
            <InfoRow icon={Phone} label="Mobile" value={athlete.contact.phone || "Pending"} />
            <InfoRow icon={Mail} label="Email" value={athlete.contact.email || "Pending"} />
            <InfoRow icon={MapPin} label="Address" value={athlete.contact.address || "Pending"} />
          </div>
        </ProfileCard>

        <ProfileCard
          title="Emergency Contact"
          action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-section", section: "emergency", values: emergencyToForm(athlete) })}>Edit</SmallAction>}
        >
          <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
            <p className="text-[14px] font-semibold text-slate-900">{athlete.contact.emergency.name || "Pending"}</p>
            <p className="text-[13px] text-slate-600">{athlete.contact.emergency.relationship || "Relationship pending"}</p>
            <p className="mt-1 text-[13px] text-slate-700">{athlete.contact.emergency.phone || "Phone pending"}</p>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}

function AcademicsTab({ athlete, onOpenModal }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <ProfileCard
          title="Eligibility Summary"
          action={<SmallAction icon={actionIcons.edit} onClick={() => onOpenModal({ type: "edit-academics", values: academicsToForm(athlete), errors: {} })}>Edit</SmallAction>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricTile label="Current GPA" value={`${Number(athlete.gpa).toFixed(2)} / 4.0`} hint={athlete.standing} tone="blue" />
            <MetricTile label="Attendance" value={athlete.academics.attendance} hint={athlete.academics.attendanceNote} tone="gold" />
            <MetricTile label="Units Enrolled" value={athlete.academics.units} hint={athlete.academics.term} />
            <MetricTile label="Eligibility" value={athlete.academics.eligibility} hint={athlete.academics.eligibilityNote} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <SecondaryButton onClick={() => onOpenModal({ type: "academic-note", values: { title: "", owner: "", body: "" }, errors: {} })}><actionIcons.addNote className="h-3.5 w-3.5" />Add academic note</SecondaryButton>
            <SecondaryButton onClick={() => onOpenModal({ type: "eligibility", value: athlete.academics.eligibility, note: athlete.academics.eligibilityNote })}><actionIcons.updateStatus className="h-3.5 w-3.5" />Update eligibility</SecondaryButton>
            <SecondaryButton onClick={() => onOpenModal({ type: "academic-history" })}><actionIcons.view className="h-3.5 w-3.5" />View history</SecondaryButton>
          </div>
        </ProfileCard>

        <ProfileCard title="Adviser and Support Notes">
          {(athlete.academics.notes ?? []).length === 0 ? (
            <EmptyState title="No academic notes" body="Add adviser notes or support actions for academic monitoring." />
          ) : (
            <div className="space-y-3">
              {athlete.academics.notes.map((note, index) => (
                <div key={`${note.title}-${index}`} className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-slate-900">{note.title}</p>
                    <p className="text-[11px] text-slate-500">{note.owner}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{note.date}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{note.body}</p>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>
      </div>

      <ProfileCard title="Semester Trend and Subjects">
        {(athlete.academics.trend ?? []).length === 0 ? (
          <EmptyState title="No academic records" body="Semester trend data will appear after academic records are connected." />
        ) : (
          <div className="space-y-5">
            <div className="flex h-56 items-end justify-between gap-3 rounded-[24px] border border-border-subtle/60 bg-slate-50/70 px-5 pb-10 pt-6">
              {athlete.academics.trend.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className={`w-full max-w-10 rounded-full ${item.active ? "bg-brand-blue shadow-soft" : "bg-slate-200"}`}
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${item.active ? "text-brand-blue" : "text-slate-400"}`}>
                      {item.label}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-700">{item.score}</p>
                  </div>
                </div>
              ))}
            </div>
            {(athlete.academics.currentSubjects ?? []).length === 0 ? (
              <EmptyState title="No current subjects" body="Course subjects will appear when academic records are available." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {athlete.academics.currentSubjects.map((subject) => (
                  <div key={subject.name} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">{subject.name}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        {subject.grade}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-500">{subject.schedule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

function EventsTab({
  athlete,
  summary,
  eventPage,
  eventsPerPage,
  setEventPage,
  activeOverflowMenuId,
  setActiveOverflowMenuId,
  onOpenModal,
}) {
  const items = athlete.eventsParticipation?.items ?? [];
  const totalEventPages = Math.max(1, Math.ceil(items.length / eventsPerPage));
  const currentEventPage = Math.min(eventPage, totalEventPages - 1);
  const visibleEvents = items.slice(currentEventPage * eventsPerPage, currentEventPage * eventsPerPage + eventsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Events" value={summary.total} hint="This tracking cycle" tone="blue" />
        <MetricTile label="Completed" value={summary.completed} hint="Finished participation" tone="gold" />
        <MetricTile label="Upcoming" value={summary.upcoming} hint="Still scheduled" />
        <MetricTile label="Attendance" value={summary.attendance} hint="Session presence rate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ProfileCard title="Participation History">
          {visibleEvents.length === 0 ? (
            <EmptyState title="No assigned events" body="Assigned training sessions and competitions will appear here." />
          ) : (
            <div className="space-y-3">
              {visibleEvents.map((event) => (
                <div key={event.id} className="rounded-[22px] border border-border-subtle/60 bg-white p-5 shadow-soft sm:p-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[16px] font-semibold tracking-tight text-slate-900">{event.title}</p>
                          <EventStatusPill value={event.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-600">
                          <EventMetaChip icon={Trophy} label={event.type} />
                          <EventMetaChip icon={CalendarDays} label={event.date} accent />
                          <EventMetaChip icon={MapPin} label={event.venue} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <EventMiniStat label="Participation" value={event.participation} icon={UserRound} tone="mint" />
                      <EventMiniStat label="Result" value={event.result} icon={Award} tone="sand" />
                      <EventMiniStat label="Coach" value={event.coach} icon={UserRound} tone="slate" />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border-subtle/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold uppercase text-brand-blue">
                          {getInitials(event.coach)}
                        </div>
                        <p className="text-[13px] leading-relaxed text-slate-600">
                          Coached by <span className="font-semibold text-slate-900">{event.coach}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => onOpenModal({ type: "event-details", eventId: event.id })}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-[12px] font-bold tracking-wide text-brand-blue shadow-soft transition-colors hover:bg-brand-blue-light"
                        >
                          <actionIcons.viewDetails className="h-3.5 w-3.5" />
                          View details
                        </button>
                        <ActionMenu
                          label={`More actions for ${event.title}`}
                          open={activeOverflowMenuId === `event-${event.id}`}
                          onToggle={() =>
                            setActiveOverflowMenuId((current) =>
                              current === `event-${event.id}` ? null : `event-${event.id}`,
                            )
                          }
                          onClose={() => setActiveOverflowMenuId(null)}
                          widthClass="w-48"
                          items={[
                            {
                              icon: actionIcons.updateStatus,
                              label: "Update participation",
                              onClick: () => onOpenModal({ type: "event-status", eventId: event.id, participation: event.participation, attendance: event.attendance }),
                            },
                            {
                              icon: actionIcons.addNote,
                              label: "Add result note",
                              onClick: () => onOpenModal({ type: "result-note", eventId: event.id, value: "", error: "" }),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > eventsPerPage && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-brand-blue/15 bg-brand-blue-light/80 px-4 py-3 shadow-soft">
              <button
                type="button"
                onClick={() => setEventPage((page) => Math.max(0, page - 1))}
                disabled={currentEventPage === 0}
                className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-soft transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">Page {currentEventPage + 1} of {totalEventPages}</p>
              <button
                type="button"
                onClick={() => setEventPage((page) => Math.min(totalEventPages - 1, page + 1))}
                disabled={currentEventPage >= totalEventPages - 1}
                className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-soft transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </ProfileCard>

        <ProfileCard title="Participation Notes">
          {(athlete.eventsParticipation.notes ?? []).length === 0 ? (
            <EmptyState title="No event notes" body="Result notes and participation comments will appear here." />
          ) : (
            <div className="space-y-4">
              {athlete.eventsParticipation.notes.map((entry, index) => (
                <div key={`${entry.date}-${entry.title}-${index}`} className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-slate-900">{entry.title}</p>
                    <span className="text-[11px] text-slate-500">{entry.date}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{entry.description}</p>
                </div>
              ))}
            </div>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}

function AssetsTab({ athlete, activeOverflowMenuId, setActiveOverflowMenuId, onOpenModal }) {
  return (
    <div className="space-y-6">
      <ProfileCard
        title="Digital Documents"
        action={
          <button
            type="button"
            onClick={() => onOpenModal({ type: "upload-document", values: { name: "", status: "Submitted", kind: "pdf", fileName: "" }, errors: {} })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
        }
      >
        {(athlete.documents ?? []).length === 0 ? (
          <EmptyState title="No documents uploaded" body="Upload medical, academic, identification, or scholarship files for this athlete." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {athlete.documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-border-subtle/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenModal({ type: "view-document", documentId: document.id })}
                    className="flex min-w-0 flex-1 items-start gap-4 text-left"
                  >
                    <DocumentIcon kind={document.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{document.name}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{document.meta}</p>
                      <div className="mt-2"><StatusPill status={document.status} /></div>
                    </div>
                  </button>
                  <div className="shrink-0">
                    <ActionMenu
                      label={`Document actions for ${document.name}`}
                      open={activeOverflowMenuId === `document-${document.id}`}
                      onToggle={() =>
                        setActiveOverflowMenuId((current) =>
                          current === `document-${document.id}` ? null : `document-${document.id}`,
                        )
                      }
                      onClose={() => setActiveOverflowMenuId(null)}
                      widthClass="w-48"
                      items={[
                        {
                          icon: actionIcons.edit,
                          label: "Replace",
                          onClick: () => onOpenModal({ type: "replace-document", documentId: document.id, values: { name: document.name, fileName: "" }, errors: {} }),
                        },
                        {
                          icon: actionIcons.remove,
                          label: "Remove",
                          tone: "danger",
                          onClick: () => onOpenModal({ type: "confirm-remove-document", documentId: document.id }),
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

      <ProfileCard
        title="Equipment History"
        action={
          <button
            type="button"
            onClick={() => onOpenModal({ type: "assign-gear", values: { name: "", serial: "", dueDate: "", condition: "Good" }, errors: {} })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Assign gear
          </button>
        }
      >
        {(athlete.equipmentHistory ?? []).length === 0 ? (
          <EmptyState title="No gear assigned" body="Assigned gear, issue dates, and return status will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle/60 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  <th className="p-5 pl-0">Item Description</th>
                  <th className="p-5">Issued Date</th>
                  <th className="p-5">Due Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                {athlete.equipmentHistory.map((item) => {
                  const Icon = equipmentIcons[item.icon] ?? equipmentIcons.default;
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="p-5 pl-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Icon className="h-5 w-5 opacity-60" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-[11px] text-slate-500">Serial: {item.serial}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-600">{item.issuedDate}</td>
                      <td className={`p-5 ${item.status === "Overdue" ? "font-semibold text-red-600" : "text-slate-600"}`}>{item.dueDate}</td>
                      <td className="p-5"><StatusPill status={item.status} /></td>
                      <td className="p-5 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <SmallAction icon={actionIcons.view} onClick={() => onOpenModal({ type: "view-gear", gearId: item.id })}>View</SmallAction>
                          <ActionMenu
                            label={`Gear actions for ${item.name}`}
                            open={activeOverflowMenuId === `gear-${item.id}`}
                            onToggle={() =>
                              setActiveOverflowMenuId((current) =>
                                current === `gear-${item.id}` ? null : `gear-${item.id}`,
                              )
                            }
                            onClose={() => setActiveOverflowMenuId(null)}
                            widthClass="w-48"
                            items={[
                              {
                                icon: actionIcons.markReturned,
                                label: "Returned",
                                onClick: () => onOpenModal({ type: "confirm-return-gear", gearId: item.id }),
                              },
                              {
                                icon: ShieldAlert,
                                label: "Issue",
                                tone: "danger",
                                onClick: () => onOpenModal({ type: "report-gear", gearId: item.id, value: "", error: "" }),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

function AthleteProfileModal({
  modal,
  athlete,
  onClose,
  onSetModal,
  onUpdateAthlete,
  onAddNote,
  onArchiveAthlete,
}) {
  if (!modal) return null;

  const updateModalValues = (key, value) => {
    onSetModal((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
      errors: { ...current.errors, [key]: undefined },
    }));
  };

  const currentEvent = modal.eventId
    ? athlete.eventsParticipation.items.find((event) => event.id === modal.eventId)
    : null;
  const currentDocument = modal.documentId
    ? athlete.documents.find((document) => document.id === modal.documentId)
    : null;
  const currentGear = modal.gearId
    ? athlete.equipmentHistory.find((item) => item.id === modal.gearId)
    : null;

  const updateAthlete = (updater, feedback) => {
    onUpdateAthlete(updater, feedback);
    onClose();
  };

  if (modal.type === "note") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Athlete Note"
        description="Add a local activity note to this athlete profile."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveProfileNote(modal, onSetModal, onAddNote, athlete, onClose)}><actionIcons.addNote className="h-3.5 w-3.5" />Save note</PrimaryButton></>}
      >
        <Field label="Note" error={modal.error}>
          <TextArea value={modal.value} onChange={(event) => onSetModal((current) => ({ ...current, value: event.target.value, error: "" }))} />
        </Field>
      </Modal>
    );
  }

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Update Athlete Status"
        description="Change roster status and scholarship classification locally."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => updateAthlete(
              (current) => ({
                ...current,
                status: modal.status,
                scholarship: modal.scholarship,
                overview: {
                  ...current.overview,
                  recentActivity: [
                    `${new Date().toLocaleDateString()} - Status changed to ${modal.status}. ${modal.note}`.trim(),
                    ...(current.overview.recentActivity ?? []),
                  ],
                },
              }),
              { title: "Status updated", message: `${athlete.name} now shows ${modal.status}.` },
            )}>Save status</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roster status">
            <SelectInput value={modal.status} onChange={(event) => onSetModal((current) => ({ ...current, status: event.target.value }))}>
              {athleteStatuses.map((status) => <option key={status}>{status}</option>)}
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput value={modal.scholarship} onChange={(event) => onSetModal((current) => ({ ...current, scholarship: event.target.value }))}>
              {scholarshipTypes.map((scholarship) => <option key={scholarship}>{scholarship}</option>)}
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status note">
              <TextArea value={modal.note} onChange={(event) => onSetModal((current) => ({ ...current, note: event.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "edit-profile") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Edit Athlete"
        description="Update key profile, academic, contact, and sport details."
        size="lg"
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveProfileForm(modal, onSetModal, updateAthlete)}>Save athlete</PrimaryButton></>}
      >
        <ProfileEditForm values={modal.values} errors={modal.errors} onChange={updateModalValues} />
      </Modal>
    );
  }

  if (modal.type === "edit-section") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Edit ${sectionTitle(modal.section)}`}
        description="Save changes locally. Cancel restores the previous profile values."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveSectionForm(modal, onSetModal, updateAthlete)}>Save changes</PrimaryButton></>}
      >
        <SectionEditForm section={modal.section} values={modal.values} errors={modal.errors ?? {}} onChange={updateModalValues} />
      </Modal>
    );
  }

  if (modal.type === "edit-academics") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Edit Academic Information"
        description="Update academic status, GPA, standing, attendance, and eligibility."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveAcademics(modal, onSetModal, updateAthlete)}>Save academics</PrimaryButton></>}
      >
        <AcademicsForm values={modal.values} errors={modal.errors} onChange={updateModalValues} />
      </Modal>
    );
  }

  if (modal.type === "academic-note") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Academic Note"
        description="Capture an adviser, registrar, or athlete services update."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveAcademicNote(modal, onSetModal, updateAthlete)}><actionIcons.addNote className="h-3.5 w-3.5" />Save note</PrimaryButton></>}
      >
        <div className="grid gap-4">
          <Field label="Title" error={modal.errors.title}>
            <TextInput value={modal.values.title} onChange={(event) => updateModalValues("title", event.target.value)} />
          </Field>
          <Field label="Owner">
            <TextInput value={modal.values.owner} onChange={(event) => updateModalValues("owner", event.target.value)} />
          </Field>
          <Field label="Note" error={modal.errors.body}>
            <TextArea value={modal.values.body} onChange={(event) => updateModalValues("body", event.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "eligibility") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Update Eligibility"
        description="Update eligibility status and the note shown in the academic summary."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => updateAthlete(
          (current) => ({
            ...current,
            academics: { ...current.academics, eligibility: modal.value, eligibilityNote: modal.note },
            overview: { ...current.overview, eligibility: modal.value, eligibilityNote: modal.note },
          }),
          { title: "Eligibility updated", message: "Academic eligibility was updated locally." },
        )}>Save eligibility</PrimaryButton></>}
      >
        <div className="grid gap-4">
          <Field label="Eligibility">
            <TextInput value={modal.value} onChange={(event) => onSetModal((current) => ({ ...current, value: event.target.value }))} />
          </Field>
          <Field label="Note">
            <TextArea value={modal.note} onChange={(event) => onSetModal((current) => ({ ...current, note: event.target.value }))} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "academic-history") {
    return (
      <Modal open onClose={onClose} title="Academic History" description="Recent academic updates for this athlete." footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        {(athlete.academics.history ?? []).length === 0 ? (
          <EmptyState title="No academic history" body="Academic history will appear once records are added." />
        ) : (
          <div className="space-y-3">
            {athlete.academics.history.map((item, index) => (
              <div key={`${item.date}-${index}`} className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
                <p className="text-[12px] font-bold text-brand-blue">{item.date}</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    );
  }

  if (modal.type === "event-details" && currentEvent) {
    return (
      <Modal open onClose={onClose} title={currentEvent.title} description={`${currentEvent.type} | ${currentEvent.date} | ${currentEvent.venue}`} footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        <div className="space-y-4">
          <FeedbackPanel tone="info" title={currentEvent.result}>{currentEvent.summary || "No event summary recorded."}</FeedbackPanel>
          <div className="flex flex-wrap gap-2">
            {(currentEvent.metrics ?? []).map((metric) => (
              <span key={metric} className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[12px] font-semibold text-brand-blue">{metric}</span>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "event-status" && currentEvent) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Update Participation"
        description={currentEvent.title}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => updateEvent(currentEvent.id, updateAthlete, { participation: modal.participation, attendance: modal.attendance })}>Save participation</PrimaryButton></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Participation">
            <SelectInput value={modal.participation} onChange={(event) => onSetModal((current) => ({ ...current, participation: event.target.value }))}>
              <option>Assigned</option>
              <option>Confirmed</option>
              <option>Participated</option>
              <option>Absent</option>
              <option>Excused</option>
            </SelectInput>
          </Field>
          <Field label="Attendance">
            <SelectInput value={modal.attendance} onChange={(event) => onSetModal((current) => ({ ...current, attendance: event.target.value }))}>
              <option>Scheduled</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Excused</option>
            </SelectInput>
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "result-note" && currentEvent) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Result Note"
        description={currentEvent.title}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveResultNote(modal, onSetModal, updateAthlete, currentEvent)}><actionIcons.addNote className="h-3.5 w-3.5" />Save note</PrimaryButton></>}
      >
        <Field label="Result note" error={modal.error}>
          <TextArea value={modal.value} onChange={(event) => onSetModal((current) => ({ ...current, value: event.target.value, error: "" }))} />
        </Field>
      </Modal>
    );
  }

  if ((modal.type === "upload-document" || modal.type === "replace-document") && (modal.type === "upload-document" || currentDocument)) {
    const isReplace = modal.type === "replace-document";
    return (
      <Modal
        open
        onClose={onClose}
        title={isReplace ? "Replace Document" : "Upload Document"}
        description={isReplace ? currentDocument.name : "Create a frontend-only file record."}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveDocument(modal, onSetModal, updateAthlete, currentDocument)}><actionIcons.upload className="h-3.5 w-3.5" />Save document</PrimaryButton></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document name" error={modal.errors.name}>
            <TextInput value={modal.values.name} onChange={(event) => updateModalValues("name", event.target.value)} />
          </Field>
          <Field label="Status">
            <SelectInput value={modal.values.status ?? currentDocument?.status ?? "Submitted"} onChange={(event) => updateModalValues("status", event.target.value)}>
              <option>Submitted</option>
              <option>Missing</option>
              <option>Expired</option>
              <option>Pending Review</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mock file selection" error={modal.errors.fileName}>
              <input
                type="file"
                onChange={(event) => updateModalValues("fileName", event.target.files?.[0]?.name ?? "")}
                className="w-full rounded-xl border border-dashed border-border-subtle bg-slate-50 px-4 py-4 text-[13px] text-slate-600"
              />
              {modal.values.fileName && <p className="mt-2 text-[12px] font-semibold text-brand-blue">Selected: {modal.values.fileName}</p>}
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "view-document" && currentDocument) {
    return (
      <Modal open onClose={onClose} title={currentDocument.name} description={currentDocument.meta} footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
        <FeedbackPanel tone="success" title={currentDocument.status}>
          File preview is not connected yet, but this record can be replaced or removed from the profile locally.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm-remove-document" && currentDocument) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Remove Document"
        description={`${currentDocument.name} will be removed from the local profile.`}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton tone="danger" onClick={() => updateAthlete(
          (current) => ({ ...current, documents: current.documents.filter((document) => document.id !== currentDocument.id) }),
          { tone: "warning", title: "Document removed", message: "The document record was removed locally." },
        )}><actionIcons.remove className="h-3.5 w-3.5" />Remove document</PrimaryButton></>}
      >
        <FeedbackPanel tone="warning" title="Confirmation required">This does not delete a real file because storage is not connected yet.</FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "assign-gear") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Assign Gear"
        description="Issue a frontend-only equipment record to this athlete."
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => saveGear(modal, onSetModal, updateAthlete)}><actionIcons.manageGear className="h-3.5 w-3.5" />Assign gear</PrimaryButton></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" error={modal.errors.name}>
            <TextInput value={modal.values.name} onChange={(event) => updateModalValues("name", event.target.value)} />
          </Field>
          <Field label="Serial" error={modal.errors.serial}>
            <TextInput value={modal.values.serial} onChange={(event) => updateModalValues("serial", event.target.value)} />
          </Field>
          <Field label="Due date">
            <TextInput type="date" value={modal.values.dueDate} onChange={(event) => updateModalValues("dueDate", event.target.value)} />
          </Field>
          <Field label="Condition">
            <SelectInput value={modal.values.condition} onChange={(event) => updateModalValues("condition", event.target.value)}>
              <option>Good</option>
              <option>Needs review</option>
              <option>Damaged</option>
            </SelectInput>
          </Field>
        </div>
      </Modal>
    );
  }

  if ((modal.type === "view-gear" || modal.type === "confirm-return-gear" || modal.type === "report-gear") && currentGear) {
    if (modal.type === "view-gear") {
      return (
        <Modal open onClose={onClose} title={currentGear.name} description={`Serial ${currentGear.serial}`} footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Issued date" value={currentGear.issuedDate} />
            <DetailField label="Due date" value={currentGear.dueDate} />
            <DetailField label="Status" value={currentGear.status} />
            <DetailField label="Condition" value={currentGear.condition} />
          </div>
        </Modal>
      );
    }

    if (modal.type === "confirm-return-gear") {
      return (
        <Modal
          open
          onClose={onClose}
          title="Mark Gear Returned"
          description={`${currentGear.name} will be marked returned in local state.`}
          footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={() => updateGear(currentGear.id, updateAthlete, { status: "Returned", dueDate: new Date().toISOString().slice(0, 10) }, "Gear returned")}><actionIcons.markReturned className="h-3.5 w-3.5" />Mark returned</PrimaryButton></>}
        >
          <FeedbackPanel tone="info" title="Return confirmation">This updates the profile table only. Inventory reconciliation can be added later.</FeedbackPanel>
        </Modal>
      );
    }

    return (
      <Modal
        open
        onClose={onClose}
        title="Report Gear Issue"
        description={currentGear.name}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton tone="danger" onClick={() => reportGearIssue(modal, onSetModal, updateAthlete, currentGear)}>Save issue</PrimaryButton></>}
      >
        <Field label="Issue details" error={modal.error}>
          <TextArea value={modal.value} onChange={(event) => onSetModal((current) => ({ ...current, value: event.target.value, error: "" }))} placeholder="Describe damaged or lost gear..." />
        </Field>
      </Modal>
    );
  }

  if (modal.type === "confirm-archive") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Archive Athlete"
        description={`${athlete.name} will be marked archived in local state.`}
        footer={<><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><PrimaryButton tone="danger" onClick={() => { onArchiveAthlete(athlete.id, "Archived"); onClose(); }}><actionIcons.archive className="h-3.5 w-3.5" />Archive athlete</PrimaryButton></>}
      >
        <FeedbackPanel tone="warning" title="Confirmation required">This action is local-only until backend persistence is connected.</FeedbackPanel>
      </Modal>
    );
  }

  return null;
}

function ProfileEditForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" error={errors.name}>
        <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
      </Field>
      <Field label="Student ID" error={errors.id}>
        <TextInput value={values.id} onChange={(event) => onChange("id", event.target.value)} />
      </Field>
      <Field label="Sport">
        <SelectInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)}>
          {sports.map((sport) => <option key={sport}>{sport}</option>)}
        </SelectInput>
      </Field>
      <Field label="Event / Position">
        <TextInput value={values.event} onChange={(event) => onChange("event", event.target.value)} />
      </Field>
      <Field label="Coach">
        <TextInput value={values.coach} onChange={(event) => onChange("coach", event.target.value)} />
      </Field>
      <Field label="Year level">
        <SelectInput value={values.year} onChange={(event) => onChange("year", event.target.value)}>
          {yearLevels.map((year) => <option key={year}>{year}</option>)}
        </SelectInput>
      </Field>
      <Field label="Department" error={errors.department}>
        <TextInput value={values.department} onChange={(event) => onChange("department", event.target.value)} />
      </Field>
      <Field label="Course">
        <TextInput value={values.course} onChange={(event) => onChange("course", event.target.value)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
      </Field>
      <Field label="Phone">
        <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
      </Field>
    </div>
  );
}

function SectionEditForm({ section, values, errors, onChange }) {
  if (section === "personal") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {["birthdate", "age", "gender", "nationality", "height", "weight", "bloodType", "side"].map((field) => (
          <Field key={field} label={labelize(field)}>
            <TextInput value={values[field] ?? ""} onChange={(event) => onChange(field, event.target.value)} type={field === "birthdate" ? "date" : "text"} />
          </Field>
        ))}
      </div>
    );
  }

  if (section === "sport") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sport">
          <SelectInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)}>
            {sports.map((sport) => <option key={sport}>{sport}</option>)}
          </SelectInput>
        </Field>
        <Field label="Event / Position">
          <TextInput value={values.event} onChange={(event) => onChange("event", event.target.value)} />
        </Field>
        <Field label="Coach">
          <TextInput value={values.coach} onChange={(event) => onChange("coach", event.target.value)} />
        </Field>
        <Field label="Scholarship">
          <SelectInput value={values.scholarship} onChange={(event) => onChange("scholarship", event.target.value)}>
            {scholarshipTypes.map((scholarship) => <option key={scholarship}>{scholarship}</option>)}
          </SelectInput>
        </Field>
      </div>
    );
  }

  if (section === "emergency") {
    return (
      <div className="grid gap-4">
        <Field label="Name" error={errors.name}>
          <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
        </Field>
        <Field label="Relationship">
          <TextInput value={values.relationship} onChange={(event) => onChange("relationship", event.target.value)} />
        </Field>
        <Field label="Phone">
          <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
        </Field>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Field label="Phone">
        <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
      </Field>
      <Field label="Address">
        <TextArea value={values.address} onChange={(event) => onChange("address", event.target.value)} />
      </Field>
    </div>
  );
}

function AcademicsForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="GPA" error={errors.gpa}>
        <TextInput value={values.gpa} onChange={(event) => onChange("gpa", event.target.value)} />
      </Field>
      <Field label="Standing">
        <SelectInput value={values.standing} onChange={(event) => onChange("standing", event.target.value)}>
          {academicStandings.map((standing) => <option key={standing}>{standing}</option>)}
        </SelectInput>
      </Field>
      <Field label="Attendance">
        <TextInput value={values.attendance} onChange={(event) => onChange("attendance", event.target.value)} />
      </Field>
      <Field label="Units">
        <TextInput value={values.units} onChange={(event) => onChange("units", event.target.value)} />
      </Field>
      <Field label="Term">
        <TextInput value={values.term} onChange={(event) => onChange("term", event.target.value)} />
      </Field>
      <Field label="Eligibility">
        <TextInput value={values.eligibility} onChange={(event) => onChange("eligibility", event.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Eligibility note">
          <TextArea value={values.eligibilityNote} onChange={(event) => onChange("eligibilityNote", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function ProfileCard({ title, action, children }) {
  return (
    <section className="rounded-[24px] border border-border-subtle/50 bg-surface-card p-6 shadow-soft">
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
      <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">{value}</p>
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
        <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{value}</p>
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
      <span className={`mt-2.5 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${toneClass}`}>{hint}</span>
    </div>
  );
}

function ActionCard({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4 text-left text-[13px] font-bold text-slate-700 transition-colors hover:border-brand-blue/20 hover:bg-brand-blue-light"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-blue shadow-soft">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </button>
  );
}

function AlertCard({ alert }) {
  const attention = alert.level === "attention";
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${attention ? "bg-amber-100 text-amber-700" : "bg-brand-blue-light text-brand-blue"}`}>
          {attention ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
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
    <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/60 p-5 text-center">
      <p className="text-[14px] font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-[13px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function SmallAction({ children, icon: Icon, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
        tone === "danger"
          ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-border-subtle bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const tone =
    status === "Submitted" || status === "Returned" || status === "In Possession"
      ? "bg-green-50 text-green-700"
      : status === "Pending Review" || status === "Overdue"
        ? "bg-amber-50 text-amber-700"
        : status === "Missing" || status === "Expired" || status === "Damaged/Lost"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600";

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{status}</span>;
}

function EventStatusPill({ value }) {
  const tone =
    value === "Completed"
      ? "bg-green-50 text-green-700"
      : value === "Upcoming"
        ? "bg-brand-blue-light text-brand-blue"
        : value === "Ongoing"
          ? "bg-amber-50 text-amber-700"
          : value === "Cancelled"
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-600";

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{value}</span>;
}

function EventMiniStat({ label, value, icon: Icon, tone = "mint" }) {
  const toneStyles = {
    mint: "border-emerald-100 bg-emerald-50/80 text-emerald-950",
    sand: "border-amber-100 bg-amber-50/80 text-amber-950",
    slate: "border-slate-800 bg-slate-800 text-white",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone === "slate" ? "text-slate-300" : "text-slate-400"}`}>
            {label}
          </p>
          <p className={`mt-2 text-[13px] font-semibold leading-snug ${tone === "slate" ? "text-white" : "text-slate-900"}`}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone === "slate" ? "bg-white/10 text-white" : "bg-white text-slate-500"}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

function EventMetaChip({ icon: Icon, label, accent = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ring-1 ${accent ? "bg-brand-blue-light text-brand-blue ring-brand-blue/10" : "bg-slate-50 text-slate-600 ring-slate-200/70"}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function DocumentIcon({ kind }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kind === "pdf" ? "bg-red-50 text-red-500" : kind === "image" ? "bg-slate-100 text-slate-500" : "bg-brand-blue-light text-brand-blue"}`}>
      {kind === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
    </div>
  );
}

function profileToForm(athlete) {
  return {
    name: athlete.name,
    id: athlete.id,
    sport: athlete.sport,
    event: athlete.event,
    coach: athlete.coach,
    year: athlete.year,
    department: athlete.department,
    course: athlete.course ?? "",
    email: athlete.contact.email,
    phone: athlete.contact.phone,
  };
}

function getInitials(name) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "--"
  );
}

function personalToForm(athlete) {
  return { ...athlete.personal };
}

function contactToForm(athlete) {
  return { phone: athlete.contact.phone, email: athlete.contact.email, address: athlete.contact.address };
}

function emergencyToForm(athlete) {
  return { ...athlete.contact.emergency };
}

function sportToForm(athlete) {
  return { sport: athlete.sport, event: athlete.event, coach: athlete.coach, scholarship: athlete.scholarship };
}

function academicsToForm(athlete) {
  return {
    gpa: String(athlete.gpa),
    standing: athlete.standing,
    attendance: athlete.academics.attendance,
    units: athlete.academics.units,
    term: athlete.academics.term,
    eligibility: athlete.academics.eligibility,
    eligibilityNote: athlete.academics.eligibilityNote,
  };
}

function saveProfileForm(modal, onSetModal, updateAthlete) {
  const errors = validateProfileForm(modal.values);
  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => ({
      ...athlete,
      name: modal.values.name.trim(),
      id: modal.values.id.trim(),
      sport: modal.values.sport,
      event: modal.values.event.trim(),
      coach: modal.values.coach.trim(),
      year: modal.values.year,
      department: modal.values.department.trim(),
      course: modal.values.course.trim(),
      contact: {
        ...athlete.contact,
        email: modal.values.email.trim(),
        phone: modal.values.phone.trim(),
      },
    }),
    { title: "Athlete updated", message: "Profile details were updated locally." },
  );
}

function saveSectionForm(modal, onSetModal, updateAthlete) {
  const errors = {};
  if (modal.section === "contact" && modal.values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (modal.section === "emergency" && !modal.values.name.trim()) {
    errors.name = "Emergency contact name is required.";
  }

  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => {
      if (modal.section === "personal") return { ...athlete, personal: { ...athlete.personal, ...modal.values } };
      if (modal.section === "sport") return { ...athlete, ...modal.values };
      if (modal.section === "emergency") {
        return { ...athlete, contact: { ...athlete.contact, emergency: { ...modal.values } } };
      }
      return { ...athlete, contact: { ...athlete.contact, ...modal.values } };
    },
    { title: "Details updated", message: `${sectionTitle(modal.section)} was updated locally.` },
  );
}

function saveAcademics(modal, onSetModal, updateAthlete) {
  const errors = {};
  const gpa = Number(modal.values.gpa);
  if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) errors.gpa = "GPA must be between 0 and 4.";

  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => ({
      ...athlete,
      gpa,
      standing: modal.values.standing,
      academics: {
        ...athlete.academics,
        attendance: modal.values.attendance,
        units: modal.values.units,
        term: modal.values.term,
        eligibility: modal.values.eligibility,
        eligibilityNote: modal.values.eligibilityNote,
      },
    }),
    { title: "Academics updated", message: "Academic information was saved locally." },
  );
}

function saveAcademicNote(modal, onSetModal, updateAthlete) {
  const errors = {};
  if (!modal.values.title.trim()) errors.title = "Title is required.";
  if (!modal.values.body.trim()) errors.body = "Note is required.";

  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => ({
      ...athlete,
      academics: {
        ...athlete.academics,
        notes: [
          {
            ...modal.values,
            title: modal.values.title.trim(),
            owner: modal.values.owner.trim() || "Athlete Services",
            body: modal.values.body.trim(),
            date: new Date().toLocaleDateString(),
          },
          ...(athlete.academics.notes ?? []),
        ],
      },
    }),
    { title: "Academic note added", message: "The note was added to academic monitoring." },
  );
}

function saveProfileNote(modal, onSetModal, onAddNote, athlete, onClose) {
  const note = modal.value.trim();
  if (!note) {
    onSetModal((current) => ({ ...current, error: "Add a short note before saving." }));
    return;
  }

  onAddNote(athlete.id, `${new Date().toLocaleDateString()} - ${note}`);
  onClose();
}

function updateEvent(eventId, updateAthlete, patch) {
  updateAthlete(
    (athlete) => ({
      ...athlete,
      eventsParticipation: {
        ...athlete.eventsParticipation,
        items: athlete.eventsParticipation.items.map((event) => (event.id === eventId ? { ...event, ...patch } : event)),
      },
    }),
    { title: "Participation updated", message: "Event participation was updated locally." },
  );
}

function saveResultNote(modal, onSetModal, updateAthlete, event) {
  const note = modal.value.trim();
  if (!note) {
    onSetModal((current) => ({ ...current, error: "Add a note before saving." }));
    return;
  }

  updateAthlete(
    (athlete) => ({
      ...athlete,
      eventsParticipation: {
        ...athlete.eventsParticipation,
        notes: [
          { title: event.title, date: new Date().toLocaleDateString(), description: note },
          ...(athlete.eventsParticipation.notes ?? []),
        ],
      },
    }),
    { title: "Result note added", message: "The event note was added locally." },
  );
}

function saveDocument(modal, onSetModal, updateAthlete, currentDocument) {
  const errors = {};
  if (!modal.values.name.trim()) errors.name = "Document name is required.";
  if (!modal.values.fileName && !currentDocument) errors.fileName = "Select a file for the mock upload.";

  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => {
      const document = {
        id: currentDocument?.id ?? `DOC-${Date.now()}`,
        name: modal.values.name.trim(),
        meta: `${modal.values.fileName || currentDocument.meta} | local mock record`,
        kind: modal.values.kind ?? currentDocument?.kind ?? "pdf",
        status: modal.values.status ?? currentDocument?.status ?? "Submitted",
      };

      return {
        ...athlete,
        documents: currentDocument
          ? athlete.documents.map((item) => (item.id === currentDocument.id ? document : item))
          : [document, ...athlete.documents],
      };
    },
    { title: currentDocument ? "Document replaced" : "Document uploaded", message: "The document list was updated locally." },
  );
}

function saveGear(modal, onSetModal, updateAthlete) {
  const errors = {};
  if (!modal.values.name.trim()) errors.name = "Item name is required.";
  if (!modal.values.serial.trim()) errors.serial = "Serial is required.";

  if (Object.keys(errors).length > 0) {
    onSetModal((current) => ({ ...current, errors }));
    return;
  }

  updateAthlete(
    (athlete) => ({
      ...athlete,
      equipmentHistory: [
        {
          id: `GEAR-${Date.now()}`,
          name: modal.values.name.trim(),
          serial: modal.values.serial.trim(),
          issuedDate: new Date().toISOString().slice(0, 10),
          dueDate: modal.values.dueDate || "Pending",
          status: "In Possession",
          condition: modal.values.condition,
          icon: "default",
        },
        ...athlete.equipmentHistory,
      ],
    }),
    { title: "Gear assigned", message: "The equipment record was added locally." },
  );
}

function updateGear(gearId, updateAthlete, patch, title) {
  updateAthlete(
    (athlete) => ({
      ...athlete,
      equipmentHistory: athlete.equipmentHistory.map((item) => (item.id === gearId ? { ...item, ...patch } : item)),
    }),
    { title, message: "Gear status was updated locally." },
  );
}

function reportGearIssue(modal, onSetModal, updateAthlete, gear) {
  const issue = modal.value.trim();
  if (!issue) {
    onSetModal((current) => ({ ...current, error: "Describe the damaged or lost item." }));
    return;
  }

  updateGear(gear.id, updateAthlete, { status: "Damaged/Lost", condition: issue }, "Gear issue reported");
}

function validateProfileForm(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Full name is required.";
  if (!values.id.trim()) errors.id = "Student ID is required.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.department.trim()) errors.department = "Department is required.";
  return errors;
}

function sectionTitle(section) {
  const titles = {
    personal: "Personal Record",
    contact: "Contact Details",
    emergency: "Emergency Contact",
    sport: "Sport Profile",
  };
  return titles[section] ?? "Profile Section";
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
