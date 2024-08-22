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

    try {
      const { type, time } = await req.json();
      // 現在の年、月、日を取得
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0ベースなので+1
      const day = String(now.getDate()).padStart(2, '0');
      
      // 年-月-日 の形式にフォーマット
      //const timestamp = `${year}-${month}-${day}`;
      const key = [`${year}-${month}-${day}-${type}Times`]; 

      // 現在の記録を取得
      const currentData = await kv.get(key);
      const times = currentData?.value || [];

      // 新しい記録を追加
      times.push(time);

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


  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  })
})
