import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-32 text-center">
      <h1 className="font-display text-6xl font-semibold">404</h1>
      <p className="text-muted-2">Esta página no existe. Como un bullet sin origen, aquí no entra.</p>
      <Button href="/" variant="ghost">
        Volver al inicio
      </Button>
    </div>
  );
}
