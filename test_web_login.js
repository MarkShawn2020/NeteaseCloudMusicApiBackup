const path = require('path');
const fs = require('fs');

// 导入API模块
const apiPath = path.join(__dirname, 'api');
const modulePath = path.join(apiPath, 'module');

// 导入请求函数
const request = require(path.join(apiPath, 'util', 'request.js'));

// 导入Web专用模块
const captchaSentWeb = require(path.join(modulePath, 'captcha_sent_web.js'));
const loginCellphoneWeb = require(path.join(modulePath, 'login_cellphone_web.js'));

// 测试配置
const testConfig = {
  phone: '', // 在这里填入测试手机号
  countrycode: '86',
  captcha: '', // 在这里填入收到的验证码
};

// Web端发送验证码
async function sendWebCaptcha(phone) {
  try {
    console.log('使用Web端接口发送验证码...');
    const result = await captchaSentWeb({ 
      phone, 
      ctcode: '86',
      cookie: {
        os: 'pc',
        appver: '', // Web端不需要appver
        channel: 'netease'
      }
    }, request);
    console.log('验证码发送结果:', result.body);
    return result;
  } catch (error) {
    console.error('发送验证码失败:', error.body || error);
    return null;
  }
}

// 使用Web端验证码登录
async function loginWebWithCaptcha(phone, captcha, countrycode = '86') {
  try {
    console.log('使用Web端接口登录...');
    const result = await loginCellphoneWeb({ 
      phone, 
      captcha,
      countrycode,
      cookie: {
        os: 'pc',
        appver: '', 
        channel: 'netease'
      }
    }, request);
    
    console.log('登录响应:', {
      code: result.body.code,
      message: result.body.message || result.body.msg,
      hasProfile: !!result.body.profile,
      hasCookie: !!result.cookie
    });
    
    if (result.body.code === 8810) {
      console.log('\\n遇到安全检查，可能需要额外验证');
      console.log('重定向URL:', result.body.redirectUrl);
      // 这里可能需要处理额外的验证步骤
    }
    
    if (result.body.code === 200) {
      console.log('\\n✅ 登录成功!');
      console.log('用户ID:', result.body.profile?.userId);
      console.log('昵称:', result.body.profile?.nickname);
      // 保存cookie供后续使用
      if (result.cookie) {
        fs.writeFileSync('cookie_web.txt', result.cookie.join(';'), 'utf-8');
        console.log('Cookie已保存到cookie_web.txt');
      }
    }
    
    return result;
  } catch (error) {
    console.error('登录失败:', error.body || error);
    return null;
  }
}

// 尝试不同的登录方式
async function tryAlternativeLogin(phone, captcha) {
  console.log('\\n尝试备用登录方式...');
  
  // 直接使用weapi，模拟web浏览器行为
  const data = {
    phone: phone,
    captcha: captcha,
    countrycode: '86',
    rememberLogin: 'true'
  };
  
  try {
    const result = await request(
      '/api/login/cellphone',
      data,
      {
        crypto: 'weapi',
        cookie: {
          os: 'pc',
          _ntes_nnid: Date.now().toString() + ',' + Date.now().toString(),
          _ntes_nuid: require('crypto').randomBytes(16).toString('hex'),
        },
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
      }
    );
    
    console.log('备用方式登录结果:', {
      code: result.body.code,
      message: result.body.message || result.body.msg
    });
    
    return result;
  } catch (error) {
    console.error('备用方式失败:', error.body || error);
    return null;
  }
}

// 主测试流程
async function main() {
  console.log('=== 网易云音乐Web端API登录测试 ===');
  console.log('使用Web端专用接口（支持6位验证码）');
  console.log('');
  
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
    console.log('\\n正在发送验证码（Web端）...');
    const sendResult = await sendWebCaptcha(phone);
    
    if (sendResult && (sendResult.body.code === 200 || sendResult.body.data === true)) {
      console.log('✅ 验证码已发送（请注意是否为6位数）');
      
      // 获取验证码
      const captcha = await question('请输入收到的验证码: ');
      console.log(`收到的验证码长度: ${captcha.length}位`);
      
      // 尝试Web端登录
      console.log('\\n正在使用Web端接口登录...');
      let loginResult = await loginWebWithCaptcha(phone, captcha);
      
      // 如果Web端失败，尝试备用方式
      if (!loginResult || loginResult.body.code !== 200) {
        loginResult = await tryAlternativeLogin(phone, captcha);
      }
      
      if (loginResult && loginResult.body.code === 200) {
        console.log('\\n🎉 登录成功！');
      } else {
        console.log('\\n❌ 所有登录方式均失败，请检查：');
        console.log('1. 验证码是否正确');
        console.log('2. 是否需要完成额外的安全验证');
        console.log('3. 网络环境是否正常');
      }
    } else {
      console.log('\\n❌ 发送验证码失败');
      console.log('错误信息:', sendResult?.body);
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
  sendWebCaptcha,
  loginWebWithCaptcha,
  tryAlternativeLogin
};