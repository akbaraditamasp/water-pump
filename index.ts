import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import mqtt from "mqtt";
import z from "zod";

const app = new Hono();
app.get(
  "/",
  zValidator(
    "json",
    z.object({
      event: z.literal("qr.payment"),
      data: z.object({
        status: z.literal("SUCCEEDED"),
        amount: z.number(),
      }),
    })
  ),
  async (c) => {
    const token = c.req.header("X-Callback-Token");
    const {
      data: { amount },
    } = c.req.valid("json");

    if (token !== process.env.XENDIT_CALLBACK_TOKEN)
      return c.json({ error: "Unauthorized" }, 401);

    const mqttClient = await mqtt.connectAsync({
      host: "103.172.204.65",
      port: 1883,
      connectTimeout: 60_000,
      username: "akbar",
      password: "11Agustus!",
    });

    mqttClient.publishAsync("pump", `${Math.floor(amount / 1000) * 5000}`);

    return c.json({
      message: "Success",
    });
  }
);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
