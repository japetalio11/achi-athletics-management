import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Camera,
  QrCode,
  Download,
  Eye,
  Filter,
  History,
  ListChecks,
  Package,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  Tags,
  Undo2,
  UserPlus,
  Trash2,
} from "lucide-react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Modal";
import {
  defaultInventoryFilters,
  getAvailabilityLabel,
  getStatusTone,
  inventoryCategories,
  inventoryConditions,
  inventoryLocations,
  inventorySports,
  inventoryStatuses,
} from "./inventoryTypes";

const viewTabs = [
  { id: "list", label: "List", icon: ListChecks },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "assignments", label: "Assignments", icon: UserPlus },
];

export function InventoryList({
  items,
  onSelectItem,
  onOpenModal,
}) {
  const [filters, setFilters] = useState(defaultInventoryFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeView, setActiveView] = useState("list");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [requestedPage, setRequestedPage] = useState(1);
  const perPage = 5;

  const visibleItems = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return items
      .filter((item) => !item.archived || filters.status === "Archived")
      .filter((item) => {
        const assignedNames = item.assignments.map((assignment) => assignment.assigneeName).join(" ");
        const searchableText = [
          item.name,
          item.sku,
          item.category,
          item.sport,
          item.brand,
          item.model,
          item.location,
          item.status,
          item.condition,
          assignedNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const availability = getAvailabilityLabel(item);
        const matchesSearch = !searchValue || searchableText.includes(searchValue);
        const matchesCategory =
          filters.category === "All categories" || item.category === filters.category;
        const matchesSport = filters.sport === "All sports" || item.sport === filters.sport;
        const matchesCondition =
          filters.condition === "All conditions" || item.condition === filters.condition;
        const matchesStatus = filters.status === "All statuses" || item.status === filters.status;
        const matchesLocation =
          filters.location === "All locations" || item.location === filters.location;
        const matchesAvailability =
          filters.availability === "Any availability" ||
          availability === filters.availability ||
          (filters.availability === "Has available stock" && item.availableQuantity > 0) ||
          (filters.availability === "Fully assigned" && item.availableQuantity === 0);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSport &&
          matchesCondition &&
          matchesStatus &&
          matchesLocation &&
          matchesAvailability
        );
      })
      .sort((left, right) => {
        if (filters.sort === "Name") return left.name.localeCompare(right.name);
        if (filters.sort === "Category") return left.category.localeCompare(right.category);
        if (filters.sort === "Available quantity") return right.availableQuantity - left.availableQuantity;
        if (filters.sort === "Status") return left.status.localeCompare(right.status);
        return new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0);
      });
  }, [filters, items]);

  const activeAssignments = useMemo(
    () =>
      visibleItems.flatMap((item) =>
        item.assignments
          .filter((assignment) => assignment.status === "Active" || assignment.status === "Lost")
          .map((assignment) => ({ ...assignment, item })),
      ),
    [visibleItems],
  );

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / perPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedItems = visibleItems.slice((currentPage - 1) * perPage, currentPage * perPage);

  const summaryCards = useMemo(() => {
    const activeItems = items.filter((item) => !item.archived);
    const available = activeItems.reduce((sum, item) => sum + item.availableQuantity, 0);
    const total = activeItems.reduce((sum, item) => sum + item.totalQuantity, 0);
    const assigned = activeItems.reduce((sum, item) => sum + Math.max(0, item.totalQuantity - item.availableQuantity), 0);
    const needsAttention = activeItems.filter((item) =>
      ["Low Stock", "Needs Inspection", "Under Maintenance", "Damaged", "Lost"].includes(item.status),
    ).length;

    return [
      { label: "Total Items", value: total, hint: `${activeItems.length} item records`, icon: Package },
      { label: "Available", value: available, hint: "Ready to issue", icon: Boxes },
      { label: "Assigned", value: assigned, hint: "Checked out", icon: UserPlus },
      { label: "Needs Attention", value: needsAttention, hint: "Low stock or service", icon: AlertTriangle },
    ];
  }, [items]);

  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return Boolean(value.trim());
    return value !== defaultInventoryFilters[key];
  });

  const setFilter = (key, value) => {
    setRequestedPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setRequestedPage(1);
    setFilters(defaultInventoryFilters);
  };

  return (
    <div className="animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Asset Inventory Hub</h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage equipment, supplies, assignments, stock, and maintenance in local frontend state.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onOpenModal({ type: "scanner", query: "", resultId: "", error: "" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2.5 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <Camera className="h-3.5 w-3.5 text-slate-400" />
            Scanner
          </button>
          <button
            type="button"
            onClick={() => onOpenModal({ type: "export" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2.5 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export
          </button>
          <button
            type="button"
            onClick={() => onOpenModal({ type: "item-form", mode: "add" })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
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
                placeholder="Search name, SKU, sport, assignee, brand, location..."
                className="w-full rounded-full border border-border-subtle/60 bg-slate-50 py-2.5 pl-10 pr-4 text-[12px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5"
              />
            </div>
            <select
              value={filters.category}
              onChange={(event) => setFilter("category", event.target.value)}
              className="rounded-full border border-border-subtle/60 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-600 outline-none"
            >
              <option>All categories</option>
              {inventoryCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilter("status", event.target.value)}
              className="rounded-full border border-border-subtle/60 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-600 outline-none"
            >
              <option>All statuses</option>
              {inventoryStatuses.map((status) => <option key={status}>{status}</option>)}
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
                  onClick={() => {
                    setRequestedPage(1);
                    setActiveView(tab.id);
                  }}
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
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-soft hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="mt-5 grid gap-3 rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Sport" value={filters.sport} onChange={(value) => setFilter("sport", value)}>
              <option>All sports</option>
              {inventorySports.map((sport) => <option key={sport}>{sport}</option>)}
            </FilterSelect>
            <FilterSelect label="Condition" value={filters.condition} onChange={(value) => setFilter("condition", value)}>
              <option>All conditions</option>
              {inventoryConditions.map((condition) => <option key={condition}>{condition}</option>)}
            </FilterSelect>
            <FilterSelect label="Availability" value={filters.availability} onChange={(value) => setFilter("availability", value)}>
              <option>Any availability</option>
              <option>Available</option>
              <option>Partially available</option>
              <option>Has available stock</option>
              <option>Fully assigned</option>
              <option>Lost</option>
              <option>Retired</option>
            </FilterSelect>
            <FilterSelect label="Location" value={filters.location} onChange={(value) => setFilter("location", value)}>
              <option>All locations</option>
              {inventoryLocations.map((location) => <option key={location}>{location}</option>)}
            </FilterSelect>
            <FilterSelect label="Sort" value={filters.sort} onChange={(value) => setFilter("sort", value)}>
              <option>Recently updated</option>
              <option>Name</option>
              <option>Category</option>
              <option>Available quantity</option>
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
              onClick={() => setFilter(key, defaultInventoryFilters[key])}
              className="rounded-full bg-brand-blue-light px-3 py-1.5 text-[11px] font-bold text-brand-blue transition-colors hover:bg-slate-100"
            >
              {key}: {value}
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        </div>
      )}

      {activeView === "list" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr] items-start">
          <div>
            <InventoryTable
              items={paginatedItems}
              totalCount={visibleItems.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setRequestedPage}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onSelectItem={onSelectItem}
              onOpenModal={onOpenModal}
              onResetFilters={resetFilters}
            />
          </div>

          <aside className="space-y-4 sticky top-6 self-start">
            <QRCard onOpenScanner={() => onOpenModal({ type: "scanner", query: "", resultId: "", error: "" })} />
            <LiveTransactions assignments={activeAssignments} items={items} onViewAll={() => onOpenModal({ type: "activity" })} />
          </aside>
        </div>
      )}

      {activeView === "categories" && (
        <CategoriesView
          items={visibleItems}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSelectItem={onSelectItem}
          onOpenModal={onOpenModal}
        />
      )}

      {activeView === "assignments" && (
        <AssignmentsView
          assignments={activeAssignments}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSelectItem={onSelectItem}
          onOpenModal={onOpenModal}
        />
      )}
    </div>
  );
}

