
import { Button } from "@/components/ui/button";
import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

interface ErrorComponentProps {
  error: unknown;
  reset: () => void;
}

export function ErrorGlobalComponent({error, reset}: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <RiAlertLine className="size-8" strokeWidth={1.5} />
        </div>

        <p className="mb-2 font-heading text-sm font-semibold tracking-widest text-destructive">
          SOMETHING WENT WRONG
        </p>

        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Terjadi kesalahan
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Maaf, terjadi kesalahan saat memproses permintaanmu. Silakan coba
          beberapa saat lagi.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-6 max-h-32 w-full overflow-auto rounded-lg border bg-muted p-3 text-left text-xs text-muted-foreground">
            {
              error instanceof Error ? `${error?.stack}, ${error?.message}` : String(error)
            }
          </pre>
        )}

        <Button onClick={reset} className="mt-8">
          <RiRefreshLine />
          Coba lagi
        </Button>
      </div>
    </main>
  );
}
