import { useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  History,
  MapPin,
  Package,
  PencilLine,
  Plus,
  Trash2,
  Undo2,
  UserPlus,
  Wrench,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Modal";
import {
  formatCurrency,
  formatDate,
  getAvailabilityLabel,
  getConditionTone,
  getStatusTone,
} from "./inventoryTypes";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "assignments", label: "Assignments" },
  { id: "maintenance", label: "Maintenance" },
  { id: "history", label: "History" },
  { id: "notes", label: "Notes" },
];

export function InventoryItemInfoPage({
  item,
  initialTab = "overview",
  onBack,
  onSelectTab,
  onOpenModal,
  onDuplicateItem,
  onOpenPersonProfile,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const activeTab = initialTab || "overview";

  if (!item) {
    return (
      <div className="space-y-6 pb-24">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </button>
        <EmptyState title="Inventory item not found" body="The selected item is not available in local frontend state." />
      </div>
    );
  }

  const activeAssignments = item.assignments.filter((assignment) => assignment.status === "Active");
  const primaryAction =
    item.availableQuantity > 0 && !["Lost", "Retired", "Archived"].includes(item.status)
      ? {
          label: "Assign Item",
          icon: UserPlus,
          onClick: () => onOpenModal({ type: "assign", item }),
        }
      : activeAssignments.length > 0
        ? {
            label: "Return Item",
            icon: Undo2,
            onClick: () => onOpenModal({ type: "return", item }),
          }
        : {
            label: "Edit Item",
            icon: PencilLine,
            onClick: () => onOpenModal({ type: "item-form", mode: "edit", item }),
          };

  const PrimaryIcon = primaryAction.icon;

  const switchTab = (tabId) => {
    onSelectTab?.(tabId);
  };

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inventory
      </button>

      <header className="relative overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-brand-blue/8 via-brand-blue/3 to-transparent" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={item.status} className={getStatusTone(item.status)} />
              <Badge value={item.condition} className={getConditionTone(item.condition)} />
              <Badge value={getAvailabilityLabel(item)} className="bg-slate-100 text-slate-600" />
            </div>
            <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
              <img src={item.imageUrl} alt={item.name} className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-soft" />
              <div className="min-w-0">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{item.name}</h1>
                <p className="mt-2 text-[15px] font-medium text-brand-blue">
                  {item.sku} | {item.category} | {item.sport}
                </p>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                  {item.description || "No description recorded."}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileBadge icon={Boxes} label="Available" value={`${item.availableQuantity}/${item.totalQuantity}`} />
              <ProfileBadge icon={MapPin} label="Location" value={item.location} />
              <ProfileBadge icon={Package} label="Brand / Model" value={[item.brand, item.model].filter(Boolean).join(" ") || "Pending"} />
              <ProfileBadge icon={History} label="Updated" value={formatDate(item.updatedAt)} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-border-subtle/60 bg-slate-50/75 p-5 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Item Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
              >
                <PrimaryIcon className="h-4 w-4" />
                {primaryAction.label}
              </button>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenModal({ type: "stock", item })}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle/70 bg-white px-5 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-100"
                >
                  <Boxes className="h-4 w-4" />
                  Stock
                </button>
                <ActionMenu
                  label={`More actions for ${item.name}`}
                  open={openMenuId === "header"}
                  onToggle={() => setOpenMenuId((current) => (current === "header" ? null : "header"))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Edit Item", icon: PencilLine, onClick: () => onOpenModal({ type: "item-form", mode: "edit", item }) },
                    { label: "Assign Item", icon: UserPlus, onClick: () => onOpenModal({ type: "assign", item }) },
                    ...(activeAssignments.length
                      ? [{ label: "Return Item", icon: Undo2, onClick: () => onOpenModal({ type: "return", item }) }]
                      : []),
                    { label: "Send to Maintenance", icon: Wrench, onClick: () => onOpenModal({ type: "maintenance", item, status: "Under Maintenance" }) },
                    { label: "Mark Repaired", icon: CheckCircle2, onClick: () => onOpenModal({ type: "confirm", action: "repaired", item }) },
                    { label: "Duplicate Item", icon: Copy, onClick: () => onDuplicateItem(item) },
                    { label: "Mark Damaged", icon: AlertTriangle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "damaged", item }) },
                    { label: "Mark Lost", icon: AlertTriangle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "lost", item }) },
                    { label: "Retire Item", icon: Archive, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "retire", item }) },
                    { label: "Delete Item", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "delete", item }) },
                  ]}
                />
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="relative isolate overflow-hidden rounded-[28px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
        <div className="border-b border-border-subtle/70 pb-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                  activeTab === tab.id ? "bg-brand-blue text-white shadow-soft" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          {activeTab === "overview" && <OverviewTab item={item} onOpenModal={onOpenModal} onOpenTab={switchTab} />}
          {activeTab === "assignments" && (
            <AssignmentsTab
              item={item}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenModal={onOpenModal}
              onOpenPersonProfile={onOpenPersonProfile}
            />
          )}
          {activeTab === "maintenance" && <MaintenanceTab item={item} onOpenModal={onOpenModal} />}
          {activeTab === "history" && <HistoryTab item={item} />}
          {activeTab === "notes" && (
            <NotesTab
              item={item}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onOpenModal={onOpenModal}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function OverviewTab({ item, onOpenModal, onOpenTab }) {
  const activeAssignments = item.assignments.filter((assignment) => assignment.status === "Active");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <InfoTile label="Total stock" value={String(item.totalQuantity)} />
        <InfoTile label="Available stock" value={String(item.availableQuantity)} />
        <InfoTile label="Current assignments" value={String(activeAssignments.length)} />
        <InfoTile label="Unit cost" value={formatCurrency(item.purchase?.unitCost)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <DetailPanel title="Item description" body={item.description} />
        <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
          <SectionTitle title="Quick Actions" description="Common item operations for staff and admins." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionCard icon={PencilLine} title="Edit details" onClick={() => onOpenModal({ type: "item-form", mode: "edit", item })} />
            <ActionCard icon={Boxes} title="Adjust stock" onClick={() => onOpenModal({ type: "stock", item })} />
            <ActionCard icon={UserPlus} title="Assign item" onClick={() => onOpenModal({ type: "assign", item })} />
            <ActionCard icon={Wrench} title="Mark condition" onClick={() => onOpenModal({ type: "maintenance", item })} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoTile label="Category" value={item.category} />
        <InfoTile label="Sport / team usage" value={item.sport} />
        <InfoTile label="Location" value={item.location} />
        <InfoTile label="Brand" value={item.brand || "Pending"} />
        <InfoTile label="Model" value={item.model || "Pending"} />
        <InfoTile label="Size / specs" value={item.size || "Pending"} />
        <InfoTile label="Vendor" value={item.purchase?.vendor || "Pending"} />
        <InfoTile label="Acquired" value={formatDate(item.purchase?.date)} />
        <InfoTile label="Warranty" value={item.purchase?.warranty || "Pending"} />
      </div>

      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionToolbar
          title="Assignment Snapshot"
          description="A compact view of active assignments for this item."
          action={<SecondaryButton onClick={() => onOpenTab("assignments")}><Eye className="h-3.5 w-3.5" />Open assignments</SecondaryButton>}
        />
        {activeAssignments.length === 0 ? (
          <EmptyState title="No current assignment" body="This item has no active checkout records." />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {activeAssignments.map((assignment) => (
              <DetailPanel
                key={assignment.id}
                title={`${assignment.assigneeName} | ${assignment.assigneeType}`}
                body={`${assignment.quantity} unit(s), due ${formatDate(assignment.dueDate)}. ${assignment.notes}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AssignmentsTab({
  item,
  openMenuId,
  setOpenMenuId,
  onOpenModal,
  onOpenPersonProfile,
}) {
  const currentAssignments = item.assignments.filter((assignment) => assignment.status === "Active" || assignment.status === "Lost");
  const pastAssignments = item.assignments.filter((assignment) => assignment.status !== "Active" && assignment.status !== "Lost");

  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Assignments"
        description="Track current and past equipment checkout records."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "assign", item })}><UserPlus className="h-4 w-4" />Assign item</PrimaryButton>}
      />
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Current Assignment" description="Open assignment records that still affect availability." />
        <AssignmentCards
          item={item}
          assignments={currentAssignments}
          emptyTitle="No current assignment"
          emptyBody="Available stock can be assigned from the action above."
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onOpenModal={onOpenModal}
          onOpenPersonProfile={onOpenPersonProfile}
        />
      </section>
      <section className="rounded-[24px] border border-border-subtle/50 bg-slate-50/70 p-5">
        <SectionTitle title="Past Assignment History" description="Returned and closed equipment assignment records." />
        <AssignmentCards
          item={item}
          assignments={pastAssignments}
          emptyTitle="No past assignments"
          emptyBody="Returned assignment history will appear here."
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onOpenModal={onOpenModal}
          onOpenPersonProfile={onOpenPersonProfile}
        />
      </section>
    </div>
  );
}

function AssignmentCards({
  item,
  assignments,
  emptyTitle,
  emptyBody,
  openMenuId,
  setOpenMenuId,
  onOpenModal,
  onOpenPersonProfile,
}) {
  if (!assignments.length) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="mt-4 space-y-3">
      {assignments.map((assignment) => {
        const menuId = `assignment-${assignment.id}`;
        return (
          <article key={assignment.id} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-bold text-slate-950">{assignment.assigneeName}</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {assignment.assigneeType} | {assignment.sport} | {assignment.quantity} unit(s)
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoTile label="Assigned" value={formatDate(assignment.assignedDate)} compact />
                  <InfoTile label="Due" value={formatDate(assignment.dueDate)} compact />
                  <InfoTile label="Returned" value={formatDate(assignment.returnDate)} compact />
                  <InfoTile label="Condition" value={assignment.conditionIn || assignment.conditionOut} compact />
                </div>
                {assignment.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{assignment.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge value={assignment.status} className={assignment.status === "Lost" ? "bg-red-50 text-red-700" : assignment.status === "Returned" ? "bg-green-50 text-green-700" : "bg-brand-blue-light text-brand-blue"} />
                <ActionMenu
                  label={`Actions for ${assignment.assigneeName}`}
                  open={openMenuId === menuId}
                  onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Open Assigned Profile", icon: Eye, onClick: () => onOpenPersonProfile(assignment) },
                    { label: "Return Item", icon: Undo2, onClick: () => onOpenModal({ type: "return", item, assignment }) },
                    { label: "Extend Return Date", icon: History, onClick: () => onOpenModal({ type: "extend", item, assignment }) },
                    { label: "Mark Damaged", icon: AlertTriangle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "damaged-assignment", item, assignment }) },
                    { label: "Mark Lost", icon: AlertTriangle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "lost-assignment", item, assignment }) },
                  ]}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MaintenanceTab({ item, onOpenModal }) {
  return (
    <div className="space-y-6">
      <SectionToolbar
        title="Maintenance Records"
        description="Repair, cleaning, inspection, and status history."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "maintenance", item })}><Wrench className="h-4 w-4" />Add record</PrimaryButton>}
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <InfoTile label="Status" value={item.status} />
        <InfoTile label="Condition" value={item.condition} />
        <InfoTile label="Record count" value={String(item.maintenanceRecords.length)} />
        <InfoTile label="Next inspection" value={formatDate(item.maintenanceRecords[0]?.nextInspectionDate)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <SecondaryButton onClick={() => onOpenModal({ type: "confirm", action: "inspection", item })}><AlertTriangle className="h-3.5 w-3.5" />Needs inspection</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "maintenance", item, status: "Under Maintenance" })}><Wrench className="h-3.5 w-3.5" />Under maintenance</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "confirm", action: "damaged", item })}><AlertTriangle className="h-3.5 w-3.5" />Mark damaged</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "confirm", action: "repaired", item })}><CheckCircle2 className="h-3.5 w-3.5" />Mark repaired</SecondaryButton>
        <SecondaryButton onClick={() => onOpenModal({ type: "confirm", action: "retire", item })}><Archive className="h-3.5 w-3.5" />Retire</SecondaryButton>
      </div>
      {item.maintenanceRecords.length === 0 ? (
        <EmptyState title="No maintenance records" body="Inspection, cleaning, or repair entries will appear here." />
      ) : (
        <div className="space-y-3">
          {item.maintenanceRecords.map((record) => (
            <article key={record.id} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{record.issue}</p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    Reported {formatDate(record.dateReported)} | Next inspection {formatDate(record.nextInspectionDate)}
                  </p>
                </div>
                <Badge value={record.status} className={getStatusTone(record.status)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{record.resolution || "No resolution recorded yet."}</p>
              <p className="mt-2 text-[12px] font-semibold text-slate-500">Cost: {formatCurrency(record.cost)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ item }) {
  const activity = [
    ...(item.history ?? []),
    ...(item.stockMovements ?? []).map(
      (movement) => `${formatDate(movement.date)} - ${movement.type}: ${movement.quantity > 0 ? "+" : ""}${movement.quantity} (${movement.note})`,
    ),
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Inventory History" description="Activity, stock movement, assignment, and maintenance audit trail." />
      {activity.length === 0 ? (
        <EmptyState title="No history records" body="Saved inventory actions will appear here." />
      ) : (
        <div className="space-y-3">
          {activity.map((entry, index) => (
            <div key={`${entry}-${index}`} className="flex gap-3 rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-blue" />
              <p className="text-sm leading-6 text-slate-600">{entry}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({ item, openMenuId, setOpenMenuId, onOpenModal }) {
  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Inventory Notes"
        description="Internal notes, staff remarks, and usage guidance."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "note", mode: "add", item })}><Plus className="h-4 w-4" />Add note</PrimaryButton>}
      />
      {item.notes.length === 0 ? (
        <EmptyState title="No notes yet" body="Add an internal note, usage note, or maintenance remark." />
      ) : (
        <div className="space-y-3">
          {item.notes.map((note) => {
            const menuId = `note-${note.id}`;
            return (
              <article key={note.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{note.title}</p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {note.type} | {note.author} | {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <ActionMenu
                    label={`Actions for ${note.title}`}
                    open={openMenuId === menuId}
                    onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                    onClose={() => setOpenMenuId(null)}
                    items={[
                      { label: "Edit Note", icon: PencilLine, onClick: () => onOpenModal({ type: "note", mode: "edit", item, note }) },
                      { label: "Delete Note", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "delete-note", item, note }) },
                    ]}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{note.body}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SectionToolbar({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <SectionTitle title={title} description={description} />
      {action}
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}

function ProfileBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function InfoTile({ label, value, compact = false }) {
  return (
    <div className={`rounded-2xl border border-border-subtle/50 bg-slate-50/80 ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value || "Pending"}</p>
    </div>
  );
}

function DetailPanel({ title, body }) {
  return (
    <div className="rounded-2xl border border-border-subtle/60 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body || "Pending"}</p>
    </div>
  );
}

function ActionCard({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border-subtle/60 bg-white p-4 text-left transition-colors hover:border-brand-blue/20 hover:bg-brand-blue-light/60"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue shadow-soft">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-[14px] font-bold text-slate-900">{title}</h3>
    </button>
  );
}

function Badge({ value, className }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${className}`}>
      {value}
    </span>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
      <FileText className="mx-auto h-5 w-5 text-slate-300" />
      <p className="mt-3 text-[15px] font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}
