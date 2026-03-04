import { TabsContent } from "./ui/tabs"
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

import {
  usePatientDiagnoses,
  useCreatePatientDiagnosis,
  useDeletePatientDiagnosis,
} from "@/hooks/usePatientDiagnoses";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


interface Props {
  patientId: string;
}

const getDefaultDiagnosis = () => ({
    diagnosis_date: format(new Date(), "yyyy-MM-dd"),
    icd10_code: "",
    description: "",
    diagnosis_type: "primary",
    notes: "",
  });



export const DiagnosisSection = ({ patientId }: Props) => {
    const { user } = useAuth();

    const { data: patientDiagnoses = [], isLoading: diagnosesLoading } =
        usePatientDiagnoses(patientId);
      const createDiagnosis = useCreatePatientDiagnosis();
      const deleteDiagnosis = useDeletePatientDiagnosis();

    const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
    const [newDiagnosis, setNewDiagnosis] = useState(getDefaultDiagnosis());
    
    const handleAddDiagnosis = async () => {
        if (!patientId || !newDiagnosis.icd10_code.trim()) return;

        await createDiagnosis.mutateAsync({
        patient_id: patientId,
        diagnosis_date: newDiagnosis.diagnosis_date,
        icd10_code: newDiagnosis.icd10_code.trim(),
        description: newDiagnosis.description.trim() || undefined,
        diagnosis_type: newDiagnosis.diagnosis_type,
        notes: newDiagnosis.notes.trim() || undefined,
        created_by: user?.id,
        });

        // Reset form and close dialog
        setNewDiagnosis(getDefaultDiagnosis());
        setDiagnosisDialogOpen(false);
    };

    const handleDeleteDiagnosis = async (diagnosisId: string) => {
        if (!patientId) return;
        await deleteDiagnosis.mutateAsync({ id: diagnosisId, patientId });
    };

    return (
    <>
        <TabsContent value="diagnoses">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                    ประวัติการวินิจฉัย ({patientDiagnoses.length} รายการ)
                    </CardTitle>
                    <Button
                    onClick={() => setDiagnosisDialogOpen(true)}
                    size="sm"
                    className="gap-1"
                    >
                    <Plus className="h-4 w-4" />
                    เพิ่มการวินิจฉัย
                    </Button>
                </CardHeader>
                <CardContent>
                    {diagnosesLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    ) : patientDiagnoses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        ยังไม่มีประวัติการวินิจฉัย
                    </p>
                    ) : (
                    <div className="space-y-3">
                        {patientDiagnoses.map((diagnosis) => (
                        <div
                            key={diagnosis.id}
                            className="p-4 rounded-lg border bg-card flex items-center justify-between"
                        >
                            {/* LEFT CONTENT */}
                            <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="font-mono">
                                {diagnosis.icd10_code}
                                </Badge>

                                <Badge
                                variant={
                                    diagnosis.diagnosis_type === "primary"
                                    ? "default"
                                    : "secondary"
                                }
                                >
                                {diagnosis.diagnosis_type === "primary"
                                    ? "หลัก"
                                    : "รอง"}
                                </Badge>

                                <span className="text-xs text-muted-foreground">
                                {format(
                                    new Date(diagnosis.diagnosis_date),
                                    "d MMM yyyy",
                                    { locale: th },
                                )}
                                </span>
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

                            {/* RIGHT BUTTON */}
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteDiagnosis(diagnosis.id)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    )}
                </CardContent>
                </Card>
            </TabsContent>

            <Dialog
                open={diagnosisDialogOpen}
                onOpenChange={setDiagnosisDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>เพิ่มการวินิจฉัยใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                    <Label htmlFor="diagnosis_date">วันที่วินิจฉัย</Label>
                    <Input
                        id="diagnosis_date"
                        type="date"
                        value={newDiagnosis.diagnosis_date}
                        onChange={(e) =>
                        setNewDiagnosis((prev) => ({
                            ...prev,
                            diagnosis_date: e.target.value,
                        }))
                        }
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="icd10_code">รหัส ICD-10 *</Label>
                    <Input
                        id="icd10_code"
                        placeholder="เช่น J06.9"
                        value={newDiagnosis.icd10_code}
                        onChange={(e) =>
                        setNewDiagnosis((prev) => ({
                            ...prev,
                            icd10_code: e.target.value,
                        }))
                        }
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="description">คำอธิบาย</Label>
                    <Input
                        id="description"
                        placeholder="เช่น Upper respiratory infection"
                        value={newDiagnosis.description}
                        onChange={(e) =>
                        setNewDiagnosis((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                        }
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="diagnosis_type">ประเภท</Label>
                    <Select
                        value={newDiagnosis.diagnosis_type}
                        onValueChange={(value) =>
                        setNewDiagnosis((prev) => ({
                            ...prev,
                            diagnosis_type: value,
                        }))
                        }
                    >
                        <SelectTrigger>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="primary">หลัก (Primary)</SelectItem>
                        <SelectItem value="secondary">รอง (Secondary)</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                        id="notes"
                        placeholder="หมายเหตุเพิ่มเติม..."
                        value={newDiagnosis.notes}
                        onChange={(e) =>
                        setNewDiagnosis((prev) => ({
                            ...prev,
                            notes: e.target.value,
                        }))
                        }
                        rows={3}
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={() => setDiagnosisDialogOpen(false)}
                    >
                    ยกเลิก
                    </Button>
                    <Button
                    onClick={handleAddDiagnosis}
                    disabled={
                        !newDiagnosis.icd10_code.trim() || createDiagnosis.isPending
                    }
                    >
                    {createDiagnosis.isPending ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
    </>
    );
    
}