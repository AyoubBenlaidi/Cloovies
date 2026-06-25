"use server";

import { revalidatePath } from "next/cache";
import {
  addJournalEntry,
  deleteJournalEntry,
  getCurrentUserId,
  setEmotion,
} from "@/lib/data";
import { evaluateBadges } from "@/lib/badges/evaluator";
import type { EmotionKind, JournalKind } from "@/lib/data/types";

export async function addNoteAction(input: {
  moovieId: string;
  filmId: string;
  kind: JournalKind;
  content: string;
}) {
  const userId = await getCurrentUserId();
  await addJournalEntry({ ...input, userId });
  await evaluateBadges(userId);
  revalidatePath("/reflexions");
}

export async function deleteNoteAction(id: string) {
  await deleteJournalEntry(id);
  revalidatePath("/reflexions");
}

export async function setEmotionAction(input: {
  moovieId: string;
  filmId: string;
  kind: EmotionKind;
  justification: string;
}) {
  const userId = await getCurrentUserId();
  await setEmotion({ ...input, userId });
  await evaluateBadges(userId);
  revalidatePath("/reflexions");
  revalidatePath("/reunion");
}
