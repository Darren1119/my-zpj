# Xie Songlun Portfolio

这是谢松伦的个人作品集网站。当前项目是静态网站，代码托管在 GitHub，正式投递使用 Vercel 域名。

## 文件说明

- `index.html`：网站主体内容、样式和交互
- `assets/`：图片、音频、视频等素材
- `personal-info.pdf`：简历 PDF
- `CLAUDE.md`：给 Claude Code / 其他 AI 编码工具的项目交接说明

## 当前线上地址

- Vercel 正式地址：`https://xiesonglun-portfolio.vercel.app`
- GitHub 仓库：`https://github.com/Darren1119/my-zpj`
- GitHub 远端：`git@github.com:Darren1119/my-zpj.git`
- 生产分支：`main`

## 更新网站的简单流程

1. 修改本地文件。
2. 本地预览，确认内容和图片正常。
3. 提交并推送到 GitHub。
4. 用 Vercel CLI 发布到正式地址。

常用命令：

```bash
cd "/Users/xiesonglun/Documents/New project 5"
git status --short
git add index.html assets personal-info.pdf README.md CLAUDE.md
git commit -m "Update portfolio"
git push origin main
npx vercel --prod --yes
```

本地预览：

```bash
cd "/Users/xiesonglun/Documents/New project 5"
python3 -m http.server 4174
```

然后打开 `http://127.0.0.1:4174/`。
