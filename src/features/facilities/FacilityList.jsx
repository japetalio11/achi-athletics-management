import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  addMonths,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  parse,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Archive,
  Building2,
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
  Filter,
  ListChecks,
  MapPin,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Modal";
import {
  defaultFacilityFilters,
  documentBadgeClasses,
  facilitySports,
  facilityStatuses,
  facilityTypes,
  formatDate,
  getFacilityAvailability,
  getNextReservation,
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

const viewTabs = [
  { id: "facilities", label: "Facilities", icon: Building2 },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "requests", label: "Reservation Requests", icon: ListChecks },
];

const facilityVisuals = {
  Gymnasium: {
    icon: Building2,
    accentClass: "from-brand-blue via-slate-800 to-brand-blue-hover",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Indoor venue",
  },
  Court: {
    icon: CalendarDays,
    accentClass: "from-brand-blue to-sky-700",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Match-ready space",
  },
  Field: {
    icon: MapPin,
    accentClass: "from-emerald-700 to-emerald-500",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Outdoor ground",
  },
  Track: {
    icon: CalendarCheck,
    accentClass: "from-violet-700 to-brand-blue",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Training lanes",
  },
  Pool: {
    icon: Clock3,
    accentClass: "from-cyan-700 to-sky-500",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Aquatics area",
  },
  "Training Room": {
    icon: Users,
    accentClass: "from-slate-800 to-slate-600",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Performance zone",
  },
  "Fitness Room": {
    icon: Users,
    accentClass: "from-slate-800 to-slate-600",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Conditioning area",
  },
  "Multipurpose Hall": {
    icon: Building2,
    accentClass: "from-amber-700 to-brand-gold-hover",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Flexible venue",
  },
};

const calendarLegend = [
  { label: "Available", toneClass: "bg-green-500" },
  { label: "Pending request", toneClass: "bg-amber-500" },
  { label: "Approved reservation", toneClass: "bg-brand-blue" },
  { label: "Fully booked", toneClass: "bg-violet-600" },
  { label: "Maintenance / unavailable", toneClass: "bg-brand-gold-hover" },
];

