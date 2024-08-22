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
      const timestamp = new Date(time);
      const year = String(timestamp.getFullYear());
      const month = String(timestamp.getMonth() + 1); // 月は0から始まるので +1
      const day = String(timestamp.getDate());
      const clockTime = timestamp.toTimeString().split(' ')[0]; // HH:MM:SS形式
      const key = [year,month,day,type];
      await kv.set(key, clockTime);

      return new Response(JSON.stringify({ message: `${clockTime},${type}時間が記録されました。` }), {
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
    try{
      const iterator = kv.list({ prefix: [] });
      const times = [];
      console.log(iterator);
      for await (const { key, value } of iterator) {
        key = key.join('-');//結合
        times.push({ key, value });
      }


      return new Response(JSON.stringify(times), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }catch (error) {
      console.error("Error fetching times:", error.message);
      return new Response(JSON.stringify({ message: "サーバーエラーが発生しました。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  //記録削除
  if (req.method === "POST" && url.pathname === "/delete-all") {
    try {
      // キーの取得と削除処理
      const iterator = kv.list({ prefix: [] });
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


  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  })
})
