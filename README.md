简体中文 | [English](./README_EN.md)

<p>
<strong><h2>个人主页</h2></strong>
一个简洁美观的个人主页项目，集成了一言、天气、音乐播放器、任务列表等实用功能，支持多种个性化配置，让你的主页独具特色。
</p>

![主页](/screenshots/main.jpg)

> 主页的 Logo 字体已经过压缩，若用本站 Logo 以外的字母会变回默认字体，若需要完整字体，可将字体目录下的 `Pacifico-Regular-all.ttf` 进行替换

### 🎉 功能

- [x] 载入动画
- [x] 站点简介
- [x] Hitokoto 一言
- [x] 日期及时间
- [x] 实时天气
- [x] 时光进度条
- [x] 音乐播放器
- [x] 任务列表
- [x] 移动端适配

### ⚙️ 自动部署

如果遇到构建环境或者打包过程出现错误，则可以采用 `Github Actions` 来进行自动构建

- 在成功 `fork` 仓库后，前往 `Actions` 页面，若您是首次开启，则会出现下面的提示，点击开启

  ![步骤1](/screenshots/step1.jpg)

- 然后在仓库中进行任意修改后均会触发工作流的运行，在工作流完成后，会在下方生成一个可供下载的压缩包，这就是构建出的静态文件，可自行上传至服务器

  ![步骤2](/screenshots/step2.jpg)

### ⚙️ 手动部署

- **安装** [node.js](https://nodejs.org/zh-cn/) **环境**

  > node > 16.16.0  
  > npm > 8.15.0

- 然后以 **管理员权限** 运行 `cmd` 终端，并 `cd` 到 项目根目录
- 在 `终端` 中输入：

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 预览
pnpm dev

# 构建
pnpm build
```

> 构建完成后，静态资源会在 **`dist` 目录** 中生成，可将 **`dist` 文件夹下的文件**上传至服务器，也可使用 `Vercel` 等托管平台一键导入并自动部署

### ⚙️ Docker 部署

> 安装及配置 Docker 将不在此处说明，请自行解决

```bash
# 构建
docker build -t home .
# 运行
docker run -p 12445:12445 -d home
```

### ⚙️ Vercel 部署

> 其他部署平台大致相同，在此不做说明

1. 点击本仓库右上角的 `Fork`，复制本仓库到你的 `GitHub` 账号
2. 复制 `/.env.example` 文件并重命名为 `/.env`（ 重要 ）
3. 按需修改 `/.env` 文件中的配置
4. 点击 `Deploy`，即可成功部署

### 网站链接

在 `src/assets/siteLinks.json` 中可以自定义网站链接（以指向自己的网站）:

```json
{
  "icon": "Blog",
  "name": "博客",
  "link": "https://blog.example.com/"
}
```

其中 `icon` 网站链接的图标可以在 `src/components/Links/index.vue` 中添加:

```js
// 可前往 https://www.xicons.org 自行挑选并在此处引入
// 此处引入的是 fa 类型
import {
  Link,
  Blog,
  CompactDisc,
  Cloud,
  Compass,
  Book,
  Fire,
  LaptopCode,
  Tasks,
} from "@vicons/fa";

...

// 网站链接图标
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
  Tasks,
};
```

### 社交链接

在 `src/assets/socialLinks.json` 中可以自定义社交链接。

### 天气

天气及地区获取需要 `高德开放平台` 相关 API

- 前往 [高德开放平台控制台](https://console.amap.com/dev/index) 创建一个 `Web 服务` 类型的 `Key`，并将 `Key` 填入 `.env` 中的 `VITE_WEATHER_KEY` 中

也可自行更换其他方式

### 音乐

> 本项目采用了基于 `MetingJS` 的 `Aplayer` 音乐播放器，可实现快速自定义歌单  
> \*仅支持 **中国大陆地区**

请在 `.env` 文件中更改歌曲相关参数即可实现自定义歌单列表

```bash
# 歌曲 API 地址
VITE_SONG_API = "https://api-meting.example.com"
# 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
VITE_SONG_SERVER = "netease"
# 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
VITE_SONG_TYPE = "playlist"
# 播放 ID
VITE_SONG_ID = "7452421335"
```

### 任务列表

任务列表是一个功能强大的待办事项管理工具，支持子任务、截止日期提醒、多种存储方式等功能，帮助你高效管理日常任务。

任务列表支持三种存储方式：

#### 1. localStorage（默认）
数据存储在浏览器本地，无需额外配置。

```bash
VITE_TODO_STORAGE = "localStorage"
```

#### 2. WebDAV
通过 WebDAV 协议同步到远程服务器（如 AList），实现多设备数据同步。

```bash
# 存储方式
VITE_TODO_STORAGE = "webdav"

# WebDAV 配置
VITE_WEBDAV_URL = "http://your-domain/dav"
VITE_WEBDAV_USERNAME = "your-username"
VITE_WEBDAV_PASSWORD = "your-password"
```

#### 3. MinIO 对象存储
使用 MinIO S3 兼容的对象存储服务，提供更可靠的云端存储方案。

```bash
# 存储方式
VITE_TODO_STORAGE = "minio"

# MinIO 配置
VITE_MINIO_ENDPOINT = "http://your-domain:9000"
VITE_MINIO_ACCESS_KEY = "your-access-key"
VITE_MINIO_SECRET_KEY = "your-secret-key"
VITE_MINIO_BUCKET = "your-bucket-name"
```

**功能特性：**
- ✅ 主任务和子任务管理
- ✅ 截止日期设置和逾期提醒
- ✅ 任务完成状态追踪
- ✅ 已完成任务自动分组
- ✅ 子任务进度显示
- ✅ 数据自动同步（WebDAV/MinIO）
- ✅ 本地备份机制

**注意事项：**
- 使用 WebDAV 或 MinIO 时，数据会自动同步到远程服务器
- 同时会在本地浏览器保留备份，确保数据安全
- 首次使用需要在 `.env` 文件中配置相应的存储参数

### 字体

现采用 `HarmonyOS Sans` 开源字体，采用字体拆分，提升加载速度

### 网站图标及网站背景

#### 网站背景

可以在 `public/images` 中修改网站背景

如果想要添加更多的本地图片作为网站背景，可以将图片重命名 `background+数字` 的形式，并在 `src/components/Background/index.vue` 中进行修改：

```js
if (type == 0) {
  // 修改此处 Math.random() 后面的第一个数字为图片的数量
  bgUrl.value = `/images/background${Math.floor(Math.random() * 10 + 1)}.webp`;
}
```

#### 网站图标

可以在 `public/images/icon` 中修改网站图标。

### 技术栈

- [Vue](https://cn.vuejs.org/)
- [Vite](https://vitejs.cn/vite3-cn/)
- [Pinia](https://pinia.vuejs.org/zh/)
- [IconPark](https://iconpark.oceanengine.com/official)
- [xicons](https://xicons.org/)
- [Aplayer](https://aplayer.js.org/)

### API

- [韩小韩 WebAPI 接口](https://api.vvhan.com/)
- [搏天 API](https://api.btstu.cn/doc/sjbz.php)
- [教书先生 API](https://api.oioweb.cn/doc/weather/GetWeather)
- [高德开放平台](https://lbs.amap.com/)
- [Hitokoto 一言](https://hitokoto.cn/)
