export type QuoteAnchorV1 = {
  strategy: "quote";
  quote: string;
  prefix?: string;
  suffix?: string;
  sectionId?: string; // optional hint to constrain search
};

export type AnchorV1 = QuoteAnchorV1;

export type AnchorMatchOk = { status: "ok"; start: number; end: number };
export type AnchorMatchMissing = { status: "missing" };
export type AnchorMatchAmbiguous = { status: "ambiguous"; candidates: number };

export type AnchorMatch = AnchorMatchOk | AnchorMatchMissing | AnchorMatchAmbiguous;
