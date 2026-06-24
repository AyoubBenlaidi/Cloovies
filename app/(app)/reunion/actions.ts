"use server";

import { revalidatePath } from "next/cache";
import { CURRENT_USER_ID, addSlot, validateSlot, voteSlot } from "@/lib/data";
import type { Availability } from "@/lib/data/types";

export async function voteSlotAction(slotId: string, availability: Availability) {
  await voteSlot(slotId, CURRENT_USER_ID, availability);
  revalidatePath("/reunion");
}

export async function validateSlotAction(slotId: string, moovieId: string) {
  await validateSlot(slotId, moovieId);
  revalidatePath("/reunion");
  revalidatePath("/accueil");
}

export async function addSlotAction(formData: FormData) {
  const moovieId = String(formData.get("moovieId"));
  const date = String(formData.get("date"));
  const startTime = String(formData.get("startTime"));
  const durationMin = Number(formData.get("durationMin") || 120);
  if (date && startTime) {
    await addSlot({ moovieId, date, startTime, durationMin });
  }
  revalidatePath("/reunion");
}
