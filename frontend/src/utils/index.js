// 通用工具函数

// 存储相关工具
const storage = {
  // 设置本地存储
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage set error:', error);
    }
  },
  
  // 获取本地存储
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('localStorage get error:', error);
      return defaultValue;
    }
  },
  
  // 删除本地存储
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage remove error:', error);
    }
  },
  
  // 清空本地存储
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage clear error:', error);
    }
  }
};

// 主题相关工具
const themeUtils = {
  // 保存主题到本地存储
  saveTheme(theme) {
    storage.set('app_theme', theme);
  },
  
  // 获取本地存储的主题
  getSavedTheme() {
    return storage.get('app_theme', 'light');
  },
  
  // 应用主题到DOM
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  // 初始化主题
  initTheme() {
    const savedTheme = this.getSavedTheme();
    this.applyTheme(savedTheme);
    return savedTheme;
  }
};

// 时间格式化工具
const timeUtils = {
  // 格式化日期为YYYY-MM-DD
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 格式化日期时间为YYYY-MM-DD HH:mm:ss
  formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },
  
  // 获取相对时间
  getRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < week) {
      return `${Math.floor(diff / day)}天前`;
    } else if (diff < month) {
      return `${Math.floor(diff / week)}周前`;
    } else if (diff < year) {
      return `${Math.floor(diff / month)}个月前`;
    } else {
      return `${Math.floor(diff / year)}年前`;
    }
  }
};

// 字符串工具
const stringUtils = {
  // 截断字符串并添加省略号
  truncate(str, length = 20) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  },
  
  // 去除字符串两端空格
  trim(str) {
    return str ? str.trim() : '';
  },
  
  // 检查字符串是否为空
  isEmpty(str) {
    return !str || str.trim() === '';
  },
  
  // 首字母大写
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // 驼峰命名转短横线命名
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },
  
  // 短横线命名转驼峰命名
  kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }
};

// 数组工具
const arrayUtils = {
  // 数组去重
  unique(arr, key = null) {
    if (!Array.isArray(arr)) return [];
    
    if (key) {
      const map = new Map();
      return arr.filter(item => {
        const value = item[key];
        if (!map.has(value)) {
          map.set(value, true);
          return true;
        }
        return false;
      });
    }
    
    return [...new Set(arr)];
  },
  
  // 数组分组
  groupBy(arr, key) {
    if (!Array.isArray(arr)) return {};
    
    return arr.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },
  
  // 数组排序
  sortBy(arr, key, order = 'asc') {
    if (!Array.isArray(arr)) return [];
    
    return arr.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },
  
  // 随机打乱数组
  shuffle(arr) {
    if (!Array.isArray(arr)) return [];
    
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }
};

// 数字工具
const numberUtils = {
  // 格式化数字为千分位
  formatNumber(num) {
    if (typeof num !== 'number') return num;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  // 格式化数字为货币格式
  formatCurrency(num, currency = '¥') {
    if (typeof num !== 'number') return num;
    return `${currency}${this.formatNumber(num)}`;
  },
  
  // 限制数字范围
  clamp(num, min, max) {
    if (typeof num !== 'number') return num;
    return Math.min(Math.max(num, min), max);
  },
  
  // 生成随机数
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// 验证工具
const validateUtils = {
  // 验证邮箱格式
  isEmail(str) {
    if (!str) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  },
  
  // 验证手机号格式（中国）
  isPhone(str) {
    if (!str) return false;
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(str);
  },
  
  // 验证身份证号格式（中国）
  isIdCard(str) {
    if (!str) return false;
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    return idCardRegex.test(str);
  },
  
  // 验证密码强度
  checkPasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 5);
  }
};

// API请求工具（模拟）
const apiUtils = {
  // 模拟GET请求
  async get(url, params = {}) {
    // 模拟网络延迟
    await this.delay(300);
    
    // 模拟请求成功
    return {
      success: true,
      data: null,
      message: '请求成功'
    };
  },
  
  // 模拟POST请求
  async post(url, data = {}) {
    // 模拟网络延迟
    await this.delay(300);
    
    // 模拟请求成功
    return {
      success: true,
      data: null,
      message: '请求成功'
    };
  },
  
  // 模拟PUT请求
  async put(url, data = {}) {
    // 模拟网络延迟
    await this.delay(300);
    
    // 模拟请求成功
    return {
      success: true,
      data: null,
      message: '请求成功'
    };
  },
  
  // 模拟DELETE请求
  async delete(url, params = {}) {
    // 模拟网络延迟
    await this.delay(300);
    
    // 模拟请求成功
    return {
      success: true,
      data: null,
      message: '请求成功'
    };
  },
  
  // 模拟网络延迟
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 导出所有工具
export {
  storage,
  themeUtils,
  timeUtils,
  stringUtils,
  arrayUtils,
  numberUtils,
  validateUtils,
  apiUtils
};

// 导出默认工具对象
export default {
  storage,
  themeUtils,
  timeUtils,
  stringUtils,
  arrayUtils,
  numberUtils,
  validateUtils,
  apiUtils
};