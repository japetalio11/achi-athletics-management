import { useMemo, useState, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Search,
  SearchCheck,
  Send,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  Field,
  PrimaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "../../components/ui/Modal";
import { EmptyState, PublicBadge, PublicHero, PublicPageShell } from "./PublicLayout";
import {
  ActionHint,
  EmptyInline,
  ProgressSteps,
  PublicSection,
  StatusTimeline,
  SummaryRail,
  TrackPrompt,
} from "./PublicShared";
import {
  formatPublicDate,
  formatPublicDateTime,
  getDocumentStatusMeta,
  getRequestStatusMeta,
  makeReference,
  makeTimelineItems,
  mergeStoredRecords,
  saveStoredRecord,
  toTwelveHour,
} from "./publicUtils";
import {
  getApplicableDocuments,
  mockFacilities,
  mockReservations,
} from "../facilities/facilityMockData";
import {
  formatDateTime,
  statusBadgeClasses,
  validateReservationForm,
} from "../facilities/facilityTypes";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const FACILITY_REQUESTS_KEY = "adnu-public-facility-requests";
const defaultDate = "2026-05-15";
const facilitySteps = [
  { id: "facility", label: "Select Facility" },
  { id: "schedule", label: "Select Schedule" },
  { id: "requester", label: "Requester Info" },
  { id: "activity", label: "Activity Details" },
  { id: "documents", label: "Required Docs" },
  { id: "review", label: "Review & Submit" },
];

const emptyFacilityRequest = {
  requesterName: "",
  requesterType: "External/Outsider",
  organization: "",
  email: "",
  contactNumber: "",
  facilityId: "",
  reservationDate: defaultDate,
  startTime: "",
  endTime: "",
  participantCount: "",
  activityName: "",
  description: "",
  useType: "External",
  equipmentNeeds: "",
  notes: "",
  documentsAcknowledged: false,
};

export function PublicFacilityRequestPage() {
  const facilities = useMemo(() => mockFacilities.filter((facility) => !facility.archived), []);
  const formSectionRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "All types",
    availability: "Any availability",
    capacity: "Any capacity",
    sport: "All activities",
    location: "All locations",
  });
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...emptyFacilityRequest,
    facilityId: facilities[0]?.id ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [tracking, setTracking] = useState({ reference: "", email: "", result: null, message: "" });

  const storedRequests = mergeStoredRecords(FACILITY_REQUESTS_KEY, normalizeFacilityRecord);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const availability = getFacilityAvailabilityPublic(facility);
      const matchesSearch = [facility.name, facility.type, facility.location, facility.sports.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.trim().toLowerCase());
      const matchesType = filters.type === "All types" || facility.type === filters.type;
      const matchesAvailability = filters.availability === "Any availability" || availability === filters.availability;
      const matchesSport = filters.sport === "All activities" || facility.sports.includes(filters.sport);
      const matchesLocation = filters.location === "All locations" || facility.location === filters.location;
      const matchesCapacity =
        filters.capacity === "Any capacity" ||
        (filters.capacity === "Under 100" && facility.capacity < 100) ||
        (filters.capacity === "100-499" && facility.capacity >= 100 && facility.capacity <= 499) ||
        (filters.capacity === "500+" && facility.capacity >= 500);

      return matchesSearch && matchesType && matchesAvailability && matchesSport && matchesLocation && matchesCapacity;
    });
  }, [facilities, filters]);

  const selectedFacility =
    filteredFacilities.find((facility) => facility.id === selectedFacilityId) ??
    facilities.find((facility) => facility.id === selectedFacilityId) ??
    facilities[0];

  const existingReservations = useMemo(
    () => [
      ...mockReservations.filter((reservation) => reservation.facilityId === selectedFacility?.id),
      ...storedRequests.filter((reservation) => reservation.facilityId === selectedFacility?.id),
    ],
    [selectedFacility?.id, storedRequests],
  );

  const calendarEvents = useMemo(() => {
    const reservations = existingReservations.map((reservation) => ({
      id: reservation.reference || reservation.id,
      title: reservation.activityName,
      start: new Date(`${reservation.reservationDate}T${reservation.startTime}`),
      end: new Date(`${reservation.reservationDate}T${reservation.endTime}`),
      resource: { type: "reservation", reservation },
    }));
    const maintenance = (selectedFacility?.maintenanceRecords ?? []).map((record) => ({
      id: record.id,
      title: record.title,
      start: new Date(`${record.startDate}T${record.startTime}`),
      end: new Date(`${record.endDate}T${record.endTime}`),
      resource: { type: "maintenance", record },
    }));
    return [...reservations, ...maintenance];
  }, [existingReservations, selectedFacility]);

  const scheduleEntries = useMemo(() => {
    const reservations = existingReservations.filter((reservation) => reservation.reservationDate === selectedDate);
    const maintenance = (selectedFacility?.maintenanceRecords ?? []).filter(
      (record) => record.startDate <= selectedDate && record.endDate >= selectedDate,
    );
    return { reservations, maintenance };
  }, [existingReservations, selectedDate, selectedFacility]);

  const availableSlots = useMemo(
    () => buildAvailableSlots(selectedFacility, selectedDate, scheduleEntries.reservations, scheduleEntries.maintenance),
    [scheduleEntries.maintenance, scheduleEntries.reservations, selectedDate, selectedFacility],
  );

  const requiredDocuments = getApplicableDocuments(selectedFacility, form.requesterType);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const beginRequest = (facility = selectedFacility, slot = selectedSlot) => {
    setSelectedFacilityId(facility.id);
    setShowIntroModal(true);
    setForm((current) => ({
      ...current,
      facilityId: facility.id,
      reservationDate: slot?.date ?? selectedDate,
      startTime: slot?.startTime ?? current.startTime,
      endTime: slot?.endTime ?? current.endTime,
    }));
  };

  const startFormFlow = () => {
    setShowIntroModal(false);
    setRequestOpen(true);
    setCurrentStep(1);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const selectFacility = (facility) => {
    setSelectedFacilityId(facility.id);
    setSelectedSlot(null);
    setSelectedDate(defaultDate);
    setForm((current) => ({ ...current, facilityId: facility.id }));
  };

  const handleSlotPick = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate(slot.date);
    setForm((current) => ({
      ...current,
      facilityId: selectedFacility.id,
      reservationDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    beginRequest(selectedFacility, slot);
  };

  const goNext = () => {
    const nextErrors = validateFacilityStep(currentStep, form, requiredDocuments);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setCurrentStep((current) => Math.min(current + 1, facilitySteps.length));
  };

  const goBack = () => {
    setCurrentStep((current) => Math.max(current - 1, 1));
  };

  const submitRequest = () => {
    const nextErrors = validateReservationForm(form);
    if (!form.documentsAcknowledged) {
      nextErrors.documentsAcknowledged = "Confirm that you can submit the listed documents.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const record = buildFacilitySubmission(form, selectedFacility, requiredDocuments);
    saveStoredRecord(FACILITY_REQUESTS_KEY, record, normalizeFacilityRecord);
    setConfirmation(record);
    setTracking({ reference: record.reference, email: record.email, result: record, message: "" });
    setForm({ ...emptyFacilityRequest, facilityId: selectedFacility.id, reservationDate: defaultDate });
    setSelectedSlot(null);
    setRequestOpen(false);
    setCurrentStep(1);
  };

  const trackRequest = (event) => {
    event.preventDefault();
    const reference = tracking.reference.trim().toUpperCase();
    const email = tracking.email.trim().toLowerCase();
    const result = storedRequests.find(
      (record) => record.reference === reference && record.email.toLowerCase() === email,
    );
    setTracking((current) => ({
      ...current,
      reference,
      result: result ?? null,
      message: result ? "" : "No matching public facility request was found.",
    }));
  };

  const summaryItems = [
    { label: "Facility", value: selectedFacility?.name },
    { label: "Date", value: formatPublicDate(form.reservationDate || selectedDate) },
    { label: "Time", value: form.startTime ? `${toTwelveHour(form.startTime)} - ${toTwelveHour(form.endTime)}` : "Pick a slot" },
    { label: "Requester", value: form.requesterName || "Add in step 3" },
  ];

  return (
    <PublicPageShell compact>
      <main className="pb-16">
        {showIntroModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-[28px] border border-white bg-white shadow-2xl">
              <div className="space-y-6 p-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Start Your Reservation</h2>
                  <p className="mt-3 text-[14px] leading-7 text-slate-600">
                    You're about to request <span className="font-bold">{selectedFacility?.name}</span>
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">1</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Fill in your details</p>
                      <p className="mt-1 text-[12px] text-slate-600">Contact info and organization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">2</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Describe your activity</p>
                      <p className="mt-1 text-[12px] text-slate-600">Purpose, participant count, and needs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">3</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Submit for review</p>
                      <p className="mt-1 text-[12px] text-slate-600">Get a reference code to track your request</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIntroModal(false);
                      setSelectedSlot(null);
                    }}
                    className="flex-1 rounded-full border border-border-subtle bg-white px-4 py-3 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={startFormFlow}
                    className="flex-1 rounded-full bg-brand-blue px-4 py-3 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
                  >
                    Start Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <PublicHero
          eyebrow="Facility reservation request"
          title="Browse facilities and availability first, then start a guided request."
          description="Public users can compare venues, inspect available time windows, and only open the request form when they already know what they want."
          icon={Building2}
          actions={<TrackPrompt />}
        />

        <section className="mt-10 space-y-6">
          <TrackingPanel tracking={tracking} setTracking={setTracking} onSubmit={trackRequest} />

          <PublicSection
            title="Browse facilities"
            description="Search by type, sport, capacity, and location before you request anything."
            icon={Building2}
          >
            <div className="grid gap-3 lg:grid-cols-[1fr_repeat(5,minmax(0,180px))]">
              <label className="relative lg:col-span-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search facilities"
                  className="w-full rounded-full border border-border-subtle bg-slate-50 py-3 pl-11 pr-4 text-[13px] font-medium text-slate-700 outline-none"
                />
              </label>
              <FilterSelect value={filters.type} onChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                <option>All types</option>
                {Array.from(new Set(facilities.map((facility) => facility.type))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
              <FilterSelect value={filters.availability} onChange={(value) => setFilters((current) => ({ ...current, availability: value }))}>
                <option>Any availability</option>
                <option>Available</option>
                <option>Reserved</option>
                <option>Limited Use</option>
                <option>Under Maintenance</option>
              </FilterSelect>
              <FilterSelect value={filters.capacity} onChange={(value) => setFilters((current) => ({ ...current, capacity: value }))}>
                <option>Any capacity</option>
                <option>Under 100</option>
                <option>100-499</option>
                <option>500+</option>
              </FilterSelect>
              <FilterSelect value={filters.sport} onChange={(value) => setFilters((current) => ({ ...current, sport: value }))}>
                <option>All activities</option>
                {Array.from(new Set(facilities.flatMap((facility) => facility.sports))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
              <FilterSelect value={filters.location} onChange={(value) => setFilters((current) => ({ ...current, location: value }))}>
                <option>All locations</option>
                {Array.from(new Set(facilities.map((facility) => facility.location))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-4">
                {filteredFacilities.length ? (
                  filteredFacilities.map((facility) => (
                    <FacilityBrowserCard
                      key={facility.id}
                      facility={facility}
                      selected={facility.id === selectedFacility?.id}
                      onSelect={() => selectFacility(facility)}
                      onRequest={() => beginRequest(facility)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={SlidersHorizontal}
                    title="No facilities match these filters"
                    description="Try a broader search or clear one of the filters."
                  />
                )}
              </div>
              <SummaryRail
                title="Selected facility"
                icon={CalendarDays}
                items={[
                  { label: "Facility", value: selectedFacility?.name },
                  { label: "Availability", value: getFacilityAvailabilityPublic(selectedFacility) },
                  { label: "Capacity", value: selectedFacility ? `${selectedFacility.capacity} people` : "" },
                  { label: "Location", value: selectedFacility?.location },
                ]}
                footer={
                  <div className="space-y-3">
                    <ActionHint>{availableSlots.length ? "Pick a time slot below to jump into the request flow." : "Browse the schedule below to find the best date."}</ActionHint>
                    <button
                      type="button"
                      onClick={() => beginRequest(selectedFacility)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Request Facility
                    </button>
                  </div>
                }
              />
            </div>
          </PublicSection>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <PublicSection
              title="Facility schedule"
              description="See the selected facility's reservations, blockouts, and open windows before you request."
              icon={CalendarDays}
            >
              <div className="rounded-[24px] border border-border-subtle/70">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view="month"
                  views={["month"]}
                  style={{ minHeight: 620 }}
                  className="adnu-events-calendar facility-calendar"
                  toolbar={false}
                  popup
                  selectable
                  onSelectSlot={(slotInfo) => setSelectedDate(format(slotInfo.start, "yyyy-MM-dd"))}
                  onSelectEvent={(calendarEvent) => {
                    if (calendarEvent.resource.type === "reservation") {
                      setSelectedDate(calendarEvent.resource.reservation.reservationDate);
                    }
                  }}
                  eventPropGetter={(calendarEvent) => ({
                    className:
                      calendarEvent.resource.type === "maintenance"
                        ? "facility-calendar__event facility-calendar__event--maintenance"
                        : `facility-calendar__event facility-calendar__event--${String(calendarEvent.resource.reservation.status).toLowerCase().replaceAll(" ", "-")}`,
                  })}
                />
              </div>
            </PublicSection>

            <PublicSection
              title="Schedule details"
              description="Selected date, blocked periods, and fast entry into a request."
              icon={Clock3}
            >
              <div className="space-y-4">
                <div className="rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Selected date</p>
                  <p className="mt-2 text-[18px] font-black text-slate-950">{formatPublicDate(selectedDate)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <PublicBadge className="bg-green-50 text-green-700">Available</PublicBadge>
                    <PublicBadge className="bg-brand-blue-light text-brand-blue">Reserved</PublicBadge>
                    <PublicBadge className="bg-brand-gold-light text-brand-gold-hover">Maintenance</PublicBadge>
                  </div>
                </div>

                <div className="rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
                  <h3 className="text-[14px] font-black text-slate-900">Available time slots</h3>
                  <div className="mt-4 space-y-2">
                    {availableSlots.length ? (
                      availableSlots.map((slot) => (
                        <button
                          key={`${slot.date}-${slot.startTime}`}
                          type="button"
                          onClick={() => handleSlotPick(slot)}
                          className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-[13px] font-bold text-slate-700 shadow-soft hover:bg-brand-blue-light hover:text-brand-blue"
                        >
                          <span>{toTwelveHour(slot.startTime)} - {toTwelveHour(slot.endTime)}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ))
                    ) : (
                      <EmptyInline
                        title="No open slots published"
                        description="This date is full or blocked. Try another date or facility."
                        icon={Clock3}
                      />
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-border-subtle bg-slate-50/80 p-4">
                  <h3 className="text-[14px] font-black text-slate-900">Reserved or blocked</h3>
                  <div className="mt-4 space-y-3">
                    {scheduleEntries.maintenance.map((record) => (
                      <div key={record.id} className="rounded-2xl bg-white px-4 py-3 shadow-soft">
                        <p className="text-[13px] font-black text-slate-900">{record.title}</p>
                        <p className="mt-1 text-[12px] leading-6 text-slate-500">
                          {toTwelveHour(record.startTime)} - {toTwelveHour(record.endTime)} | {record.reason}
                        </p>
                      </div>
                    ))}
                    {scheduleEntries.reservations.map((reservation) => (
                      <div key={reservation.reference || reservation.id} className="rounded-2xl bg-white px-4 py-3 shadow-soft">
                        <p className="text-[13px] font-black text-slate-900">{reservation.activityName}</p>
                        <p className="mt-1 text-[12px] leading-6 text-slate-500">
                          {toTwelveHour(reservation.startTime)} - {toTwelveHour(reservation.endTime)} | {reservation.status}
                        </p>
                      </div>
                    ))}
                    {!scheduleEntries.reservations.length && !scheduleEntries.maintenance.length ? (
                      <p className="text-[12px] leading-6 text-slate-500">No reservations or maintenance blocks on this date.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </PublicSection>
          </section>

          {requestOpen ? (
            <section ref={formSectionRef} className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
              <PublicSection
                title="Facility request flow"
                description="One step at a time, with review before submission."
                icon={CalendarPlus}
              >
                <ProgressSteps steps={facilitySteps} currentStep={currentStep} />
                <div className="mt-6">
                  <FacilityStepContent
                    currentStep={currentStep}
                    selectedFacility={selectedFacility}
                    selectedDate={selectedDate}
                    form={form}
                    errors={errors}
                    requiredDocuments={requiredDocuments}
                    updateForm={updateForm}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1) {
                        setRequestOpen(false);
                        return;
                      }
                      goBack();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-3 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {currentStep === 1 ? "Close" : "Back"}
                  </button>
                  {currentStep < facilitySteps.length ? (
                    <PrimaryButton type="button" onClick={goNext} className="px-6 py-3">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton type="button" onClick={submitRequest} className="px-6 py-3">
                      Submit Request
                      <Send className="h-4 w-4" />
                    </PrimaryButton>
                  )}
                </div>
              </PublicSection>

              <SummaryRail title="Request summary" icon={FileText} items={summaryItems} />
            </section>
          ) : null}

          {confirmation ? (
            <PublicSection
              title="Request submitted"
              description="Keep this reference number to track your request."
              icon={CheckCircle2}
            >
              <div className="rounded-[24px] border border-green-100 bg-green-50/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PublicBadge className="bg-white text-green-700">{confirmation.reference}</PublicBadge>
                  <PublicBadge className="bg-white text-brand-blue">{confirmation.status}</PublicBadge>
                  <PublicBadge className="bg-white text-amber-700">{confirmation.documentStatus}</PublicBadge>
                </div>
                <p className="mt-3 text-[14px] leading-7 text-slate-700">
                  {confirmation.facilityName} for {formatDateTime(confirmation.reservationDate, confirmation.startTime, confirmation.endTime)} is now pending review.
                </p>
              </div>
            </PublicSection>
          ) : null}
        </section>
      </main>
    </PublicPageShell>
  );
}

function FacilityBrowserCard({ facility, selected, onSelect, onRequest }) {
  const availability = getFacilityAvailabilityPublic(facility);

  return (
    <article
      onClick={onSelect}
      className={`rounded-[28px] border p-6 shadow-soft transition-colors cursor-pointer ${
        selected ? "border-brand-blue/20 bg-brand-blue-light/45" : "border-white/75 bg-white/90 hover:border-brand-blue/10 hover:bg-brand-blue-light/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PublicBadge className={statusBadgeClasses[availability] ?? "bg-slate-100 text-slate-600"}>{availability}</PublicBadge>
        <PublicBadge className="bg-slate-100 text-slate-600">{facility.type}</PublicBadge>
      </div>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{facility.name}</h3>
          <p className="mt-2 text-[14px] leading-7 text-slate-600">{facility.description}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRequest();
          }}
          className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
        >
          Request Facility
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile icon={MapPin} label="Location" value={facility.location} />
        <InfoTile icon={Users} label="Capacity" value={`${facility.capacity} people`} />
        <InfoTile icon={Clock3} label="Hours" value={facility.operatingHours} />
        <InfoTile icon={CalendarDays} label="Activities" value={facility.sports.join(", ")} />
      </div>
    </article>
  );
}

function TrackingPanel({ tracking, setTracking, onSubmit }) {
  return (
    <PublicSection
      title="Track an existing request"
      description="Enter the same reference code and email used during submission."
      icon={SearchCheck}
    >
      <form className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
        <TextInput
          value={tracking.reference}
          onChange={(event) => setTracking((current) => ({ ...current, reference: event.target.value, message: "" }))}
          placeholder="FAC-ABC123"
        />
        <TextInput
          type="email"
          value={tracking.email}
          onChange={(event) => setTracking((current) => ({ ...current, email: event.target.value, message: "" }))}
          placeholder="email@example.com"
        />
        <PrimaryButton type="submit" className="px-5 py-3">
          Track Request
        </PrimaryButton>
      </form>

      {tracking.message ? (
        <div className="mt-5">
          <EmptyState icon={FileText} title="Request not found" description={tracking.message} />
        </div>
      ) : null}

      {tracking.result ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[24px] border border-brand-blue/10 bg-brand-blue-light/50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <PublicBadge className="bg-white text-brand-blue">{tracking.result.reference}</PublicBadge>
              <PublicBadge className={getRequestStatusMeta(tracking.result.status)}>{tracking.result.status}</PublicBadge>
              <PublicBadge className={getDocumentStatusMeta(tracking.result.documentStatus)}>{tracking.result.documentStatus}</PublicBadge>
            </div>
            <p className="mt-4 text-[14px] font-black text-slate-950">{tracking.result.activityName}</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">
              {tracking.result.facilityName} | {formatPublicDateTime(tracking.result.reservationDate, tracking.result.startTime, tracking.result.endTime)}
            </p>
            {tracking.result.reviewNote ? (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Review note</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-700">{tracking.result.reviewNote}</p>
              </div>
            ) : null}
            {tracking.result.missingDocuments?.length ? (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Missing documents</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tracking.result.missingDocuments.map((document) => (
                    <span key={document} className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
                      {document}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {tracking.result.nextSteps ? (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Next steps</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-700">{tracking.result.nextSteps}</p>
              </div>
            ) : null}
          </div>
          <StatusTimeline title="Request timeline" items={makeTimelineItems(tracking.result.activityLog)} />
        </div>
      ) : null}
    </PublicSection>
  );
}

function FacilityStepContent({
  currentStep,
  selectedFacility,
  selectedDate,
  form,
  errors,
  requiredDocuments,
  updateForm,
}) {
  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <ActionHint>You're requesting {selectedFacility?.name || "a facility"}.</ActionHint>
        <div className="grid gap-4 sm:grid-cols-2">
          <StepCard title="Facility" body={selectedFacility?.name || "Select a facility above."} />
          <StepCard title="Location" body={selectedFacility?.location || "Pending"} />
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" error={errors.reservationDate}>
            <TextInput type="date" value={form.reservationDate || selectedDate} onChange={(event) => updateForm("reservationDate", event.target.value)} />
          </Field>
          <Field label="Start time" error={errors.startTime}>
            <TextInput type="time" value={form.startTime} onChange={(event) => updateForm("startTime", event.target.value)} />
          </Field>
          <Field label="End time" error={errors.endTime}>
            <TextInput type="time" value={form.endTime} onChange={(event) => updateForm("endTime", event.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Requester name" error={errors.requesterName}>
          <TextInput value={form.requesterName} onChange={(event) => updateForm("requesterName", event.target.value)} placeholder="Juan Dela Cruz" />
        </Field>
        <Field label="Requester type" error={errors.requesterType}>
          <SelectInput value={form.requesterType} onChange={(event) => updateForm("requesterType", event.target.value)}>
            <option>External/Outsider</option>
            <option>Partner Organization</option>
            <option>Student Organization</option>
          </SelectInput>
        </Field>
        <Field label="Organization" error={errors.organization}>
          <TextInput value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} placeholder="Organization or group" />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="requester@example.com" />
        </Field>
        <Field label="Contact number" error={errors.contactNumber}>
          <TextInput value={form.contactNumber} onChange={(event) => updateForm("contactNumber", event.target.value)} placeholder="+63 917 000 0000" />
        </Field>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <Field label="Activity name" error={errors.activityName}>
            <TextInput value={form.activityName} onChange={(event) => updateForm("activityName", event.target.value)} placeholder="Community sports clinic" />
          </Field>
          <Field label="Participants" error={errors.participantCount}>
            <TextInput type="number" min="1" value={form.participantCount} onChange={(event) => updateForm("participantCount", event.target.value)} placeholder="50" />
          </Field>
        </div>
        <Field label="Activity description" error={errors.description}>
          <TextArea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Briefly describe the activity and intended use." />
        </Field>
        <Field label="Equipment or setup needs">
          <TextArea value={form.equipmentNeeds} onChange={(event) => updateForm("equipmentNeeds", event.target.value)} placeholder="Chairs, scoreboard, first aid table, security coordination..." />
        </Field>
        <Field label="Additional notes">
          <TextArea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Anything the athletics office should know." />
        </Field>
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="rounded-[24px] border border-border-subtle bg-slate-50/80 p-5">
        <h3 className="text-[15px] font-black text-slate-950">Required documents</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {requiredDocuments.length ? (
            requiredDocuments.map((document) => (
              <span
                key={document.id}
                className={`rounded-full px-3 py-2 text-[12px] font-bold ${
                  document.required ? "bg-brand-gold-light text-brand-gold-hover" : "bg-white text-slate-600"
                }`}
              >
                {document.name}{document.required ? " required" : " optional"}
              </span>
            ))
          ) : (
            <p className="text-[13px] leading-6 text-slate-500">No special document list is currently published.</p>
          )}
        </div>
        <label className="mt-5 flex items-start gap-3 text-[13px] font-medium leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={form.documentsAcknowledged}
            onChange={(event) => updateForm("documentsAcknowledged", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border-subtle accent-brand-blue"
          />
          I understand that athletics staff may request the listed documents before approval.
        </label>
        {errors.documentsAcknowledged ? <p className="mt-2 text-[11px] text-red-600">{errors.documentsAcknowledged}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StepCard title="Facility" body={selectedFacility?.name} />
      <StepCard title="Schedule" body={formatPublicDateTime(form.reservationDate, form.startTime, form.endTime)} />
      <StepCard title="Requester" body={`${form.requesterName} | ${form.organization || form.requesterType}`} />
      <StepCard title="Activity" body={form.activityName || "Pending"} />
      <StepCard title="Participants" body={form.participantCount || "Pending"} />
      <StepCard title="Documents" body={form.documentsAcknowledged ? "Acknowledged" : "Needs confirmation"} />
    </div>
  );
}

function StepCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 text-[13px] leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-[13px] font-bold leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full appearance-none rounded-full border border-border-subtle bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-600 outline-none"
    >
      {children}
    </select>
  );
}

function buildAvailableSlots(facility, selectedDate, reservations, maintenance) {
  if (!facility) return [];
  if (maintenance.length) return [];

  const baseSlots = ["06:00", "08:00", "10:00", "13:00", "15:00", "17:00"].map((startTime) => ({
    date: selectedDate,
    startTime,
    endTime: `${String(Number(startTime.slice(0, 2)) + 2).padStart(2, "0")}:00`,
  }));

  return baseSlots.filter((slot) => {
    return !reservations.some((reservation) =>
      reservation.startTime < slot.endTime && reservation.endTime > slot.startTime && ["Approved", "Pending Review"].includes(reservation.status),
    );
  });
}

function validateFacilityStep(step, form) {
  const errors = {};
  if (step === 2) {
    if (!form.reservationDate) errors.reservationDate = "Choose a date.";
    if (!form.startTime) errors.startTime = "Choose a start time.";
    if (!form.endTime) errors.endTime = "Choose an end time.";
  }
  if (step === 3) {
    ["requesterName", "requesterType", "organization", "email", "contactNumber"].forEach((field) => {
      if (!String(form[field] ?? "").trim()) errors[field] = "This field is required.";
    });
  }
  if (step === 4) {
    ["activityName", "participantCount", "description"].forEach((field) => {
      if (!String(form[field] ?? "").trim()) errors[field] = "This field is required.";
    });
  }
  if (step === 5 && !form.documentsAcknowledged) {
    errors.documentsAcknowledged = "Confirm that you can submit the listed documents.";
  }
  return errors;
}

function buildFacilitySubmission(form, facility, requiredDocuments) {
  const reference = makeReference("FAC");
  const missingDocuments = requiredDocuments.filter((document) => document.required).map((document) => document.name);
  return {
    reference,
    requesterName: form.requesterName.trim(),
    requesterType: form.requesterType,
    organization: form.organization.trim(),
    email: form.email.trim(),
    contactNumber: form.contactNumber.trim(),
    facilityId: facility?.id ?? form.facilityId,
    facilityName: facility?.name ?? "Selected facility",
    reservationDate: form.reservationDate,
    startTime: form.startTime,
    endTime: form.endTime,
    participantCount: Number(form.participantCount),
    activityName: form.activityName.trim(),
    description: form.description.trim(),
    equipmentNeeds: form.equipmentNeeds.trim(),
    status: "Pending Review",
    documentStatus: missingDocuments.length ? "Documents Needed" : "Submitted",
    missingDocuments,
    reviewNote: "",
    nextSteps: missingDocuments.length
      ? "Prepare the listed documents so the athletics office can complete review."
      : "Wait for the athletics office to review your submitted request.",
    activityLog: [
      `${formatPublicDate(defaultDate)} - Request submitted`,
      `${formatPublicDate(defaultDate)} - Waiting for athletics office review`,
    ],
    submittedAt: new Date().toISOString(),
  };
}

function normalizeFacilityRecord(record) {
  return {
    ...record,
    facilityId: record.facilityId ?? "",
    reference: record.reference ?? record.id ?? makeReference("FAC"),
    status: record.status ?? "Pending Review",
    documentStatus: record.documentStatus ?? "Documents Needed",
    missingDocuments: record.missingDocuments ?? [],
    activityLog: record.activityLog ?? [`${formatPublicDate(defaultDate)} - Request submitted`],
    nextSteps: record.nextSteps ?? "Wait for the athletics office to review your request.",
    reviewNote: record.reviewNote ?? "",
  };
}

function getFacilityAvailabilityPublic(facility) {
  if (!facility) return "Unavailable";
  if (facility.status === "Under Maintenance") return "Under Maintenance";
  if (facility.status === "Reserved") return "Reserved";
  if (facility.status === "Limited Use") return "Limited Use";
  return "Available";
}
