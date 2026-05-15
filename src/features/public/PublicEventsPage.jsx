import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Medal,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { athletePool, mockEvents, mockCompetitionResults } from "../events/eventsMockData";
import { EmptyState, PublicBadge, PublicHero, PublicPageShell } from "./PublicLayout";
import {
  EmptyInline,
  MetaPill,
  PublicSection,
  ViewSwitcher,
} from "./PublicShared";
import { formatPublicDate, formatPublicDateTime, getSportMeta, toTwelveHour } from "./publicUtils";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const views = [
  { id: "upcoming", label: "Upcoming", icon: CalendarDays },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "results", label: "Results", icon: Trophy },
];

const eventStatusClasses = {
  Scheduled: "bg-brand-blue-light text-brand-blue",
  Ongoing: "bg-brand-gold-light text-brand-gold-hover",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const resultClasses = {
  Published: "bg-green-50 text-green-700",
  "Results Recorded": "bg-amber-50 text-amber-700",
  "Pending Results": "bg-brand-gold-light text-brand-gold-hover",
  "Not Started": "bg-slate-100 text-slate-600",
};

export function PublicEventsPage() {
  const publicEvents = useMemo(
    () =>
      mockEvents
        .filter((event) => event.visibility === "Public" && !event.archived && event.status !== "Draft")
        .sort(
          (left, right) =>
            new Date(`${left.startDate}T${left.startTime}`) -
            new Date(`${right.startDate}T${right.startTime}`),
        ),
    [],
  );
  const [activeView, setActiveView] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [selectedEventId, setSelectedEventId] = useState(publicEvents[0]?.id ?? null);

  const sports = useMemo(
    () => ["All sports", ...Array.from(new Set(publicEvents.map((event) => event.sportCategory)))],
    [publicEvents],
  );

  const filteredEvents = useMemo(() => {
    return publicEvents.filter((event) => {
      const haystack = [
        event.title,
        event.type,
        event.sportCategory,
        event.venue,
        event.publicDescription,
        event.status,
        event.overallResult,
        event.winner,
        event.teamResult,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(query.trim().toLowerCase()) &&
        (sport === "All sports" || event.sportCategory === sport) &&
        (status === "All statuses" || event.status === status)
      );
    });
  }, [publicEvents, query, sport, status]);

  const calendarEvents = useMemo(
    () =>
      filteredEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(`${event.startDate}T${event.startTime}`),
        end: new Date(`${event.endDate}T${event.endTime}`),
        resource: event,
      })),
    [filteredEvents],
  );

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ??
    publicEvents.find((event) => event.id === selectedEventId) ??
    filteredEvents[0] ??
    null;

  const resultEvents = filteredEvents.filter((event) => event.status === "Completed");

  return (
    <PublicPageShell compact>
      <main className="pb-16">
        <PublicHero
          eyebrow="Public athletics event hub"
          title="Follow athletics schedules, sport categories, and official published results."
          description="Browse upcoming public events, switch to a calendar when you want the full schedule picture, and move to the results board when you just want the final outcomes."
          icon={CalendarDays}
        />

        <section className="mt-10 space-y-6">
          <ViewSwitcher views={views} value={activeView} onChange={setActiveView} />

          <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events, sports, venues, or results"
                  className="w-full rounded-full border border-border-subtle bg-slate-50 py-3 pl-11 pr-4 text-[13px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
                />
              </label>
              <label className="relative">
                <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className="w-full appearance-none rounded-full border border-border-subtle bg-slate-50 py-3 pl-11 pr-4 text-[13px] font-bold text-slate-600 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
                >
                  {sports.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full appearance-none rounded-full border border-border-subtle bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-600 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
              >
                {["All statuses", "Scheduled", "Ongoing", "Completed", "Cancelled"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {activeView === "upcoming" ? (
            <div className="space-y-6">
              <PublicSection
                title="Latest results"
                description="Recent match outcomes from completed competitions."
                icon={Medal}
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockCompetitionResults.slice(0, 3).map((result) => (
                    <ResultBanner key={result.id} result={result} />
                  ))}
                </div>
              </PublicSection>
            </div>
          ) : null}

          {activeView === "upcoming" ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
              <div className="space-y-5">
                {filteredEvents.length ? (
                  filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      selected={event.id === selectedEvent?.id}
                      onSelect={() => setSelectedEventId(event.id)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="No public events found"
                    description="Try another sport, status, or search term. Only events approved for public viewing appear here."
                  />
                )}
              </div>
              <EventDetailsPanel event={selectedEvent} />
            </section>
          ) : null}

          {activeView === "calendar" ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <PublicSection
                title="Public calendar"
                description="Select any event to open the public details panel."
                icon={CalendarDays}
              >
                {calendarEvents.length ? (
                  <div className="overflow-hidden rounded-[24px] border border-border-subtle/70">
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      view="month"
                      views={["month"]}
                      className="adnu-events-calendar"
                      style={{ minHeight: 680 }}
                      popup
                      toolbar={false}
                      eventPropGetter={(calendarEvent) => ({
                        className: getCalendarEventClassName(calendarEvent.resource),
                      })}
                      onSelectEvent={(calendarEvent) => setSelectedEventId(calendarEvent.resource.id)}
                      components={{ event: CalendarEventLabel }}
                    />
                  </div>
                ) : (
                  <EmptyInline
                    title="No events on this calendar view"
                    description="There are no public events matching your filters right now."
                    icon={CalendarDays}
                  />
                )}
              </PublicSection>
              <EventDetailsPanel event={selectedEvent} />
            </section>
          ) : null}

          {activeView === "results" ? (
            <PublicSection
              title="Competition results"
              description="All completed competitions with official final scores."
              icon={Trophy}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockCompetitionResults.map((result) => (
                  <ResultBanner key={result.id} result={result} />
                ))}
              </div>
            </PublicSection>
          ) : null}
        </section>
      </main>
    </PublicPageShell>
  );
}

