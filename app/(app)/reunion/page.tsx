import Link from "next/link";
import { SlotList } from "@/components/reunion/SlotList";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { MeetingIcon } from "@/components/nav/icons";
import {
  CURRENT_USER_ID,
  getActiveCommunity,
  getCurrentMoovie,
  getMyRole,
  getSlots,
} from "@/lib/data";
import { formatMeeting } from "@/lib/utils/format";
import { addSlotAction } from "./actions";

export default async function ReunionPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return <div className="mt-24 text-center text-ink-muted">Aucun cycle en cours.</div>;
  }

  const [slots, role] = await Promise.all([
    getSlots(moovie.id, CURRENT_USER_ID, community.id),
    getMyRole(community.id, CURRENT_USER_ID),
  ]);
  const isAdmin = role === "admin";

  return (
    <div className="space-y-7">
      <header className="animate-fade-up">
        <Eyebrow>Le rendez-vous · Moovie #{moovie.number}</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          La réunion
        </h1>
        {moovie.meetingDate ? (
          <p className="mt-2 text-sm text-ink-muted">
            Officialisée pour le{" "}
            <span className="text-gold">{formatMeeting(moovie.meetingDate)}</span>.
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
            La date n'est pas encore fixée. Indiquez vos disponibilités.
          </p>
        )}
      </header>

      {/* Entrée mode réunion */}
      <Link
        href="/reunion/live"
        className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-5 transition-colors hover:border-gold/50"
      >
        <div>
          <span className="font-display text-xl tracking-tight text-ink">
            Entrer en mode réunion
          </span>
          <p className="mt-1 text-sm text-ink-muted">
            Révélez les émotions, les notes et lancez le débat.
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-black transition-transform group-hover:scale-105">
          <MeetingIcon className="h-6 w-6" />
        </span>
      </Link>

      {/* Organisation des créneaux */}
      <section>
        <Eyebrow>Disponibilités · {slots.length} créneaux</Eyebrow>
        <div className="mt-3">
          <SlotList slots={slots} moovieId={moovie.id} isAdmin={isAdmin} />
        </div>
      </section>

      {/* Admin : proposer un créneau */}
      {isAdmin ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-border p-5">
          <Eyebrow>Proposer un créneau (US24)</Eyebrow>
          <form action={addSlotAction} className="mt-3 space-y-3">
            <input type="hidden" name="moovieId" value={moovie.id} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" name="date" required />
              </Field>
              <Field label="Heure">
                <Input type="time" name="startTime" defaultValue="20:30" required />
              </Field>
            </div>
            <Field label="Durée (min)">
              <Input type="number" name="durationMin" defaultValue={150} min={30} step={15} />
            </Field>
            <Button type="submit" variant="outline" size="md">
              Ajouter le créneau
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
