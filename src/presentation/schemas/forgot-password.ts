import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export default emailSchema;

export type ForgotPasswordPayload = z.infer<typeof emailSchema>;
