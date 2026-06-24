"use server";

import { revalidatePath } from "next/cache";
import {
  CURRENT_USER_ID,
  addJournalEntry,
  deleteJournalEntry,
  setEmotion,
} from "@/lib/data";
import type { EmotionKind, JournalKind } from "@/lib/data/types";

export async function addNoteAction(input: {
  moovieId: string;
  filmId: string;
  kind: JournalKind;
  content: string;
}) {
  await addJournalEntry({ ...input, userId: CURRENT_USER_ID });
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
  await setEmotion({ ...input, userId: CURRENT_USER_ID });
  revalidatePath("/reflexions");
  revalidatePath("/reunion");
}
