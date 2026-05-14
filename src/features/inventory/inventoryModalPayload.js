import { todayIso } from "./inventoryTypes";

export function defaultModalPayload(payload, items) {
  const today = todayIso();
  const item = payload.item;

  if (payload.type === "assign") {
    return {
      ...payload,
      peopleSearch: "",
      roleFilter: "All roles",
      sportFilter: "All sports",
      values: {
        itemId: item?.id ?? "",
        personId: "",
        quantity: "1",
        assignedDate: today,
        dueDate: "",
        conditionOut: item?.condition ?? "Good",
        notes: "",
      },
      errors: {},
    };
  }
  if (payload.type === "return") {
    const activeAssignment =
      payload.assignment ?? item?.assignments.find((assignment) => assignment.status === "Active");
    return {
      ...payload,
      values: {
        assignmentId: activeAssignment?.id ?? "",
        quantity: activeAssignment ? String(activeAssignment.quantity) : "1",
        returnDate: today,
        conditionIn: item?.condition === "Damaged" ? "Damaged" : "Good",
        returnStatus: "Returned",
        notes: "",
      },
      errors: {},
    };
  }
  if (payload.type === "extend") {
    return {
      ...payload,
      values: {
        dueDate: payload.assignment?.dueDate ?? today,
        notes: "",
      },
      errors: {},
    };
  }
  if (payload.type === "stock") {
    return {
      ...payload,
      values: {
        adjustmentType: "Add stock",
        quantity: "1",
        reason: "",
      },
      errors: {},
    };
  }
  if (payload.type === "maintenance") {
    return {
      ...payload,
      values: {
        itemId: item?.id ?? "",
        status: payload.status ?? item?.status ?? "Needs Inspection",
        dateReported: today,
        issue: payload.status === "Under Maintenance" ? "Maintenance intake" : "",
        resolution: "",
        cost: "0",
        nextInspectionDate: "",
      },
      errors: {},
    };
  }
  if (payload.type === "note") {
    return {
      ...payload,
      values: {
        title: payload.note?.title ?? "",
        type: payload.note?.type ?? "Administrative",
        body: payload.note?.body ?? "",
      },
      errors: {},
    };
  }
  if (payload.type === "scanner") {
    const resultId = payload.resultId || "";
    const resultExists = resultId ? items.some((candidate) => candidate.id === resultId) : true;
    return { ...payload, resultId: resultExists ? resultId : "", error: "" };
  }

  return payload;
}
