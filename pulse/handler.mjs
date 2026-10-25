// Pulse: a tiny self-hosted visit counter. POST counts a page view; GET ?key=... returns the stats
// for the hidden /stats page. Visitors are a salted hash of their IP, never the IP itself.
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createHash } from "node:crypto";

const { TABLE, KEY } = process.env;
const ddb = new DynamoDBClient({});
// A visitor past this many views in a day is a script, not a person; stop counting them
const IP_CAP = 300;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

// Days roll over at Central time midnight, where Jonathan is
const day = (offset = 0) => new Date(Date.now() - offset * 86400e3).toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

const add = (pk, sk, extra = {}) =>
  ddb.send(
    new UpdateItemCommand({
      TableName: TABLE,
      Key: { pk: { S: pk }, sk: { S: sk } },
      UpdateExpression: "ADD n :one" + (extra.ttl ? " SET expires = if_not_exists(expires, :exp)" : ""),
      ExpressionAttributeValues: { ":one": { N: "1" }, ...(extra.ttl && { ":exp": { N: String(extra.ttl) } }) },
      ReturnValues: "UPDATED_NEW",
    })
  );

const hit = async (event) => {
  let path = "/", ref = "";
  try {
    ({ path = "/", ref = "" } = JSON.parse(event.body || "{}"));
  } catch {}
  path = String(path).slice(0, 120);
  // Only the referring site's host matters, and our own pages don't count as referrers
  try {
    ref = new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    ref = "";
  }
  if (["jonathanbw.me", "jbw9.github.io"].includes(ref)) ref = "";

  const today = day();
  const pk = `DAY#${today}`;
  const ip = event.requestContext?.http?.sourceIp || "unknown";
  const visitor = createHash("sha256").update(ip + KEY + today).digest("hex").slice(0, 16);
  // The per-visitor row only dedups today's count, so it expires after two days
  const seen = await add(pk, `V#${visitor}`, { ttl: Math.floor(Date.now() / 1000) + 2 * 86400 });
  const n = Number(seen.Attributes.n.N);
  if (n > IP_CAP) return { statusCode: 204 };

  await Promise.all([
    add(pk, "VIEWS"),
    n === 1 && add(pk, "UNIQUES"),
    add(pk, `P#${path}`),
    ref && add(pk, `R#${ref}`),
  ]);
  return { statusCode: 204 };
};

const stats = async (q) => {
  if (!KEY || q.key !== KEY) return json(401, { error: "bad key" });
  const days = Math.min(Number(q.days) || 30, 90);
  const rows = await Promise.all(
    Array.from({ length: days }, async (_, i) => {
      const date = day(i);
      const items = [];
      let start;
      do {
        const r = await ddb.send(
          new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ":pk": { S: `DAY#${date}` } },
            ExclusiveStartKey: start,
          })
        );
        items.push(...r.Items);
        start = r.LastEvaluatedKey;
      } while (start);
      return { date, items };
    })
  );

  const paths = {}, refs = {};
  const series = rows.reverse().map(({ date, items }) => {
    const out = { date, views: 0, uniques: 0 };
    for (const it of items) {
      const sk = it.sk.S, n = Number(it.n.N);
      if (sk === "VIEWS") out.views = n;
      else if (sk === "UNIQUES") out.uniques = n;
      else if (sk.startsWith("P#")) paths[sk.slice(2)] = (paths[sk.slice(2)] || 0) + n;
      else if (sk.startsWith("R#")) refs[sk.slice(2)] = (refs[sk.slice(2)] || 0) + n;
    }
    return out;
  });
  return json(200, { series, paths, refs });
};

export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  if (method === "POST") return hit(event);
  if (method === "GET") return stats(event.queryStringParameters || {});
  return json(405, { error: "GET or POST" });
};
