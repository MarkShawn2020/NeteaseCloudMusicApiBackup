import NeteaseClient from './NeteaseClient.js';
import fs from 'fs/promises';

async function example() {
  console.log('网易云音乐喜欢列表导出示例\n');
  
  const client = new NeteaseClient('http://localhost:3000');
  
  console.log('请确保已经启动了网易云音乐API服务器');
  console.log('如果没有，请先运行：');
  console.log('git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git');
  console.log('cd NeteaseCloudMusicApi && npm install && npm start\n');
  
  console.log('使用示例：\n');
  
  console.log('1. 登录并获取所有字段：');
  console.log('   const result = await client.login("13800138000", "password");');
  console.log('   const songs = await client.getLikedSongs();\n');
  
  console.log('2. 只获取特定字段：');
  console.log('   const songs = await client.getLikedSongs(["name", "artists", "album"]);\n');
  
  console.log('3. 使用用户ID直接获取（无需登录）：');
  console.log('   client.userId = "32953014";');
  console.log('   const songs = await client.getLikedSongs();\n');
  
  console.log('4. 导出到文件：');
  console.log('   await fs.writeFile("my-songs.json", JSON.stringify(songs, null, 2));\n');
  
  const demoData = [
    {
      name: "示例歌曲1",
      artists: "歌手A, 歌手B",
      album: "专辑名称1",
      duration: 240000,
      durationInSeconds: 240
    },
    {
      name: "示例歌曲2",
      artists: "歌手C",
      album: "专辑名称2",
      duration: 180000,
      durationInSeconds: 180
    }
  ];
  
  console.log('示例输出数据：');
  console.log(JSON.stringify(demoData, null, 2));
}

example().catch(console.error);