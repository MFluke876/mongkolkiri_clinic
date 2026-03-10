import { usePatientAccount } from "@/hooks/usePatientAccount";
import { usePatientDiagnoses } from "@/hooks/usePatientDiagnoses";
import { usePatientTreatmentPlans, getStepInfo } from "@/hooks/usePatientTreatmentPlans";
import { usePatientConsultations } from "@/hooks/usePatientConsultations";
import { useProcedureOrders } from "@/hooks/useProcedureOrders";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, ClipboardList, Calendar, FileText, AlertCircle, HeartPulse, Scissors } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { PatientConsultation } from "@/components/patienttabs/PatientConsultation";
import { PatientDiagnosis } from "@/components/patienttabs/PatientDiagnosis";
import { PatientProcedure } from "@/components/patienttabs/PatientProcedure";
import { PatientTreatmentPlan } from "@/components/patienttabs/PatientTreatmentPlan";



export const getDiagnosisTypeBadge = (type: string | null) => {
  switch (type) {
    case 'primary':
      return <Badge variant="default">หลัก</Badge>;
    case 'secondary':
      return <Badge variant="secondary">รอง</Badge>;
    default:
      return <Badge variant="outline">{type || 'ไม่ระบุ'}</Badge>;
  }
};


export const formatDate = (date?: string | null) =>
date ? format(new Date(date), "d MMMM yyyy", { locale: th }) : "ไม่ระบุวันที่";

const PatientTreatmentHistory = () => {
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const patientId = patientAccount?.patient_id || "";
  
  const { data: diagnoses, isLoading: diagnosesLoading } = usePatientDiagnoses(patientId);
  const { data: treatmentPlans, isLoading: plansLoading } = usePatientTreatmentPlans(patientId);
  const { data: consultations, isLoading: consultationsLoading } = usePatientConsultations(patientId);
  const { data: procedures, isLoading: proceduresLoading } = useProcedureOrders(patientId);

  const isLoading = accountLoading || diagnosesLoading || plansLoading || consultationsLoading || proceduresLoading;

  if (isLoading) {
    return (
      <PatientLayout title="ประวัติการรักษา">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PatientLayout>
    );
  }



  return (
    <PatientLayout title="ประวัติการรักษา">
      <div className="space-y-6">
        <Tabs defaultValue="consultations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">

            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              บันทึกอาการ ({consultations?.length || 0})
            </TabsTrigger>

            <TabsTrigger value="diagnoses" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              การวินิจฉัย ({diagnoses?.length || 0})
            </TabsTrigger>

            <TabsTrigger value="treatments" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              แผนการรักษา ({treatmentPlans?.length || 0})
            </TabsTrigger>

            <TabsTrigger value="procedures" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              หัตถการ ({procedures?.length || 0})
            </TabsTrigger>

          </TabsList>

          {/* Consultations Tab */}
          <PatientConsultation patientId={patientId} consultations={consultations}  />

          {/* Diagnoses Tab */}
          <PatientDiagnosis patientId={patientId} diagnoses={diagnoses}/>

          {/* Treatment Plans Tab */}
          <PatientTreatmentPlan treatmentPlans={treatmentPlans} />

          {/* Procedures Tab */}
          <PatientProcedure patientId={patientId} procedures={procedures} />

        </Tabs>
      </div>
    </PatientLayout>
  );
};

export default PatientTreatmentHistory;
