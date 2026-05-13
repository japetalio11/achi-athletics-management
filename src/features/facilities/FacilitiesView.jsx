import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  addMonths,
  format,
  getDay,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft, ChevronRight, Plus, MoreVertical } from "lucide-react";
import {
  Field,
  FeedbackPanel,
  Modal,
  PrimaryButton,
  SecondaryButton,
  TextArea,
} from "../../components/ui/Modal";

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

const defaultDate = new Date(2024, 8, 1);

const createAllDay = (year, month, day) => ({
  start: new Date(year, month, day, 0, 0, 0),
  end: new Date(year, month, day, 23, 59, 59),
  allDay: true,
});

const facilityEvents = [
  {
    title: "Basketball Varsity Practice",
    ...createAllDay(2024, 8, 3),
    category: "basketball",
  },
  {
    title: "Floor Maintenance",
    ...createAllDay(2024, 8, 5),
    category: "maintenance",
  },
  {
    title: "Regional Finals: ADNU vs BU",
    ...createAllDay(2024, 8, 7),
    category: "basketball",
  },
  {
    title: "Volleyball Tryouts",
    ...createAllDay(2024, 8, 10),
    category: "volleyball",
  },
  {
    title: "Emergency Light Inspection",
    ...createAllDay(2024, 8, 17),
    category: "emergency",
  },
];

export function FacilitiesView() {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [modal, setModal] = useState(null);
  const events = useMemo(() => facilityEvents, []);

  const handlePrev = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNext = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const eventPropGetter = (event) => ({
    className: `adnu-event adnu-event--${event.category ?? "default"}`,
  });

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-brand-blue tracking-wider uppercase mb-1">
                Facility Schedule
              </p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {format(currentDate, "MMMM yyyy")}
              </h1>
            </div>
            <div className="flex items-center bg-surface-card border border-border-subtle rounded-lg shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-4 py-2 border-x border-border-subtle font-bold text-[13px] text-slate-700"
              >
                TODAY
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden relative">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view="month"
              views={["month"]}
              date={currentDate}
              onNavigate={setCurrentDate}
              toolbar={false}
              popup
              onSelectEvent={(event) => setModal({ type: "event", payload: event })}
              className="adnu-calendar"
              style={{ minHeight: 720 }}
              eventPropGetter={eventPropGetter}
              formats={{
                weekdayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "EEE", culture).toUpperCase(),
                dayFormat: (date, culture, calendarLocalizer) =>
                  calendarLocalizer.format(date, "d", culture),
              }}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-card/90 backdrop-blur-md px-6 py-3 rounded-full border border-border-subtle shadow-float flex items-center gap-6 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
                <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                  Basketball
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                  Volleyball
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                  Maintenance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                  Emergency
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft p-7">
            <h2 className="text-[18px] font-bold text-slate-900 mb-6">
              Quick Reserve
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Facility Name
                </label>
                <div className="relative">
                  <select className="w-full appearance-none bg-slate-50 border border-border-subtle rounded-xl py-2.5 pl-4 pr-10 text-[13px] font-medium text-slate-700 outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 transition-all">
                    <option>Main Gymnasium</option>
                    <option>Aquatics Center</option>
                    <option>Upper Field</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="mm/dd/yy"
                    className="w-full bg-slate-50 border border-border-subtle rounded-xl py-2.5 px-4 text-[13px] font-medium text-slate-700 outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Type
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-slate-50 border border-border-subtle rounded-xl py-2.5 pl-4 pr-10 text-[13px] font-medium text-slate-700 outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 transition-all">
                      <option>Basketball</option>
                      <option>Volleyball</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModal({ type: "booking" })}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-3.5 rounded-xl font-bold hover:bg-brand-blue-hover transition-colors shadow-soft text-[13px] tracking-wide"
              >
                <Plus className="w-4 h-4" />
                Request Booking
              </button>
            </div>
          </div>

          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-900">
                Pending Approvals
              </h2>
              <span className="px-2.5 py-1 bg-brand-blue-light text-brand-blue text-[10px] font-bold rounded-md tracking-wider uppercase">
                3 New
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-5 rounded-2xl border border-border-subtle/50 shadow-sm relative group">
                <button
                  type="button"
                  onClick={() => setModal({ type: "approval-detail", payload: "Community Open Day" })}
                  className="absolute top-4 right-4 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-900 text-[14px]">
                  Community Open Day
                </h3>
                <p className="text-[12px] text-slate-500 mt-1 mb-4">
                  Main Gym • Sept 25, 08:00 AM
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Community Open Day", action: "Approve" } })}
                    className="flex-1 py-2 rounded-lg border border-brand-blue text-brand-blue font-bold text-[11px] tracking-wider uppercase hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Community Open Day", action: "Deny" } })}
                    className="flex-1 py-2 rounded-lg border border-red-500 text-red-600 font-bold text-[11px] tracking-wider uppercase hover:bg-red-50 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border-subtle/50 shadow-sm relative group">
                <button
                  type="button"
                  onClick={() => setModal({ type: "approval-detail", payload: "Varsity Volleyball" })}
                  className="absolute top-4 right-4 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-900 text-[14px]">
                  Varsity Volleyball
                </h3>
                <p className="text-[12px] text-slate-500 mt-1 mb-4">
                  Main Gym • Sept 28, 04:00 PM
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Varsity Volleyball", action: "Approve" } })}
                    className="flex-1 py-2 rounded-lg border border-brand-blue text-brand-blue font-bold text-[11px] tracking-wider uppercase hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Varsity Volleyball", action: "Deny" } })}
                    className="flex-1 py-2 rounded-lg border border-red-500 text-red-600 font-bold text-[11px] tracking-wider uppercase hover:bg-red-50 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border-subtle/50 shadow-sm relative group">
                <button
                  type="button"
                  onClick={() => setModal({ type: "approval-detail", payload: "Annual Inspection" })}
                  className="absolute top-4 right-4 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-900 text-[14px]">
                  Annual Inspection
                </h3>
                <p className="text-[12px] text-slate-500 mt-1 mb-4">
                  All Facilities • Oct 01, 09:00 AM
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Annual Inspection", action: "Approve" } })}
                    className="flex-1 py-2 rounded-lg border border-brand-blue text-brand-blue font-bold text-[11px] tracking-wider uppercase hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "approval", payload: { name: "Annual Inspection", action: "Deny" } })}
                    className="flex-1 py-2 rounded-lg border border-red-500 text-red-600 font-bold text-[11px] tracking-wider uppercase hover:bg-red-50 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FacilitiesModal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}

