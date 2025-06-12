import { formatDate, formatAmount } from '../format';

describe('格式化工具函数测试', () => {
  describe('formatDate 函数', () => {
    it('应该使用默认格式（YYYY-MM-DD）格式化日期', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      expect(formatDate(date)).toBe('2023-01-15');
    });

    it('应该使用自定义格式格式化日期', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2023');
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2023年01月15日');
    });

    it('应该正确处理月份和日期的前导零', () => {
      const date1 = new Date(2023, 0, 5); // 2023-01-05
      expect(formatDate(date1)).toBe('2023-01-05');
      
      const date2 = new Date(2023, 11, 25); // 2023-12-25
      expect(formatDate(date2)).toBe('2023-12-25');
    });
  });

  describe('formatAmount 函数', () => {
    it('应该使用默认配置（2位小数）格式化金额', () => {
      expect(formatAmount(1234.5)).toBe('1,234.50');
      expect(formatAmount(1000)).toBe('1,000.00');
    });

    it('应该使用指定位数格式化小数', () => {
      expect(formatAmount(1234.5678, 4)).toBe('1,234.5678');
      expect(formatAmount(1234.5, 0)).toBe('1,235');
      expect(formatAmount(1234.5, 1)).toBe('1,234.5');
    });

    it('应该正确处理负数', () => {
      expect(formatAmount(-1234.5)).toBe('-1,234.50');
      expect(formatAmount(-1000, 0)).toBe('-1,000');
    });
  });
}); 