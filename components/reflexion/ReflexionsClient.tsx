"use client";

import { useMemo, useState, useTransition } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { LockIcon, PlusIcon } from "@/components/nav/icons";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import {
  EMOTION_META,
  JOURNAL_META,
  type Emotion,
  type EmotionKind,
  type JournalEntry,
  type JournalKind,
} from "@/lib/data/types";
import {
  addNoteAction,
  deleteNoteAction,
  setEmotionAction,
} from "@/app/(app)/reflexions/actions";

type FilmLite = { id: string; title: string };

const KINDS: JournalKind[] = ["citation", "scene", "reflexion", "question"];
const EMOTIONS = Object.keys(EMOTION_META) as EmotionKind[];

export function ReflexionsClient({
  moovieId,
  films,
  entries,
  emotions,
  othersCount,
}: {
  moovieId: string;
  films: FilmLite[];
  entries: JournalEntry[];
  emotions: Emotion[];
  othersCount: number;
}) {
  const [filmId, setFilmId] = useState(films[0]?.id ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const [emoOpen, setEmoOpen] = useState(false);
  const [, startTransition] = useTransition();

  const myEmotion = useMemo(
    () => emotions.find((e) => e.filmId === filmId) ?? null,
    [emotions, filmId]
  );
  const filmEntries = useMemo(
    () => entries.filter((e) => e.filmId === filmId),
    [entries, filmId]
  );

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <span className="text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          Votre carnet · privé
        </span>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          Réflexions
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Capturez vos pensées pendant le visionnage. Vos émotions resteront
          scellées jusqu'au soir de la réunion.
        </p>
      </header>

      {/* Sélecteur de film */}
      {films.length > 1 ? (
        <div className="flex gap-2">
          {films.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilmId(f.id)}
              className={cn(
                "truncate rounded-full border px-4 py-2 text-sm transition-colors duration-200",
                f.id === filmId
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-border text-ink-muted hover:text-ink"
              )}
            >
              {f.title}
            </button>
          ))}
        </div>
      ) : null}

      {/* Émotion scellée */}
      <section>
        {myEmotion ? (
          <div
            className="rounded-[var(--radius-card)] border p-5"
            style={{
              borderColor: `${EMOTION_META[myEmotion.kind].color}40`,
              backgroundImage: `linear-gradient(180deg, ${EMOTION_META[myEmotion.kind].color}12, transparent)`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-display text-xl"
                style={{ color: EMOTION_META[myEmotion.kind].color }}
              >
                {EMOTION_META[myEmotion.kind].label}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint">
                <LockIcon className="h-3.5 w-3.5" /> Scellée
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {myEmotion.justification}
            </p>
            <button
              onClick={() => setEmoOpen(true)}
              className="mt-3 text-xs text-ink-faint underline-offset-4 hover:text-ink-muted hover:underline"
            >
              Modifier
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEmoOpen(true)}
            className="flex w-full items-center justify-between rounded-[var(--radius-card)] border border-dashed border-border p-5 text-left transition-colors hover:border-gold/40"
          >
            <span>
              <span className="block font-display text-lg text-ink">
                Quelle émotion ce film a-t-il laissée ?
              </span>
              <span className="mt-1 block text-sm text-ink-muted">
                Associez une émotion — révélée à tous le jour J.
              </span>
            </span>
            <PlusIcon className="h-5 w-5 shrink-0 text-gold" />
          </button>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
          <LockIcon className="h-3.5 w-3.5" />
          {othersCount > 0
            ? `${othersCount} membre${othersCount > 1 ? "s ont" : " a"} déjà partagé. Révélation à la réunion.`
            : "Soyez le premier à sceller une émotion."}
        </p>
      </section>

      {/* Journal */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.22em] text-ink-faint">
            Journal de visionnage
          </span>
          <span className="text-xs text-ink-faint">{filmEntries.length} note(s)</span>
        </div>

        {filmEntries.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-border bg-card p-5 text-sm text-ink-muted">
            Une scène marquante, une citation, une question restée sans réponse…
            Touchez le bouton pour capturer une pensée.
          </p>
        ) : (
          <ul className="space-y-3">
            {filmEntries.map((e, i) => (
              <li
                key={e.id}
                className="animate-fade-up rounded-[var(--radius-card)] border border-border bg-card p-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-gold/80">
                    {JOURNAL_META[e.kind].label}
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    {formatDate(e.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 leading-relaxed text-ink",
                    e.kind === "citation" && "font-display text-lg italic"
                  )}
                >
                  {e.content}
                </p>
                <button
                  onClick={() =>
                    startTransition(() => deleteNoteAction(e.id))
                  }
                  className="mt-2 text-[11px] text-ink-faint underline-offset-4 hover:text-emo-malaise hover:underline"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAB */}
      <button
        onClick={() => setNoteOpen(true)}
        aria-label="Ajouter une note"
        className="fixed bottom-28 right-[max(1rem,calc(50%-240px+1rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-[0_10px_40px_-8px_rgba(200,155,60,0.6)] transition-transform duration-[250ms] [transition-timing-function:var(--ease)] active:scale-90"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Composer de note */}
      <NoteComposer
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSubmit={(kind, content) =>
          startTransition(() => {
            addNoteAction({ moovieId, filmId, kind, content });
            setNoteOpen(false);
          })
        }
      />

      {/* Picker d'émotion */}
      <EmotionPicker
        open={emoOpen}
        initial={myEmotion}
        onClose={() => setEmoOpen(false)}
        onSubmit={(kind, justification) =>
          startTransition(() => {
            setEmotionAction({ moovieId, filmId, kind, justification });
            setEmoOpen(false);
          })
        }
      />
    </div>
  );
}

function NoteComposer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (kind: JournalKind, content: string) => void;
}) {
  const [kind, setKind] = useState<JournalKind>("reflexion");
  const [content, setContent] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title="Capturer une pensée">
      <div className="mb-4 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              k === kind
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-border text-ink-muted"
            )}
          >
            {JOURNAL_META[k].label}
          </button>
        ))}
      </div>
      <Textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez librement…"
      />
      <Button
        size="lg"
        className="mt-4"
        disabled={!content.trim()}
        onClick={() => {
          onSubmit(kind, content.trim());
          setContent("");
        }}
      >
        Ajouter au carnet
      </Button>
    </Sheet>
  );
}

function EmotionPicker({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (kind: EmotionKind, justification: string) => void;
  initial: Emotion | null;
}) {
  const [kind, setKind] = useState<EmotionKind>(initial?.kind ?? "fascination");
  const [text, setText] = useState(initial?.justification ?? "");

  return (
    <Sheet open={open} onClose={onClose} title="Sceller une émotion">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {EMOTIONS.map((e) => {
          const meta = EMOTION_META[e];
          const active = e === kind;
          return (
            <button
              key={e}
              onClick={() => setKind(e)}
              className="rounded-2xl border px-2 py-3 text-sm transition-all duration-200"
              style={{
                borderColor: active ? meta.color : "var(--color-border)",
                backgroundColor: active ? `${meta.color}1a` : "transparent",
                color: active ? meta.color : "var(--color-ink-muted)",
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pourquoi cette émotion ? Mettez des mots dessus, librement…"
      />
      <Button
        size="lg"
        className="mt-4"
        disabled={!text.trim()}
        onClick={() => onSubmit(kind, text.trim())}
      >
        Sceller jusqu'à la réunion
      </Button>
    </Sheet>
  );
}
