import { Groq } from "groq-sdk";

export interface DeliveryOrder {
  orderId: string;
  address: string;
  area: string;
  items: number;
}

export interface DeliveryBatch {
  batchId: string;
  orders: DeliveryOrder[];
  estimatedTime: string;
  route: string[];
  area: string;
}

export interface OptimiseResult {
  batches: DeliveryBatch[];
  totalEstimatedTime: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function optimiseDelivery(
  orders: DeliveryOrder[],
  _slots: unknown[],
): Promise<OptimiseResult> {
  try {
    if (orders.length === 0) {
      return { batches: [], totalEstimatedTime: "0 min" };
    }

    const prompt = `You are a delivery route optimiser for a food delivery service in Thrissur, Kerala, India.

Given these orders with their areas, group them into efficient delivery batches based on geographic proximity. Each batch should contain orders from the same or nearby areas.

Orders:
${JSON.stringify(orders, null, 2)}

Rules:
- Group orders by area proximity
- Each batch should have 2-5 orders
- Assign a realistic estimated delivery time (e.g. "30-45 min")
- Order the route within each batch logically
- Return ONLY valid JSON with no markdown formatting

Return JSON in this exact format:
{
  "batches": [
    {
      "batchId": "batch-1",
      "orders": [{"orderId": "...", "address": "...", "area": "...", "items": 0}],
      "estimatedTime": "30-45 min",
      "route": ["address 1", "address 2"],
      "area": "area name"
    }
  ],
  "totalEstimatedTime": "60-90 min"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return fallbackOptimise(orders);
    }

    const parsed = JSON.parse(content) as {
      batches: DeliveryBatch[];
      totalEstimatedTime: string;
    };

    if (!parsed.batches || !Array.isArray(parsed.batches)) {
      return fallbackOptimise(orders);
    }

    return parsed;
  } catch {
    return fallbackOptimise(orders);
  }
}

function fallbackOptimise(orders: DeliveryOrder[]): OptimiseResult {
  const areaMap = new Map<string, DeliveryOrder[]>();

  for (const order of orders) {
    const existing = areaMap.get(order.area) ?? [];
    existing.push(order);
    areaMap.set(order.area, existing);
  }

  const batches: DeliveryBatch[] = [];
  let batchIndex = 1;

  for (const entry of Array.from(areaMap.entries())) {
    const [area, areaOrders] = entry;
    const route = areaOrders.map((o) => o.address);
    batches.push({
      batchId: `batch-${batchIndex}`,
      orders: areaOrders,
      estimatedTime: `${30 + areaOrders.length * 10}-${45 + areaOrders.length * 10} min`,
      route,
      area,
    });
    batchIndex++;
  }

  const totalMinutes = batches.reduce((sum, b) => {
    const match = b.estimatedTime.match(/(\d+)/);
    return sum + (match ? Number.parseInt(match[1], 10) : 30);
  }, 0);

  return {
    batches,
    totalEstimatedTime: `${totalMinutes}-${totalMinutes + batches.length * 15} min`,
  };
}
