/**
 * Le gymday-raw.txt e gera supabase/migrations/0021_seed_gymday.sql.
 *
 * Mapeamento pro schema (migrations 0019 + 0020):
 *   muscle_groups + emphasized_regions + equipment  -> mapas in-memory
 *   exercises                                       -> public.exercises
 *   exercise_primary_muscles                        -> exercises.primary_muscle (texto)
 *   exercise_secondary_muscles                      -> exercises.secondary_muscles (text[])
 *   exercise_equipment                              -> exercises.equipment_list (text[])
 *   exercise_emphasized_regions                     -> exercises.regions (text[])
 *   schedules                                       -> workout_templates
 *   workouts (em schedule_workouts)                 -> workout_template_blocks
 *   workouts orfaos (sem schedule)                  -> workout_template (1 bloco, is_single_day=true)
 *   workout_exercises                               -> workout_template_exercises
 *   exercise_sets                                   -> workout_template_exercise_sets
 *
 * Idempotencia: usa os UUIDs originais do GymDay como PK.
 * `on conflict (id) do nothing` em todas as tabelas pra permitir re-execucao.
 *
 * Rodar:  npx tsx scripts/generate-gymday-seed.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAW_PATH = join(process.cwd(), "gymday-raw.txt");
const OUT_PATH = join(process.cwd(), "supabase/migrations/0021_seed_gymday.sql");

// -- traducoes EN -> PT-BR pra exibicao no app
const MUSCLE_PT: Record<string, string> = {
  Abductors: "Abdutores",
  Abs: "Abdomen",
  Biceps: "Biceps",
  Calves: "Panturrilhas",
  Cardio: "Cardio",
  Chest: "Peito",
  Forearms: "Antebracos",
  Glutes: "Gluteos",
  Hamstrings: "Posteriores",
  Lats: "Dorsais",
  "Lower Back": "Lombar",
  "Middle Back": "Costas",
  Quadriceps: "Quadriceps",
  Shoulders: "Ombros",
  Traps: "Trapezio",
  Triceps: "Triceps",
};

const REGION_PT: Record<string, string> = {
  "Anterior Forearms": "Antebracos anteriores",
  "Biceps Long Head": "Cabeca longa do biceps",
  "Biceps Short Head": "Cabeca curta do biceps",
  Brachialis: "Braquial",
  "Front Deltoids": "Deltoide anterior",
  Gastrocnemius: "Gastrocnemio",
  "Lower Abs": "Abdomen inferior",
  "Lower Chest": "Peito inferior",
  "Middle Chest": "Peito medio",
  Obliques: "Obliquos",
  "Rear Deltoids": "Deltoide posterior",
  "Side Deltoids": "Deltoide lateral",
  Soleus: "Soleo",
  "Triceps Lateral Head": "Cabeca lateral do triceps",
  "Triceps Long Head": "Cabeca longa do triceps",
  "Upper Abs": "Abdomen superior",
  "Upper Chest": "Peito superior",
};

const GOAL_PT: Record<string, string> = {
  gain_strength: "Ganhar Força",
  build_muscle: "Hipertrofia",
  lose_fat: "Perder Gordura",
};

const LEVEL_PT: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

// -----------------------------------------------------------------
// Parsing
// -----------------------------------------------------------------

type AnyRow = Record<string, unknown>;

// Normaliza uma linha JSONL com smart quotes como delimitadores.
// Trata o caso de `"foo"` ASCII aparecer DENTRO de uma string delimitada
// por smart quotes (e.g. ..."cortar depois"...) escapando o ASCII " como \"
// antes de converter as smart quotes pra ASCII.
function normalizeQuotes(line: string): string {
  const OPEN = "“"; // "
  const CLOSE = "”"; // "
  let inside = false;
  let out = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === OPEN) {
      inside = true;
      out += '"';
    } else if (ch === CLOSE) {
      inside = false;
      out += '"';
    } else if (ch === '"' && inside) {
      // ASCII quote dentro de uma string smart-quoted: escapa
      out += '\\"';
    } else {
      out += ch;
    }
  }
  return out.replace(/[‘’]/g, "'");
}

function readSections(): Record<string, AnyRow[]> {
  const raw = readFileSync(RAW_PATH, "utf-8");

  const sections: Record<string, AnyRow[]> = {};
  const lines = raw.split("\n");

  let current: string | null = null;
  for (const line of lines) {
    const trim = line.trim();
    if (trim.startsWith("# ") && !trim.startsWith("# ====")) {
      current = trim.slice(2).trim();
      sections[current] = [];
      continue;
    }
    if (!current) continue;
    if (!trim || trim.startsWith("#") || !trim.startsWith("{") && !trim.startsWith("“")) continue;
    const normalized = normalizeQuotes(trim);
    try {
      sections[current].push(JSON.parse(normalized));
    } catch (e) {
      throw new Error(
        `Falha parseando secao "${current}": ${(e as Error).message}\nLinha: ${normalized.slice(0, 200)}`,
      );
    }
  }
  return sections;
}

// -----------------------------------------------------------------
// SQL helpers
// -----------------------------------------------------------------

function sqlString(s: string | null | undefined): string {
  if (s == null) return "null";
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlUuid(s: string | null | undefined): string {
  if (!s) return "null";
  return `'${s.toLowerCase()}'::uuid`;
}

function sqlInt(n: number | null | undefined): string {
  if (n == null) return "null";
  return String(n | 0);
}

function sqlBool(b: boolean | undefined): string {
  return b ? "true" : "false";
}

function sqlTextArray(arr: string[]): string {
  if (!arr.length) return "'{}'::text[]";
  const escaped = arr.map((s) => `"${s.replace(/"/g, '\\"')}"`).join(",");
  return `'{${escaped}}'::text[]`;
}

// -----------------------------------------------------------------
// Build
// -----------------------------------------------------------------

function build() {
  const s = readSections();
  const out: string[] = [];

  out.push(
    "-- =====================================================================",
    "-- Seed GymDay: 165 exercicios + 34 templates (com 17 single-day) +",
    "-- workout_template_blocks + workout_template_exercises + sets",
    "-- individuais.",
    "--",
    "-- Idempotente: usa UUIDs originais do GymDay e on conflict do nothing.",
    "-- Gerado por scripts/generate-gymday-seed.ts a partir de gymday-raw.txt.",
    "-- =====================================================================",
    "",
    "begin;",
    "",
  );

  // ------------- mapas pra resolucao -------------
  const muscleEnById = new Map<string, string>();
  for (const m of s.muscle_groups) muscleEnById.set(m.id as string, m.name as string);

  const regionEnById = new Map<string, string>();
  for (const r of s.emphasized_regions)
    regionEnById.set(r.id as string, r.name as string);

  const equipNameById = new Map<string, string>();
  for (const e of s.equipment) equipNameById.set(e.id as string, e.name as string);

  // exercise -> [muscle/equipment/region names em PT-BR]
  const primaryByExercise = new Map<string, string[]>();
  for (const r of s.exercise_primary_muscles) {
    const exId = r.exercise_id as string;
    const en = muscleEnById.get(r.muscle_group_id as string);
    if (!en) continue;
    const pt = MUSCLE_PT[en] ?? en;
    if (!primaryByExercise.has(exId)) primaryByExercise.set(exId, []);
    primaryByExercise.get(exId)!.push(pt);
  }

  const secondaryByExercise = new Map<string, string[]>();
  for (const r of s.exercise_secondary_muscles) {
    const exId = r.exercise_id as string;
    const en = muscleEnById.get(r.muscle_group_id as string);
    if (!en) continue;
    const pt = MUSCLE_PT[en] ?? en;
    if (!secondaryByExercise.has(exId)) secondaryByExercise.set(exId, []);
    secondaryByExercise.get(exId)!.push(pt);
  }

  const equipByExercise = new Map<string, string[]>();
  for (const r of s.exercise_equipment) {
    const exId = r.exercise_id as string;
    const name = equipNameById.get(r.equipment_id as string);
    if (!name) continue;
    if (!equipByExercise.has(exId)) equipByExercise.set(exId, []);
    equipByExercise.get(exId)!.push(name);
  }

  const regionsByExercise = new Map<string, string[]>();
  for (const r of s.exercise_emphasized_regions) {
    const exId = r.exercise_id as string;
    const en = regionEnById.get(r.emphasized_region_id as string);
    if (!en) continue;
    const pt = REGION_PT[en] ?? en;
    if (!regionsByExercise.has(exId)) regionsByExercise.set(exId, []);
    regionsByExercise.get(exId)!.push(pt);
  }

  // ------------- exercises -------------
  out.push("-- exercises ---------------------------------------------------------");
  for (const ex of s.exercises) {
    const id = ex.id as string;
    const name = ex.name as string;
    const category = (ex.category as string) ?? null;
    const mech = (ex.mechanics_type as string) ?? null;
    const level = (ex.experience_level as number) ?? null;
    const primary = primaryByExercise.get(id)?.[0] ?? null;
    const secondary = secondaryByExercise.get(id) ?? [];
    const equip = equipByExercise.get(id) ?? [];
    const regions = regionsByExercise.get(id) ?? [];

    // muscle_group e equipment (campos antigos da tabela, NOT NULL)
    const muscleGroup = primary ?? "Corpo todo";
    const firstEquip = equip[0] ?? null;
    const oldLevel =
      level == null
        ? "null"
        : level <= 2
          ? "'iniciante'"
          : level <= 3
            ? "'intermediario'"
            : "'avancado'";

    out.push(
      `insert into public.exercises (id, name, muscle_group, equipment, level, modality, is_global, gymday_id, mechanics_type, category, level_numeric, primary_muscle, secondary_muscles, equipment_list, regions)`,
      `values (${sqlUuid(id)}, ${sqlString(name)}, ${sqlString(muscleGroup)}, ${sqlString(firstEquip)}, ${oldLevel}, 'musculacao', true, ${sqlUuid(id)}, ${mech ? sqlString(mech) : "null"}, ${category ? sqlString(category) : "null"}, ${sqlInt(level)}, ${sqlString(primary)}, ${sqlTextArray(secondary)}, ${sqlTextArray(equip)}, ${sqlTextArray(regions)})`,
      `on conflict (id) do update set`,
      `  name = excluded.name,`,
      `  mechanics_type = excluded.mechanics_type,`,
      `  category = excluded.category,`,
      `  level_numeric = excluded.level_numeric,`,
      `  primary_muscle = excluded.primary_muscle,`,
      `  secondary_muscles = excluded.secondary_muscles,`,
      `  equipment_list = excluded.equipment_list,`,
      `  regions = excluded.regions,`,
      `  gymday_id = excluded.gymday_id;`,
      "",
    );
  }

  // ------------- workout_templates -------------
  out.push("-- workout_templates -------------------------------------------------");

  // Mapa schedule_id -> [{workout_id, position}]
  const workoutsBySchedule = new Map<string, { workout_id: string; position: number }[]>();
  for (const sw of s.schedule_workouts) {
    const sid = sw.schedule_id as string;
    if (!workoutsBySchedule.has(sid)) workoutsBySchedule.set(sid, []);
    workoutsBySchedule.get(sid)!.push({
      workout_id: sw.workout_id as string,
      position: sw.position as number,
    });
  }

  for (const sched of s.schedules) {
    const id = sched.id as string;
    const name = sched.name as string;
    const description = (sched.description as string) ?? null;
    const main_goal = sched.main_goal
      ? (GOAL_PT[sched.main_goal as string] ?? null)
      : null;
    const level = sched.training_level
      ? (LEVEL_PT[sched.training_level as string] ?? null)
      : null;
    const days = (sched.days_per_week as number) ?? null;
    const num = workoutsBySchedule.get(id)?.length ?? 0;

    out.push(
      `insert into public.workout_templates (id, name, main_goal, level, days_per_week, num_workouts, description, source)`,
      `values (${sqlUuid(id)}, ${sqlString(name)}, ${main_goal ? sqlString(main_goal) : "null"}, ${level ? sqlString(level) : "null"}, ${sqlInt(days)}, ${sqlInt(num)}, ${sqlString(description)}, 'gymday')`,
      `on conflict (id) do update set`,
      `  name = excluded.name,`,
      `  main_goal = excluded.main_goal,`,
      `  level = excluded.level,`,
      `  days_per_week = excluded.days_per_week,`,
      `  num_workouts = excluded.num_workouts,`,
      `  description = excluded.description;`,
      "",
    );
  }

  // ------------- workouts orfaos -> workout_templates single-day -------------
  // Workouts que nao aparecem em schedule_workouts viram um template avulso.
  const workoutsInSchedule = new Set<string>();
  for (const sw of s.schedule_workouts) workoutsInSchedule.add(sw.workout_id as string);

  const orphanWorkouts = s.workouts.filter(
    (w) => !workoutsInSchedule.has(w.id as string),
  );

  // Pra orfaos, o template_id = workout_id (reutiliza UUID).
  out.push(
    "-- workouts orfaos como single-day templates ---------------------------",
  );
  for (const w of orphanWorkouts) {
    const id = w.id as string;
    const name = w.name as string;
    out.push(
      `insert into public.workout_templates (id, name, num_workouts, source, is_featured)`,
      `values (${sqlUuid(id)}, ${sqlString(name)}, 1, 'gymday-single', false)`,
      `on conflict (id) do update set name = excluded.name;`,
      "",
    );
  }

  // ------------- workout_template_blocks -------------
  // Pra cada schedule_workout, cria 1 bloco. workout_id = block_id (reusa UUID).
  out.push("-- workout_template_blocks ------------------------------------------");
  const workoutNameById = new Map<string, string>();
  for (const w of s.workouts) workoutNameById.set(w.id as string, w.name as string);

  const blockIdByWorkoutId = new Map<string, string>();

  for (const sw of s.schedule_workouts) {
    const wid = sw.workout_id as string;
    const sid = sw.schedule_id as string;
    const pos = sw.position as number;
    const wname = workoutNameById.get(wid) ?? "Treino";
    blockIdByWorkoutId.set(wid, wid); // 1 schedule_workout -> 1 block, id = wid

    out.push(
      `insert into public.workout_template_blocks (id, template_id, name, position, is_single_day)`,
      `values (${sqlUuid(wid)}, ${sqlUuid(sid)}, ${sqlString(wname)}, ${sqlInt(pos)}, false)`,
      `on conflict (id) do update set`,
      `  template_id = excluded.template_id,`,
      `  name = excluded.name,`,
      `  position = excluded.position;`,
      "",
    );
  }

  // Orfaos: cria bloco pro single-day template
  for (const w of orphanWorkouts) {
    const wid = w.id as string;
    const wname = w.name as string;
    blockIdByWorkoutId.set(wid, wid);
    out.push(
      `insert into public.workout_template_blocks (id, template_id, name, position, is_single_day)`,
      `values (${sqlUuid(wid)}, ${sqlUuid(wid)}, ${sqlString(wname)}, 1, true)`,
      `on conflict (id) do update set`,
      `  name = excluded.name,`,
      `  is_single_day = true;`,
      "",
    );
  }

  // ------------- workout_template_exercises -------------
  out.push("-- workout_template_exercises ---------------------------------------");
  // Filtra: so insere we cujo workout_id existe em algum bloco
  const validBlockIds = new Set(blockIdByWorkoutId.values());
  const insertedWeIds = new Set<string>();

  for (const we of s.workout_exercises) {
    const id = we.id as string;
    const wid = we.workout_id as string;
    const blockId = blockIdByWorkoutId.get(wid);
    if (!blockId || !validBlockIds.has(blockId)) continue; // sem bloco, ignora

    const exId = (we.exercise_id as string | null | undefined) ?? null;
    const pos = we.position as number;
    const type = we.type as string;
    const isSuperset = type === "superset";

    insertedWeIds.add(id);

    out.push(
      `insert into public.workout_template_exercises (id, block_id, exercise_id, position, num_sets, is_superset_marker)`,
      `values (${sqlUuid(id)}, ${sqlUuid(blockId)}, ${exId ? sqlUuid(exId) : "null"}, ${sqlInt(pos)}, 0, ${sqlBool(isSuperset)})`,
      `on conflict (id) do update set`,
      `  block_id = excluded.block_id,`,
      `  exercise_id = excluded.exercise_id,`,
      `  position = excluded.position,`,
      `  is_superset_marker = excluded.is_superset_marker;`,
      "",
    );
  }

  // ------------- workout_template_exercise_sets -------------
  out.push("-- workout_template_exercise_sets -----------------------------------");
  // Agrupa sets por we_id pra contar num_sets
  const setsByWe = new Map<string, AnyRow[]>();
  for (const set of s.exercise_sets) {
    const weId = set.workout_exercise_id as string;
    if (!insertedWeIds.has(weId)) continue;
    if (!setsByWe.has(weId)) setsByWe.set(weId, []);
    setsByWe.get(weId)!.push(set);
  }

  for (const set of s.exercise_sets) {
    const weId = set.workout_exercise_id as string;
    if (!insertedWeIds.has(weId)) continue;
    const id = set.id as string;
    const setNumber = set.set_number as number;
    const minReps = (set.min_reps as number | null | undefined) ?? null;
    const maxReps = (set.max_reps as number | null | undefined) ?? null;
    const rest = (set.rest_time_s as number | null | undefined) ?? null;
    const warmUp = !!set.warm_up;
    const dropSet = !!set.drop_set;
    const toFailure = !!set.until_failure;

    out.push(
      `insert into public.workout_template_exercise_sets (id, template_exercise_id, set_number, min_reps, max_reps, rest_seconds, warm_up, drop_set, to_failure)`,
      `values (${sqlUuid(id)}, ${sqlUuid(weId)}, ${sqlInt(setNumber)}, ${sqlInt(minReps)}, ${sqlInt(maxReps)}, ${sqlInt(rest)}, ${sqlBool(warmUp)}, ${sqlBool(dropSet)}, ${sqlBool(toFailure)})`,
      `on conflict (id) do nothing;`,
      "",
    );
  }

  // ------------- atualiza num_sets em workout_template_exercises -------------
  out.push("-- backfill num_sets ------------------------------------------------");
  out.push(
    "update public.workout_template_exercises te",
    "set num_sets = sub.cnt",
    "from (",
    "  select template_exercise_id, count(*)::int as cnt",
    "  from public.workout_template_exercise_sets",
    "  group by template_exercise_id",
    ") sub",
    "where te.id = sub.template_exercise_id;",
    "",
  );

  out.push("commit;", "");

  // ------------- escreve -------------
  writeFileSync(OUT_PATH, out.join("\n"), "utf-8");

  // resumo
  console.log("=== Seed gerado ===");
  console.log("exercises:", s.exercises.length);
  console.log("workout_templates (schedules):", s.schedules.length);
  console.log("workout_templates (single-day):", orphanWorkouts.length);
  console.log("workout_template_blocks:", s.schedule_workouts.length + orphanWorkouts.length);
  console.log("workout_template_exercises inseridos:", insertedWeIds.size);
  console.log(
    "workout_template_exercise_sets inseridos:",
    Array.from(setsByWe.values()).reduce((acc, arr) => acc + arr.length, 0),
  );
  console.log("Output:", OUT_PATH);
}

build();
