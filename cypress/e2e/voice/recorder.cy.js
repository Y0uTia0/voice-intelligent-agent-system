describe('语音录制功能', () => {
  beforeEach(() => {
    // 登录
    cy.intercept('POST', '/v1/api/auth/token', {
      statusCode: 200,
      body: {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 604800,
        user_id: 1,
        username: 'testuser',
        role: 'user'
      }
    }).as('loginAPI');
    
    // 访问登录页面并登录
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // 等待登录完成并跳转到首页
    cy.wait('@loginAPI');
    cy.visit('/');
    
    // 模拟浏览器语音API
    cy.window().then((win) => {
      win.SpeechRecognition = function() {};
      win.SpeechRecognition.prototype.start = cy.stub().as('recognitionStart');
      win.SpeechRecognition.prototype.stop = cy.stub().as('recognitionStop');
      win.SpeechRecognition.prototype.addEventListener = cy.stub();
      
      // 保存实例以便后续访问
      win.speechRecognitionInstance = new win.SpeechRecognition();
    });
  });
  
  it('应正确显示录音按钮', () => {
    cy.get('[data-testid="voice-recorder-button"]').should('be.visible');
    cy.get('[data-testid="voice-recorder-button"]').should('have.text', '录音');
  });
  
  it('点击按钮应开始录音', () => {
    cy.get('[data-testid="voice-recorder-button"]').click();
    
    // 验证调用了语音API的start方法
    cy.get('@recognitionStart').should('have.been.called');
    
    // 验证按钮状态变化
    cy.get('[data-testid="voice-recorder-button"]').should('have.text', '停止');
    cy.get('[data-testid="voice-recorder-button"]').should('have.class', 'recording');
  });
  
  it('再次点击按钮应停止录音', () => {
    // 先开始录音
    cy.get('[data-testid="voice-recorder-button"]').click();
    
    // 再停止录音
    cy.get('[data-testid="voice-recorder-button"]').click();
    
    // 验证调用了语音API的stop方法
    cy.get('@recognitionStop').should('have.been.called');
    
    // 验证按钮状态恢复
    cy.get('[data-testid="voice-recorder-button"]').should('have.text', '录音');
    cy.get('[data-testid="voice-recorder-button"]').should('not.have.class', 'recording');
  });
  
  it('模拟语音识别结果应正确处理', () => {
    // 模拟API响应
    cy.intercept('POST', '/v1/api/interpret', {
      statusCode: 200,
      body: {
        type: 'tool_call',
        tool_calls: [{
          tool_id: 'maps_weather',
          parameters: { city: '上海' }
        }],
        confirmText: '您想查询上海的天气吗？',
        sessionId: 'test-session-123'
      }
    }).as('interpretAPI');
    
    cy.window().then((win) => {
      // 开始录音
      cy.get('[data-testid="voice-recorder-button"]').click();
      
      // 设置onresult回调
      win.speechRecognitionInstance.onresult = function(event) {};
      
      // 模拟语音识别结果
      const fakeEvent = {
        results: [[{ transcript: '查询上海天气' }]]
      };
      win.speechRecognitionInstance.onresult(fakeEvent);
      
      // 停止录音
      cy.get('[data-testid="voice-recorder-button"]').click();
      
      // 等待API调用
      cy.wait('@interpretAPI');
      
      // 验证进入意图解析状态
      cy.get('[data-testid="status-bar"]').should('contain', '正在理解您的意图');
    });
  });
}); 