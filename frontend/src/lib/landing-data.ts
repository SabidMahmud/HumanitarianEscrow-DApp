// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroSignal = {
  value: string;
  copy: string;
};

export type MissionJourneyItem = {
  title: string;
  copy: string;
};

export type Role = {
  label: string;
  badge: string;
  title: string;
  copy: string;
  points: string[];
};

export type LifecycleStep = {
  step: string;
  title: string;
  copy: string;
};

export type FundRoute = {
  label: string;
  title: string;
  copy: string;
  items: string[];
};

export type MissionRule = {
  title: string;
  copy: string;
  accentClassName: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const heroSignals: HeroSignal[] = [
  {
    value: "3 role views",
    copy: "Separate donor, agency, and arbiter workspaces keep actions clear.",
  },
  {
    value: "Escrow first",
    copy: "Funds are locked before delivery, not handed over on trust alone.",
  },
  {
    value: "Status-driven",
    copy: "Each mission moves through visible states from pending to resolved.",
  },
];

export const missionJourney: MissionJourneyItem[] = [
  {
    title: "Mission is posted",
    copy: "A donor defines the category, region, and maximum budget.",
  },
  {
    title: "Agencies place bids",
    copy: "Relief agencies compete with operational cost pledges inside the budget.",
  },
  {
    title: "Escrow is funded",
    copy: "The donor selects one pledge and the contract locks that amount.",
  },
  {
    title: "Delivery is approved or disputed",
    copy: "Funds release after approval, or the arbiter resolves the dispute path.",
  },
];

export const missionRules: MissionRule[] = [
  {
    title: "Current Rule: Bid ceiling",
    copy: "Agencies cannot bid above the donor's maximum budget.",
    accentClassName: "border-l-emerald-500 mt-8",
  },
  {
    title: "Current Rule: Reputation gate",
    copy: "Agencies below 40 reputation cannot pledge on missions.",
    accentClassName: "border-l-teal-500 mt-4",
  },
];

export const roles: Role[] = [
  {
    label: "Donor",
    badge: "Create & Fund",
    title: "Start missions and decide when escrow should be activated.",
    copy: "The donor defines the need, reviews competing pledges, and controls approval or dispute after delivery.",
    points: [
      "Post mission category, region, and budget ceiling",
      "Compare agency pledges on the same mission",
      "Approve delivery or escalate to dispute",
    ],
  },
  {
    label: "Relief Agency",
    badge: "Bid & Deliver",
    title: "Pledge operational cost only when budget and reputation allow.",
    copy: "Agencies submit bids on pending missions, track funded work, and mark delivery when the mission is complete.",
    points: [
      "Submit bids that stay within mission budget",
      "Maintain reputation above the eligibility threshold",
      "Mark funded missions as delivered",
    ],
  },
  {
    label: "UN Arbiter",
    badge: "Resolve Disputes",
    title: "Handle contested missions and enforce the final ruling.",
    copy: "When donors dispute delivery, the arbiter chooses whether to refund the donor or release funds to the agency.",
    points: [
      "See disputed missions in one dedicated panel",
      "Penalize agency fault when required",
      "Close missions with a final resolution",
    ],
  },
];

export const lifecycle: LifecycleStep[] = [
  {
    step: "01",
    title: "Connect and register",
    copy: "MetaMask identifies the wallet and the app loads the correct role flow.",
  },
  {
    step: "02",
    title: "Create or bid",
    copy: "Donors post a mission while agencies submit pledges within the set budget.",
  },
  {
    step: "03",
    title: "Lock funds in escrow",
    copy: "A selected bid moves into escrow and the mission changes from pending to in transit.",
  },
  {
    step: "04",
    title: "Finish or resolve",
    copy: "The donor approves delivery for payout, or sends the mission into dispute.",
  },
];

export const fundRoutes: FundRoute[] = [
  {
    label: "Approved delivery",
    title: "The agency gets paid after donor approval.",
    copy: "The donor confirms the completed delivery, the contract deducts the fee, and the remaining amount goes to the agency.",
    items: [
      "Donor funds selected pledge",
      "Agency marks delivery complete",
      "Approval releases payout from escrow",
    ],
  },
  {
    label: "Disputed delivery",
    title: "The arbiter decides whether to refund or release funds.",
    copy: "Disputed missions move into a separate resolution path where the arbiter makes the final financial decision.",
    items: [
      "Mission enters disputed status",
      "Agency may be penalized for fault",
      "Resolution refunds donor or pays agency",
    ],
  },
];
