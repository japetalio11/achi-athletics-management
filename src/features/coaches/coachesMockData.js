import { athletePool, mockEvents } from "../events/eventsMockData";

const baseCoaches = [
  {
    id: "COACH-001",
    staffId: "COA-2026-001",
    name: "David Reyes",
    organizerName: "Coach David Reyes",
    sport: "Basketball",
    team: "Blue Eagles Men",
    role: "Head Coach",
    status: "Active",
    experienceYears: 12,
    email: "david.reyes@adnu.edu.ph",
    phone: "+63 917 555 0111",
    address: "Athletics Office, Xavier Hall, Quezon City",
    imageUrl: "https://i.pravatar.cc/150?u=coach-david-reyes",
    specialization: "Guard development, transition offense, and game-read leadership.",
    department: "Varsity Basketball Program",
    office: "Athletics High Performance Unit",
    overview: {
      summary:
        "Leads the men's basketball performance cycle with a strong focus on pre-season evaluation and backcourt decision-making.",
      focus: "Pre-season roster shaping",
      focusNote: "Combine week and role calibration",
      support: "Training staff aligned",
      supportNote: "Strength and analytics integrated",
      nextReview: "May 19, 2026",
      reviewOwner: "Athletics director",
      alerts: [
        {
          title: "Roster decisions in progress",
          body:
            "Final guard rotation reviews are still being calibrated following the combine block.",
          level: "attention",
        },
        {
          title: "Staff alignment steady",
          body:
            "Strength and conditioning staff already synced athlete targets for the next three weeks.",
          level: "good",
        },
      ],
    },
    profile: {
      birthdate: "August 9, 1984",
      age: "41 years old",
      gender: "Male",
      nationality: "Filipino",
      certificationLevel: "FIBA Level 2",
    },
    performanceNotes: {
      leadership: "9.3/10",
      leadershipTrend: "+0.4 from last review",
      development: "92%",
      developmentNote: "Athlete growth plans on track",
      attendance: "97%",
      attendanceNote: "High session visibility",
      communication: "Excellent",
      communicationNote: "Strong staff-to-athlete feedback loop",
      trend: [
        { label: "Q3 '25", value: 70, score: "8.4", active: false },
        { label: "Q4 '25", value: 78, score: "8.7", active: false },
        { label: "Q1 '26", value: 86, score: "9.0", active: false },
        { label: "Current", value: 93, score: "9.3", active: true },
      ],
      notes: [
        {
          title: "Athlete development review",
          owner: "Performance Director",
          body:
            "Film review structure is improving athlete confidence and speeding up role clarity for the backcourt unit.",
        },
        {
          title: "Staff collaboration",
          owner: "Athletics Office",
          body:
            "Continue current rhythm of sharing combine benchmarks with the sports science team after each session.",
        },
      ],
    },
    certifications: [
      {
        name: "FIBA Coaching License",
        kind: "pdf",
        meta: "Valid through November 2027 | International competition credential",
      },
      {
        name: "SafeSport Annual Compliance",
        kind: "pdf",
        meta: "Validated January 2026 | Athlete welfare compliance",
      },
    ],
    qualifications: [
      {
        name: "Athlete Safeguarding",
        issuer: "Athletics Office",
        validUntil: "Jan 15, 2027",
        status: "Current",
      },
      {
        name: "Emergency Response Certification",
        issuer: "Campus Health Unit",
        validUntil: "Oct 02, 2026",
        status: "Renewal Due",
      },
    ],
    milestones: [
      {
        title: "Conference semifinal berth",
        date: "2025-2026 Season",
        description:
          "Guided the varsity unit into the conference semifinals with improved defensive efficiency.",
      },
      {
        title: "Backcourt leadership framework",
        date: "March 2026",
        description:
          "Rolled out a new decision-making and film review structure for returning guards.",
      },
    ],
  },
  {
    id: "COACH-002",
    staffId: "COA-2026-002",
    name: "Sarah Lim",
    organizerName: "Coach Sarah Lim",
    sport: "Volleyball",
    team: "Blue Eagles Women",
    role: "Head Coach",
    status: "Active",
    experienceYears: 9,
    email: "sarah.lim@adnu.edu.ph",
    phone: "+63 917 555 0122",
    address: "Volleyball Office, Fr. Godofredo Alingal Gym",
    imageUrl: "https://i.pravatar.cc/150?u=coach-sarah-lim",
    specialization: "Rotation discipline, setter development, and end-game communication.",
    department: "Women's Volleyball Program",
    office: "Athletics Performance Cluster",
    overview: {
      summary:
        "Directs the women's volleyball tactical program with emphasis on reception systems and communication under pressure.",
      focus: "Mid-cycle tactical execution",
      focusNote: "Rotation efficiency and serve receive",
      support: "Film review active",
      supportNote: "Immediate tactical debrief after court sessions",
      nextReview: "May 22, 2026",
      reviewOwner: "Deputy athletics director",
      alerts: [
        {
          title: "Setter load balancing",
          body:
            "Session plans are being adjusted to keep the setting unit fresh before the next scrimmage block.",
          level: "attention",
        },
        {
          title: "Communication standards improving",
          body:
            "Court leadership benchmarks have improved across the second unit over the last two weeks.",
          level: "good",
        },
      ],
    },
    profile: {
      birthdate: "February 14, 1989",
      age: "37 years old",
      gender: "Female",
      nationality: "Filipino",
      certificationLevel: "AVC Advanced Coaching",
    },
    performanceNotes: {
      leadership: "9.1/10",
      leadershipTrend: "+0.2 from last review",
      development: "89%",
      developmentNote: "Setter pipeline progressing",
      attendance: "95%",
      attendanceNote: "Strong session coverage",
      communication: "Very strong",
      communicationNote: "Tactical feedback remains timely",
      trend: [
        { label: "Q3 '25", value: 68, score: "8.3", active: false },
        { label: "Q4 '25", value: 76, score: "8.6", active: false },
        { label: "Q1 '26", value: 84, score: "8.9", active: false },
        { label: "Current", value: 91, score: "9.1", active: true },
      ],
      notes: [
        {
          title: "Court communication assessment",
          owner: "Performance Director",
          body:
            "The session design is creating more confident late-set communication from setters and floor captains.",
        },
        {
          title: "Staff coordination note",
          owner: "Sports Science Unit",
          body:
            "Maintain the current blend of tactical reps and immediate video review for faster corrective feedback.",
        },
      ],
    },
    certifications: [
      {
        name: "AVC Tactical Systems Certificate",
        kind: "pdf",
        meta: "Valid through August 2028 | International systems workshop",
      },
      {
        name: "Women in Sport Leadership Seminar",
        kind: "pdf",
        meta: "Completed March 2026 | Leadership development program",
      },
    ],
    qualifications: [
      {
        name: "Child Protection Training",
        issuer: "Athletics Office",
        validUntil: "Feb 12, 2027",
        status: "Current",
      },
      {
        name: "Concussion Response Workshop",
        issuer: "Campus Health Unit",
        validUntil: "Jul 28, 2026",
        status: "Current",
      },
    ],
    milestones: [
      {
        title: "Tactical culture reset",
        date: "January 2026",
        description:
          "Reset the rotation discipline program with stronger language cues and film checkpoints.",
      },
      {
        title: "Women's program rebuild",
        date: "2025-2026 Season",
        description:
          "Stabilized the core rotation while developing younger setters for extended match minutes.",
      },
    ],
  },
  {
    id: "COACH-003",
    staffId: "COA-2026-003",
    name: "Marco Alarcon",
    organizerName: "Coach Marco Alarcon",
    sport: "Football",
    team: "Blue Eagles Football",
    role: "Head Coach",
    status: "On Leave",
    experienceYears: 14,
    email: "marco.alarcon@adnu.edu.ph",
    phone: "+63 917 555 0133",
    address: "Upper Football Pitch Office",
    imageUrl: "https://i.pravatar.cc/150?u=coach-marco-alarcon",
    specialization: "Scouting, player identification, and midfield system design.",
    department: "Football Program",
    office: "Athlete Recruitment and Scouting",
    overview: {
      summary:
        "Oversees football scouting and tryout operations, with a strong track record in talent identification and player transition planning.",
      focus: "Recruitment cycle planning",
      focusNote: "Tryout design and staff coverage",
      support: "Assistant coaches handling daily field work",
      supportNote: "Temporary delegation active",
      nextReview: "May 24, 2026",
      reviewOwner: "Athletics director",
      alerts: [
        {
          title: "Medical booth still pending",
          body:
            "The open tryout plan needs a final medical assignment before the event can move out of draft status.",
          level: "attention",
        },
        {
          title: "Scouting standards remain clear",
          body:
            "Evaluation criteria for incoming players are already documented for the full staff.",
          level: "good",
        },
      ],
    },
    profile: {
      birthdate: "June 7, 1981",
      age: "44 years old",
      gender: "Male",
      nationality: "Filipino",
      certificationLevel: "AFC B License",
    },
    performanceNotes: {
      leadership: "8.8/10",
      leadershipTrend: "Stable vs last review",
      development: "85%",
      developmentNote: "Recruitment pipeline defined",
      attendance: "88%",
      attendanceNote: "Delegated daily sessions this month",
      communication: "Strong",
      communicationNote: "Scouting reports remain consistent",
      trend: [
        { label: "Q3 '25", value: 66, score: "8.1", active: false },
        { label: "Q4 '25", value: 74, score: "8.4", active: false },
        { label: "Q1 '26", value: 82, score: "8.7", active: false },
        { label: "Current", value: 88, score: "8.8", active: true },
      ],
      notes: [
        {
          title: "Scouting review",
          owner: "Athletics Director",
          body:
            "Recruitment documentation is solid, but staffing coverage around the tryout medical station should be finalized quickly.",
        },
        {
          title: "Program continuity",
          owner: "Assistant Coaching Team",
          body:
            "Temporary delegation has kept daily standards steady while Marco focuses on the next recruitment window.",
        },
      ],
    },
    certifications: [
      {
        name: "AFC Coaching License",
        kind: "pdf",
        meta: "Valid through May 2027 | Regional football coaching credential",
      },
      {
        name: "Talent Identification Seminar",
        kind: "pdf",
        meta: "Completed October 2025 | Recruitment systems workshop",
      },
    ],
    qualifications: [
      {
        name: "Risk Management Orientation",
        issuer: "Athletics Office",
        validUntil: "Sep 20, 2026",
        status: "Current",
      },
      {
        name: "First Aid Certification",
        issuer: "Campus Health Unit",
        validUntil: "Jun 14, 2026",
        status: "Renewal Due",
      },
    ],
    milestones: [
      {
        title: "Recruitment framework upgrade",
        date: "April 2026",
        description:
          "Updated the football scouting scorecard to improve comparisons across open tryout prospects.",
      },
      {
        title: "Midfield pipeline refresh",
        date: "2025-2026 Season",
        description:
          "Rebalanced player development attention toward midfield depth and transition recovery.",
      },
    ],
  },
  {
    id: "COACH-004",
    staffId: "COA-2026-004",
    name: "Isabel Torres",
    organizerName: "Coach Isabel Torres",
    sport: "Swimming",
    team: "Blue Eagles Aquatics",
    role: "Head Coach",
    status: "Active",
    experienceYears: 11,
    email: "isabel.torres@adnu.edu.ph",
    phone: "+63 917 555 0144",
    address: "Aquatics Center Staff Office",
    imageUrl: "https://i.pravatar.cc/150?u=coach-isabel-torres",
    specialization: "Sprint freestyle performance, race pacing, and meet readiness.",
    department: "Swimming Program",
    office: "Aquatics Performance Unit",
    overview: {
      summary:
        "Runs the aquatics performance program with a clear focus on timed-race evaluation and competition execution.",
      focus: "Meet follow-through",
      focusNote: "Post-invitational race review",
      support: "Data review in progress",
      supportNote: "Heat sheets and splits being archived",
      nextReview: "May 17, 2026",
      reviewOwner: "Sports science coordinator",
      alerts: [
        {
          title: "Reaction time focus",
          body:
            "Next training block will emphasize start response after the latest invitational review.",
          level: "attention",
        },
        {
          title: "Competition pacing improved",
          body:
            "Athletes are closing races with more discipline, and pacing plans are translating well in meets.",
          level: "good",
        },
      ],
    },
    profile: {
      birthdate: "December 1, 1986",
      age: "39 years old",
      gender: "Female",
      nationality: "Filipino",
      certificationLevel: "FINA Coaching Pathway",
    },
    performanceNotes: {
      leadership: "9.0/10",
      leadershipTrend: "+0.3 from last review",
      development: "90%",
      developmentNote: "Race model adoption is strong",
      attendance: "96%",
      attendanceNote: "Consistent staff presence",
      communication: "Excellent",
      communicationNote: "Strong post-meet debrief quality",
      trend: [
        { label: "Q3 '25", value: 69, score: "8.5", active: false },
        { label: "Q4 '25", value: 77, score: "8.7", active: false },
        { label: "Q1 '26", value: 85, score: "8.9", active: false },
        { label: "Current", value: 90, score: "9.0", active: true },
      ],
      notes: [
        {
          title: "Meet management review",
          owner: "Performance Director",
          body:
            "The invitational wrap-up process is clear and efficient, especially around pacing and split analysis.",
        },
        {
          title: "Athlete readiness note",
          owner: "Sports Science Unit",
          body:
            "Continue integrating recovery markers into race-week decision making for top sprinters.",
        },
      ],
    },
    certifications: [
      {
        name: "FINA Sprint Coaching Module",
        kind: "pdf",
        meta: "Valid through March 2028 | Aquatics performance specialization",
      },
      {
        name: "Competition Safety Briefing",
        kind: "pdf",
        meta: "Completed February 2026 | Meet operations safety standard",
      },
    ],
    qualifications: [
      {
        name: "Water Safety Compliance",
        issuer: "Aquatics Center",
        validUntil: "Feb 09, 2027",
        status: "Current",
      },
      {
        name: "Emergency Response Certification",
        issuer: "Campus Health Unit",
        validUntil: "Nov 18, 2026",
        status: "Current",
      },
    ],
    milestones: [
      {
        title: "Invitational podium finish",
        date: "May 2026",
        description:
          "Led the aquatics squad through a strong regional invitational performance with improved finals execution.",
      },
      {
        title: "Race model rollout",
        date: "February 2026",
        description:
          "Implemented a simplified pacing framework to sharpen sprint-event decision making.",
      },
    ],
  },
];

function formatDateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusTone(status) {
  return status === "Upcoming"
    ? "blue"
    : status === "Ongoing"
      ? "gold"
      : "default";
}

function buildCoachRecord(coach) {
  const relatedEvents = mockEvents.filter(
    (event) => event.organizer === coach.organizerName,
  );

  const assignedAthletes = relatedEvents
    .flatMap((event) =>
      event.assignedAthletes.map((assignment) => {
        const athlete = athletePool.find((item) => item.id === assignment.athleteId);

        if (!athlete) {
          return null;
        }

        return {
          id: `${event.id}-${athlete.id}`,
          athleteId: athlete.id,
          name: athlete.name,
          studentId: athlete.studentId,
          sport: athlete.sport,
          team: athlete.team,
          role: athlete.role,
          participationStatus: assignment.participationStatus,
          eventTitle: event.title,
          eventDate: formatDateLabel(event.startDate),
          coachRemarks: assignment.coachRemarks,
          strengthsObserved: assignment.strengthsObserved,
        };
      }),
    )
    .filter(Boolean);

  const athleteCount = new Set(assignedAthletes.map((athlete) => athlete.athleteId)).size;
  const upcomingEvent = relatedEvents
    .filter((event) => event.status === "Upcoming" || event.status === "Ongoing")
    .sort((left, right) => left.startDate.localeCompare(right.startDate))[0];

  const schedule = {
    summary: {
      total: String(relatedEvents.length),
      completed: String(
        relatedEvents.filter((event) => event.status === "Completed").length,
      ),
      upcoming: String(
        relatedEvents.filter(
          (event) => event.status === "Upcoming" || event.status === "Ongoing",
        ).length,
      ),
      athleteCoverage: `${athleteCount} assigned`,
    },
    items: relatedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      type: event.type,
      date: formatDateLabel(event.startDate),
      venue: event.venue,
      status: event.status,
      statusTone: getStatusTone(event.status),
      attendance: `${event.assignedAthletes.length}/${event.maxParticipants}`,
      result:
        event.status === "Completed"
          ? "Event closed"
          : event.status === "Draft"
            ? "Planning stage"
            : "Active roster",
      coach: coach.role,
      summary: event.description,
    })),
    notes: relatedEvents.map((event) => ({
      title: event.title,
      date: formatDateLabel(event.startDate),
      description: event.notes,
    })),
    roles: [...new Set(assignedAthletes.map((athlete) => athlete.role))].slice(0, 5),
  };

  return {
    ...coach,
    assignedAthletes,
    assignedAthleteCount: athleteCount,
    nextEventLabel: upcomingEvent ? formatDateLabel(upcomingEvent.startDate) : "No live schedule",
    nextEventTitle: upcomingEvent ? upcomingEvent.title : "Awaiting assignment",
    schedule,
  };
}

export const mockCoaches = baseCoaches.map(buildCoachRecord);
