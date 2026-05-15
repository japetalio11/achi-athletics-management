export const inventoryCategories = [
  "Equipment",
  "Uniforms",
  "Medical Supplies",
  "Training Gear",
  "Documents/Forms",
  "Other Supplies",
];

export const inventorySports = [
  "Basketball",
  "Volleyball",
  "Football",
  "Track & Field",
  "Swimming",
  "All Athletics",
];

export const inventoryStatuses = [
  "Available",
  "Partially Assigned",
  "Assigned",
  "Low Stock",
  "Needs Inspection",
  "Under Maintenance",
  "Damaged",
  "Lost",
  "Retired",
  "Archived",
];

export const inventoryConditions = [
  "Excellent",
  "Good",
  "Fair",
  "Needs Inspection",
  "Under Maintenance",
  "Damaged",
  "Lost",
  "Retired",
];

export const inventoryLocations = [
  "Main Equipment Room",
  "Fr. Godofredo Alingal Gym",
  "University Oval Track",
  "Aquatics Center",
  "Sports Medicine Clinic",
  "Records Office",
];

export const assignmentTypes = ["Athlete", "Coach", "Staff"];

export const defaultInventoryFilters = {
  search: "",
  category: "All categories",
  sport: "All sports",
  condition: "All conditions",
  availability: "Any availability",
  status: "All statuses",
  location: "All locations",
  sort: "Recently updated",
};

export const emptyInventoryForm = {
  name: "",
  sku: "",
  category: inventoryCategories[0],
  sport: inventorySports[0],
  totalQuantity: "1",
  availableQuantity: "1",
  condition: "Good",
  status: "Available",
  location: inventoryLocations[0],
  brand: "",
  model: "",
  size: "",
  description: "",
  vendor: "",
  purchaseDate: "",
  unitCost: "",
  notes: "",
};

export function getStatusTone(status) {
  if (status === "Available") return "bg-green-50 text-green-700";
  if (status === "Partially Assigned" || status === "Assigned") return "bg-brand-blue-light text-brand-blue";
  if (status === "Low Stock" || status === "Needs Inspection" || status === "Under Maintenance") {
    return "bg-amber-50 text-amber-700";
  }
  if (status === "Damaged" || status === "Lost") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export function getConditionTone(condition) {
  if (condition === "Excellent" || condition === "Good") return "bg-green-50 text-green-700";
  if (condition === "Fair" || condition === "Needs Inspection" || condition === "Under Maintenance") {
    return "bg-amber-50 text-amber-700";
  }
  if (condition === "Damaged" || condition === "Lost") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export function getAvailabilityLabel(item) {
  if (item.status === "Lost" || item.condition === "Lost") return "Lost";
  if (item.status === "Retired" || item.status === "Archived") return item.status;
  if (item.availableQuantity <= 0) return "Fully assigned";
  if (item.availableQuantity < item.totalQuantity) return "Partially available";
  return "Available";
}

export function deriveInventoryStatus(item) {
  if (["Archived", "Retired", "Lost", "Damaged", "Under Maintenance", "Needs Inspection"].includes(item.status)) {
    return item.status;
  }
  if (item.availableQuantity <= 0) return "Assigned";
  if (item.availableQuantity < item.totalQuantity) return "Partially Assigned";
  if (item.availableQuantity <= Math.max(1, Math.floor(item.totalQuantity * 0.2))) return "Low Stock";
  return "Available";
}

export function formatCurrency(value) {
  if (value === "" || value === null || value === undefined) return "Pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "Pending";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
