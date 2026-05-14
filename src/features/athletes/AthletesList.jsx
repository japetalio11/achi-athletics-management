import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
} from "../../components/ui/Modal";

const mockAthletes = [
  {
    id: "#2021-08422",
    name: "Sarah Jenkins",
    sport: "Track & Field",
    department: "Department of Computer Studies",
    event: "400m Hurdles",
    standing: "Deans List",
    status: "Cleared",
    coach: "Marcus Thorne",
    year: "Junior Year",
    scholarship: "Full Scholarship",
    gpa: 3.85,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260241",
    personal: {
      birthdate: "May 18, 2003",
      age: "22 years old",
      gender: "Female",
      nationality: "Filipino",
      height: "170 cm",
      weight: "60 kg",
      bloodType: "O+",
      side: "Right lead leg",
      guardianTag: "Parent Consent Updated",
    },
    contact: {
      phone: "+63 917 555 0188",
      email: "sarah.jenkins@adnu.edu.ph",
      address: "Unit 4, Loyola Heights, Quezon City",
      emergency: {
        name: "Martha Jenkins",
        relationship: "Mother",
        phone: "+63 917 555 0141",
      },
    },
    overview: {
      summary:
        "High-priority sprint athlete preparing for regional qualifiers with strong academic standing and stable medical clearance.",
      eligibility: "Fully eligible",
      eligibilityNote: "Cleared for all meets",
      trainingLoad: "High volume",
      trainingNote: "Tempo and hurdle phase",
      documentStatus: "4 active records",
      documentNote: "Medical file expires in June",
      nextReview: "May 20, 2026",
      reviewOwner: "Coach and physio",
      alerts: [
        {
          title: "Achilles monitoring",
          body:
            "Left Achilles soreness is under observation after back-to-back hurdle sessions.",
          level: "attention",
        },
        {
          title: "Qualifier preparation",
          body:
            "The coaching team is tapering volume this week to sharpen race-day execution.",
          level: "good",
        },
      ],
    },
    eventsParticipation: {
      summary: {
        total: "8",
        completed: "5",
        upcoming: "2",
        attendance: "96%",
      },
      items: [
        {
          title: "Regional Hurdles Qualifier",
          type: "Competition",
          date: "May 9, 2026",
          venue: "University Oval Track",
          status: "Completed",
          attendance: "Present",
          result: "1st Place",
          coach: "Marcus Thorne",
          summary: "",
          metrics: ["54.2 sec", "Reaction +0.11", "PB achieved"],
        },
        {
          title: "Sprint Mechanics Block",
          type: "Training",
          date: "May 14, 2026",
          venue: "Performance Track Lab",
          status: "Ongoing",
          attendance: "Present",
          result: "In progress",
          coach: "Marcus Thorne",
          summary: "",
          metrics: ["12 hurdle reps", "8.5/10 readiness", "Low strain"],
        },
        {
          title: "National University Athletics Meet",
          type: "Competition",
          date: "May 28, 2026",
          venue: "Metro Athletics Complex",
          status: "Upcoming",
          attendance: "Scheduled",
          result: "Pending",
          coach: "Marcus Thorne",
          summary:
            "Final target event of the month with Sarah seeded among the top hurdle athletes in the region.",
          metrics: ["Seed #2", "Travel cleared", "Race heat pending"],
        },
      ],
      notes: [
        {
          title: "Competition planning",
          date: "May 13, 2026",
          description:
            "Coaching staff approved reduced class travel conflict after reviewing qualifier and national meet timelines.",
        },
        {
          title: "Attendance highlight",
          date: "May 7, 2026",
          description:
            "Perfect attendance recorded across the last five structured sessions, including strength and track work.",
        },
      ],
      roles: ["Starter", "Heat leader", "Relay reserve"],
    },
    history: [
      {
        date: "2023 Season",
        title: "Transferred into elite sprint pool",
        description:
          "Moved from general athletics into the focused hurdles group after breaking the internal 400m benchmark.",
        tag: "Program",
      },
      {
        date: "November 2024",
        title: "Qualified for national university meet",
        description:
          "Earned direct qualification after posting a season-best time during conference finals.",
        tag: "Competition",
      },
      {
        date: "February 2026",
        title: "Strength block completed",
        description:
          "Closed six-week force-development cycle with measurable improvements in start power and hurdle rhythm.",
        tag: "Training",
      },
      {
        date: "April 2026",
        title: "Sports science review",
        description:
          "Biomechanics review recommended ankle mobility work and more conservative recovery spacing.",
        tag: "Health",
      },
    ],
    achievements: [
      {
        title: "School Record Watchlist",
        date: "2026 Outdoor Season",
        description:
          "Within 0.6 seconds of the current school record in the 400m hurdles.",
      },
      {
        title: "Academic Merit Recognition",
        date: "1st Semester 2025-2026",
        description:
          "Recognized by the college dean for maintaining above 3.8 GPA during active competition.",
      },
    ],
    academics: {
      gpaTrend: "+0.18 from last term",
      attendance: "96%",
      attendanceNote: "No missed labs this term",
      units: "21 units",
      term: "2nd Semester 2025-2026",
      eligibility: "Competition eligible",
      eligibilityNote: "No compliance holds",
      trend: [
        { label: "S1 '24", value: 68, score: "3.42", active: false },
        { label: "S2 '24", value: 73, score: "3.56", active: false },
        { label: "S1 '25", value: 82, score: "3.71", active: false },
        { label: "Current", value: 94, score: "3.85", active: true },
      ],
      currentSubjects: [
        { name: "Sports Psychology", grade: "A-", schedule: "MWF 10:00 AM" },
        { name: "Statistics", grade: "A", schedule: "TTH 1:30 PM" },
        { name: "Media Writing", grade: "B+", schedule: "MWF 2:00 PM" },
        { name: "Exercise Physiology", grade: "A", schedule: "TTH 8:00 AM" },
      ],
      notes: [
        {
          title: "Adviser note",
          owner: "Prof. Elaine Cruz",
          body:
            "Sarah remains highly responsive to guided planning and is ahead on major academic requirements.",
        },
        {
          title: "Study support",
          owner: "Athlete Services",
          body:
            "Maintain current tutoring rhythm during travel weeks to avoid compression before exams.",
        },
      ],
    },
    performanceMetrics: [
      {
        label: "Sprint Performance",
        value: "54.2",
        subLabel: "400m hurdles (sec)",
        note: "Personal best with 0.4 second improvement",
        progress: 82,
        icon: "activity",
        tone: "blue",
      },
      {
        label: "Strength (Squat)",
        value: "115 kg",
        subLabel: "Current max load",
        note: "Target is 125 kg before regional meet",
        progress: 91,
        icon: "strength",
        tone: "gold",
      },
      {
        label: "Wellness Score",
        value: "92/100",
        subLabel: "Optimal readiness",
        note: "Sleep and soreness logs are both trending positive",
        progress: 92,
        icon: "heart",
        tone: "dark",
      },
    ],
    health: {
      recoveryNote:
        "Sarah is progressing well through hurdle rhythm work. Continue cryotherapy after intense track days and protect the left Achilles with low-impact recovery on Thursdays.",
      updatedBy: "Head Coach Marcus Thorne",
      updatedAt: "Updated 4 hours ago",
      sleep: "8.5 hrs",
      hydration: "3.1 L",
      readiness: "High",
      trainingFocus: [
        "Hurdle clearance timing",
        "Achilles load management",
        "Sprint finish mechanics",
      ],
      medicalHistory: [
        {
          date: "April 29, 2026",
          title: "Physio follow-up",
          description:
            "Mild tendon irritation remains manageable. Continue eccentric calf work and post-session mobility.",
        },
        {
          date: "March 12, 2026",
          title: "Routine sports medical",
          description:
            "Full clearance retained with no restrictions for competition participation.",
        },
      ],
    },
    documents: [
      {
        name: "Scholarship_Agreement.pdf",
        meta: "Signed Oct 12, 2025 | 2.4 MB",
        kind: "pdf",
      },
      {
        name: "Medical_Clearance_2026.docx",
        meta: "Expires Jun 20, 2026 | 1.1 MB",
        kind: "doc",
      },
      {
        name: "Athlete_ID_Scan.png",
        meta: "Verified identity file | 850 KB",
        kind: "image",
      },
      {
        name: "Regional_Qualifier_Form.pdf",
        meta: "Submitted last week | 640 KB",
        kind: "pdf",
      },
    ],
    equipmentHistory: [
      {
        name: "Nike Air Zoom Victory",
        serial: "#TK-8912",
        issuedDate: "Nov 02, 2025",
        dueDate: "Mar 15, 2026",
        status: "In Possession",
        icon: "shoe",
      },
      {
        name: "Resistance Band Set (L4)",
        serial: "#TR-440",
        issuedDate: "Oct 15, 2025",
        dueDate: "Oct 30, 2025",
        status: "Returned",
        icon: "strength",
      },
      {
        name: "Polar H10 Heart Monitor",
        serial: "#SN-90221",
        issuedDate: "Apr 28, 2026",
        dueDate: "May 12, 2026",
        status: "Overdue",
        icon: "monitor",
      },
    ],
  },
  {
    id: "#2022-09114",
    name: "Marcus Santos",
    sport: "Basketball",
    department: "Department of Business Management",
    event: "Point Guard",
    standing: "Good",
    status: "Injured",
    coach: "David Reyes",
    year: "Sophomore Year",
    scholarship: "Partial Scholarship",
    gpa: 3.2,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260242",
    personal: {
      birthdate: "September 3, 2004",
      age: "21 years old",
      gender: "Male",
      nationality: "Filipino",
      height: "182 cm",
      weight: "77 kg",
      bloodType: "A+",
      side: "Right hand dominant",
      guardianTag: "Guardian Confirmed",
    },
    contact: {
      phone: "+63 917 555 0226",
      email: "marcus.santos@adnu.edu.ph",
      address: "Magsaysay Avenue, Naga City",
      emergency: {
        name: "Roberto Santos",
        relationship: "Father",
        phone: "+63 917 555 0208",
      },
    },
    overview: {
      summary:
        "Floor general currently in rehab rotation after a minor ankle sprain, with close coordination between coaching and sports medicine.",
      eligibility: "Conditionally active",
      eligibilityNote: "Awaiting final return-to-play signoff",
      trainingLoad: "Modified",
      trainingNote: "Non-contact sessions only",
      documentStatus: "3 active records",
      documentNote: "Rehab notes updated weekly",
      nextReview: "May 18, 2026",
      reviewOwner: "Team physician",
      alerts: [
        {
          title: "Return-to-play phase",
          body:
            "Marcus is on a progressive movement plan and should remain out of full-contact drills for now.",
          level: "attention",
        },
        {
          title: "Leadership role retained",
          body:
            "Still leading film breakdown and half-court organization during team practice meetings.",
          level: "good",
        },
      ],
    },
    eventsParticipation: {
      summary: {
        total: "7",
        completed: "4",
        upcoming: "1",
        attendance: "91%",
      },
      items: [
        {
          title: "Backcourt Tactical Film Review",
          type: "Team Meeting",
          date: "May 11, 2026",
          venue: "Basketball War Room",
          status: "Completed",
          attendance: "Present",
          result: "Led review",
          coach: "David Reyes",
          summary:
            "Marcus led the point-guard film breakdown while remaining on restricted court participation.",
          metrics: ["3 scouting clips", "2 player briefings", "Full attendance"],
        },
        {
          title: "Guard Return-to-Play Session",
          type: "Training",
          date: "May 14, 2026",
          venue: "Main Gym Court B",
          status: "Ongoing",
          attendance: "Present",
          result: "Modified reps",
          coach: "David Reyes",
          summary:
            "Participating in controlled non-contact movement and half-court decision drills as part of rehab progression.",
          metrics: ["18 mins load", "No swelling", "75% speed cap"],
        },
        {
          title: "Pre-Season Basketball Combine",
          type: "Fitness Test",
          date: "May 18, 2026",
          venue: "Main Gym Performance Lab",
          status: "Upcoming",
          attendance: "Confirmed",
          result: "Pending",
          coach: "David Reyes",
          summary:
            "Expected to complete selected performance tests if final ankle clearance is maintained through the weekend.",
          metrics: ["Clearance pending", "Jump tests limited", "Medical review"],
        },
      ],
      notes: [
        {
          title: "Rehab participation rule",
          date: "May 12, 2026",
          description:
            "Marcus may attend all tactical sessions but must stay on controlled minutes for physical training events.",
        },
        {
          title: "Leadership assignment",
          date: "May 6, 2026",
          description:
            "Assigned to support first-year guards during film review and half-court walkthroughs while out of contact drills.",
        },
      ],
      roles: ["Point guard", "Film lead", "Backcourt captain"],
    },
    history: [
      {
        date: "2024 Season",
        title: "Promoted to starting point guard",
        description:
          "Took over the starting role after showing consistent decision-making and defensive pressure.",
        tag: "Roster",
      },
      {
        date: "January 2026",
        title: "Ankle sprain sustained",
        description:
          "Rolled right ankle during transition defense and began supervised rehab three days later.",
        tag: "Health",
      },
      {
        date: "March 2026",
        title: "Film-room captain assignment",
        description:
          "Asked to lead opponent scouting breakdowns for the backcourt unit during recovery period.",
        tag: "Leadership",
      },
      {
        date: "May 2026",
        title: "On-court movement progression",
        description:
          "Returned to change-of-direction drills with no swelling after controlled practice loads.",
        tag: "Rehab",
      },
    ],
    achievements: [
      {
        title: "Assist-to-turnover leader",
        date: "2025 University League",
        description:
          "Finished with the best assist-to-turnover ratio on the team among all rotation players.",
      },
      {
        title: "Coach's Leadership Citation",
        date: "2025-2026 Midyear Review",
        description:
          "Recognized for accountability, communication, and mentoring first-year guards.",
      },
    ],
    academics: {
      gpaTrend: "+0.05 from last term",
      attendance: "93%",
      attendanceNote: "Excused rehab travel only",
      units: "19 units",
      term: "2nd Semester 2025-2026",
      eligibility: "Eligible with monitoring",
      eligibilityNote: "Needs to maintain attendance above 90%",
      trend: [
        { label: "S1 '24", value: 58, score: "2.94", active: false },
        { label: "S2 '24", value: 63, score: "3.05", active: false },
        { label: "S1 '25", value: 72, score: "3.16", active: false },
        { label: "Current", value: 80, score: "3.20", active: true },
      ],
      currentSubjects: [
        { name: "Marketing", grade: "B+", schedule: "MWF 9:00 AM" },
        { name: "Human Kinetics", grade: "A-", schedule: "TTH 10:30 AM" },
        { name: "Business Ethics", grade: "B", schedule: "MWF 1:00 PM" },
        { name: "Coaching Theory", grade: "A-", schedule: "TTH 3:00 PM" },
      ],
      notes: [
        {
          title: "Faculty note",
          owner: "Prof. Miguel De Leon",
          body:
            "Marcus remains engaged in class discussion, though he benefits from earlier submission pacing during travel weeks.",
        },
        {
          title: "Support action",
          owner: "Academic Services",
          body:
            "Continue weekly study hall while he is away from full practice to protect consistency.",
        },
      ],
    },
    performanceMetrics: [
      {
        label: "Assist Rate",
        value: "8.4",
        subLabel: "Per game average",
        note: "Top playmaker on the roster this term",
        progress: 84,
        icon: "activity",
        tone: "blue",
      },
      {
        label: "Lower Body Strength",
        value: "140 kg",
        subLabel: "Trap bar max",
        note: "Maintained despite limited court work",
        progress: 88,
        icon: "strength",
        tone: "gold",
      },
      {
        label: "Recovery Index",
        value: "79/100",
        subLabel: "Moderate readiness",
        note: "Ankle soreness still present after intense lateral work",
        progress: 79,
        icon: "heart",
        tone: "dark",
      },
    ],
    health: {
      recoveryNote:
        "Marcus is transitioning from isolated rehab into non-contact team integration. Prioritize lateral stability, ankle stiffness reduction, and movement confidence before clearance.",
      updatedBy: "Dr. Andrea Velasco",
      updatedAt: "Updated yesterday",
      sleep: "7.4 hrs",
      hydration: "2.7 L",
      readiness: "Moderate",
      trainingFocus: [
        "Ankle stability",
        "Deceleration control",
        "Half-court decision pace",
      ],
      medicalHistory: [
        {
          date: "May 10, 2026",
          title: "Functional movement check",
          description:
            "Passed single-leg loading test with only mild post-session soreness and no swelling.",
        },
        {
          date: "January 21, 2026",
          title: "Initial ankle assessment",
          description:
            "Grade 1 lateral ankle sprain with no fracture signs. Began restricted rehab protocol.",
        },
      ],
    },
    documents: [
      {
        name: "Rehab_Clearance_Update.pdf",
        meta: "Uploaded May 11, 2026 | 980 KB",
        kind: "pdf",
      },
      {
        name: "Scholarship_Renewal.docx",
        meta: "Reviewed Feb 2026 | 1.6 MB",
        kind: "doc",
      },
      {
        name: "ID_Backup_Image.png",
        meta: "Identity archive | 700 KB",
        kind: "image",
      },
    ],
    equipmentHistory: [
      {
        name: "Ankle Brace Set",
        serial: "#BB-7719",
        issuedDate: "Jan 24, 2026",
        dueDate: "Jun 01, 2026",
        status: "In Possession",
        icon: "monitor",
      },
      {
        name: "Team Warmup Kit",
        serial: "#BB-4402",
        issuedDate: "Aug 14, 2025",
        dueDate: "Apr 01, 2026",
        status: "Returned",
        icon: "shoe",
      },
      {
        name: "Tablet Film Unit",
        serial: "#BB-1022",
        issuedDate: "Apr 05, 2026",
        dueDate: "May 05, 2026",
        status: "Overdue",
        icon: "monitor",
      },
    ],
  },
  {
    id: "#2020-04192",
    name: "Elena Rodriguez",
    sport: "Volleyball",
    department: "Department of Communication",
    event: "Libero",
    standing: "Probation",
    status: "Pending Review",
    coach: "Sarah Lim",
    year: "Senior Year",
    scholarship: "Walk-on",
    gpa: 2.1,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e290260243",
    personal: {
      birthdate: "December 12, 2002",
      age: "23 years old",
      gender: "Female",
      nationality: "Filipino",
      height: "165 cm",
      weight: "58 kg",
      bloodType: "B+",
      side: "Right hand dominant",
      guardianTag: "Review Required",
    },
    contact: {
      phone: "+63 917 555 0314",
      email: "elena.rodriguez@adnu.edu.ph",
      address: "Pacol Road, Naga City",
      emergency: {
        name: "Lourdes Rodriguez",
        relationship: "Aunt",
        phone: "+63 917 555 0301",
      },
    },
    overview: {
      summary:
        "Senior libero balancing final-year eligibility concerns with academic recovery and document renewal requirements.",
      eligibility: "At risk",
      eligibilityNote: "Pending compliance review",
      trainingLoad: "Controlled",
      trainingNote: "Practice volume trimmed during finals",
      documentStatus: "2 records expiring",
      documentNote: "Medical and scholarship files need updates",
      nextReview: "May 16, 2026",
      reviewOwner: "Compliance office",
      alerts: [
        {
          title: "Academic intervention active",
          body:
            "Elena has mandatory tutoring and weekly faculty check-ins until grades stabilize.",
          level: "attention",
        },
        {
          title: "Roster value remains strong",
          body:
            "Defensive communication and serve-receive coverage remain important to the current unit.",
          level: "good",
        },
      ],
    },
    eventsParticipation: {
      summary: {
        total: "6",
        completed: "3",
        upcoming: "1",
        attendance: "87%",
      },
      items: [
        {
          title: "Women's Volleyball Tactical Session",
          type: "Training",
          date: "May 14, 2026",
          venue: "Fr. Godofredo Alingal Gym",
          status: "Ongoing",
          attendance: "Present",
          result: "2nd unit libero",
          coach: "Sarah Lim",
          summary:
            "Elena is active in reception and communication drills, though workload is being watched during finals week.",
          metrics: ["86% receive", "Low jump load", "Full walkthrough"],
        },
        {
          title: "Captain's Wellness Seminar",
          type: "Seminar",
          date: "May 12, 2026",
          venue: "Athletics Conference Hall",
          status: "Cancelled",
          attendance: "Excused",
          result: "Session cancelled",
          coach: "Sarah Lim",
          summary:
            "Originally intended as a leadership and wellness seminar, but the session was cancelled due to a speaker issue.",
          metrics: ["No session", "Reschedule pending", "Excused"],
        },
        {
          title: "Conference Defensive Tune-Up",
          type: "Competition",
          date: "May 21, 2026",
          venue: "City Sports Center",
          status: "Upcoming",
          attendance: "Assigned",
          result: "Pending",
          coach: "Sarah Lim",
          summary:
            "Projected to participate in a reduced but important defensive role if compliance documents are completed on time.",
          metrics: ["Roster pending", "Doc review", "Travel hold"],
        },
      ],
      notes: [
        {
          title: "Attendance concern",
          date: "May 8, 2026",
          description:
            "Elena missed one optional walkthrough during exam pressure week and must maintain stronger participation consistency.",
        },
        {
          title: "Role adjustment",
          date: "May 2, 2026",
          description:
            "Coaches trimmed non-essential reps to help balance academic recovery with event readiness.",
        },
      ],
      roles: ["Libero", "Serve receive anchor", "Defensive specialist"],
    },
    history: [
      {
        date: "2022 Season",
        title: "Earned starting libero minutes",
        description:
          "Secured consistent match rotation after major growth in floor coverage and passing control.",
        tag: "Roster",
      },
      {
        date: "August 2025",
        title: "Placed on academic watch",
        description:
          "Entered monitored status after a difficult travel-heavy term affected assignment completion.",
        tag: "Academics",
      },
      {
        date: "January 2026",
        title: "Renewed athlete services plan",
        description:
          "Committed to tutoring support, attendance checks, and reduced extracurricular load.",
        tag: "Support",
      },
      {
        date: "April 2026",
        title: "Compliance document reminder",
        description:
          "Medical renewal and eligibility paperwork were flagged for urgent completion.",
        tag: "Admin",
      },
    ],
    achievements: [
      {
        title: "Best Receiver of the Match",
        date: "Conference Round 2, 2025",
        description:
          "Recorded the cleanest first-ball platform grade on the team during the match win.",
      },
      {
        title: "Community Sports Volunteer",
        date: "2025 Offseason",
        description:
          "Served as a volunteer mentor for youth volleyball clinics in the city program.",
      },
    ],
    academics: {
      gpaTrend: "-0.22 from last term",
      attendance: "88%",
      attendanceNote: "Needs immediate improvement",
      units: "18 units",
      term: "2nd Semester 2025-2026",
      eligibility: "Probationary",
      eligibilityNote: "Final review after grading period",
      trend: [
        { label: "S1 '24", value: 66, score: "3.12", active: false },
        { label: "S2 '24", value: 60, score: "2.90", active: false },
        { label: "S1 '25", value: 54, score: "2.54", active: false },
        { label: "Current", value: 48, score: "2.10", active: true },
      ],
      currentSubjects: [
        { name: "Research Methods", grade: "C+", schedule: "MWF 8:00 AM" },
        { name: "Organizational Comm", grade: "B-", schedule: "TTH 11:00 AM" },
        { name: "Internship Prep", grade: "C", schedule: "MWF 3:00 PM" },
        { name: "Wellness Studies", grade: "B", schedule: "TTH 2:00 PM" },
      ],
      notes: [
        {
          title: "Academic probation note",
          owner: "Registrar Compliance",
          body:
            "Elena must complete all missing submissions and sustain weekly attendance above minimum threshold.",
        },
        {
          title: "Tutoring plan",
          owner: "Athlete Services",
          body:
            "Recommended two guided writing sessions per week and direct course check-ins every Friday.",
        },
      ],
    },
    performanceMetrics: [
      {
        label: "Serve Receive Rating",
        value: "7.8",
        subLabel: "Team average scale",
        note: "Still one of the best passers in the back row unit",
        progress: 78,
        icon: "activity",
        tone: "blue",
      },
      {
        label: "Lower Body Strength",
        value: "82 kg",
        subLabel: "Front squat max",
        note: "Maintained despite reduced lifting during exam month",
        progress: 72,
        icon: "strength",
        tone: "gold",
      },
      {
        label: "Wellness Score",
        value: "74/100",
        subLabel: "Needs rest support",
        note: "Stress and sleep consistency are lowering readiness",
        progress: 74,
        icon: "heart",
        tone: "dark",
      },
    ],
    health: {
      recoveryNote:
        "No acute injury is present, but Elena is showing accumulated fatigue. Protect recovery during finals and reinforce sleep and nutrition habits while keeping match-readiness stable.",
      updatedBy: "Coach Sarah Lim",
      updatedAt: "Updated 7 hours ago",
      sleep: "6.3 hrs",
      hydration: "2.1 L",
      readiness: "Watch",
      trainingFocus: [
        "Serve receive consistency",
        "Recovery routines",
        "Stress management",
      ],
      medicalHistory: [
        {
          date: "May 5, 2026",
          title: "Wellness check",
          description:
            "No injury restriction, but athlete reported elevated fatigue and inconsistent sleep during exams.",
        },
        {
          date: "February 18, 2026",
          title: "Shoulder maintenance consult",
          description:
            "Minor shoulder tightness resolved through mobility work with no participation limits.",
        },
      ],
    },
    documents: [
      {
        name: "Eligibility_Review_Request.pdf",
        meta: "Submitted for review | 730 KB",
        kind: "pdf",
      },
      {
        name: "Medical_Renewal_Form.docx",
        meta: "Pending physician signature | 1.0 MB",
        kind: "doc",
      },
      {
        name: "Athlete_ID_Archive.png",
        meta: "Old backup image | 690 KB",
        kind: "image",
      },
    ],
    equipmentHistory: [
      {
        name: "Knee Pad Set",
        serial: "#VB-2341",
        issuedDate: "Aug 10, 2025",
        dueDate: "Jun 10, 2026",
        status: "In Possession",
        icon: "shoe",
      },
      {
        name: "Recovery Compression Boots",
        serial: "#VB-8810",
        issuedDate: "Apr 22, 2026",
        dueDate: "May 08, 2026",
        status: "Overdue",
        icon: "monitor",
      },
      {
        name: "Training Jersey Set",
        serial: "#VB-1004",
        issuedDate: "Aug 10, 2025",
        dueDate: "Apr 02, 2026",
        status: "Returned",
        icon: "strength",
      },
    ],
  },
];

