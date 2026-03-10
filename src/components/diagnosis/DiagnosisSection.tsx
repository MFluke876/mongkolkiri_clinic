import { TabsContent } from "@/components/ui/tabs"
import { format } from "date-fns";
import { Plus  } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

import {
  usePatientDiagnoses,
  useCreatePatientDiagnosis,
  useDeletePatientDiagnosis,
} from "@/hooks/usePatientDiagnoses";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCreateMedicalImages, useDeleteMedicalImages } from "@/hooks/useMedicalImages";
import { Carousel, fetchImages } from "../Carousel";
import { DiagnosisRow } from "./DiagnosisRow";


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

    const { data: patientDiagnoses = [], isLoading: diagnosesLoading } = usePatientDiagnoses(patientId);


    const createDiagnosis = useCreatePatientDiagnosis();
    const deleteDiagnosis = useDeletePatientDiagnosis();

    const createMedicalImages = useCreateMedicalImages();
    const deleteMedicalImages = useDeleteMedicalImages();

    const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
    const [newDiagnosis, setNewDiagnosis] = useState(getDefaultDiagnosis());

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleAddDiagnosis = async () => {
        if (!patientId || !newDiagnosis.icd10_code.trim()) return;

        const diagnosis = await createDiagnosis.mutateAsync({
        patient_id: patientId,
        diagnosis_date: newDiagnosis.diagnosis_date,
        icd10_code: newDiagnosis.icd10_code.trim(),
        description: newDiagnosis.description.trim() || undefined,
        diagnosis_type: newDiagnosis.diagnosis_type,
        notes: newDiagnosis.notes.trim() || undefined,
        has_images: selectedFiles.length > 0,
        created_by: user?.id,
        });

        if (selectedFiles.length > 0) {
            await createMedicalImages.mutateAsync({
                patientId: patientId,
                entityType: "diagnosis",
                entityId: diagnosis.id,
                files: selectedFiles,
                createdBy: user?.id,
            });
        }

        // Reset form and close dialog
        setNewDiagnosis(getDefaultDiagnosis());
        setDiagnosisDialogOpen(false);
        setSelectedFiles([])
    };

    const handleDeleteDiagnosis = async (diagnosisId: string) => {
        if (!patientId) return;

        await deleteMedicalImages.mutateAsync({patientId: patientId, entityType: "diagnosis", entityId: diagnosisId });
        await deleteDiagnosis.mutateAsync({ id: diagnosisId, patientId });
    };

    const [viewerOpen, setViewerOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const openViewer = async (diagnosisId: string) => {
        const diagnosisImages = await fetchImages(patientId, "diagnosis", diagnosisId);
        
        setImages(diagnosisImages);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
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
                            <DiagnosisRow
                                key={diagnosis.id}
                                diagnosis={diagnosis}
                                onViewImages={openViewer}
                                onDelete={handleDeleteDiagnosis}
                                />
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
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

            <Carousel images={images} isOpen={viewerOpen} onClose={closeViewer} />
           

    </>
    );
    
}