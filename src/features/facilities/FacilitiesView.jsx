import { useEffect, useMemo, useState } from "react";
import { FeedbackPanel } from "../../components/ui/Modal";
import { useNavigation } from "../../contexts/NavigationContext";
import { FacilityInfoPage } from "./FacilityInfoPage";
import { FacilityList } from "./FacilityList";
import { FacilityModals } from "./FacilityModals";
import { ReservationInfoPage } from "./ReservationInfoPage";
import {
  createFacilityFromForm,
  createReservationFromForm,
  currentFacilityRole,
  facilityToForm,
  mergeFacilityForm,
  mockFacilities,
  mockReservations,
  reservationToForm,
  todayIso,
} from "./facilityMockData";
import {
  emptyFacilityForm,
  emptyMaintenanceForm,
  emptyNoteForm,
  emptyReservationForm,
} from "./facilityTypes";

export function FacilitiesView() {
  const {
    selectedFacility,
    setSelectedFacility,
    selectFacility,
    clearSelectedFacility,
    selectedFacilityReservation,
    setSelectedFacilityReservation,
    selectFacilityReservation,
    clearSelectedFacilityReservation,
  } = useNavigation();
  const [facilities, setFacilities] = useState(mockFacilities);
  const [reservations, setReservations] = useState(mockReservations);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const canManageFacilities = currentFacilityRole === "Staff/Admin";

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const activeFacility = useMemo(() => {
    if (!selectedFacility?.id) return null;
    return facilities.find((facility) => facility.id === selectedFacility.id) ?? null;
  }, [facilities, selectedFacility]);

  const activeReservation = useMemo(() => {
    if (!selectedFacilityReservation?.id) return null;
    return reservations.find((reservation) => reservation.id === selectedFacilityReservation.id) ?? null;
  }, [reservations, selectedFacilityReservation]);

  const activeReservationFacility = useMemo(() => {
    if (!activeReservation?.facilityId) return null;
    return facilities.find((facility) => facility.id === activeReservation.facilityId) ?? null;
  }, [activeReservation, facilities]);

  const showFeedback = (tone, title, message) => setFeedback({ tone, title, message });
  const closeModal = () => setModal(null);

  const openModal = (payload) => {
    if (payload.type === "facility-form") {
      setModal({
        ...payload,
        values: payload.mode === "edit" ? facilityToForm(payload.facility) : { ...emptyFacilityForm },
        errors: {},
      });
      return;
    }

    if (payload.type === "reservation-form") {
      const reservation = payload.reservation;
      setModal({
        ...payload,
        values: reservation
          ? reservationToForm(reservation)
          : {
              ...emptyReservationForm,
              facilityId: payload.facility?.id ?? "",
              reservationDate: "2026-05-24",
              startTime: payload.slot?.startTime ?? "08:00",
              endTime: payload.slot?.endTime ?? "10:00",
            },
        errors: {},
      });
      return;
    }

    if (payload.type === "maintenance-form") {
      const record = payload.record;
      setModal({
        ...payload,
        values: record
          ? {
              facilityId: record.facilityId,
              title: record.title,
              reason: record.reason,
              startDate: record.startDate,
              endDate: record.endDate,
              startTime: record.startTime,
              endTime: record.endTime,
              status: record.status,
              createdBy: record.createdBy,
              notes: record.notes,
            }
          : {
              ...emptyMaintenanceForm,
              facilityId: payload.facility?.id ?? "",
              startDate: "2026-05-24",
              endDate: "2026-05-24",
            },
        errors: {},
      });
      return;
    }

    if (payload.type === "note-form") {
      setModal({
        ...payload,
        values: payload.note
          ? {
              title: payload.note.title,
              body: payload.note.body,
              visibility: payload.note.visibility,
              author: payload.note.author,
            }
          : { ...emptyNoteForm },
        errors: {},
      });
      return;
    }

    if (payload.type === "document-upload") {
      setModal({ ...payload, documentId: payload.document?.id ?? payload.reservation.documents[0]?.id, fileName: "" });
      return;
    }

    if (payload.type === "review") {
      const missingDocuments = payload.reservation.documents
        .filter((document) => document.status === "Missing" || document.status === "Rejected")
        .map((document) => document.id);
      setModal({ ...payload, selectedDocuments: missingDocuments, note: "", reason: "", message: "", staffNote: "" });
      return;
    }

    setModal(payload);
  };

  const saveFacility = (payload) => {
    if (payload.mode === "edit") {
      const updatedFacility = mergeFacilityForm(payload.facility, payload.values);
      setFacilities((current) => current.map((facility) => (facility.id === updatedFacility.id ? updatedFacility : facility)));
      showFeedback("success", "Facility updated", `${updatedFacility.name} was updated in local state.`);
      closeModal();
      return;
    }

    const newFacility = createFacilityFromForm(payload.values);
    setFacilities((current) => [newFacility, ...current]);
    selectFacility(newFacility);
    showFeedback("success", "Facility added", `${newFacility.name} is ready for reservation workflows.`);
    closeModal();
  };

  const saveReservation = (payload) => {
    if (payload.mode === "edit") {
      const facility = facilities.find((candidate) => candidate.id === payload.values.facilityId);
      const updatedReservation = {
        ...payload.reservation,
        ...payload.values,
        facilityName: facility?.name ?? payload.reservation.facilityName,
        participantCount: Number(payload.values.participantCount),
        updatedAt: todayIso(),
        activityLog: [
          `${new Date().toLocaleDateString()} - Reservation request updated locally.`,
          ...(payload.reservation.activityLog ?? []),
        ],
      };
      setReservations((current) =>
        current.map((reservation) => (reservation.id === updatedReservation.id ? updatedReservation : reservation)),
      );
      showFeedback("success", "Reservation updated", `${updatedReservation.activityName} was updated in local state.`);
      closeModal();
      return;
    }

    const newReservation = createReservationFromForm(payload.values, facilities);
    setReservations((current) => [newReservation, ...current]);
    selectFacilityReservation(newReservation);
    showFeedback("success", "Reservation submitted", `${newReservation.activityName} is now pending staff review.`);
    closeModal();
  };

  const saveMaintenance = (payload) => {
    const facilityId = payload.values.facilityId;
    const record = {
      id: payload.record?.id ?? `BLK-${String(Date.now()).slice(-6)}`,
      facilityId,
      title: payload.values.title.trim(),
      reason: payload.values.reason.trim(),
      startDate: payload.values.startDate,
      endDate: payload.values.endDate,
      startTime: payload.values.startTime,
      endTime: payload.values.endTime,
      status: payload.values.status,
      createdBy: payload.values.createdBy || "Athletics Staff",
      notes: payload.values.notes.trim(),
    };

    setFacilities((current) =>
      current.map((facility) => {
        if (facility.id !== facilityId) return facility;
        const existingRecords = facility.maintenanceRecords ?? [];
        const maintenanceRecords = payload.record
          ? existingRecords.map((entry) => (entry.id === payload.record.id ? record : entry))
          : [record, ...existingRecords];
        const status = ["Scheduled", "Ongoing"].includes(record.status) ? "Under Maintenance" : facility.status;
        return { ...facility, status, maintenanceRecords, updatedAt: todayIso() };
      }),
    );
    showFeedback("success", "Maintenance saved", `${record.title} was saved as a facility blockout.`);
    closeModal();
  };

  const saveNote = (payload) => {
    const note = {
      id: payload.note?.id ?? `NOTE-${String(Date.now()).slice(-6)}`,
      title: payload.values.title.trim(),
      body: payload.values.body.trim(),
      visibility: payload.values.visibility,
      author: payload.values.author.trim() || "Athletics Staff",
      createdAt: payload.note?.createdAt ?? todayIso(),
    };

    setFacilities((current) =>
      current.map((facility) => {
        if (facility.id !== payload.facility.id) return facility;
        const notes = payload.note
          ? facility.notes.map((entry) => (entry.id === payload.note.id ? note : entry))
          : [note, ...facility.notes];
        return { ...facility, notes, updatedAt: todayIso() };
      }),
    );
    showFeedback("success", payload.note ? "Note updated" : "Note added", `${note.title} was saved locally.`);
    closeModal();
  };

  const uploadDocument = (reservationId, documentId, fileName) => {
    if (!fileName) {
      setModal((current) => ({ ...current, fileName: "", error: "Choose a file before saving." }));
      showFeedback("warning", "No file selected", "Choose a document file before saving the mock upload.");
      return;
    }

    setReservations((current) =>
      current.map((reservation) => {
        if (reservation.id !== reservationId) return reservation;
        const documents = reservation.documents.map((document) =>
          document.id === documentId
            ? { ...document, fileName, status: "Submitted", uploadedAt: todayIso(), note: "" }
            : document,
        );
        const documentStatus = documents.some((document) => document.required && document.status === "Missing")
          ? "Missing"
          : "Submitted";
        return appendReservationActivity(
          { ...reservation, documents, documentStatus, updatedAt: todayIso() },
          `Document uploaded: ${fileName}.`,
        );
      }),
    );
    showFeedback("success", "Document uploaded", `${fileName} was saved to local reservation state.`);
    closeModal();
  };

  const reviewReservation = (payload) => {
    setReservations((current) =>
      current.map((reservation) => {
        if (reservation.id !== payload.reservation.id) return reservation;

        if (payload.action === "approve") {
          return appendReservationActivity(
            {
              ...reservation,
              status: "Approved",
              documentStatus: "Approved",
              reviewer: "Athletics Staff",
              reviewNote: payload.note?.trim() || "Approved by Athletics Staff.",
              staffNote: payload.staffNote?.trim() || reservation.staffNote,
              documents: reservation.documents.map((document) =>
                document.status === "Submitted" || document.status === "Pending Review"
                  ? { ...document, status: "Approved", reviewedBy: "Athletics Staff" }
                  : document,
              ),
              updatedAt: todayIso(),
            },
            "Request approved by Athletics Staff.",
          );
        }

        if (payload.action === "reject") {
          return appendReservationActivity(
            {
              ...reservation,
              status: "Rejected",
              documentStatus: "Rejected",
              reviewer: "Athletics Staff",
              reviewNote: payload.reason.trim(),
              staffNote: payload.staffNote?.trim() || reservation.staffNote,
              updatedAt: todayIso(),
            },
            `Request rejected: ${payload.reason.trim()}`,
          );
        }

        const selectedDocuments = payload.selectedDocuments ?? [];
        return appendReservationActivity(
          {
            ...reservation,
            status: "Pending Review",
            documentStatus: "Missing",
            reviewer: "Athletics Staff",
            reviewNote: payload.message.trim(),
            staffNote: payload.staffNote?.trim() || reservation.staffNote,
            documents: reservation.documents.map((document) =>
              selectedDocuments.includes(document.id)
                ? { ...document, status: "Missing", note: payload.message.trim() }
                : document,
            ),
            updatedAt: todayIso(),
          },
          `Missing documents requested: ${payload.message.trim()}`,
        );
      }),
    );
    showFeedback("success", "Reservation reviewed", "The staff decision was saved in local state.");
    closeModal();
  };

  const confirmAction = (payload) => {
    if (payload.action === "archive-facility") {
      setFacilities((current) =>
        current.map((facility) =>
          facility.id === payload.facility.id ? { ...facility, archived: true, status: "Unavailable" } : facility,
        ),
      );
      clearSelectedFacility();
      showFeedback("warning", "Facility archived", `${payload.facility.name} was hidden from active views.`);
      closeModal();
      return;
    }

    if (payload.action === "cancel-reservation") {
      updateReservationStatus(payload.reservation.id, "Cancelled", "Reservation cancelled by Athletics Staff.", "warning");
      return;
    }

    if (payload.action === "complete-reservation") {
      updateReservationStatus(payload.reservation.id, "Completed", "Reservation marked completed.", "success");
      return;
    }

    if (payload.action === "no-show-reservation") {
      updateReservationStatus(payload.reservation.id, "No Show", "Reservation marked no show.", "danger");
      return;
    }

    if (payload.action === "resolve-maintenance") {
      setFacilities((current) =>
        current.map((facility) =>
          facility.id === payload.facility.id
            ? {
                ...facility,
                status: facility.status === "Under Maintenance" ? "Available" : facility.status,
                maintenanceRecords: facility.maintenanceRecords.map((record) =>
                  record.id === payload.record.id ? { ...record, status: "Resolved" } : record,
                ),
                updatedAt: todayIso(),
              }
            : facility,
        ),
      );
      showFeedback("success", "Blockout resolved", `${payload.record.title} was marked resolved.`);
      closeModal();
      return;
    }

    if (payload.action === "delete-maintenance") {
      setFacilities((current) =>
        current.map((facility) =>
          facility.id === payload.facility.id
            ? {
                ...facility,
                maintenanceRecords: facility.maintenanceRecords.filter((record) => record.id !== payload.record.id),
                updatedAt: todayIso(),
              }
            : facility,
        ),
      );
      showFeedback("warning", "Blockout deleted", `${payload.record.title} was removed.`);
      closeModal();
      return;
    }

    if (payload.action === "delete-note") {
      setFacilities((current) =>
        current.map((facility) =>
          facility.id === payload.facility.id
            ? {
                ...facility,
                notes: facility.notes.filter((note) => note.id !== payload.note.id),
                updatedAt: todayIso(),
              }
            : facility,
        ),
      );
      showFeedback("warning", "Note deleted", `${payload.note.title} was removed.`);
      closeModal();
    }
  };

  const updateReservationStatus = (reservationId, status, activity, tone) => {
    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === reservationId
          ? appendReservationActivity({ ...reservation, status, updatedAt: todayIso() }, activity)
          : reservation,
      ),
    );
    showFeedback(tone, "Reservation updated", activity);
    closeModal();
  };

  if (selectedFacilityReservation) {
    return (
      <div className="space-y-6">
        {feedback && <FeedbackPanel tone={feedback.tone} title={feedback.title}>{feedback.message}</FeedbackPanel>}
        <ReservationInfoPage
          reservation={activeReservation}
          facility={activeReservationFacility}
          initialTab={selectedFacilityReservation.initialTab}
          onBack={clearSelectedFacilityReservation}
          onSelectTab={(tabId) =>
            activeReservation &&
            setSelectedFacilityReservation({
              id: activeReservation.id,
              name: activeReservation.activityName,
              initialTab: tabId,
            })
          }
          onSelectFacility={(facility) => facility && selectFacility(facility)}
          onOpenModal={openModal}
        />
        <FacilityModals
          modal={modal}
          setModal={setModal}
          facilities={facilities}
          onClose={closeModal}
          onSaveFacility={saveFacility}
          onSaveReservation={saveReservation}
          onSaveMaintenance={saveMaintenance}
          onSaveNote={saveNote}
          onUploadDocument={uploadDocument}
          onReviewReservation={reviewReservation}
          onConfirmAction={confirmAction}
        />
      </div>
    );
  }

  if (selectedFacility) {
    return (
      <div className="space-y-6">
        {feedback && <FeedbackPanel tone={feedback.tone} title={feedback.title}>{feedback.message}</FeedbackPanel>}
        <FacilityInfoPage
          facility={activeFacility}
          reservations={reservations}
          canManageFacilities={canManageFacilities}
          initialTab={selectedFacility.initialTab}
          onBack={clearSelectedFacility}
          onSelectTab={(tabId) =>
            activeFacility &&
            setSelectedFacility({
              id: activeFacility.id,
              name: activeFacility.name,
              initialTab: tabId,
            })
          }
          onSelectReservation={selectFacilityReservation}
          onOpenModal={openModal}
        />
        <FacilityModals
          modal={modal}
          setModal={setModal}
          facilities={facilities}
          onClose={closeModal}
          onSaveFacility={saveFacility}
          onSaveReservation={saveReservation}
          onSaveMaintenance={saveMaintenance}
          onSaveNote={saveNote}
          onUploadDocument={uploadDocument}
          onReviewReservation={reviewReservation}
          onConfirmAction={confirmAction}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && <FeedbackPanel tone={feedback.tone} title={feedback.title}>{feedback.message}</FeedbackPanel>}
      <FacilityList
        facilities={facilities}
        reservations={reservations}
        canManageFacilities={canManageFacilities}
        onSelectFacility={selectFacility}
        onSelectReservation={selectFacilityReservation}
        onOpenModal={openModal}
      />
      <FacilityModals
        modal={modal}
        setModal={setModal}
        facilities={facilities}
        onClose={closeModal}
        onSaveFacility={saveFacility}
        onSaveReservation={saveReservation}
        onSaveMaintenance={saveMaintenance}
        onSaveNote={saveNote}
        onUploadDocument={uploadDocument}
        onReviewReservation={reviewReservation}
        onConfirmAction={confirmAction}
      />
    </div>
  );
}

function appendReservationActivity(reservation, entry) {
  return {
    ...reservation,
    activityLog: [`${new Date().toLocaleDateString()} - ${entry}`, ...(reservation.activityLog ?? [])],
  };
}