function FacilitiesModal({ modal, onClose }) {
  if (!modal) return null;

  if (modal.type === "event") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.payload.title}
        description="Calendar event details."
        footer={<PrimaryButton onClick={onClose}>Close</PrimaryButton>}
      >
        <FeedbackPanel tone="info" title="Scheduled event">
          This event is categorized as {modal.payload.category}. Full roster,
          facility setup, and staffing data can connect here later.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "booking") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Confirm Booking Request"
        description="Submit the quick reservation for director review."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onClose}>Submit request</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="success" title="Request is ready">
          Main Gymnasium booking details will be submitted in placeholder mode.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "approval-detail") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.payload}
        description="Review requester notes and facility requirements."
        footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}
      >
        <Field label="Approver notes">
          <TextArea placeholder="Add setup, staffing, or compliance notes..." />
        </Field>
      </Modal>
    );
  }

  const isDeny = modal.payload.action === "Deny";

  return (
    <Modal
      open
      onClose={onClose}
      title={`${modal.payload.action} Request`}
      description={`${modal.payload.name} will be ${
        isDeny ? "declined" : "approved"
      } after confirmation.`}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton tone={isDeny ? "danger" : "brand"} onClick={onClose}>
            Confirm {modal.payload.action.toLowerCase()}
          </PrimaryButton>
        </>
      }
    >
      <FeedbackPanel tone={isDeny ? "danger" : "success"} title="Confirmation required">
        This keeps approval decisions deliberate and ready for audit logging.
      </FeedbackPanel>
    </Modal>
  );
}
