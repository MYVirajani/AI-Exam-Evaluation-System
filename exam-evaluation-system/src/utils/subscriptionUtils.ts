// src/utils/subscriptionUtils.ts

import { prisma } from "@/lib/prisma";


/**
 * Returns a list of active model_ids for a given educator.
 *
 * @param educatorId - The educator user_id
 * @returns Promise<string[]> - list of model_ids
 */
export async function getActiveModelIdsByEducator(educatorId: string): Promise<string[]> {
  const query = `
    SELECT DISTINCT pp.model_id
    FROM "Subscription" s
    JOIN "Pricing_Plan" pp
      ON s.pricing_plan_id = pp.pricing_plan_id
    WHERE s.educator_id = $1
      AND s.status = 'ACTIVE';
  `;

  const result = await prisma.$queryRawUnsafe<{ model_id: string }[]>(query, educatorId);

  return result.map((row) => row.model_id);
}
