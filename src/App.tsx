import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePatientAccount } from "@/hooks/usePatientAccount";
import { useUserRole } from "@/hooks/useUserRole";

import { Outlet } from "react-router-dom";

import Auth from "./pages/Auth";

//doctor pages
import Index from "./pages/doctor/DoctorDashboard";
import Register from "./pages/doctor/Register";
import Patients from "./pages/doctor/Patients";
import NotFound from "./pages/NotFound";
import PatientSignup from "./pages/PatientSignup";
import PatientDetail from "./pages/doctor/PatientDetail";

//patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientMedicationHistory from "./pages/patient/PatientMedicationHistory";
import PatientTreatmentHistory from "./pages/patient/PatientTreatmentHistory";
import FullScreenLoader from "./components/FullScreenLoader";


const queryClient = new QueryClient();

// Staff-only route protection
const StaffProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { isPatient, isStaff, isLoading: roleLoading } = useUserRole();
  
  if (loading || roleLoading) {
    return <FullScreenLoader />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect patients to patient dashboard
  if (isPatient && !isStaff) {
    return <Navigate to="/patient" replace />;
  }
  
  return <Outlet />;
};

// Patient-only route protection
const PatientProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { data: patientAccount, isLoading: accountLoading } = usePatientAccount();
  const { isStaff, isLoading: roleLoading } = useUserRole();
  
  if (loading || accountLoading || roleLoading) {
    return <FullScreenLoader />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Staff members without patient accounts go to staff dashboard
  if (isStaff && !patientAccount) {
    return <Navigate to="/doctor" replace />;
  }

  if (!patientAccount) {
    return <Navigate to="/patient-signup" replace />;
  }
  
  return <Outlet />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <FullScreenLoader />;
  

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />}/>

      <Route path="/auth" element={<Auth />} />
      
      <Route path="/patient-signup" element={<PatientSignup />} />
      
      {/* Doctor routes */}
      <Route element={<StaffProtectedRoute />}>
        <Route path="/doctor" element={<Index />} />
        <Route path="/doctor/register" element={<Register />} />
        <Route path="/doctor/patients" element={<Patients />} />
        <Route path="/doctor/patients/:patientId" element={<PatientDetail />}/>
      </Route>
      
      {/* Patient routes */}
      <Route element={<PatientProtectedRoute />}>
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/treatments" element={<PatientTreatmentHistory />} />
        <Route path="/patient/medications" element={<PatientMedicationHistory />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
