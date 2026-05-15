import {
  CalendarPlus,
  CheckCircle2,
  FileText,
  Save,
  StickyNote,
  Upload,
  Wrench,
  XCircle,
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
  facilityStatuses,
  facilityTypes,
  requesterTypes,
  validateFacilityForm,
  validateMaintenanceForm,
  validateNoteForm,
  validateReservationForm,
} from "./facilityTypes";
import { getApplicableDocuments } from "./facilityMockData";

export function FacilityModals({
  modal,
  setModal,
  facilities,
  onClose,
  onSaveFacility,
  onSaveReservation,
  onSaveMaintenance,
  onSaveNote,
  onUploadDocument,
  onReviewReservation,
  onConfirmAction,
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

  if (modal.type === "facility-form") {
    const isEdit = modal.mode === "edit";
    const save = () => {
      const errors = validateFacilityForm(modal.values);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveFacility(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={isEdit ? "Edit Facility" : "Add Facility"}
        description={isEdit ? "Update facility profile and availability details." : "Create a frontend facility record for reservation workflows."}
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><Save className="h-3.5 w-3.5" />Save facility</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          <FormSection title="Facility Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facility name" error={modal.errors?.name}>
                <TextInput value={modal.values.name} onChange={(event) => updateValue("name", event.target.value)} />
              </Field>
              <Field label="Facility type">
                <SelectInput value={modal.values.type} onChange={(event) => updateValue("type", event.target.value)}>
                  {facilityTypes.map((type) => <option key={type}>{type}</option>)}
                </SelectInput>
              </Field>
              <Field label="Location" error={modal.errors?.location}>
                <TextInput value={modal.values.location} onChange={(event) => updateValue("location", event.target.value)} />
              </Field>
              <Field label="Capacity" error={modal.errors?.capacity}>
                <TextInput value={modal.values.capacity} onChange={(event) => updateValue("capacity", event.target.value)} />
              </Field>
              <Field label="Status">
                <SelectInput value={modal.values.status} onChange={(event) => updateValue("status", event.target.value)}>
                  {facilityStatuses.map((status) => <option key={status}>{status}</option>)}
                </SelectInput>
              </Field>
              <Field label="Operating hours">
                <TextInput value={modal.values.operatingHours} onChange={(event) => updateValue("operatingHours", event.target.value)} />
              </Field>
              <Field label="Contact person" error={modal.errors?.contactPerson}>
                <TextInput value={modal.values.contactPerson} onChange={(event) => updateValue("contactPerson", event.target.value)} />
              </Field>
              <Field label="Managing office">
                <TextInput value={modal.values.managingOffice} onChange={(event) => updateValue("managingOffice", event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Supported sports / activities">
                  <TextInput value={modal.values.sportsText} onChange={(event) => updateValue("sportsText", event.target.value)} placeholder="Basketball, Volleyball, General Athletics" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description" error={modal.errors?.description}>
                  <TextArea value={modal.values.description} onChange={(event) => updateValue("description", event.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Rules summary">
                  <TextArea value={modal.values.rulesSummary} onChange={(event) => updateValue("rulesSummary", event.target.value)} />
                </Field>
              </div>
            </div>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (modal.type === "reservation-form") {
    const selectedFacility = facilities.find((facility) => facility.id === modal.values.facilityId);
    const applicableDocuments = getApplicableDocuments(selectedFacility, modal.values.requesterType);
    const isEdit = modal.mode === "edit";

    const save = () => {
      const errors = validateReservationForm(modal.values);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveReservation(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={isEdit ? "Edit Reservation Request" : "Request Facility Reservation"}
        description="Complete requester, schedule, activity, and document readiness details."
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><CalendarPlus className="h-3.5 w-3.5" />{isEdit ? "Save request" : "Submit request"}</PrimaryButton>
          </>
        }
      >
        <div className="space-y-5">
          <FormSection title="Requester Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Requester name" error={modal.errors?.requesterName}>
                <TextInput value={modal.values.requesterName} onChange={(event) => updateValue("requesterName", event.target.value)} />
              </Field>
              <Field label="Requester type">
                <SelectInput value={modal.values.requesterType} onChange={(event) => updateValue("requesterType", event.target.value)}>
                  {requesterTypes.map((type) => <option key={type}>{type}</option>)}
                </SelectInput>
              </Field>
              <Field label="Organization / department" error={modal.errors?.organization}>
                <TextInput value={modal.values.organization} onChange={(event) => updateValue("organization", event.target.value)} />
              </Field>
              <Field label="Contact email" error={modal.errors?.email}>
                <TextInput value={modal.values.email} onChange={(event) => updateValue("email", event.target.value)} />
              </Field>
              <Field label="Contact number" error={modal.errors?.contactNumber}>
                <TextInput value={modal.values.contactNumber} onChange={(event) => updateValue("contactNumber", event.target.value)} />
              </Field>
              <Field label="Use type">
                <SelectInput value={modal.values.useType} onChange={(event) => updateValue("useType", event.target.value)}>
                  <option>Internal</option>
                  <option>External</option>
                </SelectInput>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Facility and Schedule">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facility" error={modal.errors?.facilityId}>
                <SelectInput value={modal.values.facilityId} onChange={(event) => updateValue("facilityId", event.target.value)}>
                  <option value="">Choose facility</option>
                  {facilities.filter((facility) => !facility.archived).map((facility) => (
                    <option key={facility.id} value={facility.id}>{facility.name} | {facility.type}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Reservation date" error={modal.errors?.reservationDate}>
                <TextInput type="date" value={modal.values.reservationDate} onChange={(event) => updateValue("reservationDate", event.target.value)} />
              </Field>
              <Field label="Start time" error={modal.errors?.startTime}>
                <TextInput type="time" value={modal.values.startTime} onChange={(event) => updateValue("startTime", event.target.value)} />
              </Field>
              <Field label="End time" error={modal.errors?.endTime}>
                <TextInput type="time" value={modal.values.endTime} onChange={(event) => updateValue("endTime", event.target.value)} />
              </Field>
            </div>
            {selectedFacility ? (
              <FeedbackPanel tone="info" title={selectedFacility.name}>
                {selectedFacility.location} | {selectedFacility.capacity} capacity | {selectedFacility.operatingHours}
              </FeedbackPanel>
            ) : null}
          </FormSection>

          <FormSection title="Activity Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Activity name" error={modal.errors?.activityName}>
                <TextInput value={modal.values.activityName} onChange={(event) => updateValue("activityName", event.target.value)} />
              </Field>
              <Field label="Expected participants" error={modal.errors?.participantCount}>
                <TextInput value={modal.values.participantCount} onChange={(event) => updateValue("participantCount", event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Activity description" error={modal.errors?.description}>
                  <TextArea value={modal.values.description} onChange={(event) => updateValue("description", event.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Special equipment needs">
                  <TextArea value={modal.values.equipmentNeeds} onChange={(event) => updateValue("equipmentNeeds", event.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Notes">
                  <TextArea value={modal.values.notes} onChange={(event) => updateValue("notes", event.target.value)} />
                </Field>
              </div>
            </div>
          </FormSection>

          <FormSection title="Required Documents">
            {applicableDocuments.length === 0 ? (
              <FeedbackPanel tone="info" title="No document templates">
                Choose a facility and requester type to preview document requirements.
              </FeedbackPanel>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {applicableDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-border-subtle/60 bg-white p-4">
                    <p className="font-bold text-slate-900">{document.name}</p>
                    <p className="mt-1 text-[12px] text-slate-500">{document.required ? "Required" : "Optional"} for {modal.values.requesterType}</p>
                  </div>
                ))}
              </div>
            )}
            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border-subtle/60 bg-white p-4 text-[13px] font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={modal.values.documentsAcknowledged}
                onChange={(event) => updateValue("documentsAcknowledged", event.target.checked)}
                className="mt-1"
              />
              <span>I understand missing documents can be uploaded after submission and may delay approval.</span>
            </label>
          </FormSection>
        </div>
      </Modal>
    );
  }

  if (modal.type === "maintenance-form") {
    const save = () => {
      const errors = validateMaintenanceForm(modal.values);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveMaintenance(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={modal.mode === "edit" ? "Edit Maintenance Blockout" : "Add Maintenance Blockout"}
        description="Block facility availability for maintenance, closures, inspections, or repairs."
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}><Wrench className="h-3.5 w-3.5" />Save blockout</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {!modal.facility ? (
            <Field label="Facility" error={modal.errors?.facilityId}>
              <SelectInput value={modal.values.facilityId} onChange={(event) => updateValue("facilityId", event.target.value)}>
                <option value="">Choose facility</option>
                {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </SelectInput>
            </Field>
          ) : null}
          <Field label="Title" error={modal.errors?.title}>
            <TextInput value={modal.values.title} onChange={(event) => updateValue("title", event.target.value)} />
          </Field>
          <Field label="Status">
            <SelectInput value={modal.values.status} onChange={(event) => updateValue("status", event.target.value)}>
              <option>Scheduled</option>
              <option>Ongoing</option>
              <option>Resolved</option>
              <option>Cancelled</option>
            </SelectInput>
          </Field>
          <Field label="Start date" error={modal.errors?.startDate}>
            <TextInput type="date" value={modal.values.startDate} onChange={(event) => updateValue("startDate", event.target.value)} />
          </Field>
          <Field label="End date" error={modal.errors?.endDate}>
            <TextInput type="date" value={modal.values.endDate} onChange={(event) => updateValue("endDate", event.target.value)} />
          </Field>
          <Field label="Start time">
            <TextInput type="time" value={modal.values.startTime} onChange={(event) => updateValue("startTime", event.target.value)} />
          </Field>
          <Field label="End time" error={modal.errors?.endTime}>
            <TextInput type="time" value={modal.values.endTime} onChange={(event) => updateValue("endTime", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason" error={modal.errors?.reason}>
              <TextArea value={modal.values.reason} onChange={(event) => updateValue("reason", event.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea value={modal.values.notes} onChange={(event) => updateValue("notes", event.target.value)} />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "note-form") {
    const save = () => {
      const errors = validateNoteForm(modal.values);
      if (Object.keys(errors).length) {
        setModal((current) => ({ ...current, errors }));
        return;
      }
      onSaveNote(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={modal.mode === "edit" ? "Edit Facility Note" : "Add Facility Note"}
        description="Separate public-facing notes from internal staff notes."
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
          <Field label="Visibility">
            <SelectInput value={modal.values.visibility} onChange={(event) => updateValue("visibility", event.target.value)}>
              <option>Public</option>
              <option>Internal</option>
            </SelectInput>
          </Field>
          <Field label="Author">
            <TextInput value={modal.values.author} onChange={(event) => updateValue("author", event.target.value)} />
          </Field>
          <Field label="Note" error={modal.errors?.body}>
            <TextArea value={modal.values.body} onChange={(event) => updateValue("body", event.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "document-upload") {
    const documents = modal.reservation.documents ?? [];
    const selectedDocument = modal.document ?? documents.find((document) => document.id === modal.documentId) ?? documents[0];

    return (
      <Modal
        open
        onClose={onClose}
        title="Upload Reservation Document"
        description="Frontend-only upload stores the selected file name in local state."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => onUploadDocument(modal.reservation.id, selectedDocument?.id, modal.fileName)}>
              <Upload className="h-3.5 w-3.5" />
              Save upload
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Document">
            <SelectInput value={selectedDocument?.id ?? ""} onChange={(event) => updateModal({ documentId: event.target.value, document: null })}>
              {documents.map((document) => <option key={document.id} value={document.id}>{document.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Choose file">
            <input
              type="file"
              onChange={(event) => updateModal({ fileName: event.target.files?.[0]?.name ?? "" })}
              className="w-full rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700"
            />
          </Field>
          <FeedbackPanel tone={modal.fileName ? "success" : "info"} title={modal.fileName ? "File selected" : "Mock upload"}>
            {modal.fileName || "Select a file to store its name on this reservation in frontend state."}
          </FeedbackPanel>
        </div>
      </Modal>
    );
  }

  if (modal.type === "review") {
    const isReject = modal.action === "reject";
    const isDocs = modal.action === "request-documents";
    const title = isReject ? "Reject Request" : isDocs ? "Request Missing Documents" : "Approve Request";

    const save = () => {
      if (isReject && !modal.reason?.trim()) {
        updateModal({ error: "A rejection reason is required." });
        return;
      }
      if (isDocs && !modal.message?.trim()) {
        updateModal({ error: "Add a message for the requester." });
        return;
      }
      onReviewReservation(modal);
    };

    return (
      <Modal
        open
        onClose={onClose}
        title={title}
        description={`${modal.reservation.activityName} | ${modal.reservation.facilityName}`}
        footer={
          <>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton tone={isReject ? "danger" : "brand"} onClick={save}>
              {isReject ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Confirm
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <FeedbackPanel tone={isReject ? "danger" : isDocs ? "warning" : "success"} title="Staff decision">
            This updates the reservation status, review note, document status, and activity log in local frontend state.
          </FeedbackPanel>
          {isDocs ? (
            <div className="rounded-2xl border border-border-subtle/60 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Documents to request</p>
              <div className="mt-3 grid gap-2">
                {modal.reservation.documents.map((document) => (
                  <label key={document.id} className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={(modal.selectedDocuments ?? []).includes(document.id)}
                      onChange={(event) => {
                        const current = modal.selectedDocuments ?? [];
                        updateModal({
                          selectedDocuments: event.target.checked
                            ? [...current, document.id]
                            : current.filter((id) => id !== document.id),
                        });
                      }}
                    />
                    {document.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <Field label={isReject ? "Reason" : isDocs ? "Requester message" : "Approval note"} error={modal.error}>
            <TextArea value={modal.reason ?? modal.message ?? modal.note ?? ""} onChange={(event) => updateModal(isReject ? { reason: event.target.value, error: "" } : isDocs ? { message: event.target.value, error: "" } : { note: event.target.value })} />
          </Field>
          <Field label="Internal staff note">
            <TextArea value={modal.staffNote ?? ""} onChange={(event) => updateModal({ staffNote: event.target.value })} />
          </Field>
        </div>
      </Modal>
    );
  }

  if (modal.type === "document-view") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.document.name}
        description="Mock document preview."
        footer={<PrimaryButton onClick={onClose}><FileText className="h-3.5 w-3.5" />Done</PrimaryButton>}
      >
        <FeedbackPanel tone="info" title={modal.document.fileName}>
          Actual document preview/download can connect here when storage is available.
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

function FormSection({ title, children }) {
  return (
    <section className="rounded-[22px] border border-border-subtle/60 bg-slate-50/70 p-5">
      <h3 className="mb-4 text-[14px] font-bold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function getConfirmCopy(modal) {
  const reservationName = modal.reservation?.activityName ?? "this reservation";
  const facilityName = modal.facility?.name ?? "this facility";
  const defaults = {
    title: "Confirm Action",
    description: "This updates local frontend state.",
    cancelLabel: "Cancel",
    confirmLabel: "Confirm",
    tone: "brand",
    panelTone: "warning",
    body: "This action will be reflected immediately in frontend state.",
  };

  const copies = {
    "archive-facility": {
      title: "Archive Facility",
      description: `${facilityName} will be hidden from active facility views.`,
      confirmLabel: "Archive facility",
      tone: "danger",
      panelTone: "danger",
    },
    "cancel-reservation": {
      title: "Cancel Reservation",
      description: `${reservationName} will be marked cancelled.`,
      confirmLabel: "Cancel reservation",
      tone: "danger",
      panelTone: "danger",
    },
    "complete-reservation": {
      title: "Mark Completed",
      description: `${reservationName} will be marked completed.`,
      confirmLabel: "Mark completed",
      panelTone: "success",
    },
    "no-show-reservation": {
      title: "Mark No Show",
      description: `${reservationName} will be marked no show.`,
      confirmLabel: "Mark no show",
      tone: "danger",
      panelTone: "danger",
    },
    "delete-maintenance": {
      title: "Delete Blockout",
      description: `${modal.record?.title ?? "This blockout"} will be removed.`,
      confirmLabel: "Delete blockout",
      tone: "danger",
      panelTone: "danger",
    },
    "resolve-maintenance": {
      title: "Mark Resolved",
      description: `${modal.record?.title ?? "This blockout"} will be marked resolved.`,
      confirmLabel: "Mark resolved",
      panelTone: "success",
    },
    "delete-note": {
      title: "Delete Note",
      description: `${modal.note?.title ?? "This note"} will be removed.`,
      confirmLabel: "Delete note",
      tone: "danger",
      panelTone: "danger",
    },
    "reset-form": {
      title: "Reset Form",
      description: "Entered form values will be cleared.",
      confirmLabel: "Reset form",
      tone: "danger",
      panelTone: "danger",
    },
  };

  return { ...defaults, ...(copies[modal.action] ?? {}) };
}
