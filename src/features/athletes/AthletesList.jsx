import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
} from "../../components/ui/Modal";

const mockAthletes = [
  {
    id: "#2021-08422",
    name: "Sarah Jenkins",
    sport: "Track & Field",
    event: "400m Hurdles",
    standing: "Deans List",
    status: "Cleared",
    coach: "Marcus Thorne",
    year: "Junior Year",
    scholarship: "Full Scholarship",
    gpa: 3.85,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260241"
  },
  {
    id: "#2022-09114",
    name: "Marcus Santos",
    sport: "Basketball",
    event: "Point Guard",
    standing: "Good",
    status: "Injured",
    coach: "David Reyes",
    year: "Sophomore Year",
    scholarship: "Partial Scholarship",
    gpa: 3.2,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260242"
  },
  {
    id: "#2020-04192",
    name: "Elena Rodriguez",
    sport: "Volleyball",
    event: "Libero",
    standing: "Probation",
    status: "Cleared",
    coach: "Sarah Lim",
    year: "Senior Year",
    scholarship: "Walk-on",
    gpa: 2.1,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260243"
  }
];

export function AthletesList() {
  const { setSelectedAthlete } = useNavigation();
  const [modal, setModal] = useState(null);

  const closeModal = () => setModal(null);

  return (
    <div className="space-y-6 pb-24 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Roster</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage and monitor all student-athletes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            <input
              type="text"
              placeholder="Search athletes..."
              className="w-64 bg-surface-card border border-border-subtle/50 focus:border-brand-blue/30 rounded-full py-2 pl-10 pr-4 text-[12px] text-slate-700 transition-all outline-none placeholder:text-slate-400 shadow-soft"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "filter" })}
            className="flex items-center gap-2 bg-surface-card border border-border-subtle/50 text-slate-600 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-colors shadow-soft text-[12px] tracking-wide"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            FILTER
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-full font-medium hover:bg-brand-blue-hover transition-colors shadow-soft text-[12px] tracking-wide"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD ATHLETE
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] tracking-widest font-bold text-slate-400 uppercase border-b border-border-subtle/50">
                <th className="p-5 pl-7 font-semibold">Athlete</th>
                <th className="p-5 font-semibold">Sport / Event</th>
                <th className="p-5 font-semibold">Academic</th>
                <th className="p-5 font-semibold">Medical</th>
                <th className="p-5 pr-7 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-[13px]">
              {mockAthletes.map((athlete) => (
                <tr key={athlete.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedAthlete(athlete)}>
                  <td className="p-5 pl-7">
                    <div className="flex items-center gap-4">
                      <img src={athlete.imageUrl} alt={athlete.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{athlete.name}</span>
                        <span className="text-[11px] text-slate-500">{athlete.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-slate-700 font-medium block">{athlete.sport}</span>
                    <span className="text-slate-500 text-[11px]">{athlete.event}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${athlete.gpa >= 3.0 ? 'bg-brand-blue' : athlete.gpa >= 2.5 ? 'bg-brand-gold' : 'bg-red-500'}`}></span>
                      <span className="font-semibold text-slate-700">{athlete.gpa.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      athlete.status === 'Cleared' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {athlete.status}
                    </span>
                  </td>
                  <td className="p-5 pr-7 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedAthlete(athlete); }}
                      className="font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-blue/5"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AthletesListModal modal={modal} onClose={closeModal} />
    </div>
  );
}

function AthletesListModal({ modal, onClose }) {
  if (!modal) return null;

  if (modal.type === "filter") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Filter Roster"
        description="Narrow the roster by sport, clearance status, and academic risk."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Reset</SecondaryButton>
            <PrimaryButton onClick={onClose}>Apply filters</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport">
            <SelectInput defaultValue="All sports">
              <option>All sports</option>
              <option>Basketball</option>
              <option>Track & Field</option>
              <option>Volleyball</option>
            </SelectInput>
          </Field>
          <Field label="Medical status">
            <SelectInput defaultValue="Any status">
              <option>Any status</option>
              <option>Cleared</option>
              <option>Injured</option>
            </SelectInput>
          </Field>
          <Field label="Academic standing">
            <SelectInput defaultValue="Any standing">
              <option>Any standing</option>
              <option>Good</option>
              <option>Deans List</option>
              <option>Probation</option>
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput defaultValue="Any scholarship">
              <option>Any scholarship</option>
              <option>Full Scholarship</option>
              <option>Partial Scholarship</option>
              <option>Walk-on</option>
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
      title="Add Athlete"
      description="Create a placeholder athlete profile for later backend persistence."
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onClose}>Save athlete</PrimaryButton>
        </>
      }
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <TextInput placeholder="Student-athlete name" />
        </Field>
        <Field label="Student ID">
          <TextInput placeholder="#2026-00000" />
        </Field>
        <Field label="Sport">
          <SelectInput defaultValue="Basketball">
            <option>Basketball</option>
            <option>Track & Field</option>
            <option>Volleyball</option>
            <option>Football</option>
          </SelectInput>
        </Field>
        <Field label="Event / Position">
          <TextInput placeholder="Point Guard, Libero, 400m..." />
        </Field>
        <Field label="Coach">
          <TextInput placeholder="Assigned coach" />
        </Field>
        <Field label="Medical status">
          <SelectInput defaultValue="Cleared">
            <option>Cleared</option>
            <option>Injured</option>
            <option>Pending</option>
          </SelectInput>
        </Field>
      </div>
    </Modal>
  );
}
