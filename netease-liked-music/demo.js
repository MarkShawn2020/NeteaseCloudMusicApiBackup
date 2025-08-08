import fs from 'fs/promises';

async function generateDemoData() {
  const demoSongs = [
    {
      id: 1901371647,
      name: "孤勇者",
      artists: "陈奕迅",
      album: "孤勇者",
      duration: 256000,
      publishTime: 1636646400000
    },
    {
      id: 1974443814,
      name: "小城夏天",
      artists: "LBI利比",
      album: "小城夏天",
      duration: 205714,
      publishTime: 1659024000000
    },
    {
      id: 1959643421,
      name: "与我无关",
      artists: "阿冗",
      album: "与我无关",
      duration: 217142,
      publishTime: 1654876800000
    },
    {
      id: 1492275453,
      name: "起风了",
      artists: "买辣椒也用券",
      album: "起风了",
      duration: 325953,
      publishTime: 1606147200000
    },
    {
      id: 1436709403,
      name: "世间美好与你环环相扣",
      artists: "柏松",
      album: "世间美好与你环环相扣",
      duration: 191960,
      publishTime: 1585670400000
    }
  ];

  const outputData = {
    total: demoSongs.length,
    exportTime: new Date().toISOString(),
    userId: "demo_user",
    songs: demoSongs
  };

  const jsonString = JSON.stringify(outputData, null, 2);
  await fs.writeFile('demo-liked-songs.json', jsonString, 'utf-8');
  
  console.log('演示数据已生成！');
  console.log(`导出了 ${demoSongs.length} 首歌曲到 demo-liked-songs.json`);
  console.log('\n导出的歌曲列表：');
  demoSongs.forEach((song, index) => {
    console.log(`${index + 1}. ${song.name} - ${song.artists} (${song.album})`);
  });
  
  console.log('\n文件内容预览：');
  console.log(JSON.stringify(outputData, null, 2).substring(0, 500) + '...');
  
  return outputData;
}

console.log('网易云音乐喜欢列表导出工具 - 演示模式\n');
console.log('这是一个演示，展示导出功能的输出格式。\n');

generateDemoData().catch(console.error);