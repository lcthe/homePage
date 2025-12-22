English | [Chinese](./README.md)

<p>
<strong><h2>Personal Homepage</h2></strong>
A clean and beautiful personal homepage project with practical features like Hitokoto, weather, music player, and todo list. Supports various customization options to make your homepage unique.
</p>

![Homepage](/screenshots/main.jpg)

>The logo font on the home page has been compressed, so if you use a font other than this logo, it will change back to the default font. If you need the full font, you can replace it with `Pacifico-Regular-all.ttf` in the font directory.

### Functions

- [x] Loading animation
- [x] Site description
- [x] Hitokoto
- [x] Date and time
- [x] Live weather
- [x] Time progress bar
- [x] Music player
- [x] Todo list
- [x] Mobile adaptation

### Deployment

* **Installation** [node.js](https://nodejs.org/zh-cn/) **Environment**

  > node > 16.16.0  
  > npm > 8.15.0
  
* Then run the `cmd` terminal with **administrator privileges** and `cd` to the project root directory
* In the `terminal` type:

```bash
# Install pnpm
npm install -g pnpm

# Install the dependencies
pnpm install

# Preview
pnpm dev

# Build
pnpm build
```

> Once the build is complete, the files in the `dist` folder can be uploaded to the server or imported and automatically deployed with one click using a hosting platform such as `Vercel`.

### Weather

Weather and area access requires Amap Open Platform API

- Go to [Amap Open Platform Console](https://console.amap.com/dev/index) to create a `Key` of type `Web Service` and fill the `Key` into `VITE_WEATHER_KEY` in `.env` 

It can also be replaced by other methods

### Music

>This project uses the `Aplayer` music player based on `MetingJS` for quick song list customization  
>*Only supported in **Mainland China**

Please change the song related parameters in the `.env` file to customize the song list

```bash
# Songs API address
VITE_SONG_API = "https://api-meting.example.com"
# Song server ( netease-netease, tencent-qq music )
VITE_SONG_SERVER = "netease"
# Playback type ( song-song, playlist-playlist, album-album, search-search, artist-artist )
VITE_SONG_TYPE = "playlist"
# Playback ID
VITE_SONG_ID = "7452421335"
```

### Todo List

The todo list is a powerful task management tool that supports subtasks, deadline reminders, multiple storage methods, and more to help you efficiently manage daily tasks.

The todo list supports three storage methods:

#### 1. localStorage (default)
Data is stored locally in the browser, no additional configuration required.

```bash
VITE_TODO_STORAGE = "localStorage"
```

#### 2. WebDAV
Sync to remote server via WebDAV protocol (e.g., AList) for multi-device data synchronization.

```bash
# Storage type
VITE_TODO_STORAGE = "webdav"

# WebDAV configuration
VITE_WEBDAV_URL = "http://your-domain/dav"
VITE_WEBDAV_USERNAME = "your-username"
VITE_WEBDAV_PASSWORD = "your-password"
```

#### 3. MinIO Object Storage
Use MinIO S3-compatible object storage service for more reliable cloud storage.

```bash
# Storage type
VITE_TODO_STORAGE = "minio"

# MinIO configuration
VITE_MINIO_ENDPOINT = "http://your-domain:9000"
VITE_MINIO_ACCESS_KEY = "your-access-key"
VITE_MINIO_SECRET_KEY = "your-secret-key"
VITE_MINIO_BUCKET = "your-bucket-name"
```

**Features:**
- ✅ Main tasks and subtasks management
- ✅ Deadline setting and overdue reminders
- ✅ Task completion status tracking
- ✅ Automatic grouping of completed tasks
- ✅ Subtask progress display
- ✅ Automatic data sync (WebDAV/MinIO)
- ✅ Local backup mechanism

**Notes:**
- When using WebDAV or MinIO, data will be automatically synced to remote server
- A backup will also be kept in the local browser to ensure data security
- First-time use requires configuring storage parameters in the `.env` file

### Fonts

Now using `HarmonyOS Sans` open source font, using font splitting to improve loading speed

### Technology Stack

* [Vue](https://cn.vuejs.org/)
* [Vite](https://vitejs.cn/vite3-cn/)
* [Pinia](https://pinia.vuejs.org/zh/)
* [IconPark](https://iconpark.oceanengine.com/official)
* [xicons](https://xicons.org/)
* [Aplayer](https://aplayer.js.org/)

### API

* [韩小韩 WebAPI 接口](https://api.vvhan.com/)
* [搏天 API](https://api.btstu.cn/doc/sjbz.php)
* [教书先生 API](https://api.oioweb.cn/doc/weather/GetWeather)
* [高德开放平台](https://lbs.amap.com/)
* [Hitokoto 一言](https://hitokoto.cn/)
