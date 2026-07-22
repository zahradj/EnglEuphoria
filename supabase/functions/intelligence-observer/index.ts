// intelligence-observer — ingests learner observation events from the lesson player
// and routes them into the right tables. Closes the feedback loop for the
// Educational Intelligence Layer.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EventType =
  | "activity_complete"
  | "speaking_attempt"
  | "mistake"
  | "idle"
  | "voluntary_speak"
  | "lesson_complete"
  | "review_attempt"
  | "recall_success"
  | "recall_fail"
  | "speaking_used"
  | "speaking_task_attempt"
  | "fluency_sample"
  | "homework_task_attempt"
  | "homework_completed"
  | "game_round_played"
  | "game_session_completed"
  | "slide_event"
  | "learner_signal"
  | "arcade_round_played"
  | "arcade_speaking_attempt"
  | "arcade_completed";

interface ObservationEvent {
  type: EventType;
  studentId: string;
  hub: "playground" | "academy" | "success";
  lessonId?: string;
  slideId?: string;
  payload?: Record<string, unknown>;
  at?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return json({ error: "missing service credentials" }, 500);
    }
    const supabase = createClient(url, key);

    const body = await req.json().catch(() => null) as { events?: ObservationEvent[] } | null;
    if (!body || !Array.isArray(body.events)) {
      return json({ error: "expected { events: [] }" }, 400);
    }

    const results: Array<{ type: string; ok: boolean; error?: string }> = [];
    for (const ev of body.events.slice(0, 50)) {
      try {
        await dispatch(supabase, ev);
        results.push({ type: ev.type, ok: true });
      } catch (e) {
        results.push({ type: ev.type, ok: false, error: String((e as Error).message ?? e) });
      }
    }

    // Touch the caches so the next runIntelligence() / runMemoryOptimization() rebuilds.
    const firstStudent = body.events[0]?.studentId;
    const firstHub = body.events[0]?.hub;
    if (firstStudent && firstHub) {
      await supabase
        .from("intelligence_snapshots")
        .update({ updated_at: new Date(0).toISOString() })
        .eq("student_id", firstStudent)
        .eq("hub", firstHub);
      await supabase
        .from("memory_heatmap_snapshots")
        .update({ updated_at: new Date(0).toISOString() })
        .eq("student_id", firstStudent)
        .eq("hub", firstHub);
    }

    return json({ accepted: results.length, results });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

