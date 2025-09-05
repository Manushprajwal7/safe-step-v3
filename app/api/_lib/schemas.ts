import { z } from "zod"

export const OnboardingSchema = z.object({
  full_name: z.string().min(1),
  age: z.number().int().min(1).max(120).nullable().optional(),
  weight_kg: z.number().min(0).max(500).nullable().optional(),
  height_cm: z.number().min(0).max(300).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  profession: z.string().max(200).nullable().optional(),
  diabetes: z.enum(["type1", "type2", "prediabetic", "unspecified"]).optional(),
  diagnosis_date: z.string().nullable().optional(),
  symptoms: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  activity_level: z.string().max(200).nullable().optional(),
  footwear_type: z.string().max(200).nullable().optional(),
  prior_injuries: z.string().max(500).nullable().optional(),
  blood_sugar_mg_dl: z.number().min(0).max(1000).nullable().optional(),
})

export const SessionStartSchema = z.object({
  label: z.string().max(200).optional(),
})

export const SessionPatchSchema = z.object({
  status: z.enum(["active", "paused", "ended"]).optional(),
  ended_at: z.string().optional(),
})

export const SampleSchema = z.object({
  foot: z.enum(["left", "right", "both"]).default("both"),
  grid_width: z.number().int().min(1).max(64).default(3),
  grid_height: z.number().int().min(1).max(64).default(3),
  pressure: z.array(z.array(z.number())).nonempty(),
  stats: z.record(z.any()).optional(),
  ts: z.string().optional(),
})

export const AssessmentSchema = z.object({
  symptoms: z.record(z.boolean()).optional(),
  mood: z.enum(["good", "okay", "bad"]).optional(),
  notes: z.string().max(2000).optional(),
})

export const PredictionSchema = z.object({
  session_id: z.string().uuid(),
  condition: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  model_version: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
})

export const ReportsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
