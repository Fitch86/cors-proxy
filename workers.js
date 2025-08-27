// Cloudflare Workers 代码  
addEventListener('fetch', event => {  
  event.respondWith(handleRequest(event.request))  
})  
  
async function handleRequest(request) {  
  // 设置 CORS 头部  
  const corsHeaders = {  
    'Access-Control-Allow-Origin': '*',  
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',  
  }  
  
  // 处理 OPTIONS 预检请求  
  if (request.method === 'OPTIONS') {  
    return new Response(null, { headers: corsHeaders })  
  }  
  
  const url = new URL(request.url)  
    
  // 路由处理  
  if (url.pathname === '/parse') {  
    return handleParse(url, corsHeaders)  
  } else if (url.pathname === '/xtream') {  
    return handleXtream(url, corsHeaders)  
  } else if (url.pathname === '/stalker') {  
    return handleStalker(url, corsHeaders)  
  } else if (url.pathname === '/stream') {  
    return handleStream(request, corsHeaders)  
  }
    
  return new Response('Not Found', { status: 404, headers: corsHeaders })  
}  
  
// M3U 播放列表解析端点  
async function handleParse(url, corsHeaders) {  
  try {  
    const targetUrl = url.searchParams.get('url')  
    if (!targetUrl) {  
      return new Response(  
        JSON.stringify({ error: 'URL parameter is required' }),   
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
      )  
    }  
  
    // 验证 URL 格式  
    try {  
      new URL(targetUrl)  
    } catch (e) {  
      return new Response(  
        JSON.stringify({ error: 'Invalid URL format' }),   
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
      )  
    }  
  
    const response = await fetch(targetUrl, {  
      headers: { 'User-Agent': 'IPTVnator/1.0' },  
      // Cloudflare Workers 没有 timeout 选项，但有内置的 10 秒限制  
    })  
  
    if (!response.ok) {  
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)  
    }  
  
    const data = await response.text()  
      
    return new Response(  
      JSON.stringify({ payload: data }),   
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  } catch (error) {  
    return new Response(  
      JSON.stringify({   
        status: 500,  
        message: error.message   
      }),   
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  }  
}  
  
// Xtream API 代理端点  
async function handleXtream(url, corsHeaders) {  
  try {  
    const targetUrl = url.searchParams.get('url')  
    if (!targetUrl) {  
      return new Response(  
        JSON.stringify({ error: 'URL parameter is required' }),   
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
      )  
    }  
  
    const params = new URLSearchParams()  
      
    // 复制所有查询参数（除了 url）  
    for (const [key, value] of url.searchParams) {  
      if (key !== 'url') {  
        params.append(key, value)  
      }  
    }  
  
    const fullUrl = `${targetUrl}?${params.toString()}`  
    const response = await fetch(fullUrl)  
      
    if (!response.ok) {  
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)  
    }  
  
    const data = await response.json()  
      
    return new Response(  
      JSON.stringify({ payload: data }),   
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  } catch (error) {  
    return new Response(  
      JSON.stringify({   
        status: 500,  
        message: error.message   
      }),   
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  }  
}  
  
// Stalker Portal 代理端点  
async function handleStalker(url, corsHeaders) {  
  try {  
    const targetUrl = url.searchParams.get('url')  
    const macAddress = url.searchParams.get('macAddress')  
      
    if (!targetUrl) {  
      return new Response(  
        JSON.stringify({ error: 'URL parameter is required' }),   
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
      )  
    }  
  
    const params = new URLSearchParams()  
      
    for (const [key, value] of url.searchParams) {  
      if (key !== 'url' && key !== 'macAddress') {  
        params.append(key, value)  
      }  
    }  
  
    const fullUrl = `${targetUrl}?${params.toString()}`  
    const headers = {}  
      
    if (macAddress) {  
      headers['Cookie'] = `mac=${macAddress}`  
    }  
  
    const response = await fetch(fullUrl, { headers })  
      
    if (!response.ok) {  
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)  
    }  
  
    const data = await response.json()  
      
    return new Response(  
      JSON.stringify({ payload: data }),   
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  } catch (error) {  
    return new Response(  
      JSON.stringify({   
        status: 500,  
        message: error.message   
      }),   
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  }  
}

// 视频流代理端点  
async function handleStream(request, corsHeaders) {  
  try {  
    const url = new URL(request.url)  
    const targetUrl = url.searchParams.get('url')  
      
    if (!targetUrl) {  
      return new Response(  
        JSON.stringify({ error: 'URL parameter is required' }),  
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
      )  
    }  
  
    // 构建请求头，转发重要的HTTP头  
    const requestHeaders = {}  
      
    // 转发User-Agent  
    const userAgent = request.headers.get('User-Agent') || 'IPTVnator/1.0'  
    requestHeaders['User-Agent'] = userAgent  
      
    // 转发Referer  
    const referer = request.headers.get('Referer')  
    if (referer) {  
      requestHeaders['Referer'] = referer  
    }  
      
    // 转发Origin  
    const origin = request.headers.get('Origin')  
    if (origin) {  
      requestHeaders['Origin'] = origin  
    }  
      
    // 转发Range请求（用于视频流的分段加载）  
    const range = request.headers.get('Range')  
    if (range) {  
      requestHeaders['Range'] = range  
    }  
  
    const response = await fetch(targetUrl, {  
      method: request.method,  
      headers: requestHeaders  
    })  
  
    if (!response.ok) {  
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)  
    }  
  
    // 构建响应头  
    const responseHeaders = { ...corsHeaders }  
      
    // 转发重要的响应头  
    const contentType = response.headers.get('Content-Type')  
    if (contentType) {  
      responseHeaders['Content-Type'] = contentType  
    }  
      
    const contentLength = response.headers.get('Content-Length')  
    if (contentLength) {  
      responseHeaders['Content-Length'] = contentLength  
    }  
      
    const acceptRanges = response.headers.get('Accept-Ranges')  
    if (acceptRanges) {  
      responseHeaders['Accept-Ranges'] = acceptRanges  
    }  
      
    const contentRange = response.headers.get('Content-Range')  
    if (contentRange) {  
      responseHeaders['Content-Range'] = contentRange  
    }  
  
    return new Response(response.body, {  
      status: response.status,  
      headers: responseHeaders  
    })  
      
  } catch (error) {  
    return new Response(  
      JSON.stringify({  
        status: 500,  
        message: error.message  
      }),  
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }  
    )  
  }  
}
