import { z } from "zod";
import passwordSchema from "./password";

export const registerSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterPayload = z.infer<typeof registerSchema>;
