import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RiskWarning() {
  return (
    <Alert className="border-apex-amber/50 bg-apex-amber/5">
      <AlertTriangle className="h-4 w-4 text-apex-amber" />
      <AlertDescription className="text-sm text-apex-amber">
        <strong>Risk Warning:</strong> This is not financial advice. Crypto investments carry
        significant risk. Never invest more than you can afford to lose. Always do your own
        research (DYOR) before making any investment decisions. Past performance does not guarantee
        future results.
      </AlertDescription>
    </Alert>
  );
}
