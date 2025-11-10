import { z } from "zod";

export const createServiceProviderSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to be promoted")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  serviceDescription: z
    .string()
    .nullable()
    .describe("Description of the service provided"),
  availability: z
    .array(
      z
        .object({
          dayOfWeek: z
            .number()
            .min(0)
            .max(6)
            .default(1)
            .describe("Day of the week (0 - Sunday, 6 - Saturday)"),
          startTime: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid start time format (HH:MM)"
            )
            .default("08:00")
            .describe("Start time in HH:MM format"),
          endTime: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid end time format (HH:MM)"
            )
            .default("18:00")
            .describe("End time in HH:MM format"),
          breakStart: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid break start time format (HH:MM)"
            )
            .nullable()
            .describe("Break start time in HH:MM format"),
          breakEnd: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid break end time format (HH:MM)"
            )
            .nullable()
            .describe("Break end time in HH:MM format"),
          slotDuration: z
            .number()
            .min(15, "Slot duration must be at least 15 minutes")
            .max(180, "Slot duration must be at most 180 minutes")
            .default(30)
            .describe("Duration of each service slot in minutes"),
        })
        .superRefine((data, ctx) => {
          const { startTime, endTime, breakStart, breakEnd } = data;

          const [workStartHour, workStartMinute] = startTime
            .split(":")
            .map(Number);
          const [workEndHour, workEndMinute] = endTime.split(":").map(Number);

          const totalWorkStartMinutes = workStartHour * 60 + workStartMinute;
          const totalWorkEndMinutes = workEndHour * 60 + workEndMinute;

          const isEndBeforeStart = totalWorkEndMinutes <= totalWorkStartMinutes;

          if (isEndBeforeStart) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "endTime must be later than startTime",
            });
          }

          const hasBreakStart = !!breakStart;
          const hasBreakEnd = !!breakEnd;

          const hasBreakTimeDefined = hasBreakStart === hasBreakEnd;

          if (!hasBreakTimeDefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Both breakStart and breakEnd must be provided together",
              path: hasBreakStart ? ["breakEnd"] : ["breakStart"],
            });

            return;
          }

          if (hasBreakStart && hasBreakEnd) {
            const [breakStartHour, breakStartMinute] = breakStart
              .split(":")
              .map(Number);
            const [breakEndHour, breakEndMinute] = breakEnd
              .split(":")
              .map(Number);

            const totalBreakStartMinutes =
              breakStartHour * 60 + breakStartMinute;
            const totalBreakEndMinutes = breakEndHour * 60 + breakEndMinute;

            const isBreakOrderInvalid =
              totalBreakEndMinutes <= totalBreakStartMinutes;
            const isBreakStartBeforeWork =
              totalBreakStartMinutes < totalWorkStartMinutes;
            const isBreakEndAfterWork =
              totalBreakEndMinutes > totalWorkEndMinutes;

            if (isBreakOrderInvalid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "breakEnd must be later than breakStart",
                path: ["breakEnd"],
              });
            }

            if (isBreakStartBeforeWork) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "breakStart must be within working hours (>= startTime)",
                path: ["breakStart"],
              });
            }

            if (isBreakEndAfterWork) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "breakEnd must be within working hours (<= endTime)",
                path: ["breakEnd"],
              });
            }
          }
        })
    )
    .min(1, "At least one availability entry is required")
    .superRefine((slots, ctx) => {
      const seenDays = new Set<number>();
      for (let i = 0; i < slots.length; i++) {
        const { dayOfWeek } = slots[i];
        if (seenDays.has(dayOfWeek)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "It is not allowed to repeat the same day of the week.",
            path: [i, "dayOfWeek"],
          });
          return;
        }

        seenDays.add(dayOfWeek);
      }
    })
    .describe("Availability schedule of the service provider"),
});
export type CreateServiceProviderDTO = z.infer<
  typeof createServiceProviderSchema
>;
