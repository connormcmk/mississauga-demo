// Mock data for the Louie civic engagement demo
// Meeting-centric model: each meeting has questions with optional Negation Game boards

export type KeyQuote = {
  speaker: string;
  role?: string;
  quote: string;
};

export type MeetingQuestion = {
  id: string;
  label: string; // short tab label
  deliberativeQuestion: string;
  negationGameUrl?: string;
  audioSegment?: { start: number; end: number }; // seconds into the meeting recording
  summary: string;
  decision?: string;
  keyQuotes?: KeyQuote[];
  theme?: string;
  historicalNote?: string; // recurring pattern note shown in the inline answer
};

export type Meeting = {
  id: string;
  committee: string;
  committeeId: string;
  date: string;
  time: string;
  location: string;
  agendaHtmlUrl?: string;
  agendaPdfUrl?: string;
  minutesHtmlUrl?: string;
  minutesPdfUrl?: string;
  videoUrl?: string;
  questions: MeetingQuestion[];
  summary: string;
};

// --- Meetings with CDM data ---

export const meetings: Meeting[] = [
  {
    id: "road-safety-2026-01-27",
    committee: "Road Safety Committee",
    committeeId: "road-safety",
    date: "Tuesday, 27 January 2026",
    time: "9:30 AM",
    location: "Online Video Conference",
    agendaHtmlUrl:
      "https://pub-mississauga.escribemeetings.com/Meeting.aspx?Id=07533487-8a7e-44b4-bd23-f999f0bedc7d&Agenda=Agenda&lang=English",
    agendaPdfUrl: "#",
    videoUrl:
      "https://pub-mississauga.escribemeetings.com/Meeting.aspx?Id=07533487-8a7e-44b4-bd23-f999f0bedc7d&Agenda=Agenda&lang=English",
    questions: [
      // Ordered by Q-number in Negation Game URLs (Q1–Q5), then no-URL items
      {
        id: "q1-22m-fund",
        label: "$2.2M Road Safety Fund",
        deliberativeQuestion:
          "How should the $2.2M provincial road safety funding be deployed?",
        negationGameUrl:
          "https://negationgame.com/board/Jan-27-Q1-22M-Road-Safety-Fund_m-GXONA6Jzl8DHs9Z3M7OxI?share=sl-uQqy0QFtkaiTcTdJRh3-K&minimal=true",
        audioSegment: { start: 120, end: 620 },
        summary:
          "Staff plan equitable allocation across 11 wards (~$200k/ward), using ASE data to shortlist 5–6 candidate locations per ward with councillor input. Focus on physical traffic calming (speed cushions/bumps) plus lower-cost seasonal measures. Target 3–4 projects/ward (~40–50 total); construction anticipated 2026. March 2028 provincial deadline creates time pressure.",
        decision: "Recommendation carried — goes to General Committee next month",
        theme: "funding",
        keyQuotes: [
          {
            speaker: "Max Gill",
            role: "Staff",
            quote:
              "We're looking at equitable deployment across all 11 wards — approximately $200,000 each — focused on school zones and physical traffic calming measures.",
          },
          {
            speaker: "Committee Member",
            quote:
              "The provincial restrictions apply regardless of how we allocate. The March 2028 deadline means we need to move quickly on construction.",
          },
        ],
      },
      {
        id: "q4-headlights",
        label: "Headlight Misalignment",
        deliberativeQuestion: "Is headlight misalignment worth addressing?",
        negationGameUrl:
          "https://negationgame.com/board/jan-27-Q2-Headlight-Misalignment_m-tBj6H9GP_ZFugVCCDbE0E?share=sl-2AhbwWv94KjT7_7UDThOj&minimal=true",
        audioSegment: { start: 720, end: 1480 },
        summary:
          "The UK MOT model was cited as a successful approach. CAA receives complaints regularly. However, the province went in the opposite direction by removing license plate renewal requirements — there's no provincial appetite for additional cost to drivers. A CAA partnership was proposed as mitigation that wouldn't require provincial action.",
        decision: "Referred to promotional subcommittee — needs qualified presenter",
        theme: "education",
        keyQuotes: [
          {
            speaker: "CAA Representative",
            quote:
              "We can help develop guidance and promotional materials and communicate with approved shops. This doesn't require provincial action.",
          },
        ],
      },
      {
        id: "q2-school-bus",
        label: "School Bus Cameras",
        deliberativeQuestion:
          "Should school bus stop arm cameras be revived?",
        negationGameUrl:
          "https://negationgame.com/board/Jan-27-Q3-School-Bus-Cameras_m-GQtKRw7e2tVgMLN6WCII7?share=sl-syXRBLzUaIS4t3d_SPSTy&minimal=true",
        audioSegment: { start: 1540, end: 2100 },
        summary:
          "Initiative began around 2018; previously stalled due to procurement fraud by the original vendor. Councillor Tedjo is raising this at the regional level; Brampton is exploring a revival. School buses are region-wide, so Mississauga cannot act alone. Newer camera systems cost 60% less than the 2019 pilot technology.",
        decision: "Added to committee work plan by Monica",
        theme: "enforcement",
        keyQuotes: [
          {
            speaker: "Sunil",
            role: "Citizen Member",
            quote:
              "I personally witnessed two stop arm violations in just two weeks. This is not a theoretical problem — drivers are putting children at risk every single day.",
          },
          {
            speaker: "Councillor Tedjo",
            quote:
              "I'm raising this at the regional level. Brampton is exploring a revival — we should be coordinating with them rather than going it alone.",
          },
        ],
      },
      {
        id: "q3-road-watch",
        label: "Road Watch Awareness",
        deliberativeQuestion:
          "Is Road Watch awareness worth improving?",
        negationGameUrl:
          "https://negationgame.com/board/Jan-27-Q4-Road-Watch-worth-improving_m-RGrMJHkfrPjQnk-iMZWLP?share=sl-ZwE6NJ8hCQPmYND0pMz5q&minimal=true",
        audioSegment: { start: 2180, end: 2800 },
        summary:
          "Road Watch is a resident-driven traffic reporting tool. In 2025, residents submitted **3,590 reports** — up **8.5% year over year**, of which 2,018 were forwarded to registered vehicle owners. Peel Regional Police use the data to determine where to position enforcement officers each day.\n\nBut almost no one in Mississauga knows Road Watch exists.\n\nThe committee identified two barriers to wider adoption:\n- **Awareness** — no sustained promotional campaign has run since 2019\n- **The reporting form** — too long, and residents are uncomfortable entering personal information to report a stranger's driving",
        decision: "Referred to promotional subcommittee",
        theme: "digital",
        historicalNote:
          "This is the fourth time since 2021 that Road Watch awareness has been raised and deferred to subcommittee without a formal resolution. A resident would have to read four years of meeting minutes to notice that pattern.",
        keyQuotes: [
          {
            speaker: "Sunil",
            role: "Citizen Member",
            quote:
              "I personally assure residents their information won't be shared. But we need to make the process simpler — the form is a barrier.",
          },
          {
            speaker: "Councillor Dasko",
            quote:
              "If it doesn't get reported, it didn't happen.",
          },
        ],
      },
      {
        id: "q5-event-participation",
        label: "Event Participation",
        deliberativeQuestion:
          "How do we increase Road Safety Committee event participation?",
        negationGameUrl:
          "https://negationgame.com/board/Jan-27-Q5-Increase-Road-Watch-Participation-Event_m-EydoHj8Yomc_HDCfPUSoT?share=sl-Qrg1JsGtcTxnAmwzQWkR9&minimal=true",
        audioSegment: { start: 2880, end: 3540 },
        summary:
          "Only 12 of 35 planned Road Watch events in 2025 met minimum attendance. The committee was dormant from approximately February 2020 through 2024. Strategies discussed include social media outreach, partnerships with neighbourhood associations, and integrating safety messaging into existing community events. Councillor offices need to provide 3–4 weeks' notice for volunteer coordination.",
        decision: "Staff/Chair to issue email calls for volunteers",
        theme: "process",
        keyQuotes: [
          {
            speaker: "Committee Chair",
            quote:
              "We need councillor offices giving us 3 to 4 weeks' notice. We can't scramble volunteers together in a few days.",
          },
        ],
      },
      {
        id: "q6-meeting-frequency",
        label: "Meeting Frequency",
        deliberativeQuestion:
          "Should the committee meet more frequently?",
        summary:
          "The 60-day gap between meetings means follow-up items wait too long. Recent agendas have been more robust, suggesting sufficient business to justify more frequent meetings. However, this is an election year — the committee may only meet 2–3 more times. The previous rationale for less frequent meetings was a lack of sufficient agenda items.",
        decision: "Deferred — review after March agenda",
        theme: "process",
        keyQuotes: [
          {
            speaker: "Committee Member",
            quote:
              "The 60-day gap means important follow-ups just sit there. If our agendas are this full, we should be meeting monthly.",
          },
        ],
      },
    ],
    summary: `**Road Safety Committee — January 27, 2026**

This meeting covered six key items across funding, enforcement, awareness, and process:

**$2.2M Provincial Road Safety Fund** — Staff plan equitable allocation across 11 wards (~$200k/ward), using ASE data to shortlist locations. Focus on physical traffic calming in school zones. Target 40–50 total projects; construction in 2026. Goes to General Committee next month.

**School Bus Stop-Arm Cameras** — Initiative that began ~2018, previously stalled due to vendor procurement fraud. Newer technology is 60% cheaper. Average of 8 stop arm violations per bus per day. Added to committee work plan.

**Road Watch Awareness** — 8.5% growth with 3,590 reports in 2025, but most residents don't know it exists. Form length and privacy concerns are barriers. Referred to promotional subcommittee.

**Headlight Misalignment** — UK MOT model cited; no provincial appetite for mandatory checks. CAA partnership proposed for guidance materials. Referred to promotional subcommittee.

**Event Participation** — Only 12/35 planned events met minimum attendance. Need 3–4 weeks notice from councillor offices for volunteer coordination.

**Meeting Frequency** — 60-day gaps slow down follow-ups. Deferred pending review after March agenda.`,
  },
  {
    id: "road-safety-2026-03-24",
    committee: "Road Safety Committee",
    committeeId: "road-safety",
    date: "Tuesday, 24 March 2026",
    time: "8:30 AM",
    location: "Online Video Conference",
    agendaHtmlUrl: "#",
    agendaPdfUrl: "#",
    videoUrl: "#",
    questions: [],
    summary:
      "This meeting's deliberation map has not yet been generated. Check back after the meeting transcript has been processed.",
  },
];

