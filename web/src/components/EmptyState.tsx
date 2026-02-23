import { Button } from "../components/ui/button";

export default function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto max-w-md space-y-2">
        <div className="text-base font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        {actionLabel && onAction ? (
          <div className="pt-2">
            <Button className="rounded-2xl" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}