export function FacilityList({
  facilities,
  reservations,
  canManageFacilities,
  onSelectFacility,
  onSelectReservation,
  onOpenModal,
}) {
  const [filters, setFilters] = useState(defaultFacilityFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeView, setActiveView] = useState("facilities");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date("2026-05-15T00:00:00"));

  const activeFacilities = facilities.filter((facility) => !facility.archived);
  const allMaintenance = facilities.flatMap((facility) => facility.maintenanceRecords ?? []);

  const filteredFacilities = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return activeFacilities
      .filter((facility) => {
        const availability = getFacilityAvailability(facility, reservations, allMaintenance);
        const nextReservation = getNextReservation(facility.id, reservations);
        const searchableText = [
          facility.name,
          facility.id,
          facility.type,
          facility.location,
          facility.capacity,
          facility.status,
          availability,
          facility.sports.join(" "),
          nextReservation?.activityName,
          nextReservation?.requesterName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !search || searchableText.includes(search);
        const matchesType = filters.type === "All types" || facility.type === filters.type;
        const matchesStatus = filters.status === "All statuses" || facility.status === filters.status;
        const matchesSport = filters.sport === "All sports" || facility.sports.includes(filters.sport);
        const matchesLocation = filters.location === "All locations" || facility.location === filters.location;
        const matchesAvailability = filters.availability === "Any availability" || availability === filters.availability;
        const matchesCapacity =
          filters.capacity === "Any capacity" ||
          (filters.capacity === "Under 100" && facility.capacity < 100) ||
          (filters.capacity === "100-499" && facility.capacity >= 100 && facility.capacity <= 499) ||
          (filters.capacity === "500+" && facility.capacity >= 500);

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus &&
          matchesSport &&
          matchesLocation &&
          matchesAvailability &&
          matchesCapacity
        );
      })
      .sort((left, right) => {
        if (filters.sort === "Name") return left.name.localeCompare(right.name);
        if (filters.sort === "Capacity") return right.capacity - left.capacity;
        if (filters.sort === "Status") return left.status.localeCompare(right.status);
        return new Date(right.updatedAt) - new Date(left.updatedAt);
      });
  }, [activeFacilities, allMaintenance, filters, reservations]);

  const locations = [...new Set(activeFacilities.map((facility) => facility.location))];
  const pendingRequests = reservations.filter((reservation) => reservation.status === "Pending Review");
  const todayKey = todayIso();
  const approvedToday = reservations.filter(
    (reservation) => reservation.reservationDate === todayKey && reservation.status === "Approved",
  );

  const summaryCards = [
    { label: "Total Facilities", value: activeFacilities.length, hint: "Athletics-managed spaces", icon: Building2 },
    {
      label: "Available Today",
      value: activeFacilities.filter((facility) => getFacilityAvailability(facility, reservations, allMaintenance) === "Available").length,
      hint: "No active blockout today",
      icon: CalendarCheck,
    },
    { label: "Pending Requests", value: pendingRequests.length, hint: "Need staff review", icon: FileQuestion },
    { label: "Reserved Today", value: approvedToday.length, hint: "Approved reservations", icon: Clock3 },
  ];

  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return Boolean(value.trim());
    return value !== defaultFacilityFilters[key];
  });

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters(defaultFacilityFilters);

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Facilities Reservation Hub</h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Browse athletics facilities, manage availability, and process reservation requests in local frontend state.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onOpenModal({ type: "reservation-form", mode: "add" })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Reserve Facility
          </button>
          {canManageFacilities ? (
            <button
              type="button"
              onClick={() => onOpenModal({ type: "facility-form", mode: "add" })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2.5 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5 text-slate-400" />
              Add Facility
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">{card.value}</p>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">{card.hint}</p>
            </section>
          );
        })}
      </div>

      <section className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="group relative flex-1">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="Search name, ID, type, location, sport, capacity, status..."
                className="w-full rounded-full border border-border-subtle/60 bg-slate-50 py-2.5 pl-10 pr-4 text-[12px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
              />
            </div>
            <select value={filters.type} onChange={(event) => setFilter("type", event.target.value)} className="rounded-full border border-border-subtle/60 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-600 outline-none">
              <option>All types</option>
              {facilityTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)} className="rounded-full border border-border-subtle/60 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-600 outline-none">
              <option>All statuses</option>
              {facilityStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {viewTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition-colors ${
                    active ? "bg-brand-blue text-white shadow-soft" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-5 grid gap-3 rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Sport" value={filters.sport} onChange={(value) => setFilter("sport", value)}>
              <option>All sports</option>
              {facilitySports.map((sport) => <option key={sport}>{sport}</option>)}
            </FilterSelect>
            <FilterSelect label="Location" value={filters.location} onChange={(value) => setFilter("location", value)}>
              <option>All locations</option>
              {locations.map((location) => <option key={location}>{location}</option>)}
            </FilterSelect>
            <FilterSelect label="Availability" value={filters.availability} onChange={(value) => setFilter("availability", value)}>
              <option>Any availability</option>
              {facilityStatuses.map((status) => <option key={status}>{status}</option>)}
            </FilterSelect>
            <FilterSelect label="Capacity" value={filters.capacity} onChange={(value) => setFilter("capacity", value)}>
              <option>Any capacity</option>
              <option>Under 100</option>
              <option>100-499</option>
              <option>500+</option>
            </FilterSelect>
            <FilterSelect label="Sort" value={filters.sort} onChange={(value) => setFilter("sort", value)}>
              <option>Recently updated</option>
              <option>Name</option>
              <option>Capacity</option>
              <option>Status</option>
            </FilterSelect>
          </div>
        )}
      </section>

      {activeFilterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-border-subtle/60 bg-surface-card p-3 shadow-soft">
          {activeFilterEntries.map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key, defaultFacilityFilters[key])}
              className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[11px] font-bold text-brand-blue transition-colors hover:bg-slate-100"
            >
              {key}: {value}
            </button>
          ))}
          <button type="button" onClick={resetFilters} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        </div>
      )}

      {activeView === "facilities" && (
        <FacilitiesGrid
          facilities={filteredFacilities}
          reservations={reservations}
          maintenance={allMaintenance}
          canManageFacilities={canManageFacilities}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSelectFacility={onSelectFacility}
          onOpenModal={onOpenModal}
          onResetFilters={resetFilters}
        />
      )}

      {activeView === "schedule" && (
        <ScheduleView
          facilities={activeFacilities}
          reservations={reservations}
          maintenance={allMaintenance}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSelectReservation={onSelectReservation}
          onOpenModal={onOpenModal}
        />
      )}

      {activeView === "requests" && (
        <RequestsView
          reservations={reservations}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSelectReservation={onSelectReservation}
          onOpenModal={onOpenModal}
        />
      )}
    </div>
  );
}