export const getMeeting = (id: string): Meeting | undefined =>
  meetings.find((m) => m.id === id);

// The most recent meeting with CDM content
export const mostRecentMeeting = meetings.find(
  (m) => m.questions.length > 0,
)!;

// --- Mock Chat Responses ---

export const mockChatResponses: Record<string, string> = {
  "2.2m": `The committee decided to deploy the **$2.2M provincial Road Safety Initiatives Fund** equitably across all 11 wards — approximately **$200,000 each** — focused on physical traffic calming in school zones.

### Key details

- **Funding source:** Provincial Road Safety Initiatives Fund, letter received November 2025
- **Deadline:** Must be spent by **March 2028**
- **Approach:** Staff will use Automated Speed Enforcement (ASE) data to shortlist 5–6 candidate locations per ward, then seek councillor input
- **Focus areas:** Speed cushions, speed bumps, and lower-cost seasonal measures
- **Scale:** Target 3–4 projects per ward, approximately **40–50 total projects**
- **Timeline:** Construction anticipated to begin in 2026

> *"We're looking at equitable deployment across all 11 wards — approximately $200,000 each — focused on school zones and physical traffic calming measures."*

— **Max Gill, Staff**

The recommendation was carried and goes to **General Committee next month** for approval.`,

  "school bus": `The school bus stop-arm camera initiative has a **long and complicated history** going back to 2018.

### Background

The original program stalled due to **procurement fraud** — the vendor involved in the 2019 pilot was found to have engaged in misconduct, killing the initiative.

### Current status

- **Councillor Tedjo** is raising the issue at the regional level
- **Brampton** is independently exploring a revival
- School buses operate **region-wide**, so Mississauga can't implement cameras alone
- Newer camera systems cost **60% less** than the 2019 pilot technology
- Data shows an average of **8 stop arm violations per bus per day** in Mississauga

> *"I personally witnessed two stop arm violations in just two weeks. This is not a theoretical problem — drivers are putting children at risk every single day."*

— **Sunil, Citizen Member**

**Decision:** Added to committee work plan by Monica. Regional coordination with Brampton is the likely path forward.`,

  "unresolved": `Based on the January 27 meeting, several items remain **unresolved or deferred**:

### Deferred items

- **Meeting frequency** — The question of whether to meet more often than every 60 days was deferred pending the March agenda. The committee may only meet 2–3 more times this term (election year).
- **Headlight misalignment** — Referred to promotional subcommittee, but still needs a qualified presenter and has no provincial support.

### Ongoing challenges

- **Road Watch awareness** — Has been raised 4 times since 2021 with no formal resolution. Keeps getting referred to subcommittee. The program is growing (8.5% YoY) but most residents still don't know it exists.
- **School bus cameras** — History goes back to 2018. Previously stalled due to vendor fraud. Now revived but requires regional coordination — Mississauga can't act alone.
- **Event participation** — Only 12 of 35 planned events met minimum attendance in 2025. Structural issues with volunteer coordination remain.

> *"This was one of the examples that I happen to remember that has dropped off the table. Now, granted, that was probably two terms ago."*

— **Sunil Sharma, Citizen Member** (Road Safety Committee, Jan 27)`,

  "citizen-disagree": `That's an interesting perspective, and it touches on a real tension in the committee's debate.

### The equity vs. equality argument

The committee chose **equal distribution** (~$200K per ward), but several members did raise the point you're making:

- **Wards 5, 7, and 1** have significantly higher collision rates near schools — in some cases **3x the city average** based on ASE data
- The provincial funding letter does not require equal distribution — it allows **needs-based allocation**
- Staff's ASE shortlisting data could support a proportional model just as easily as an equal one

### What was said in the meeting

The counterargument from staff was that equitable allocation ensures **political buy-in across all 11 wards**, making it more likely the program moves forward quickly within the March 2028 deadline.

> *"If we weight the funding toward a few wards, we risk losing support from the others — and then the whole program stalls."*

— **Max Gill, Staff**

However, your point aligns with what transportation safety research supports: **targeting high-risk corridors yields greater safety returns per dollar spent**.

If you'd like, you can propose this as a formal citizen point on the deliberation map. It would be reviewed by the municipality's Citizen Engagement Coordinator and, if approved, added to the argument thread alongside the committee's own discussion.`,

  "headlight": `The committee discussed **headlight misalignment** as a growing road safety concern, particularly for oncoming drivers at night.

### Background

- The **UK MOT model** was cited as a successful regulatory approach — mandatory vehicle inspections that include headlight alignment checks
- **CAA** confirmed they receive regular complaints about misaligned headlights, especially from aftermarket LED conversions
- However, Ontario recently went in the **opposite direction** by eliminating license plate renewal sticker requirements — signalling no provincial appetite for additional cost to drivers

### What was proposed

A **CAA partnership** was suggested as a practical alternative that wouldn't require provincial legislation:

> *"We can help develop guidance and promotional materials and communicate with approved shops. This doesn't require provincial action."*

— **CAA Representative**

### Current status

**Referred to promotional subcommittee** — the committee needs a qualified presenter to speak to the technical and safety data before taking further action.`,

  "road watch awareness": `The committee had a substantive discussion about whether to invest in **improving awareness** of the Road Watch program — a resident-driven reporting tool that lets citizens report aggressive or dangerous driving they witness.

### The program is growing — but invisibly

- **3,590 reports submitted in 2025**, an **8.5% year-over-year increase**
- **2,018 of those reports** were forwarded to registered vehicle owners
- Reports **drive daily officer deployment** — Peel Regional Police use the data to decide where to position enforcement each day
- Despite this, **most Mississauga residents don't know Road Watch exists**

### The two barriers identified

**1. Awareness** — No sustained promotional campaign has run since 2019. The program grew organically during the committee's dormancy (2020–2024) without marketing support.

**2. The reporting form itself** — Residents find it too long, and many are uncomfortable entering personal information (name, address, phone number) to report a stranger's driving.

> *"I personally assure residents their information won't be shared. But we need to make the process simpler — the form is a barrier."*

— **Sunil, Citizen Member**

### What was proposed

- **Simplify the reporting form** — strip it down to the essentials
- **Social media campaign** leveraging Peel Police channels and councillor offices
- **Integration with existing community events** rather than standalone outreach
- **Privacy reassurance** — make it clear that reporter information is not shared with the vehicle owner

### Decision

**Referred to the promotional subcommittee.** This is the fourth time since 2021 that Road Watch awareness has been raised without a formal resolution — the program keeps getting acknowledged as valuable and then deferred to subcommittee.`,

  "event participation": `The committee addressed a significant **participation gap** in Road Watch events during 2025.

### The problem

- Only **12 of 35** planned Road Watch events met minimum attendance thresholds
- The committee was **dormant from approximately February 2020 through 2024**, losing momentum and volunteer networks
- Councillor offices are not providing adequate lead time for volunteer coordination

### What was discussed

- **Social media outreach** and partnerships with neighbourhood associations
- Integrating safety messaging into **existing community events** rather than standalone events
- Need for **3–4 weeks' notice** from councillor offices to coordinate volunteers

> *"We need councillor offices giving us 3 to 4 weeks' notice. We can't scramble volunteers together in a few days."*

— **Committee Chair**

### Decision

Staff and the Chair will issue **email calls for volunteers** ahead of upcoming events. The structural challenge of rebuilding participation after a 4-year dormancy remains.`,
};

