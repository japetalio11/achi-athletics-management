import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Megaphone,
  PencilLine,
  Plus,
  Trash2,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { SelectInput } from "../../components/ui/Modal";
import { actionIcons } from "../../components/ui/actionButtonIcons";
import { athletePool, participationStatuses } from "./eventsMockData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
  { id: "results", label: "Results" },
  { id: "schedule", label: "Schedule" },
  { id: "notes", label: "Notes" },
];

const statusBadgeClasses = {
  Draft: "bg-slate-100 text-slate-600",
  Scheduled: "bg-brand-blue-light text-brand-blue",
  Ongoing: "bg-brand-gold-light text-brand-gold-hover",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const resultBadgeClasses = {
  "Not Started": "bg-slate-100 text-slate-600",
  "Pending Results": "bg-amber-50 text-amber-700",
  "Results Recorded": "bg-blue-50 text-blue-700",
  Published: "bg-emerald-50 text-emerald-700",
};

const visibilityBadgeClasses = {
  Private: "bg-slate-100 text-slate-600",
  Public: "bg-brand-blue-light text-brand-blue",
};

const participationBadgeClasses = {
  Assigned: "bg-slate-100 text-slate-600",
  Confirmed: "bg-brand-blue-light text-brand-blue",
  Participated: "bg-blue-50 text-blue-700",
  Absent: "bg-red-50 text-red-700",
  Excused: "bg-amber-50 text-amber-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export function EventInfoPage({
  event,
  initialTab = "overview",
  canManageEvents,
  onBack,
  onSelectTab,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
  onPublish,
  onUnpublish,
  onDuplicate,
  onCancel,
  onArchive,
  onRemoveAthlete,
  onUpdateAssignmentField,
  onOpenNoteForm,
  onDeleteNote,
  onOpenScheduleEdit,
  onOpenAthleteProfile,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [openMenuId, setOpenMenuId] = useState(null);

  const assignedProfiles = useMemo(() => getAssignedProfiles(event), [event]);
  const published = event?.resultStatus === "Published";

  if (!event) {
    return (
      <div className="space-y-6 pb-24">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </button>
        <EmptyState
          title="Event not found"
          body="The selected event is not available in local frontend state."
        />
      </div>
    );
  }

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    onSelectTab?.(tabId);
  };

  const menuItems = [
    { label: "Edit Event", icon: PencilLine, onClick: () => onOpenEdit(event) },
    { label: "Assign Athletes", icon: UserPlus, onClick: () => onOpenAssign(event) },
    { label: "Record Results", icon: Trophy, onClick: () => onOpenResults(event) },
    published
      ? { label: "Unpublish Results", icon: Megaphone, onClick: () => onUnpublish(event.id) }
      : { label: "Publish Results", icon: Megaphone, onClick: () => onPublish(event.id) },
    { label: "Duplicate Event", icon: actionIcons.add, onClick: () => onDuplicate(event) },
    ...(event.status !== "Cancelled"
      ? [{ label: "Cancel Event", icon: Trash2, tone: "danger", onClick: () => onCancel(event) }]
      : []),
    { label: "Archive Event", icon: actionIcons.archive, tone: "danger", onClick: () => onArchive(event) },
  ];

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </button>

      <header className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={event.status} />
              <ResultStatusBadge value={event.resultStatus} />
              <VisibilityBadge value={event.visibility} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                {event.title}
              </h1>
              <p className="mt-2 text-[15px] font-medium text-brand-blue">
                {event.sportCategory} | {event.type}
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                {event.description || event.publicDescription || "No description recorded."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={CalendarDays} label="Date" value={formatEventDate(event.startDate, event.endDate)} />
              <ProfileBadge icon={Clock3} label="Time" value={formatEventTime(event.startTime, event.endTime)} />
              <ProfileBadge icon={MapPin} label="Venue" value={event.venue} />
              <ProfileBadge icon={Users} label="Participants" value={`${event.assignedAthletes.length}/${event.maxParticipants}`} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Event Actions
            </p>
            <div className="mt-4 space-y-3">
              {canManageEvents ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenEdit(event)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Event
                  </button>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenResults(event)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
                    >
                      <Trophy className="h-4 w-4" />
                      Results
                    </button>
                    <ActionMenu
                      label={`More actions for ${event.title}`}
                      open={openMenuId === "header-actions"}
                      onToggle={() => setOpenMenuId((current) => (current === "header-actions" ? null : "header-actions"))}
                      onClose={() => setOpenMenuId(null)}
                      items={menuItems}
                    />
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab(event.resultStatus === "Published" ? "results" : "schedule")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
                >
                  {event.resultStatus === "Published" ? <Trophy className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                  {event.resultStatus === "Published" ? "View Results" : "View Schedule"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </header>

      <section className="relative isolate overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="border-b border-border-subtle/70 pb-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                    active
                      ? "bg-brand-blue text-white shadow-soft"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          {activeTab === "overview" && (
            <OverviewTab event={event} assignedProfiles={assignedProfiles} onOpenTab={switchTab} onOpenEdit={onOpenEdit} />
          )}
          {activeTab === "participants" && (
            <ParticipantsTab
              event={event}
              assignedProfiles={assignedProfiles}
              canManageEvents={canManageEvents}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenAssign={onOpenAssign}
              onOpenResults={onOpenResults}
              onRemoveAthlete={onRemoveAthlete}
              onUpdateAssignmentField={onUpdateAssignmentField}
              onOpenAthleteProfile={onOpenAthleteProfile}
            />
          )}
          {activeTab === "results" && (
            <ResultsTab
              event={event}
              assignedProfiles={assignedProfiles}
              canManageEvents={canManageEvents}
              onOpenResults={onOpenResults}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
            />
          )}
          {activeTab === "schedule" && (
            <ScheduleTab event={event} canManageEvents={canManageEvents} onOpenEdit={onOpenEdit} onOpenScheduleEdit={onOpenScheduleEdit} />
          )}
          {activeTab === "notes" && (
            <NotesTab
              event={event}
              canManageEvents={canManageEvents}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenNoteForm={onOpenNoteForm}
              onDeleteNote={onDeleteNote}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function OverviewTab({ event, assignedProfiles, onOpenTab, onOpenEdit }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <InfoTile label="Organizer" value={event.organizer} />
        <InfoTile label="Result summary" value={event.overallResult || event.teamResult || "No results recorded yet."} />
        <InfoTile label="Call time" value={event.callTime ? toTwelveHour(event.callTime) : "Not set"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailPanel title="Internal description" body={event.description || "No internal description."} />
        <DetailPanel title="Public description" body={event.publicDescription || "No public description."} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard icon={PencilLine} title="Edit overview" onClick={() => onOpenEdit(event)} />
        <ActionCard icon={Users} title="View participants" onClick={() => onOpenTab("participants")} />
        <ActionCard icon={Trophy} title="View results" onClick={() => onOpenTab("results")} />
        <ActionCard icon={CalendarClock} title="Open schedule" onClick={() => onOpenTab("schedule")} />
      </div>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Recent Activity" description="Local event activity and frontend state updates." />
        <ActivityList items={event.activityLog} />
      </section>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Participants Snapshot" description={`${assignedProfiles.length} assigned athlete${assignedProfiles.length === 1 ? "" : "s"}.`} />
        {assignedProfiles.length === 0 ? (
          <EmptyState title="No participants assigned" body="Assign athletes from the Participants tab." />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {assignedProfiles.slice(0, 4).map((profile) => (
              <MiniParticipant key={profile.athleteId} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ParticipantsTab({
  event,
  assignedProfiles,
  canManageEvents,
  openMenuId,
  setOpenMenuId,
  onOpenAssign,
  onOpenResults,
  onRemoveAthlete,
  onUpdateAssignmentField,
  onOpenAthleteProfile,
}) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Assigned Athletes"
        description="Manage event participation, attendance readiness, and athlete-level result status."
        action={
          canManageEvents ? (
            <button type="button" onClick={() => onOpenAssign(event)} className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft hover:bg-brand-blue-hover">
              <UserPlus className="h-4 w-4" />
              Assign Athletes
            </button>
          ) : null
        }
      />
      {assignedProfiles.length === 0 ? (
        <EmptyState title="No participants assigned" body="Use Assign Athletes to add participants to this event." />
      ) : (
        <div className="space-y-3">
          {assignedProfiles.map((profile) => {
            const menuId = `participant-${profile.athleteId}`;
            return (
              <article key={profile.athleteId} className="rounded-[22px] border border-border-subtle/60 bg-white p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto] lg:items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">{profile.athlete?.name ?? "Unknown athlete"}</p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {profile.athlete?.studentId} | {profile.athlete?.team} | {profile.athlete?.yearLevel}
                    </p>
                  </div>
                  <ParticipationBadge value={profile.participationStatus} />
                  <ResultStatusBadge value={profile.resultStatus} />
                  {canManageEvents ? (
                    <ActionMenu
                      label={`Actions for ${profile.athlete?.name ?? "athlete"}`}
                      open={openMenuId === menuId}
                      onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                      onClose={() => setOpenMenuId(null)}
                      items={[
                        { label: "Open Athlete Profile", icon: Eye, onClick: () => onOpenAthleteProfile(profile.athlete) },
                        { label: "Add/Edit Result", icon: Trophy, onClick: () => onOpenResults(event) },
                        { label: "Remove From Event", icon: UserMinus, tone: "danger", onClick: () => onRemoveAthlete(event.id, profile.athleteId) },
                      ]}
                    />
                  ) : null}
                </div>
                {canManageEvents ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Participation
                      </span>
                      <SelectInput
                        value={profile.participationStatus}
                        onChange={(changeEvent) =>
                          onUpdateAssignmentField(event.id, profile.athleteId, "participationStatus", changeEvent.target.value)
                        }
                      >
                        {participationStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </SelectInput>
                    </label>
                    <InfoTile label="Result" value={profile.placement} />
                    <InfoTile label="Statistics" value={profile.scoreStatistics} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultsTab({ event, assignedProfiles, canManageEvents, onOpenResults, onPublish, onUnpublish }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Event Results"
        description="Overall outcome and athlete-specific performance records."
        action={
          canManageEvents ? (
            <button type="button" onClick={() => onOpenResults(event)} className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft hover:bg-brand-blue-hover">
              <Trophy className="h-4 w-4" />
              Record Results
            </button>
          ) : null
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <DetailPanel title="Overall result" body={event.overallResult || "No results recorded yet."} />
        <DetailPanel title="Winner / standing" body={event.winner || "Pending"} />
        <DetailPanel title="Team result" body={event.teamResult || "Pending"} />
      </div>
      {canManageEvents ? (
        <div className="flex flex-wrap gap-3">
          {event.resultStatus === "Published" ? (
            <SecondaryAction icon={Megaphone} label="Unpublish Results" onClick={() => onUnpublish(event.id)} />
          ) : (
            <SecondaryAction icon={Megaphone} label="Publish Results" onClick={() => onPublish(event.id)} />
          )}
        </div>
      ) : null}
      {assignedProfiles.length === 0 ? (
        <EmptyState title="No athlete results" body="Assign athletes before recording athlete-specific results." />
      ) : (
        <div className="space-y-3">
          {assignedProfiles.map((profile) => (
            <article key={profile.athleteId} className="rounded-[22px] border border-border-subtle/60 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{profile.athlete?.name ?? "Unknown athlete"}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{profile.scoreStatistics || "No statistics recorded."}</p>
                </div>
                <ResultStatusBadge value={profile.resultStatus} />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <InfoTile label="Placement" value={profile.placement} />
                <InfoTile label="Performance notes" value={profile.performanceNotes} />
                <InfoTile label="Staff remarks" value={profile.coachRemarks} />
              </div>
              {profile.metrics?.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {profile.metrics.map((metric, index) => (
                    <InfoTile key={`${profile.athleteId}-${index}`} label={metric.name || "Metric"} value={`${metric.value || "Pending"} ${metric.unit || ""}`.trim()} />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleTab({ event, canManageEvents, onOpenEdit, onOpenScheduleEdit }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Schedule and Venue"
        description="Date, time, call time, venue, and schedule reminders."
        action={
          canManageEvents ? (
            <button type="button" onClick={() => onOpenScheduleEdit(event)} className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft hover:bg-brand-blue-hover">
              <CalendarClock className="h-4 w-4" />
              Edit Schedule
            </button>
          ) : null
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="Start" value={`${formatDate(event.startDate)} at ${toTwelveHour(event.startTime)}`} />
        <InfoTile label="End" value={`${formatDate(event.endDate)} at ${toTwelveHour(event.endTime)}`} />
        <InfoTile label="Call time" value={event.callTime ? toTwelveHour(event.callTime) : "Not set"} />
        <InfoTile label="Venue" value={event.venue} />
      </div>
      <DetailPanel title="Schedule notes" body={event.scheduleNotes || "No schedule notes recorded."} />
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Event Timeline" description="Simple frontend timeline based on the event schedule." />
        <div className="mt-4 space-y-3">
          <TimelineItem icon={Clock3} title="Call time" body={event.callTime ? toTwelveHour(event.callTime) : "Not set"} />
          <TimelineItem icon={CalendarDays} title="Event starts" body={`${formatDate(event.startDate)} at ${toTwelveHour(event.startTime)}`} />
          <TimelineItem icon={CheckCircle2} title="Event ends" body={`${formatDate(event.endDate)} at ${toTwelveHour(event.endTime)}`} />
        </div>
      </section>
      {canManageEvents ? (
        <SecondaryAction icon={PencilLine} label="Edit Full Event Details" onClick={() => onOpenEdit(event)} />
      ) : null}
    </div>
  );
}

function NotesTab({ event, canManageEvents, openMenuId, setOpenMenuId, onOpenNoteForm, onDeleteNote }) {
  const publicNotes = event.publicNotes ?? [];
  const internalNotes = event.internalNoteEntries ?? [];

  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Notes and Activity"
        description="Separate public-facing notes from internal staff remarks."
        action={
          canManageEvents ? (
            <button type="button" onClick={() => onOpenNoteForm(event)} className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft hover:bg-brand-blue-hover">
              <Plus className="h-4 w-4" />
              Add Note
            </button>
          ) : null
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Public Notes" description="Notes appropriate for public or read-only schedules." />
          <div className="mt-4 space-y-3">
            {publicNotes.length === 0 ? (
              <EmptyState title="No public notes" body="Public schedule notes will appear here." />
            ) : (
              publicNotes.map((note, index) => <DetailPanel key={`${event.id}-public-${index}`} title={`Public note ${index + 1}`} body={note} />)
            )}
          </div>
        </section>
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Internal Notes" description="Staff-only planning notes and remarks." />
          <div className="mt-4 space-y-3">
            {internalNotes.length === 0 ? (
              <EmptyState title="No internal notes" body="Internal staff notes will appear here." />
            ) : (
              internalNotes.map((note) => {
                const menuId = `note-${note.id}`;
                return (
                  <article key={note.id} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{note.title}</p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {note.author} | {formatDate(note.createdAt.slice(0, 10))}
                        </p>
                      </div>
                      {canManageEvents ? (
                        <ActionMenu
                          label={`Actions for ${note.title}`}
                          open={openMenuId === menuId}
                          onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            { label: "Edit Note", icon: PencilLine, onClick: () => onOpenNoteForm(event, note) },
                            { label: "Delete Note", icon: Trash2, tone: "danger", onClick: () => onDeleteNote(event.id, note.id) },
                          ]}
                        />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{note.body}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Activity Log" description="Frontend activity feed for this event." />
        <ActivityList items={event.activityLog} />
      </section>
    </div>
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
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border-subtle/60 bg-slate-50/80 p-4 text-left transition-colors hover:border-brand-blue/20 hover:bg-brand-blue-light/60"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-soft">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
    </button>
  );
}

function SecondaryAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MiniParticipant({ profile }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-white p-4">
      <p className="font-bold text-slate-950">{profile.athlete?.name ?? "Unknown athlete"}</p>
      <p className="mt-1 text-[12px] text-slate-500">{profile.athlete?.team}</p>
      <div className="mt-3">
        <ParticipationBadge value={profile.participationStatus} />
      </div>
    </div>
  );
}

function TimelineItem({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border-subtle/60 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{body}</p>
      </div>
    </div>
  );
}

function ActivityList({ items = [] }) {
  if (!items.length) {
    return <EmptyState title="No activity yet" body="Saved event changes will appear here." />;
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl border border-border-subtle/60 bg-white p-4">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-blue" />
          <p className="text-sm leading-6 text-slate-600">{item}</p>
        </div>
      ))}
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

function StatusBadge({ value }) {
  return <Badge value={value} className={statusBadgeClasses[value]} />;
}

function ResultStatusBadge({ value }) {
  return <Badge value={value} className={resultBadgeClasses[value]} />;
}

function VisibilityBadge({ value }) {
  return <Badge value={value} className={visibilityBadgeClasses[value]} />;
}

function ParticipationBadge({ value }) {
  return <Badge value={value} className={participationBadgeClasses[value]} />;
}

function Badge({ value, className }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {value}
    </span>
  );
}

function getAssignedProfiles(event) {
  if (!event) return [];
  return event.assignedAthletes.map((assignment) => ({
    ...assignment,
    athlete: athletePool.find((athlete) => athlete.id === assignment.athleteId),
  }));
}

function formatEventDate(startDate, endDate) {
  if (startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(startTime, endTime) {
  return `${toTwelveHour(startTime)} - ${toTwelveHour(endTime)}`;
}

function toTwelveHour(value) {
  if (!value) return "Pending";
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:${minuteString} ${suffix}`;
}
