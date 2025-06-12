// ***********************************************
// 自定义命令可以扩展Cypress测试能力
// https://on.cypress.io/custom-commands
// ***********************************************

// 登录命令
Cypress.Commands.add('login', (username, password) => {
  cy.window().then((win) => {
    // 模拟登录API响应
    cy.intercept('POST', '/v1/api/auth/token', {
      statusCode: 200,
      body: {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 604800,
        user_id: 1,
        username: username,
        role: 'user'
      }
    });
    
    // 设置localStorage
    win.localStorage.setItem('auth_token', 'mock-jwt-token');
    win.localStorage.setItem('user_id', '1');
    win.localStorage.setItem('username', username);
    win.localStorage.setItem('user_role', 'user');
  });
});

// 模拟语音API
Cypress.Commands.add('mockSpeechAPI', () => {
  cy.window().then((win) => {
    // 模拟SpeechRecognition
    win.SpeechRecognition = function() {};
    win.SpeechRecognition.prototype.start = cy.stub().as('recognitionStart');
    win.SpeechRecognition.prototype.stop = cy.stub().as('recognitionStop');
    win.SpeechRecognition.prototype.addEventListener = cy.stub();
    win.SpeechRecognition.prototype.onresult = null;
    win.SpeechRecognition.prototype.onerror = null;
    win.SpeechRecognition.prototype.onend = null;
    
    // 保存实例以便后续访问
    win.speechRecognitionInstance = new win.SpeechRecognition();
    
    // 模拟SpeechSynthesis
    win.speechSynthesis = {
      speak: cy.stub().as('speechSynthesisSpeak'),
      cancel: cy.stub().as('speechSynthesisCancel')
    };
    
    win.SpeechSynthesisUtterance = function(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    };
  });
});

// 模拟语音输入
Cypress.Commands.add('simulateVoiceInput', (text) => {
  cy.window().then((win) => {
    // 如果没有开始录音，先点击录音按钮
    cy.get('[data-testid="voice-recorder-button"]').then(($button) => {
      if ($button.text().includes('录音')) {
        cy.wrap($button).click();
      }
    });
    
    // 模拟语音识别结果
    if (win.speechRecognitionInstance && typeof win.speechRecognitionInstance.onresult === 'function') {
      win.speechRecognitionInstance.onresult({
        results: [[{ transcript: text }]]
      });
    }
    
    // 停止录音
    cy.get('[data-testid="voice-recorder-button"]').then(($button) => {
      if ($button.text().includes('停止')) {
        cy.wrap($button).click();
      }
    });
  });
}); 