function InventoryTable({
  items,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  openMenuId,
  setOpenMenuId,
  onSelectItem,
  onOpenModal,
  onResetFilters,
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
      <div className="border-b border-border-subtle/50 bg-slate-50/60 px-6 py-4">
        <p className="text-[12px] font-semibold text-slate-600">
          Showing {items.length} of {totalCount} inventory records
        </p>
      </div>
      {totalCount === 0 ? (
        <EmptyState title="No inventory items yet" body="Add the first asset or supply item to start tracking stock." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No inventory items match these filters"
          body="Try a broader search, remove a filter, or reset the inventory view."
          action={<SecondaryButton onClick={onResetFilters}>Reset filters</SecondaryButton>}
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[66vh] overflow-y-auto">
            <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle/50 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="p-5 pl-7 font-semibold w-[50%]">Item</th>
                <th className="p-5 font-semibold text-center w-[18%]">Stock</th>
                <th className="p-5 font-semibold text-center w-[18%]">Status</th>
                <th className="p-5 pr-7 text-right font-semibold w-[14%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-[13px]">
              {items.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  open={openMenuId === item.id}
                  onToggle={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                  onClose={() => setOpenMenuId(null)}
                  onSelectItem={onSelectItem}
                  onOpenModal={onOpenModal}
                />
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {totalCount > 5 && (
        <div className="border-t border-border-subtle/50 bg-slate-50/60 px-6 py-3 flex items-center justify-between">
          <div className="text-[13px] text-slate-600">Page {currentPage} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="rounded-full px-3 py-1 text-sm font-bold border border-border-subtle bg-white hover:bg-slate-50"
            >
              Previous
            </button>
            <div className="inline-flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const active = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-full text-sm font-bold ${active ? 'bg-brand-blue text-white' : 'bg-white border border-border-subtle text-slate-700'}`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="rounded-full px-3 py-1 text-sm font-bold border border-border-subtle bg-white hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function InventoryRow({
  item,
  open,
  onToggle,
  onClose,
  onSelectItem,
  onOpenModal,
}) {
  return (
      <tr className="group cursor-pointer transition-colors hover:bg-slate-50/50" onClick={() => onSelectItem(item)}>
        <td className="p-5 pl-7">
          <div className="flex items-center gap-4">
            <img src={item.imageUrl} alt={item.name} className="h-11 w-11 rounded-2xl border border-slate-200 object-cover" />
            <div className="min-w-0">
              <span className="block max-w-[360px] truncate font-semibold text-slate-900">{item.name}</span>
              <span className="text-[11px] font-semibold text-brand-blue">{item.sku}</span>
            </div>
          </div>
        </td>
        <td className="p-5 align-middle text-center">
          <div className="flex flex-col items-center">
            <span className="block font-bold text-slate-900">{item.availableQuantity}/{item.totalQuantity}</span>
            <span className="text-[11px] text-slate-500">{getAvailabilityLabel(item)}</span>
          </div>
        </td>

        <td className="p-5 align-middle text-center">
          <Badge value={item.status} className={getStatusTone(item.status)} />
        </td>

        <td className="p-5 pr-7">
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <InventoryActionMenu
              item={item}
              open={open}
              onToggle={onToggle}
              onClose={onClose}
              onSelectItem={onSelectItem}
              onOpenModal={onOpenModal}
            />
          </div>
        </td>
      </tr>
  );
}

function CategoriesView({
  items,
  openMenuId,
  setOpenMenuId,
  onSelectItem,
  onOpenModal,
}) {
  const groups = inventoryCategories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);

  if (!groups.length) {
    return <EmptyState title="No categories to show" body="Matching inventory categories will appear here." />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {groups.map((group) => (
        <section key={group.category} className="rounded-[24px] border border-border-subtle/40 bg-surface-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-slate-950">{group.category}</h2>
              <p className="mt-1 text-[12px] text-slate-500">{group.items.length} matching records</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <Tags className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {group.items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => onSelectItem(item)} className="min-w-0 text-left">
                    <p className="truncate font-bold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-[12px] text-slate-500">{item.sku} | {item.sport}</p>
                    <p className="mt-2 text-[12px] font-semibold text-slate-600">
                      {item.availableQuantity}/{item.totalQuantity} available
                    </p>
                  </button>
                  <InventoryActionMenu
                    item={item}
                    open={openMenuId === `cat-${item.id}`}
                    onToggle={() => setOpenMenuId((current) => (current === `cat-${item.id}` ? null : `cat-${item.id}`))}
                    onClose={() => setOpenMenuId(null)}
                    onSelectItem={onSelectItem}
                    onOpenModal={onOpenModal}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AssignmentsView({
  assignments,
  openMenuId,
  setOpenMenuId,
  onSelectItem,
  onOpenModal,
}) {
  if (!assignments.length) {
    return (
      <EmptyState
        title="No assigned inventory"
        body="Active equipment and supply assignments will appear here."
        action={<PrimaryButton onClick={() => onOpenModal({ type: "assign" })}>Assign item</PrimaryButton>}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
      <div className="border-b border-border-subtle/50 bg-slate-50/60 px-6 py-4">
        <p className="text-[12px] font-semibold text-slate-600">
          {assignments.length} active assignment{assignments.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="divide-y divide-border-subtle/60">
        {assignments.map((assignment) => {
          const menuId = `assignment-${assignment.id}`;
          return (
            <article key={assignment.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_1fr_0.7fr_auto] lg:items-center">
              <button type="button" onClick={() => onSelectItem(assignment.item)} className="min-w-0 text-left">
                <p className="truncate font-bold text-slate-950">{assignment.item.name}</p>
                <p className="mt-1 text-[12px] text-brand-blue">{assignment.item.sku}</p>
              </button>
              <div>
                <p className="font-semibold text-slate-800">{assignment.assigneeName}</p>
                <p className="mt-1 text-[12px] text-slate-500">{assignment.assigneeType} | {assignment.sport}</p>
              </div>
              <div>
                <Badge value={assignment.status} className={assignment.status === "Lost" ? "bg-red-50 text-red-700" : "bg-brand-blue-light text-brand-blue"} />
                <p className="mt-2 text-[12px] text-slate-500">Due {assignment.dueDate || "Pending"}</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onSelectItem(assignment.item)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-3.5 py-2 text-[11px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>
                <ActionMenu
                  label={`Actions for ${assignment.item.name} assignment`}
                  open={openMenuId === menuId}
                  onToggle={() => setOpenMenuId((current) => (current === menuId ? null : menuId))}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: "Return Item", icon: Undo2, onClick: () => onOpenModal({ type: "return", item: assignment.item, assignment }) },
                    { label: "Extend Return Date", icon: History, onClick: () => onOpenModal({ type: "extend", item: assignment.item, assignment }) },
                    { label: "Mark Lost", icon: AlertTriangle, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "lost-assignment", item: assignment.item, assignment }) },
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

function InventoryActionMenu({
  item,
  open,
  onToggle,
  onClose,
  onSelectItem,
  onOpenModal,
}) {
  return (
    <ActionMenu
      label={`Actions for ${item.name}`}
      open={open}
      onToggle={onToggle}
      onClose={onClose}
      items={[
        { label: "View Details", icon: Eye, onClick: () => onSelectItem(item) },
        { label: "Edit Item", icon: PencilLine, onClick: () => onOpenModal({ type: "item-form", mode: "edit", item }) },
        { label: "Delete Item", icon: Trash2, tone: "danger", onClick: () => onOpenModal({ type: "confirm", action: "delete", item }) },
      ]}
    />
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-[12px] font-semibold text-slate-600 outline-none"
      >
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
    <div className="p-8">
      <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
        <p className="text-[15px] font-bold text-slate-900">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-6 text-slate-500">{body}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

function QRCard({ onOpenScanner }) {
  return (
    <section className="rounded-[12px] overflow-hidden border border-border-subtle/30 shadow-soft bg-white">
      <div className="px-4 py-5 bg-gradient-to-br from-[#0f4aa6] to-[#083a86] text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold leading-5">Scan for Asset Check-in</h3>
            <p className="mt-1 text-sm text-white/90">Quickly loan equipment or update status by scanning the asset's QR code.</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 text-center">
          <p className="text-[13px] font-semibold text-slate-800">Scan or paste asset QR</p>
          <p className="text-[12px] text-slate-500">Read QR codes for quick check-in and status updates</p>
        </div>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex items-center gap-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#083a86] shadow-soft"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e6f0ff] text-[#083a86]">
              <QrCode className="h-4 w-4" />
            </span>
            Launch Scanner
          </button>
        </div>
      </div>
    </section>
  );
}

function LiveTransactions({ assignments, items, onViewAll }) {
  // Build a small feed from active assignments and recent stock movements
  const movements = items.flatMap((item) =>
    (item.stockMovements || []).map((m) => ({
      id: `${m.id}-${item.id}`,
      type: m.type,
      message: `${item.name} — ${m.type} (${m.quantity > 0 ? `+${m.quantity}` : m.quantity})`,
      date: m.date || "",
      tone: m.type === "Returned" ? "neutral" : m.type === "Assigned" ? "accent" : "neutral",
    })),
  );

  const assignmentEvents = (assignments || []).map((a) => ({
    id: `asn-${a.id}`,
    type: a.status === "Lost" ? "alert" : "assigned",
    message: `${a.assigneeName} checked out ${a.quantity} ${a.item ? a.item.sport : "unit(s)"}`,
    date: a.assignedDate || "",
    tone: a.status === "Lost" ? "danger" : "accent",
  }));

  const feed = [...assignmentEvents, ...movements]
    .sort((l, r) => (r.date || "").localeCompare(l.date || ""))
    .slice(0, 6);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Just now";

    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;

    return parsed.toLocaleDateString();
  };

  return (
    <section className="rounded-[20px] border border-border-subtle/40 bg-surface-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-slate-900">Live Transactions</h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">LIVE</span>
      </div>
      <div className="mt-4 divide-y divide-border-subtle/60">
        {feed.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 py-3">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${entry.tone === "danger" ? "bg-red-600" : entry.tone === "accent" ? "bg-brand-blue" : "bg-slate-300"}`}></span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 text-[14px]">{entry.message}</p>
              <p className="mt-1 text-[11px] text-slate-500">{timeAgo(entry.date)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button type="button" onClick={onViewAll} className="w-full rounded-md bg-white px-3 py-2 text-[13px] font-bold text-slate-700 border border-border-subtle hover:bg-slate-50">
          View All Activity
        </button>
      </div>
    </section>
  );
}
