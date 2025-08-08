const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 导入必要的模块
const request = require('./api/util/request.js');
const { cookieToJson } = require('./api/util/index.js');

// 生成设备ID和会话标识
function generateDeviceId() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function generateSessionId() {
  return `${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
}

// 初始化Web会话
async function initWebSession() {
  const sessionData = {
    deviceId: generateDeviceId(),
    sessionId: generateSessionId(),
    _ntes_nuid: crypto.randomBytes(16).toString('hex'),
    _ntes_nnid: `${Date.now()},${Date.now()}`,
    NMTID: crypto.randomBytes(16).toString('hex'),
  };
  
  console.log('初始化Web会话...');
  console.log('设备ID:', sessionData.deviceId);
  
  return sessionData;
}

// Web端发送验证码（完整模拟）
async function sendWebCaptchaComplete(phone, sessionData) {
  const data = {
    cellphone: phone,
    ctcode: '86',
  };
  
  const options = {
    crypto: 'weapi',
    cookie: {
      ...sessionData,
      os: 'pc',
      channel: 'netease',
      appver: '',
    },
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    headers: {
      'Referer': 'https://music.163.com/',
      'Origin': 'https://music.163.com',
    }
  };
  
  try {
    console.log('发送验证码请求到 /weapi/sms/captcha/sent');
    const result = await request('/api/sms/captcha/sent', data, options);
    return result;
  } catch (error) {
    console.error('发送失败:', error);
    return error;
  }
}

// Web端验证码登录（完整模拟）
async function loginWebComplete(phone, captcha, sessionData) {
  const data = {
    phone: phone,
    captcha: captcha,
    countrycode: '86',
    rememberLogin: 'true',
  };
  
  const options = {
    crypto: 'weapi',
    cookie: {
      ...sessionData,
      os: 'pc',
      channel: 'netease',
      appver: '',
    },
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    headers: {
      'Referer': 'https://music.163.com/',
      'Origin': 'https://music.163.com',
    }
  };
  
  try {
    console.log('发送登录请求到 /weapi/login/cellphone');
    const result = await request('/api/login/cellphone', data, options);
    return result;
  } catch (error) {
    console.error('登录失败:', error);
    return error;
  }
}

// 处理安全验证（风控检查）
async function handleSecurityCheck(redirectUrl, sessionData) {
  console.log('\\n检测到安全验证，尝试处理...');
  console.log('验证URL:', redirectUrl);
  
  // 这里可能需要：
  // 1. 访问redirectUrl获取验证参数
  // 2. 完成图形验证码或其他验证
  // 3. 重新尝试登录
  
  // 暂时返回提示信息
  return {
    needManualVerification: true,
    message: '需要在浏览器中完成安全验证',
    url: redirectUrl
  };
}

// 完整的登录流程
async function completeWebLogin() {
  console.log('=== 网易云音乐Web端完整登录流程 ===');
  console.log('模拟浏览器行为，处理安全检查');
  console.log('');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  try {
    // 初始化会话
    const sessionData = await initWebSession();
    
    // 获取手机号
    const phone = await question('\\n请输入手机号: ');
    
    // 发送验证码
    console.log('\\n正在发送验证码...');
    const sendResult = await sendWebCaptchaComplete(phone, sessionData);
    
    console.log('发送结果:', {
      code: sendResult.body?.code,
      data: sendResult.body?.data,
      message: sendResult.body?.message
    });
    
    if (sendResult.body && (sendResult.body.code === 200 || sendResult.body.data === true)) {
      console.log('✅ 验证码已发送');
      console.log('\\n注意：Web端验证码可能是6位数');
      
      // 获取验证码
      const captcha = await question('请输入收到的验证码: ');
      console.log(`验证码长度: ${captcha.length}位`);
      
      // 登录
      console.log('\\n正在登录...');
      const loginResult = await loginWebComplete(phone, captcha, sessionData);
      
      console.log('登录结果:', {
        code: loginResult.body?.code,
        message: loginResult.body?.message || loginResult.body?.msg
      });
      
      if (loginResult.body?.code === 8810) {
        // 处理安全检查
        const securityResult = await handleSecurityCheck(
          loginResult.body.redirectUrl,
          sessionData
        );
        
        if (securityResult.needManualVerification) {
          console.log('\\n⚠️ ', securityResult.message);
          console.log('请在浏览器中访问以下链接完成验证:');
          console.log(securityResult.url);
          console.log('\\n完成验证后，请重新运行此脚本');
        }
      } else if (loginResult.body?.code === 200) {
        console.log('\\n🎉 登录成功！');
        console.log('用户信息:', {
          userId: loginResult.body.profile?.userId,
          nickname: loginResult.body.profile?.nickname
        });
        
        // 保存cookie
        if (loginResult.cookie) {
          const cookieString = loginResult.cookie.join(';');
          fs.writeFileSync('cookie_web_complete.txt', cookieString, 'utf-8');
          console.log('\\nCookie已保存到 cookie_web_complete.txt');
        }
      } else {
        console.log('\\n❌ 登录失败');
        console.log('完整响应:', loginResult.body);
      }
    } else {
      console.log('\\n❌ 发送验证码失败');
      console.log('请检查手机号是否正确');
    }
  } catch (error) {
    console.error('\\n发生错误:', error);
  } finally {
    rl.close();
  }
}

// 导出或运行
if (require.main === module) {
  completeWebLogin();
}

module.exports = {
  initWebSession,
  sendWebCaptchaComplete,
  loginWebComplete,
  handleSecurityCheck,
  completeWebLogin
};