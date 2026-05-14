import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
  Search,
  Trophy,
  UserPlus,
  XCircle,
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
  eventStatuses,
  eventTypes,
  mockEvents,
  sportCategories,
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

const defaultFilters = {
  search: "",
  status: "All statuses",
  type: "All event types",
  sportCategory: "All sports",
  startDate: "",
  endDate: "",
};

const emptyForm = {
  title: "",
  type: "Tournament",
  sportCategory: "Basketball",
  description: "",
  venue: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  maxParticipants: "",
  organizer: "",
  notes: "",
  status: "Draft",
};

const participationClasses = {
  Assigned: "bg-slate-100 text-slate-600",
  Confirmed: "bg-brand-blue-light text-brand-blue",
  Attended: "bg-green-50 text-green-700",
  Absent: "bg-red-50 text-red-700",
  Excused: "bg-amber-50 text-amber-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const attendanceOptions = ["Pending", "Present", "Absent", "Excused"];
const statusPriority = {
  Ongoing: 0,
  Upcoming: 1,
  Draft: 2,
  Completed: 3,
  Cancelled: 4,
};

export function EventsView() {
  const [events, setEvents] = useState(mockEvents);
  const [filters, setFilters] = useState(defaultFilters);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentDate, setCurrentDate] = useState(parseISO(mockEvents[0].startDate));
  const [selectedDate, setSelectedDate] = useState(parseISO(mockEvents[0].startDate));
  const [selectedEventId, setSelectedEventId] = useState(mockEvents[0]?.id ?? null);

  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filteredEvents = events.filter((event) => {
    const searchValue = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      [
        event.title,
        event.sportCategory,
        event.venue,
        event.type,
        event.organizer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      filters.status === "All statuses" || event.status === filters.status;
    const matchesType =
      filters.type === "All event types" || event.type === filters.type;
    const matchesSport =
      filters.sportCategory === "All sports" ||
      event.sportCategory === filters.sportCategory;

    const eventStart = parseISO(event.startDate);
    const eventEnd = parseISO(event.endDate);
    const filterStart = filters.startDate ? parseISO(filters.startDate) : null;
    const filterEnd = filters.endDate ? parseISO(filters.endDate) : null;

    const matchesStart =
      !filterStart ||
      isSameDay(eventStart, filterStart) ||
      isAfter(eventStart, filterStart);
    const matchesEnd =
      !filterEnd || isSameDay(eventEnd, filterEnd) || isBefore(eventEnd, filterEnd);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesSport &&
      matchesStart &&
      matchesEnd
    );
  });
  const sortedFilteredEvents = [...filteredEvents].sort((left, right) => {
    const leftPriority = statusPriority[left.status] ?? 99;
    const rightPriority = statusPriority[right.status] ?? 99;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftDate = new Date(`${left.startDate}T${left.startTime}`);
    const rightDate = new Date(`${right.startDate}T${right.startTime}`);
    return leftDate - rightDate;
  });

  const calendarEvents = useMemo(
    () =>
      sortedFilteredEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(`${event.startDate}T${event.startTime}`),
        end: new Date(`${event.endDate}T${event.endTime}`),
        resource: event,
      })),
    [sortedFilteredEvents],
  );
  const selectedDayEvents = sortedFilteredEvents.filter((event) =>
    eventOccursOnDate(event, selectedDate),
  );
  const selectedEvent =
    sortedFilteredEvents.find((event) => event.id === selectedEventId) ??
    selectedDayEvents[0] ??
    sortedFilteredEvents[0] ??
    null;

  const openCreateModal = () => {
    setModal({
      type: "form",
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
      type: "form",
      mode: "edit",
      eventId: event.id,
      values: {
        title: event.title,
        type: event.type,
        sportCategory: event.sportCategory,
        description: event.description,
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        maxParticipants: String(event.maxParticipants),
        organizer: event.organizer,
        notes: event.notes,
        status: event.status,
      },
      errors: {},
    });
  };

  const openDetailsModal = (event) => {
    setModal({
      type: "details",
      eventId: event.id,
    });
  };

  const openAssignModal = (event) => {
    setModal({
      type: "assign",
      eventId: event.id,
      filters: {
        search: "",
        sport: "All sports",
        team: "All teams",
        yearLevel: "All years",
      },
      pendingSelections: [],
    });
  };

  const openPerformanceModal = (event) => {
    setModal({
      type: "performance",
      eventId: event.id,
    });
  };

  const closeModal = () => setModal(null);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const saveEvent = () => {
    if (!modal || modal.type !== "form") return;

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
      setFeedback({
        tone: "success",
        title: "Event updated",
        message: `${payload.title} is now aligned with the latest schedule details.`,
      });
    } else {
      const nextEvent = {
        id: `EVT-${String(Date.now()).slice(-6)}`,
        ...payload,
        assignedAthletes: [],
      };
      setEvents((current) => [nextEvent, ...current]);
      setFeedback({
        tone: "success",
        title: "Event created",
        message: `${payload.title} has been added to the events board in frontend demo mode.`,
      });
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
        performanceRating: "Pending",
        result: "Pending",
        scoreStatistics: "Pending",
        coachRemarks: "Awaiting session.",
        strengthsObserved: "To be evaluated.",
        areasForImprovement: "To be evaluated.",
        injuryNotes: "None recorded.",
        evaluatedBy: event.organizer,
        evaluationDate: event.startDate,
        metrics: [],
      }));

    setEvents((current) =>
      current.map((item) =>
        item.id === modal.eventId
          ? {
              ...item,
              assignedAthletes: [...item.assignedAthletes, ...additions],
            }
          : item,
      ),
    );

    setFeedback({
      tone: "success",
      title: "Assignments updated",
      message: `${additions.length} athlete${additions.length === 1 ? "" : "s"} added to ${event.title}.`,
    });
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

  const updatePerformance = (eventId, athleteId, key, value) => {
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
                        {
                          name: "",
                          value: "",
                          unit: "",
                          notes: "",
                        },
                      ],
                    }
                  : assignment,
              ),
            }
          : event,
      ),
    );
  };

  const runDestructiveAction = () => {
    if (!modal || modal.type !== "confirm") return;
    const event = events.find((item) => item.id === modal.eventId);
    if (!event) return;

    if (modal.action === "delete") {
      setEvents((current) => current.filter((item) => item.id !== modal.eventId));
      setFeedback({
        tone: "warning",
        title: "Event removed from demo list",
        message: `${event.title} has been deleted locally.`,
      });
    }

    if (modal.action === "cancel") {
      setEvents((current) =>
        current.map((item) =>
          item.id === modal.eventId ? { ...item, status: "Cancelled" } : item,
        ),
      );
      setFeedback({
        tone: "warning",
        title: "Event status changed",
        message: `${event.title} is now marked as cancelled in the frontend preview.`,
      });
    }

    setModal(null);
  };

  const activeModalEvent = modal?.eventId
    ? events.find((item) => item.id === modal.eventId)
    : null;
  const handleCalendarPrev = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleCalendarNext = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleCalendarToday = () => {
    const today = parseISO("2026-05-14");
    setCurrentDate(today);
    setSelectedDate(today);
  };
  const handleCalendarSelectEvent = ({ resource }) => {
    setSelectedEventId(resource.id);
    setSelectedDate(parseISO(resource.startDate));
  };
  const handleCalendarSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
  };
  const handleQueueSelect = (event) => {
    setSelectedEventId(event.id);
    setSelectedDate(parseISO(event.startDate));
    setCurrentDate(parseISO(event.startDate));
  };
  const eventPropGetter = (calendarEvent) => ({
    className: getCalendarEventClassName(calendarEvent.resource),
  });

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {feedback && (
        <div className="mb-6">
          <FeedbackPanel tone={feedback.tone} title={feedback.title}>
            {feedback.message}
          </FeedbackPanel>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 items-start">
        <div className="space-y-6 xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                Events Schedule
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                {format(currentDate, "MMMM yyyy")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select an event from the calendar to manage assignments, logistics, and performance.
              </p>
            </div>

            <div className="flex items-center overflow-hidden rounded-lg border border-border-subtle bg-surface-card shadow-sm">
              <button
                type="button"
                onClick={handleCalendarPrev}
                className="px-3 py-2 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleCalendarToday}
                className="border-x border-border-subtle px-4 py-2 text-[13px] font-bold text-slate-700"
              >
                TODAY
              </button>
              <button
                type="button"
                onClick={handleCalendarNext}
                className="px-3 py-2 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
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
              selectable
              onSelectEvent={handleCalendarSelectEvent}
              onSelectSlot={handleCalendarSelectSlot}
              className="adnu-calendar adnu-events-calendar"
              style={{ minHeight: 720 }}
              eventPropGetter={eventPropGetter}
              formats={{
                weekdayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "EEE", culture).toUpperCase(),
                dayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "d", culture),
              }}
            />

            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-full border border-border-subtle bg-surface-card/90 px-5 py-3 shadow-float backdrop-blur-md">
              <LegendPill tone="ongoing" label="Ongoing" />
              <LegendPill tone="upcoming" label="Upcoming" />
              <LegendPill tone="draft" label="Draft" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-7 shadow-soft">
            <h2 className="mb-6 text-[18px] font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="space-y-4">
              <ToolbarField label="Search">
                <div className="group relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => handleFilterChange("search", event.target.value)}
                    placeholder="Search title, venue, organizer"
                    className="w-full rounded-xl border border-border-subtle bg-slate-50 py-2.5 pl-11 pr-4 text-[13px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
                  />
                </div>
              </ToolbarField>

              <div className="grid grid-cols-2 gap-4">
                <ToolbarField label="Status">
                  <select
                    value={filters.status}
                    onChange={(event) => handleFilterChange("status", event.target.value)}
                    className="w-full appearance-none rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
                  >
                    <option>All statuses</option>
                    {eventStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </ToolbarField>

                <ToolbarField label="Sport">
                  <select
                    value={filters.sportCategory}
                    onChange={(event) =>
                      handleFilterChange("sportCategory", event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
                  >
                    <option>All sports</option>
                    {sportCategories.map((sport) => (
                      <option key={sport}>{sport}</option>
                    ))}
                  </select>
                </ToolbarField>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3.5 text-[13px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-xl border border-border-subtle bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  Selected Event
                </h2>
                <p className="mt-1 text-[12px] text-slate-500">
                  Calendar details and actions
                </p>
              </div>
              <span className="rounded-md bg-brand-blue-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                {selectedEvent ? selectedEvent.status : "None"}
              </span>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border-subtle/50 p-5 shadow-sm">
                  <h3 className="text-[15px] font-bold text-slate-900">
                    {selectedEvent.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {selectedEvent.sportCategory} | {selectedEvent.type}
                  </p>
                  <div className="mt-4 space-y-3 text-[13px] text-slate-600">
                    <div>{formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}</div>
                    <div>{formatEventTime(selectedEvent.startTime, selectedEvent.endTime)}</div>
                    <div>{selectedEvent.venue}</div>
                    <div>
                      {selectedEvent.assignedAthletes.length}/{selectedEvent.maxParticipants} athletes assigned
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedEvent)}
                    className="rounded-lg border border-border-subtle/50 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openAssignModal(selectedEvent)}
                    className="rounded-lg border border-border-subtle/50 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => openPerformanceModal(selectedEvent)}
                    className="rounded-lg border border-border-subtle/50 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Performance
                  </button>
                  <button
                    type="button"
                    onClick={() => openDetailsModal(selectedEvent)}
                    className="rounded-lg border border-border-subtle/50 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Details
                  </button>
                </div>
              </div>
            ) : (
              <FeedbackPanel tone="info" title="No event selected">
                Select an event from the calendar to manage it here.
              </FeedbackPanel>
            )}
          </div>

          <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card overflow-hidden shadow-soft">
            <div className="flex items-center justify-between border-b border-border-subtle/50 p-6">
              <h2 className="text-[16px] font-bold text-slate-900">
                Day Agenda
              </h2>
              <span className="rounded-md bg-brand-blue-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                {selectedDayEvents.length} items
              </span>
            </div>

            <div className="p-6 space-y-4">
              {selectedDayEvents.length === 0 ? (
                <p className="text-[13px] text-slate-500">
                  No events scheduled on this date.
                </p>
              ) : (
                selectedDayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleQueueSelect(event)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedEvent?.id === event.id
                        ? "border-brand-blue/20 bg-brand-blue-light/40"
                        : "border-border-subtle/50 hover:bg-slate-50"
                    }`}
                  >
                    <h3 className="text-[14px] font-bold text-slate-900">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {formatEventTime(event.startTime, event.endTime)} | {event.venue}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <EventsModal
        modal={modal}
        event={activeModalEvent}
        events={events}
        onClose={closeModal}
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
        onUpdatePerformance={updatePerformance}
        onUpdateMetric={updateMetric}
        onAddMetric={addMetric}
        onOpenEdit={openEditModal}
        onOpenAssign={openAssignModal}
        onOpenPerformance={openPerformanceModal}
        onRunDestructiveAction={runDestructiveAction}
      />
    </div>
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
  onUpdatePerformance,
  onUpdateMetric,
  onAddMetric,
  onOpenEdit,
  onOpenAssign,
  onOpenPerformance,
  onRunDestructiveAction,
}) {
  if (!modal) return null;

  if (modal.type === "form") {
    const isEdit = modal.mode === "edit";

    return (
      <Modal
        open
        onClose={onClose}
        title={isEdit ? "Edit Event" : "Create Event"}
        description="Capture event logistics, participant limits, and internal notes for the athletics office."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveEvent}>
              {isEdit ? "Save changes" : "Create event"}
            </PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-6">
          <FormSection
            eyebrow="Basic Details"
            title="Event Information"
            description="Define the event name, sport focus, and a short brief for the athletics office."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
            <Field label="Event title" error={modal.errors.title}>
              <TextInput
                value={modal.values.title}
                onChange={(event) => onFormChange("title", event.target.value)}
                placeholder="Women’s Volleyball Skills Evaluation"
              />
            </Field>
          </div>

          <Field label="Event type" error={modal.errors.type}>
            <SelectInput
              value={modal.values.type}
              onChange={(event) => onFormChange("type", event.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Sport category" error={modal.errors.sportCategory}>
            <SelectInput
              value={modal.values.sportCategory}
              onChange={(event) =>
                onFormChange("sportCategory", event.target.value)
              }
            >
              {sportCategories.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Description" error={modal.errors.description}>
              <TextArea
                value={modal.values.description}
                onChange={(event) =>
                  onFormChange("description", event.target.value)
                }
                placeholder="Outline the purpose, session flow, and key expectations."
              />
            </Field>
          </div>

            </div>
          </FormSection>

          <FormSection
            eyebrow="Schedule"
            title="Timing and Venue"
            description="Keep the schedule, coordinator, and venue fields together for quicker verification."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Venue / location" error={modal.errors.venue}>
            <TextInput
              value={modal.values.venue}
              onChange={(event) => onFormChange("venue", event.target.value)}
              placeholder="Main Gym Performance Lab"
            />
          </Field>

          <Field label="Organizer / coordinator" error={modal.errors.organizer}>
            <TextInput
              value={modal.values.organizer}
              onChange={(event) => onFormChange("organizer", event.target.value)}
              placeholder="Coach or office lead"
            />
          </Field>

          <Field label="Start date" error={modal.errors.startDate}>
            <TextInput
              type="date"
              value={modal.values.startDate}
              onChange={(event) => onFormChange("startDate", event.target.value)}
            />
          </Field>

          <Field label="End date" error={modal.errors.endDate}>
            <TextInput
              type="date"
              value={modal.values.endDate}
              onChange={(event) => onFormChange("endDate", event.target.value)}
            />
          </Field>

          <Field label="Start time" error={modal.errors.startTime}>
            <TextInput
              type="time"
              value={modal.values.startTime}
              onChange={(event) => onFormChange("startTime", event.target.value)}
            />
          </Field>

          <Field label="End time" error={modal.errors.endTime}>
            <TextInput
              type="time"
              value={modal.values.endTime}
              onChange={(event) => onFormChange("endTime", event.target.value)}
            />
          </Field>

            </div>
          </FormSection>

          <FormSection
            eyebrow="Operations"
            title="Capacity and Notes"
            description="Capture participation limits, status, and office-only reminders in one section."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
            label="Maximum participants"
            error={modal.errors.maxParticipants}
          >
            <TextInput
              type="number"
              value={modal.values.maxParticipants}
              onChange={(event) =>
                onFormChange("maxParticipants", event.target.value)
              }
              placeholder="24"
            />
          </Field>

          <Field label="Status" error={modal.errors.status}>
            <SelectInput
              value={modal.values.status}
              onChange={(event) => onFormChange("status", event.target.value)}
            >
              {eventStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>

              <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea
                value={modal.values.notes}
                onChange={(event) => onFormChange("notes", event.target.value)}
                placeholder="Internal reminders, logistics, and staffing notes."
              />
            </Field>
              </div>
            </div>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (!event) return null;

  const assignedProfiles = event.assignedAthletes.map((assignment) => ({
    ...assignment,
    athlete: athletePool.find((athlete) => athlete.id === assignment.athleteId),
  }));

  if (modal.type === "details") {
    return (
      <Modal
        open
        onClose={onClose}
        title={event.title}
        description={`${event.type} | ${event.sportCategory}`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={() => onOpenEdit(event)}>Edit Event</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="Status" value={event.status} />
            <InfoTile
              label="Date"
              value={formatEventDate(event.startDate, event.endDate)}
            />
            <InfoTile
              label="Time"
              value={formatEventTime(event.startTime, event.endTime)}
            />
            <InfoTile label="Venue" value={event.venue} />
          </div>

          <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Description
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              {event.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle/50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Coordinator
              </p>
              <p className="mt-2 text-[14px] font-semibold text-slate-900">
                {event.organizer}
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Notes
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                {event.notes || "No internal notes recorded yet."}
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle/50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Performance Preview
              </p>
              <div className="mt-3 space-y-3">
                {assignedProfiles.slice(0, 2).map((profile) => (
                  <div
                    key={profile.athleteId}
                    className="rounded-xl bg-slate-50 px-3 py-3 text-[13px]"
                  >
                    <p className="font-semibold text-slate-900">
                      {profile.athlete?.name ?? "Unknown athlete"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {profile.result} | {profile.performanceRating}
                    </p>
                  </div>
                ))}
                {assignedProfiles.length === 0 && (
                  <p className="text-[13px] text-slate-500">
                    No athlete performance entries yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Athletes
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Participation status and quick roster visibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenAssign(event)}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3 py-2 text-[12px] font-bold tracking-wide text-slate-600 transition-colors hover:bg-slate-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign Athletes
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {assignedProfiles.map((profile) => (
                <div
                  key={profile.athleteId}
                  className="flex flex-col gap-2 rounded-xl bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">
                      {profile.athlete?.name ?? "Unknown athlete"}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {profile.athlete?.team ?? "No team"} |{" "}
                      {profile.athlete?.role ?? "No role"} |{" "}
                      {profile.athlete?.studentId ?? "No student ID"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${participationClasses[profile.participationStatus]}`}
                  >
                    {profile.participationStatus}
                  </span>
                </div>
              ))}
              {assignedProfiles.length === 0 && (
                <p className="text-[13px] text-slate-500">
                  No athletes are assigned to this event yet.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              icon={PencilLine}
              title="Edit Event"
              description="Adjust scheduling, venue, and internal notes."
              onClick={() => onOpenEdit(event)}
            />
            <ActionCard
              icon={UserPlus}
              title="Assign Athletes"
              description="Add or remove rostered participants."
              onClick={() => onOpenAssign(event)}
            />
            <ActionCard
              icon={Trophy}
              title="Record Performance"
              description="Capture attendance, results, and coach remarks."
              onClick={() => onOpenPerformance(event)}
            />
            <ActionCard
              icon={XCircle}
              title="Change Status"
              description="Move the event to cancelled or another stage."
              onClick={() => onOpenEdit(event)}
            />
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "assign") {
    const filteredAthletes = athletePool.filter((athlete) => {
      const query = modal.filters.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [athlete.name, athlete.studentId, athlete.sport, athlete.team]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesSport =
        modal.filters.sport === "All sports" || athlete.sport === modal.filters.sport;
      const matchesTeam =
        modal.filters.team === "All teams" || athlete.team === modal.filters.team;
      const matchesYear =
        modal.filters.yearLevel === "All years" ||
        athlete.yearLevel === modal.filters.yearLevel;

      return matchesSearch && matchesSport && matchesTeam && matchesYear;
    });

    const selectedProfiles = athletePool.filter((athlete) =>
      modal.pendingSelections.includes(athlete.id),
    );

    return (
      <Modal
        open
        onClose={onClose}
        title={`Assign Athletes | ${event.title}`}
        description="Search the athlete pool, select participants, and keep roster visibility in one place."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={onSaveAssignments}>Save assignments</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-6">
          <div className="rounded-[24px] border border-border-subtle/60 bg-slate-50/70 p-5">
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                Selection Filters
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search the athlete pool and refine the list before adding new
                participants to the event roster.
              </p>
            </div>
            <div className="grid gap-3 xl:grid-cols-4">
              <TextInput
                value={modal.filters.search}
                onChange={(event) =>
                  onAssignmentFilterChange("search", event.target.value)
                }
                placeholder="Search athletes"
              />
              <SelectInput
                value={modal.filters.sport}
                onChange={(event) =>
                  onAssignmentFilterChange("sport", event.target.value)
                }
              >
                <option>All sports</option>
                {[...new Set(athletePool.map((athlete) => athlete.sport))].map((sport) => (
                  <option key={sport}>{sport}</option>
                ))}
              </SelectInput>
              <SelectInput
                value={modal.filters.team}
                onChange={(event) =>
                  onAssignmentFilterChange("team", event.target.value)
                }
              >
                <option>All teams</option>
                {[...new Set(athletePool.map((athlete) => athlete.team))].map((team) => (
                  <option key={team}>{team}</option>
                ))}
              </SelectInput>
              <SelectInput
                value={modal.filters.yearLevel}
                onChange={(event) =>
                  onAssignmentFilterChange("yearLevel", event.target.value)
                }
              >
                <option>All years</option>
                {[...new Set(athletePool.map((athlete) => athlete.yearLevel))].map(
                  (yearLevel) => (
                    <option key={yearLevel}>{yearLevel}</option>
                  ),
                )}
              </SelectInput>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[24px] border border-border-subtle/50 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Athlete Pool
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Multi-select student-athletes for this event.
                  </p>
                </div>
                <span className="text-[12px] font-semibold text-slate-500">
                  {filteredAthletes.length} results
                </span>
              </div>
              <div className="space-y-3">
                {filteredAthletes.map((athlete) => {
                  const selected = modal.pendingSelections.includes(athlete.id);
                  const alreadyAssigned = event.assignedAthletes.some(
                    (assignment) => assignment.athleteId === athlete.id,
                  );

                  return (
                    <label
                      key={athlete.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                        selected
                          ? "border-brand-blue/30 bg-brand-blue-light/60"
                          : "border-border-subtle/60 bg-slate-50/70 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelection(athlete.id)}
                        className="mt-1 h-4 w-4 rounded border-border-subtle text-brand-blue focus:ring-brand-blue"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-semibold text-slate-900">
                            {athlete.name}
                          </p>
                          {alreadyAssigned && (
                            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                              Already Assigned
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {athlete.studentId} | {athlete.team} | {athlete.yearLevel}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {athlete.sport} | {athlete.role}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-border-subtle/50 bg-slate-50/60 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Preview
                </p>
                <div className="mt-3 space-y-2">
                  {selectedProfiles.length === 0 ? (
                    <p className="text-[13px] text-slate-500">
                      No athletes selected yet.
                    </p>
                  ) : (
                    selectedProfiles.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-800"
                      >
                        {athlete.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-border-subtle/50 bg-slate-50/60 p-5">
                <div className="mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Athletes
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Remove athletes directly from the current roster.
                  </p>
                </div>

                <div className="space-y-3">
                  {assignedProfiles.map((profile) => (
                    <div
                      key={profile.athleteId}
                      className="rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-900">
                            {profile.athlete?.name ?? "Unknown athlete"}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-500">
                            {profile.athlete?.sport} | {profile.athlete?.yearLevel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveAssignedAthlete(event.id, profile.athleteId)
                          }
                          className="text-[11px] font-bold uppercase tracking-wider text-red-600 transition-colors hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <span
                        className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${participationClasses[profile.participationStatus]}`}
                      >
                        {profile.participationStatus}
                      </span>
                    </div>
                  ))}
                  {assignedProfiles.length === 0 && (
                    <p className="text-[13px] text-slate-500">
                      No athletes currently assigned.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "performance") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Record Performance | ${event.title}`}
        description="Update attendance, ratings, placement, statistics, and coaching evaluation notes."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={onClose}>Keep local changes</PrimaryButton>
          </>
        }
        size="lg"
      >
        <div className="space-y-5">
          {assignedProfiles.length === 0 ? (
            <FeedbackPanel tone="info" title="No assigned athletes yet">
              Assign athletes to this event first so performance entries have a live
              roster to work from.
            </FeedbackPanel>
          ) : (
            assignedProfiles.map((profile) => (
              <section
                key={profile.athleteId}
                className="rounded-[24px] border border-border-subtle/50 bg-slate-50/55 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">
                      {profile.athlete?.name ?? "Unknown athlete"}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {profile.athlete?.sport} | {profile.athlete?.team} |{" "}
                      {profile.athlete?.role}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${participationClasses[profile.participationStatus]}`}
                  >
                    {profile.participationStatus}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label="Attendance status">
                    <SelectInput
                      value={profile.attendanceStatus}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "attendanceStatus",
                          changeEvent.target.value,
                        )
                      }
                    >
                      {attendanceOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="Performance rating">
                    <TextInput
                      value={profile.performanceRating}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "performanceRating",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Result / placement">
                    <TextInput
                      value={profile.result}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "result",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Score / statistics">
                    <TextInput
                      value={profile.scoreStatistics}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "scoreStatistics",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Coach remarks">
                    <TextArea
                      value={profile.coachRemarks}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "coachRemarks",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Strengths observed">
                    <TextArea
                      value={profile.strengthsObserved}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "strengthsObserved",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Areas for improvement">
                    <TextArea
                      value={profile.areasForImprovement}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "areasForImprovement",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Injury notes">
                    <TextArea
                      value={profile.injuryNotes}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "injuryNotes",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Evaluated by">
                    <TextInput
                      value={profile.evaluatedBy}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "evaluatedBy",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Evaluation date">
                    <TextInput
                      type="date"
                      value={profile.evaluationDate}
                      onChange={(changeEvent) =>
                        onUpdatePerformance(
                          event.id,
                          profile.athleteId,
                          "evaluationDate",
                          changeEvent.target.value,
                        )
                      }
                    />
                  </Field>
                </div>

                <div className="mt-5 rounded-[22px] border border-border-subtle/50 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Sport-Specific Metrics
                      </p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        Add benchmark values, units, and short notes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddMetric(event.id, profile.athleteId)}
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3 py-2 text-[12px] font-bold tracking-wide text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Metric
                    </button>
                  </div>
                  <div className="space-y-3">
                    {profile.metrics.map((metric, index) => (
                      <div
                        key={`${profile.athleteId}-${index}`}
                        className="grid gap-3 rounded-xl border border-border-subtle/50 bg-slate-50/60 p-3 xl:grid-cols-[1.1fr_0.8fr_0.6fr_1.2fr]"
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
                          placeholder="Metric name"
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
                          placeholder="Metric value"
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
                      </div>
                    ))}
                    {profile.metrics.length === 0 && (
                      <p className="text-[13px] text-slate-500">
                        No metrics recorded yet for this athlete.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))
          )}
        </div>
      </Modal>
    );
  }

  const destructiveLabel = modal.action === "delete" ? "Delete Event" : "Cancel Event";
  const destructiveTone = modal.action === "delete" ? "danger" : "warning";

  return (
    <Modal
      open
      onClose={onClose}
      title={destructiveLabel}
      description={`${event.title} will be updated only in local frontend state.`}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Keep event</SecondaryButton>
          <PrimaryButton
            tone={modal.action === "delete" ? "danger" : "gold"}
            onClick={onRunDestructiveAction}
          >
            Confirm {modal.action}
          </PrimaryButton>
        </>
      }
    >
      <FeedbackPanel tone={destructiveTone} title="Confirmation required">
        {modal.action === "delete"
          ? "Use delete for a local removal when the event should disappear from the board entirely."
          : "Use cancel when the event should remain visible for reference but stop being treated as active."}
      </FeedbackPanel>
    </Modal>
  );
}

function LegendPill({ tone, label }) {
  const toneClasses = {
    ongoing: "bg-brand-gold-light text-brand-gold-hover",
    upcoming: "bg-brand-blue-light text-brand-blue",
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

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
        {value}
      </p>
    </div>
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
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </button>
  );
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
    "description",
    "venue",
    "startDate",
    "endDate",
    "startTime",
    "endTime",
    "maxParticipants",
    "organizer",
    "status",
  ];

  requiredFields.forEach((field) => {
    if (!values[field]?.trim?.() && values[field] !== 0) {
      errors[field] = "This field is required.";
    }
  });

  if (values.maxParticipants && Number.isNaN(Number(values.maxParticipants))) {
    errors.maxParticipants = "Maximum participants must be numeric.";
  }

  if (
    values.startDate &&
    values.endDate &&
    values.startTime &&
    values.endTime
  ) {
    const start = new Date(`${values.startDate}T${values.startTime}`);
    const end = new Date(`${values.endDate}T${values.endTime}`);

    if (start > end) {
      errors.endDate = "End date and time cannot be earlier than the start.";
      errors.endTime = "End date and time cannot be earlier than the start.";
    }
  }

  return errors;
}