function FacilitiesGrid({
  facilities,
  reservations,
  maintenance,
  canManageFacilities,
  openMenuId,
  setOpenMenuId,
  onSelectFacility,
  onOpenModal,
  onResetFilters,
}) {
  if (!facilities.length) {
    return (
      <EmptyState
        title="No facilities match these filters"
        body="Try a broader search, remove a filter, or reset the facility view."
        action={<SecondaryButton onClick={onResetFilters}><RotateCcw className="h-3.5 w-3.5" />Reset filters</SecondaryButton>}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-border-subtle/40 bg-surface-card px-5 py-4 shadow-soft">
        <p className="text-[12px] font-semibold text-slate-600">
          Showing {facilities.length} facility record{facilities.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {facilities.map((facility) => {
          const availability = getFacilityAvailability(facility, reservations, maintenance);
          const nextReservation = getNextReservation(facility.id, reservations);
          const visual = getFacilityVisual(facility, availability);
          const Icon = visual.icon;
          const menuId = `facility-${facility.id}`;
          const openFacilityDetails = () => onSelectFacility(facility);
          const handleCardKeyDown = (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;

            event.preventDefault();
            openFacilityDetails();
          };

          return (
            <article
              key={facility.id}
              role="button"
              tabIndex={0}
              onClick={openFacilityDetails}
              onKeyDown={handleCardKeyDown}
              className="overflow-hidden rounded-[26px] border border-border-subtle/50 bg-surface-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <div className={`relative h-64 w-full overflow-hidden bg-gradient-to-br ${visual.accentClass} p-6 text-white`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),linear-gradient(140deg,transparent,rgba(255,255,255,0.08))]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${visual.chipClass}`}>
                        {visual.eyebrow}
                      </p>
                      <p className="mt-3 text-[12px] font-semibold text-white/80">{facility.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white shadow-lg shadow-slate-950/10 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ActionMenu
                        label={`Actions for ${facility.name}`}
                        open={openMenuId === menuId}
                        onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                        onClose={() => setOpenMenuId(null)}
                        iconOrientation="vertical"
                        buttonClassName="!border-0 !bg-white/14 !text-white/88 !shadow-none backdrop-blur-sm hover:!bg-white/18 hover:!text-white"
                        items={[
                          { label: "Reserve Facility", icon: CalendarPlus, onClick: () => onOpenModal({ type: "reservation-form", mode: "add", facility }) },
                          { label: "View Reservations", icon: ListChecks, onClick: () => onSelectFacility(facility, "reservations") },
                          ...(canManageFacilities
                            ? [
                                { label: "Edit Facility", icon: PencilLine, onClick: () => onOpenModal({ type: "facility-form", mode: "edit", facility }) },
                                { label: "Add Maintenance Blockout", icon: Wrench, onClick: () => onOpenModal({ type: "maintenance-form", mode: "add", facility }) },
                                { label: "Archive Facility", icon: Archive, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "archive-facility", facility }) },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openFacilityDetails();
                    }}
                    className="block text-left"
                  >
                    <h2 className="max-w-[18rem] line-clamp-2 text-[22px] font-bold tracking-tight">{facility.name}</h2>
                    <p className="mt-2 max-w-[22rem] line-clamp-3 text-sm leading-6 text-white/82">
                      {facility.rulesSummary || facility.description}
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value={facility.type} className="bg-slate-100 text-slate-600" />
                  <Badge value={availability} className={statusBadgeClasses[availability] ?? "bg-slate-100 text-slate-600"} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FacilityMeta icon={MapPin} label="Location" value={facility.location} />
                  <FacilityMeta icon={Users} label="Capacity" value={`${facility.capacity} people`} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Sports / use cases</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {facility.sports.join(", ")}
                  </p>
                </div>

                <div className="rounded-[22px] border border-border-subtle/60 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Next reservation</p>
                      <p className="mt-2 text-[14px] font-bold text-slate-900">
                        {nextReservation ? nextReservation.activityName : "No upcoming reservation"}
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-slate-500">
                        {nextReservation
                          ? `${formatDate(nextReservation.reservationDate)} | ${toTwelveHour(nextReservation.startTime)} - ${toTwelveHour(nextReservation.endTime)}`
                          : "This facility is currently open for new reservation requests."}
                      </p>
                    </div>
                    {nextReservation ? (
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue shadow-soft">
                        Upcoming
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleView({
  facilities,
  reservations,
  maintenance,
  currentDate,
  setCurrentDate,
  openMenuId,
  setOpenMenuId,
  onSelectReservation,
  onOpenModal,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date("2026-05-15T00:00:00"));
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const facilityMap = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities],
  );

  const dayMetaMap = useMemo(() => buildDayMetaMap(reservations, maintenance), [reservations, maintenance]);

  const calendarEvents = useMemo(
    () => [
      ...reservations.map((reservation) => ({
        id: reservation.id,
        title: reservation.activityName,
        start: new Date(`${reservation.reservationDate}T${reservation.startTime}`),
        end: new Date(`${reservation.reservationDate}T${reservation.endTime}`),
        resource: { type: "reservation", reservation },
      })),
      ...maintenance.map((record) => ({
        id: record.id,
        title: record.title,
        start: new Date(`${record.startDate}T${record.startTime}`),
        end: new Date(`${record.endDate}T${record.endTime}`),
        resource: { type: "maintenance", record },
      })),
    ],
    [maintenance, reservations],
  );

  const monthSummaryCards = useMemo(() => {
    const currentMonthKey = format(currentDate, "yyyy-MM");
    const todayKey = todayIso();
    const todayReservations = reservations.filter(
      (reservation) =>
        reservation.reservationDate === todayKey &&
        ["Approved", "Pending Review"].includes(reservation.status),
    );
    const pending = reservations.filter((reservation) => reservation.status === "Pending Review");
    const underMaintenanceCount = new Set(
      maintenance
        .filter((record) => ["Scheduled", "Ongoing"].includes(record.status))
        .map((record) => record.facilityId),
    ).size;
    const monthBookings = reservations.filter(
      (reservation) =>
        reservation.reservationDate.startsWith(currentMonthKey) &&
        ["Approved", "Pending Review", "Completed"].includes(reservation.status),
    );

    return [
      { label: "Today's Reservations", value: todayReservations.length, hint: "Approved and pending uses", icon: CalendarCheck },
      { label: "Pending Requests", value: pending.length, hint: "Need schedule review", icon: FileQuestion },
      { label: "Under Maintenance", value: underMaintenanceCount, hint: "Facilities with active blockouts", icon: Wrench },
      { label: "This Month's Bookings", value: monthBookings.length, hint: format(currentDate, "MMMM yyyy"), icon: Clock3 },
    ];
  }, [currentDate, maintenance, reservations]);

  const selectedDateKey = dateToIso(selectedDate);
  const selectedDayMeta = dayMetaMap.get(selectedDateKey) ?? emptyDayMeta();
  const selectedDayReservations = reservations
    .filter((reservation) => reservation.reservationDate === selectedDateKey)
    .sort((left, right) => `${left.startTime}`.localeCompare(`${right.startTime}`));
  const selectedDayMaintenance = maintenance
    .filter((record) => record.startDate <= selectedDateKey && record.endDate >= selectedDateKey)
    .sort((left, right) => `${left.startDate}${left.startTime}`.localeCompare(`${right.startDate}${right.startTime}`));

  const selectedReservation = selectedEntryId?.startsWith("reservation:")
    ? reservations.find((reservation) => reservation.id === selectedEntryId.replace("reservation:", ""))
    : null;

  const selectedReservationFacility = selectedReservation
    ? facilityMap.get(selectedReservation.facilityId)
    : null;

  const dateCellWrapper = ({ children, value }) => {
    const meta = dayMetaMap.get(dateToIso(value)) ?? emptyDayMeta();
    return <ScheduleDateCellWrapper value={value} meta={meta}>{children}</ScheduleDateCellWrapper>;
  };

  const dayPropGetter = (date) => {
    const classes = [];
    if (isSameDay(date, selectedDate)) classes.push("facility-calendar__day--selected");
    if (dayMetaMap.get(dateToIso(date))?.isFullyBooked) classes.push("facility-calendar__day--busy");
    if (dayMetaMap.get(dateToIso(date))?.maintenanceCount) classes.push("facility-calendar__day--maintenance");
    return { className: classes.join(" ") };
  };

  const openReservationForDate = (reservation) => {
    setSelectedDate(new Date(`${reservation.reservationDate}T00:00:00`));
    setSelectedEntryId(`reservation:${reservation.id}`);
    onSelectReservation(reservation);
  };

  const navigateMonth = (direction) => setCurrentDate((current) => addMonths(current, direction));
  const jumpToToday = () => {
    const today = new Date("2026-05-15T00:00:00");
    setCurrentDate(today);
    setSelectedDate(today);
    setSelectedEntryId(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {monthSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">{card.value}</p>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">{card.hint}</p>
            </section>
          );
        })}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_390px]">
        <div className="rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-5 border-b border-border-subtle/70 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-slate-950">Facility Schedule</h2>
                <p className="mt-1 text-sm text-slate-500">Follow reservations, pending requests, and maintenance windows from one calendar view.</p>
              </div>
              <PrimaryButton onClick={() => onOpenModal({ type: "reservation-form", mode: "add" })}>
                <CalendarPlus className="h-4 w-4" />
                Reserve Time
              </PrimaryButton>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Current month</p>
                <h3 className="mt-1 text-[24px] font-bold tracking-tight text-slate-950">{format(currentDate, "MMMM yyyy")}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
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
                  onClick={() => navigateMonth(1)}
                  aria-label="Next month"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle/70 bg-white text-slate-500 shadow-soft transition-colors hover:bg-slate-50 hover:text-brand-blue"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {calendarLegend.map((item) => (
                <LegendBadge key={item.label} label={item.label} toneClass={item.toneClass} />
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-border-subtle/70">
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
              className="adnu-events-calendar facility-calendar"
              style={{ minHeight: 650 }}
              onSelectEvent={(event) => {
                if (event.resource.type === "reservation") {
                  setSelectedDate(new Date(`${event.resource.reservation.reservationDate}T00:00:00`));
                  setSelectedEntryId(`reservation:${event.resource.reservation.id}`);
                  onSelectReservation(event.resource.reservation);
                  return;
                }
                setSelectedDate(new Date(`${event.resource.record.startDate}T00:00:00`));
                setSelectedEntryId(`maintenance:${event.resource.record.id}`);
                onOpenModal({ type: "maintenance-form", mode: "edit", record: event.resource.record });
              }}
              onSelectSlot={(slotInfo) => {
                setSelectedDate(slotInfo.start);
                setSelectedEntryId(null);
              }}
              eventPropGetter={(event) => ({
                className: getScheduleEventClassName(event.resource),
              })}
              dayPropGetter={dayPropGetter}
              components={{
                event: ScheduleCalendarEvent,
                dateCellWrapper,
              }}
              formats={{
                weekdayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "EEE", culture).toUpperCase(),
                dayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "d", culture),
              }}
            />
          </div>
        </div>

        <aside className="rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Selected date</p>
              <h2 className="mt-1 text-[22px] font-bold tracking-tight text-slate-950">{format(selectedDate, "EEEE, MMMM d")}</h2>
              <p className="mt-1 text-sm text-slate-500">{getSelectedDateSummary(selectedDayMeta)}</p>
            </div>
            <Badge value={getPrimaryAvailabilityLabel(selectedDayMeta)} className={getPrimaryAvailabilityClass(selectedDayMeta)} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <ScheduleStat label="Approved" value={selectedDayMeta.approvedCount} toneClass="text-brand-blue" />
            <ScheduleStat label="Pending" value={selectedDayMeta.pendingCount} toneClass="text-amber-700" />
            <ScheduleStat label="Blockouts" value={selectedDayMeta.maintenanceCount} toneClass="text-brand-gold-hover" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => onOpenModal({ type: "reservation-form", mode: "add" })} className="flex-1 sm:flex-none">
              <CalendarPlus className="h-4 w-4" />
              Reserve time
            </PrimaryButton>
            {selectedReservation ? (
              <SecondaryButton onClick={() => onSelectReservation(selectedReservation)} className="flex-1 sm:flex-none">
                <Eye className="h-3.5 w-3.5" />
                View details
              </SecondaryButton>
            ) : null}
          </div>

          {selectedReservation ? (
            <div className="mt-5 rounded-[22px] border border-border-subtle/60 bg-slate-50/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Focused reservation</p>
              <p className="mt-2 text-[15px] font-bold text-slate-900">{selectedReservation.activityName}</p>
              <p className="mt-1 text-[13px] leading-6 text-slate-500">
                {selectedReservationFacility?.name ?? selectedReservation.facilityName} | {toTwelveHour(selectedReservation.startTime)} - {toTwelveHour(selectedReservation.endTime)}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-slate-500">
                {selectedReservation.requesterName} | {selectedReservation.requesterType}
              </p>
            </div>
          ) : null}

          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Reservations</h3>
                  <p className="mt-1 text-[12px] text-slate-500">Requests and approved uses on this date.</p>
                </div>
                <span className="rounded-full bg-brand-blue-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue">
                  {selectedDayReservations.length}
                </span>
              </div>
              <div className="space-y-3">
                {selectedDayReservations.length === 0 ? (
                  <InlineEmptyState title="No reservations scheduled" body="This date is currently open for new reservation requests." />
                ) : (
                  selectedDayReservations.map((reservation) => {
                    const menuId = `schedule-reservation-${reservation.id}`;
                    return (
                      <article
                        key={reservation.id}
                        className={`rounded-[22px] border p-4 transition-colors ${
                          selectedEntryId === `reservation:${reservation.id}`
                            ? "border-brand-blue/30 bg-brand-blue-light/30"
                            : "border-border-subtle/60 bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEntryId(`reservation:${reservation.id}`);
                              setSelectedDate(new Date(`${reservation.reservationDate}T00:00:00`));
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-[14px] font-bold text-slate-900">{reservation.activityName}</p>
                            <p className="mt-1 text-[12px] leading-5 text-slate-500">
                              {reservation.facilityName} | {toTwelveHour(reservation.startTime)} - {toTwelveHour(reservation.endTime)}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-slate-500">
                              {reservation.requesterName} | {reservation.requesterType}
                            </p>
                          </button>
                          <ActionMenu
                            label={`Actions for ${reservation.activityName}`}
                            open={openMenuId === menuId}
                            onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                            onClose={() => setOpenMenuId(null)}
                            items={[
                              { label: "View Details", icon: Eye, onClick: () => openReservationForDate(reservation) },
                              { label: "Upload Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "document-upload", reservation }) },
                              { label: "Edit Reservation", icon: PencilLine, onClick: () => onOpenModal({ type: "reservation-form", mode: "edit", reservation }) },
                              ...(reservation.status === "Pending Review"
                                ? [
                                    { label: "Approve Request", icon: CheckCircle2, onClick: () => onOpenModal({ type: "review", action: "approve", reservation }) },
                                    { label: "Reject Request", icon: XCircle, tone: "danger", onClick: () => onOpenModal({ type: "review", action: "reject", reservation }) },
                                  ]
                                : []),
                              { label: "Cancel Reservation", icon: CalendarX, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "cancel-reservation", reservation }) },
                            ]}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge value={reservation.status} className={reservationBadgeClasses[reservation.status]} />
                          <Badge value={reservation.documentStatus} className={documentBadgeClasses[reservation.documentStatus] ?? "bg-slate-100 text-slate-600"} />
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Maintenance / blockouts</h3>
                  <p className="mt-1 text-[12px] text-slate-500">Unavailable windows that affect bookings.</p>
                </div>
                <span className="rounded-full bg-brand-gold-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-hover">
                  {selectedDayMaintenance.length}
                </span>
              </div>
              <div className="space-y-3">
                {selectedDayMaintenance.length === 0 ? (
                  <InlineEmptyState title="No blockouts on this date" body="No maintenance or closure records overlap this schedule day." />
                ) : (
                  selectedDayMaintenance.map((record) => {
                    const facility = facilityMap.get(record.facilityId);
                    return (
                      <article key={record.id} className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-bold text-slate-900">{record.title}</p>
                            <p className="mt-1 text-[12px] leading-5 text-slate-500">
                              {facility?.name ?? "Facility blockout"} | {formatMaintenanceRange(record, selectedDateKey)}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-slate-500">{record.reason}</p>
                          </div>
                          <SecondaryButton onClick={() => onOpenModal({ type: "maintenance-form", mode: "edit", record })}>
                            <Wrench className="h-3.5 w-3.5" />
                            Edit
                          </SecondaryButton>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge value={record.status} className={getMaintenanceBadgeClass(record.status)} />
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function RequestsView({ reservations, openMenuId, setOpenMenuId, onSelectReservation, onOpenModal }) {
  if (!reservations.length) {
    return <EmptyState title="No reservations yet" body="Submitted facility reservation requests will appear here." />;
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
      <div className="border-b border-border-subtle/50 bg-slate-50/60 px-6 py-4">
        <p className="text-[12px] font-semibold text-slate-600">{reservations.length} reservation request{reservations.length === 1 ? "" : "s"}</p>
      </div>
      <div className="divide-y divide-border-subtle/60">
        {reservations.map((reservation) => {
          const menuId = `request-${reservation.id}`;
          return (
            <article key={reservation.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_0.9fr_0.8fr_0.8fr_auto] lg:items-center">
              <button type="button" onClick={() => onSelectReservation(reservation)} className="min-w-0 text-left">
                <p className="truncate font-bold text-slate-950">{reservation.activityName}</p>
                <p className="mt-1 text-[12px] text-brand-blue">{reservation.id} | {reservation.facilityName}</p>
                <p className="mt-2 text-[12px] text-slate-500">{reservation.requesterName} | {reservation.requesterType}</p>
              </button>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{formatDate(reservation.reservationDate)}</p>
                <p className="mt-1 text-[12px] text-slate-500">{toTwelveHour(reservation.startTime)} - {toTwelveHour(reservation.endTime)}</p>
              </div>
              <Badge value={reservation.status} className={reservationBadgeClasses[reservation.status]} />
              <Badge value={reservation.documentStatus} className={documentBadgeClasses[reservation.documentStatus] ?? "bg-slate-100 text-slate-600"} />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onSelectReservation(reservation)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-3.5 py-2 text-[11px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>
                <ActionMenu
                  label={`Actions for ${reservation.activityName}`}
                  open={openMenuId === menuId}
                  onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "View Details", icon: Eye, onClick: () => onSelectReservation(reservation) },
                    { label: "Upload Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "document-upload", reservation }) },
                    { label: "Edit Reservation", icon: PencilLine, onClick: () => onOpenModal({ type: "reservation-form", mode: "edit", reservation }) },
                    { label: "Approve Request", icon: CheckCircle2, onClick: () => onOpenModal({ type: "review", action: "approve", reservation }) },
                    { label: "Reject Request", icon: XCircle, tone: "danger", onClick: () => onOpenModal({ type: "review", action: "reject", reservation }) },
                    { label: "Request Documents", icon: FileQuestion, onClick: () => onOpenModal({ type: "review", action: "request-documents", reservation }) },
                    { label: "Cancel Reservation", icon: CalendarX, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "cancel-reservation", reservation }) },
                  ]}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleCalendarEvent({ event }) {
  if (event.resource.type === "maintenance") {
    return (
      <div className="space-y-0.5">
        <div className="truncate">{event.resource.record.title}</div>
        <div className="truncate text-[9px] font-semibold opacity-80">Unavailable</div>
      </div>
    );
  }

  const reservation = event.resource.reservation;
  return (
    <div className="space-y-0.5">
      <div className="truncate">{reservation.activityName}</div>
      <div className="truncate text-[9px] font-semibold opacity-80">
        {toTwelveHour(reservation.startTime)} - {toTwelveHour(reservation.endTime)}
      </div>
    </div>
  );
}

function ScheduleDateCellWrapper({ children, value, meta }) {
  const hasIndicators = meta.pendingCount || meta.approvedCount || meta.maintenanceCount;

  return (
    <div className="facility-calendar__date-wrap">
      {children}
      {hasIndicators ? (
        <div className="facility-calendar__date-indicators" aria-hidden="true">
          {meta.pendingCount ? <span className="facility-calendar__dot facility-calendar__dot--pending" /> : null}
          {meta.approvedCount ? <span className="facility-calendar__dot facility-calendar__dot--approved" /> : null}
          {meta.maintenanceCount ? <span className="facility-calendar__dot facility-calendar__dot--maintenance" /> : null}
          {meta.isFullyBooked ? <span className="facility-calendar__count">Full</span> : meta.totalReservations > 1 ? <span className="facility-calendar__count">{meta.totalReservations}</span> : null}
        </div>
      ) : null}
      {isSameDay(value, new Date("2026-05-15T00:00:00")) ? <span className="sr-only">Today</span> : null}
    </div>
  );
}

function FacilityMeta({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-border-subtle/60 bg-slate-50/70 p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-5 text-slate-800">{value}</p>
    </div>
  );
}

function ScheduleStat({ label, value, toneClass }) {
  return (
    <div className="rounded-[18px] border border-border-subtle/60 bg-slate-50/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-2 text-[18px] font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function LegendBadge({ label, toneClass }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-full ${toneClass}`} />
      {label}
    </span>
  );
}

function InlineEmptyState({ title, body }) {
  return (
    <div className="rounded-[22px] border border-dashed border-border-subtle/70 bg-slate-50/70 p-4">
      <p className="text-[13px] font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-[12px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-[12px] font-semibold text-slate-600 outline-none">
        {children}
      </select>
    </label>
  );
}

function Badge({ value, className }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${className}`}>
      {value}
    </span>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border-subtle bg-surface-card p-8 text-center shadow-soft">
      <p className="text-[15px] font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

function getFacilityVisual(facility, availability) {
  if (availability === "Under Maintenance" || availability === "Unavailable" || availability === "Closed") {
    return {
      icon: Wrench,
      accentClass: "from-slate-700 via-slate-800 to-slate-950",
      chipClass: "bg-white/18 text-white",
      eyebrow: "Unavailable",
    };
  }

  return facilityVisuals[facility.type] ?? {
    icon: Building2,
    accentClass: "from-brand-blue to-slate-700",
    chipClass: "bg-white/18 text-white",
    eyebrow: "Facility profile",
  };
}

function buildDayMetaMap(reservations, maintenance) {
  const map = new Map();

  const ensure = (dateKey) => {
    if (!map.has(dateKey)) {
      map.set(dateKey, emptyDayMeta());
    }
    return map.get(dateKey);
  };

  reservations.forEach((reservation) => {
    const meta = ensure(reservation.reservationDate);
    meta.totalReservations += 1;
    if (reservation.status === "Approved") meta.approvedCount += 1;
    if (reservation.status === "Pending Review") meta.pendingCount += 1;
    if (reservation.status === "Completed") meta.completedCount += 1;
  });

  maintenance.forEach((record) => {
    eachDayOfInterval({
      start: new Date(`${record.startDate}T00:00:00`),
      end: new Date(`${record.endDate}T00:00:00`),
    }).forEach((date) => {
      const meta = ensure(dateToIso(date));
      meta.maintenanceCount += 1;
    });
  });

  map.forEach((meta) => {
    meta.isFullyBooked = meta.approvedCount >= 3 || (meta.approvedCount >= 2 && meta.pendingCount >= 1);
  });

  return map;
}

function emptyDayMeta() {
  return {
    totalReservations: 0,
    approvedCount: 0,
    pendingCount: 0,
    completedCount: 0,
    maintenanceCount: 0,
    isFullyBooked: false,
  };
}

function getScheduleEventClassName(resource) {
  if (resource.type === "maintenance") return "facility-calendar__event facility-calendar__event--maintenance";

  const statusClass = String(resource.reservation.status).toLowerCase().replaceAll(" ", "-");
  return `facility-calendar__event facility-calendar__event--${statusClass}`;
}

function getSelectedDateSummary(meta) {
  if (meta.maintenanceCount) return "Maintenance or blockout activity affects this date.";
  if (meta.isFullyBooked) return "This date is heavily booked based on current reservation volume.";
  if (meta.approvedCount || meta.pendingCount) {
    return `${meta.approvedCount + meta.pendingCount} active reservation request${meta.approvedCount + meta.pendingCount === 1 ? "" : "s"} on the calendar.`;
  }
  return "No reservations or blockouts recorded for this date.";
}

function getPrimaryAvailabilityLabel(meta) {
  if (meta.maintenanceCount) return "Maintenance";
  if (meta.isFullyBooked) return "Fully Booked";
  if (meta.approvedCount) return "Reserved";
  if (meta.pendingCount) return "Pending";
  return "Available";
}

function getPrimaryAvailabilityClass(meta) {
  if (meta.maintenanceCount) return "bg-brand-gold-light text-brand-gold-hover";
  if (meta.isFullyBooked) return "bg-violet-50 text-violet-700";
  if (meta.approvedCount) return "bg-brand-blue-light text-brand-blue";
  if (meta.pendingCount) return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
}

function getMaintenanceBadgeClass(status) {
  if (status === "Ongoing") return "bg-brand-gold-light text-brand-gold-hover";
  if (status === "Resolved") return "bg-green-50 text-green-700";
  if (status === "Cancelled") return "bg-slate-100 text-slate-600";
  return "bg-brand-blue-light text-brand-blue";
}

function formatMaintenanceRange(record, selectedDateKey) {
  const startLabel = record.startDate === selectedDateKey ? toTwelveHour(record.startTime) : `${formatDate(record.startDate)} ${toTwelveHour(record.startTime)}`;
  const endLabel = record.endDate === selectedDateKey ? toTwelveHour(record.endTime) : `${formatDate(record.endDate)} ${toTwelveHour(record.endTime)}`;
  return `${startLabel} - ${endLabel}`;
}

function todayIso() {
  return "2026-05-15";
}

function dateToIso(date) {
  return format(date, "yyyy-MM-dd");
}
