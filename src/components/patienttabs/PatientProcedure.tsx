
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {  AlertCircle, Scissors } from "lucide-react";
import { formatDate } from "@/pages/patient/PatientTreatmentHistory";
import { TabsContent } from "../ui/tabs";
import { Carousel, fetchImages } from "../Carousel";
import { useState } from "react";
import { Button } from "../ui/button";

interface Props {
    patientId: string,
    procedures: any;
}

export const PatientProcedure = ({ patientId, procedures }: Props) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const openViewer = async (procedureId: string) => {
        const procedureImages = await fetchImages(patientId, "procedure", procedureId);
        
        setImages(procedureImages);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
    };
    

    return (
        <TabsContent value="procedures" className="space-y-4 mt-4">
            {procedures && procedures.length > 0 ? (
              procedures.map((procedure) => (
                <Card key={procedure.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Scissors className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{procedure.procedure_name}</CardTitle>
                          <CardDescription>
                            {procedure.procedure_date
                              ? formatDate(procedure.procedure_date)
                              : "ไม่ระบุวันที่"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          procedure.status === "completed"
                            ? "default"
                            : procedure.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {procedure.status === "completed"
                          ? "เสร็จสิ้น"
                          : procedure.status === "cancelled"
                          ? "ยกเลิก"
                          : "รอดำเนินการ"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {procedure.body_part && (
                        <div>
                          <span className="text-muted-foreground">บริเวณ: </span>
                          <span className="font-medium text-foreground">{procedure.body_part}</span>
                        </div>
                      )}
                      {procedure.notes && (
                        <div>
                          <span className="text-muted-foreground">หมายเหตุ: </span>
                          <span>{procedure.notes}</span>
                        </div>
                      )}
                    </div>

                    
                    {procedure.has_images && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewer(procedure.id)}
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
                  <h3 className="text-lg font-medium">ไม่มีประวัติหัตถการ</h3>
                  <p className="text-muted-foreground">ยังไม่มีข้อมูลหัตถการในระบบ</p>
                </CardContent>
              </Card>
            )}

            <Carousel images={images} isOpen={viewerOpen} onClose={closeViewer} />
            
          </TabsContent>
    );
};