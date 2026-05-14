import { useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import { mockCoaches } from "./coachesMockData";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
} from "../../components/ui/Modal";

export function CoachesList() {
  const { setSelectedCoach } = useNavigation();
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const filterOptions = useMemo(
    () => ({
      sports: [...new Set(mockCoaches.map((coach) => coach.sport))],
      teams: [...new Set(mockCoaches.map((coach) => coach.team))],
      roles: [...new Set(mockCoaches.map((coach) => coach.role))],
    }),
    [],
  );

  return (
    <div className="relative animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Coaching Staff
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage active coaches, assignments, and profile records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block group">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
            <input
              type="text"
              placeholder="Search coaches..."
              className="w-64 rounded-full border border-border-subtle/50 bg-surface-card py-2 pl-10 pr-4 text-[12px] text-slate-700 shadow-soft outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "filter" })}
            className="flex items-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2 text-[12px] font-medium tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            FILTER
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-medium tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            ADD COACH
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle/50 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="p-5 pl-7 font-semibold">Coach</th>
                <th className="p-5 font-semibold">Sport / Role</th>
                <th className="p-5 font-semibold">Contact</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 pr-7 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-[13px]">
              {mockCoaches.map((coach) => (
                <tr
                  key={coach.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                  onClick={() => setSelectedCoach(coach)}
                >
                  <td className="p-5 pl-7">
                    <div className="flex items-center gap-4">
                      <img
                        src={coach.imageUrl}
                        alt={coach.name}
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <span className="block font-semibold text-slate-900">
                          {coach.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {coach.staffId}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="block font-medium text-slate-700">
                      {coach.sport} | {coach.team}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {coach.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="block font-semibold text-slate-700">
                      {coach.email}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {coach.phone}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        coach.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : coach.status === "On Leave"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {coach.status}
                    </span>
                  </td>
                  <td className="p-5 pr-7 text-right">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCoach(coach);
                      }}
                      className="rounded-lg px-3 py-1.5 font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5 hover:text-brand-blue-hover"
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

      <CoachesListModal
        modal={modal}
        onClose={closeModal}
        filterOptions={filterOptions}
      />
    </div>
  );
}

function CoachesListModal({ modal, onClose, filterOptions }) {
  if (!modal) return null;

  if (modal.type === "filter") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Filter Coaches"
        description="Narrow the coaching staff by sport, roster assignment, role, and availability."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Reset</SecondaryButton>
            <PrimaryButton onClick={onClose}>Apply filters</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport / Team">
            <SelectInput defaultValue="All coaching groups">
              <option>All coaching groups</option>
              {filterOptions.sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
              {filterOptions.teams.map((team) => (
                <option key={team}>{team}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput defaultValue="Any status">
              <option>Any status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </SelectInput>
          </Field>
          <Field label="Role">
            <SelectInput defaultValue="Any role">
              <option>Any role</option>
              {filterOptions.roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Experience band">
            <SelectInput defaultValue="Any experience">
              <option>Any experience</option>
              <option>0-3 years</option>
              <option>4-7 years</option>
              <option>8-12 years</option>
              <option>13+ years</option>
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
      title="Add Coach"
      description="Create a placeholder coach profile for later backend persistence."
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onClose}>Save coach</PrimaryButton>
        </>
      }
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <TextInput placeholder="Coach full name" />
        </Field>
        <Field label="Staff ID">
          <TextInput placeholder="COA-2026-000" />
        </Field>
        <Field label="Sport">
          <SelectInput defaultValue="Basketball">
            <option>Basketball</option>
            <option>Volleyball</option>
            <option>Football</option>
            <option>Swimming</option>
          </SelectInput>
        </Field>
        <Field label="Team">
          <TextInput placeholder="Blue Eagles Men" />
        </Field>
        <Field label="Role">
          <TextInput placeholder="Head Coach" />
        </Field>
        <Field label="Email">
          <TextInput placeholder="coach@adnu.edu.ph" />
        </Field>
        <Field label="Phone">
          <TextInput placeholder="+63 917 555 0100" />
        </Field>
        <Field label="Status">
          <SelectInput defaultValue="Active">
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </SelectInput>
        </Field>
      </div>
    </Modal>
  );
}
