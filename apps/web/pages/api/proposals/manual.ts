import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSession({ req });
  if (!session?.accessToken) return res.status(401).end();
  const base = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = `${base}/proposals/manual`;
  const r = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(req.body),
  });
  const body = await r.json();
  res.status(r.status).json(body);
}
