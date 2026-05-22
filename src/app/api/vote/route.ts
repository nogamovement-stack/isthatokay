import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Toggle a vote. Proxies to the toggle_vote RPC from migration 001 which
 * handles all the business logic:
 *   - Karma threshold (50 net) required to downvote
 *   - Recomputes upvotes/downvotes from the votes ledger
 *   - Updates the target's hot_score (posts only)
 *   - Bumps the target author's karma by the delta
 *   - Rejects self-votes
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "not_signed_in" }, { status: 401 });
  }

  let body: {
    target_type?: "post" | "comment";
    target_id?: string;
    vote?: -1 | 0 | 1;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const { target_type, target_id, vote } = body;
  if (!target_type || !["post", "comment"].includes(target_type)) {
    return NextResponse.json({ ok: false, reason: "bad_target_type" }, { status: 400 });
  }
  if (!target_id) {
    return NextResponse.json({ ok: false, reason: "missing_target_id" }, { status: 400 });
  }
  if (vote === undefined || ![-1, 0, 1].includes(vote)) {
    return NextResponse.json({ ok: false, reason: "bad_vote" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase as any).rpc("toggle_vote", {
    p_target_type: target_type,
    p_target_id: target_id,
    p_vote: vote,
  })) as {
    data:
      | { ok: true; upvotes: number; downvotes: number; your_vote: number }
      | { ok: false; reason: string }
      | null;
    error: { message: string } | null;
  };

  if (error) {
    console.error("[api/vote] rpc failed:", error);
    return NextResponse.json(
      { ok: false, reason: "rpc_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
