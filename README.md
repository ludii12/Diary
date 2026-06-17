# 日记 - 纯浏览器部署教程

全程不需要终端，所有操作在浏览器完成。

---

## 整体流程概览

```
GitHub(上传代码) → Cloudflare D1(建数据库) → Cloudflare R2(建存储桶) → Cloudflare Pages(部署)
```

---

## 第1站：GitHub — 上传代码

### 步骤 1：创建仓库

1. 打开 [github.com](https://github.com) 登录
2. 右上角 **+** → **New repository**
3. 填写：
   - Repository name：`diary`
   - 选 **Public**
   - **不要**勾选 Add a README
4. 点 **Create repository**

### 步骤 2：上传文件

1. 在仓库页面，点 **uploading an existing file**
2. 打开电脑上的项目文件夹 `日记`
3. 把整个文件夹里的内容拖拽到上传区域

**需要上传的：**
```
📁 .github/workflows/deploy.yml
📁 functions/
   📁 api/diaries/index.ts
   📁 api/diaries/[id].ts
   📁 api/media/[[path]].ts
   📁 api/upload.ts
   📁 types.ts
📁 migrations/0001_init.sql
📁 src/  (整个文件夹)
📄 .gitignore
📄 index.html
📄 package.json
📄 tailwind.config.js
📄 postcss.config.js
📄 tsconfig.json
📄 vite.config.ts
📄 wrangler.toml
```

**不要上传：** `node_modules` 和 `dist` 文件夹

4. 提交信息写 `初始化项目`，点 **Commit changes**

---

## 第2站：Cloudflare — 创建 D1 数据库

### 步骤 3：登录 Cloudflare

打开 [dash.cloudflare.com](https://dash.cloudflare.com)，没有账号就点 **Sign up** 注册（免费）。

### 步骤 4：创建 D1 数据库

1. 左侧菜单 → **Workers & Pages** → **D1 SQL Database**
2. 点右上角 **Create**
3. Database name 填 `moji-diary-db`
4. 点 **Create**

### 步骤 5：建表

1. 点击进入 `moji-diary-db`
2. 切换到 **Console** 标签
3. 把下面的 SQL 粘贴进去：

```sql
CREATE TABLE IF NOT EXISTS diaries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT '',
  weather TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  media TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date);
CREATE INDEX IF NOT EXISTS idx_diaries_updated_at ON diaries(updated_at);
```

4. 点 **Execute**
5. 看到绿色的成功提示就行

### 步骤 6：复制数据库 ID

在数据库详情页找到一串类似 `abc123-def456-...` 的 **Database ID**，复制下来，后面会用到。

---

## 第3站：Cloudflare — 创建 R2 存储桶

（图片和视频存在这里）

### 步骤 7：激活并创建 R2

1. 左侧菜单 → **R2 Object Storage**
2. 首次使用需要激活（免费额度完全够用）
3. 点 **Create bucket**
4. Bucket name 填 `moji-diary-media`
5. 点 **Create bucket**

免费额度：每月 10GB 存储 + 1000 万次读取，个人日记完全够用。

---

## 第4站：GitHub — 更新配置

### 步骤 8：填入数据库 ID

1. 回到 GitHub 仓库，点击 `wrangler.toml` 文件
2. 点右上角铅笔 ✏️ **Edit this file**
3. 把 `YOUR_DATABASE_ID` 替换成你在步骤6复制的那个 ID
4. 点 **Commit changes...** 再点 **Commit changes**

---

## 第5站：Cloudflare — 创建 Pages 部署

### 步骤 9：连接 GitHub

1. 左侧菜单 → **Workers & Pages**
2. 点 **Create** → 选 **Pages** 标签
3. 点 **Connect to Git**
4. 首次使用会授权 GitHub：
   - 点 **Connect GitHub**
   - 授权后选 **Only select repositories**
   - 勾选你的 `diary` 仓库
   - 点 **Install & Authorize**
5. 回来选择 `diary` 仓库，点 **Begin setup**

### 步骤 10：构建设置

| 配置项 | 填写 |
|--------|------|
| Project name | `moji-diary` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |

先别点保存，往下拉绑定数据库。

### 步骤 11：绑定 D1 数据库

找到 **Functions** 区域 → **D1 database bindings** → **Add binding**：

| 字段 | 值 |
|------|-----|
| Variable name | `DB`（必须大写） |
| D1 database | `moji-diary-db` |

### 步骤 12：绑定 R2 存储桶

还是在 **Functions** 区域 → **R2 bucket bindings** → **Add binding**：

| 字段 | 值 |
|------|-----|
| Variable name | `BUCKET`（必须大写） |
| R2 bucket | `moji-diary-media` |

### 步骤 13：部署

确认两个绑定都正确：
- ✅ `DB` → `moji-diary-db`
- ✅ `BUCKET` → `moji-diary-media`

点页面底部 **Save and Deploy**。等待约 1-2 分钟。

部署成功后你会得到一个地址

🎉 **部署完成！打开这个地址就能用了。**

---

## 第6站（可选）：绑定自己的域名

1. Pages 项目页面 → **Custom domains** 标签
2. 点 **Set up a custom domain**
3. 输入域名如 `diary.yourdomain.com`
4. 按提示去域名商添加 CNAME 记录
5. 等几分钟 DNS 生效

---

## 第7站（可选）：GitHub Pages 部署

如果你也想在 GitHub Pages 上部署（无 D1/R2 时自动降级为 localStorage 存储）：

1. GitHub 仓库 → **Settings** → **Pages**
2. Source 选 **GitHub Actions**
3. 推送代码即自动部署
4. 访问 `https://你的用户名.github.io/diary/`

---

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| 构建失败 | Pages → Deployments → 点失败的记录查看日志 |
| 日记存不进去 | 检查 D1 binding 变量名是不是大写的 `DB` |
| 图片上传失败 | 检查 R2 binding 变量名是不是大写的 `BUCKET` |
| 详情页看不到图片 | 确保 `wrangler.toml` 里的 database_id 填对了，且 Functions 绑定正确 |
| 查看数据库数据 | D1 → Console → `SELECT * FROM diaries;` |
| 查看上传的图片 | R2 → `moji-diary-media` → 文件列表 |

---

> 💡 之后每次修改代码，只需推送到 GitHub，Cloudflare Pages 会自动重新部署。
