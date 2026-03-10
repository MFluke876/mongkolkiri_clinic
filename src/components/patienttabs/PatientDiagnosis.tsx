
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TabsContent } from "@/components/ui/tabs";
import { formatDate, getDiagnosisTypeBadge } from "@/pages/patient/PatientTreatmentHistory";
import { Stethoscope, Calendar, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Carousel, fetchImages } from "../Carousel";
import { Button } from "../ui/button";

interface Props {
    patientId: string;
    diagnoses: any;
}

export const PatientDiagnosis = ({ patientId,diagnoses }: Props) => {
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
        <TabsContent value="diagnoses" className="space-y-4 mt-4">
            {diagnoses && diagnoses.length > 0 ? (
                diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id}>
                    <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{diagnosis.icd10_code}</CardTitle>
                            <CardDescription>{diagnosis.description || 'ไม่มีคำอธิบาย'}</CardDescription>
                        </div>
                        </div>
                        {getDiagnosisTypeBadge(diagnosis.diagnosis_type)}
                    </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {formatDate(diagnosis.diagnosis_date)}
                                </span>
                            </div>

                            {diagnosis.notes && (
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{diagnosis.notes}</span>
                            </div>
                            )}
                            
                        </div>
                        
                        {diagnosis.has_images &&(
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewer(diagnosis.id)}
                        >
                            ดูรูปภาพ
                        </Button>
                        )}
                    </CardContent>
                </Card>
                ))
            ) : (
                <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">ไม่มีประวัติการวินิจฉัย</h3>
                    <p className="text-muted-foreground">ยังไม่มีข้อมูลการวินิจฉัยในระบบ</p>
                </CardContent>
                </Card>
            )}

            <Carousel images={images} isOpen={viewerOpen} onClose={closeViewer} />
            
        </TabsContent>
    );
};