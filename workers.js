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
