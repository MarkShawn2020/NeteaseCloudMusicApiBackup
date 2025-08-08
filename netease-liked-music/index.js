#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import NeteaseClient from './NeteaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

program
  .name('netease-liked-music')
  .description('导出网易云音乐喜欢的歌曲列表')
  .version('1.0.0');

program
  .option('-p, --phone <phone>', '手机号码')
  .option('-w, --password <password>', '密码')
  .option('-u, --uid <uid>', '用户ID (可选，如果不登录直接获取公开的喜欢列表)')
  .option('-s, --server <url>', 'API服务器地址', 'http://localhost:3000')
  .option('-o, --output <file>', '输出文件路径', 'liked-songs.json')
  .option('-f, --fields <fields>', '要导出的字段，用逗号分隔', '')
  .option('--pretty', '格式化JSON输出', false)
  .option('--config <file>', '配置文件路径', '.env')
  .action(async (options) => {
    try {
      const client = new NeteaseClient(options.server);
      
      const phone = options.phone || process.env.NETEASE_PHONE;
      const password = options.password || process.env.NETEASE_PASSWORD;
      const uid = options.uid || process.env.NETEASE_UID;

      if (phone && password) {
        console.log('正在登录...');
        const loginResult = await client.login(phone, password);
        if (!loginResult.success) {
          console.error('登录失败:', loginResult.error);
          process.exit(1);
        }
        console.log(`登录成功! 昵称: ${loginResult.nickname}`);
      } else if (uid) {
        console.log(`使用用户ID: ${uid}`);
        client.userId = uid;
      } else {
        console.error('错误: 需要提供登录凭据（手机号和密码）或用户ID');
        console.error('可以通过命令行参数或环境变量提供');
        console.error('示例: node index.js -p 13800138000 -w yourpassword');
        console.error('或设置环境变量: NETEASE_PHONE, NETEASE_PASSWORD, NETEASE_UID');
        process.exit(1);
      }

      const fields = options.fields ? options.fields.split(',').map(f => f.trim()) : null;
      
      if (fields && fields.length > 0) {
        console.log('自定义导出字段:', fields.join(', '));
        console.log('可用字段: id, name, songName, artists, artistNames, album, albumName, albumId, duration, durationInSeconds, publishTime, publishDate, alias, mvId, copyright, fee');
      }

      const songs = await client.getLikedSongs(fields);

      if (songs.length === 0) {
        console.log('没有找到喜欢的歌曲');
        process.exit(0);
      }

      const outputData = {
        total: songs.length,
        exportTime: new Date().toISOString(),
        userId: client.userId,
        songs: songs
      };

      const jsonString = options.pretty 
        ? JSON.stringify(outputData, null, 2)
        : JSON.stringify(outputData);

      await fs.writeFile(options.output, jsonString, 'utf-8');
      console.log(`成功导出 ${songs.length} 首歌曲到 ${options.output}`);

      if (songs.length > 0) {
        console.log('\n示例数据（前3首）:');
        console.log(JSON.stringify(songs.slice(0, 3), null, 2));
      }

    } catch (error) {
      console.error('错误:', error.message);
      process.exit(1);
    }
  });

program.parse();