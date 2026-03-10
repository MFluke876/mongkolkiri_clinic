
import { getStepInfo } from "@/hooks/usePatientTreatmentPlans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent} from "@/components/ui/tabs";
import { ClipboardList, AlertCircle} from "lucide-react";
import { formatDate } from "@/pages/patient/PatientTreatmentHistory";

interface Props {
    treatmentPlans: any;
}

export const PatientTreatmentPlan = ({ treatmentPlans }: Props) => {
    return (
        <TabsContent value="treatments" className="space-y-4 mt-4">
                    {treatmentPlans && treatmentPlans.length > 0 ? (
                      treatmentPlans.map((plan) => {
                        const stepInfo = getStepInfo(plan.step);
                        return (
                          <Card key={plan.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                  <ClipboardList className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Badge variant="default">ขั้นตอนที่ {plan.step}: {stepInfo.name}</Badge>
                                  </CardTitle>
                                  <CardDescription>
                                    {formatDate(plan.plan_date)} — {stepInfo.description}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium mb-1">รายละเอียด</h4>
                                <p className="text-sm text-muted-foreground">{plan.step_details}</p>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm">
                                {plan.duration && (
                                  <div>
                                    <span className="text-muted-foreground">ระยะเวลา: </span>
                                    <span className="font-medium">{plan.duration}</span>
                                  </div>
                                )}
                                {plan.follow_up_date && (
                                  <div>
                                    <span className="text-muted-foreground">วันนัดติดตาม: </span>
                                    <span className="font-medium">
                                      {formatDate(plan.follow_up_date)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {plan.notes && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">หมายเหตุ</h4>
                                  <p className="text-sm text-muted-foreground">{plan.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">ไม่มีแผนการรักษา</h3>
                          <p className="text-muted-foreground">ยังไม่มีข้อมูลแผนการรักษาในระบบ</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
    )
}