import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle, HeartPulse } from "lucide-react";

import { formatDate } from "@/pages/patient/PatientTreatmentHistory";
import { Button } from "../ui/button";
import { Carousel, fetchImages } from "../Carousel";
import { useState } from "react";

interface Props {
    patientId: string;
    consultations: any;
}

export const PatientConsultation = ({ patientId, consultations }: Props) => {
        
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
        <TabsContent value="consultations" className="space-y-4 mt-4">
            {consultations && consultations.length > 0 ? (
              consultations.map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <HeartPulse className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">บันทึกอาการ</CardTitle>
                        <CardDescription>
                          {formatDate(consultation.consultation_date)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">อาการหลัก</h4>
                      <p className="text-sm">{consultation.chief_complaint}</p>
                    </div>

                    {consultation.vital_signs && Object.keys(consultation.vital_signs).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Vital Signs</h4>
                        <div className="flex flex-wrap gap-2">
                          {consultation.vital_signs.blood_pressure && (
                            <Badge variant="outline" className="text-xs">BP: {String(consultation.vital_signs.blood_pressure)}</Badge>
                          )}
                          {consultation.vital_signs.heart_rate && (
                            <Badge variant="outline" className="text-xs">HR: {String(consultation.vital_signs.heart_rate)}</Badge>
                          )}
                          {consultation.vital_signs.temperature && (
                            <Badge variant="outline" className="text-xs">Temp: {String(consultation.vital_signs.temperature)}°C</Badge>
                          )}
                          {consultation.vital_signs.respiratory_rate && (
                            <Badge variant="outline" className="text-xs">RR: {String(consultation.vital_signs.respiratory_rate)}</Badge>
                          )}
                          {consultation.vital_signs.weight && (
                            <Badge variant="outline" className="text-xs">น้ำหนัก: {String(consultation.vital_signs.weight)} kg</Badge>
                          )}
                          {consultation.vital_signs.height && (
                            <Badge variant="outline" className="text-xs">ส่วนสูง: {String(consultation.vital_signs.height)} cm</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {consultation.physical_exam_note && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">บันทึกการตรวจร่างกาย</h4>
                        <p className="text-sm text-muted-foreground">{consultation.physical_exam_note}</p>
                      </div>
                    )}
                    
                    {consultation.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">หมายเหตุ</h4>
                        <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                      </div>
                    )}

                    {consultation.has_images && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewer(consultation.id)}
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
                  <h3 className="text-lg font-medium">ไม่มีบันทึกอาการ</h3>
                  <p className="text-muted-foreground">ยังไม่มีข้อมูลบันทึกอาการในระบบ</p>
                </CardContent>
              </Card>
            )}

            <Carousel images={images} isOpen={viewerOpen} onClose={closeViewer} />

          </TabsContent>

          
    );


};