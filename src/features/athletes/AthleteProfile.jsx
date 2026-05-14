import { useMemo, useState } from "react";
import {
  Activity,
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
  MoreVertical,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserRound,
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
  { id: "details", label: "Detailed Info" },
  { id: "academics", label: "Academics" },
  { id: "events", label: "Events" },
  { id: "assets", label: "Documents & Gear" },
];

const equipmentIcons = {
  shoe: ImageIcon,
  strength: Dumbbell,
  monitor: Activity,
  default: ImageIcon,
};

const tabCopy = {
  overview: {
    title: "Athlete Snapshot",
    description:
      "See the latest profile summary, current priorities, and recent milestones.",
  },
  details: {
    title: "Detailed Athlete Information",
    description:
      "Separate identity, contact, and athlete history into one cleaner profile record.",
  },
  academics: {
    title: "Academic Monitoring",
    description:
      "Track GPA, eligibility, attendance, and intervention notes for compliance review.",
  },
  events: {
    title: "Events Participation",
    description:
      "Review assigned events, competition results, attendance status, and coach remarks.",
  },
  assets: {
    title: "Documents and Equipment",
    description:
      "Review files, clearances, and issued gear without leaving the athlete page.",
  },
};

export function AthleteProfile({ athlete }) {
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [eventPage, setEventPage] = useState(0);
  const closeModal = () => setModal(null);
  const eventsPerPage = 3;

  const statusTone =
    athlete.status === "Cleared"
      ? "bg-green-50 text-green-700"
      : athlete.status === "Pending Review"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  const activeCopy = tabCopy[activeTab];
  const currentTabContent = useMemo(() => {
    if (activeTab === "details") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ProfileCard title="Personal Record">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Full name" value={athlete.name} />
              <DetailField label="Student ID" value={athlete.id} />
              <DetailField label="Birthdate" value={athlete.personal.birthdate} />
              <DetailField label="Age" value={athlete.personal.age} />
              <DetailField label="Gender" value={athlete.personal.gender} />
              <DetailField
                label="Nationality"
                value={athlete.personal.nationality}
              />
              <DetailField label="Height" value={athlete.personal.height} />
              <DetailField label="Weight" value={athlete.personal.weight} />
              <DetailField label="Blood type" value={athlete.personal.bloodType} />
              <DetailField label="Dominant side" value={athlete.personal.side} />
            </div>
          </ProfileCard>

          <ProfileCard title="Contact Details">
            <div className="space-y-4">
              <InfoRow
                icon={Phone}
                label="Mobile"
                value={athlete.contact.phone}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={athlete.contact.email}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={athlete.contact.address}
              />
              <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Emergency Contact
                </p>
                <p className="mt-2 text-[14px] font-semibold text-slate-900">
                  {athlete.contact.emergency.name}
                </p>
                <p className="text-[13px] text-slate-600">
                  {athlete.contact.emergency.relationship}
                </p>
                <p className="mt-1 text-[13px] text-slate-700">
                  {athlete.contact.emergency.phone}
                </p>
              </div>
            </div>
          </ProfileCard>
        </div>
      );
    }

    if (activeTab === "academics") {
      return (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <ProfileCard title="Eligibility Summary">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricTile
                  label="Current GPA"
                  value={`${athlete.gpa.toFixed(2)} / 4.0`}
                  hint={athlete.academics.gpaTrend}
                  tone="blue"
                />
                <MetricTile
                  label="Attendance"
                  value={athlete.academics.attendance}
                  hint={athlete.academics.attendanceNote}
                  tone="gold"
                />
                <MetricTile
                  label="Units Enrolled"
                  value={athlete.academics.units}
                  hint={athlete.academics.term}
                />
                <MetricTile
                  label="Eligibility"
                  value={athlete.academics.eligibility}
                  hint={athlete.academics.eligibilityNote}
                />
              </div>
            </ProfileCard>

            <ProfileCard title="Adviser and Support Notes">
              <div className="space-y-3">
                {athlete.academics.notes.map((note) => (
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

          <ProfileCard title="Semester Trend">
            <div className="space-y-5">
              <div className="flex h-56 items-end justify-between gap-3 rounded-[24px] border border-border-subtle/60 bg-slate-50/70 px-5 pb-10 pt-6">
                {athlete.academics.trend.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                  >
                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        className={`w-full max-w-10 rounded-full ${
                          item.active
                            ? "bg-brand-blue shadow-soft"
                            : "bg-slate-200"
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
                {athlete.academics.currentSubjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="rounded-2xl border border-border-subtle/60 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {subject.name}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        {subject.grade}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-500">
                      {subject.schedule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ProfileCard>
        </div>
      );
    }

    if (activeTab === "events") {
      const totalEventPages = Math.max(
        1,
        Math.ceil(athlete.eventsParticipation.items.length / eventsPerPage),
      );
      const currentEventPage = Math.min(eventPage, totalEventPages - 1);
      const visibleEvents = athlete.eventsParticipation.items.slice(
        currentEventPage * eventsPerPage,
        currentEventPage * eventsPerPage + eventsPerPage,
      );

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Total Events"
              value={athlete.eventsParticipation.summary.total}
              hint="This tracking cycle"
              tone="blue"
            />
            <MetricTile
              label="Completed"
              value={athlete.eventsParticipation.summary.completed}
              hint="Finished participation"
              tone="gold"
            />
            <MetricTile
              label="Upcoming"
              value={athlete.eventsParticipation.summary.upcoming}
              hint="Still scheduled"
            />
            <MetricTile
              label="Attendance"
              value={athlete.eventsParticipation.summary.attendance}
              hint="Session presence rate"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ProfileCard title="Participation History">
              <div className="space-y-3">
                {visibleEvents.map((event) => (
                  <div
                    key={`${event.date}-${event.title}`}
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
                        <EventMiniStat label="Attendance" value={event.attendance} />
                        <EventMiniStat label="Result" value={event.result} />
                        <EventMiniStat label="Coach" value={event.coach} />
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

            <ProfileCard title="Participation Notes">
              <div className="space-y-4">
                {athlete.eventsParticipation.notes.map((entry) => (
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
                  Common Event Roles
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {athlete.eventsParticipation.roles.map((item) => (
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

    if (activeTab === "assets") {
      return (
        <div className="space-y-6">
          <ProfileCard
            title="Digital Documents"
            action={
              <button
                type="button"
                onClick={() => setModal({ type: "document" })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              {athlete.documents.map((document) => (
                <button
                  key={document.name}
                  type="button"
                  onClick={() =>
                    setModal({
                      type: "view-document",
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
            title="Equipment History"
            action={
              <button
                type="button"
                onClick={() => setModal({ type: "issue" })}
                className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                ISSUE ITEM
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle/60 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <th className="p-5 pl-0">Item Description</th>
                    <th className="p-5">Issued Date</th>
                    <th className="p-5">Due Date</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 pr-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                  {athlete.equipmentHistory.map((item) => {
                    const Icon =
                      equipmentIcons[item.icon] ?? equipmentIcons.default;
                    return (
                      <tr
                        key={`${item.name}-${item.serial}`}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="p-5 pl-0">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <Icon className="h-5 w-5 opacity-60" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Serial: {item.serial}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-slate-600">{item.issuedDate}</td>
                        <td
                          className={`p-5 ${
                            item.status === "Overdue"
                              ? "font-semibold text-red-600"
                              : "text-slate-600"
                          }`}
                        >
                          {item.dueDate}
                        </td>
                        <td className="p-5">
                          <StatusPill status={item.status} />
                        </td>
                        <td className="p-5 pr-0 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setModal({
                                type: "equipment-action",
                                payload: item.name,
                              })
                            }
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-blue"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ProfileCard>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="Eligibility"
            value={athlete.overview.eligibility}
            hint={athlete.overview.eligibilityNote}
            tone="blue"
          />
          <MetricTile
            label="Training Load"
            value={athlete.overview.trainingLoad}
            hint={athlete.overview.trainingNote}
            tone="gold"
          />
          <MetricTile
            label="Next Review"
            value={athlete.overview.nextReview}
            hint={athlete.overview.reviewOwner}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ProfileCard title="Current Focus and Alerts">
            <div className="grid gap-3">
              {athlete.overview.alerts.map((alert) => (
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

          <ProfileCard title="Milestones and Recognition">
            <div className="space-y-3">
              {athlete.achievements.map((item) => (
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
  }, [activeTab, athlete, eventPage]);

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <img
                src={athlete.imageUrl}
                alt={athlete.name}
                className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-soft"
              />

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {athlete.name}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone}`}
                  >
                    {athlete.status}
                  </span>
                </div>
                <p className="text-[15px] font-medium text-brand-blue">
                  {athlete.sport} | {athlete.event}
                </p>
                <p className="max-w-3xl text-[14px] leading-relaxed text-slate-600">
                  {athlete.overview.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={UserRound} label="Student ID" value={athlete.id} />
              <ProfileBadge
                icon={CalendarDays}
                label="Year Level"
                value={athlete.year}
              />
              <ProfileBadge
                icon={TrendingUp}
                label="Academic Standing"
                value={athlete.standing}
              />
              <ProfileBadge icon={Clock3} label="Coach" value={athlete.coach} />
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
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                Open Detailed Info
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 border-b border-border-subtle/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Athlete Workspace
            </p>
            <h2 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">
              {activeCopy.title}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
              {activeCopy.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        <div className="pt-6">{currentTabContent}</div>
      </div>

      <AthleteProfileModal modal={modal} onClose={closeModal} athlete={athlete} />
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
      <span className={`mt-2.5 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${toneClass}`}>
        {hint}
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  const tone =
    status === "In Possession"
      ? "bg-green-50 text-green-700"
      : status === "Overdue"
        ? "bg-red-50 text-red-700"
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

function AthleteProfileModal({ modal, onClose, athlete }) {
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
        title="Update Athlete Status"
        description={`Adjust clearance and scholarship markers for ${athlete.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Medical status">
            <SelectInput defaultValue={athlete.status}>
              <option>Cleared</option>
              <option>Injured</option>
              <option>Pending Review</option>
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput defaultValue={athlete.scholarship}>
              <option>Full Scholarship</option>
              <option>Partial Scholarship</option>
              <option>Walk-on</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status note">
              <TextArea placeholder="Summarize why this status is being updated." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "report") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Academic Performance Report"
        description="Prepare a detailed report for coaching and compliance review."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={onClose}>Generate report</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="info" title={`${athlete.gpa} GPA currently tracked`}>
          The modal is ready for historical grade, eligibility, and attendance
          data once the backend is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "document") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Document"
        description="Register a new file record on the athlete profile."
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document name">
            <TextInput placeholder="Medical clearance" />
          </Field>
          <Field label="Document type">
            <SelectInput defaultValue="Medical">
              <option>Medical</option>
              <option>Scholarship</option>
              <option>Identification</option>
              <option>Academic</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea placeholder="Expiration date, verification notes, or owner..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "view-document") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.payload}
        description="Document details are shown here until file preview storage is connected."
        footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}
      >
        <FeedbackPanel tone="success" title="Verified profile document">
          This placeholder detail view can later include file preview, expiry
          status, download, and audit trail actions.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "issue") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Issue Equipment"
        description={`Assign a new item to ${athlete.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asset">
            <TextInput placeholder="Search equipment ID or name" />
          </Field>
          <Field label="Due date">
            <TextInput type="date" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Issue notes">
              <TextArea placeholder="Fit notes, coach authorization, or return conditions..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Equipment Actions"
      description={`Manage ${modal.payload}.`}
      footer={footer}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          View details
        </button>
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          Mark returned
        </button>
        <button className="rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-[13px] font-bold text-red-700 hover:bg-red-100">
          Report issue
        </button>
      </div>
    </Modal>
  );
}
