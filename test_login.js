const path = require('path');
const fs = require('fs');

// 导入API模块
const apiPath = path.join(__dirname, 'api');
const modulePath = path.join(apiPath, 'module');

// 导入请求函数
const request = require(path.join(apiPath, 'util', 'request.js'));

// 导入各个模块
const captchaSent = require(path.join(modulePath, 'captcha_sent.js'));
const captchaVerify = require(path.join(modulePath, 'captcha_verify.js'));
const loginCellphone = require(path.join(modulePath, 'login_cellphone.js'));

// 测试配置
const testConfig = {
  phone: '', // 在这里填入测试手机号
  countrycode: '86',
  captcha: '', // 在这里填入收到的验证码
};

// 发送验证码
async function sendCaptcha(phone) {
  try {
    const result = await captchaSent({ phone, ctcode: '86' }, request);
    console.log('验证码发送结果:', result.body);
    return result;
  } catch (error) {
    console.error('发送验证码失败:', error);
    return null;
  }
}

// 验证验证码
async function verifyCaptcha(phone, captcha) {
  try {
    const result = await captchaVerify({ phone, captcha, ctcode: '86' }, request);
    console.log('验证码验证结果:', result.body);
    return result;
  } catch (error) {
    console.error('验证验证码失败:', error);
    return null;
  }
}

// 使用验证码登录
async function loginWithCaptcha(phone, captcha, countrycode = '86') {
  try {
    const result = await loginCellphone({ 
      phone, 
      captcha,
      countrycode 
    }, request);
    
    console.log('登录结果:', {
      code: result.body.code,
      message: result.body.message || result.body.msg,
      hasProfile: !!result.body.profile,
      hasCookie: !!result.cookie
    });
    
    if (result.body.code === 200) {
      console.log('登录成功!');
      console.log('用户ID:', result.body.profile?.userId);
      console.log('昵称:', result.body.profile?.nickname);
      // 保存cookie供后续使用
      if (result.cookie) {
        fs.writeFileSync('cookie.txt', result.cookie.join(';'), 'utf-8');
        console.log('Cookie已保存到cookie.txt');
      }
    }
    
    return result;
  } catch (error) {
    console.error('登录失败:', error);
    return null;
  }
}

// 主测试流程
async function main() {
  console.log('=== 网易云音乐API登录测试 ===');
  console.log('API已更新为最新版本，使用eapi加密');
  console.log('');
  
  // 如果需要交互式输入，可以使用readline
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  try {
    // 获取手机号
    const phone = await question('请输入手机号: ');
    
    // 发送验证码
    console.log('\\n正在发送验证码...');
    const sendResult = await sendCaptcha(phone);
    
    if (sendResult && sendResult.body.code === 200) {
      // 获取验证码
      const captcha = await question('请输入收到的验证码: ');
      
      // 验证并登录
      console.log('\\n正在登录...');
      const loginResult = await loginWithCaptcha(phone, captcha);
      
      if (loginResult && loginResult.body.code === 200) {
        console.log('\\n✅ 登录成功！');
      } else {
        console.log('\\n❌ 登录失败，请检查日志');
      }
    } else {
      console.log('\\n❌ 发送验证码失败');
    }
  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    rl.close();
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  sendCaptcha,
  verifyCaptcha,
  loginWithCaptcha
};