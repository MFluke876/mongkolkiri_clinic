import { differenceInYears, format } from "date-fns";
import { th } from "date-fns/locale";
import {
  User,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

interface Props {
  patient: PatientInfo;
}

export const PatientInfoCard = ({ patient }: Props) => {
  const age = differenceInYears(new Date(), new Date(patient.dob));
  const hasAllergies = !!patient.allergies?.length;

  const genderLabel =
    patient.gender === "male"
      ? "ชาย"
      : patient.gender === "female"
      ? "หญิง"
      : "อื่นๆ";

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-display">
                {patient.first_name} {patient.last_name}
              </span>

              {hasAllergies && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  แพ้ยา
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground font-normal">
              HN: {patient.hn}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">วันเกิด:</span>
              <span>
                {format(new Date(patient.dob), "d MMMM yyyy", {
                  locale: th,
                })}{" "}
                ({age} ปี)
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">เพศ:</span>
              <span>{genderLabel}</span>
            </div>

            {patient.national_id && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  เลขบัตรประชาชน:
                </span>
                <span>{patient.national_id}</span>
              </div>
            )}
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">โทรศัพท์:</span>
                <span>{patient.phone}</span>
              </div>
            )}

            {patient.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">ที่อยู่:</span>
                <span>{patient.address}</span>
              </div>
            )}
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            {hasAllergies && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  การแพ้ยา/อาหาร
                </div>

                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};