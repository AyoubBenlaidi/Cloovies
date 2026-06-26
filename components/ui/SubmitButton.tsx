"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

type Props = React.ComponentProps<typeof Button> & {
  pendingText?: string;
};

/** Bouton de soumission qui passe en chargement avec le form parent. */
export function SubmitButton({ children, pendingText, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Spinner />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
