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
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import {
  useCreatePrescription,
  useDeletePrescription,
  usePrescriptions,
} from "@/hooks/usePrescriptions";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMedicines } from "@/hooks/useMedicines";

interface Props {
  patientId: string;
}

export interface Prescription {
  id: string;
  patient_id: string | null;
  prescription_date: string | null;
  visit_id: string | null;
  medicine_id: string;
  quantity: number;
  usage_instruction: string | null;
  created_at: string;
  medicine?: {
    id: string;
    name_thai: string;
    name_english: string | null;
    unit: string | null;
  };
}

const getDefaultPrescription = () => ({
    prescription_date: format(new Date(), "yyyy-MM-dd"),
    medicine_id: "",
    quantity: 1,
    usage_instruction: "",
  });



export const PrescriptionSection = ({ patientId }: Props) => {

    const { data: medicines = [] } = useMedicines();
    
    const createPrescription = useCreatePrescription();
    const deletePrescription = useDeletePrescription();

        
    const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
    const [newPrescription, setNewPrescription] = useState(getDefaultPrescription);

    const { data: patientPrescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(patientId);

    const handleAddPrescription = async () => {
    if (
        !patientId ||
        !newPrescription.medicine_id ||
        newPrescription.quantity < 1
    )
        return;

    await createPrescription.mutateAsync({
        patient_id: patientId,
        prescription_date: newPrescription.prescription_date,
        medicine_id: newPrescription.medicine_id,
        quantity: newPrescription.quantity,
        usage_instruction: newPrescription.usage_instruction.trim() || undefined,
    });

    setNewPrescription(getDefaultPrescription());
    setPrescriptionDialogOpen(false);
    };

    const handleDeletePrescription = async (prescriptionId: string) => {
    if (!patientId) return;
    await deletePrescription.mutateAsync({ id: prescriptionId, patientId });
    };

    return (
        <>
            <TabsContent value="medications">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">
                            ประวัติการรับยา ({patientPrescriptions.length} รายการ)
                        </CardTitle>
                        <Button
                            onClick={() => setPrescriptionDialogOpen(true)}
                            size="sm"
                            className="gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            เพิ่มคำสั่งยา
                        </Button>
                        </CardHeader>
                        <CardContent>
                        {prescriptionsLoading ? (
                            <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            </div>
                        ) : patientPrescriptions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                            ยังไม่มีประวัติการรับยา
                            </p>
                        ) : (
                            <div className="space-y-3">
                            {patientPrescriptions.map((p) => (
                                <div
                                key={p.id}
                                className="p-3 rounded-lg border bg-card flex items-center justify-between"
                                >
                                <div>
                                    <span className="font-medium">
                                    {p.medicine?.name_thai || "ไม่ระบุ"}
                                    </span>
                                    {p.medicine?.name_english && (
                                    <span className="text-muted-foreground text-sm ml-2">
                                        ({p.medicine.name_english})
                                    </span>
                                    )}
                                    {p.prescription_date && (
                                    <span className="text-muted-foreground text-xs ml-2">
                                        {format(
                                        new Date(p.prescription_date),
                                        "d MMM yyyy",
                                        { locale: th },
                                        )}
                                    </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                    {p.quantity}{" "}
                                    {p.usage_instruction && `- ${p.usage_instruction}`}
                                    </span>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeletePrescription(p.id)}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <Dialog
                    open={prescriptionDialogOpen}
                    onOpenChange={setPrescriptionDialogOpen}
                    >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>เพิ่มคำสั่งยา</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rx_date">วันที่ *</Label>
                            <Input
                            id="rx_date"
                            type="date"
                            value={newPrescription.prescription_date}
                            onChange={(e) =>
                                setNewPrescription((prev) => ({
                                ...prev,
                                prescription_date: e.target.value,
                                }))
                            }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เลือกยา *</Label>
                            <Select
                            value={newPrescription.medicine_id}
                            onValueChange={(value) =>
                                setNewPrescription((prev) => ({
                                ...prev,
                                medicine_id: value,
                                }))
                            }
                            >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกยา" />
                            </SelectTrigger>
                            <SelectContent>
                                {medicines.map((med) => (
                                <SelectItem key={med.id} value={med.id}>
                                    {med.name_thai}
                                    {med.name_english ? ` (${med.name_english})` : ""} -
                                    คงเหลือ {med.stock_qty} {med.unit || ""}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rx_quantity">จำนวน *</Label>
                            <Input
                            id="rx_quantity"
                            type="number"
                            min={1}
                            value={newPrescription.quantity}
                            onChange={(e) =>
                                setNewPrescription((prev) => ({
                                ...prev,
                                quantity: parseInt(e.target.value) || 1,
                                }))
                            }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rx_usage">วิธีใช้ยา</Label>
                            <Textarea
                            id="rx_usage"
                            placeholder="เช่น รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร"
                            value={newPrescription.usage_instruction}
                            onChange={(e) =>
                                setNewPrescription((prev) => ({
                                ...prev,
                                usage_instruction: e.target.value,
                                }))
                            }
                            rows={2}
                            />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPrescriptionDialogOpen(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleAddPrescription}
                            disabled={
                            !newPrescription.prescription_date ||
                            !newPrescription.medicine_id ||
                            newPrescription.quantity < 1 ||
                            createPrescription.isPending
                            }
                        >
                            {createPrescription.isPending ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </>
     )
}
