## 提供的功能

1、获取 Suno 首页 Trending 的歌曲列表。

2、每周计算歌曲榜单，计算规则：排序值 = 点赞数 * 0.7 + 播放数 * 0.3 。

3、每月计算歌曲榜单，计算规则：排序值 = 点赞数 * 0.7 + 播放数 * 0.3 。

以上三个任务，可在 `index.js` 配置执行时间。

## 环境变量

在 `.env` 文件中配置以下环境变量：

- `MONGODB_URL` 存储歌曲、播放列表的数据库地址
- `DB_NAME` 存储歌曲、播放列表的数据库名
- `AGENDA_MONGODB_URL` 定时任务框架使用的数据库

示例：

```
MONGODB_URL = mongodb://127.0.0.1:27017/
DB_NAME = haya
AGENDA_MONGODB_URL = mongodb://127.0.0.1:27017/agenda
```

## 运行

在 `index.js` 中配置好任务执行间隔，执行命令运行任务：

```
npm run jobs
```

## 测试

测试单次运行任务：

```
npm run test
```