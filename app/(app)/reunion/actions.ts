"use server";

import { revalidatePath } from "next/cache";
import { addSlot, getCurrentUserId, validateSlot, voteSlot } from "@/lib/data";
import { assertAdmin } from "@/lib/community/guards";
import type { Availability } from "@/lib/data/types";

export async function voteSlotAction(slotId: string, availability: Availability) {
  // Tout membre peut indiquer ses disponibilités.
  await voteSlot(slotId, await getCurrentUserId(), availability);
  revalidatePath("/reunion");
}

export async function validateSlotAction(slotId: string, moovieId: string) {
  await assertAdmin();
  await validateSlot(slotId, moovieId);
  revalidatePath("/reunion");
  revalidatePath("/accueil");
}

export async function addSlotAction(formData: FormData) {
  await assertAdmin();
  const moovieId = String(formData.get("moovieId"));
  const date = String(formData.get("date"));
  const startTime = String(formData.get("startTime"));
  const durationMin = Number(formData.get("durationMin") || 120);
  if (date && startTime) {
    await addSlot({ moovieId, date, startTime, durationMin });
  }
  revalidatePath("/reunion");
}
