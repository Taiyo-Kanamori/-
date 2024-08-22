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
  //時間記録
  if (req.method === "POST" && url.pathname === "/record-time") {
    try {
      const { type, time } = await req.json();
      const timestamp = new Date().toISOString();
      const key = [`${timestamp}-${type}Times`];
      await kv.set(key, time);

      return new Response(JSON.stringify({ message: `${time},${type}時間が記録されました。` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      
    } catch (error) {
      console.error("Error processing request:", error.message);
      return new Response(JSON.stringify({ message: "サーバーエラーが発生しました。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    
  }
  //時間取得
  if (req.method === "GET" && url.pathname === "/get-times") {
      const iterator = kv.list(); // プレフィックスを設定しない場合、全てのキーを取得
      const times = [];
      for await (const { key, value } of iterator) {
        times.push({ key, value });
      }

      return new Response(JSON.stringify(times), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  }

  //記録削除
  /*
  if (req.method === "POST" && url.pathname === "/delete-all") {
    try {
      // キーの取得と削除処理
      const iterator = kv.list({ prefix: '' }); // プレフィックスが空で全てのキーを取得
      for await (const { key } of iterator) {
        await kv.delete(key);
      }

      return new Response(JSON.stringify({ message: "すべての時間が削除されました。" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    catch (error) {
      console.error("Error processing request:", error.message);
      return new Response(JSON.stringify({ message: "サーバーエラーが発生しました。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  */

  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  })
})
