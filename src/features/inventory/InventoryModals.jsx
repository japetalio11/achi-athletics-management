import {
  Boxes,
  Camera,
  Download,
  FileText,
  Search,
  StickyNote,
  Undo2,
  UserPlus,
  Wrench,
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
import {
  assignmentTypes,
  inventoryCategories,
  inventoryConditions,
  inventoryLocations,
  inventorySports,
  inventoryStatuses,
} from "./inventoryTypes";

export function InventoryModals({
  modal,
  setModal,
  items,
  people,
  onClose,
  onSaveItem,
  onAssignItem,
  onReturnItem,
  onExtendAssignment,
  onAdjustStock,
  onSaveMaintenance,
  onSaveNote,
  onConfirmAction,
  onSelectItem,
  onExportCsv,
}) {
  if (!modal) return null;

  const updateValue = (key, value) => {
    setModal((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
      errors: { ...(current.errors ?? {}), [key]: undefined },
    }));
  };

  const updateModal = (patch) => setModal((current) => ({ ...current, ...patch }));

  if (modal.type === "item-form") {
    const isEdit = modal.mode === "edit";

    const save = () => {
      const errors = validateItemForm(modal.values, items, isEdit ? modal.item?.id : null);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveItem(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
        description={isEdit ? "Update local item details, stock, and categorization." : "Register an item for frontend stock and assignment tracking."}
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}>Save item</PrimaryButton>
          </>
        }
      >
        <InventoryItemForm values={modal.values} errors={modal.errors ?? {}} onChange={updateValue} />
      </Modal>
    );
  }

  if (modal.type === "assign") {
    const item = getModalItem(modal, items);
    const filteredPeople = filterPeople(people, modal.peopleSearch, modal.roleFilter, modal.sportFilter);

    const save = () => {
      const errors = validateAssignment(modal.values, item);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onAssignItem(item.id, modal.values);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Assign Inventory"
        description="Issue equipment or supplies to an athlete, coach, or staff member."
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><UserPlus className="h-3.5 w-3.5" />Confirm assignment</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          {!modal.item && (
            <FormSection title="Select Item">
              <Field label="Inventory item" error={modal.errors?.itemId}>
                <SelectInput value={modal.values.itemId} onChange={(event) => updateValue("itemId", event.target.value)}>
                  <option value="">Choose item</option>
                  {items.filter((candidate) => !candidate.archived).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.name} | {candidate.sku}</option>
                  ))}
                </SelectInput>
              </Field>
            </FormSection>
          )}

          {item && (
            <FeedbackPanel tone={item.availableQuantity > 0 ? "info" : "warning"} title={item.name}>
              {item.availableQuantity}/{item.totalQuantity} units available at {item.location}.
            </FeedbackPanel>
          )}

          <FormSection title="Select Assignee">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Search">
                <TextInput value={modal.peopleSearch} onChange={(event) => updateModal({ peopleSearch: event.target.value })} placeholder="Name, team, role..." />
              </Field>
              <Field label="Role">
                <SelectInput value={modal.roleFilter} onChange={(event) => updateModal({ roleFilter: event.target.value })}>
                  <option>All roles</option>
                  {assignmentTypes.map((type) => <option key={type}>{type}</option>)}
                </SelectInput>
              </Field>
              <Field label="Sport/team">
                <SelectInput value={modal.sportFilter} onChange={(event) => updateModal({ sportFilter: event.target.value })}>
                  <option>All sports</option>
                  {inventorySports.map((sport) => <option key={sport}>{sport}</option>)}
                </SelectInput>
              </Field>
            </div>
            <div className="mt-4 grid max-h-60 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredPeople.length === 0 ? (
                <EmptyState title="No assignees found" body="Adjust search, role, or sport filters." />
              ) : (
                filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => updateValue("personId", person.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      modal.values.personId === person.id
                        ? "border-brand-blue bg-brand-blue-light text-brand-blue"
                        : "border-border-subtle bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold">{person.name}</p>
                    <p className="mt-1 text-[12px]">{person.type} | {person.team}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{person.status}</p>
                  </button>
                ))
              )}
            </div>
            {modal.errors?.personId && <p className="mt-2 text-[11px] text-red-600">{modal.errors.personId}</p>}
          </FormSection>

          <FormSection title="Assignment Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quantity" error={modal.errors?.quantity}>
                <TextInput value={modal.values.quantity} onChange={(event) => updateValue("quantity", event.target.value)} />
              </Field>
              <Field label="Assigned date" error={modal.errors?.assignedDate}>
                <TextInput type="date" value={modal.values.assignedDate} onChange={(event) => updateValue("assignedDate", event.target.value)} />
              </Field>
              <Field label="Expected return date">
                <TextInput type="date" value={modal.values.dueDate} onChange={(event) => updateValue("dueDate", event.target.value)} />
              </Field>
              <Field label="Condition out">
                <SelectInput value={modal.values.conditionOut} onChange={(event) => updateValue("conditionOut", event.target.value)}>
                  {inventoryConditions.map((condition) => <option key={condition}>{condition}</option>)}
                </SelectInput>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes">
                  <TextArea value={modal.values.notes} onChange={(event) => updateValue("notes", event.target.value)} placeholder="Issue notes, purpose, or restrictions..." />
                </Field>
              </div>
            </div>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (modal.type === "return") {
    const item = getModalItem(modal, items);
    const activeAssignments = item?.assignments.filter((assignment) => assignment.status === "Active" || assignment.status === "Lost") ?? [];
    const assignment = modal.assignment ?? activeAssignments.find((entry) => entry.id === modal.values.assignmentId);

    const save = () => {
      const errors = validateReturn(modal.values, assignment);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onReturnItem(item.id, assignment.id, modal.values);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Return Inventory"
        description="Close an assignment and update available stock."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><Undo2 className="h-3.5 w-3.5" />Mark returned</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          {!modal.assignment && (
            <Field label="Assignment" error={modal.errors?.assignmentId}>
              <SelectInput value={modal.values.assignmentId} onChange={(event) => updateValue("assignmentId", event.target.value)}>
                <option value="">Choose active assignment</option>
                {activeAssignments.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.assigneeName} | {entry.quantity} unit(s)</option>
                ))}
              </SelectInput>
            </Field>
          )}
          {assignment && (
            <FeedbackPanel tone="info" title={assignment.assigneeName}>
              Returning {assignment.quantity} unit(s) from {assignment.assigneeType}. Due date: {assignment.dueDate || "Pending"}.
            </FeedbackPanel>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Returned quantity" error={modal.errors?.quantity}>
              <TextInput value={modal.values.quantity} onChange={(event) => updateValue("quantity", event.target.value)} />
            </Field>
            <Field label="Return date">
              <TextInput type="date" value={modal.values.returnDate} onChange={(event) => updateValue("returnDate", event.target.value)} />
            </Field>
            <Field label="Condition after return">
              <SelectInput value={modal.values.conditionIn} onChange={(event) => updateValue("conditionIn", event.target.value)}>
                {inventoryConditions.map((condition) => <option key={condition}>{condition}</option>)}
              </SelectInput>
            </Field>
            <Field label="Return status">
              <SelectInput value={modal.values.returnStatus} onChange={(event) => updateValue("returnStatus", event.target.value)}>
                <option>Returned</option>
                <option>Returned - Needs Inspection</option>
                <option>Returned - Damaged</option>
              </SelectInput>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Return notes">
                <TextArea value={modal.values.notes} onChange={(event) => updateValue("notes", event.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "extend") {
    const save = () => {
      if (!modal.values.dueDate) {
        setModal((current) => ({ ...current, errors: { dueDate: "Add the new expected return date." } }));
        return;
      }
      onExtendAssignment(modal.item.id, modal.assignment.id, modal.values);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Extend Return Date"
        description={`${modal.assignment.assigneeName} keeps this assignment open with a new due date.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}>Save extension</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="New due date" error={modal.errors?.dueDate}>
            <TextInput type="date" value={modal.values.dueDate} onChange={(event) => updateValue("dueDate", event.target.value)} />
          </Field>
          <Field label="Extension note">
            <TextArea value={modal.values.notes} onChange={(event) => updateValue("notes", event.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "stock") {
    const save = () => {
      const errors = validateStock(modal.values, modal.item);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onAdjustStock(modal.item.id, modal.values);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Adjust Stock"
        description={`${modal.item.name} currently has ${modal.item.availableQuantity}/${modal.item.totalQuantity} units available.`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><Boxes className="h-3.5 w-3.5" />Save adjustment</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Adjustment type">
            <SelectInput value={modal.values.adjustmentType} onChange={(event) => updateValue("adjustmentType", event.target.value)}>
              <option>Add stock</option>
              <option>Remove stock</option>
              <option>Set available quantity</option>
              <option>Set total quantity</option>
            </SelectInput>
          </Field>
          <Field label="Quantity" error={modal.errors?.quantity}>
            <TextInput value={modal.values.quantity} onChange={(event) => updateValue("quantity", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason" error={modal.errors?.reason}>
              <TextArea value={modal.values.reason} onChange={(event) => updateValue("reason", event.target.value)} placeholder="Restock, audit correction, loss, damage, or transfer..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "maintenance") {
    const item = getModalItem(modal, items);
    const save = () => {
      const errors = validateMaintenance(modal.values, item);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveMaintenance(item.id, modal.values);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Maintenance Record"
        description="Record inspection, damage, repair, cleaning, or retirement information."
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><Wrench className="h-3.5 w-3.5" />Save maintenance</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          {!modal.item && (
            <FormSection title="Select Item">
              <Field label="Inventory item" error={modal.errors?.itemId}>
                <SelectInput value={modal.values.itemId} onChange={(event) => updateValue("itemId", event.target.value)}>
                  <option value="">Choose item</option>
                  {items.filter((candidate) => !candidate.archived).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.name} | {candidate.sku}</option>
                  ))}
                </SelectInput>
              </Field>
            </FormSection>
          )}
          <FormSection title="Maintenance Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Maintenance status">
                <SelectInput value={modal.values.status} onChange={(event) => updateValue("status", event.target.value)}>
                  <option>Good</option>
                  <option>Needs Inspection</option>
                  <option>Under Maintenance</option>
                  <option>Damaged</option>
                  <option>Lost</option>
                  <option>Retired</option>
                </SelectInput>
              </Field>
              <Field label="Date reported">
                <TextInput type="date" value={modal.values.dateReported} onChange={(event) => updateValue("dateReported", event.target.value)} />
              </Field>
              <Field label="Cost">
                <TextInput value={modal.values.cost} onChange={(event) => updateValue("cost", event.target.value)} placeholder="0" />
              </Field>
              <Field label="Next inspection">
                <TextInput type="date" value={modal.values.nextInspectionDate} onChange={(event) => updateValue("nextInspectionDate", event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Issue description" error={modal.errors?.issue}>
                  <TextArea value={modal.values.issue} onChange={(event) => updateValue("issue", event.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Resolution notes">
                  <TextArea value={modal.values.resolution} onChange={(event) => updateValue("resolution", event.target.value)} />
                </Field>
              </div>
            </div>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (modal.type === "note") {
    const save = () => {
      const errors = validateNote(modal.values);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveNote(modal.item.id, modal.values, modal.note?.id);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={modal.mode === "edit" ? "Edit Note" : "Add Note"}
        description="Capture internal inventory notes, maintenance remarks, or staff guidance."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><StickyNote className="h-3.5 w-3.5" />Save note</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Title" error={modal.errors?.title}>
            <TextInput value={modal.values.title} onChange={(event) => updateValue("title", event.target.value)} />
          </Field>
          <Field label="Note type">
            <SelectInput value={modal.values.type} onChange={(event) => updateValue("type", event.target.value)}>
              <option>Administrative</option>
              <option>Usage</option>
              <option>Maintenance</option>
              <option>Staff Remark</option>
            </SelectInput>
          </Field>
          <Field label="Note" error={modal.errors?.body}>
            <TextArea value={modal.values.body} onChange={(event) => updateValue("body", event.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "scanner") {
    const foundItem = items.find((item) => item.id === modal.resultId);

    const lookup = () => {
      const query = modal.query.trim().toLowerCase();
      const result = items.find((item) =>
        [item.name, item.sku, item.id].join(" ").toLowerCase().includes(query),
      );
      if (!query || !result) {
        setModal((current) => ({ ...current, resultId: "", error: "No item found for that code or search term." }));
        return;
      }
      setModal((current) => ({ ...current, resultId: result.id, error: "" }));
    };

    return (
      <Modal
        open
        onClose={onClose}
        title="Inventory Scanner"
        description="Mock scanner lookup by SKU, QR ID, or item name."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            {foundItem && <PrimaryButton onClick={() => onSelectItem(foundItem)}><FileText className="h-3.5 w-3.5" />Open item</PrimaryButton>}
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-6 text-center">
            <Camera className="mx-auto h-8 w-8 text-brand-blue" />
            <p className="mt-3 text-[13px] font-semibold text-slate-700">
              Camera hardware can connect here later. This frontend mock lookup is fully interactive today.
            </p>
          </div>
          <Field label="SKU / QR ID / item name" error={modal.error}>
            <div className="flex gap-2">
              <TextInput value={modal.query} onChange={(event) => updateModal({ query: event.target.value, error: "" })} placeholder="ADNU-VB-042" />
              <button type="button" onClick={lookup} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-[12px] font-bold text-white">
                <Search className="h-3.5 w-3.5" />
                Find
              </button>
            </div>
          </Field>
          {foundItem && (
            <FeedbackPanel tone="success" title={foundItem.name}>
              {foundItem.sku} | {foundItem.availableQuantity}/{foundItem.totalQuantity} available | {foundItem.location}
            </FeedbackPanel>
          )}
        </div>
      </Modal>
    );
  }

  if (modal.type === "export") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Export Inventory Report"
        description="Create a frontend CSV report from current local inventory state."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={onExportCsv}><Download className="h-3.5 w-3.5" />Download CSV</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="info" title="Report ready">
          This exports the local frontend dataset. Backend exports can replace this handler when persistence is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "confirm") {
    const copy = getConfirmCopy(modal);
    return (
      <Modal
        open
        onClose={onClose}
        title={copy.title}
        description={copy.description}
        footer={
          <>
            <SecondaryButton onClick={onClose}>{copy.cancelLabel}</SecondaryButton>
            <PrimaryButton tone={copy.tone} onClick={() => onConfirmAction(modal)}>{copy.confirmLabel}</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone={copy.panelTone} title="Confirmation required">
          {copy.body}
        </FeedbackPanel>
      </Modal>
    );
  }

  return null;
}

function InventoryItemForm({ values, errors, onChange }) {
  return (
    <div className="space-y-5">
      <FormSection title="Basic Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" error={errors.name}>
            <TextInput value={values.name} onChange={(event) => onChange("name", event.target.value)} />
          </Field>
          <Field label="Item ID / SKU" error={errors.sku}>
            <TextInput value={values.sku} onChange={(event) => onChange("sku", event.target.value)} placeholder="ADNU-XX-000" />
          </Field>
          <Field label="Brand">
            <TextInput value={values.brand} onChange={(event) => onChange("brand", event.target.value)} />
          </Field>
          <Field label="Model">
            <TextInput value={values.model} onChange={(event) => onChange("model", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea value={values.description} onChange={(event) => onChange("description", event.target.value)} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection title="Stock & Availability">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total quantity" error={errors.totalQuantity}>
            <TextInput value={values.totalQuantity} onChange={(event) => onChange("totalQuantity", event.target.value)} />
          </Field>
          <Field label="Available quantity" error={errors.availableQuantity}>
            <TextInput value={values.availableQuantity} onChange={(event) => onChange("availableQuantity", event.target.value)} />
          </Field>
          <Field label="Condition">
            <SelectInput value={values.condition} onChange={(event) => onChange("condition", event.target.value)}>
              {inventoryConditions.map((condition) => <option key={condition}>{condition}</option>)}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput value={values.status} onChange={(event) => onChange("status", event.target.value)}>
              {inventoryStatuses.map((status) => <option key={status}>{status}</option>)}
            </SelectInput>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Category & Location">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category">
            <SelectInput value={values.category} onChange={(event) => onChange("category", event.target.value)}>
              {inventoryCategories.map((category) => <option key={category}>{category}</option>)}
            </SelectInput>
          </Field>
          <Field label="Sport/team">
            <SelectInput value={values.sport} onChange={(event) => onChange("sport", event.target.value)}>
              {inventorySports.map((sport) => <option key={sport}>{sport}</option>)}
            </SelectInput>
          </Field>
          <Field label="Location">
            <SelectInput value={values.location} onChange={(event) => onChange("location", event.target.value)}>
              {inventoryLocations.map((location) => <option key={location}>{location}</option>)}
            </SelectInput>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Optional Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Size / specs">
            <TextInput value={values.size} onChange={(event) => onChange("size", event.target.value)} />
          </Field>
          <Field label="Vendor">
            <TextInput value={values.vendor} onChange={(event) => onChange("vendor", event.target.value)} />
          </Field>
          <Field label="Purchase date">
            <TextInput type="date" value={values.purchaseDate} onChange={(event) => onChange("purchaseDate", event.target.value)} />
          </Field>
          <Field label="Unit cost">
            <TextInput value={values.unitCost} onChange={(event) => onChange("unitCost", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={values.notes} onChange={(event) => onChange("notes", event.target.value)} />
            </Field>
          </div>
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

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-slate-50/70 p-5 text-center">
      <p className="text-[14px] font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-[13px] leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function getModalItem(modal, items) {
  return modal.item ?? items.find((item) => item.id === modal.values?.itemId);
}

function filterPeople(people, search = "", role = "All roles", sport = "All sports") {
  const searchValue = search.trim().toLowerCase();
  return people.filter((person) => {
    const text = [person.name, person.id, person.type, person.sport, person.team, person.status].join(" ").toLowerCase();
    const matchesSearch = !searchValue || text.includes(searchValue);
    const matchesRole = role === "All roles" || person.type === role;
    const matchesSport = sport === "All sports" || person.sport === sport || person.team === sport;
    return matchesSearch && matchesRole && matchesSport;
  });
}

function validateItemForm(values, items, editingId) {
  const errors = {};
  const total = Number(values.totalQuantity);
  const available = Number(values.availableQuantity);
  const sku = values.sku.trim().toLowerCase();

  if (!values.name.trim()) errors.name = "Item name is required.";
  if (!values.sku.trim()) errors.sku = "SKU is required.";
  if (sku && items.some((item) => item.sku.toLowerCase() === sku && item.id !== editingId)) {
    errors.sku = "This SKU already exists.";
  }
  if (Number.isNaN(total) || total < 0) errors.totalQuantity = "Total quantity must be a positive number.";
  if (Number.isNaN(available) || available < 0) errors.availableQuantity = "Available quantity must be a positive number.";
  if (!Number.isNaN(total) && !Number.isNaN(available) && available > total) {
    errors.availableQuantity = "Available quantity cannot exceed total quantity.";
  }
  if (values.unitCost && (Number.isNaN(Number(values.unitCost)) || Number(values.unitCost) < 0)) {
    errors.unitCost = "Unit cost must be numeric.";
  }

  return errors;
}

function validateAssignment(values, item) {
  const errors = {};
  const quantity = Number(values.quantity);
  if (!item) errors.itemId = "Choose an inventory item.";
  if (!values.personId) errors.personId = "Select an assignee.";
  if (Number.isNaN(quantity) || quantity <= 0) errors.quantity = "Quantity must be greater than zero.";
  if (item && quantity > item.availableQuantity) errors.quantity = "Quantity cannot exceed available stock.";
  if (!values.assignedDate) errors.assignedDate = "Assigned date is required.";
  return errors;
}

function validateReturn(values, assignment) {
  const errors = {};
  const quantity = Number(values.quantity);
  if (!assignment) errors.assignmentId = "Choose an active assignment.";
  if (Number.isNaN(quantity) || quantity <= 0) errors.quantity = "Returned quantity must be greater than zero.";
  if (assignment && quantity > assignment.quantity) errors.quantity = "Returned quantity cannot exceed assigned quantity.";
  return errors;
}

function validateStock(values, item) {
  const errors = {};
  const quantity = Number(values.quantity);
  if (Number.isNaN(quantity) || quantity < 0) errors.quantity = "Quantity must be zero or greater.";
  if (!values.reason.trim()) errors.reason = "Add a reason for the stock adjustment.";
  if (item && values.adjustmentType === "Remove stock" && quantity > item.availableQuantity) {
    errors.quantity = "Cannot remove more than available stock.";
  }
  if (item && values.adjustmentType === "Set available quantity" && quantity > item.totalQuantity) {
    errors.quantity = "Available quantity cannot exceed total quantity.";
  }
  if (item && values.adjustmentType === "Set total quantity" && quantity < item.totalQuantity - item.availableQuantity) {
    errors.quantity = "Total quantity cannot be lower than currently assigned units.";
  }
  return errors;
}

function validateMaintenance(values, item) {
  const errors = {};
  if (!item) errors.itemId = "Choose an inventory item.";
  if (!values.issue.trim()) errors.issue = "Describe the issue or maintenance action.";
  if (values.cost && Number.isNaN(Number(values.cost))) errors.cost = "Cost must be numeric.";
  return errors;
}

function validateNote(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Note title is required.";
  if (!values.body.trim()) errors.body = "Note body is required.";
  return errors;
}

function getConfirmCopy(modal) {
  const name = modal.item?.name ?? "this item";
  const defaults = {
    title: "Confirm Action",
    description: "This updates local frontend state.",
    cancelLabel: "Cancel",
    confirmLabel: "Confirm",
    tone: "brand",
    panelTone: "warning",
    body: "This is a frontend-only update until backend persistence and audit logging are connected.",
  };

  const copies = {
    archive: {
      title: "Archive Item",
      description: `${name} will be hidden from active inventory views.`,
      confirmLabel: "Archive item",
      tone: "danger",
      panelTone: "danger",
    },
    delete: {
      title: "Delete Item",
      description: `${name} will be removed from local inventory state.`,
      confirmLabel: "Delete item",
      tone: "danger",
      panelTone: "danger",
    },
    retire: {
      title: "Retire Item",
      description: `${name} will remain visible with retired status.`,
      confirmLabel: "Retire item",
      tone: "danger",
      panelTone: "danger",
    },
    lost: {
      title: "Mark Item Lost",
      description: `${name} will be marked as lost and unavailable.`,
      confirmLabel: "Mark lost",
      tone: "danger",
      panelTone: "danger",
    },
    damaged: {
      title: "Mark Item Damaged",
      description: `${name} will be marked as damaged and unavailable for normal issue.`,
      confirmLabel: "Mark damaged",
      tone: "danger",
      panelTone: "danger",
    },
    repaired: {
      title: "Mark Item Repaired",
      description: `${name} will return to good condition and normal availability.`,
      confirmLabel: "Mark repaired",
      tone: "brand",
      panelTone: "success",
    },
    inspection: {
      title: "Needs Inspection",
      description: `${name} will be flagged for inspection.`,
      confirmLabel: "Flag inspection",
      tone: "gold",
    },
    "delete-note": {
      title: "Delete Note",
      description: `Delete this note from ${name}.`,
      confirmLabel: "Delete note",
      tone: "danger",
      panelTone: "danger",
    },
    "lost-assignment": {
      title: "Mark Assignment Lost",
      description: `${modal.assignment?.assigneeName ?? "The assignee"} will have this assignment marked lost.`,
      confirmLabel: "Mark lost",
      tone: "danger",
      panelTone: "danger",
    },
    "damaged-assignment": {
      title: "Mark Assignment Damaged",
      description: `${modal.assignment?.assigneeName ?? "The assignee"} will have this assignment marked damaged.`,
      confirmLabel: "Mark damaged",
      tone: "danger",
      panelTone: "danger",
    },
  };

  return { ...defaults, ...(copies[modal.action] ?? {}) };
}
