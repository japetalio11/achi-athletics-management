import { useEffect, useMemo, useState } from "react";
import { FeedbackPanel } from "../../components/ui/Modal";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  createInventoryItemFromForm,
  inventoryItemToForm,
  inventoryPeople,
  mergeInventoryItemForm,
  mockInventoryItems,
} from "./inventoryMockData";
import { InventoryItemInfoPage } from "./InventoryItemInfoPage";
import { InventoryList } from "./InventoryList";
import { InventoryModals } from "./InventoryModals";
import { defaultModalPayload } from "./inventoryModalPayload";
import { deriveInventoryStatus, emptyInventoryForm, formatDate, todayIso } from "./inventoryTypes";

export function InventoryHub() {
  const {
    selectedInventoryItem,
    setSelectedInventoryItem,
    selectInventoryItem,
    clearSelectedInventoryItem,
    setSelectedAthlete,
    setSelectedCoach,
    navigateTo,
  } = useNavigation();
  const [items, setItems] = useState(mockInventoryItems);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const activeItem = useMemo(() => {
    if (!selectedInventoryItem?.id) return null;
    return items.find((item) => item.id === selectedInventoryItem.id) ?? null;
  }, [items, selectedInventoryItem]);

  const showFeedback = (tone, title, message) => {
    setFeedback({ tone, title, message });
  };

  const openModal = (payload) => {
    if (payload.type === "item-form") {
      setModal({
        ...payload,
        values:
          payload.mode === "edit" && payload.item
            ? inventoryItemToForm(payload.item)
            : { ...emptyInventoryForm },
        errors: {},
      });
      return;
    }

    setModal(defaultModalPayload(payload, items));
  };

  const closeModal = () => setModal(null);

  const selectItem = (item, initialTab = "overview") => {
    selectInventoryItem(item, initialTab);
  };

  const updateItem = (itemId, updater, feedbackPayload) => {
    let updatedItem = null;

    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        updatedItem = typeof updater === "function" ? updater(item) : { ...item, ...updater };
        return {
          ...updatedItem,
          updatedAt: todayIso(),
        };
      }),
    );

    if (updatedItem && selectedInventoryItem?.id === itemId) {
      setSelectedInventoryItem({
        id: updatedItem.id,
        name: updatedItem.name,
        initialTab: selectedInventoryItem.initialTab,
      });
    }

    if (feedbackPayload) {
      showFeedback(feedbackPayload.tone ?? "success", feedbackPayload.title, feedbackPayload.message);
    }
  };

  const saveItem = (payload) => {
    if (payload.mode === "add") {
      const newItem = createInventoryItemFromForm(payload.values);
      setItems((current) => [newItem, ...current]);
      selectItem(newItem);
      showFeedback("success", "Inventory item added", `${newItem.name} was added to local inventory.`);
    } else {
      updateItem(
        payload.item.id,
        (item) => appendHistory(mergeInventoryItemForm(item, payload.values), "Item details updated locally."),
        {
          title: "Inventory item updated",
          message: `${payload.values.name} was updated in local state.`,
        },
      );
    }
    closeModal();
  };

  const assignItem = (itemId, values) => {
    const person = inventoryPeople.find((candidate) => candidate.id === values.personId);
    const quantity = Number(values.quantity);

    updateItem(
      itemId,
      (item) => {
        const nextAvailable = Math.max(0, item.availableQuantity - quantity);
        const nextItem = {
          ...item,
          availableQuantity: nextAvailable,
          assignments: [
            {
              id: `ASN-${Date.now()}`,
              assigneeId: person.id,
              assigneeName: person.name,
              assigneeType: person.type,
              sport: person.sport,
              quantity,
              assignedDate: values.assignedDate,
              dueDate: values.dueDate,
              returnDate: "",
              status: "Active",
              conditionOut: values.conditionOut,
              conditionIn: "",
              notes: values.notes.trim(),
            },
            ...item.assignments,
          ],
          stockMovements: [
            {
              id: `STK-${Date.now()}`,
              date: values.assignedDate,
              type: "Assigned",
              quantity: -quantity,
              balance: nextAvailable,
              note: `Issued to ${person.name}`,
            },
            ...item.stockMovements,
          ],
        };

        return appendHistory(
          { ...nextItem, status: deriveInventoryStatus(nextItem) },
          `${quantity} unit(s) assigned to ${person.name}.`,
        );
      },
      {
        title: "Item assigned",
        message: `${quantity} unit(s) assigned to ${person.name}.`,
      },
    );
    closeModal();
  };

  const returnItem = (itemId, assignmentId, values) => {
    const quantity = Number(values.quantity);

    updateItem(
      itemId,
      (item) => {
        const assignment = item.assignments.find((entry) => entry.id === assignmentId);
        const fullyReturned = quantity >= assignment.quantity;
        const returnedRecord = {
          ...assignment,
          id: fullyReturned ? assignment.id : `ASN-RET-${Date.now()}`,
          quantity,
          returnDate: values.returnDate,
          status: values.returnStatus,
          conditionIn: values.conditionIn,
          notes: values.notes.trim() || assignment.notes,
        };
        const nextAssignments = item.assignments.flatMap((entry) => {
          if (entry.id !== assignmentId) return [entry];
          if (fullyReturned) return [returnedRecord];
          return [
            { ...entry, quantity: entry.quantity - quantity, notes: `${entry.notes} Partial return recorded.`.trim() },
            returnedRecord,
          ];
        });
        const nextAvailable = Math.min(item.totalQuantity, item.availableQuantity + quantity);
        const conditionNeedsAttention =
          values.conditionIn === "Damaged" || values.returnStatus.includes("Damaged");
        const inspectionNeeded = values.conditionIn === "Needs Inspection" || values.returnStatus.includes("Inspection");
        const nextBase = {
          ...item,
          availableQuantity: nextAvailable,
          condition: conditionNeedsAttention ? "Damaged" : inspectionNeeded ? "Needs Inspection" : item.condition,
          assignments: nextAssignments,
          stockMovements: [
            {
              id: `STK-${Date.now()}`,
              date: values.returnDate,
              type: "Returned",
              quantity,
              balance: nextAvailable,
              note: `Returned by ${assignment.assigneeName}`,
            },
            ...item.stockMovements,
          ],
        };
        const nextStatus = conditionNeedsAttention
          ? "Damaged"
          : inspectionNeeded
            ? "Needs Inspection"
            : deriveInventoryStatus(nextBase);

        return appendHistory(
          { ...nextBase, status: nextStatus },
          `${quantity} unit(s) returned by ${assignment.assigneeName}.`,
        );
      },
      {
        title: "Item returned",
        message: "Availability and assignment history were updated locally.",
      },
    );
    closeModal();
  };

  const extendAssignment = (itemId, assignmentId, values) => {
    updateItem(
      itemId,
      (item) =>
        appendHistory(
          {
            ...item,
            assignments: item.assignments.map((assignment) =>
              assignment.id === assignmentId
                ? {
                    ...assignment,
                    dueDate: values.dueDate,
                    notes: values.notes.trim()
                      ? `${assignment.notes} Extension: ${values.notes.trim()}`.trim()
                      : assignment.notes,
                  }
                : assignment,
            ),
          },
          `Assignment due date extended to ${formatDate(values.dueDate)}.`,
        ),
      {
        title: "Return date extended",
        message: "The assignment due date was updated locally.",
      },
    );
    closeModal();
  };

  const adjustStock = (itemId, values) => {
    const quantity = Number(values.quantity);

    updateItem(
      itemId,
      (item) => {
        let totalQuantity = item.totalQuantity;
        let availableQuantity = item.availableQuantity;
        let movementQuantity = quantity;

        if (values.adjustmentType === "Add stock") {
          totalQuantity += quantity;
          availableQuantity += quantity;
        } else if (values.adjustmentType === "Remove stock") {
          totalQuantity -= quantity;
          availableQuantity -= quantity;
          movementQuantity = -quantity;
        } else if (values.adjustmentType === "Set available quantity") {
          movementQuantity = quantity - item.availableQuantity;
          availableQuantity = quantity;
        } else if (values.adjustmentType === "Set total quantity") {
          movementQuantity = quantity - item.totalQuantity;
          totalQuantity = quantity;
          availableQuantity = Math.min(availableQuantity, totalQuantity);
        }

        const nextItem = {
          ...item,
          totalQuantity,
          availableQuantity,
          stockMovements: [
            {
              id: `STK-${Date.now()}`,
              date: todayIso(),
              type: values.adjustmentType,
              quantity: movementQuantity,
              balance: availableQuantity,
              note: values.reason.trim(),
            },
            ...item.stockMovements,
          ],
        };

        return appendHistory(
          { ...nextItem, status: deriveInventoryStatus(nextItem) },
          `${values.adjustmentType}: ${values.reason.trim()}`,
        );
      },
      {
        title: "Stock adjusted",
        message: "Stock counts and movement history were updated locally.",
      },
    );
    closeModal();
  };

  const saveMaintenance = (itemId, values) => {
    updateItem(
      itemId,
      (item) => {
        const status = values.status === "Good" ? "Available" : values.status;
        const condition = values.status === "Good" ? "Good" : values.status;
        const nextItem = {
          ...item,
          status,
          condition,
          maintenanceRecords: [
            {
              id: `MNT-${Date.now()}`,
              status: values.status,
              dateReported: values.dateReported,
              issue: values.issue.trim(),
              resolution: values.resolution.trim(),
              cost: values.cost ? Number(values.cost) : 0,
              nextInspectionDate: values.nextInspectionDate,
            },
            ...item.maintenanceRecords,
          ],
        };

        return appendHistory(nextItem, `Maintenance record added: ${values.issue.trim()}`);
      },
      {
        tone: values.status === "Good" ? "success" : "warning",
        title: "Maintenance saved",
        message: "Maintenance status and history were updated locally.",
      },
    );
    closeModal();
  };

  const saveNote = (itemId, values, noteId) => {
    updateItem(
      itemId,
      (item) => {
        const note = {
          id: noteId ?? `NOTE-${Date.now()}`,
          title: values.title.trim(),
          type: values.type,
          body: values.body.trim(),
          author: "Athletics Staff",
          createdAt: todayIso(),
        };
        const notes = noteId
          ? item.notes.map((entry) => (entry.id === noteId ? note : entry))
          : [note, ...item.notes];

        return appendHistory(
          { ...item, notes },
          noteId ? `Note updated: ${note.title}` : `Note added: ${note.title}`,
        );
      },
      {
        title: noteId ? "Note updated" : "Note added",
        message: "Inventory notes were updated locally.",
      },
    );
    closeModal();
  };

  const confirmAction = (payload) => {
    const item = payload.item;

    if (payload.action === "delete") {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (selectedInventoryItem?.id === item.id) {
        clearSelectedInventoryItem();
      }
      showFeedback("danger", "Item deleted", `${item.name} was removed from local inventory.`);
      closeModal();
      return;
    }

    if (payload.action === "delete-note") {
      updateItem(
        item.id,
        (currentItem) =>
          appendHistory(
            {
              ...currentItem,
              notes: currentItem.notes.filter((note) => note.id !== payload.note.id),
            },
            `Note deleted: ${payload.note.title}`,
          ),
        {
          tone: "warning",
          title: "Note deleted",
          message: "The inventory note was removed locally.",
        },
      );
      closeModal();
      return;
    }

    if (payload.action === "lost-assignment" || payload.action === "damaged-assignment") {
      const status = payload.action === "lost-assignment" ? "Lost" : "Damaged";
      updateItem(
        item.id,
        (currentItem) =>
          appendHistory(
            {
              ...currentItem,
              status,
              condition: status,
              assignments: currentItem.assignments.map((assignment) =>
                assignment.id === payload.assignment.id
                  ? { ...assignment, status, conditionIn: status }
                  : assignment,
              ),
            },
            `${payload.assignment.assigneeName} assignment marked ${status.toLowerCase()}.`,
          ),
        {
          tone: "danger",
          title: `Assignment marked ${status.toLowerCase()}`,
          message: "Assignment and item status were updated locally.",
        },
      );
      closeModal();
      return;
    }

    const statusMap = {
      archive: { status: "Archived", condition: item.condition, archived: true, tone: "warning", title: "Item archived" },
      retire: { status: "Retired", condition: "Retired", archived: false, tone: "warning", title: "Item retired" },
      lost: { status: "Lost", condition: "Lost", archived: false, tone: "danger", title: "Item marked lost" },
      damaged: { status: "Damaged", condition: "Damaged", archived: false, tone: "danger", title: "Item marked damaged" },
      repaired: { status: "Available", condition: "Good", archived: false, tone: "success", title: "Item marked repaired" },
      inspection: { status: "Needs Inspection", condition: "Needs Inspection", archived: false, tone: "warning", title: "Inspection flagged" },
    };

    const patch = statusMap[payload.action];
    if (!patch) return;

    updateItem(
      item.id,
      (currentItem) =>
        appendHistory(
          {
            ...currentItem,
            status: patch.status,
            condition: patch.condition,
            archived: patch.archived,
          },
          `${patch.title}.`,
        ),
      {
        tone: patch.tone,
        title: patch.title,
        message: `${item.name} was updated locally.`,
      },
    );
    closeModal();
  };

  const duplicateItem = (item) => {
    const newId = `INV-${String(Date.now()).slice(-6)}`;
    const newItem = {
      ...item,
      id: newId,
      sku: `${item.sku}-COPY`,
      name: `${item.name} Copy`,
      availableQuantity: item.totalQuantity,
      assignments: [],
      maintenanceRecords: [],
      stockMovements: [
        {
          id: `STK-${Date.now()}`,
          date: todayIso(),
          type: "Duplicated",
          quantity: item.totalQuantity,
          balance: item.totalQuantity,
          note: `Duplicated from ${item.sku}`,
        },
      ],
      notes: [],
      history: [`${new Date().toLocaleDateString()} - Duplicated from ${item.sku}.`],
      status: "Available",
      condition: item.condition === "Lost" || item.condition === "Retired" ? "Good" : item.condition,
      archived: false,
      updatedAt: todayIso(),
    };
    setItems((current) => [newItem, ...current]);
    selectItem(newItem);
    showFeedback("success", "Item duplicated", `${newItem.name} was created locally.`);
  };

  const exportCsv = () => {
    const headers = ["SKU", "Name", "Category", "Sport", "Available", "Total", "Status", "Condition", "Location"];
    const rows = items.map((item) =>
      [
        item.sku,
        item.name,
        item.category,
        item.sport,
        item.availableQuantity,
        item.totalQuantity,
        item.status,
        item.condition,
        item.location,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adnu-inventory-${todayIso()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Inventory exported", "A CSV report was generated from local frontend state.");
    closeModal();
  };

  const openPersonProfile = (assignment) => {
    if (assignment.assigneeType === "Athlete") {
      setSelectedAthlete({ id: assignment.assigneeId, name: assignment.assigneeName, initialTab: "assets" });
      navigateTo("athletes");
      return;
    }
    if (assignment.assigneeType === "Coach") {
      setSelectedCoach({ id: assignment.assigneeId, name: assignment.assigneeName, initialTab: "overview" });
      navigateTo("coaches");
      return;
    }
    showFeedback("info", "Staff profile unavailable", "Staff directory routing can be connected when that module exists.");
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <FeedbackPanel tone={feedback.tone} title={feedback.title}>
          {feedback.message}
        </FeedbackPanel>
      )}

      {selectedInventoryItem ? (
        <InventoryItemInfoPage
          item={activeItem}
          initialTab={selectedInventoryItem.initialTab}
          onBack={clearSelectedInventoryItem}
          onSelectTab={(tabId) =>
            activeItem &&
            setSelectedInventoryItem({
              id: activeItem.id,
              name: activeItem.name,
              initialTab: tabId,
            })
          }
          onOpenModal={openModal}
          onDuplicateItem={duplicateItem}
          onOpenPersonProfile={openPersonProfile}
        />
      ) : (
        <InventoryList
          items={items}
          onSelectItem={selectItem}
          onOpenModal={openModal}
          onDuplicateItem={duplicateItem}
        />
      )}

      <InventoryModals
        modal={modal}
        setModal={setModal}
        items={items}
        people={inventoryPeople}
        onClose={closeModal}
        onSaveItem={saveItem}
        onAssignItem={assignItem}
        onReturnItem={returnItem}
        onExtendAssignment={extendAssignment}
        onAdjustStock={adjustStock}
        onSaveMaintenance={saveMaintenance}
        onSaveNote={saveNote}
        onConfirmAction={confirmAction}
        onSelectItem={(item) => {
          closeModal();
          selectItem(item);
        }}
        onExportCsv={exportCsv}
      />
    </div>
  );
}

function appendHistory(item, entry) {
  return {
    ...item,
    history: [`${new Date().toLocaleDateString()} - ${entry}`, ...(item.history ?? [])],
  };
}
