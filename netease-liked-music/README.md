# 网易云音乐喜欢列表导出工具

导出网易云音乐"我喜欢的音乐"列表到JSON文件，支持自定义字段。

## 前置要求

1. 需要先运行网易云音乐API服务器：
   ```bash
   git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git
   cd NeteaseCloudMusicApi
   npm install
   npm start
   ```
   服务器默认运行在 http://localhost:3000

2. 安装本工具依赖：
   ```bash
   npm install
   ```

## 使用方法

### 1. 使用命令行参数

```bash
# 基本使用（需要提供手机号和密码）
node index.js -p 13800138000 -w yourpassword

# 指定输出文件
node index.js -p 13800138000 -w yourpassword -o my-songs.json

# 自定义导出字段
node index.js -p 13800138000 -w yourpassword -f "name,artists,album"

# 格式化JSON输出
node index.js -p 13800138000 -w yourpassword --pretty

# 只使用用户ID（获取公开的喜欢列表）
node index.js -u 32953014
```

### 2. 使用环境变量

复制 `.env.example` 为 `.env` 并填入你的账号信息：

```bash
cp .env.example .env
# 编辑 .env 文件填入账号信息
```

然后直接运行：
```bash
node index.js
```

### 3. 可用字段

导出时可以通过 `-f` 参数指定要包含的字段，多个字段用逗号分隔：

- `id` - 歌曲ID
- `name` / `songName` - 歌曲名称
- `artists` - 艺术家名称（字符串，多个用逗号分隔）
- `artistNames` - 艺术家名称（数组）
- `album` / `albumName` - 专辑名称
- `albumId` - 专辑ID
- `duration` - 时长（毫秒）
- `durationInSeconds` - 时长（秒）
- `publishTime` - 发布时间（时间戳）
- `publishDate` - 发布日期（YYYY-MM-DD格式）
- `alias` - 别名
- `mvId` - MV ID
- `copyright` - 版权信息
- `fee` - 收费类型

### 示例

```bash
# 导出歌曲名、艺术家和专辑
node index.js -p 13800138000 -w yourpassword -f "name,artists,album" --pretty

# 导出完整信息
node index.js -p 13800138000 -w yourpassword --pretty

# 导出到指定文件
node index.js -p 13800138000 -w yourpassword -o ~/Desktop/my-favorite-songs.json
```

### 输出格式

```json
{
  "total": 100,
  "exportTime": "2024-01-01T00:00:00.000Z",
  "userId": "12345678",
  "songs": [
    {
      "name": "歌曲名",
      "artists": "歌手1, 歌手2",
      "album": "专辑名"
    }
  ]
}
```

## 注意事项

1. 请确保网易云音乐API服务器正在运行
2. 登录可能会受到频率限制，请不要频繁调用
3. 导出的歌曲顺序可能与网易云音乐APP中显示的顺序不同
4. 某些付费歌曲可能无法获取完整信息

## 故障排除

- 如果登录失败，请检查手机号和密码是否正确
- 如果获取不到歌曲，请确认API服务器是否正常运行
- 如果遇到301错误，可能是缓存问题，请等待2分钟后重试