import { useNavigation } from "../../contexts/NavigationContext";
import { CoachesList } from "./CoachesList";
import { CoachProfile } from "./CoachProfile";

export function CoachesView() {
  const { selectedCoach } = useNavigation();

  if (selectedCoach) {
    return <CoachProfile coach={selectedCoach} />;
  }

  return <CoachesList />;
}
