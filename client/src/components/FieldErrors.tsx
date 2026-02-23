import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function FieldErrors({ fieldErrors }: { fieldErrors: Record<string, string[]> }) {
  const entries = Object.entries(fieldErrors).filter(([, msgs]) => msgs?.length);
  if (entries.length === 0) return null;

  return (
    <Alert className="rounded-2xl">
      <AlertTitle>Fix the following</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="space-y-1">
          {entries.map(([field, msgs]) => (
            <li key={field} className="text-sm">
              <span className="font-medium">{field}:</span> {msgs.join(", ")}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}