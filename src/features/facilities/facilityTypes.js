export const facilityTypes = [
  "Gymnasium",
  "Court",
  "Field",
  "Track",
  "Pool",
  "Training Room",
  "Fitness Room",
  "Multipurpose Hall",
  "Storage/Equipment Room",
  "Meeting Room",
  "Other",
];

export const facilityStatuses = [
  "Available",
  "Reserved",
  "Under Maintenance",
  "Closed",
  "Limited Use",
  "Unavailable",
];

export const reservationStatuses = [
  "Draft",
  "Pending Review",
  "Approved",
  "Rejected",
  "Cancelled",
  "Completed",
  "No Show",
];

export const requesterTypes = [
  "Internal",
  "Student Organization",
  "Staff",
  "Athlete/Coach",
  "External/Outsider",
  "Partner Organization",
];

export const maintenanceStatuses = ["Scheduled", "Ongoing", "Resolved", "Cancelled"];

export const facilitySports = [
  "Basketball",
  "Volleyball",
  "Football",
  "Track and Field",
  "Swimming",
  "Tennis",
  "Badminton",
  "Strength and Conditioning",
  "General Athletics",
];

export const defaultFacilityFilters = {
  search: "",
  type: "All types",
  status: "All statuses",
  sport: "All sports",
  location: "All locations",
  availability: "Any availability",
  capacity: "Any capacity",
  sort: "Recently updated",
};

export const emptyFacilityForm = {
  name: "",
  type: "Gymnasium",
  location: "",
  capacity: "",
  status: "Available",
  sportsText: "",
  operatingHours: "Mon-Sat, 6:00 AM - 9:00 PM",
  contactPerson: "",
  managingOffice: "Athletics Department",
  description: "",
  rulesSummary: "",
};

export const emptyReservationForm = {
  requesterName: "",
  requesterType: "Internal",
  organization: "",
  email: "",
  contactNumber: "",
  facilityId: "",
  reservationDate: "",
  startTime: "",
  endTime: "",
  participantCount: "",
  activityName: "",
  description: "",
  useType: "Internal",
  equipmentNeeds: "",
  notes: "",
  documentsAcknowledged: false,
};

export const emptyMaintenanceForm = {
  facilityId: "",
  title: "",
  reason: "",
  startDate: "",
  endDate: "",
  startTime: "08:00",
  endTime: "17:00",
  status: "Scheduled",
  createdBy: "Athletics Staff",
  notes: "",
};

export const emptyNoteForm = {
  title: "",
  body: "",
  visibility: "Public",
  author: "Athletics Staff",
};

export const statusBadgeClasses = {
  Available: "bg-green-50 text-green-700",
  Reserved: "bg-brand-blue-light text-brand-blue",
  "Under Maintenance": "bg-brand-gold-light text-brand-gold-hover",
  Closed: "bg-red-50 text-red-700",
  "Limited Use": "bg-amber-50 text-amber-700",
  Unavailable: "bg-slate-100 text-slate-600",
};

export const reservationBadgeClasses = {
  Draft: "bg-slate-100 text-slate-600",
  "Pending Review": "bg-amber-50 text-amber-700",
  Approved: "bg-brand-blue-light text-brand-blue",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
  Completed: "bg-green-50 text-green-700",
  "No Show": "bg-red-50 text-red-700",
};

