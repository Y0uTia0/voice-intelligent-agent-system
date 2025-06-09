/**
 * 模拟用户认证状态
 * 用于开发环境下快速设置认证信息
 */
export function setupMockAuth() {
  if (!localStorage.getItem('auth_token')) {
    console.log('setupMockAuth: 设置模拟认证状态...');
    
    // 设置模拟认证信息
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('user_id', '1'); // 确保是字符串格式，apiClient会将其转换为数字
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('user_role', 'user');
    
    console.log('setupMockAuth: 模拟认证信息设置完成');
    console.log('setupMockAuth: token =', localStorage.getItem('auth_token'));
    console.log('setupMockAuth: user_id =', localStorage.getItem('user_id'));
    
    return true;
  }
  
  console.log('setupMockAuth: 已存在认证信息，无需设置');
  console.log('setupMockAuth: token =', localStorage.getItem('auth_token'));
  console.log('setupMockAuth: user_id =', localStorage.getItem('user_id'));
  
  return false;
}

export function clearMockAuth() {
  console.log('clearMockAuth: 清除模拟认证信息');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');
  localStorage.removeItem('user_role');
} 