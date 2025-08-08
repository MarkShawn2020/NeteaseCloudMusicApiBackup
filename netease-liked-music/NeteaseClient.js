import axios from 'axios';
import crypto from 'crypto';

class NeteaseClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.cookie = '';
    this.userId = null;
  }

  async login(phone, password) {
    try {
      const passwordMd5 = crypto.createHash('md5').update(password).digest('hex');
      const response = await axios.post(`${this.baseUrl}/login/cellphone`, {
        phone,
        password: passwordMd5
      });

      if (response.data.code === 200) {
        this.cookie = response.data.cookie;
        this.userId = response.data.profile.userId;
        console.log(`登录成功! 用户ID: ${this.userId}`);
        return {
          success: true,
          userId: this.userId,
          nickname: response.data.profile.nickname
        };
      } else {
        throw new Error(`登录失败: ${response.data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('登录错误:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getLikedSongIds(userId = null) {
    try {
      const uid = userId || this.userId;
      if (!uid) {
        throw new Error('需要提供用户ID或先登录');
      }

      const response = await axios.get(`${this.baseUrl}/likelist`, {
        params: { uid },
        headers: this.cookie ? { Cookie: this.cookie } : {}
      });

      if (response.data.code === 200) {
        return response.data.ids || [];
      } else {
        throw new Error(`获取喜欢列表失败: ${response.data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取喜欢列表错误:', error.message);
      return [];
    }
  }

  async getSongDetails(songIds) {
    try {
      if (!songIds || songIds.length === 0) {
        return [];
      }

      const batchSize = 100;
      const songs = [];

      for (let i = 0; i < songIds.length; i += batchSize) {
        const batch = songIds.slice(i, i + batchSize);
        const response = await axios.get(`${this.baseUrl}/song/detail`, {
          params: { ids: batch.join(',') },
          headers: this.cookie ? { Cookie: this.cookie } : {}
        });

        if (response.data.code === 200 && response.data.songs) {
          songs.push(...response.data.songs);
        }

        if (i + batchSize < songIds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return songs;
    } catch (error) {
      console.error('获取歌曲详情错误:', error.message);
      return [];
    }
  }

  formatSongData(song, fields) {
    const defaultFields = {
      id: song.id,
      name: song.name,
      artists: song.ar ? song.ar.map(artist => artist.name).join(', ') : '',
      album: song.al ? song.al.name : '',
      duration: song.dt,
      publishTime: song.publishTime
    };

    if (!fields || fields.length === 0) {
      return defaultFields;
    }

    const fieldMapping = {
      id: song.id,
      name: song.name,
      songName: song.name,
      artists: song.ar ? song.ar.map(artist => artist.name).join(', ') : '',
      artistNames: song.ar ? song.ar.map(artist => artist.name) : [],
      album: song.al ? song.al.name : '',
      albumName: song.al ? song.al.name : '',
      albumId: song.al ? song.al.id : null,
      duration: song.dt,
      durationInSeconds: Math.floor(song.dt / 1000),
      publishTime: song.publishTime,
      publishDate: new Date(song.publishTime).toISOString().split('T')[0],
      alias: song.alia && song.alia.length > 0 ? song.alia : [],
      mvId: song.mv || null,
      copyright: song.copyright,
      fee: song.fee
    };

    const result = {};
    fields.forEach(field => {
      if (fieldMapping.hasOwnProperty(field)) {
        result[field] = fieldMapping[field];
      }
    });

    return result;
  }

  async getLikedSongs(fields = null) {
    try {
      console.log('获取喜欢的音乐ID列表...');
      const songIds = await this.getLikedSongIds();
      
      if (songIds.length === 0) {
        console.log('没有找到喜欢的音乐');
        return [];
      }

      console.log(`找到 ${songIds.length} 首喜欢的音乐，正在获取详情...`);
      const songs = await this.getSongDetails(songIds);

      if (songs.length === 0) {
        console.log('无法获取歌曲详情');
        return [];
      }

      console.log(`成功获取 ${songs.length} 首歌曲的详情`);
      return songs.map(song => this.formatSongData(song, fields));
    } catch (error) {
      console.error('获取喜欢歌曲错误:', error.message);
      return [];
    }
  }
}

export default NeteaseClient;