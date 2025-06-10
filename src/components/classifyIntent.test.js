import { classifyIntent } from './VoiceConfirmation';

describe('classifyIntent function', () => {
  it('should classify "确认" as CONFIRM intent', () => {
    expect(classifyIntent('确认')).toBe('CONFIRM');
    expect(classifyIntent('是的')).toBe('CONFIRM');
    expect(classifyIntent('好的')).toBe('CONFIRM');
    expect(classifyIntent('ok')).toBe('CONFIRM');
    expect(classifyIntent('yes')).toBe('CONFIRM');
  });
  
  it('should classify "取消" as CANCEL intent', () => {
    expect(classifyIntent('取消')).toBe('CANCEL');
    expect(classifyIntent('不要')).toBe('CANCEL');
    expect(classifyIntent('否')).toBe('CANCEL');
    expect(classifyIntent('no')).toBe('CANCEL');
  });
  
  it('should classify empty string as empty string', () => {
    expect(classifyIntent('')).toBe('');
  });
  
  it('should classify other responses as RETRY intent', () => {
    expect(classifyIntent('谢谢')).toBe('RETRY');
    expect(classifyIntent('hello')).toBe('RETRY');
  });
}); 