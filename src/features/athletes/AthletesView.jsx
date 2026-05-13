import { useNavigation } from "../../contexts/NavigationContext";
import { AthletesList } from "./AthletesList";
import { AthleteProfile } from "./AthleteProfile";

export function AthletesView() {
  const { selectedAthlete } = useNavigation();

  if (selectedAthlete) {
    return <AthleteProfile athlete={selectedAthlete} />;
  }

  return <AthletesList />;
}
