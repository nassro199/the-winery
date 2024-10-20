import { NextRequest } from 'next/server';

import { badRequest, notFound, success } from '@/utils';
import { getUserInfo, UserInfo } from '@/utils/api/user/info';

export async function GET(request:NextRequest) {
  const { searchParams: params } = new URL(request.url);

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (params.has('id')) {
    const id = params.get('id')!;
    const res = await getUserInfo('id', id);

    if (res.error)
      return notFound(res.error, headers);

    return success<UserInfo>(res.data, headers);
  }

  if (params.has('username')) {
    const username = params.get('username')!;
    const res = await getUserInfo('identifier', username.toLowerCase());

    if (res.error)
      return notFound(res.error, headers);

    return success<UserInfo>(res.data, headers);
  }

  return badRequest("Missing 'id' or 'username' parameter", headers);
}
