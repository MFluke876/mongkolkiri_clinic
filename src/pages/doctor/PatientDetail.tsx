import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ArrowLeft,
  Stethoscope,
  Pill,
  FileText,
  Download,
} from "lucide-react";

import {
  usePatientDiagnoses,
} from "@/hooks/usePatientDiagnoses";

import {
  usePatientConsultations,
} from "@/hooks/usePatientConsultations";

import {
  usePatientTreatmentPlans,
} from "@/hooks/usePatientTreatmentPlans";

import { HeartPulse, Scissors } from "lucide-react";
import { exportPatientPdf } from "@/utils/exportPatientPdf";
import { PatientInfoCard } from "@/components/PatientInfoCard";
import { ConsultationSection } from "@/components/ConsultationSection";
import { DiagnosisSection } from "@/components/DiagnosisSection";
import { TreatmentSection } from "@/components/TreatmentSection";
import { ProcedureSection } from "@/components/ProcedureSection";
import { PrescriptionSection } from "@/components/PrescriptionSection";
import { usePrescriptions } from "@/hooks/usePrescriptions";

interface PatientInfo {
  id: string;
  hn: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  national_id: string | null;
  phone: string | null;
  address: string | null;
  allergies: string[];
  created_at: string;
}

interface PrescriptionRecord {
  id: string;
  prescription_date: string | null;
  quantity: number;
  usage_instruction: string | null;
  medicine: {
    name_thai: string;
    name_english: string | null;
  } | null;
}





const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();


  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient-detail", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) throw error;
      return data as PatientInfo;
    },
    enabled: !!patientId,
  });

  // Fetch prescriptions directly by patient_id
  const { data: patientPrescriptions = []} = usePrescriptions(patientId || "");

  // Fetch patient diagnoses from new standalone table
  const { data: patientDiagnoses = [] } =usePatientDiagnoses(patientId || "");

  // Fetch patient consultations
  const { data: patientConsultations = []} = usePatientConsultations(patientId || "");

  // Fetch patient treatment plans (new table)
  const { data: patientTreatmentPlans = [] } = usePatientTreatmentPlans(patientId || "");


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">ไม่พบข้อมูลผู้ป่วย</p>
          <Button variant="link" onClick={() => navigate("/doctor/patients")}>
            กลับหน้ารายชื่อผู้ป่วย
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/doctor/patients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              exportPatientPdf({
                patient: {
                  ...patient,
                  allergies: patient.allergies || [],
                },
                consultations: patientConsultations,
                diagnoses: patientDiagnoses,
                treatmentPlans: patientTreatmentPlans,
                prescriptions: patientPrescriptions,
              })
            }
          >
            <Download className="h-4 w-4" />
            ส่งออก PDF
          </Button>
        </div>

        {/* Patient Info Card */}
        <PatientInfoCard patient={patient} />

        {/* Tabs for Medical History */}
        <Tabs defaultValue="consultations" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="consultations" className="gap-1">
              <FileText className="h-4 w-4" />
              บันทึกอาการ
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="gap-1">
              <Stethoscope className="h-4 w-4" />
              การวินิจฉัย
            </TabsTrigger>
            <TabsTrigger value="treatment-plans" className="gap-1">
              <HeartPulse className="h-4 w-4" />
              แผนการรักษา
            </TabsTrigger>
            <TabsTrigger value="procedures" className="gap-1">
              <Scissors className="h-4 w-4" />
              หัตถการ
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-1">
              <Pill className="h-4 w-4" />
              ประวัติยา
            </TabsTrigger>
          </TabsList>

          {/* Consultation History - Chief Complaint Tab */}
          <ConsultationSection patientId={patientId} />

          {/* Diagnosis History */}
          <DiagnosisSection patientId={patientId} />

          {/* Treatment Plans Tab */}
          <TreatmentSection patientId={patientId} />

          {/* Procedure Orders Tab */}
          <ProcedureSection patientId={patientId} />

          {/* Medication History */}
          <PrescriptionSection patientId={patientId} />

        </Tabs>

        
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
