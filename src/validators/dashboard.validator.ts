import { z } from "zod";

export const dashboardQuerySchema = z.object({
    // how many days back the "over time" chart and range stats cover
    days: z.preprocess(
        (v) => (v === "" ? undefined : v),
        z.coerce.number().int().min(1).max(365).default(30)
    ),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;