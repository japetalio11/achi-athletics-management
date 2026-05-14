import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  MoreHorizontal,
  Megaphone,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Trophy,
  UserPlus,
} from "lucide-react";
import {
  addMonths,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  parse,
  parseISO,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
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
import {
  athletePool,
  currentRole,
  eventStatuses,
  eventTypes,
  mockEvents,
  participationStatuses,
  resultStatuses,
  sportCategories,
  visibilityStatuses,
} from "./eventsMockData";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const viewTabs = [
  {
    id: "list",
    label: "List",
    icon: ListChecks,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    id: "results",
    label: "Results",
    icon: Trophy,
  },
];

const defaultFilters = {
  search: "",
  status: "All statuses",
  type: "All event types",
  sportCategory: "All sports",
  visibility: "All visibility",
  resultStatus: "All result statuses",
  startDate: "",
  endDate: "",
};

const emptyForm = {
  title: "",
  type: "Tournament",
  sportCategory: "Basketball",
  description: "",
  publicDescription: "",
  venue: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxParticipants: "",
  organizer: "",
  visibility: "Private",
  status: "Draft",
  internalNotes: "",
};

const statusPriority = {
  Ongoing: 0,
  Scheduled: 1,
  Draft: 2,
  Completed: 3,
  Cancelled: 4,
};

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

const resultVisibilityOptions = ["Internal Only", "Public"];

export function EventsView() {
  const [events, setEvents] = useState(mockEvents);
  const [activeView, setActiveView] = useState("list");
  const [filters, setFilters] = useState(defaultFilters);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentDate, setCurrentDate] = useState(parseISO(mockEvents[0].startDate));
  const [selectedDate, setSelectedDate] = useState(parseISO(mockEvents[0].startDate));
  const [selectedEventId, setSelectedEventId] = useState(mockEvents[0]?.id ?? null);
  const deferredSearch = useDeferredValue(filters.search);
  const canManageEvents = currentRole === "Staff/Admin";

  // Future Supabase/API handoff points: replace local state updates with fetchEvents,
  // createEvent, updateEvent, assignAthletes, recordResults, and publishResults calls.

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filteredEvents = useMemo(() => {
    const searchValue = deferredSearch.trim().toLowerCase();

    return events.filter((event) => {
      const assignedProfiles = getAssignedProfiles(event);
      const searchableText = [
        event.title,
        event.sportCategory,
        event.venue,
        event.type,
        event.organizer,
        event.description,
        event.publicDescription,
        event.overallResult,
        event.winner,
        event.teamResult,
        ...assignedProfiles.flatMap((profile) => [
          profile.athlete?.name,
          profile.athlete?.studentId,
          profile.athlete?.team,
          profile.placement,
          profile.scoreStatistics,
          profile.performanceNotes,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesStatus =
        filters.status === "All statuses" || event.status === filters.status;
      const matchesType =
        filters.type === "All event types" || event.type === filters.type;
      const matchesSport =
        filters.sportCategory === "All sports" ||
        event.sportCategory === filters.sportCategory;
      const matchesVisibility =
        filters.visibility === "All visibility" ||
        event.visibility === filters.visibility;
      const matchesResultStatus =
        filters.resultStatus === "All result statuses" ||
        event.resultStatus === filters.resultStatus;

      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      const filterStart = filters.startDate ? parseISO(filters.startDate) : null;
      const filterEnd = filters.endDate ? parseISO(filters.endDate) : null;
      const matchesStart =
        !filterStart || isSameDay(eventStart, filterStart) || isAfter(eventStart, filterStart);
      const matchesEnd =
        !filterEnd || isSameDay(eventEnd, filterEnd) || isBefore(eventEnd, filterEnd);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesSport &&
        matchesVisibility &&
        matchesResultStatus &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [deferredSearch, events, filters]);

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort((left, right) => {
        const leftPriority = statusPriority[left.status] ?? 99;
        const rightPriority = statusPriority[right.status] ?? 99;

        if (leftPriority !== rightPriority) return leftPriority - rightPriority;

        return (
          new Date(`${left.startDate}T${left.startTime}`) -
          new Date(`${right.startDate}T${right.startTime}`)
        );
      }),
    [filteredEvents],
  );

  const calendarEvents = useMemo(
    () =>
      sortedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(`${event.startDate}T${event.startTime}`),
        end: new Date(`${event.endDate}T${event.endTime}`),
        resource: event,
      })),
    [sortedEvents],
  );

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? sortedEvents[0] ?? null;

  const selectedDayEvents = sortedEvents.filter((event) =>
    eventOccursOnDate(event, selectedDate),
  );

  const activeModalEvent = modal?.eventId
    ? events.find((event) => event.id === modal.eventId)
    : null;

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const showFeedback = (tone, title, message) => {
    setFeedback({ tone, title, message });
  };

  const openCreateModal = () => {
    setModal({
      type: "event-form",
      mode: "create",
      values: {
        ...emptyForm,
        startDate: "2026-05-20",
        endDate: "2026-05-20",
        startTime: "08:00",
        endTime: "10:00",
      },
      errors: {},
    });
  };

  const openEditModal = (event) => {
    setModal({
      type: "event-form",
      mode: "edit",
      eventId: event.id,
      values: {
        title: event.title,
        type: event.type,
        sportCategory: event.sportCategory,
        description: event.description,
        publicDescription: event.publicDescription,
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        maxParticipants: String(event.maxParticipants),
        organizer: event.organizer,
        visibility: event.visibility,
        status: event.status,
        internalNotes: event.internalNotes,
      },
      errors: {},
    });
  };

  const saveEvent = () => {
    if (!modal || modal.type !== "event-form") return;

    const errors = validateEventForm(modal.values);
    if (Object.keys(errors).length > 0) {
      setModal((current) => ({ ...current, errors }));
      return;
    }

    const payload = {
      ...modal.values,
      maxParticipants: Number(modal.values.maxParticipants),
    };

    if (modal.mode === "edit") {
      setEvents((current) =>
        current.map((event) =>
          event.id === modal.eventId ? { ...event, ...payload } : event,
        ),
      );
      showFeedback("success", "Event updated", `${payload.title} has been updated locally.`);
    } else {
      const nextEvent = {
        id: `EVT-${String(Date.now()).slice(-6)}`,
        ...payload,
        resultStatus: "Not Started",
        publishedAt: "",
        overallResult: "",
        winner: "",
        teamResult: "",
        resultVisibility: "Internal Only",
        assignedAthletes: [],
      };

      setEvents((current) => [nextEvent, ...current]);
      setSelectedEventId(nextEvent.id);
      showFeedback("success", "Event created", `${payload.title} is now in the Events hub.`);
    }

    setModal(null);
  };

  const saveAssignments = () => {
    if (!modal || modal.type !== "assign") return;

    const event = events.find((item) => item.id === modal.eventId);
    if (!event) return;

    const additions = modal.pendingSelections
      .filter(
        (athleteId) =>
          !event.assignedAthletes.some((assignment) => assignment.athleteId === athleteId),
      )
      .map((athleteId) => ({
        athleteId,
        participationStatus: "Assigned",
        attendanceStatus: "Pending",
        resultStatus: "Not Started",
        placement: "Pending",
        scoreStatistics: "Pending",
        performanceNotes: "Awaiting event participation.",
        coachRemarks: "To be evaluated.",
        evaluatedBy: event.organizer,
        evaluationDate: event.startDate,
        metrics: [],
      }));

    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? { ...item, assignedAthletes: [...item.assignedAthletes, ...additions] }
          : item,
      ),
    );

    showFeedback(
      "success",
      "Assignments updated",
      `${additions.length} athlete${additions.length === 1 ? "" : "s"} added to ${event.title}.`,
    );
    setModal(null);
  };

  const removeAssignedAthlete = (eventId, athleteId) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              assignedAthletes: event.assignedAthletes.filter(
                (assignment) => assignment.athleteId !== athleteId,
              ),
            }
          : event,
      ),
    );
  };

  const updateEventField = (eventId, key, value) => {
    setEvents((current) =>
      current.map((event) => (event.id === eventId ? { ...event, [key]: value } : event)),
    );
  };

  const updateAssignmentField = (eventId, athleteId, key, value) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              assignedAthletes: event.assignedAthletes.map((assignment) =>
                assignment.athleteId === athleteId
                  ? { ...assignment, [key]: value }
                  : assignment,
              ),
            }
          : event,
      ),
    );
  };

  const addMetric = (eventId, athleteId) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              assignedAthletes: event.assignedAthletes.map((assignment) =>
                assignment.athleteId === athleteId
                  ? {
                      ...assignment,
                      metrics: [
                        ...assignment.metrics,
                        { name: "", value: "", unit: "", notes: "" },
                      ],
                    }
                  : assignment,
              ),
            }
          : event,
      ),
    );
  };

  const updateMetric = (eventId, athleteId, metricIndex, key, value) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              assignedAthletes: event.assignedAthletes.map((assignment) =>
                assignment.athleteId === athleteId
                  ? {
                      ...assignment,
                      metrics: assignment.metrics.map((metric, index) =>
                        index === metricIndex ? { ...metric, [key]: value } : metric,
                      ),
                    }
                  : assignment,
              ),
            }
          : event,
      ),
    );
  };

  const removeMetric = (eventId, athleteId, metricIndex) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              assignedAthletes: event.assignedAthletes.map((assignment) =>
                assignment.athleteId === athleteId
                  ? {
                      ...assignment,
                      metrics: assignment.metrics.filter((_, index) => index !== metricIndex),
                    }
                  : assignment,
              ),
            }
          : event,
      ),
    );
  };

  const publishResults = (eventId) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;

    setEvents((current) =>
      current.map((item) =>
        item.id === eventId
          ? {
              ...item,
              visibility: "Public",
              resultVisibility: "Public",
              resultStatus: "Published",
              publishedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    showFeedback("success", "Results published", `${event.title} is now ready for the public-facing results view.`);
  };

  const unpublishResults = (eventId) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;

    setEvents((current) =>
      current.map((item) =>
        item.id === eventId
          ? {
              ...item,
              resultVisibility: "Internal Only",
              resultStatus: "Results Recorded",
              publishedAt: "",
            }
          : item,
      ),
    );
    showFeedback("warning", "Results unpublished", `${event.title} results are internal again.`);
  };

  const runDestructiveAction = () => {
    if (!modal || modal.type !== "confirm") return;
    const event = events.find((item) => item.id === modal.eventId);
    if (!event) return;

    if (modal.action === "cancel") {
      setEvents((current) =>
        current.map((item) =>
          item.id === modal.eventId ? { ...item, status: "Cancelled" } : item,
        ),
      );
      showFeedback("warning", "Event cancelled", `${event.title} remains available for reference.`);
    }

    setModal(null);
  };

  const handleCalendarSelectEvent = ({ resource }) => {
    setSelectedEventId(resource.id);
    setSelectedDate(parseISO(resource.startDate));
    setModal({ type: "details", eventId: resource.id });
  };

  const handleCalendarSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
  };

  const handleCalendarToday = () => {
    const today = parseISO("2026-05-14");
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleEventSelect = (event) => {
    setSelectedEventId(event.id);
    setSelectedDate(parseISO(event.startDate));
    setCurrentDate(parseISO(event.startDate));
  };

  const handleSaveResults = (eventId) => {
    updateEventField(eventId, "resultStatus", "Results Recorded");
    showFeedback("success", "Results saved", "Results are updated in local frontend state.");
    setModal(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {feedback && (
        <FeedbackPanel tone={feedback.tone} title={feedback.title}>
          {feedback.message}
        </FeedbackPanel>
      )}

      <EventsHeader onCreate={openCreateModal} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <EventsFilters
          filters={filters}
          onChange={setFilter}
          onReset={() => setFilters(defaultFilters)}
        />
        <EventsViewTabs activeView={activeView} onChange={setActiveView} />
      </div>

      {activeView === "calendar" && (
        <CalendarPanel
          calendarEvents={calendarEvents}
          currentDate={currentDate}
          selectedDayEvents={selectedDayEvents}
          selectedEvent={selectedEvent}
          onNavigate={setCurrentDate}
          onPrev={() => setCurrentDate((date) => subMonths(date, 1))}
          onNext={() => setCurrentDate((date) => addMonths(date, 1))}
          onToday={handleCalendarToday}
          onSelectEvent={handleCalendarSelectEvent}
          onSelectSlot={handleCalendarSelectSlot}
          onEventSelect={handleEventSelect}
          onOpenDetails={(event) => setModal({ type: "details", eventId: event.id })}
          onOpenEdit={openEditModal}
          onOpenAssign={(event) =>
            setModal({
              type: "assign",
              eventId: event.id,
              filters: { search: "", sport: "All sports", team: "All teams", yearLevel: "All years" },
              pendingSelections: [],
            })
          }
          onOpenResults={(event) => setModal({ type: "results", eventId: event.id })}
          canManageEvents={canManageEvents}
        />
      )}

      {activeView === "list" && (
        <EventListPanel
          events={sortedEvents}
          canManageEvents={canManageEvents}
          onOpenDetails={(event) => setModal({ type: "details", eventId: event.id })}
          onOpenEdit={openEditModal}
          onOpenAssign={(event) =>
            setModal({
              type: "assign",
              eventId: event.id,
              filters: { search: "", sport: "All sports", team: "All teams", yearLevel: "All years" },
              pendingSelections: [],
            })
          }
          onOpenResults={(event) => setModal({ type: "results", eventId: event.id })}
          onPublish={publishResults}
          onCancel={(event) => setModal({ type: "confirm", action: "cancel", eventId: event.id })}
        />
      )}

      {activeView === "results" && (
        <ResultsPanel
          events={sortedEvents}
          canManageEvents={canManageEvents}
          onOpenDetails={(event) => setModal({ type: "details", eventId: event.id })}
          onOpenResults={(event) => setModal({ type: "results", eventId: event.id })}
          onPublish={publishResults}
          onUnpublish={unpublishResults}
        />
      )}

      <EventsModal
        modal={modal}
        event={activeModalEvent}
        onClose={() => setModal(null)}
        onFormChange={(key, value) =>
          setModal((current) => ({
            ...current,
            values: { ...current.values, [key]: value },
            errors: { ...current.errors, [key]: undefined },
          }))
        }
        onSaveEvent={saveEvent}
        onAssignmentFilterChange={(key, value) =>
          setModal((current) => ({
            ...current,
            filters: { ...current.filters, [key]: value },
          }))
        }
        onToggleSelection={(athleteId) =>
          setModal((current) => ({
            ...current,
            pendingSelections: current.pendingSelections.includes(athleteId)
              ? current.pendingSelections.filter((id) => id !== athleteId)
              : [...current.pendingSelections, athleteId],
          }))
        }
        onSaveAssignments={saveAssignments}
        onRemoveAssignedAthlete={removeAssignedAthlete}
        onUpdateEventField={updateEventField}
        onUpdateAssignmentField={updateAssignmentField}
        onAddMetric={addMetric}
        onUpdateMetric={updateMetric}
        onRemoveMetric={removeMetric}
        onSaveResults={handleSaveResults}
        onPublish={publishResults}
        onUnpublish={unpublishResults}
        onOpenEdit={openEditModal}
        onOpenAssign={(event) =>
          setModal({
            type: "assign",
            eventId: event.id,
            filters: { search: "", sport: "All sports", team: "All teams", yearLevel: "All years" },
            pendingSelections: [],
          })
        }
        onOpenResults={(event) => setModal({ type: "results", eventId: event.id })}
        onConfirmAction={runDestructiveAction}
        canManageEvents={canManageEvents}
      />
    </div>
  );
}

function EventsHeader({ onCreate }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Events
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Manage athletics schedules, participants, and results.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-medium tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          CREATE EVENT
        </button>
      </div>
    </div>
  );
}

