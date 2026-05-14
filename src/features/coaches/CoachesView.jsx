import { useEffect, useMemo, useState } from "react";
import { FeedbackPanel } from "../../components/ui/Modal";
import { useNavigation } from "../../contexts/NavigationContext";
import { CoachProfile } from "./CoachProfile";
import { CoachesList } from "./CoachesList";
import { mockCoaches } from "./coachesMockData";

export function CoachesView() {
  const { selectedCoach, setSelectedCoach } = useNavigation();
  const [coaches, setCoaches] = useState(mockCoaches);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const activeCoach = useMemo(() => {
    if (!selectedCoach?.id) return null;
    return coaches.find((coach) => coach.id === selectedCoach.id) ?? null;
  }, [coaches, selectedCoach]);

  const showFeedback = (tone, title, message) => {
    setFeedback({ tone, title, message });
  };

  const selectCoach = (coach, initialTab = "overview") => {
    setSelectedCoach({ id: coach.id, name: coach.name, initialTab });
  };

  const addCoach = (coach) => {
    setCoaches((current) => [coach, ...current]);
    setSelectedCoach({ id: coach.id, name: coach.name, initialTab: "overview" });
    showFeedback("success", "Coach added", `${coach.name} was added to the local coaching roster.`);
  };

  const updateCoach = (coachId, updater, feedbackPayload) => {
    let updatedCoach = null;

    setCoaches((current) =>
      current.map((coach) => {
        if (coach.id !== coachId) return coach;

        updatedCoach = typeof updater === "function" ? updater(coach) : { ...coach, ...updater };
        return {
          ...updatedCoach,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }),
    );

    if (updatedCoach && selectedCoach?.id === coachId) {
      setSelectedCoach({
        id: updatedCoach.id,
        name: updatedCoach.name,
        initialTab: selectedCoach.initialTab,
      });
    }

    if (feedbackPayload) {
      showFeedback(feedbackPayload.tone ?? "success", feedbackPayload.title, feedbackPayload.message);
    }
  };

  const addCoachNote = (coachId, note) => {
    updateCoach(
      coachId,
      (coach) => ({
        ...coach,
        notes: [note, ...(coach.notes ?? [])],
      }),
      {
        title: "Note saved",
        message: "The staff note was added to the coach profile.",
      },
    );
  };

  const archiveCoach = (coachId, status = "Archived") => {
    updateCoach(
      coachId,
      { status },
      {
        tone: status === "Archived" ? "warning" : "success",
        title: status === "Archived" ? "Coach archived" : "Coach status updated",
        message: "The coaching roster has been updated in local frontend state.",
      },
    );
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <FeedbackPanel tone={feedback.tone} title={feedback.title}>
          {feedback.message}
        </FeedbackPanel>
      )}

      {activeCoach ? (
        <CoachProfile
          coach={activeCoach}
          coaches={coaches}
          initialTab={selectedCoach?.initialTab}
          onBack={() => setSelectedCoach(null)}
          onSelectTab={(tabId) =>
            setSelectedCoach({ id: activeCoach.id, name: activeCoach.name, initialTab: tabId })
          }
          onUpdateCoach={updateCoach}
          onAddNote={addCoachNote}
          onArchiveCoach={archiveCoach}
        />
      ) : (
        <CoachesList
          coaches={coaches}
          onSelectCoach={selectCoach}
          onAddCoach={addCoach}
          onUpdateCoach={updateCoach}
          onAddNote={addCoachNote}
          onArchiveCoach={archiveCoach}
        />
      )}
    </div>
  );
}
