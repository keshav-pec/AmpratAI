import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const URI = process.env.MONGODB_URI;
const DOC_ID = process.env.AMPRAT_SYNC_TOKEN || 'default';

// Cached across hot reloads and warm lambdas.
declare global {
  // eslint-disable-next-line no-var
  var __ampratMongo: Promise<unknown> | undefined;
}

async function collection() {
  if (!URI) return null;
  const { MongoClient } = await import('mongodb');
  if (!global.__ampratMongo) {
    global.__ampratMongo = new MongoClient(URI).connect();
  }
  const client = (await global.__ampratMongo) as InstanceType<typeof MongoClient>;
  return client.db('amprat').collection('progress');
}

export async function GET() {
  try {
    const col = await collection();
    if (!col) return NextResponse.json(null);
    const doc = await col.findOne({ _id: DOC_ID as never });
    if (!doc) return NextResponse.json(null);
    const { _id, ...rest } = doc as Record<string, unknown>;
    void _id;
    return NextResponse.json(rest);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: Request) {
  try {
    const col = await collection();
    if (!col) return NextResponse.json({ saved: false, reason: 'no database configured' });
    const body = await req.json();
    await col.updateOne(
      { _id: DOC_ID as never },
      { $set: { ...body, updatedAt: Date.now() } },
      { upsert: true },
    );
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ saved: false });
  }
}
