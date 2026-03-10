import { format } from "date-fns";
import { Plus } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

import { usePatientConsultations } from "@/hooks/usePatientConsultations";
import { useCreatePatientConsultation, useDeletePatientConsultation } from "@/hooks/usePatientConsultations";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ConsultationRow } from "./ConsultationRow";
import { Carousel, fetchImages } from "../Carousel";
import { useCreateMedicalImages, useDeleteMedicalImages } from "@/hooks/useMedicalImages";

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


// Filter out empty vital signs
const cleanObject = <T extends Record<string, any>>(obj: T) =>
Object.fromEntries(
    Object.entries(obj).filter(
    ([_, value]) => value && String(value).trim()
    )
);

export const ConsultationSection = ({ patientId }: Props) => {
  const { user } = useAuth();

   const { data: patientConsultations = [], isLoading: consultationsLoading } = usePatientConsultations(patientId);


   const createConsultation = useCreatePatientConsultation();
   const deleteConsultation = useDeletePatientConsultation();

   const createMedicalImages = useCreateMedicalImages();
   const deleteMedicalImages = useDeleteMedicalImages();

    const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
    const [newConsultation, setNewConsultation] = useState(getDefaultConsultation());

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
        
    const handleAddConsultation = async () => {
        if (!patientId || !newConsultation.chief_complaint.trim()) return;

        const vital_signs = cleanObject(newConsultation.vital_signs);

        const consultation = await createConsultation.mutateAsync({
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
          has_images: selectedFiles.length > 0,
          created_by: user?.id,
        });

        if (selectedFiles.length > 0) {
            await createMedicalImages.mutateAsync({
                patientId: patientId,
                entityType: "consultation",
                entityId: consultation.id,
                files: selectedFiles,
                createdBy: user?.id,
            });
        }

        // Reset form and close dialog
        setNewConsultation(getDefaultConsultation());
        setConsultationDialogOpen(false);
        setSelectedFiles([]);
    };

    const handleDeleteConsultation = async (consultationId: string) => {
        if (!patientId) return;
        
        await deleteMedicalImages.mutateAsync({patientId: patientId, entityType: "consultation", entityId: consultationId });
        await deleteConsultation.mutateAsync({ id: consultationId, patientId });
    };

    const [viewerOpen, setViewerOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const openViewer = async (consultationId: string) => {
        const consultationImages = await fetchImages(patientId, "consultation", consultationId);
        
        setImages(consultationImages);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
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
                     
                        <ConsultationRow
                          key={consultation.id}
                          consultation={consultation}
                          onViewImages={openViewer}
                          onDelete={handleDeleteConsultation}
                        />
                      
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
                <div className="space-y-2">
                    <Label>รูปภาพ</Label>
                    <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
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

        <Carousel images={images} isOpen={viewerOpen} onClose={closeViewer} />
        
    </>

  );
};