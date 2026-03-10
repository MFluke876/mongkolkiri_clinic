import { memo, useMemo } from "react";
import { th } from "date-fns/locale";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


interface Props {
    consultation: any;
    onViewImages: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ConsultationRow = memo(({ consultation, onViewImages, onDelete }: Props) => {
    const formattedDate = useMemo(
        () =>
        format(new Date(consultation.consultation_date), "d MMM yyyy", {
            locale: th,
        }),
        [consultation.consultation_date]
    );

    return (
        <div
            key={consultation.id}
            className="p-4 rounded-lg border bg-card flex items-center justify-between"
        >
            {/* LEFT CONTENT */}
            <div className="space-y-2">
                <Badge variant="outline">
                    {formattedDate}
                </Badge>

                <div>
                <span className="text-sm font-medium text-muted-foreground">
                    อาการหลัก:
                </span>{" "}
                <span className="text-sm">
                    {consultation.chief_complaint}
                </span>
                </div>

                {consultation.vital_signs &&
                Object.keys(consultation.vital_signs).length >
                    0 && (
                    <div className="flex flex-wrap gap-2">
                    {consultation.vital_signs.blood_pressure && (
                        <Badge
                        variant="secondary"
                        className="text-xs"
                        >
                        BP:{" "}
                        {String(
                            consultation.vital_signs.blood_pressure,
                        )}
                        </Badge>
                    )}
                    {consultation.vital_signs.heart_rate && (
                        <Badge
                        variant="secondary"
                        className="text-xs"
                        >
                        HR:{" "}
                        {String(
                            consultation.vital_signs.heart_rate,
                        )}
                        </Badge>
                    )}
                    {consultation.vital_signs.temperature && (
                        <Badge
                        variant="secondary"
                        className="text-xs"
                        >
                        Temp:{" "}
                        {String(
                            consultation.vital_signs.temperature,
                        )}
                        °C
                        </Badge>
                    )}
                    {consultation.vital_signs.respiratory_rate && (
                        <Badge
                        variant="secondary"
                        className="text-xs"
                        >
                        RR:{" "}
                        {String(
                            consultation.vital_signs.respiratory_rate,
                        )}
                        </Badge>
                    )}
                    {consultation.vital_signs.weight && (
                        <Badge
                        variant="secondary"
                        className="text-xs"
                        >
                        น้ำหนัก:{" "}
                        {String(consultation.vital_signs.weight)} kg
                        </Badge>
                    )}
                    </div>
                )}

                {consultation.physical_exam_note && (
                <div>
                    <span className="text-sm font-medium text-muted-foreground">
                    ตรวจร่างกาย:
                    </span>{" "}
                    <span className="text-sm">
                    {consultation.physical_exam_note}
                    </span>
                </div>
                )}

                {consultation.notes && (
                <div>
                    <span className="text-sm font-medium text-muted-foreground">
                    หมายเหตุ:
                    </span>{" "}
                    <span className="text-sm text-muted-foreground">
                    {consultation.notes}
                    </span>
                </div>
                )}
            </div>

            {/* RIGHT BUTTON */}
            

            <div className="flex gap-2">
                {consultation.has_images && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewImages(consultation.id)}
                >
                    ดูรูปภาพ
                </Button>
                )}


                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() =>
                    onDelete(consultation.id)
                    }
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
          
    );
});