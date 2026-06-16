export async function onRequest({ request, next }) {
  const url = new URL(request.url)
  const publicAssetPattern = /\.(?:mp4|webm|mov|m4v|ogv|mkv|avi|css|js|json)$/i

  if (url.pathname.startsWith("/videos/") || publicAssetPattern.test(url.pathname)) {
    return next()
  }

  const auth = request.headers.get("Authorization")
  const cred = btoa("ludii:12345678") // 账号密码

  if (!auth || auth !== `Basic ${cred}`) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Pages Protected"' }
    })
  }
  return next()
}
