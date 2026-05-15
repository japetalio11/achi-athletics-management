import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigation } from "../../contexts/NavigationContext";
import { FeedbackPanel } from "../../components/ui/Modal";
import { AthleteProfile } from "./AthleteProfile";
import { AthletesList } from "./AthletesList";
import { mockAthletes } from "./athletesMockData";

export function AthletesView() {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const { selectedAthlete, setSelectedAthlete, returnToAthletes } = useNavigation();
  const [athletes, setAthletes] = useState(mockAthletes);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const activeAthlete = useMemo(() => {
    if (!selectedAthlete?.id) return null;
    return athletes.find((athlete) => athlete.id === selectedAthlete.id) ?? null;
  }, [athletes, selectedAthlete]);

  useEffect(() => {
    if (!athleteId || activeAthlete) return;
    navigate("/not-found", { replace: true });
  }, [activeAthlete, athleteId, navigate]);

  useEffect(() => {
    if (!activeAthlete || !selectedAthlete?.id) return;
    if (
      selectedAthlete.name === activeAthlete.name &&
      selectedAthlete.initialTab
    ) {
      return;
    }

    setSelectedAthlete({
      id: activeAthlete.id,
      name: activeAthlete.name,
      initialTab: selectedAthlete.initialTab ?? "overview",
    });
  }, [activeAthlete, selectedAthlete, setSelectedAthlete]);

  const showFeedback = (tone, title, message) => {
    setFeedback({ tone, title, message });
  };

  const selectAthlete = (athlete, initialTab = "overview") => {
    setSelectedAthlete({ id: athlete.id, name: athlete.name, initialTab });
  };

  const addAthlete = (athlete) => {
    setAthletes((current) => [athlete, ...current]);
    setSelectedAthlete({ id: athlete.id, name: athlete.name, initialTab: "overview" });
    showFeedback("success", "Athlete added", `${athlete.name} was added to the local roster.`);
  };

  const updateAthlete = (athleteId, updater, feedbackPayload) => {
    let updatedAthlete = null;

    setAthletes((current) =>
      current.map((athlete) => {
        if (athlete.id !== athleteId) return athlete;

        updatedAthlete =
          typeof updater === "function" ? updater(athlete) : { ...athlete, ...updater };

        return {
          ...updatedAthlete,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }),
    );

    if (updatedAthlete && selectedAthlete?.id === athleteId) {
      setSelectedAthlete({
        id: updatedAthlete.id,
        name: updatedAthlete.name,
        initialTab: selectedAthlete.initialTab,
      });
    }

    if (feedbackPayload) {
      showFeedback(feedbackPayload.tone ?? "success", feedbackPayload.title, feedbackPayload.message);
    }
  };

  const addAthleteNote = (athleteId, note) => {
    updateAthlete(
      athleteId,
      (athlete) => ({
        ...athlete,
        overview: {
          ...athlete.overview,
          recentActivity: [note, ...(athlete.overview.recentActivity ?? [])],
        },
      }),
      {
        title: "Note saved",
        message: "The staff note was added to the athlete activity feed.",
      },
    );
  };

  const archiveAthlete = (athleteId, status = "Archived") => {
    updateAthlete(
      athleteId,
      { status },
      {
        tone: status === "Archived" ? "warning" : "success",
        title: status === "Archived" ? "Athlete archived" : "Status updated",
        message: "The roster has been updated in local frontend state.",
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

      {activeAthlete ? (
        <AthleteProfile
          key={`${activeAthlete.id}:${selectedAthlete?.initialTab ?? "overview"}`}
          athlete={activeAthlete}
          initialTab={selectedAthlete?.initialTab}
          onBack={returnToAthletes}
          onSelectTab={(tabId) =>
            setSelectedAthlete({ id: activeAthlete.id, name: activeAthlete.name, initialTab: tabId })
          }
          onUpdateAthlete={updateAthlete}
          onAddNote={addAthleteNote}
          onArchiveAthlete={archiveAthlete}
        />
      ) : (
        <AthletesList
          athletes={athletes}
          onSelectAthlete={selectAthlete}
          onAddAthlete={addAthlete}
          onUpdateAthlete={updateAthlete}
          onAddNote={addAthleteNote}
          onArchiveAthlete={archiveAthlete}
        />
      )}
    </div>
  );
}
