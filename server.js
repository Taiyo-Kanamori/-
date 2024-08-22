// https://deno.land/std@0.194.0/http/server.ts?s=serve
import { serve } from 'http/server.ts'
// https://deno.land/std@0.194.0/http/file_server.ts?s=serveDir
import { serveDir } from 'http/file_server.ts'

/**
 * APIリクエストを処理する
 */
const kv = new  DEnoKV();

serve(async(req) => {
  // publicフォルダ内にあるファイルを返す
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/record-time") {
    const kv = await Deno.openKv();
    console.log(kv);

    const{type,time} = await req.json();
    
    if (type === "wake") {
      await kv.set("wakeTime", time);
    } else if (type === "sleep") {
      await kv.set("sleepTime", time);
    }

    return new Response(JSON.stringify({ message: `${type}時間が記録されました。` }), {
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
