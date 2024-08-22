// https://deno.land/std@0.194.0/http/server.ts?s=serve
import { serve } from 'http/server.ts'
// https://deno.land/std@0.194.0/http/file_server.ts?s=serveDir
import { serveDir } from 'http/file_server.ts'

/**
 * APIリクエストを処理する
 */
const kv = await Deno.openKv();

serve(async(req) => {
  // publicフォルダ内にあるファイルを返す
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/record-time") {
    const { type, time } = await req.json();
    const timestamp = new Date().toISOString();
    const key = `${type}Time_${timestamp}`;

    await kv.set(key, time);

    return new Response(JSON.stringify({ message: `${type}時間が記録されました。` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else if (req.method === "GET" && url.pathname === "/get-times") {
    const wakeTimes = [];
    const sleepTimes = [];

    // "wakeTime_" プレフィックスで保存された全てのエントリーを取得
    for await (const entry of kv.list({ prefix: 'wakeTime_' })) {
      wakeTimes.push(entry.value);
    }

    // "sleepTime_" プレフィックスで保存された全てのエントリーを取得
    for await (const entry of kv.list({ prefix: 'sleepTime_' })) {
     sleepTimes.push(entry.value);
    }

    return new Response(JSON.stringify({ wakeTimes, sleepTimes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }


  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  })
})
