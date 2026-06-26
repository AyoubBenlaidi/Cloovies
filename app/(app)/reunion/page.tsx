import Link from "next/link";
import { CalendarPlus, Sparkles, Users } from "lucide-react";
import { SlotList } from "@/components/reunion/SlotList";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getMyRole,
  getSlots,
} from "@/lib/data";
import { formatMeeting } from "@/lib/utils/format";
import { addSlotAction } from "./actions";

export default async function ReunionPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return (
      <EmptyState
        icon={Users}
        color="green"
        title="Pas encore de rendez-vous"
        description="La réunion du cercle s'organisera ici dès qu'un Moovie sera lancé."
      />
    );
  }

  const userId = await getCurrentUserId();
  const [slots, role] = await Promise.all([
    getSlots(moovie.id, userId, community.id),
    getMyRole(community.id, userId),
  ]);
  const isAdmin = role === "admin";

  return (
    <div className="space-y-7">
      <header className="animate-fade-up pt-2">
        <Eyebrow tone="accent">Le rendez-vous · Moovie #{moovie.number}</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink">La réunion</h1>
        {moovie.meetingDate ? (
          <p className="mt-2.5 text-[15px] text-ink-muted">
            Officialisée pour le{" "}
            <span className="font-semibold text-accent">
              {formatMeeting(moovie.meetingDate)}
            </span>
            .
          </p>
        ) : (
          <p className="mt-2.5 text-[15px] text-ink-muted">
            La date n'est pas encore fixée. Indiquez vos disponibilités.
          </p>
        )}
      </header>

      {/* Entrée mode réunion */}
      <Link
        href="/reunion/live"
        className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-accent/30 bg-gradient-to-br from-accent/12 via-accent/5 to-transparent p-5 shadow-[var(--shadow-md)] transition-all hover:border-accent/50 active:scale-[0.99]"
      >
        <div>
          <span className="font-heading text-xl text-ink">
            Entrer en mode réunion
          </span>
          <p className="mt-1.5 text-sm text-ink-muted">
            Révélez les émotions, les notes et lancez le débat.
          </p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow-pop)] transition-transform group-hover:scale-105">
          <Sparkles className="h-6 w-6" strokeWidth={2} />
        </span>
      </Link>

      {/* Organisation des créneaux */}
      <section>
        <Eyebrow>
          Disponibilités · {slots.length} créneau{slots.length > 1 ? "x" : ""}
        </Eyebrow>
        <div className="mt-3">
          <SlotList slots={slots} moovieId={moovie.id} isAdmin={isAdmin} />
        </div>
      </section>

      {/* Admin : proposer un créneau */}
      {isAdmin ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-border-strong p-5">
          <Eyebrow className="flex items-center gap-1.5">
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Proposer un créneau
          </Eyebrow>
          <form action={addSlotAction} className="mt-3 space-y-3">
            <input type="hidden" name="moovieId" value={moovie.id} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" name="date" required />
              </Field>
              <Field label="Heure">
                <Input
                  type="time"
                  name="startTime"
                  defaultValue="20:30"
                  required
                />
              </Field>
            </div>
            <Field label="Durée (min)">
              <Input
                type="number"
                name="durationMin"
                defaultValue={150}
                min={30}
                step={15}
              />
            </Field>
            <SubmitButton variant="secondary" size="md" pendingText="Ajout…">
              Ajouter le créneau
            </SubmitButton>
          </form>
        </section>
      ) : null}
    </div>
  );
}
