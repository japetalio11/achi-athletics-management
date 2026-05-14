import { useMemo, useState } from "react";
import {
  Archive,
  FileText,
  Filter,
  Package,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
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
import {
  academicStandings,
  athleteStatuses,
  createAthleteFromForm,
  scholarshipTypes,
  sports,
  yearLevels,
} from "./athletesMockData";

const defaultFilters = {
  search: "",
  sport: "All sports",
  status: "All statuses",
  year: "All years",
  standing: "All standings",
  coach: "All coaches",
  sort: "Recently updated",
};

const emptyAthleteForm = {
  name: "",
  id: "",
  sport: sports[0],
  event: "",
  coach: "",
  status: "Cleared",
  scholarship: "Walk-on",
  department: "",
  course: "",
  year: yearLevels[0],
  standing: "Good",
  gpa: "",
  attendance: "",
  units: "",
  academicEligibility: "Pending review",
  email: "",
  phone: "",
  address: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  birthdate: "",
  age: "",
  gender: "",
  nationality: "Filipino",
  height: "",
  weight: "",
  bloodType: "",
  side: "",
  summary: "",
};

export function AthletesList({
  athletes,
  onSelectAthlete,
  onAddAthlete,
  onUpdateAthlete,
  onAddNote,
  onArchiveAthlete,
}) {
  const [filters, setFilters] = useState(defaultFilters);
  const [modal, setModal] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const coaches = useMemo(
    () => ["All coaches", ...new Set(athletes.map((athlete) => athlete.coach).filter(Boolean))],
    [athletes],
  );

  const filteredAthletes = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    const visible = athletes.filter((athlete) => {
      const searchableText = [
        athlete.name,
        athlete.id,
        athlete.sport,
        athlete.event,
        athlete.course,
        athlete.department,
        athlete.status,
        athlete.coach,
        athlete.year,
        athlete.standing,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesSport = filters.sport === "All sports" || athlete.sport === filters.sport;
      const matchesStatus =
        filters.status === "All statuses" || athlete.status === filters.status;
      const matchesYear = filters.year === "All years" || athlete.year === filters.year;
      const matchesStanding =
        filters.standing === "All standings" || athlete.standing === filters.standing;
      const matchesCoach = filters.coach === "All coaches" || athlete.coach === filters.coach;

      return (
        matchesSearch &&
        matchesSport &&
        matchesStatus &&
        matchesYear &&
        matchesStanding &&
        matchesCoach
      );
    });

    return visible.sort((left, right) => {
      if (filters.sort === "Name") return left.name.localeCompare(right.name);
      if (filters.sort === "Sport") return left.sport.localeCompare(right.sport);
      if (filters.sort === "Year level") return left.year.localeCompare(right.year);
      if (filters.sort === "Status") return left.status.localeCompare(right.status);
      return new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0);
    });
  }, [athletes, filters]);

  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return Boolean(value.trim());
    return value !== defaultFilters[key];
  });

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const closeModal = () => setModal(null);

  const openAddForm = () => setModal({ type: "form", mode: "add", values: emptyAthleteForm, errors: {} });

  const openEditForm = (athlete) =>
    setModal({
      type: "form",
      mode: "edit",
      athleteId: athlete.id,
      values: athleteToForm(athlete),
      errors: {},
    });

  const saveAthlete = () => {
    if (modal?.type !== "form") return;

    const errors = validateAthleteForm(modal.values);
    if (Object.keys(errors).length > 0) {
      setModal((current) => ({ ...current, errors }));
      return;
    }

    if (modal.mode === "add") {
      onAddAthlete(createAthleteFromForm(modal.values));
    } else {
      onUpdateAthlete(
        modal.athleteId,
        (athlete) => mergeAthleteForm(athlete, modal.values),
        {
          title: "Athlete updated",
          message: "Roster and profile details were updated locally.",
        },
      );
    }

    closeModal();
  };

  const saveNote = () => {
    if (modal?.type !== "note") return;
    const note = modal.value.trim();

    if (!note) {
      setModal((current) => ({ ...current, error: "Add a short note before saving." }));
      return;
    }

    onAddNote(modal.athlete.id, `${new Date().toLocaleDateString()} - ${note}`);
    closeModal();
  };

  const saveStatus = () => {
    if (modal?.type !== "status") return;

    onUpdateAthlete(
      modal.athlete.id,
      {
        status: modal.status,
        scholarship: modal.scholarship,
        overview: {
          ...modal.athlete.overview,
          recentActivity: [
            `${new Date().toLocaleDateString()} - Status changed to ${modal.status}. ${modal.note}`.trim(),
            ...(modal.athlete.overview.recentActivity ?? []),
          ],
        },
      },
      {
        title: "Status updated",
        message: `${modal.athlete.name} now shows ${modal.status}.`,
      },
    );
    closeModal();
  };

  const confirmArchive = () => {
    if (modal?.type !== "confirm-archive") return;
    onArchiveAthlete(modal.athlete.id, "Archived");
    closeModal();
  };

  return (
    <div className="relative animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Active Roster</h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Browse, search, and manage student-athlete records in local frontend state.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search athletes..."
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
            <option>Sport</option>
            <option>Year level</option>
            <option>Status</option>
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
            ADD ATHLETE
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
            Showing {filteredAthletes.length} of {athletes.length} athletes
          </p>
        </div>
        {athletes.length === 0 ? (
          <EmptyState
            title="No athletes yet"
            body="Add the first athlete profile to start building the roster."
            action={<PrimaryButton onClick={openAddForm}>Add athlete</PrimaryButton>}
          />
        ) : filteredAthletes.length === 0 ? (
          <EmptyState
            title="No athletes match these filters"
            body="Try a broader search, remove a filter, or reset the roster view."
            action={<SecondaryButton onClick={() => setFilters(defaultFilters)}>Reset filters</SecondaryButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle/50 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-5 pl-7 font-semibold">Athlete</th>
                  <th className="p-5 font-semibold">Sport / Event</th>
                  <th className="p-5 font-semibold">Coach</th>
                  <th className="p-5 font-semibold">Department / Year</th>
                  <th className="p-5 font-semibold">Academic</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 pr-7 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                {filteredAthletes.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                    onClick={() => onSelectAthlete(athlete)}
                  >
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <img
                          src={athlete.imageUrl}
                          alt={athlete.name}
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="block font-semibold text-slate-900">{athlete.name}</span>
                          <span className="text-[11px] text-slate-500">{athlete.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="block font-medium text-slate-700">{athlete.sport}</span>
                      <span className="text-[11px] text-slate-500">{athlete.event || "No event assigned"}</span>
                    </td>
                    <td className="p-5">
                      <span className="block font-medium text-slate-700">{athlete.coach || "Unassigned"}</span>
                      <span className="text-[11px] text-slate-500">Assigned coach</span>
                    </td>
                    <td className="p-5">
                      <span className="block max-w-[240px] truncate font-medium text-slate-700">
                        {athlete.department}
                      </span>
                      <span className="text-[11px] text-slate-500">{athlete.year}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getAcademicDot(athlete.gpa)}`} />
                        <span className="font-semibold text-slate-700">{Number(athlete.gpa).toFixed(2)}</span>
                      </div>
                      <span className="mt-1 block text-[11px] text-slate-500">{athlete.standing}</span>
                    </td>
                    <td className="p-5">
                      <StatusBadge value={athlete.status} />
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <AthleteActionsMenu
                        athlete={athlete}
                        open={openMenuId === athlete.id}
                        onToggle={() => setOpenMenuId((id) => (id === athlete.id ? null : athlete.id))}
                        onClose={() => setOpenMenuId(null)}
                        onView={() => onSelectAthlete(athlete)}
                        onEdit={() => openEditForm(athlete)}
                        onNote={() => setModal({ type: "note", athlete, value: "", error: "" })}
                        onStatus={() =>
                          setModal({
                            type: "status",
                            athlete,
                            status: athlete.status,
                            scholarship: athlete.scholarship,
                            note: "",
                          })
                        }
                        onDocs={() => onSelectAthlete(athlete, "assets")}
                        onGear={() => onSelectAthlete(athlete, "assets")}
                        onArchive={() => setModal({ type: "confirm-archive", athlete })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AthletesListModal
        modal={modal}
        coaches={coaches}
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
        onSaveAthlete={saveAthlete}
        onSaveNote={saveNote}
        onStatusChange={(key, value) => setModal((current) => ({ ...current, [key]: value }))}
        onSaveStatus={saveStatus}
        onConfirmArchive={confirmArchive}
      />
    </div>
  );
}

function AthleteActionsMenu({
  athlete,
  open,
  onToggle,
  onClose,
  onView,
  onEdit,
  onNote,
  onStatus,
  onDocs,
  onGear,
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
        label={`Actions for ${athlete.name}`}
        open={open}
        onToggle={onToggle}
        onClose={onClose}
        items={[
          { icon: UserRound, label: "View Profile", onClick: run(onView) },
          { icon: PencilLine, label: "Edit Athlete", onClick: run(onEdit) },
          { icon: ShieldCheck, label: "Update Status", onClick: run(onStatus) },
          { icon: FileText, label: "Manage Documents", onClick: run(onDocs) },
          { icon: Package, label: "Manage Gear", onClick: run(onGear) },
          { icon: PencilLine, label: "Add Note", onClick: run(onNote) },
          { icon: Archive, label: "Archive Athlete", onClick: run(onArchive), tone: "danger" },
        ]}
      />
    </div>
  );
}

function AthletesListModal({
  modal,
  coaches,
  onClose,
  onChange,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onSaveAthlete,
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
        title="Filter Roster"
        description="Narrow the roster by sport, status, academic standing, year level, or coach."
        footer={
          <>
            <SecondaryButton onClick={onResetFilters}>Reset</SecondaryButton>
            <PrimaryButton onClick={onApplyFilters}>Apply filters</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport">
            <SelectInput value={modal.values.sport} onChange={(event) => onFilterChange("sport", event.target.value)}>
              <option>All sports</option>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput value={modal.values.status} onChange={(event) => onFilterChange("status", event.target.value)}>
              <option>All statuses</option>
              {athleteStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Year level">
            <SelectInput value={modal.values.year} onChange={(event) => onFilterChange("year", event.target.value)}>
              <option>All years</option>
              {yearLevels.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Academic standing">
            <SelectInput
              value={modal.values.standing}
              onChange={(event) => onFilterChange("standing", event.target.value)}
            >
              <option>All standings</option>
              {academicStandings.map((standing) => (
                <option key={standing}>{standing}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Coach">
            <SelectInput value={modal.values.coach} onChange={(event) => onFilterChange("coach", event.target.value)}>
              {coaches.map((coach) => (
                <option key={coach}>{coach}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Sort">
            <SelectInput value={modal.values.sort} onChange={(event) => onFilterChange("sort", event.target.value)}>
              <option>Recently updated</option>
              <option>Name</option>
              <option>Sport</option>
              <option>Year level</option>
              <option>Status</option>
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
        title={`Add Note | ${modal.athlete.name}`}
        description="Capture a quick staff note for this athlete profile."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveNote}>Save note</PrimaryButton>
          </>
        }
      >
        <Field label="Note" error={modal.error}>
          <TextArea
            value={modal.value}
            onChange={(event) => onStatusChange("value", event.target.value)}
            placeholder="Type a short note..."
          />
        </Field>
      </Modal>
    );
  }

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title={`Update Status | ${modal.athlete.name}`}
        description="Update roster status and scholarship classification in local state."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onSaveStatus}>Save status</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roster status">
            <SelectInput value={modal.status} onChange={(event) => onStatusChange("status", event.target.value)}>
              {athleteStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput
              value={modal.scholarship}
              onChange={(event) => onStatusChange("scholarship", event.target.value)}
            >
              {scholarshipTypes.map((scholarship) => (
                <option key={scholarship}>{scholarship}</option>
              ))}
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status note">
              <TextArea
                value={modal.note}
                onChange={(event) => onStatusChange("note", event.target.value)}
                placeholder="Reason for the status update..."
              />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "confirm-archive") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Archive Athlete"
        description={`${modal.athlete.name} will remain in local data but will be marked as archived.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Keep active</SecondaryButton>
            <PrimaryButton tone="danger" onClick={onConfirmArchive}>Archive athlete</PrimaryButton>
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
      title={modal.mode === "edit" ? "Edit Athlete" : "Add Athlete"}
      description={
        modal.mode === "edit"
          ? "Update roster, contact, academic, and sport assignment details."
          : "Create a complete local athlete profile before backend persistence is connected."
      }
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSaveAthlete}>Save athlete</PrimaryButton>
        </>
      }
      size="lg"
    >
      <AthleteForm values={modal.values} errors={modal.errors} onChange={onChange} />
    </Modal>
  );
}

function AthleteForm({ values, errors, onChange }) {
  return (
    <div className="space-y-5">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
          </Field>
          <Field label="Student ID" error={errors.id}>
            <TextInput value={values.id} onChange={(event) => onChange("id", event.target.value)} placeholder="#2026-00000" />
          </Field>
          <Field label="Status">
            <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
              {athleteStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput value={values.scholarship} onChange={(event) => onChange("scholarship", event.target.value)}>
              {scholarshipTypes.map((scholarship) => (
                <option key={scholarship}>{scholarship}</option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Sport Assignment">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport / Team" error={errors.sport}>
            <SelectInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)}>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Event / Position">
            <TextInput value={values.event} onChange={(event) => onChange("event", event.target.value)} />
          </Field>
          <Field label="Coach">
            <TextInput value={values.coach} onChange={(event) => onChange("coach", event.target.value)} />
          </Field>
          <Field label="Profile summary">
            <TextInput value={values.summary} onChange={(event) => onChange("summary", event.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Academic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department" error={errors.department}>
            <TextInput value={values.department} onChange={(event) => onChange("department", event.target.value)} />
          </Field>
          <Field label="Course">
            <TextInput value={values.course} onChange={(event) => onChange("course", event.target.value)} />
          </Field>
          <Field label="Year level" error={errors.year}>
            <SelectInput value={values.year} onChange={(event) => onChange("year", event.target.value)}>
              {yearLevels.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Academic standing">
            <SelectInput value={values.standing} onChange={(event) => onChange("standing", event.target.value)}>
              {academicStandings.map((standing) => (
                <option key={standing}>{standing}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="GPA" error={errors.gpa}>
            <TextInput value={values.gpa} onChange={(event) => onChange("gpa", event.target.value)} placeholder="3.25" />
          </Field>
          <Field label="Units">
            <TextInput value={values.units} onChange={(event) => onChange("units", event.target.value)} placeholder="18 units" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Contact Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email}>
            <TextInput value={values.email} onChange={(event) => onChange("email", event.target.value)} />
          </Field>
          <Field label="Contact number" error={errors.phone}>
            <TextInput value={values.phone} onChange={(event) => onChange("phone", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <TextInput value={values.address} onChange={(event) => onChange("address", event.target.value)} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection title="Emergency Contact">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name">
            <TextInput value={values.emergencyName} onChange={(event) => onChange("emergencyName", event.target.value)} />
          </Field>
          <Field label="Relationship">
            <TextInput
              value={values.emergencyRelationship}
              onChange={(event) => onChange("emergencyRelationship", event.target.value)}
            />
          </Field>
          <Field label="Phone">
            <TextInput value={values.emergencyPhone} onChange={(event) => onChange("emergencyPhone", event.target.value)} />
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
    value === "Cleared"
      ? "bg-green-50 text-green-700"
      : value === "Pending Review"
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

function getAcademicDot(gpa) {
  if (Number(gpa) >= 3) return "bg-brand-blue";
  if (Number(gpa) >= 2.5) return "bg-brand-gold";
  return "bg-red-500";
}

function athleteToForm(athlete) {
  return {
    ...emptyAthleteForm,
    name: athlete.name,
    id: athlete.id,
    sport: athlete.sport,
    event: athlete.event,
    coach: athlete.coach,
    status: athlete.status,
    scholarship: athlete.scholarship,
    department: athlete.department,
    course: athlete.course ?? "",
    year: athlete.year,
    standing: athlete.standing,
    gpa: String(athlete.gpa),
    attendance: athlete.academics?.attendance ?? "",
    units: athlete.academics?.units ?? "",
    academicEligibility: athlete.academics?.eligibility ?? "",
    email: athlete.contact?.email ?? "",
    phone: athlete.contact?.phone ?? "",
    address: athlete.contact?.address ?? "",
    emergencyName: athlete.contact?.emergency?.name ?? "",
    emergencyRelationship: athlete.contact?.emergency?.relationship ?? "",
    emergencyPhone: athlete.contact?.emergency?.phone ?? "",
    birthdate: athlete.personal?.birthdate ?? "",
    age: athlete.personal?.age ?? "",
    gender: athlete.personal?.gender ?? "",
    nationality: athlete.personal?.nationality ?? "",
    height: athlete.personal?.height ?? "",
    weight: athlete.personal?.weight ?? "",
    bloodType: athlete.personal?.bloodType ?? "",
    side: athlete.personal?.side ?? "",
    summary: athlete.overview?.summary ?? "",
  };
}

function mergeAthleteForm(athlete, values) {
  return {
    ...athlete,
    id: values.id.trim(),
    name: values.name.trim(),
    sport: values.sport,
    event: values.event.trim(),
    coach: values.coach.trim(),
    status: values.status,
    scholarship: values.scholarship,
    department: values.department.trim(),
    course: values.course.trim(),
    year: values.year,
    standing: values.standing,
    gpa: Number(values.gpa || 0),
    personal: {
      ...athlete.personal,
      birthdate: values.birthdate,
      age: values.age,
      gender: values.gender,
      nationality: values.nationality,
      height: values.height,
      weight: values.weight,
      bloodType: values.bloodType,
      side: values.side,
    },
    contact: {
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      emergency: {
        name: values.emergencyName.trim(),
        relationship: values.emergencyRelationship.trim(),
        phone: values.emergencyPhone.trim(),
      },
    },
    overview: {
      ...athlete.overview,
      summary: values.summary || athlete.overview.summary,
    },
    academics: {
      ...athlete.academics,
      attendance: values.attendance || athlete.academics.attendance,
      units: values.units || athlete.academics.units,
      eligibility: values.academicEligibility || athlete.academics.eligibility,
    },
  };
}

function validateAthleteForm(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Full name is required.";
  if (!values.id.trim()) errors.id = "Student ID is required.";
  if (values.id && !/^#?\d{4}-\d{5}$/.test(values.id.trim())) {
    errors.id = "Use the format #2026-00000.";
  }
  if (!values.sport) errors.sport = "Sport or team is required.";
  if (!values.year) errors.year = "Year level is required.";
  if (!values.status) errors.status = "Status is required.";
  if (!values.department.trim()) errors.department = "Department is required.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.phone && !/^[+()\d\s-]{7,}$/.test(values.phone)) {
    errors.phone = "Enter a valid contact number.";
  }
  if (values.gpa && (Number.isNaN(Number(values.gpa)) || Number(values.gpa) < 0 || Number(values.gpa) > 4)) {
    errors.gpa = "GPA must be between 0 and 4.";
  }

  return errors;
}
