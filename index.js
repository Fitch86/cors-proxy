const express = require('express');  
const cors = require('cors');  
const axios = require('axios');  
  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
app.use(cors());  
app.use(express.json());  
  
// M3U 播放列表解析端点  
app.get('/parse', async (req, res) => {  
  try {  
    const { url } = req.query;  
    if (!url) {  
      return res.status(400).json({ error: 'URL parameter is required' });  
    }  
      
    const response = await axios.get(url, {  
      timeout: 10000,  
      headers: {  
        'User-Agent': 'IPTVnator/1.0'  
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
