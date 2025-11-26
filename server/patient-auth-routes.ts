import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { patientUsers, patients, auditLogs, encounters, patientLoginSchema, patientRegisterSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "patient-portal-secret-change-in-production";

// Middleware to verify patient token
function verifyPatientToken(req: Request, res: Response, next: any) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== "patient") {
      return res.status(403).json({ message: "Invalid token type" });
    }

    (req as any).patientId = decoded.patientId;
    (req as any).patientUserId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function registerPatientAuthRoutes(app: Router) {
  // Patient login
  app.post("/api/patient/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = patientLoginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Find patient user
      const patientUser = await db
        .select()
        .from(patientUsers)
        .where(eq(patientUsers.email, email))
        .limit(1);

      if (patientUser.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = patientUser[0];

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Get patient details
      const patientDetails = await db
        .select()
        .from(patients)
        .where(eq(patients.id, user.patientId))
        .limit(1);

      if (patientDetails.length === 0) {
        return res.status(404).json({ message: "Patient record not found" });
      }

      // Update last login
      await db
        .update(patientUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(patientUsers.id, user.id));

      // Create JWT token
      const token = jwt.sign(
        {
          id: user.id,
          patientId: user.patientId,
          email: user.email,
          type: "patient",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Log access
      await db.insert(auditLogs).values({
        userId: null,
        action: "patient_login",
        resourceType: "patient_user",
        resourceId: user.id.toString(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json({
        token,
        patient: {
          id: patientDetails[0].id,
          firstName: patientDetails[0].firstName,
          lastName: patientDetails[0].lastName,
          email: user.email,
          dateOfBirth: patientDetails[0].dateOfBirth,
        },
      });
    } catch (error: any) {
      console.error("Patient login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Patient registration - requires matching existing patient record with email verification
  app.post("/api/patient/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = patientRegisterSchema.parse(req.body);
      const { email, password, dateOfBirth, lastName } = validatedData;

      // Check if patient user already exists
      const existingUser = await db
        .select()
        .from(patientUsers)
        .where(eq(patientUsers.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Account already exists with this email" });
      }

      // Find matching patient record (by DOB, last name, AND email)
      // This ensures only the patient with the registered email can create an account
      const matchingPatients = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.lastName, lastName),
            eq(patients.dateOfBirth, dateOfBirth),
            eq(patients.email, email) // CRITICAL: Must match email on file
          )
        );

      if (matchingPatients.length === 0) {
        return res.status(404).json({
          message: "No matching patient record found. Please verify your information matches your medical records, or contact your healthcare provider.",
        });
      }

      if (matchingPatients.length > 1) {
        return res.status(400).json({
          message: "Multiple records found. Please contact your healthcare provider for assistance.",
        });
      }

      const patient = matchingPatients[0];
      
      // Verify patient has an email on file
      if (!patient.email) {
        return res.status(400).json({
          message: "No email address on file. Please contact your healthcare provider to update your contact information.",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create patient user account
      const newPatientUser = await db
        .insert(patientUsers)
        .values({
          patientId: patient.id,
          email,
          passwordHash,
          isActive: true,
        })
        .returning();

      // Create JWT token
      const token = jwt.sign(
        {
          id: newPatientUser[0].id,
          patientId: patient.id,
          email,
          type: "patient",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Log registration
      await db.insert(auditLogs).values({
        userId: null,
        action: "patient_registration",
        resourceType: "patient_user",
        resourceId: newPatientUser[0].id.toString(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json({
        token,
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email,
          dateOfBirth: patient.dateOfBirth,
        },
      });
    } catch (error: any) {
      console.error("Patient registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Get current patient info
  app.get("/api/patient/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== "patient") {
        return res.status(403).json({ message: "Invalid token type" });
      }

      const patientDetails = await db
        .select()
        .from(patients)
        .where(eq(patients.id, decoded.patientId))
        .limit(1);

      if (patientDetails.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const patient = patientDetails[0];

      res.json({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: decoded.email,
        dateOfBirth: patient.dateOfBirth,
      });
    } catch (error: any) {
      console.error("Get patient info error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  });

  // Patient logout
  app.post("/api/patient/auth/logout", async (req: Request, res: Response) => {
    // JWT tokens are stateless, so logout is handled client-side
    res.json({ message: "Logged out successfully" });
  });

  // Get patient's medical records (encounters)
  app.get("/api/patient/records", verifyPatientToken, async (req: Request, res: Response) => {
    try {
      const patientId = (req as any).patientId;

      // Fetch all encounters for this patient
      const patientEncounters = await db
        .select()
        .from(encounters)
        .where(eq(encounters.patientId, patientId.toString()))
        .orderBy(encounters.createdAt);

      // Log access
      await db.insert(auditLogs).values({
        userId: null,
        action: "patient_view_records",
        resourceType: "encounter",
        resourceId: patientId.toString(),
        details: { count: patientEncounters.length },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json(patientEncounters);
    } catch (error: any) {
      console.error("Fetch patient records error:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  // Get specific encounter details
  app.get("/api/patient/records/:id", verifyPatientToken, async (req: Request, res: Response) => {
    try {
      const patientId = (req as any).patientId;
      const encounterId = parseInt(req.params.id);

      if (isNaN(encounterId)) {
        return res.status(400).json({ message: "Invalid encounter ID" });
      }

      // Fetch encounter and verify it belongs to this patient
      const encounter = await db
        .select()
        .from(encounters)
        .where(
          and(
            eq(encounters.id, encounterId),
            eq(encounters.patientId, patientId.toString())
          )
        )
        .limit(1);

      if (encounter.length === 0) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Log access
      await db.insert(auditLogs).values({
        userId: null,
        action: "patient_view_record_details",
        resourceType: "encounter",
        resourceId: encounterId.toString(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json(encounter[0]);
    } catch (error: any) {
      console.error("Fetch encounter error:", error);
      res.status(500).json({ message: "Failed to fetch record" });
    }
  });

  // Get patient profile
  app.get("/api/patient/profile", verifyPatientToken, async (req: Request, res: Response) => {
    try {
      const patientId = (req as any).patientId;

      const patientDetails = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);

      if (patientDetails.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const patient = patientDetails[0];

      res.json({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email,
        phone: patient.phone,
        allergies: patient.allergies,
        medications: patient.medications,
        medicalHistory: patient.medicalHistory,
      });
    } catch (error: any) {
      console.error("Fetch patient profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
}