function EventsFilters({ filters, onChange, onReset }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value !== defaultFilters[key],
  );

  return (
    <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="block">
        <span className="sr-only">Search events</span>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors" />
          <input
            type="text"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Search events..."
            className="w-full rounded-full border border-border-subtle/50 bg-surface-card py-2 pl-10 pr-4 text-[12px] text-slate-700 shadow-soft outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 sm:w-80 lg:w-[420px] xl:w-[520px]"
          />
        </div>
      </label>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => setShowAdvanced((current) => !current)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium tracking-wide shadow-soft transition-colors ${
            showAdvanced
              ? "border-brand-blue/20 bg-brand-blue-light text-brand-blue"
              : "border-border-subtle/50 bg-surface-card text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          FILTER
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2 text-[12px] font-medium tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            RESET
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="absolute left-0 top-full z-20 mt-3 grid w-full gap-4 rounded-[20px] border border-border-subtle/60 bg-surface-card p-4 shadow-float md:grid-cols-2 xl:w-[760px] xl:grid-cols-5">
          <ToolbarField label="Status">
            <FilterSelect value={filters.status} onChange={(value) => onChange("status", value)}>
              <option>All statuses</option>
              {eventStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </FilterSelect>
          </ToolbarField>

          <ToolbarField label="Sport">
            <FilterSelect
              value={filters.sportCategory}
              onChange={(value) => onChange("sportCategory", value)}
            >
              <option>All sports</option>
              {sportCategories.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </FilterSelect>
          </ToolbarField>

          <ToolbarField label="Event type">
            <FilterSelect value={filters.type} onChange={(value) => onChange("type", value)}>
              <option>All event types</option>
              {eventTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </FilterSelect>
          </ToolbarField>

          <ToolbarField label="Visibility">
            <FilterSelect
              value={filters.visibility}
              onChange={(value) => onChange("visibility", value)}
            >
              <option>All visibility</option>
              {visibilityStatuses.map((visibility) => (
                <option key={visibility}>{visibility}</option>
              ))}
            </FilterSelect>
          </ToolbarField>

          <ToolbarField label="Result status">
            <FilterSelect
              value={filters.resultStatus}
              onChange={(value) => onChange("resultStatus", value)}
            >
              <option>All result statuses</option>
              {resultStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </FilterSelect>
          </ToolbarField>

          <ToolbarField label="Start date">
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => onChange("startDate", event.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
            />
          </ToolbarField>

          <ToolbarField label="End date">
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => onChange("endDate", event.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
            />
          </ToolbarField>
        </div>
      )}
    </div>
  );
}

function EventsViewTabs({ activeView, onChange }) {
  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-full border border-border-subtle/70 bg-surface-card p-1 shadow-soft sm:w-auto">
      {viewTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeView === tab.id;

        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold tracking-wide transition-all ${
              active
                ? "bg-brand-blue text-white shadow-soft"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function CalendarPanel({
  calendarEvents,
  currentDate,
  selectedDayEvents,
  selectedEvent,
  onNavigate,
  onPrev,
  onNext,
  onToday,
  onSelectEvent,
  onSelectSlot,
  onEventSelect,
  onOpenDetails,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
  canManageEvents,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-5 xl:col-span-2">
        <SectionHeader
          eyebrow="Schedule"
          title={format(currentDate, "MMMM yyyy")}
          description="A schedule-first view. Click an event to open the full details."
          action={
            <div className="flex items-center overflow-hidden rounded-lg border border-border-subtle bg-surface-card shadow-sm">
              <button
                type="button"
                onClick={onPrev}
                className="px-3 py-2 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onToday}
                className="border-x border-border-subtle px-4 py-2 text-[13px] font-bold text-slate-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={onNext}
                className="px-3 py-2 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          }
        />

        <div className="relative overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={onNavigate}
            view="month"
            views={["month"]}
            toolbar={false}
            popup
            selectable
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            className="adnu-calendar adnu-events-calendar"
            style={{ minHeight: 700 }}
            eventPropGetter={(calendarEvent) => ({
              className: getCalendarEventClassName(calendarEvent.resource),
            })}
            components={{ event: CalendarEventLabel }}
            formats={{
              weekdayFormat: (date, culture, calendarLocalizer) =>
                calendarLocalizer.format(date, "EEE", culture).toUpperCase(),
              dayFormat: (date, culture, calendarLocalizer) =>
                calendarLocalizer.format(date, "d", culture),
            }}
          />

          <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-wrap items-center gap-2 rounded-full border border-border-subtle bg-surface-card/90 px-4 py-2 shadow-float backdrop-blur-md md:flex">
            <LegendPill tone="ongoing" label="Ongoing" />
            <LegendPill tone="scheduled" label="Scheduled" />
            <LegendPill tone="completed" label="Completed" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SelectedEventCard
          event={selectedEvent}
          canManageEvents={canManageEvents}
          onOpenDetails={onOpenDetails}
          onOpenEdit={onOpenEdit}
          onOpenAssign={onOpenAssign}
          onOpenResults={onOpenResults}
        />

        <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border-subtle/50 p-6">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">Day Agenda</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                Events occurring on the selected date.
              </p>
            </div>
            <span className="rounded-md bg-brand-blue-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
              {selectedDayEvents.length} items
            </span>
          </div>

          <div className="space-y-4 p-6">
            {selectedDayEvents.length === 0 ? (
              <EmptyState title="No events scheduled" body="Select another date or clear filters." />
            ) : (
              selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventSelect(event)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedEvent?.id === event.id
                      ? "border-brand-blue/20 bg-brand-blue-light/40"
                      : "border-border-subtle/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-slate-500">
                        {formatEventTime(event.startTime, event.endTime)} | {event.venue}
                      </p>
                    </div>
                    <StatusBadge value={event.status} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarEventLabel({ event }) {
  const item = event.resource;

  return (
    <div className="space-y-0.5">
      <div className="truncate">{item.title}</div>
      <div className="truncate text-[9px] font-semibold opacity-80">
        {formatEventTime(item.startTime, item.endTime)}
      </div>
    </div>
  );
}

function EventListPanel({
  events,
  canManageEvents,
  onOpenDetails,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
  onPublish,
  onCancel,
}) {
  return (
    <section className="rounded-[24px] border border-border-subtle/50 bg-surface-card shadow-soft">
      <div className="divide-y divide-border-subtle/60">
        {events.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No events match the filters" body="Adjust search or filters to broaden the list." />
          </div>
        ) : (
          events.map((event) => (
            <article key={event.id} className="px-5 py-4 transition-colors hover:bg-slate-50/60">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_180px_150px] lg:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge value={event.status} />
                    {event.resultStatus !== "Not Started" && (
                      <ResultStatusBadge value={event.resultStatus} />
                    )}
                  </div>
                  <h3 className="truncate text-[16px] font-bold text-slate-950">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-[13px] text-slate-500">
                    {event.sportCategory} | {event.type}
                  </p>
                </div>

                <div className="text-[13px] text-slate-600">
                  <p className="font-semibold text-slate-900">
                    {formatEventDate(event.startDate, event.endDate)}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {formatEventTime(event.startTime, event.endTime)}
                  </p>
                </div>

                <div className="min-w-0 text-[13px] text-slate-500">
                  <p className="truncate">{event.venue}</p>
                  <p className="mt-1 text-[12px]">
                    {event.assignedAthletes.length}/{event.maxParticipants} athletes
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(event)}
                    className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
                  >
                    View
                  </button>
                  {canManageEvents ? (
                    <EventActionsMenu
                      event={event}
                      onOpenEdit={onOpenEdit}
                      onOpenAssign={onOpenAssign}
                      onOpenResults={onOpenResults}
                      onPublish={onPublish}
                      onCancel={onCancel}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EventActionsMenu({
  event,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
  onPublish,
  onCancel,
}) {
  return (
    <details className="group relative">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-border-subtle bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-border-subtle/70 bg-white p-1.5 shadow-float">
        <MenuAction label="Edit" onClick={() => onOpenEdit(event)} />
        <MenuAction label="Assign Athletes" onClick={() => onOpenAssign(event)} />
        <MenuAction label="Record Results" onClick={() => onOpenResults(event)} />
        {event.resultStatus !== "Published" && (
          <MenuAction label="Publish Results" onClick={() => onPublish(event.id)} />
        )}
        {event.status !== "Cancelled" && (
          <MenuAction tone="danger" label="Cancel Event" onClick={() => onCancel(event)} />
        )}
      </div>
    </details>
  );
}

function MenuAction({ label, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
        tone === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
}

function ResultsPanel({
  events,
  canManageEvents,
  onOpenDetails,
  onOpenResults,
  onPublish,
  onUnpublish,
}) {
  const resultEvents = events.filter(
    (event) => event.status === "Completed" || event.resultStatus !== "Not Started",
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Results"
        title="Event Results"
        description="Summarized outcomes only. Open a record to view or edit athlete-specific results."
      />

      {resultEvents.length === 0 ? (
        <div className="rounded-[24px] border border-border-subtle/50 bg-surface-card p-6 shadow-soft">
          <EmptyState title="No result records yet" body="Completed events and recorded results will appear here." />
        </div>
      ) : (
        resultEvents.map((event) => {
          const profiles = getAssignedProfiles(event);

          return (
            <article
              key={event.id}
              className="rounded-[24px] border border-border-subtle/50 bg-surface-card p-5 shadow-soft"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <ResultStatusBadge value={event.resultStatus} />
                    {event.resultVisibility === "Public" && <VisibilityBadge value="Public" />}
                  </div>
                  <h3 className="truncate text-[17px] font-bold tracking-tight text-slate-950">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-[13px] text-slate-500">
                    {event.sportCategory} | {formatEventDate(event.startDate, event.endDate)}
                  </p>
                </div>

                <div className="text-[13px] text-slate-600">
                  <p className="line-clamp-2">
                    {event.overallResult || event.teamResult || "Results are pending."}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {profiles.length} athlete result{profiles.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(event)}
                    className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
                  >
                    View Results
                  </button>
                  {canManageEvents && (
                    <details className="relative">
                      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-border-subtle bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 [&::-webkit-details-marker]:hidden">
                        <MoreHorizontal className="h-4 w-4" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-border-subtle/70 bg-white p-1.5 shadow-float">
                        <MenuAction label="Record Results" onClick={() => onOpenResults(event)} />
                        {event.resultStatus === "Published" ? (
                          <MenuAction label="Unpublish" onClick={() => onUnpublish(event.id)} />
                        ) : (
                          <MenuAction label="Publish Results" onClick={() => onPublish(event.id)} />
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

function SelectedEventCard({
  event,
  canManageEvents,
  onOpenDetails,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
}) {
  return (
    <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900">Selected Event</h2>
          <p className="mt-1 text-[12px] text-slate-500">Schedule, roster, and result snapshot</p>
        </div>
        {event && <StatusBadge value={event.status} />}
      </div>

      {!event ? (
        <EmptyState title="No event selected" body="Select an event from the calendar." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border-subtle/50 p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <VisibilityBadge value={event.visibility} />
              <ResultStatusBadge value={event.resultStatus} />
            </div>
            <h3 className="mt-3 text-[15px] font-bold text-slate-900">{event.title}</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              {event.sportCategory} | {event.type}
            </p>
            <div className="mt-4 space-y-3 text-[13px] text-slate-600">
              <div>{formatEventDate(event.startDate, event.endDate)}</div>
              <div>{formatEventTime(event.startTime, event.endTime)}</div>
              <div>{event.venue}</div>
              <div>
                {event.assignedAthletes.length}/{event.maxParticipants} athletes assigned
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton label="Details" onClick={() => onOpenDetails(event)} />
            {canManageEvents ? (
              <SelectedEventActionsMenu
                event={event}
                onOpenEdit={onOpenEdit}
                onOpenAssign={onOpenAssign}
                onOpenResults={onOpenResults}
              />
            ) : (
              event.resultStatus === "Published" && (
                <ActionButton label="View Results" onClick={() => onOpenDetails(event)} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedEventActionsMenu({ event, onOpenEdit, onOpenAssign, onOpenResults }) {
  return (
    <details className="relative inline-block text-left">
      <summary
        aria-label={`More actions for ${event.title}`}
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-border-subtle bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 [&::-webkit-details-marker]:hidden"
      >
        <MoreHorizontal className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-border-subtle/70 bg-white p-1.5 shadow-float">
        <MenuAction label="Edit" onClick={() => onOpenEdit(event)} />
        <MenuAction label="Assign Athletes" onClick={() => onOpenAssign(event)} />
        <MenuAction label="Record Results" onClick={() => onOpenResults(event)} />
      </div>
    </details>
  );
}

function EventsModal({
  modal,
  event,
  onClose,
  onFormChange,
  onSaveEvent,
  onAssignmentFilterChange,
  onToggleSelection,
  onSaveAssignments,
  onRemoveAssignedAthlete,
  onUpdateEventField,
  onUpdateAssignmentField,
  onAddMetric,
  onUpdateMetric,
  onRemoveMetric,
  onSaveResults,
  onPublish,
  onUnpublish,
  onOpenEdit,
  onOpenAssign,
  onOpenResults,
  onConfirmAction,
  canManageEvents,
}) {
  if (!modal) return null;

  if (modal.type === "event-form") {
    const isEdit = modal.mode === "edit";
    const editingSensitiveEvent =
      isEdit && event && (event.status === "Completed" || event.resultStatus === "Published");

    return (
      <Modal
        open
        onClose={onClose}
        title={isEdit ? "Edit Event" : "Create Event"}
        description="Frontend-ready event form. Backend create/update calls can replace the local save handler later."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveEvent}>{isEdit ? "Save Changes" : "Create Event"}</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-5">
          {editingSensitiveEvent && (
            <FeedbackPanel tone="warning" title="Editing sensitive event">
              This event is completed or has published results. In a backend flow, this should
              trigger audit logging or confirmation before saving.
            </FeedbackPanel>
          )}

          <FormSection
            eyebrow="Basic Details"
            title="Event identity"
            description="Name the event and define the sport/category staff will use for filtering."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event title" error={modal.errors.title}>
                <TextInput
                  value={modal.values.title}
                  onChange={(changeEvent) => onFormChange("title", changeEvent.target.value)}
                  placeholder="Regional Athletics Qualifier"
                />
              </Field>
              <Field label="Event type" error={modal.errors.type}>
                <SelectInput
                  value={modal.values.type}
                  onChange={(changeEvent) => onFormChange("type", changeEvent.target.value)}
                >
                  {eventTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Sport/category" error={modal.errors.sportCategory}>
                <SelectInput
                  value={modal.values.sportCategory}
                  onChange={(changeEvent) =>
                    onFormChange("sportCategory", changeEvent.target.value)
                  }
                >
                  {sportCategories.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Organizer/coordinator" error={modal.errors.organizer}>
                <TextInput
                  value={modal.values.organizer}
                  onChange={(changeEvent) => onFormChange("organizer", changeEvent.target.value)}
                  placeholder="Coach or office owner"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            eyebrow="Schedule"
            title="Date, time, and venue"
            description="Keep logistics clear for calendar, list, and public preview views."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Venue/location" error={modal.errors.venue}>
                <TextInput
                  value={modal.values.venue}
                  onChange={(changeEvent) => onFormChange("venue", changeEvent.target.value)}
                  placeholder="Main Gym Performance Lab"
                />
              </Field>
              <Field label="Maximum participants" error={modal.errors.maxParticipants}>
                <TextInput
                  type="number"
                  min="1"
                  value={modal.values.maxParticipants}
                  onChange={(changeEvent) =>
                    onFormChange("maxParticipants", changeEvent.target.value)
                  }
                  placeholder="24"
                />
              </Field>
              <Field label="Start date" error={modal.errors.startDate}>
                <TextInput
                  type="date"
                  value={modal.values.startDate}
                  onChange={(changeEvent) => onFormChange("startDate", changeEvent.target.value)}
                />
              </Field>
              <Field label="End date" error={modal.errors.endDate}>
                <TextInput
                  type="date"
                  value={modal.values.endDate}
                  onChange={(changeEvent) => onFormChange("endDate", changeEvent.target.value)}
                />
              </Field>
              <Field label="Start time" error={modal.errors.startTime}>
                <TextInput
                  type="time"
                  value={modal.values.startTime}
                  onChange={(changeEvent) => onFormChange("startTime", changeEvent.target.value)}
                />
              </Field>
              <Field label="End time" error={modal.errors.endTime}>
                <TextInput
                  type="time"
                  value={modal.values.endTime}
                  onChange={(changeEvent) => onFormChange("endTime", changeEvent.target.value)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            eyebrow="Control"
            title="Status, visibility, and notes"
            description="Set the current event state. Optional notes are tucked away to keep the form focused."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" error={modal.errors.status}>
                <SelectInput
                  value={modal.values.status}
                  onChange={(changeEvent) => onFormChange("status", changeEvent.target.value)}
                >
                  {eventStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Visibility" error={modal.errors.visibility}>
                <SelectInput
                  value={modal.values.visibility}
                  onChange={(changeEvent) => onFormChange("visibility", changeEvent.target.value)}
                >
                  {visibilityStatuses.map((visibility) => (
                    <option key={visibility}>{visibility}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <details className="mt-4 rounded-2xl border border-border-subtle/60 bg-white p-4">
              <summary className="cursor-pointer list-none text-[13px] font-bold text-slate-700 [&::-webkit-details-marker]:hidden">
                Additional Details
              </summary>
              <div className="mt-4 grid gap-4">
                <Field label="Description">
                  <TextArea
                    value={modal.values.description}
                    onChange={(changeEvent) => onFormChange("description", changeEvent.target.value)}
                    placeholder="Internal event description for staff, coaches, and approved users."
                  />
                </Field>
                <Field label="Public description">
                  <TextArea
                    value={modal.values.publicDescription}
                    onChange={(changeEvent) =>
                      onFormChange("publicDescription", changeEvent.target.value)
                    }
                    placeholder="Safe summary for outside viewers."
                  />
                </Field>
              <Field label="Internal notes">
                <TextArea
                  value={modal.values.internalNotes}
                  onChange={(changeEvent) =>
                    onFormChange("internalNotes", changeEvent.target.value)
                  }
                  placeholder="Staff-only notes, logistics, risks, or reminders."
                />
              </Field>
              </div>
            </details>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (!event) return null;

  const assignedProfiles = getAssignedProfiles(event);

  if (modal.type === "details") {
    return (
      <Modal
        open
        onClose={onClose}
        title={event.title}
        description={`${event.sportCategory} | ${formatEventDate(event.startDate, event.endDate)} | ${event.venue}`}
        footer={<SecondaryButton onClick={onClose}>Close</SecondaryButton>}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={event.status} />
            <VisibilityBadge value={event.visibility} />
            <ResultStatusBadge value={event.resultStatus} />
          </div>

          <CollapsibleSection title="Overview" open>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Sport/category" value={event.sportCategory} />
              <InfoTile label="Event type" value={event.type} />
              <InfoTile label="Date" value={formatEventDate(event.startDate, event.endDate)} />
              <InfoTile label="Time" value={formatEventTime(event.startTime, event.endTime)} />
              <InfoTile label="Venue" value={event.venue} />
              <InfoTile label="Organizer" value={event.organizer} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <DetailPanel title="Description" body={event.description} />
              <DetailPanel title="Public description" body={event.publicDescription} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title={`Athletes (${assignedProfiles.length}/${event.maxParticipants})`}
          >
            <div className="space-y-3">
              {assignedProfiles.length === 0 ? (
                <EmptyState title="No assigned athletes" body="Staff can assign athletes from the event actions." />
              ) : (
                assignedProfiles.map((profile) => (
                  <div
                    key={profile.athleteId}
                    className="rounded-2xl border border-border-subtle/60 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">
                          {profile.athlete?.name ?? "Unknown athlete"}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {profile.athlete?.team} | {profile.athlete?.yearLevel}
                        </p>
                      </div>
                      <ParticipationBadge value={profile.participationStatus} />
                    </div>
                    <div className="mt-3 grid gap-3 text-[13px] sm:grid-cols-3">
                      <InfoTile label="Result" value={profile.placement} />
                      <InfoTile label="Score/statistics" value={profile.scoreStatistics} />
                      <InfoTile label="Attendance" value={profile.attendanceStatus} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Results">
            <div className="grid gap-4 lg:grid-cols-3">
              <DetailPanel title="Overall result" body={event.overallResult || "No results recorded yet."} />
              <DetailPanel title="Winner / final standing" body={event.winner || "Pending"} />
              <DetailPanel title="Team result" body={event.teamResult || "Pending"} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Settings and notes">
            <div className="grid gap-4 lg:grid-cols-2">
              <InfoTile label="Visibility" value={event.visibility} />
              <InfoTile label="Result visibility" value={event.resultVisibility} />
              <DetailPanel title="Internal notes" body={event.internalNotes || "No internal notes."} muted />
            </div>
          </CollapsibleSection>

          {canManageEvents && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard icon={PencilLine} title="Edit Event" description="Update schedule, venue, visibility, and notes." onClick={() => onOpenEdit(event)} />
              <ActionCard icon={UserPlus} title="Assign Athletes" description="Search, add, remove, and update roster participation." onClick={() => onOpenAssign(event)} />
              <ActionCard icon={Trophy} title="Record Results" description="Capture overall and athlete-specific results." onClick={() => onOpenResults(event)} />
              <ActionCard
                icon={Megaphone}
                title={event.resultStatus === "Published" ? "Unpublish Results" : "Publish Results"}
                description="Control whether results are public-facing."
                onClick={() =>
                  event.resultStatus === "Published" ? onUnpublish(event.id) : onPublish(event.id)
                }
              />
            </div>
          )}
        </div>
      </Modal>
    );
  }

  if (modal.type === "assign") {
    const teams = [...new Set(athletePool.map((athlete) => athlete.team))];
    const years = [...new Set(athletePool.map((athlete) => athlete.yearLevel))];
    const filteredAthletes = athletePool.filter((athlete) => {
      const query = modal.filters.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [athlete.name, athlete.studentId, athlete.sport, athlete.team, athlete.role]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesSport =
        modal.filters.sport === "All sports" || athlete.sport === modal.filters.sport;
      const matchesTeam =
        modal.filters.team === "All teams" || athlete.team === modal.filters.team;
      const matchesYear =
        modal.filters.yearLevel === "All years" || athlete.yearLevel === modal.filters.yearLevel;

      return matchesSearch && matchesSport && matchesTeam && matchesYear;
    });

    return (
      <Modal
        open
        onClose={onClose}
        title={`Assign Athletes | ${event.title}`}
        description="Search athletes, select multiple participants, and maintain the assigned roster."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveAssignments}>
              Add Selected ({modal.pendingSelections.length})
            </PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Search athletes">
                <TextInput
                  value={modal.filters.search}
                  onChange={(changeEvent) =>
                    onAssignmentFilterChange("search", changeEvent.target.value)
                  }
                  placeholder="Name, ID, sport, role"
                />
              </Field>
              <Field label="Sport/team">
                <SelectInput
                  value={modal.filters.sport}
                  onChange={(changeEvent) =>
                    onAssignmentFilterChange("sport", changeEvent.target.value)
                  }
                >
                  <option>All sports</option>
                  {sportCategories.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Team">
                <SelectInput
                  value={modal.filters.team}
                  onChange={(changeEvent) =>
                    onAssignmentFilterChange("team", changeEvent.target.value)
                  }
                >
                  <option>All teams</option>
                  {teams.map((team) => (
                    <option key={team}>{team}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Year level">
                <SelectInput
                  value={modal.filters.yearLevel}
                  onChange={(changeEvent) =>
                    onAssignmentFilterChange("yearLevel", changeEvent.target.value)
                  }
                >
                  <option>All years</option>
                  {years.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <div className="rounded-[22px] border border-border-subtle/60 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-slate-950">Athlete Pool</h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {filteredAthletes.length} results
                </span>
              </div>
              <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
                {filteredAthletes.map((athlete) => {
                  const selected = modal.pendingSelections.includes(athlete.id);
                  const alreadyAssigned = event.assignedAthletes.some(
                    (assignment) => assignment.athleteId === athlete.id,
                  );

                  return (
                    <button
                      key={athlete.id}
                      type="button"
                      disabled={alreadyAssigned}
                      onClick={() => onToggleSelection(athlete.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? "border-brand-blue/25 bg-brand-blue-light"
                          : "border-border-subtle/60 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-950">{athlete.name}</p>
                          <p className="mt-1 text-[12px] text-slate-500">
                            {athlete.studentId} | {athlete.sport} | {athlete.role}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-500">
                            {athlete.team} | {athlete.yearLevel}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {alreadyAssigned ? "Assigned" : selected ? "Selected" : "Add"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-border-subtle/60 bg-slate-50/60 p-4">
            <h3 className="text-[14px] font-bold text-slate-950">Assigned Athletes</h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Update participation status or remove athletes from this event.
            </p>
            <div className="mt-4 space-y-3">
              {assignedProfiles.length === 0 ? (
                <EmptyState title="No assigned athletes" body="Select athletes from the pool." />
              ) : (
                assignedProfiles.map((profile) => (
                  <div
                    key={profile.athleteId}
                    className="rounded-2xl border border-border-subtle/60 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {profile.athlete?.name ?? "Unknown athlete"}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {profile.athlete?.studentId} | {profile.athlete?.team}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveAssignedAthlete(event.id, profile.athleteId)}
                        className="text-[11px] font-bold uppercase tracking-wider text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3">
                      <SelectInput
                        value={profile.participationStatus}
                        onChange={(changeEvent) =>
                          onUpdateAssignmentField(
                            event.id,
                            profile.athleteId,
                            "participationStatus",
                            changeEvent.target.value,
                          )
                        }
                      >
                        {participationStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </SelectInput>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "results") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Record Results | ${event.title}`}
        description="Record overall outcomes, athlete-specific results, and flexible sport metrics."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            {event.resultStatus === "Published" ? (
              <SecondaryButton onClick={() => onUnpublish(event.id)}>Unpublish</SecondaryButton>
            ) : (
              <SecondaryButton onClick={() => onPublish(event.id)}>Publish Results</SecondaryButton>
            )}
            <PrimaryButton onClick={() => onSaveResults(event.id)}>Save Results</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-5">
          <FormSection
            eyebrow="Overall"
            title="Event result summary"
            description="Use flexible fields so competitions, trainings, tryouts, and seminars can all be represented."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Result status">
                <SelectInput
                  value={event.resultStatus}
                  onChange={(changeEvent) =>
                    onUpdateEventField(event.id, "resultStatus", changeEvent.target.value)
                  }
                >
                  {resultStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Result visibility">
                <SelectInput
                  value={event.resultVisibility}
                  onChange={(changeEvent) =>
                    onUpdateEventField(event.id, "resultVisibility", changeEvent.target.value)
                  }
                >
                  {resultVisibilityOptions.map((visibility) => (
                    <option key={visibility}>{visibility}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Winner / final standing">
                <TextInput
                  value={event.winner}
                  onChange={(changeEvent) =>
                    onUpdateEventField(event.id, "winner", changeEvent.target.value)
                  }
                  placeholder="Winning team/player or final standing"
                />
              </Field>
              <Field label="Team result">
                <TextInput
                  value={event.teamResult}
                  onChange={(changeEvent) =>
                    onUpdateEventField(event.id, "teamResult", changeEvent.target.value)
                  }
                  placeholder="Team result, standing, or event outcome"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Overall result / summary">
                <TextArea
                  value={event.overallResult}
                  onChange={(changeEvent) =>
                    onUpdateEventField(event.id, "overallResult", changeEvent.target.value)
                  }
                  placeholder="Summarize the event outcome."
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            eyebrow="Athletes"
            title="Athlete-specific results"
            description="Record placement, score/statistics, participation, remarks, and flexible metrics."
          >
            <div className="space-y-5">
              {assignedProfiles.length === 0 ? (
                <FeedbackPanel tone="info" title="No athletes assigned">
                  Assign athletes before recording athlete-specific results.
                </FeedbackPanel>
              ) : (
                assignedProfiles.map((profile) => (
                  <section
                    key={profile.athleteId}
                    className="rounded-[22px] border border-border-subtle/60 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-bold text-slate-950">
                          {profile.athlete?.name ?? "Unknown athlete"}
                        </h4>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {profile.athlete?.studentId} | {profile.athlete?.sport} | {profile.athlete?.team}
                        </p>
                      </div>
                      <ParticipationBadge value={profile.participationStatus} />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Participation status">
                        <SelectInput
                          value={profile.participationStatus}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "participationStatus",
                              changeEvent.target.value,
                            )
                          }
                        >
                          {participationStatuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </SelectInput>
                      </Field>
                      <Field label="Result status">
                        <SelectInput
                          value={profile.resultStatus}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "resultStatus",
                              changeEvent.target.value,
                            )
                          }
                        >
                          {resultStatuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </SelectInput>
                      </Field>
                      <Field label="Attendance">
                        <TextInput
                          value={profile.attendanceStatus}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "attendanceStatus",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Placement / rank">
                        <TextInput
                          value={profile.placement}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "placement",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Score/time/statistics">
                        <TextInput
                          value={profile.scoreStatistics}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "scoreStatistics",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Evaluated by">
                        <TextInput
                          value={profile.evaluatedBy}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "evaluatedBy",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Performance notes">
                        <TextArea
                          value={profile.performanceNotes}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "performanceNotes",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Coach/staff remarks">
                        <TextArea
                          value={profile.coachRemarks}
                          onChange={(changeEvent) =>
                            onUpdateAssignmentField(
                              event.id,
                              profile.athleteId,
                              "coachRemarks",
                              changeEvent.target.value,
                            )
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-5 rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Flexible metrics
                          </p>
                          <p className="mt-1 text-[13px] text-slate-500">
                            Use metric name, value, unit, and notes for any sport.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddMetric(event.id, profile.athleteId)}
                          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Metric
                        </button>
                      </div>
                      <div className="space-y-3">
                        {profile.metrics.length === 0 ? (
                          <p className="text-[13px] text-slate-500">
                            No metrics recorded yet.
                          </p>
                        ) : (
                          profile.metrics.map((metric, index) => (
                            <div
                              key={`${profile.athleteId}-${index}`}
                              className="grid gap-3 rounded-xl border border-border-subtle/60 bg-white p-3 lg:grid-cols-[1fr_0.7fr_0.6fr_1fr_auto]"
                            >
                              <TextInput
                                value={metric.name}
                                onChange={(changeEvent) =>
                                  onUpdateMetric(
                                    event.id,
                                    profile.athleteId,
                                    index,
                                    "name",
                                    changeEvent.target.value,
                                  )
                                }
                                placeholder="Metric"
                              />
                              <TextInput
                                value={metric.value}
                                onChange={(changeEvent) =>
                                  onUpdateMetric(
                                    event.id,
                                    profile.athleteId,
                                    index,
                                    "value",
                                    changeEvent.target.value,
                                  )
                                }
                                placeholder="Value"
                              />
                              <TextInput
                                value={metric.unit}
                                onChange={(changeEvent) =>
                                  onUpdateMetric(
                                    event.id,
                                    profile.athleteId,
                                    index,
                                    "unit",
                                    changeEvent.target.value,
                                  )
                                }
                                placeholder="Unit"
                              />
                              <TextInput
                                value={metric.notes}
                                onChange={(changeEvent) =>
                                  onUpdateMetric(
                                    event.id,
                                    profile.athleteId,
                                    index,
                                    "notes",
                                    changeEvent.target.value,
                                  )
                                }
                                placeholder="Notes"
                              />
                              <button
                                type="button"
                                onClick={() => onRemoveMetric(event.id, profile.athleteId, index)}
                                className="rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                ))
              )}
            </div>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (modal.type === "confirm") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Cancel Event"
        description={`${event.title} will remain visible for reference but stop being treated as active.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Keep event</SecondaryButton>
            <PrimaryButton tone="gold" onClick={onConfirmAction}>Confirm cancellation</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          This updates local frontend state only. A backend implementation should persist this
          action and record who cancelled the event.
        </FeedbackPanel>
      </Modal>
    );
  }

  return null;
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function ToolbarField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full appearance-none rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
    >
      {children}
    </select>
  );
}

function FormSection({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[24px] border border-border-subtle/60 bg-slate-50/65 p-5">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-base font-bold tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function CollapsibleSection({ title, children, open = false }) {
  return (
    <details
      open={open}
      className="group rounded-[22px] border border-border-subtle/60 bg-slate-50/65 p-4"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-bold text-slate-950 [&::-webkit-details-marker]:hidden">
        {title}
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function DetailPanel({ title, body, muted = false }) {
  return (
    <div className={`rounded-2xl border border-border-subtle/60 p-4 ${muted ? "bg-slate-50/80" : "bg-white"}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/80 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
        {value || "Pending"}
      </p>
    </div>
  );
}

function ActionButton({ label, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
        tone === "danger"
          ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-border-subtle bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }) {
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
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </button>
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
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {value}
    </span>
  );
}

function LegendPill({ tone, label }) {
  const toneClasses = {
    ongoing: "bg-brand-gold-light text-brand-gold-hover",
    scheduled: "bg-brand-blue-light text-brand-blue",
    draft: "bg-slate-100 text-slate-600",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
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

function getAssignedProfiles(event) {
  return event.assignedAthletes.map((assignment) => ({
    ...assignment,
    athlete: athletePool.find((athlete) => athlete.id === assignment.athleteId),
  }));
}

function getCalendarEventClassName(event) {
  const statusClass = event.status.toLowerCase();
  return `adnu-event adnu-events-calendar__event adnu-events-calendar__event--${statusClass}`;
}

function eventOccursOnDate(event, date) {
  const eventStart = parseISO(event.startDate);
  const eventEnd = parseISO(event.endDate);

  return (
    isSameDay(eventStart, date) ||
    isSameDay(eventEnd, date) ||
    (isBefore(eventStart, date) && isAfter(eventEnd, date))
  );
}

function formatEventDate(startDate, endDate) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isSameDay(start, end)) {
    return format(start, "MMM d, yyyy");
  }

  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

function formatEventTime(startTime, endTime) {
  return `${toTwelveHour(startTime)} - ${toTwelveHour(endTime)}`;
}

function toTwelveHour(value) {
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:${minuteString} ${suffix}`;
}

function validateEventForm(values) {
  const errors = {};
  const requiredFields = [
    "title",
    "type",
    "sportCategory",
    "venue",
    "startDate",
    "endDate",
    "startTime",
    "endTime",
    "maxParticipants",
    "organizer",
    "visibility",
    "status",
  ];

  requiredFields.forEach((field) => {
    if (!String(values[field] ?? "").trim()) {
      errors[field] = "This field is required.";
    }
  });

  if (values.maxParticipants && Number(values.maxParticipants) <= 0) {
    errors.maxParticipants = "Maximum participants must be greater than zero.";
  }

  if (values.maxParticipants && Number.isNaN(Number(values.maxParticipants))) {
    errors.maxParticipants = "Maximum participants must be numeric.";
  }

  if (values.startDate && values.endDate && values.startTime && values.endTime) {
    const start = new Date(`${values.startDate}T${values.startTime}`);
    const end = new Date(`${values.endDate}T${values.endTime}`);

    if (start > end) {
      errors.endDate = "End date and time cannot be earlier than the start.";
      errors.endTime = "End date and time cannot be earlier than the start.";
    }
  }

  return errors;
}