function EventCard({ event, selected, onSelect }) {
  const sportMeta = getSportMeta(event.sportCategory);
  const canShowResult = event.resultVisibility === "Public" || event.resultStatus === "Published";
  const SportIcon = sportMeta.icon;

  return (
    <article
      onClick={onSelect}
      className={`rounded-[28px] border p-6 shadow-soft backdrop-blur transition-colors cursor-pointer ${
        selected
          ? "border-brand-blue/20 bg-brand-blue-light/45"
          : "border-white/75 bg-white/90 hover:border-brand-blue/10 hover:bg-brand-blue-light/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PublicBadge className={sportMeta.badgeClass}>
          <SportIcon className="mr-1.5 h-3.5 w-3.5" />
          {event.sportCategory}
        </PublicBadge>
        <PublicBadge className={eventStatusClasses[event.status] ?? "bg-slate-100 text-slate-600"}>
          {event.status}
        </PublicBadge>
        <PublicBadge className="bg-slate-100 text-slate-600">{event.type}</PublicBadge>
        <PublicBadge className={resultClasses[event.resultStatus] ?? "bg-slate-100 text-slate-600"}>
          {canShowResult ? "Results available" : event.resultStatus}
        </PublicBadge>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{event.title}</h2>
          <p className="mt-3 text-[14px] leading-7 text-slate-600">
            {event.publicDescription || "Public details will be posted when the athletics office publishes this event."}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <MetaPill icon={CalendarDays}>{formatPublicDate(event.startDate)}</MetaPill>
        <MetaPill icon={Clock3}>
          {toTwelveHour(event.startTime)} - {toTwelveHour(event.endTime)}
        </MetaPill>
        <MetaPill icon={MapPin}>{event.venue}</MetaPill>
      </div>
    </article>
  );
}

function ResultBoardCard({ event, selected, onSelect }) {
  const sportMeta = getSportMeta(event.sportCategory);
  const SportIcon = sportMeta.icon;
  const canShowResult = event.resultVisibility === "Public" || event.resultStatus === "Published";
  const participants = getPublicParticipants(event);

  return (
    <article
      onClick={onSelect}
      className={`rounded-[28px] border p-6 shadow-soft transition-colors cursor-pointer ${
        selected ? "border-brand-blue/20 bg-brand-blue-light/45" : "border-white/75 bg-white/90 hover:border-brand-blue/10 hover:bg-brand-blue-light/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PublicBadge className={sportMeta.badgeClass}>
          <SportIcon className="mr-1.5 h-3.5 w-3.5" />
          {event.sportCategory}
        </PublicBadge>
        <PublicBadge className={eventStatusClasses[event.status] ?? "bg-slate-100 text-slate-600"}>
          {event.status}
        </PublicBadge>
        <PublicBadge className={resultClasses[event.resultStatus] ?? "bg-slate-100 text-slate-600"}>
          {event.resultStatus}
        </PublicBadge>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{event.title}</h2>
          <p className="mt-2 text-[13px] font-semibold text-slate-500">
            {formatPublicDate(event.startDate)} | {event.venue}
          </p>
        </div>
      </div>

      {canShowResult ? (
        <div className="mt-5 grid gap-3">
          {participants.length >= 2 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {participants.slice(0, 2).map((participant, index) => (
                <div
                  key={`${participant.name}-${index}`}
                  className={`rounded-[22px] border p-4 ${
                    participant.isWinner
                      ? "border-green-200 bg-green-50/80"
                      : "border-border-subtle bg-slate-50/80"
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {participant.isWinner ? "Winner" : `Result ${index + 1}`}
                  </p>
                  <p className="mt-2 text-[16px] font-black text-slate-950">{participant.name}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{participant.team}</p>
                  <p className="mt-3 text-[14px] font-bold text-slate-800">{participant.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {participants.slice(0, 4).map((participant, index) => (
                <div key={`${participant.name}-${index}`} className="rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-black text-slate-950">{participant.name}</p>
                      <p className="mt-1 text-[12px] text-slate-500">{participant.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black uppercase tracking-[0.14em] text-slate-400">{participant.rank}</p>
                      <p className="mt-1 text-[14px] font-bold text-slate-800">{participant.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-[22px] border border-green-100 bg-green-50/70 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-green-700">Official result</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-700">
              {event.overallResult || event.teamResult || "Official result details are available for public review."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
          <p className="text-[14px] font-black text-slate-900">Results not yet published</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">
            This event is completed, but public-facing result publication is still pending.
          </p>
        </div>
      )}
    </article>
  );
}

function EventDetailsPanel({ event, emphasizeResults = false }) {
  if (!event) {
    return (
      <PublicSection title="Event details" description="Select an event to see the public summary." icon={CalendarDays}>
        <EmptyInline
          title="Choose an event"
          description="Details, published notes, and results stay tucked away until you select an event."
          icon={CalendarDays}
        />
      </PublicSection>
    );
  }

  const sportMeta = getSportMeta(event.sportCategory);
  const SportIcon = sportMeta.icon;
  const canShowResult = event.resultVisibility === "Public" || event.resultStatus === "Published";
  const participants = getPublicParticipants(event);

  return (
    <PublicSection
      title="Selected event"
      description="Public overview, schedule, venue, participants, and published outcomes."
      icon={CalendarDays}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PublicBadge className={sportMeta.badgeClass}>
          <SportIcon className="mr-1.5 h-3.5 w-3.5" />
          {event.sportCategory}
        </PublicBadge>
        <PublicBadge className={eventStatusClasses[event.status] ?? "bg-slate-100 text-slate-600"}>
          {event.status}
        </PublicBadge>
        <PublicBadge className="bg-slate-100 text-slate-600">{event.type}</PublicBadge>
        <PublicBadge className={resultClasses[event.resultStatus] ?? "bg-slate-100 text-slate-600"}>
          {event.resultStatus}
        </PublicBadge>
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950">{event.title}</h3>
      <p className="mt-3 text-[14px] leading-7 text-slate-600">
        {event.publicDescription || "Public details will be posted when this event is ready for public viewing."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetaPill icon={CalendarDays}>{formatPublicDateTime(event.startDate, event.startTime, event.endTime)}</MetaPill>
        <MetaPill icon={MapPin}>{event.venue}</MetaPill>
      </div>

      <div className="mt-5 grid gap-3">
        <DetailCard label="Event overview" value={event.publicDescription || event.description || "No public overview posted yet."} />
        <DetailCard label="Schedule" value={`${formatPublicDate(event.startDate)}${event.endDate !== event.startDate ? ` to ${formatPublicDate(event.endDate)}` : ""} | ${toTwelveHour(event.startTime)} - ${toTwelveHour(event.endTime)}`} />
        <DetailCard label="Venue" value={event.venue} />
        <DetailCard label="Public announcements" value={(event.publicNotes ?? []).join(" ") || "No public announcements posted yet."} />
      </div>

      <div className="mt-5 rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-blue" />
          <h4 className="text-[14px] font-black text-slate-900">Participating teams or athletes</h4>
        </div>
        {participants.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {participants.slice(0, 8).map((participant, index) => (
              <span key={`${participant.name}-${index}`} className="rounded-full bg-white px-3 py-2 text-[12px] font-bold text-slate-700 shadow-soft">
                {participant.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-6 text-slate-500">No public participant list is posted for this event.</p>
        )}
      </div>

      <div className={`mt-5 rounded-[22px] border p-4 ${canShowResult ? "border-green-100 bg-green-50/70" : "border-border-subtle bg-slate-50/80"}`}>
        <div className="flex items-center gap-2">
          <Trophy className={`h-4 w-4 ${canShowResult ? "text-green-700" : "text-slate-400"}`} />
          <h4 className="text-[14px] font-black text-slate-900">{emphasizeResults ? "Results board" : "Published results"}</h4>
        </div>
        {canShowResult ? (
          <>
            <p className="mt-3 text-[13px] leading-6 text-slate-700">
              {event.overallResult || event.teamResult || "Official result details are available for public review."}
            </p>
            {participants.length ? (
              <div className="mt-3 grid gap-3">
                {participants.slice(0, 4).map((participant, index) => (
                  <div key={`${participant.name}-${index}`} className="rounded-2xl bg-white px-4 py-3 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-black text-slate-950">{participant.name}</p>
                        <p className="mt-1 text-[12px] text-slate-500">{participant.team}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{participant.rank}</p>
                        <p className="mt-1 text-[13px] font-bold text-slate-800">{participant.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-[13px] leading-6 text-slate-500">
            Results are not published for public viewing yet.
          </p>
        )}
      </div>
    </PublicSection>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-[13px] leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function CalendarEventLabel({ event }) {
  const sportMeta = getSportMeta(event.resource.sportCategory);
  const SportIcon = sportMeta.icon;

  return (
    <div className="flex items-start gap-2">
      <SportIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="truncate">{event.title}</div>
        <div className="truncate text-[9px] font-semibold opacity-80">
          {toTwelveHour(event.resource.startTime)}
        </div>
      </div>
    </div>
  );
}

function getCalendarEventClassName(event) {
  const statusClass = String(event.status).toLowerCase().replaceAll(" ", "-");
  return `adnu-event adnu-events-calendar__event adnu-events-calendar__event--${statusClass}`;
}

function getPublicParticipants(event) {
  return (event.assignedAthletes ?? [])
    .map((assignment) => ({
      name: assignment.athleteId,
      team: assignment.placement || assignment.participationStatus || "Participant",
      value: assignment.scoreStatistics || assignment.resultStatus || "Result pending",
      rank: assignment.placement || "Participant",
      isWinner:
        event.winner &&
        `${assignment.placement} ${assignment.scoreStatistics}`.toLowerCase().includes(String(event.winner).toLowerCase()),
    }))
    .map((participant, index) => {
      const athleteName = getAthleteName(event, participant.name);
      const athleteTeam = getAthleteTeam(event, participant.name);
      return {
        ...participant,
        name: athleteName || (index === 0 && event.winner ? event.winner : `Participant ${index + 1}`),
        team: athleteTeam || participant.team,
      };
    });
}

function getAthleteName(event, athleteId) {
  const athlete = (event.assignedAthletes ?? []).find((item) => item.athleteId === athleteId);
  if (!athlete) return "";
  return athletePool.find((candidate) => candidate.id === athlete.athleteId)?.name || "";
}

function getAthleteTeam(event, athleteId) {
  const athlete = (event.assignedAthletes ?? []).find((item) => item.athleteId === athleteId);
  if (!athlete) return "";
  const profile = athletePool.find((candidate) => candidate.id === athlete.athleteId);
  return profile?.team || profile?.sport || event.teamResult || "Public participant";
}

function ResultBanner({ result }) {
  const isADNUWinner = result.winner === result.teamA;
  const sportMeta = getSportMeta(result.sport);
  const SportIcon = sportMeta.icon;

  return (
    <div className="rounded-[24px] border border-white bg-gradient-to-br from-white via-slate-50 to-white p-5 shadow-soft overflow-hidden">
      {/* Header: Sport and Date */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SportIcon className="h-4 w-4 text-brand-blue" />
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            {result.sport}
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-500">{formatPublicDate(result.date)}</span>
      </div>

      {/* Main Score Section */}
      <div className="mt-5 space-y-3">
        {/* Team A */}
        <div
          className={`rounded-[16px] p-3 transition-colors ${
            isADNUWinner
              ? "bg-green-50/80 border border-green-100"
              : "bg-slate-50/60 border border-slate-200"
          }`}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em]">
                {isADNUWinner ? "Winner" : "Team A"}
              </p>
              <p className="mt-1 text-[14px] font-black text-slate-950 truncate">
                {result.teamA}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[28px] font-black text-slate-950 leading-none">
                {result.scoreA}
              </p>
            </div>
          </div>
        </div>

        {/* Divider with "vs" */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[12px] font-bold text-slate-400">vs</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Team B */}
        <div
          className={`rounded-[16px] p-3 transition-colors ${
            !isADNUWinner && result.winner === result.teamB
              ? "bg-green-50/80 border border-green-100"
              : "bg-slate-50/60 border border-slate-200"
          }`}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em]">
                {!isADNUWinner && result.winner === result.teamB ? "Winner" : "Team B"}
              </p>
              <p className="mt-1 text-[14px] font-black text-slate-950 truncate">
                {result.teamB}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[28px] font-black text-slate-950 leading-none">
                {result.scoreB}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Result Status and Venue */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 bg-green-50/80 px-2.5 py-1 rounded-full">
          {result.winnerStatus}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Venue
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-700 truncate">
            {result.venue}
          </p>
        </div>
      </div>
    </div>
  );
}
