exports.handler = async (event, context) => {  
  const { url } = event.queryStringParameters;  
    
  if (!url) {  
    return {  
      statusCode: 400,  
      headers: {  
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Headers': 'Content-Type',  
      },  
      body: JSON.stringify({ error: 'URL parameter is required' })  
    };  
  }  
  
  try {  
    const axios = require('axios');  
    const response = await axios.get(url, {  
      timeout: 10000,  
      headers: { 'User-Agent': 'IPTVnator/1.0' }  
    });  
      
    return {  
      statusCode: 200,  
      headers: {  
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Headers': 'Content-Type',  
      },  
      body: JSON.stringify({ payload: response.data })  
    };  
  } catch (error) {  
    return {  
      statusCode: 500,  
      headers: {  
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Headers': 'Content-Type',  
      },  
      body: JSON.stringify({   
        status: error.response?.status || 500,  
        message: error.message   
      })  
    };  
  }  
};
