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

import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { usePatientConsultations } from "../hooks/usePatientConsultations";
import { useCreatePatientConsultation, useDeletePatientConsultation } from "../hooks/usePatientConsultations";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  patientId: string;
}

const getDefaultConsultation = () => ({
    consultation_date: format(new Date(), "yyyy-MM-dd"),
    chief_complaint: "",
    physical_exam_note: "",
    vital_signs: {
      blood_pressure: "",
      heart_rate: "",
      temperature: "",
      respiratory_rate: "",
      weight: "",
      height: "",
    },
    notes: "",
  });


export const ConsultationSection = ({ patientId }: Props) => {
  const { user } = useAuth();

   const { data: patientConsultations = [], isLoading: consultationsLoading } =
     usePatientConsultations(patientId || "");
   const createConsultation = useCreatePatientConsultation();
   const deleteConsultation = useDeletePatientConsultation();

    
    const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
    const [newConsultation, setNewConsultation] = useState(getDefaultConsultation);

        
    const handleAddConsultation = async () => {
        if (!patientId || !newConsultation.chief_complaint.trim()) return;

        // Filter out empty vital signs
        const cleanObject = <T extends Record<string, any>>(obj: T) =>
        Object.fromEntries(
            Object.entries(obj).filter(
            ([_, value]) => value && String(value).trim()
            )
        );
        const vital_signs = cleanObject(newConsultation.vital_signs);

        await createConsultation.mutateAsync({
        patient_id: patientId,
        consultation_date: newConsultation.consultation_date,
        chief_complaint: newConsultation.chief_complaint.trim(),
        physical_exam_note:
            newConsultation.physical_exam_note.trim() || undefined,
        vital_signs:
            Object.keys(vital_signs).length > 0
            ? vital_signs
            : undefined,
        notes: newConsultation.notes.trim() || undefined,
        created_by: user?.id,
        });

        // Reset form and close dialog
        setNewConsultation(getDefaultConsultation());
        setConsultationDialogOpen(false);
    };

    const handleDeleteConsultation = async (consultationId: string) => {
        if (!patientId) return;
        await deleteConsultation.mutateAsync({ id: consultationId, patientId });
    };

  return (
    <>
        <TabsContent value="consultations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  บันทึกอาการ ({patientConsultations.length} รายการ)
                </CardTitle>
                <Button
                  onClick={() => setConsultationDialogOpen(true)}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มบันทึกอาการ
                </Button>
              </CardHeader>
              
              <CardContent>
                {consultationsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : patientConsultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    ยังไม่มีบันทึกอาการ
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="p-4 rounded-lg border bg-card flex items-center justify-between"
                      >
                        {/* LEFT CONTENT */}
                        <div className="space-y-2">
                          <Badge variant="outline">
                            {format(
                              new Date(consultation.consultation_date),
                              "d MMM yyyy",
                              { locale: th },
                            )}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDeleteConsultation(consultation.id)
                          }
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
            open={consultationDialogOpen}
            onOpenChange={setConsultationDialogOpen}
            >
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>เพิ่มบันทึกอาการใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="consultation_date">วันที่ตรวจ</Label>
                    <Input
                    id="consultation_date"
                    type="date"
                    value={newConsultation.consultation_date}
                    onChange={(e) =>
                        setNewConsultation((prev) => ({
                        ...prev,
                        consultation_date: e.target.value,
                        }))
                    }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="chief_complaint">
                    อาการหลัก (Chief Complaint) *
                    </Label>
                    <Textarea
                    id="chief_complaint"
                    placeholder="เช่น ปวดหัว เวียนศีรษะ 3 วัน"
                    value={newConsultation.chief_complaint}
                    onChange={(e) =>
                        setNewConsultation((prev) => ({
                        ...prev,
                        chief_complaint: e.target.value,
                        }))
                    }
                    rows={2}
                    />
                </div>

                {/* Vital Signs */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Vital Signs</Label>
                    <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label
                        htmlFor="blood_pressure"
                        className="text-xs text-muted-foreground"
                        >
                        ความดันโลหิต (BP)
                        </Label>
                        <Input
                        id="blood_pressure"
                        placeholder="เช่น 120/80"
                        value={newConsultation.vital_signs.blood_pressure}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                blood_pressure: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label
                        htmlFor="heart_rate"
                        className="text-xs text-muted-foreground"
                        >
                        ชีพจร (HR)
                        </Label>
                        <Input
                        id="heart_rate"
                        placeholder="เช่น 80"
                        value={newConsultation.vital_signs.heart_rate}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                heart_rate: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label
                        htmlFor="temperature"
                        className="text-xs text-muted-foreground"
                        >
                        อุณหภูมิ (°C)
                        </Label>
                        <Input
                        id="temperature"
                        placeholder="เช่น 36.5"
                        value={newConsultation.vital_signs.temperature}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                temperature: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label
                        htmlFor="respiratory_rate"
                        className="text-xs text-muted-foreground"
                        >
                        อัตราหายใจ (RR)
                        </Label>
                        <Input
                        id="respiratory_rate"
                        placeholder="เช่น 18"
                        value={newConsultation.vital_signs.respiratory_rate}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                respiratory_rate: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label
                        htmlFor="weight"
                        className="text-xs text-muted-foreground"
                        >
                        น้ำหนัก (kg)
                        </Label>
                        <Input
                        id="weight"
                        placeholder="เช่น 65"
                        value={newConsultation.vital_signs.weight}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                weight: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label
                        htmlFor="height"
                        className="text-xs text-muted-foreground"
                        >
                        ส่วนสูง (cm)
                        </Label>
                        <Input
                        id="height"
                        placeholder="เช่น 170"
                        value={newConsultation.vital_signs.height}
                        onChange={(e) =>
                            setNewConsultation((prev) => ({
                            ...prev,
                            vital_signs: {
                                ...prev.vital_signs,
                                height: e.target.value,
                            },
                            }))
                        }
                        />
                    </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="physical_exam_note">บันทึกการตรวจร่างกาย</Label>
                    <Textarea
                    id="physical_exam_note"
                    placeholder="ผลการตรวจร่างกาย..."
                    value={newConsultation.physical_exam_note}
                    onChange={(e) =>
                        setNewConsultation((prev) => ({
                        ...prev,
                        physical_exam_note: e.target.value,
                        }))
                    }
                    rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="consultation_notes">หมายเหตุ</Label>
                    <Textarea
                    id="consultation_notes"
                    placeholder="หมายเหตุเพิ่มเติม..."
                    value={newConsultation.notes}
                    onChange={(e) =>
                        setNewConsultation((prev) => ({
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
                    onClick={() => setConsultationDialogOpen(false)}
                >
                    ยกเลิก
                </Button>
                <Button
                    onClick={handleAddConsultation}
                    disabled={
                    !newConsultation.chief_complaint.trim() ||
                    createConsultation.isPending
                    }
                >
                    {createConsultation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>

  );
};