async function dispatch(supabase: ReturnType<typeof createClient>, ev: ObservationEvent) {
  const p = (ev.payload ?? {}) as Record<string, any>;
  switch (ev.type) {
    case "activity_complete": {
      const skill = p.skill as string | undefined;
      const accuracy = Number(p.accuracy ?? 0);
      if (!skill) return;
      const itemType = (p.item_type as string) ?? "grammar";
      const { data: existing } = await supabase
        .from("student_mastery")
        .select("*")
        .eq("user_id", ev.studentId)
        .eq("item_key", skill)
        .eq("item_type", itemType)
        .maybeSingle();
      const correct = accuracy >= 70 ? 1 : 0;
      if (existing) {
        const tc = Number(existing.times_correct ?? 0) + correct;
        const ti = Number(existing.times_incorrect ?? 0) + (1 - correct);
        await supabase.from("student_mastery").update({
          mastery_score: Math.round((tc / Math.max(1, tc + ti)) * 100),
          times_correct: tc,
          times_incorrect: ti,
          last_tested: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("student_mastery").insert({
          user_id: ev.studentId,
          item_key: skill,
          item_type: itemType,
          hub: ev.hub,
          mastery_score: accuracy,
          times_correct: correct,
          times_incorrect: 1 - correct,
          last_tested: new Date().toISOString(),
        });
      }
      return;
    }
    case "speaking_attempt": {
      await supabase.from("speech_attempts").insert({
        user_id: ev.studentId,
        lesson_id: ev.lessonId ?? null,
        slide_id: ev.slideId ?? null,
        hub: ev.hub,
        target_sentence: p.target ?? "",
        transcript: p.transcript ?? "",
        overall_score: Number(p.score ?? 0),
        accuracy_score: Number(p.accuracy ?? p.score ?? 0),
        fluency_score: Number(p.fluency ?? 0),
        pronunciation_score: Number(p.pronunciation ?? 0),
        tier: p.tier ?? (Number(p.score ?? 0) >= 85 ? "gold" : Number(p.score ?? 0) >= 50 ? "soft" : "revert"),
        feedback: p.feedback ?? null,
        word_breakdown: p.word_breakdown ?? [],
      });
      return;
    }
    case "mistake": {
      await supabase.from("mistake_repository").insert({
        user_id: ev.studentId,
        mistake_type: p.type ?? "other",
        target_content: p.target ?? "",
        attempted_content: p.surface ?? "",
        context: p.context ?? null,
        severity: p.severity ?? "medium",
        source_lesson_id: ev.lessonId ?? null,
        source_slide_id: ev.slideId ?? null,
        resolved: false,
        attempts_count: 1,
        pattern_category: p.category ?? null,
        frequency_score: 1,
      });
      return;
    }
    case "review_attempt": {
      // SM-2+ update on memory_items + log to memory_review_history
      const skillKey = p.skill_key as string | undefined;
      const skillKind = (p.skill_kind as string) ?? "vocab";
      if (!skillKey) return;
      const success = Boolean(p.success);
      const quality = clamp(Number(p.quality ?? (success ? 4 : 1)), 0, 5);
      const recallLevel = clamp(Number(p.recall_level ?? 1), 1, 5);
      const latency = Number(p.latency_ms ?? 0);
      const speakingUsed = Boolean(p.speaking_used);

      const { data: existing } = await supabase
        .from("memory_items")
        .select("*")
        .eq("student_id", ev.studentId)
        .eq("hub", ev.hub)
        .eq("skill_kind", skillKind)
        .eq("skill_key", skillKey)
        .maybeSingle();

      const now = new Date();
      const prev = existing ?? {
        ease_factor: 2.5, interval_days: 1, repetitions: 0,
        active_mastery: 0, passive_mastery: 0,
        speaking_retention: 0, pronunciation_retention: 0,
        recall_level: 1,
      };
      const sm2 = sm2Schedule(prev, quality, speakingUsed, now);
      const activeDelta = success ? 0.08 : -0.04;
      const passiveDelta = success ? 0.05 : -0.02;
      const speakingDelta = speakingUsed ? (success ? 0.1 : 0.02) : 0;
      const next = {
        student_id: ev.studentId,
        hub: ev.hub,
        skill_kind: skillKind,
        skill_key: skillKey,
        memory_strength: clamp((Number(prev.memory_strength ?? 0) + (success ? 0.05 : -0.03)), 0, 1),
        active_mastery: clamp(Number(prev.active_mastery ?? 0) + activeDelta, 0, 1),
        passive_mastery: clamp(Number(prev.passive_mastery ?? 0) + passiveDelta, 0, 1),
        speaking_retention: clamp(Number(prev.speaking_retention ?? 0) + speakingDelta, 0, 1),
        pronunciation_retention: Number(prev.pronunciation_retention ?? 0),
        ease_factor: sm2.ef,
        interval_days: sm2.interval,
        repetitions: sm2.reps,
        last_seen_at: sm2.last,
        next_due_at: sm2.next,
        predicted_decay_at: sm2.decay,
        recall_level: recallLevel,
      };

      let memoryItemId: string | null = existing?.id ?? null;
      if (existing) {
        await supabase.from("memory_items").update({ ...next, updated_at: now.toISOString() }).eq("id", existing.id);
      } else {
        const { data: inserted } = await supabase.from("memory_items").insert(next).select("id").maybeSingle();
        memoryItemId = inserted?.id ?? null;
      }

      await supabase.from("memory_review_history").insert({
        student_id: ev.studentId,
        hub: ev.hub,
        memory_item_id: memoryItemId,
        skill_kind: skillKind,
        skill_key: skillKey,
        mode: (p.mode as string) ?? "drill",
        recall_level: recallLevel,
        success,
        latency_ms: latency || null,
        lesson_id: ev.lessonId ?? null,
        injection_slot: (p.injection_slot as string) ?? null,
      });
      return;
    }
    case "recall_success":
    case "recall_fail": {
      const skillKey = p.skill_key as string | undefined;
      const skillKind = (p.skill_kind as string) ?? "vocab";
      if (!skillKey) return;
      const success = ev.type === "recall_success";
      const { data: existing } = await supabase
        .from("memory_items")
        .select("id, active_mastery, passive_mastery")
        .eq("student_id", ev.studentId)
        .eq("hub", ev.hub)
        .eq("skill_kind", skillKind)
        .eq("skill_key", skillKey)
        .maybeSingle();
      if (!existing) return;
      const am = clamp(Number(existing.active_mastery ?? 0) + (success ? 0.06 : -0.04), 0, 1);
      const pm = clamp(Number(existing.passive_mastery ?? 0) + (success ? 0.03 : -0.02), 0, 1);
      await supabase.from("memory_items").update({
        active_mastery: am, passive_mastery: pm, updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
      return;
    }
    case "speaking_used": {
      const skillKey = p.skill_key as string | undefined;
      if (!skillKey) return;
      const { data: existing } = await supabase
        .from("memory_items")
        .select("id, speaking_retention")
        .eq("student_id", ev.studentId)
        .eq("hub", ev.hub)
        .eq("skill_key", skillKey)
        .maybeSingle();
      if (!existing) return;
      const sr = clamp(Number(existing.speaking_retention ?? 0) + 0.08, 0, 1);
      await supabase.from("memory_items").update({
        speaking_retention: sr, updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
      return;
    }
    case "speaking_task_attempt": {
      // Persist a speaking attempt + roll up speaking_profile.
      const taskType = (p.task_type as string) ?? "repetition_drill";
      const rung = (p.rung as string) ?? "repetition";
      const success = Boolean(p.success);
      const bravery = Boolean(p.bravery_bonus);
      const durationMs = Number(p.duration_ms ?? 0);
      const wpm = Number(p.wpm ?? 0);
      const hesitations = Number(p.hesitations ?? 0);

      await supabase.from("speaking_attempts").insert({
        student_id: ev.studentId,
        hub: ev.hub,
        lesson_id: ev.lessonId ?? null,
        slide_id: ev.slideId ?? null,
        task_type: taskType,
        rung,
        scenario_key: p.scenario_key ?? null,
        target_text: p.target_text ?? null,
        transcript: p.transcript ?? null,
        duration_ms: durationMs,
        wpm,
        hesitations,
        bravery_bonus: bravery,
        success,
        pronunciation_attempt_id: p.pronunciation_attempt_id ?? null,
      });

      if (p.scenario_key) {
        const { data: ex } = await supabase
          .from("speaking_task_history")
          .select("id, use_count")
          .eq("student_id", ev.studentId)
          .eq("task_type", taskType)
          .eq("scenario_key", p.scenario_key)
          .maybeSingle();
        if (ex) {
          await supabase.from("speaking_task_history").update({
            last_used_at: new Date().toISOString(),
            use_count: Number(ex.use_count ?? 0) + 1,
          }).eq("id", ex.id);
        } else {
          await supabase.from("speaking_task_history").insert({
            student_id: ev.studentId,
            hub: ev.hub,
            task_type: taskType,
            scenario_key: p.scenario_key,
          });
        }
      }

      const { data: prof } = await supabase
        .from("speaking_profile")
        .select("*")
        .eq("student_id", ev.studentId)
        .eq("hub", ev.hub)
        .maybeSingle();

      const fluencyDelta = success ? 0.04 : -0.02;
      const confDelta = bravery ? 0.06 : success ? 0.02 : -0.01;
      const next = {
        student_id: ev.studentId,
        hub: ev.hub,
        fluency_score: clamp(Number(prof?.fluency_score ?? 0) + fluencyDelta, 0, 1),
        confidence_score: clamp(Number(prof?.confidence_score ?? 0) + confDelta, 0, 1),
        current_rung: rung,
        mean_length_utterance: Number(prof?.mean_length_utterance ?? 0),
        hesitation_ratio: hesitations > 0 && durationMs > 0
          ? clamp(((Number(prof?.hesitation_ratio ?? 0.4) * 3) + (hesitations / Math.max(1, durationMs / 1000))) / 4, 0, 1)
          : Number(prof?.hesitation_ratio ?? 0.4),
        connected_speech_score: Number(prof?.connected_speech_score ?? 0),
        bravery_count: Number(prof?.bravery_count ?? 0) + (bravery ? 1 : 0),
        last_assessed_at: new Date().toISOString(),
      };
      if (prof) {
        await supabase.from("speaking_profile").update({ ...next, updated_at: new Date().toISOString() }).eq("id", prof.id);
      } else {
        await supabase.from("speaking_profile").insert(next);
      }

      // Mirror into memory_items for any covered skills
      const skills = Array.isArray(p.target_skills) ? p.target_skills : [];
      for (const sk of skills.slice(0, 6)) {
        if (!sk?.key) continue;
        const { data: mi } = await supabase
          .from("memory_items")
          .select("id, speaking_retention")
          .eq("student_id", ev.studentId)
          .eq("hub", ev.hub)
          .eq("skill_key", sk.key)
          .maybeSingle();
        if (mi) {
          const sr = clamp(Number(mi.speaking_retention ?? 0) + (success ? 0.08 : 0.02), 0, 1);
          await supabase.from("memory_items").update({
            speaking_retention: sr, updated_at: new Date().toISOString(),
          }).eq("id", mi.id);
        }
      }
      return;
    }
    case "fluency_sample": {
      await supabase.from("fluency_snapshots").insert({
        student_id: ev.studentId,
        hub: ev.hub,
        snapshot: {
          wpm: Number(p.wpm ?? 0),
          mlu: Number(p.mlu ?? 0),
          hesitation_ratio: Number(p.hesitation_ratio ?? 0),
          connected_speech_score: Number(p.connected_speech_score ?? 0),
          rung: p.rung ?? "repetition",
          at: new Date().toISOString(),
        },
      });
      return;
    }
    case "homework_task_attempt": {
      const packId = p.pack_id as string | undefined;
      const taskType = String(p.task_type ?? "vocab_recall");
      // Attempts on a real HomeworkPack row are logged; authored homework
      // (no pack_id) skips that write but still updates memory + history.
      if (packId) {
        await supabase.from("homework_attempts").insert({
          student_id: ev.studentId,
          pack_id: packId,
          task_id: String(p.task_id ?? ""),
          task_type: taskType,
          reinforcement_target_id: p.reinforcement_target_id ?? null,
          transcript: p.transcript ?? null,
          success: Boolean(p.success),
          time_spent_ms: Number(p.time_spent_ms ?? 0),
          bravery_bonus: Boolean(p.bravery_bonus),
          speech_attempt_id: p.speech_attempt_id ?? null,
        });
      }
      // homework_history — dedup key for runCoherence({ homeworkHistory }).
      const { data: hist } = await supabase
        .from("homework_history")
        .select("id, use_count")
        .eq("student_id", ev.studentId)
        .eq("hub", ev.hub)
        .eq("task_template_key", taskType)
        .maybeSingle();
      const nowIso = new Date().toISOString();
      if (hist) {
        await supabase.from("homework_history").update({
          use_count: Number(hist.use_count ?? 0) + 1,
          last_used_at: nowIso,
          updated_at: nowIso,
        }).eq("id", hist.id);
      } else {
        await supabase.from("homework_history").insert({
          student_id: ev.studentId,
          hub: ev.hub,
          task_template_key: taskType,
          use_count: 1,
          last_used_at: nowIso,
        });
      }
      // Mirror retrieval signal into memory_items when key is provided
      const skillKey = p.skill_key as string | undefined;
      if (skillKey) {
        const { data: mi } = await supabase
          .from("memory_items")
          .select("id, active_mastery")
          .eq("student_id", ev.studentId)
          .eq("hub", ev.hub)
          .eq("skill_key", skillKey)
          .maybeSingle();
        if (mi) {
          const am = clamp(Number(mi.active_mastery ?? 0) + (p.success ? 0.05 : -0.02), 0, 1);
          await supabase.from("memory_items").update({
            active_mastery: am, updated_at: new Date().toISOString(),
          }).eq("id", mi.id);
        }
      }
      return;
    }
    case "homework_completed": {
      const packId = p.pack_id as string | undefined;
      if (!packId) return;
      await supabase.from("homework_packs").update({
        status: "completed",
        updated_at: new Date().toISOString(),
      }).eq("id", packId);
      await upsertCoherenceSignals(supabase, ev.studentId, ev.hub, {
        homework_completion_rate_delta: 0.1,
      });
      return;
    }
    case "game_round_played": {
      const packId = p.pack_id as string | undefined;
      if (!packId) return;
      await supabase.from("game_attempts").insert({
        student_id: ev.studentId,
        pack_id: packId,
        round_id: String(p.round_id ?? ""),
        game_type: String(p.game_type ?? "WordRush"),
        reinforcement_target_id: p.reinforcement_target_id ?? null,
        score: Number(p.score ?? 0),
        duration_ms: Number(p.duration_ms ?? 0),
        success: Boolean(p.success),
      });
      const scenarioKey = p.scenario_key as string | undefined;
      if (scenarioKey) {
        const { data: ex } = await supabase
          .from("game_history")
          .select("id, use_count")
          .eq("student_id", ev.studentId)
          .eq("game_type", String(p.game_type ?? "WordRush"))
          .eq("scenario_key", scenarioKey)
          .maybeSingle();
        if (ex) {
          await supabase.from("game_history").update({
            last_used_at: new Date().toISOString(),
            use_count: Number(ex.use_count ?? 0) + 1,
          }).eq("id", ex.id);
        } else {
          await supabase.from("game_history").insert({
            student_id: ev.studentId,
            hub: ev.hub,
            game_type: String(p.game_type ?? "WordRush"),
            scenario_key: scenarioKey,
          });
        }
      }
      return;
    }
    case "game_session_completed": {
      await upsertCoherenceSignals(supabase, ev.studentId, ev.hub, {
        game_engagement_delta: 0.08,
      });
      return;
    }
    case "slide_event": {
      // Beta analytics: per-slide telemetry.
      const p = (ev.payload ?? {}) as Record<string, unknown>;
      await supabase.from("lesson_slide_events").insert({
        student_id: ev.studentId,
        lesson_id: ev.lessonId ?? null,
        slide_index: Number(p.slide_index ?? 0),
        event_type: String(p.event_type ?? "view"),
        dwell_ms: Number(p.dwell_ms ?? 0),
        payload: p,
      });
      return;
    }
    case "learner_signal": {
      // Beta analytics: detector verdict from runtime.
      const p = (ev.payload ?? {}) as Record<string, unknown>;
      await supabase.from("learner_signals").insert({
        student_id: ev.studentId,
        hub: ev.hub,
        signal_type: String(p.signal_type ?? "frustration"),
        severity: Number(p.severity ?? 0.5),
        evidence: p.evidence ?? [],
        source_lesson_id: ev.lessonId ?? null,
      });
      return;
    }
    case "arcade_round_played": {
      const sessionId = p.session_id as string | undefined;
      if (!sessionId) return;
      await supabase.from("arcade_rounds").insert({
        session_id: sessionId,
        game_id: String(p.game_id ?? ""),
        target_ref: p.target_ref ?? null,
        reinforcement_source: p.reinforcement_source ?? null,
        skill_kind: p.skill_kind ?? null,
        correct: Boolean(p.correct),
        latency_ms: Number(p.latency_ms ?? 0),
        retries: Number(p.retries ?? 0),
        speaking_used: Boolean(p.speaking_used),
        bravery_bonus: Boolean(p.bravery_bonus),
        mastery_delta: Number(p.mastery_delta ?? 0),
        payload: p,
      });
      // Mirror retrieval into memory_items when skill key provided
      const skillKey = p.skill_key as string | undefined;
      if (skillKey) {
        const { data: mi } = await supabase
          .from("memory_items")
          .select("id, active_mastery, speaking_retention")
          .eq("student_id", ev.studentId)
          .eq("hub", ev.hub)
          .eq("skill_key", skillKey)
          .maybeSingle();
        if (mi) {
          const am = clamp(Number(mi.active_mastery ?? 0) + (p.correct ? 0.04 : -0.02), 0, 1);
          const sr = p.speaking_used
            ? clamp(Number(mi.speaking_retention ?? 0) + (p.correct ? 0.06 : 0.02), 0, 1)
            : Number(mi.speaking_retention ?? 0);
          await supabase.from("memory_items").update({
            active_mastery: am, speaking_retention: sr, updated_at: new Date().toISOString(),
          }).eq("id", mi.id);
        }
      }
      return;
    }
    case "arcade_speaking_attempt": {
      // Mirror into speech_attempts so the speaking engine sees arcade speaking.
      await supabase.from("speech_attempts").insert({
        user_id: ev.studentId,
        lesson_id: ev.lessonId ?? null,
        hub: ev.hub,
        target_sentence: p.target ?? "",
        transcript: p.transcript ?? "",
        overall_score: Number(p.score ?? 0),
        accuracy_score: Number(p.accuracy ?? p.score ?? 0),
        fluency_score: Number(p.fluency ?? 0),
        pronunciation_score: Number(p.pronunciation ?? 0),
        tier: p.tier ?? (Number(p.score ?? 0) >= 85 ? "gold" : Number(p.score ?? 0) >= 50 ? "soft" : "revert"),
        feedback: p.feedback ?? null,
        word_breakdown: p.word_breakdown ?? [],
      });
      return;
    }
    case "arcade_completed": {
      const sessionId = p.session_id as string | undefined;
      if (!sessionId) return;
      await supabase.from("arcade_sessions").update({
        score: Number(p.score ?? 0),
        accuracy: Number(p.accuracy ?? 0),
        speaking_attempts: Number(p.speaking_attempts ?? 0),
        hesitation_ms_avg: Number(p.hesitation_ms_avg ?? 0),
        xp_awarded: Number(p.xp_awarded ?? 0),
        rounds_count: Number(p.rounds_count ?? 0),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);
      return;
    }
    case "voluntary_speak":
    case "idle":
    case "lesson_complete":
      return; // soft signals
  }
}

async function upsertCoherenceSignals(
  supabase: ReturnType<typeof createClient>,
  studentId: string,
  hub: string,
  deltas: { homework_completion_rate_delta?: number; game_engagement_delta?: number; reinforcement_coverage_delta?: number },
) {
  const { data: existing } = await supabase
    .from("coherence_signals")
    .select("*")
    .eq("student_id", studentId)
    .eq("hub", hub)
    .maybeSingle();
  const base = existing ?? {
    homework_completion_rate: 0, game_engagement: 0, reinforcement_coverage: 0, signals: {},
  };
  const next = {
    student_id: studentId,
    hub,
    homework_completion_rate: clamp(Number(base.homework_completion_rate ?? 0) + (deltas.homework_completion_rate_delta ?? 0), 0, 1),
    game_engagement: clamp(Number(base.game_engagement ?? 0) + (deltas.game_engagement_delta ?? 0), 0, 1),
    reinforcement_coverage: clamp(Number(base.reinforcement_coverage ?? 0) + (deltas.reinforcement_coverage_delta ?? 0), 0, 1),
    signals: base.signals ?? {},
  };
  if (existing) {
    await supabase.from("coherence_signals").update({ ...next, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("coherence_signals").insert(next);
  }

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function sm2Schedule(prev: any, quality: number, speakingUsed: boolean, now: Date) {
  let ef = Number(prev.ease_factor ?? 2.5);
  let reps = Number(prev.repetitions ?? 0);
  let interval = Number(prev.interval_days ?? 1);
  if (quality < 3) { reps = 0; interval = 1; }
  else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ef);
  }
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (speakingUsed) ef += 0.05;
  ef = clamp(ef, 1.3, 2.8);
  interval = clamp(interval, 1, 180);
  const next = new Date(now.getTime() + interval * 86400000);
  const decay = new Date(now.getTime() + interval * 2.5 * 86400000);
  return {
    ef: Math.round(ef * 1000) / 1000,
    interval, reps,
    last: now.toISOString(), next: next.toISOString(), decay: decay.toISOString(),
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
