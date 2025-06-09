import { http, HttpResponse } from 'msw';

// 明确记录初始化
console.log('MSW handlers 正在初始化...');

export const handlers = [
  // 模拟登录API
  http.post('http://localhost:8000/v1/api/auth/token', async () => {
    console.log('MSW: 拦截到登录API调用');
    return HttpResponse.json({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 604800,
      user_id: 1,
      username: 'testuser',
      role: 'user'
    }, { status: 200 });
  }),
  
  // 改进版意图解析API - 根据不同查询返回不同响应
  http.post('**/interpret', async ({ request }) => {
    console.log('MSW: 拦截到意图解析API调用');
    
    try {
      // 解析请求体
      const body = await request.json();
      console.log('MSW: 意图解析请求体', body);
      
      // 确保请求格式与apiClient的interpret函数匹配
      const query = body.query || body.text || '';
      const userId = body.userId;
      
      console.log('MSW: 解析的参数:', { query, userId });
      
      // 根据查询文本返回不同的响应
      if (query.includes('上海') || query.includes('天气')) {
        console.log('MSW: 识别为天气查询 - 上海');
        return HttpResponse.json({
          type: 'tool_call',
          tool_calls: [{
            tool_id: 'maps_weather',
            parameters: { city: '上海' }
          }],
          confirmText: '您想查询上海的天气吗？',
          sessionId: 'mock-session-123'
        }, { status: 200 });
      } 
      else if (query.includes('北京')) {
        console.log('MSW: 识别为天气查询 - 北京');
        return HttpResponse.json({
          type: 'tool_call',
          tool_calls: [{
            tool_id: 'maps_weather',
            parameters: { city: '北京' }
          }],
          confirmText: '您想查询北京的天气吗？',
          sessionId: 'mock-session-123'
        }, { status: 200 });
      }
      else if (query.includes('广州')) {
        console.log('MSW: 识别为天气查询 - 广州');
        return HttpResponse.json({
          type: 'tool_call',
          tool_calls: [{
            tool_id: 'maps_weather',
            parameters: { city: '广州' }
          }],
          confirmText: '您想查询广州的天气吗？',
          sessionId: 'mock-session-123'
        }, { status: 200 });
      }
      else if (query.includes('翻译')) {
        console.log('MSW: 识别为翻译请求');
        return HttpResponse.json({
          type: 'tool_call',
          tool_calls: [{
            tool_id: 'translate',
            parameters: { text: query.replace('翻译', '').trim() }
          }],
          confirmText: `您想翻译"${query.replace('翻译', '').trim()}"吗？`,
          sessionId: 'mock-session-123'
        }, { status: 200 });
      }
      else {
        // 默认响应 - 无法识别意图
        console.log('MSW: 无法识别的查询');
        return HttpResponse.json({
          type: 'unknown',
          message: '抱歉，我无法理解您的请求',
          confirmText: '您的请求我无法理解，请换个说法试试',
          sessionId: 'mock-session-123'
        }, { status: 200 });
      }
    } catch (err) {
      console.log('MSW: 无法解析请求体', err);
      return HttpResponse.json({
        error: 'Invalid request format',
        message: '请求格式无效'
      }, { status: 400 });
    }
  }),
  
  // 模拟工具执行API - 根据不同工具和参数返回不同结果
  http.post('**/execute', async ({ request }) => {
    console.log('MSW: 拦截到工具执行API调用');
    
    try {
      const body = await request.json();
      console.log('MSW: 工具执行请求体', body);
      
      const { toolId, params } = body;
      
      if (toolId === 'maps_weather') {
        const city = params.city || '未知城市';
        
        if (city === '上海') {
          return HttpResponse.json({
            success: true,
            toolId,
            data: {
              tts_message: '上海今天多云，气温20到28度',
              raw_data: { city, weather: '多云', temp: '20-28°C' }
            },
            sessionId: body.sessionId
          }, { status: 200 });
        } 
        else if (city === '北京') {
          return HttpResponse.json({
            success: true,
            toolId,
            data: {
              tts_message: '北京今天晴天，气温15到25度',
              raw_data: { city, weather: '晴天', temp: '15-25°C' }
            },
            sessionId: body.sessionId
          }, { status: 200 });
        }
        else if (city === '广州') {
          return HttpResponse.json({
            success: true,
            toolId,
            data: {
              tts_message: '广州今天阴天有雨，气温22到30度',
              raw_data: { city, weather: '阴天有雨', temp: '22-30°C' }
            },
            sessionId: body.sessionId
          }, { status: 200 });
        }
        else {
          return HttpResponse.json({
            success: true,
            toolId,
            data: {
              tts_message: `${city}天气数据暂时无法获取`,
              raw_data: { city, weather: '未知', temp: '未知' }
            },
            sessionId: body.sessionId
          }, { status: 200 });
        }
      }
      else if (toolId === 'translate') {
        const text = params.text || '';
        return HttpResponse.json({
          success: true,
          toolId,
          data: {
            tts_message: `"${text}"的翻译结果是"Translation of ${text}"`,
            raw_data: { original: text, translated: `Translation of ${text}` }
          },
          sessionId: body.sessionId
        }, { status: 200 });
      }
      else {
        return HttpResponse.json({
          success: false,
          error: 'Unsupported tool',
          message: `不支持的工具: ${toolId}`
        }, { status: 400 });
      }
    } catch (err) {
      console.log('MSW: 无法解析工具执行请求', err);
      return HttpResponse.json({
        error: 'Invalid request format',
        message: '请求格式无效'
      }, { status: 400 });
    }
  }),
  
  // 模拟工具列表API
  http.get('**/tools', () => {
    console.log('MSW: 拦截到工具列表API调用');
    return HttpResponse.json({
      tools: [
        {
          tool_id: 'maps_weather',
          name: '天气查询',
          type: 'http',
          description: '查询指定城市的天气预报',
          request_schema: {
            type: 'object',
            properties: {
              city: {type: 'string'}
            }
          }
        },
        {
          tool_id: 'translate',
          name: '文本翻译',
          type: 'http',
          description: '翻译指定文本',
          request_schema: {
            type: 'object',
            properties: {
              text: {type: 'string'}
            }
          }
        }
      ]
    }, { status: 200 });
  }),
  
  // 通配符匹配所有未处理的API请求，记录日志并返回404
  http.all('**', async ({ request }) => {
    const url = new URL(request.url);
    console.log(`MSW: 拦截到未处理的${request.method}请求: ${url.pathname}`);
    return HttpResponse.json({
      error: {
        code: 'NOT_FOUND',
        message: `未找到API: ${request.method} ${url.pathname}`
      }
    }, { status: 404 });
  })
];

// 记录初始化完成
console.log(`MSW handlers 初始化完成，共 ${handlers.length} 个处理程序`); 