export const maintenanceBadgeClasses = {
  Scheduled: "bg-brand-blue-light text-brand-blue",
  Ongoing: "bg-brand-gold-light text-brand-gold-hover",
  Resolved: "bg-green-50 text-green-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

export const documentBadgeClasses = {
  Missing: "bg-red-50 text-red-700",
  Submitted: "bg-brand-blue-light text-brand-blue",
  "Pending Review": "bg-amber-50 text-amber-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  Optional: "bg-slate-100 text-slate-600",
};

export function formatDate(value) {
  if (!value) return "Pending";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date, startTime, endTime) {
  return `${formatDate(date)} | ${toTwelveHour(startTime)} - ${toTwelveHour(endTime)}`;
}

export function toTwelveHour(value) {
  if (!value) return "Pending";
  const [hourString, minuteString = "00"] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:${minuteString} ${suffix}`;
}

export function getReservationDateTime(reservation) {
  return formatDateTime(reservation.reservationDate, reservation.startTime, reservation.endTime);
}

export function isToday(value) {
  if (!value) return false;
  const today = new Date().toISOString().slice(0, 10);
  return value === today;
}

export function getFacilityAvailability(facility, reservations = [], maintenance = []) {
  if (["Under Maintenance", "Closed", "Unavailable"].includes(facility.status)) return facility.status;

  const todayReservations = reservations.filter(
    (reservation) =>
      reservation.facilityId === facility.id &&
      reservation.reservationDate === new Date().toISOString().slice(0, 10) &&
      ["Approved", "Pending Review"].includes(reservation.status),
  );

  const activeBlockout = maintenance.some(
    (record) =>
      record.facilityId === facility.id &&
      ["Scheduled", "Ongoing"].includes(record.status) &&
      record.startDate <= new Date().toISOString().slice(0, 10) &&
      record.endDate >= new Date().toISOString().slice(0, 10),
  );

  if (activeBlockout) return "Under Maintenance";
  if (todayReservations.length) return "Reserved";
  return facility.status || "Available";
}

export function getNextReservation(facilityId, reservations = []) {
  const now = new Date();
  return [...reservations]
    .filter((reservation) => reservation.facilityId === facilityId)
    .filter((reservation) => ["Pending Review", "Approved"].includes(reservation.status))
    .filter((reservation) => new Date(`${reservation.reservationDate}T${reservation.endTime}`) >= now)
    .sort(
      (left, right) =>
        new Date(`${left.reservationDate}T${left.startTime}`) -
        new Date(`${right.reservationDate}T${right.startTime}`),
    )[0];
}

export function validateFacilityForm(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Facility name is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!values.capacity || Number.isNaN(Number(values.capacity)) || Number(values.capacity) <= 0) {
    errors.capacity = "Capacity must be a positive number.";
  }
  if (!values.contactPerson.trim()) errors.contactPerson = "Contact person is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  return errors;
}

export function validateReservationForm(values) {
  const errors = {};
  const requiredFields = [
    "requesterName",
    "requesterType",
    "organization",
    "email",
    "contactNumber",
    "facilityId",
    "reservationDate",
    "startTime",
    "endTime",
    "participantCount",
    "activityName",
    "description",
  ];

  requiredFields.forEach((field) => {
    if (!String(values[field] ?? "").trim()) errors[field] = "This field is required.";
  });

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.contactNumber && !/^[0-9+\-\s()]{7,20}$/.test(values.contactNumber)) {
    errors.contactNumber = "Enter a valid contact number.";
  }

  const participantCount = Number(values.participantCount);
  if (Number.isNaN(participantCount) || participantCount <= 0) {
    errors.participantCount = "Participant count must be greater than zero.";
  }

  if (values.reservationDate && values.startTime && values.endTime) {
    const start = new Date(`${values.reservationDate}T${values.startTime}`);
    const end = new Date(`${values.reservationDate}T${values.endTime}`);
    if (end <= start) errors.endTime = "End time must be after start time.";
  }

  return errors;
}

export function validateMaintenanceForm(values) {
  const errors = {};
  if (!values.facilityId) errors.facilityId = "Choose a facility.";
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.reason.trim()) errors.reason = "Reason is required.";
  if (!values.startDate) errors.startDate = "Start date is required.";
  if (!values.endDate) errors.endDate = "End date is required.";
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = "End date cannot be before start date.";
  }
  if (values.startDate === values.endDate && values.startTime && values.endTime && values.endTime <= values.startTime) {
    errors.endTime = "End time must be after start time.";
  }
  return errors;
}

export function validateNoteForm(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.body.trim()) errors.body = "Note body is required.";
  return errors;
}
