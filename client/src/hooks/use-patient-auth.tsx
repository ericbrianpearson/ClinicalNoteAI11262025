import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface PatientData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}

interface PatientAuthContextType {
  patient: PatientData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, dateOfBirth: string, lastName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem("patient_token");
    if (storedToken) {
      setToken(storedToken);
      fetchPatientInfo(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchPatientInfo = async (authToken: string) => {
    try {
      const response = await fetch("/api/patient/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else {
        localStorage.removeItem("patient_token");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch patient info:", error);
      localStorage.removeItem("patient_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/patient/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setPatient(data.patient);
      localStorage.setItem("patient_token", data.token);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.patient.firstName} ${data.patient.lastName}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    dateOfBirth: string,
    lastName: string
  ) => {
    try {
      const response = await fetch("/api/patient/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, dateOfBirth, lastName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      setToken(data.token);
      setPatient(data.patient);
      localStorage.setItem("patient_token", data.token);

      toast({
        title: "Account created!",
        description: "Welcome to the patient portal",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
      throw error;
    }
  };

  const logout = () => {
    setPatient(null);
    setToken(null);
    localStorage.removeItem("patient_token");
    toast({
      title: "Logged out",
      description: "You have been logged out of the patient portal",
    });
  };

  return (
    <PatientAuthContext.Provider value={{ patient, token, login, register, logout, isLoading }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error("usePatientAuth must be used within a PatientAuthProvider");
  }
  return context;
}