export function AthletesList() {
  const { setSelectedAthlete } = useNavigation();
  const [modal, setModal] = useState(null);

  const closeModal = () => setModal(null);

  return (
    <div className="relative animate-in space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Active Roster
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage and monitor all student-athletes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block group">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
            <input
              type="text"
              placeholder="Search athletes..."
              className="w-64 rounded-full border border-border-subtle/50 bg-surface-card py-2 pl-10 pr-4 text-[12px] text-slate-700 shadow-soft outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "filter" })}
            className="flex items-center gap-2 rounded-full border border-border-subtle/50 bg-surface-card px-4 py-2 text-[12px] font-medium tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            FILTER
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[12px] font-medium tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            ADD ATHLETE
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border-subtle/40 bg-surface-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle/50 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="p-5 pl-7 font-semibold">Athlete</th>
                <th className="p-5 font-semibold">Sport / Event</th>
                <th className="p-5 font-semibold">Academic</th>
                <th className="p-5 font-semibold">Medical</th>
                <th className="p-5 pr-7 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-[13px]">
              {mockAthletes.map((athlete) => (
                <tr
                  key={athlete.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                  onClick={() => setSelectedAthlete(athlete)}
                >
                  <td className="p-5 pl-7">
                    <div className="flex items-center gap-4">
                      <img
                        src={athlete.imageUrl}
                        alt={athlete.name}
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <span className="block font-semibold text-slate-900">
                          {athlete.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {athlete.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="block font-medium text-slate-700">
                      {athlete.sport}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {athlete.event}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          athlete.gpa >= 3.0
                            ? "bg-brand-blue"
                            : athlete.gpa >= 2.5
                              ? "bg-brand-gold"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="font-semibold text-slate-700">
                        {athlete.gpa.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        athlete.status === "Cleared"
                          ? "bg-green-50 text-green-700"
                          : athlete.status === "Pending Review"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {athlete.status}
                    </span>
                  </td>
                  <td className="p-5 pr-7 text-right">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedAthlete(athlete);
                      }}
                      className="rounded-lg px-3 py-1.5 font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5 hover:text-brand-blue-hover"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AthletesListModal modal={modal} onClose={closeModal} />
    </div>
  );
}

function AthletesListModal({ modal, onClose }) {
  if (!modal) return null;

  if (modal.type === "filter") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Filter Roster"
        description="Narrow the roster by sport, clearance status, and academic risk."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Reset</SecondaryButton>
            <PrimaryButton onClick={onClose}>Apply filters</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sport">
            <SelectInput defaultValue="All sports">
              <option>All sports</option>
              <option>Basketball</option>
              <option>Track & Field</option>
              <option>Volleyball</option>
            </SelectInput>
          </Field>
          <Field label="Medical status">
            <SelectInput defaultValue="Any status">
              <option>Any status</option>
              <option>Cleared</option>
              <option>Injured</option>
              <option>Pending Review</option>
            </SelectInput>
          </Field>
          <Field label="Academic standing">
            <SelectInput defaultValue="Any standing">
              <option>Any standing</option>
              <option>Good</option>
              <option>Deans List</option>
              <option>Probation</option>
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput defaultValue="Any scholarship">
              <option>Any scholarship</option>
              <option>Full Scholarship</option>
              <option>Partial Scholarship</option>
              <option>Walk-on</option>
            </SelectInput>
          </Field>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Athlete"
      description="Create a placeholder athlete profile for later backend persistence."
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onClose}>Save athlete</PrimaryButton>
        </>
      }
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <TextInput placeholder="Student-athlete name" />
        </Field>
        <Field label="Student ID">
          <TextInput placeholder="#2026-00000" />
        </Field>
        <Field label="Sport">
          <SelectInput defaultValue="Basketball">
            <option>Basketball</option>
            <option>Track & Field</option>
            <option>Volleyball</option>
            <option>Football</option>
          </SelectInput>
        </Field>
        <Field label="Event / Position">
          <TextInput placeholder="Point Guard, Libero, 400m..." />
        </Field>
        <Field label="Coach">
          <TextInput placeholder="Assigned coach" />
        </Field>
        <Field label="Medical status">
          <SelectInput defaultValue="Cleared">
            <option>Cleared</option>
            <option>Injured</option>
            <option>Pending Review</option>
          </SelectInput>
        </Field>
      </div>
    </Modal>
  );
}
