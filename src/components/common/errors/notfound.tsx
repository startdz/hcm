
import { Button } from "@/components/ui/button";
import { RiArrowLeftLine, RiQuestionLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";


export function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <RiQuestionLine className="size-8" strokeWidth={1.5} />
        </div>

        <p className="mb-2 font-heading text-sm font-semibold tracking-widest text-primary">
          ERROR 404
        </p>

        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Halaman tidak ditemukan
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Maaf, halaman yang kamu cari tidak tersedia atau mungkin sudah
          dipindahkan.
        </p>

        <Button nativeButton={false} render={
             <Link to="/">
            <RiArrowLeftLine />
            Kembali ke beranda
          </Link>
        } className="mt-8"/>
         
        
      </div>
    </main>
  );
}
