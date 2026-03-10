import { memo, useMemo } from "react";
import { th } from "date-fns/locale";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
    proc: any;
    onViewImages: (id: string) => void;
    onDelete: (id: string) => void;
}   

export const ProcedureRow = ({ proc, onViewImages, onDelete }: Props) => {

    const formattedDate = useMemo(
        () =>
        format(new Date(proc.procedure_date), "d MMM yyyy", {
            locale: th,
        }),
        [proc.procedure_date]
    );

    return (
        <div
            key={proc.id}
            className="p-3 rounded-lg border bg-card flex items-center justify-between"
        >
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                <span className="font-medium">
                    {proc.procedure_name}
                </span>
                <Badge
                    variant={
                    proc.status === "completed"
                        ? "default"
                        : proc.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                >
                    {proc.status === "completed"
                    ? "เสร็จสิ้น"
                    : proc.status === "cancelled"
                        ? "ยกเลิก"
                        : "รอดำเนินการ"}
                </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {proc.procedure_date && (
                    <span>
                        {formattedDate}
                    </span>
                )}
                {proc.body_part && (
                    <span>บริเวณ: {proc.body_part}</span>
                )}
                </div>
                {proc.notes && (
                <p className="text-sm text-muted-foreground">
                    หมายเหตุ: {proc.notes}
                </p>
                )}
            </div>
            <div className="flex gap-2">
                {proc.has_images && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewImages(proc.id)}
                    >
                        ดูรูปภาพ
                    </Button>
                    )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(proc.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};