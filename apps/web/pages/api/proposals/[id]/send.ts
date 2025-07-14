import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSession({ req });
  if (!session?.accessToken) return res.status(401).end();
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/proposals/${req.query.id}/send`;
  const r = await fetch(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const body = await r.json();
  res.status(r.status).json(body);
}
