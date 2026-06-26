"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clapperboard,
  HelpCircle,
  Lock,
  NotebookPen,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { EASE } from "@/components/motion";
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

const KIND_ICON: Record<JournalKind, typeof Quote> = {
  citation: Quote,
  scene: Clapperboard,
  reflexion: NotebookPen,
  question: HelpCircle,
};

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
      <header className="animate-fade-up pt-2">
        <Eyebrow tone="accent">Votre carnet · privé</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink">Réflexions</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
          Capturez vos pensées pendant le visionnage. Vos émotions resteront
          scellées jusqu'au soir de la réunion.
        </p>
      </header>

      {/* Sélecteur de film */}
      {films.length > 1 ? (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {films.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilmId(f.id)}
              className={cn(
                "shrink-0 truncate rounded-pill border px-4 py-2 text-sm font-semibold transition-colors duration-200",
                f.id === filmId
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-border bg-elevated text-ink-muted hover:text-ink"
              )}
            >
              {f.title}
            </button>
          ))}
        </div>
      ) : null}

      {/* Émotion scellée */}
      <section>
        <AnimatePresence mode="wait">
          {myEmotion ? (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative overflow-hidden rounded-[var(--radius-card)] border p-5"
              style={{
                borderColor: `${EMOTION_META[myEmotion.kind].color}40`,
                backgroundImage: `linear-gradient(160deg, ${EMOTION_META[myEmotion.kind].color}14, transparent 70%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-display text-2xl"
                  style={{ color: EMOTION_META[myEmotion.kind].color }}
                >
                  {EMOTION_META[myEmotion.kind].label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-ink-faint">
                  <Lock className="h-3 w-3" strokeWidth={2.5} /> Scellée
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                {myEmotion.justification}
              </p>
              <button
                onClick={() => setEmoOpen(true)}
                className="mt-3 text-xs font-semibold text-ink-faint underline-offset-4 hover:text-ink-muted hover:underline"
              >
                Modifier
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setEmoOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong p-5 text-left transition-colors hover:border-accent/50"
            >
              <span>
                <span className="block font-subheading text-lg text-ink">
                  Quelle émotion ce film a-t-il laissée ?
                </span>
                <span className="mt-1 block text-sm text-ink-muted">
                  Associez une émotion — révélée à tous le jour J.
                </span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
          {othersCount > 0
            ? `${othersCount} membre${othersCount > 1 ? "s ont" : " a"} déjà partagé. Révélation à la réunion.`
            : "Soyez le premier à sceller une émotion."}
        </p>
      </section>

      {/* Journal */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Eyebrow>Journal de visionnage</Eyebrow>
          <span className="text-xs font-medium text-ink-faint">
            {filmEntries.length} note{filmEntries.length > 1 ? "s" : ""}
          </span>
        </div>

        {filmEntries.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            color="pink"
            title="Le carnet est vierge"
            description="Une scène marquante, une citation, une question restée sans réponse… Touchez + pour capturer une pensée."
          />
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {filmEntries.map((e) => {
                const Icon = KIND_ICON[e.kind];
                return (
                  <motion.li
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-sm)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent/90">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {JOURNAL_META[e.kind].label}
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        {formatDate(e.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2 leading-relaxed text-ink",
                        e.kind === "citation" &&
                          "font-display text-lg italic leading-snug"
                      )}
                    >
                      {e.content}
                    </p>
                    <button
                      onClick={() =>
                        startTransition(() => {
                          deleteNoteAction(e.id);
                          toast("Note supprimée", { variant: "info" });
                        })
                      }
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint underline-offset-4 hover:text-red"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={2.5} /> Supprimer
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setNoteOpen(true)}
        aria-label="Ajouter une note"
        className="fixed bottom-28 right-[max(1rem,calc(50%-240px+1rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow-pop)]"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </motion.button>

      <NoteComposer
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSubmit={(kind, content) =>
          startTransition(() => {
            addNoteAction({ moovieId, filmId, kind, content });
            setNoteOpen(false);
            toast("Pensée ajoutée au carnet", { variant: "success" });
          })
        }
      />

      <EmotionPicker
        open={emoOpen}
        initial={myEmotion}
        onClose={() => setEmoOpen(false)}
        onSubmit={(kind, justification) =>
          startTransition(() => {
            setEmotionAction({ moovieId, filmId, kind, justification });
            setEmoOpen(false);
            toast("Émotion scellée jusqu'à la réunion", { variant: "success" });
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
        {KINDS.map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                k === kind
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-border bg-elevated text-ink-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              {JOURNAL_META[k].label}
            </button>
          );
        })}
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
              className="rounded-[var(--radius-sm)] border px-2 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                borderColor: active ? meta.color : "var(--color-border)",
                backgroundColor: active ? `${meta.color}1f` : "transparent",
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
        <Lock className="h-[18px] w-[18px]" strokeWidth={2.5} />
        Sceller jusqu'à la réunion
      </Button>
    </Sheet>
  );
}
