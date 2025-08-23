const express = require('express');  
const cors = require('cors');  
const axios = require('axios');  
  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
// 配置 CORS 允许所有来源  
app.use(cors({  
  origin: '*',  
  methods: ['GET', 'POST', 'OPTIONS'],  
  allowedHeaders: ['Content-Type', 'Authorization']  
}));  
  
app.use(express.json());  
  
// M3U 播放列表解析端点  
app.get('/parse', async (req, res) => {  
  // 手动设置 CORS 头部作为备用  
  res.header('Access-Control-Allow-Origin', '*');  
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Content-Type');  
    
  try {  
    const { url } = req.query;  
    if (!url) {  
      return res.status(400).json({ error: 'URL parameter is required' });  
    }  
      
    // 验证 URL 格式  
    try {  
      new URL(url);  
    } catch (e) {  
      return res.status(400).json({ error: 'Invalid URL format' });  
    }  
      
    const response = await axios.get(url, {  
      timeout: 10000,  
      headers: { 'User-Agent': 'IPTVnator/1.0' }  
    });  
      
    res.json({ payload: response.data });  
  } catch (error) {  
    res.status(500).json({   
      status: error.response?.status || 500,  
      message: error.message   
    });  
  }  
});  
  
// Xtream API 代理端点  
app.get('/xtream', async (req, res) => {  
  try {  
    const { url, ...params } = req.query;  
    const response = await axios.get(url, { params });  
    res.json({ payload: response.data });  
  } catch (error) {  
    res.status(500).json({   
      status: error.response?.status || 500,  
      message: error.message   
    });  
  }  
});  
  
// Stalker Portal 代理端点  
app.get('/stalker', async (req, res) => {  
  try {  
    const { url, macAddress, ...params } = req.query;  
    const response = await axios.get(url, {  
      params,  
      headers: {  
        'Cookie': `mac=${macAddress}`  
      }  
    });  
    res.json({ payload: response.data });  
  } catch (error) {  
    res.status(500).json({   
      status: error.response?.status || 500,  
      message: error.message   
    });  
  }  
});  
  
app.listen(PORT, () => {  
  console.log(`CORS proxy server running on port ${PORT}`);  
});