export const institutionalMemoryResponse = `Yes — the **$2.2M provincial road safety funding** was discussed in the **Budget Committee** on January 13, 2026, two weeks before it reached the Road Safety Committee's agenda.

### Budget Committee — January 13, 2026

**Councillor Alvin Tedjo** introduced the funding during the roads budget review:

> *"We are in the process of preparing a report back to our Road Safety Committee to discuss how we plan to utilize that funding and the strategy for addressing our school zones moving forward in the absence of ASE. Essentially what it will allow us to do is install $2.2 million worth of additional traffic calming over the next couple of years in those school zones where ASE had operated or planned to operate."*

**Councillor John Kovac** pressed on the obvious follow-up:

> *"And I guess part of that report that will be forthcoming will be — was that a sufficient enough amount?"*

**Tedjo** committed to answering it:

> *"Yes, I think we'll look to quantify what we're able to do with that $2.2 million and what options that provides to us. We have made additional inquiries with the province of Ontario regarding the potential next round of funding."*

### Road Safety Committee — January 27, 2026

Two weeks later, **Max Gill** (Acting Director, Traffic Services and Road Safety) delivered the promised follow-up report:

> *"This is follow-up to the previous discussion we had at last year's road safety meeting regarding funding being provided by the province to the city in lieu of automated speed enforcement... The city received a letter from the province in November of last year indicating that an initial funding was being provided in the amount of roughly $2.2 million..."*

The plan Gill presented: **equitable allocation across all 11 wards (~$200K each), 40–50 physical traffic-calming projects, construction beginning in 2026.** A March 2028 provincial deadline creates time pressure.

### The unanswered question

Kovac's specific question — *"was that a sufficient enough amount?"* — is not addressed in the Road Safety Committee transcript. Max Gill quantifies **what the money can buy** (scale, ward distribution, project count), but does not evaluate whether it closes the gap left by the province's cancellation of Automated Speed Enforcement.

The Budget Committee asked about adequacy. The Road Safety Committee delivered an allocation plan. The two halves of the conversation lived in different meetings, with no explicit thread linking them.`;

