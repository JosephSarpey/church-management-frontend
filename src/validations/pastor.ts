import { z } from "zod";

export const pastorFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  dateAppointed: z.string().min(1, {
    message: "Please select a date of appointment.",
  }),
  currentStation: z.string().min(2, {
    message: "Please enter the current station or branch.",
  }),
});