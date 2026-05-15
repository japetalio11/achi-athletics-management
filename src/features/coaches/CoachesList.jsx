import { useMemo, useState } from "react";
import {
  Archive,
  Award,
  CalendarDays,
  Filter,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  StickyNote,
  UserPlus,
  UserRound,
} from "lucide-react";
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
import { ActionMenu } from "../../components/ui/ActionMenu";
import { coachRoles, coachStatuses, createCoachFromForm } from "./coachesMockData";

const defaultFilters = {
  search: "",
  sport: "All sports",
  role: "All roles",
  status: "All statuses",
  credential: "Any credential status",
  assignment: "Any assignment status",
  experience: "Any experience",
  sort: "Recently updated",
};

const emptyCoachForm = {
  name: "",
  staffId: "",
  sport: "Basketball",
  team: "",
  role: "Head Coach",
  status: "Active",
  email: "",
  phone: "",
  address: "",
  department: "",
  office: "",
  specialization: "",
  experienceYears: "",
  certificationLevel: "",
  birthdate: "",
  age: "",
  gender: "",
  nationality: "Filipino",
  summary: "",
};

const fallbackSports = ["Basketball", "Volleyball", "Football", "Athletics", "Swimming", "Badminton", "Chess"];

export function CoachesList({
  coaches,
  onSelectCoach,
  onAddCoach,
  onUpdateCoach,
  onAddNote,
  onArchiveCoach,
}) {
  const [filters, setFilters] = useState(defaultFilters);
  const [modal, setModal] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filterOptions = useMemo(
    () => ({
      sports: ["All sports", ...new Set(coaches.map((coach) => coach.sport).filter(Boolean))],
      roles: ["All roles", ...new Set([...coachRoles, ...coaches.map((coach) => coach.role).filter(Boolean)])],
      statuses: ["All statuses", ...coachStatuses],
    }),
    [coaches],
  );

  const sports = useMemo(() => {
    const values = new Set([...fallbackSports, ...coaches.map((coach) => coach.sport).filter(Boolean)]);
    return [...values];
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    const visible = coaches.filter((coach) => {
      const searchableText = [
        coach.name,
        coach.staffId,
        coach.sport,
        coach.team,
        coach.role,
        coach.email,
        coach.specialization,
        coach.department,
        coach.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const credentialStatuses = [
        ...(coach.certifications ?? []).map((item) => item.status),
        ...(coach.qualifications ?? []).map((item) => item.status),
      ];
      const hasAssignments = Number(coach.assignedAthleteCount ?? 0) > 0;
      const years = Number(coach.experienceYears ?? 0);

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesSport = filters.sport === "All sports" || coach.sport === filters.sport || coach.team === filters.sport;
      const matchesRole = filters.role === "All roles" || coach.role === filters.role;
      const matchesStatus = filters.status === "All statuses" || coach.status === filters.status;
      const matchesCredential =
        filters.credential === "Any credential status" || credentialStatuses.includes(filters.credential);
      const matchesAssignment =
        filters.assignment === "Any assignment status" ||
        (filters.assignment === "Has assigned athletes" && hasAssignments) ||
        (filters.assignment === "No assigned athletes" && !hasAssignments);
      const matchesExperience =
        filters.experience === "Any experience" ||
        (filters.experience === "0-3 years" && years <= 3) ||
        (filters.experience === "4-7 years" && years >= 4 && years <= 7) ||
        (filters.experience === "8-12 years" && years >= 8 && years <= 12) ||
        (filters.experience === "13+ years" && years >= 13);

      return (
        matchesSearch &&
        matchesSport &&
        matchesRole &&
        matchesStatus &&
        matchesCredential &&
        matchesAssignment &&
        matchesExperience
      );
    });

    return visible.sort((left, right) => {
      if (filters.sort === "Name") return left.name.localeCompare(right.name);
      if (filters.sort === "Sport / Team") return `${left.sport} ${left.team}`.localeCompare(`${right.sport} ${right.team}`);
      if (filters.sort === "Role") return left.role.localeCompare(right.role);
      if (filters.sort === "Status") return left.status.localeCompare(right.status);
      if (filters.sort === "Experience") return Number(right.experienceYears ?? 0) - Number(left.experienceYears ?? 0);
      return new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0);
    });
  }, [coaches, filters]);

  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return Boolean(value.trim());
    return value !== defaultFilters[key];
  });

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const closeModal = () => setModal(null);

  const openAddForm = () => setModal({ type: "form", mode: "add", values: emptyCoachForm, errors: {} });

  const openEditForm = (coach) =>
    setModal({
      type: "form",
      mode: "edit",
      coachId: coach.id,
      values: coachToForm(coach),
      errors: {},
    });

  const saveCoach = () => {
    if (modal?.type !== "form") return;

    const errors = validateCoachForm(
      modal.values,
      coaches,
      modal.mode === "edit" ? modal.coachId : null,
    );

    if (Object.keys(errors).length > 0) {
      setModal((current) => ({ ...current, errors }));
      return;
    }

    if (modal.mode === "add") {
      onAddCoach(createCoachFromForm(modal.values));
    } else {
      onUpdateCoach(
        modal.coachId,
        (coach) => mergeCoachForm(coach, modal.values),
        {
          title: "Coach updated",
          message: "Coach roster and profile details were updated locally.",
        },
      );
    }

    closeModal();
  };

  const saveNote = () => {
    if (modal?.type !== "note") return;
    const body = modal.value.trim();

    if (!body) {
      setModal((current) => ({ ...current, error: "Add a short note before saving." }));
      return;
    }

    onAddNote(modal.coach.id, {
      id: `NOTE-${Date.now()}`,
      type: modal.noteType,
      title: modal.title.trim() || `${modal.noteType} note`,
      owner: "Athletics Staff",
      date: new Date().toLocaleDateString(),
      body,
    });
    closeModal();
  };

  const saveStatus = () => {
    if (modal?.type !== "status") return;

    onUpdateCoach(
      modal.coach.id,
      (coach) => ({
        ...coach,
        status: modal.status,
        notes: [
          {
            id: `NOTE-${Date.now()}`,
            type: "Administrative",
            title: "Status update",
            owner: "Athletics Staff",
            date: new Date().toLocaleDateString(),
            body: modal.note.trim() || `Status changed to ${modal.status}.`,
          },
          ...(coach.notes ?? []),
        ],
      }),
      {
        title: "Coach status updated",
        message: `${modal.coach.name} now shows ${modal.status}.`,
      },
    );
    closeModal();
  };

  const confirmArchive = () => {
    if (modal?.type !== "confirm-archive") return;
    onArchiveCoach(modal.coach.id, "Archived");
    closeModal();
  };

  return (
    <div className="relative animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coaching Staff</h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Browse, search, and manage coach records in local frontend state.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search coaches..."
              className="w-full rounded-full border border-border-subtle/50 bg-surface-card py-2 pl-10 pr-4 text-[12px] text-slate-700 shadow-soft outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 sm:w-72"
            />
          </div>
          <select
            value={filters.sort}
            onChange={(event) => setFilter("sort", event.target.value)}
            className="rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2 text-[12px] font-semibold text-slate-600 shadow-soft outline-none"
          >
            <option>Recently updated</option>
            <option>Name</option>
            <option>Sport / Team</option>
            <option>Role</option>
            <option>Status</option>
            <option>Experience</option>
          </select>
          <button
            type="button"
            onClick={() => setModal({ type: "filter", values: filters })}
            className="flex items-center justify-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2 text-[12px] font-medium tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            FILTER
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-medium tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            ADD COACH
          </button>
        </div>
      </div>

      {activeFilterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-border-subtle/60 bg-surface-card p-3 shadow-soft">
          {activeFilterEntries.map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key, defaultFilters[key])}
              className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[11px] font-bold text-brand-blue transition-colors hover:bg-slate-100"
            >
              {key}: {value}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
        <div className="border-b border-border-subtle/50 bg-slate-50/60 px-6 py-4">
          <p className="text-[12px] font-semibold text-slate-600">
            Showing {filteredCoaches.length} of {coaches.length} coaches
          </p>
        </div>
        {coaches.length === 0 ? (
          <EmptyState
            title="No coaches yet"
            body="Add the first coach profile to start building the staff roster."
            action={<PrimaryButton onClick={openAddForm}>Add coach</PrimaryButton>}
          />
        ) : filteredCoaches.length === 0 ? (
          <EmptyState
            title="No coaches match these filters"
            body="Try a broader search, remove a filter, or reset the coaching view."
            action={<SecondaryButton onClick={() => setFilters(defaultFilters)}>Reset filters</SecondaryButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle/50 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-5 pl-7 font-semibold">Coach</th>
                  <th className="p-5 font-semibold">Sport / Team</th>
                  <th className="p-5 font-semibold">Role</th>
                  <th className="p-5 font-semibold">Contact</th>
                  <th className="p-5 font-semibold">Assignments</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 pr-7 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                {filteredCoaches.map((coach) => (
                  <tr
                    key={coach.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                    onClick={() => onSelectCoach(coach)}
                  >
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <img
                          src={coach.imageUrl}
                          alt={coach.name}
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="block font-semibold text-slate-900">{coach.name}</span>
                          <span className="text-[11px] text-slate-500">{coach.staffId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="block font-medium text-slate-700">{coach.sport}</span>
                      <span className="text-[11px] text-slate-500">{coach.team || "No team assigned"}</span>
                    </td>
                    <td className="p-5">
                      <span className="block font-medium text-slate-700">{coach.role}</span>
                      <span className="text-[11px] text-slate-500">{coach.experienceYears} years experience</span>
                    </td>
                    <td className="p-5">
                      <span className="block max-w-[220px] truncate font-semibold text-slate-700">{coach.email}</span>
                      <span className="text-[11px] text-slate-500">{coach.phone}</span>
                    </td>
                    <td className="p-5">
                      <span className="block font-semibold text-slate-700">{coach.assignedAthleteCount ?? 0} athletes</span>
                      <span className="text-[11px] text-slate-500">{coach.schedule?.summary?.upcoming ?? "0"} upcoming duties</span>
                    </td>
                    <td className="p-5">
                      <StatusBadge value={coach.status} />
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <CoachActionsMenu
                        coach={coach}
                        open={openMenuId === coach.id}
                        onToggle={() => setOpenMenuId((id) => (id === coach.id ? null : coach.id))}
                        onClose={() => setOpenMenuId(null)}
                        onView={() => onSelectCoach(coach)}
                        onEdit={() => openEditForm(coach)}
                        onAssign={() => onSelectCoach(coach, "athletes")}
                        onSchedule={() => onSelectCoach(coach, "events")}
                        onCredential={() => onSelectCoach(coach, "certifications")}
                        onNote={() =>
                          setModal({
                            type: "note",
                            coach,
                            noteType: "Administrative",
                            title: "",
                            value: "",
                            error: "",
                          })
                        }
                        onStatus={() => setModal({ type: "status", coach, status: coach.status, note: "" })}
                        onArchive={() => setModal({ type: "confirm-archive", coach })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CoachesListModal
        modal={modal}
        sports={sports}
        filterOptions={filterOptions}
        onClose={closeModal}
        onChange={(key, value) =>
          setModal((current) => ({
            ...current,
            values: { ...current.values, [key]: value },
            errors: { ...current.errors, [key]: undefined },
          }))
        }
        onFilterChange={(key, value) =>
          setModal((current) => ({
            ...current,
            values: { ...current.values, [key]: value },
          }))
        }
        onApplyFilters={() => {
          setFilters(modal.values);
          closeModal();
        }}
        onResetFilters={() => {
          setFilters(defaultFilters);
          closeModal();
        }}
        onSaveCoach={saveCoach}
        onSaveNote={saveNote}
        onStatusChange={(key, value) => setModal((current) => ({ ...current, [key]: value }))}
        onSaveStatus={saveStatus}
        onConfirmArchive={confirmArchive}
      />
    </div>
  );
}

function CoachActionsMenu({
  coach,
  open,
  onToggle,
  onClose,
  onView,
  onEdit,
  onAssign,
  onSchedule,
  onCredential,
  onNote,
  onStatus,
  onArchive,
}) {
  const run = (action) => (event) => {
    event.stopPropagation();
    action();
    onClose();
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <ActionMenu
        label={`Actions for ${coach.name}`}
        open={open}
        onToggle={onToggle}
        onClose={onClose}
        items={[
          { icon: UserRound, label: "View Profile", onClick: run(onView) },
          { icon: PencilLine, label: "Edit Coach", onClick: run(onEdit) },
          { icon: ShieldCheck, label: "Update Status", onClick: run(onStatus) },
          { icon: UserPlus, label: "Assign Athletes", onClick: run(onAssign) },
          { icon: CalendarDays, label: "View Schedule", onClick: run(onSchedule) },
          { icon: Award, label: "Manage Credentials", onClick: run(onCredential) },
          { icon: StickyNote, label: "Add Note", onClick: run(onNote) },
          { icon: Archive, label: "Archive Coach", onClick: run(onArchive), tone: "danger" },
        ]}
      />
    </div>
  );
}

function CoachesListModal({
  modal,
  sports,
  filterOptions,
  onClose,
  onChange,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onSaveCoach,
  onSaveNote,
  onStatusChange,
  onSaveStatus,
  onConfirmArchive,
}) {
  if (!modal) return null;

  if (modal.type === "filter") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Filter Coaches"
        description="Narrow the coaching staff by sport, role, status, credentials, assignments, or experience."
        footer={
          <>
            <SecondaryButton onClick={onResetFilters}>Reset</SecondaryButton>
            <PrimaryButton onClick={onApplyFilters}>Apply filters</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport / Team">
            <SelectInput value={modal.values.sport} onChange={(event) => onFilterChange("sport", event.target.value)}>
              {filterOptions.sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Role">
            <SelectInput value={modal.values.role} onChange={(event) => onFilterChange("role", event.target.value)}>
              {filterOptions.roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput value={modal.values.status} onChange={(event) => onFilterChange("status", event.target.value)}>
              {filterOptions.statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Credential status">
            <SelectInput
              value={modal.values.credential}
              onChange={(event) => onFilterChange("credential", event.target.value)}
            >
              <option>Any credential status</option>
              <option>Valid</option>
              <option>Current</option>
              <option>Expiring Soon</option>
              <option>Renewal Due</option>
              <option>Expired</option>
              <option>Pending Review</option>
            </SelectInput>
          </Field>
          <Field label="Assignment status">
            <SelectInput
              value={modal.values.assignment}
              onChange={(event) => onFilterChange("assignment", event.target.value)}
            >
              <option>Any assignment status</option>
              <option>Has assigned athletes</option>
              <option>No assigned athletes</option>
            </SelectInput>
          </Field>
          <Field label="Experience">
            <SelectInput
              value={modal.values.experience}
              onChange={(event) => onFilterChange("experience", event.target.value)}
            >
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

  if (modal.type === "note") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Add Note | ${modal.coach.name}`}
        description="Capture a quick staff note for this coach profile."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveNote}>Save note</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Note type">
            <SelectInput value={modal.noteType} onChange={(event) => onStatusChange("noteType", event.target.value)}>
              <option>Administrative</option>
              <option>Performance</option>
              <option>Roster</option>
              <option>Schedule</option>
            </SelectInput>
          </Field>
          <Field label="Title">
            <TextInput value={modal.title} onChange={(event) => onStatusChange("title", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note" error={modal.error}>
              <TextArea
                value={modal.value}
                onChange={(event) => onStatusChange("value", event.target.value)}
                placeholder="Type a short coach note..."
              />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Update Status | ${modal.coach.name}`}
        description="Update coach roster status in local state."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveStatus}>Save status</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Coach status">
            <SelectInput value={modal.status} onChange={(event) => onStatusChange("status", event.target.value)}>
              {coachStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status note">
            <TextArea
              value={modal.note}
              onChange={(event) => onStatusChange("note", event.target.value)}
              placeholder="Reason for the status update..."
            />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "confirm-archive") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Archive Coach"
        description={`${modal.coach.name} will remain in local data but will be marked as archived.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Keep active</SecondaryButton>
            <PrimaryButton tone="danger" onClick={onConfirmArchive}>
              Archive coach
            </PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="warning" title="Confirmation required">
          This is a frontend-only update. Backend persistence and audit logging can be connected later.
        </FeedbackPanel>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={modal.mode === "edit" ? "Edit Coach" : "Add Coach"}
      description={
        modal.mode === "edit"
          ? "Update staff, contact, and coaching assignment details."
          : "Create a complete local coach profile before backend persistence is connected."
      }
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSaveCoach}>Save coach</PrimaryButton>
        </>
      }
      size="lg"
    >
      <CoachForm values={modal.values} errors={modal.errors} sports={sports} onChange={onChange} />
    </Modal>
  );
}

function CoachForm({ values, errors, sports, onChange }) {
  return (
    <div className="space-y-5">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
          </Field>
          <Field label="Staff ID" error={errors.staffId}>
            <TextInput value={values.staffId} onChange={(event) => onChange("staffId", event.target.value)} placeholder="COA-2026-000" />
          </Field>
          <Field label="Status">
            <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
              {coachStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Experience years" error={errors.experienceYears}>
            <TextInput value={values.experienceYears} onChange={(event) => onChange("experienceYears", event.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Coaching Assignment">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport" error={errors.sport}>
            <SelectInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)}>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Team" error={errors.team}>
            <TextInput value={values.team} onChange={(event) => onChange("team", event.target.value)} />
          </Field>
          <Field label="Role" error={errors.role}>
            <SelectInput value={values.role} onChange={(event) => onChange("role", event.target.value)}>
              {coachRoles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Specialization">
            <TextInput value={values.specialization} onChange={(event) => onChange("specialization", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Profile summary">
              <TextArea value={values.summary} onChange={(event) => onChange("summary", event.target.value)} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact and Staff Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email}>
            <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
          </Field>
          <Field label="Contact number" error={errors.phone}>
            <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
          </Field>
          <Field label="Department">
            <TextInput value={values.department} onChange={(event) => onChange("department", event.target.value)} />
          </Field>
          <Field label="Office">
            <TextInput value={values.office} onChange={(event) => onChange("office", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <TextInput value={values.address} onChange={(event) => onChange("address", event.target.value)} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection title="Credentials">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Certification level">
            <TextInput value={values.certificationLevel} onChange={(event) => onChange("certificationLevel", event.target.value)} />
          </Field>
          <Field label="Nationality">
            <TextInput value={values.nationality} onChange={(event) => onChange("nationality", event.target.value)} />
          </Field>
        </div>
      </FormSection>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-5">
      <h3 className="mb-4 text-[14px] font-bold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="p-8">
      <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
        <p className="text-[15px] font-bold text-slate-900">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const tone =
    value === "Active"
      ? "bg-green-50 text-green-700"
      : value === "On Leave"
        ? "bg-amber-50 text-amber-700"
        : value === "Archived" || value === "Inactive"
          ? "bg-slate-100 text-slate-600"
          : "bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>
      {value}
    </span>
  );
}

function coachToForm(coach) {
  return {
    ...emptyCoachForm,
    name: coach.name,
    staffId: coach.staffId,
    sport: coach.sport,
    team: coach.team,
    role: coach.role,
    status: coach.status,
    email: coach.email,
    phone: coach.phone,
    address: coach.address,
    department: coach.department,
    office: coach.office,
    specialization: coach.specialization,
    experienceYears: String(coach.experienceYears ?? ""),
    certificationLevel: coach.profile?.certificationLevel ?? "",
    birthdate: coach.profile?.birthdate ?? "",
    age: coach.profile?.age ?? "",
    gender: coach.profile?.gender ?? "",
    nationality: coach.profile?.nationality ?? "",
    summary: coach.overview?.summary ?? "",
  };
}

function mergeCoachForm(coach, values) {
  return {
    ...coach,
    id: values.staffId.trim(),
    staffId: values.staffId.trim(),
    name: values.name.trim(),
    sport: values.sport.trim(),
    team: values.team.trim(),
    role: values.role,
    status: values.status,
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    department: values.department.trim(),
    office: values.office.trim(),
    specialization: values.specialization.trim(),
    experienceYears: Number(values.experienceYears || 0),
    profile: {
      ...coach.profile,
      birthdate: values.birthdate || coach.profile?.birthdate,
      age: values.age || coach.profile?.age,
      gender: values.gender || coach.profile?.gender,
      nationality: values.nationality || coach.profile?.nationality,
      certificationLevel: values.certificationLevel || coach.profile?.certificationLevel,
    },
    overview: {
      ...coach.overview,
      summary: values.summary || coach.overview?.summary,
    },
  };
}

function validateCoachForm(values, coaches, editingId) {
  const errors = {};
  const staffId = values.staffId.trim();

  if (!values.name.trim()) errors.name = "Full name is required.";
  if (!staffId) errors.staffId = "Staff ID is required.";
  if (staffId && !/^COA-\d{4}-\d{3}$/i.test(staffId)) {
    errors.staffId = "Use the format COA-2026-000.";
  }
  if (staffId && coaches.some((coach) => coach.staffId.toLowerCase() === staffId.toLowerCase() && coach.id !== editingId)) {
    errors.staffId = "A coach with this Staff ID already exists.";
  }
  if (!values.sport.trim()) errors.sport = "Sport is required.";
  if (!values.team.trim()) errors.team = "Team is required.";
  if (!values.role) errors.role = "Role is required.";
  if (!values.status) errors.status = "Status is required.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.phone && !/^[+()\d\s-]{7,}$/.test(values.phone)) {
    errors.phone = "Enter a valid contact number.";
  }
  if (
    values.experienceYears &&
    (Number.isNaN(Number(values.experienceYears)) || Number(values.experienceYears) < 0)
  ) {
    errors.experienceYears = "Experience must be a positive number.";
  }

  return errors;
}