// --- Argument Map Data for the Jan 27 meeting ---

import type { QuestionMap } from "../components/ArgumentMap";

export const roadSafetyArgumentMap: QuestionMap[] = [
  {
    id: "am-q1",
    number: "Q1",
    question:
      "How should the $2.2M provincial road safety funding be deployed?",
    status: "closed",
    claim:
      "Equitable allocation across all 11 wards (~$200K each), focused on school zones and physical traffic calming",
    nodes: [
      {
        tag: "S1",
        type: "support",
        content:
          "ASE data provides objective shortlisting — 5–6 candidate locations per ward",
        speaker: "Max Gill, Staff",
      },
      {
        tag: "S2",
        type: "support",
        content:
          "Physical traffic calming (speed cushions/bumps) is proven effective and cost-efficient",
        speaker: "Max Gill, Staff",
      },
      {
        tag: "S3",
        type: "support",
        content:
          "Equitable ward-by-ward allocation ensures all communities benefit",
        speaker: "Committee Member",
      },
      {
        tag: "N1",
        type: "negate",
        content:
          "Councillor-directed allocation might target highest-need areas more effectively",
        speaker: "Committee Member",
      },
      {
        tag: "M(N1).1",
        type: "mitigate",
        content:
          "Provincial restrictions apply regardless — councillor input is built into the shortlisting process",
        speaker: "Max Gill, Staff",
      },
    ],
    subQuestions: [
      {
        text: "Can lower-cost seasonal measures stretch the budget further?",
        speaker: "Committee Member",
        answers: [
          {
            text: "Yes — seasonal measures complement permanent infrastructure and allow 3–4 projects per ward",
            speaker: "Max Gill, Staff",
          },
        ],
      },
    ],
    referral: "→ Goes to General Committee next month",
  },
  {
    id: "am-q2",
    number: "Q2",
    question: "Should school bus stop arm cameras be revived?",
    status: "open",
    options: [
      {
        label: "O1 — Revive the program with newer, cheaper technology",
        nodes: [
          {
            tag: "S(O1).1",
            type: "support",
            content:
              "Average of 8 stop arm violations per bus per day — the problem is severe",
            speaker: "Staff",
          },
          {
            tag: "S(O1).2",
            type: "support",
            content:
              "Newer camera systems cost 60% less than the 2019 pilot technology",
            speaker: "Staff",
          },
          {
            tag: "S(O1).3",
            type: "support",
            content:
              "I personally witnessed two violations in just two weeks",
            speaker: "Sunil, Citizen Member",
          },
          {
            tag: "N(O1).1",
            type: "negate",
            content:
              "School buses are region-wide — Mississauga cannot implement cameras alone",
            speaker: "Staff",
          },
          {
            tag: "M(N(O1).1).1",
            type: "mitigate",
            content:
              "Brampton is exploring a revival — regional coordination is the path forward",
            speaker: "Councillor Tedjo",
          },
        ],
      },
    ],
    subQuestions: [
      {
        text: "Why did the original program fail?",
        speaker: "Committee Member",
        answers: [
          {
            text: "Procurement fraud by the original vendor killed the initiative around 2019",
            speaker: "Staff",
          },
          {
            text: "Other vendors likely exist now — the market has matured",
            speaker: "Committee Member",
          },
        ],
      },
    ],
    unresolved: [
      {
        text: "Regional coordination timeline — waiting on Brampton and Councillor Tedjo's regional advocacy",
      },
    ],
    referral: "→ Added to committee work plan by Monica",
  },
  {
    id: "am-q3",
    number: "Q3",
    question: "Is Road Watch awareness worth improving?",
    status: "open",
    options: [
      {
        label: "O1 — Invest in awareness and simplify the reporting process",
        nodes: [
          {
            tag: "S(O1).1",
            type: "support",
            content:
              "8.5% year-over-year growth — 3,590 reports in 2025, 2,018 sent to registered owners",
            speaker: "Staff",
          },
          {
            tag: "S(O1).2",
            type: "support",
            content:
              "Reports drive daily officer deployment — direct operational impact",
            speaker: "Staff",
          },
          {
            tag: "N(O1).1",
            type: "negate",
            content:
              "Most residents don't know Road Watch exists",
            speaker: "Committee Member",
          },
          {
            tag: "N(O1).2",
            type: "negate",
            content:
              "The reporting form is too long and people are uncomfortable sharing personal information",
            speaker: "Sunil, Citizen Member",
          },
          {
            tag: "M(N(O1).2).1",
            type: "mitigate",
            content:
              "I personally assure residents their information won't be shared — but we need process change",
            speaker: "Sunil, Citizen Member",
          },
        ],
      },
    ],
    unresolved: [
      { text: "No plan to simplify the reporting form" },
      { text: "Digital promotion strategy not yet defined" },
    ],
    referral: "→ Referred to promotional subcommittee",
  },
  {
    id: "am-q4",
    number: "Q4",
    question: "Is headlight misalignment worth addressing?",
    status: "open",
    options: [
      {
        label: "O1 — Pursue through CAA partnership and public education",
        nodes: [
          {
            tag: "S(O1).1",
            type: "support",
            content:
              "UK MOT model demonstrates successful mandatory inspection approach",
            speaker: "Committee Member",
          },
          {
            tag: "S(O1).2",
            type: "support",
            content:
              "CAA receives complaints regularly — demand for action exists",
            speaker: "CAA Representative",
          },
          {
            tag: "N(O1).1",
            type: "negate",
            content:
              "Province removed license plate renewals — no appetite for additional cost to drivers",
            speaker: "Staff",
          },
          {
            tag: "M(N(O1).1).1",
            type: "mitigate",
            content:
              "CAA can develop guidance and communicate with approved shops — no provincial action needed",
            speaker: "CAA Representative",
          },
        ],
      },
    ],
    unresolved: [{ text: "Needs a qualified presenter — not yet identified" }],
    referral: "→ Referred to promotional subcommittee",
  },
  {
    id: "am-q5",
    number: "Q5",
    question:
      "How do we increase Road Safety Committee event participation?",
    status: "open",
    options: [
      {
        label: "O1 — Improve coordination and expand outreach channels",
        nodes: [
          {
            tag: "S(O1).1",
            type: "support",
            content:
              "Only 12 of 35 planned Road Watch events met minimum attendance in 2025",
            speaker: "Staff",
          },
          {
            tag: "S(O1).2",
            type: "support",
            content:
              "Social media, neighbourhood associations, and integrating into existing events could help",
            speaker: "Committee Member",
          },
          {
            tag: "N(O1).1",
            type: "negate",
            content:
              "Councillor offices aren't providing enough lead time for volunteer coordination",
            speaker: "Committee Chair",
          },
          {
            tag: "M(N(O1).1).1",
            type: "mitigate",
            content:
              "Require 3–4 weeks' notice from councillor offices — formalize the process",
            speaker: "Committee Chair",
          },
        ],
      },
    ],
    referral: "→ Staff/Chair to issue email calls for volunteers",
  },
  {
    id: "am-q6",
    number: "Q6",
    question: "Should the committee meet more frequently?",
    status: "open",
    options: [
      {
        label: "O1 — Move to monthly meetings",
        nodes: [
          {
            tag: "S(O1).1",
            type: "support",
            content:
              "60-day gap means follow-up items wait too long",
            speaker: "Committee Member",
          },
          {
            tag: "S(O1).2",
            type: "support",
            content:
              "Recent agendas have been robust — sufficient business to justify more meetings",
            speaker: "Committee Member",
          },
          {
            tag: "N(O1).1",
            type: "negate",
            content:
              "This is an election year — committee may only meet 2–3 more times",
            speaker: "Committee Member",
          },
          {
            tag: "N(O1).2",
            type: "negate",
            content:
              "Previous rationale for less frequent meetings was lack of agenda items",
            speaker: "Staff",
          },
        ],
      },
    ],
    unresolved: [
      { text: "Decision deferred — review after March agenda" },
    ],
  },
];
