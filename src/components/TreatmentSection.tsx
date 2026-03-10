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
  usePatientTreatmentPlans,
  useCreatePatientTreatmentPlan,
  useDeletePatientTreatmentPlan,
  TREATMENT_STEPS,
  getStepInfo,
} from "@/hooks/usePatientTreatmentPlans";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Props {
  patientId: string;
}

const getDefaultTreatmentPlan = () => ({
    plan_date: format(new Date(), "yyyy-MM-dd"),
    step: 1,
    step_details: "",
    duration: "",
    follow_up_date: "",
    notes: "",
  });


export const TreatmentSection = ({ patientId }: Props) => {
    const { user } = useAuth();

    const [treatmentPlanDialogOpen, setTreatmentPlanDialogOpen] = useState(false);
    const [newTreatmentPlan, setNewTreatmentPlan] = useState(getDefaultTreatmentPlan);

    // Fetch patient treatment plans (new table)
    const { data: patientTreatmentPlans = [], isLoading: treatmentPlansLoading } =
    usePatientTreatmentPlans(patientId || "");
    const createTreatmentPlan = useCreatePatientTreatmentPlan();
    const deleteTreatmentPlan = useDeletePatientTreatmentPlan();
    
    const handleAddTreatmentPlan = async () => {
        if (!patientId || !newTreatmentPlan.step_details.trim()) return;

        await createTreatmentPlan.mutateAsync({
            patient_id: patientId,
            plan_date: newTreatmentPlan.plan_date,
            step: newTreatmentPlan.step,
            step_details: newTreatmentPlan.step_details.trim(),
            duration: newTreatmentPlan.duration.trim() || undefined,
            follow_up_date: newTreatmentPlan.follow_up_date || undefined,
            notes: newTreatmentPlan.notes.trim() || undefined,
            created_by: user?.id,
            });

            setNewTreatmentPlan(getDefaultTreatmentPlan());
            setTreatmentPlanDialogOpen(false);
        };

    const handleDeleteTreatmentPlan = async (planId: string) => {
        if (!patientId) return;
        await deleteTreatmentPlan.mutateAsync({ id: planId, patientId });
    };


    return (
        <>
            <TabsContent value="treatment-plans">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                        แผนการรักษา ({patientTreatmentPlans.length} รายการ)
                    </CardTitle>
                    <Button
                        onClick={() => setTreatmentPlanDialogOpen(true)}
                        size="sm"
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        เพิ่มแผนการรักษา
                    </Button>
                    </CardHeader>
                    <CardContent>
                    {treatmentPlansLoading ? (
                        <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        </div>
                    ) : patientTreatmentPlans.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                        ยังไม่มีแผนการรักษา
                        </p>
                    ) : (
                        <div className="space-y-3">
                        {patientTreatmentPlans.map((plan) => {
                            const stepInfo = getStepInfo(plan.step);
                            return (
                            <div
                                key={plan.id}
                                className="p-4 rounded-lg border bg-card flex items-center justify-between"
                            >
                                {/* LEFT CONTENT */}
                                <div className="space-y-1">
                                {/* step + date */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="default">
                                    ขั้นตอนที่ {plan.step}: {stepInfo.name}
                                    </Badge>
    
                                    <span className="text-xs text-muted-foreground">
                                    {stepInfo.description}
                                    </span>
    
                                    <Badge variant="outline">
                                    {format(
                                        new Date(plan.plan_date),
                                        "d MMM yyyy",
                                        { locale: th },
                                    )}
                                    </Badge>
                                </div>
    
                                {/* details */}
                                <p className="text-sm">{plan.step_details}</p>
    
                                {/* duration + followup */}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {plan.duration && (
                                    <span>
                                        ระยะเวลา:{" "}
                                        <span className="font-medium">
                                        {plan.duration}
                                        </span>
                                    </span>
                                    )}
    
                                    {plan.follow_up_date && (
                                    <span>
                                        นัดติดตาม:{" "}
                                        <span className="font-medium">
                                        {format(
                                            new Date(plan.follow_up_date),
                                            "d MMM yyyy",
                                            { locale: th },
                                        )}
                                        </span>
                                    </span>
                                    )}
                                </div>
    
                                {plan.notes && (
                                    <p className="text-sm text-muted-foreground">
                                    หมายเหตุ: {plan.notes}
                                    </p>
                                )}
                                </div>
    
                                {/* RIGHT BUTTON */}
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTreatmentPlan(plan.id)}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            );
                        })}
                        </div>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>

            <Dialog
                open={treatmentPlanDialogOpen}
                onOpenChange={setTreatmentPlanDialogOpen}
            >
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>เพิ่มแผนการรักษาใหม่</DialogTitle>
                    </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                            <Label htmlFor="plan_date">วันที่วางแผน</Label>
                            <Input
                                id="plan_date"
                                type="date"
                                value={newTreatmentPlan.plan_date}
                                onChange={(e) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    plan_date: e.target.value,
                                }))
                                }
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="step">ขั้นตอนการรักษา *</Label>
                            <Select
                                value={String(newTreatmentPlan.step)}
                                onValueChange={(value) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    step: Number(value),
                                }))
                                }
                            >
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                {TREATMENT_STEPS.map((s) => (
                                    <SelectItem key={s.step} value={String(s.step)}>
                                    {s.step}. {s.name} - {s.description}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="step_details">รายละเอียดขั้นตอน *</Label>
                            <Textarea
                                id="step_details"
                                placeholder="รายละเอียดของขั้นตอนการรักษา..."
                                value={newTreatmentPlan.step_details}
                                onChange={(e) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    step_details: e.target.value,
                                }))
                                }
                                rows={3}
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="duration">ระยะเวลา</Label>
                            <Input
                                id="duration"
                                placeholder="เช่น 7 วัน, 2 สัปดาห์"
                                value={newTreatmentPlan.duration}
                                onChange={(e) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    duration: e.target.value,
                                }))
                                }
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="follow_up_date">วันนัดติดตาม</Label>
                            <Input
                                id="follow_up_date"
                                type="date"
                                value={newTreatmentPlan.follow_up_date}
                                onChange={(e) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    follow_up_date: e.target.value,
                                }))
                                }
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="treatment_notes">หมายเหตุ</Label>
                            <Textarea
                                id="treatment_notes"
                                placeholder="หมายเหตุเพิ่มเติม..."
                                value={newTreatmentPlan.notes}
                                onChange={(e) =>
                                setNewTreatmentPlan((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                }))
                                }
                                rows={2}
                            />
                            </div>
                        </div>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={() => setTreatmentPlanDialogOpen(false)}
                    >
                    ยกเลิก
                    </Button>
                    <Button
                    onClick={handleAddTreatmentPlan}
                    disabled={
                        !newTreatmentPlan.step_details.trim() ||
                        createTreatmentPlan.isPending
                    }
                    >
                    {createTreatmentPlan.isPending ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}