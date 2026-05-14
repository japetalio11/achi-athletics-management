import { useMemo, useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
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

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Profile" },
  { id: "athletes", label: "Athletes" },
  { id: "events", label: "Schedule" },
  { id: "performance", label: "Performance" },
  { id: "certifications", label: "Credentials" },
];

const tabCopy = {
  overview: {
    title: "Coach Snapshot",
    description:
      "Review the latest coaching focus, roster coverage, and program highlights at a glance.",
  },
  details: {
    title: "Detailed Coach Information",
    description:
      "Keep staff identity, role, and contact details organized in one coaching profile record.",
  },
  athletes: {
    title: "Assigned Athlete Roster",
    description:
      "Track current athlete assignments, event connections, and quick roster notes from one workspace.",
  },
  events: {
    title: "Coaching Schedule and Events",
    description:
      "Review the events, sessions, and roster coverage currently coordinated by this coach.",
  },
  performance: {
    title: "Performance and Review Notes",
    description:
      "Track leadership feedback, athlete development, attendance, and communication benchmarks.",
  },
  certifications: {
    title: "Certifications and Qualifications",
    description:
      "Review coaching credentials, compliance files, and renewal status without leaving the profile.",
  },
};

export function CoachProfile({ coach }) {
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [athletePage, setAthletePage] = useState(0);
  const [eventPage, setEventPage] = useState(0);
  const closeModal = () => setModal(null);
  const athletesPerPage = 4;
  const eventsPerPage = 3;

  const statusTone =
    coach.status === "Active"
      ? "bg-green-50 text-green-700"
      : coach.status === "On Leave"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  const activeCopy = tabCopy[activeTab];

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) {
      return;
    }

    setActiveTab(tabId);
  };

  const currentTabContent = useMemo(() => {
    if (activeTab === "details") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ProfileCard title="Staff Record">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Full name" value={coach.name} />
              <DetailField label="Staff ID" value={coach.staffId} />
              <DetailField label="Birthdate" value={coach.profile.birthdate} />
              <DetailField label="Age" value={coach.profile.age} />
              <DetailField label="Gender" value={coach.profile.gender} />
              <DetailField label="Nationality" value={coach.profile.nationality} />
              <DetailField label="Sport" value={coach.sport} />
              <DetailField label="Team" value={coach.team} />
              <DetailField label="Role" value={coach.role} />
              <DetailField
                label="Experience"
                value={`${coach.experienceYears} years`}
              />
              <DetailField label="Department" value={coach.department} />
              <DetailField label="Specialization" value={coach.specialization} />
            </div>
          </ProfileCard>

          <ProfileCard title="Contact Details">
            <div className="space-y-4">
              <InfoRow icon={Phone} label="Mobile" value={coach.phone} />
              <InfoRow icon={Mail} label="Email" value={coach.email} />
              <InfoRow icon={MapPin} label="Address" value={coach.address} />
              <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Office Details
                </p>
                <p className="mt-2 text-[14px] font-semibold text-slate-900">
                  {coach.office}
                </p>
                <p className="mt-1 text-[13px] text-slate-600">
                  {coach.profile.certificationLevel}
                </p>
                <p className="mt-1 text-[13px] text-slate-700">{coach.status}</p>
              </div>
            </div>
          </ProfileCard>
        </div>
      );
    }

    if (activeTab === "athletes") {
      const totalAthletePages = Math.max(
        1,
        Math.ceil(coach.assignedAthletes.length / athletesPerPage),
      );
      const currentAthletePage = Math.min(athletePage, totalAthletePages - 1);
      const visibleAthletes = coach.assignedAthletes.slice(
        currentAthletePage * athletesPerPage,
        currentAthletePage * athletesPerPage + athletesPerPage,
      );

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Assigned Athletes"
              value={String(coach.assignedAthleteCount)}
              hint="Current roster coverage"
              tone="blue"
            />
            <MetricTile
              label="Linked Events"
              value={coach.schedule.summary.total}
              hint="Owned sessions"
              tone="gold"
            />
            <MetricTile
              label="Upcoming Coverage"
              value={coach.schedule.summary.upcoming}
              hint="Live schedule entries"
            />
            <MetricTile
              label="Primary Team"
              value={coach.team}
              hint={coach.role}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ProfileCard title="Assigned Athlete Roster">
              <div className="space-y-3">
                {visibleAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="rounded-[22px] border border-border-subtle/60 bg-white p-4 shadow-soft"
                  >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="min-w-0 text-[15px] font-semibold text-slate-900">
                            {athlete.name}
                          </p>
                          <span className="rounded-full bg-brand-blue-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-blue">
                            {athlete.participationStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {athlete.studentId} | {athlete.sport} | {athlete.team}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                          {athlete.eventTitle} on {athlete.eventDate}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                            {athlete.role}
                          </span>
                          <span className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[11px] font-semibold text-brand-blue">
                            {athlete.strengthsObserved}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 xl:min-w-0">
                        <EventMiniStat label="Role" value={athlete.role} />
                        <EventMiniStat label="Status" value={athlete.participationStatus} />
                        <EventMiniStat label="Strength" value={athlete.strengthsObserved} />
                      </div>
                    </div>
                  </div>
                ))}
                {visibleAthletes.length === 0 ? (
                  <FeedbackPanel tone="info" title="No assigned athletes yet">
                    This coach does not have any linked athlete assignments in the current
                    mock event schedule.
                  </FeedbackPanel>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-brand-blue/15 bg-brand-blue-light/80 px-4 py-3 shadow-soft">
                <button
                  type="button"
                  onClick={() => setAthletePage((page) => Math.max(0, page - 1))}
                  disabled={currentAthletePage === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-soft transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  Page {currentAthletePage + 1} of {totalAthletePages}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAthletePage((page) => Math.min(totalAthletePages - 1, page + 1))
                  }
                  disabled={currentAthletePage >= totalAthletePages - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-soft transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </ProfileCard>

            <ProfileCard title="Assignment Notes">
              <div className="space-y-4">
                {coach.assignedAthletes.slice(0, 4).map((athlete) => (
                  <div
                    key={`${athlete.id}-note`}
                    className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {athlete.name}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {athlete.eventDate}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {athlete.coachRemarks}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-border-subtle/60 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Quick Role Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {coach.schedule.roles.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[12px] font-semibold text-brand-blue"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      );
    }

    if (activeTab === "events") {
      const totalEventPages = Math.max(
        1,
        Math.ceil(coach.schedule.items.length / eventsPerPage),
      );
      const currentEventPage = Math.min(eventPage, totalEventPages - 1);
      const visibleEvents = coach.schedule.items.slice(
        currentEventPage * eventsPerPage,
        currentEventPage * eventsPerPage + eventsPerPage,
      );

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Total Events"
              value={coach.schedule.summary.total}
              hint="Current schedule load"
              tone="blue"
            />
            <MetricTile
              label="Completed"
              value={coach.schedule.summary.completed}
              hint="Closed sessions"
              tone="gold"
            />
            <MetricTile
              label="Upcoming"
              value={coach.schedule.summary.upcoming}
              hint="Live schedule"
            />
            <MetricTile
              label="Athlete Coverage"
              value={coach.schedule.summary.athleteCoverage}
              hint="Roster currently attached"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ProfileCard title="Schedule History">
              <div className="space-y-3">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[22px] border border-border-subtle/60 bg-white p-4 shadow-soft"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold text-slate-900">
                            {event.title}
                          </p>
                          <EventStatusPill value={event.status} />
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {event.type} | {event.date} | {event.venue}
                        </p>
                        {event.summary ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                            {event.summary}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid min-w-full gap-2 sm:grid-cols-3 lg:min-w-[280px]">
                        <EventMiniStat label="Roster" value={event.attendance} />
                        <EventMiniStat label="Status" value={event.result} />
                        <EventMiniStat label="Role" value={event.coach} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  Page {currentEventPage + 1} of {totalEventPages}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEventPage((page) => Math.min(totalEventPages - 1, page + 1))
                  }
                  disabled={currentEventPage >= totalEventPages - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-soft transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </ProfileCard>

            <ProfileCard title="Schedule Notes">
              <div className="space-y-4">
                {coach.schedule.notes.map((entry) => (
                  <div
                    key={`${entry.date}-${entry.title}`}
                    className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {entry.title}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {entry.date}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-border-subtle/60 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Event Role Coverage
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {coach.schedule.roles.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[12px] font-semibold text-brand-blue"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      );
    }

    if (activeTab === "performance") {
      return (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <ProfileCard title="Review Summary">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricTile
                  label="Leadership"
                  value={coach.performanceNotes.leadership}
                  hint={coach.performanceNotes.leadershipTrend}
                  tone="blue"
                />
                <MetricTile
                  label="Athlete Development"
                  value={coach.performanceNotes.development}
                  hint={coach.performanceNotes.developmentNote}
                  tone="gold"
                />
                <MetricTile
                  label="Attendance / Compliance"
                  value={coach.performanceNotes.attendance}
                  hint={coach.performanceNotes.attendanceNote}
                />
                <MetricTile
                  label="Communication"
                  value={coach.performanceNotes.communication}
                  hint={coach.performanceNotes.communicationNote}
                />
              </div>
            </ProfileCard>

            <ProfileCard title="Review Notes">
              <div className="space-y-3">
                {coach.performanceNotes.notes.map((note) => (
                  <div
                    key={note.title}
                    className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {note.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{note.owner}</p>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </ProfileCard>
          </div>

          <ProfileCard title="Review Trend">
            <div className="space-y-5">
              <div className="flex h-56 items-end justify-between gap-3 rounded-[24px] border border-border-subtle/60 bg-slate-50/70 px-5 pb-10 pt-6">
                {coach.performanceNotes.trend.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                  >
                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        className={`w-full max-w-10 rounded-full ${
                          item.active ? "bg-brand-blue shadow-soft" : "bg-slate-200"
                        }`}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                          item.active ? "text-brand-blue" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="mt-1 text-[12px] font-semibold text-slate-700">
                        {item.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {coach.performanceNotes.notes.map((note) => (
                  <div
                    key={`${note.owner}-${note.title}`}
                    className="rounded-2xl border border-border-subtle/60 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {note.owner}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        Review
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                      {note.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ProfileCard>
        </div>
      );
    }

    if (activeTab === "certifications") {
      return (
        <div className="space-y-6">
          <ProfileCard
            title="Certification Files"
            action={
              <button
                type="button"
                onClick={() => setModal({ type: "certification" })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              {coach.certifications.map((document) => (
                <button
                  key={document.name}
                  type="button"
                  onClick={() =>
                    setModal({
                      type: "view-certification",
                      payload: document.name,
                    })
                  }
                  className="flex items-start gap-4 rounded-2xl border border-border-subtle/60 p-4 text-left transition-all hover:border-brand-blue/20 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      document.kind === "pdf"
                        ? "bg-red-50 text-red-500"
                        : document.kind === "image"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-brand-blue-light text-brand-blue"
                    }`}
                  >
                    {document.kind === "image" ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {document.name}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                      {document.meta}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ProfileCard>

          <ProfileCard
            title="Qualifications and Compliance"
            action={
              <button
                type="button"
                onClick={() => setModal({ type: "qualification" })}
                className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                ADD RECORD
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle/60 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <th className="p-5 pl-0">Qualification</th>
                    <th className="p-5">Issuer</th>
                    <th className="p-5">Valid Until</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 pr-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                  {coach.qualifications.map((item) => (
                    <tr
                      key={`${item.name}-${item.validUntil}`}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="p-5 pl-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Award className="h-5 w-5 opacity-60" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-[11px] text-slate-500">{coach.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-600">{item.issuer}</td>
                      <td className="p-5 text-slate-600">{item.validUntil}</td>
                      <td className="p-5">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="p-5 pr-0 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              type: "qualification-action",
                              payload: item.name,
                            })
                          }
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-blue"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ProfileCard>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Status"
            value={coach.status}
            hint={coach.overview.focusNote}
            tone="blue"
          />
          <MetricTile
            label="Assigned Athletes"
            value={String(coach.assignedAthleteCount)}
            hint="Current roster link"
            tone="gold"
          />
          <MetricTile
            label="Experience"
            value={`${coach.experienceYears} years`}
            hint={coach.role}
          />
          <MetricTile
            label="Next Scheduled Event"
            value={coach.nextEventLabel}
            hint={coach.nextEventTitle}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ProfileCard title="Current Focus and Alerts">
            <div className="rounded-2xl border border-border-subtle/60 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Program Summary
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                {coach.overview.summary}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {coach.overview.alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        alert.level === "attention"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-brand-blue-light text-brand-blue"
                      }`}
                    >
                      {alert.level === "attention" ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        {alert.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                        {alert.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>

          <ProfileCard title="Milestones and Specialization">
            <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Specialization
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                {coach.specialization}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {coach.milestones.map((item) => (
                <div
                  key={`${item.date}-${item.title}`}
                  className="flex gap-4 rounded-2xl border border-border-subtle/60 bg-white p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gold-light text-brand-gold-hover">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500">{item.date}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ProfileCard>
        </div>
      </div>
    );
  }, [activeTab, athletePage, coach, eventPage]);

  return (
    <div className="animate-in mt-8 space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500 md:mt-10">
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
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {coach.name}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone}`}
                  >
                    {coach.status}
                  </span>
                </div>
                <p className="text-[15px] font-medium text-brand-blue">
                  {[coach.sport, coach.department].filter(Boolean).join(" | ")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={UserRound} label="Staff ID" value={coach.staffId} />
              <ProfileBadge icon={Users} label="Team" value={coach.team} />
              <ProfileBadge icon={TrendingUp} label="Role" value={coach.role} />
              <ProfileBadge
                icon={Clock3}
                label="Experience"
                value={`${coach.experienceYears} years`}
              />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Profile Actions
            </p>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setModal({ type: "status" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <ShieldCheck className="h-4 w-4" />
                Edit Coach
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("details")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                Open Profile Details
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="relative isolate rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="border-b border-border-subtle/70 px-5 pb-6 pt-5">
          <div className="relative grid gap-4 lg:min-h-[6.5rem] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:justify-between">
            <div className="min-w-0 lg:max-w-[44rem]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Coach Workspace
              </p>
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">
                {activeCopy.title}
              </h2>
              <p className="mt-1 min-h-[2.75rem] text-[13px] leading-relaxed text-slate-500 lg:line-clamp-2">
                {activeCopy.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
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
          {currentTabContent}
        </div>
      </div>

      <CoachProfileModal modal={modal} onClose={closeModal} coach={coach} />
    </div>
  );
}

function ProfileCard({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-[24px] border border-border-subtle/50 bg-surface-card p-6 shadow-soft ${className}`}
    >
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
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] leading-[1.35]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold text-slate-900">{value}</p>
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
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
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
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2.5 text-[20px] font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
      <span
        className={`mt-2.5 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${toneClass}`}
      >
        {hint}
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  const tone =
    status === "Current"
      ? "bg-green-50 text-green-700"
      : status === "Renewal Due"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}
    >
      {status}
    </span>
  );
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

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}
    >
      {value}
    </span>
  );
}

function EventMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-[12px] font-semibold leading-snug text-slate-800">
        {value}
      </p>
    </div>
  );
}

function CoachProfileModal({ modal, onClose, coach }) {
  if (!modal) return null;

  const footer = (
    <>
      <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      <PrimaryButton onClick={onClose}>Save</PrimaryButton>
    </>
  );

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Edit Coach"
        description={`Update profile details and coaching settings for ${coach.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <SelectInput defaultValue={coach.status}>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </SelectInput>
          </Field>
          <Field label="Role">
            <TextInput defaultValue={coach.role} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status note">
              <TextArea placeholder="Summarize why this coach profile is being updated." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "certification") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Certification"
        description="Register a new certification or coaching file on this profile."
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document name">
            <TextInput placeholder="National coaching license" />
          </Field>
          <Field label="Document type">
            <SelectInput defaultValue="Certification">
              <option>Certification</option>
              <option>Training</option>
              <option>Compliance</option>
              <option>Identification</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea placeholder="Validity, issuing body, or profile notes..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "view-certification") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.payload}
        description="Certification details are shown here until file preview storage is connected."
        footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}
      >
        <FeedbackPanel tone="success" title="Verified coaching file">
          This placeholder detail view can later include file preview, renewal alerts,
          download, and audit trail actions.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "qualification") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Qualification Record"
        description={`Attach a new compliance or qualification record for ${coach.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qualification">
            <TextInput placeholder="Emergency response certification" />
          </Field>
          <Field label="Issuer">
            <TextInput placeholder="Campus Health Unit" />
          </Field>
          <Field label="Valid until">
            <TextInput type="date" />
          </Field>
          <Field label="Status">
            <SelectInput defaultValue="Current">
              <option>Current</option>
              <option>Renewal Due</option>
              <option>Expired</option>
            </SelectInput>
          </Field>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Qualification Actions"
      description={`Manage ${modal.payload}.`}
      footer={footer}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          View details
        </button>
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          Mark renewed
        </button>
        <button className="rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-[13px] font-bold text-red-700 hover:bg-red-100">
          Archive record
        </button>
      </div>
    </Modal>
  );
}
