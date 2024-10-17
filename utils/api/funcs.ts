import { NextResponse } from 'next/server';
import { getCurrentURL } from '@/utils/server';
import type { Endpoints } from '.';

export function success<T>(output:T, headers:Headers, stringified:boolean = true) {
  return new NextResponse<typeof output>(
    stringified ? JSON.stringify(output) : output as BodyInit, {
      headers,
      status: 200,
      statusText: 'OK',
    },
  );
}

export function notFound<T>(output:T, headers:Headers, stringified:boolean = true) {
  return new NextResponse<typeof output>(
    stringified ? JSON.stringify(output) : output as BodyInit, {
      headers,
      status: 404,
      statusText: 'Not Found',
    },
  );
}

export function badRequest<T>(output:T, headers:Headers, stringified:boolean = true) {
  return new NextResponse<typeof output>(
    stringified ? JSON.stringify(output) : output as BodyInit, {
      headers,
      status: 400,
      statusText: 'Bad Request',
    },
  );
}

/* ========================================================================== */

export async function api<T extends keyof Endpoints>(path:T, args?:Endpoints[T]['Arguments']) : Promise<Endpoints[T]['Return']> {
  const fullPath = `${await getCurrentURL()}/api/${path.startsWith("/") ? path : '/' + path}`;
  const url = new URL(fullPath);
  if (args)
    Object.keys(args).forEach(key => url.searchParams.set(key, (args as any)[key]));
  const response = await fetch(url);

  return await response.json() as Endpoints[T]['Return'];
}
