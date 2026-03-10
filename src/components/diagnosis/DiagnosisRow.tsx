import { memo, useMemo } from "react";
import { th } from "date-fns/locale";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


interface Props {
  diagnosis: any;
  onViewImages: (id: string) => void;
  onDelete: (id: string) => void;
}


export const DiagnosisRow = memo(({ diagnosis, onViewImages, onDelete }: Props) => {
  const formattedDate = useMemo(
    () =>
      format(new Date(diagnosis.diagnosis_date), "d MMM yyyy", {
        locale: th,
      }),
    [diagnosis.diagnosis_date]
  );

  return (
    <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="font-mono">{diagnosis.icd10_code}</Badge>

          <Badge
            variant={
              diagnosis.diagnosis_type === "primary"
                ? "default"
                : "secondary"
            }
          >
            {diagnosis.diagnosis_type === "primary" ? "หลัก" : "รอง"}
          </Badge>

          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        {diagnosis.description && (
          <p className="text-sm">{diagnosis.description}</p>
        )}

        {diagnosis.notes && (
          <p className="text-sm text-muted-foreground">
            {diagnosis.notes}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {diagnosis.has_images && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewImages(diagnosis.id)}
          >
            ดูรูปภาพ
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(diagnosis.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});