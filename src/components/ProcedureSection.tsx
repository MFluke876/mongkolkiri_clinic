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
  useProcedureOrders,
  useCreateProcedureOrder,
  useDeleteProcedureOrder,
} from "@/hooks/useProcedureOrders";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


interface Props {
  patientId: string;
}


const getDefaultProcedure = () => ({
    procedure_date: format(new Date(), "yyyy-MM-dd"),
    procedure_name: "",
    body_part: "",
    notes: "",
    status: "completed",
  });

export const ProcedureSection = ({ patientId }: Props) => {
    const { user } = useAuth();

    const [procedureDialogOpen, setProcedureDialogOpen] = useState(false);
    const [newProcedure, setNewProcedure] = useState(getDefaultProcedure);

    const { data: procedureOrders = [], isLoading: proceduresLoading } = useProcedureOrders(patientId);
    const createProcedure = useCreateProcedureOrder();
    const deleteProcedure = useDeleteProcedureOrder();

    const handleAddProcedure = async () => {
        if (!patientId || !newProcedure.procedure_name.trim()) return;

        await createProcedure.mutateAsync({
        patient_id: patientId,
        procedure_date: newProcedure.procedure_date,
        procedure_name: newProcedure.procedure_name.trim(),
        body_part: newProcedure.body_part.trim() || undefined,
        notes: newProcedure.notes.trim() || undefined,
        status: newProcedure.status,
        });

        setNewProcedure(getDefaultProcedure());
        setProcedureDialogOpen(false);
    };

    const handleDeleteProcedure = async (procedureId: string) => {
        if (!patientId) return;
        await deleteProcedure.mutateAsync({ id: procedureId, patientId });
    };

    return (
        <>
            <TabsContent value="procedures">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                        บันทึกหัตถการ ({procedureOrders.length} รายการ)
                    </CardTitle>
                    <Button
                        onClick={() => setProcedureDialogOpen(true)}
                        size="sm"
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        เพิ่มหัตถการ
                    </Button>
                    </CardHeader>
                    <CardContent>
                    {proceduresLoading ? (
                        <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        </div>
                    ) : procedureOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                        ยังไม่มีบันทึกหัตถการ
                        </p>
                    ) : (
                        <div className="space-y-3">
                        {procedureOrders.map((proc) => (
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
                                    {format(
                                        new Date(proc.procedure_date),
                                        "d MMM yyyy",
                                        { locale: th },
                                    )}
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProcedure(proc.id)}
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
                    open={procedureDialogOpen}
                    onOpenChange={setProcedureDialogOpen}
                >
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>เพิ่มบันทึกหัตถการ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                        <Label htmlFor="procedure_date">วันที่ทำหัตถการ</Label>
                        <Input
                            id="procedure_date"
                            type="date"
                            value={newProcedure.procedure_date}
                            onChange={(e) =>
                            setNewProcedure((prev) => ({
                                ...prev,
                                procedure_date: e.target.value,
                            }))
                            }
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="procedure_name">ชื่อหัตถการ *</Label>
                        <Input
                            id="procedure_name"
                            placeholder="เช่น เย็บแผล, ล้างแผล, ตัดไหม"
                            value={newProcedure.procedure_name}
                            onChange={(e) =>
                            setNewProcedure((prev) => ({
                                ...prev,
                                procedure_name: e.target.value,
                            }))
                            }
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="body_part">บริเวณที่ทำ</Label>
                        <Input
                            id="body_part"
                            placeholder="เช่น แขนซ้าย, หน้าผาก"
                            value={newProcedure.body_part}
                            onChange={(e) =>
                            setNewProcedure((prev) => ({
                                ...prev,
                                body_part: e.target.value,
                            }))
                            }
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="procedure_status">สถานะ</Label>
                        <Select
                            value={newProcedure.status}
                            onValueChange={(value) =>
                            setNewProcedure((prev) => ({ ...prev, status: value }))
                            }
                        >
                            <SelectTrigger>
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="pending">รอดำเนินการ</SelectItem>
                            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                            <SelectItem value="cancelled">ยกเลิก</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="procedure_notes">หมายเหตุ</Label>
                        <Textarea
                            id="procedure_notes"
                            placeholder="หมายเหตุเพิ่มเติม..."
                            value={newProcedure.notes}
                            onChange={(e) =>
                            setNewProcedure((prev) => ({
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
                        onClick={() => setProcedureDialogOpen(false)}
                        >
                        ยกเลิก
                        </Button>
                        <Button
                        onClick={handleAddProcedure}
                        disabled={
                            !newProcedure.procedure_name.trim() ||
                            createProcedure.isPending
                        }
                        >
                        {createProcedure.isPending ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </DialogFooter>
                    </DialogContent>
    </Dialog>
        </>
    );
};