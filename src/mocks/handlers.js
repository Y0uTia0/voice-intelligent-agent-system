import { http, HttpResponse } from 'msw';

// 明确记录初始化
console.log('MSW handlers 正在初始化...');

// 模拟用户数据库
const mockUsers = {
  // 普通用户
  'user': {
    user_id: '1',
    username: 'user',
    password: 'password',
    role: 'user'
  },
  // 开发者用户
  'developer': {
    user_id: '2',
    username: 'developer',
    password: 'password',
    role: 'developer'
  },
  // 管理员用户
  'admin': {
    user_id: '3',
    username: 'admin',
    password: 'password',
    role: 'admin'
  }
};

// 在handlers对象前导出用户数据，便于测试
export const testUsers = mockUsers;

export const handlers = [
  // 模拟登录API - 使用通配符匹配任何auth/token请求
  http.post('**/auth/token', async ({ request }) => {
    console.log('MSW: 拦截到登录API调用');
    console.log('MSW: 请求类型:', request.headers.get('Content-Type'));
    console.log('MSW: 请求URL:', request.url);
    
    try {
      // 获取表单数据
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');
      
      console.log(`MSW: 尝试登录，用户名: ${username}, 密码: ${password}`);
      
      // 检查用户是否存在
      const user = mockUsers[username];
      if (user && user.password === password) {
        // 登录成功
        console.log(`MSW: 登录成功，用户角色: ${user.role}`);
        
        const response = {
          access_token: `mock-jwt-token-${user.role}`,
          token_type: 'bearer',
          expires_in: 604800,
          user_id: user.user_id,
          username: user.username,
          role: user.role
        };
        
        console.log('MSW: 返回登录响应:', response);
        return HttpResponse.json(response, { status: 200 });
      } else {
        // 登录失败
        console.log('MSW: 登录失败，用户名或密码不正确');
        return HttpResponse.json({
          detail: '用户名或密码不正确'
        }, { status: 401 });
      }
    } catch (error) {
      console.error('MSW: 登录API处理错误', error);
      
      // 尝试直接解析JSON以支持不同格式的请求
      try {
        const body = await request.json();
        const username = body.username;
        const password = body.password;
        
        console.log(`MSW: 尝试JSON登录，用户名: ${username}, 密码: ${password}`);
        
        const user = mockUsers[username];
        if (user && user.password === password) {
          console.log(`MSW: JSON登录成功，用户角色: ${user.role}`);
          return HttpResponse.json({
            access_token: `mock-jwt-token-${user.role}`,
            token_type: 'bearer',
            expires_in: 604800,
            user_id: user.user_id,
            username: user.username,
            role: user.role
          }, { status: 200 });
        } else {
          console.log('MSW: JSON登录失败，用户名或密码不正确');
          return HttpResponse.json({
            detail: '用户名或密码不正确'
          }, { status: 401 });
        }
      } catch (jsonError) {
        console.error('MSW: 无法解析表单或JSON请求', jsonError);
        
        // 最后尝试文本方式解析（用于调试）
        const text = await request.text();
        console.log('MSW: 请求体原始内容:', text);
        
        // 如果是简单的URL编码形式，尝试手动解析
        if (text.includes('username=') && text.includes('password=')) {
          try {
            const params = new URLSearchParams(text);
            const username = params.get('username');
            const password = params.get('password');
            
            console.log(`MSW: 尝试手动解析登录，用户名: ${username}, 密码: ${password}`);
            
            const user = mockUsers[username];
            if (user && user.password === password) {
              console.log(`MSW: 手动解析登录成功，用户角色: ${user.role}`);
              return HttpResponse.json({
                access_token: `mock-jwt-token-${user.role}`,
                token_type: 'bearer',
                expires_in: 604800,
                user_id: user.user_id,
                username: user.username,
                role: user.role
              }, { status: 200 });
            }
          } catch (e) {
            console.error('MSW: 手动解析表单失败', e);
          }
        }
        
        return HttpResponse.json({
          detail: '登录请求格式错误'
        }, { status: 400 });
      }
    }
  }),
  
  // 模拟注册API
  http.post('http://localhost:8000/v1/api/auth/register', async ({ request }) => {
    console.log('MSW: 拦截到注册API调用');
    
    try {
      const body = await request.json();
      const { username, email, password } = body;
      
      console.log(`MSW: 尝试注册，用户名: ${username}, 邮箱: ${email}`);
      
      // 检查用户名是否已存在
      if (mockUsers[username]) {
        console.log('MSW: 注册失败，用户名已存在');
        return HttpResponse.json({
          detail: '用户名已存在'
        }, { status: 400 });
      }
      
      // 模拟成功注册（但不真正添加到mockUsers中）
      console.log('MSW: 注册成功');
      return HttpResponse.json({
        id: 10,
        username,
        email,
        role: 'user'
      }, { status: 201 });
    } catch (error) {
      console.error('MSW: 注册API处理错误', error);
      return HttpResponse.json({
        detail: '注册请求格式错误'
      }, { status: 400 });
    }
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
  
  // 模拟开发者工具API
  http.get('**/dev/tools', ({ request }) => {
    console.log('MSW: 拦截到获取开发者工具API调用');
    // 检查授权头
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('mock-jwt-token-developer') && !authHeader.includes('mock-jwt-token-admin')) {
      return HttpResponse.json({ error: '无权限访问' }, { status: 403 });
    }
    
    return HttpResponse.json({
      tools: [
        {
          tool_id: 'custom-weather',
          name: '自定义天气服务',
          type: 'http',
          description: '开发者创建的天气服务',
          endpoint: {
            platform: 'generic',
            api_key: 'dev-key',
            app_config: {
              url: 'https://api.example.com/weather',
              method: 'GET'
            }
          },
          request_schema: {
            type: 'object',
            properties: {
              city: {type: 'string'}
            }
          }
        }
      ]
    }, { status: 200 });
  }),
  
  // 模拟创建开发者工具API
  http.post('**/dev/tools', async ({ request }) => {
    console.log('MSW: 拦截到创建开发者工具API调用');
    
    // 检查授权头
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('mock-jwt-token-developer') && !authHeader.includes('mock-jwt-token-admin')) {
      return HttpResponse.json({ error: '无权限访问' }, { status: 403 });
    }
    
    try {
      const tool = await request.json();
      console.log('MSW: 创建工具请求体', tool);
      
      return HttpResponse.json({
        ...tool,
        created_at: new Date().toISOString()
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({
        error: '无效的请求格式'
      }, { status: 400 });
    }
  }),
  
  // 模拟删除开发者工具API
  http.delete('**/dev/tools/*', ({ request }) => {
    console.log('MSW: 拦截到删除开发者工具API调用');
    
    // 检查授权头
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('mock-jwt-token-developer') && !authHeader.includes('mock-jwt-token-admin')) {
      return HttpResponse.json({ error: '无权限访问' }, { status: 403 });
    }
    
    return new HttpResponse(null, { status: 204 });
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