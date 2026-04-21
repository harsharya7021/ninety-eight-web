# Ninety-Eight · Preview Deploy (GitHub Pages)

Everything below runs on your laptop. The `website-v2` folder is already
a git repo with one commit ready to push.

---

## 1 · Create the repo on GitHub

Open https://github.com/new and fill in:

- **Owner**: your account
- **Repository name**: `ninety-eight-web` (or whatever you like)
- **Visibility**: **Public** — free GitHub Pages requires public. Private repos
  need GitHub Pro ($4/mo). For an internal team preview that's fine either way.
- **Do NOT** check "Add a README", "Add .gitignore", or "Add a license" —
  we already have those committed locally, and the extras cause push conflicts.

Click **Create repository**. GitHub will show you a "quick setup" page with a
URL that looks like `https://github.com/harsharya/ninety-eight-web.git`.
Copy it.

---

## 2 · Push from your laptop

Open Terminal and navigate to the folder:

```bash
cd "<path-to>/98-Figma-Brief/website-v2"
```

Add the remote and push (replace the URL with yours from step 1):

```bash
git remote add origin https://github.com/<your-username>/ninety-eight-web.git
git push -u origin main
```

The first push will be ~26 MB (the train.glb is doing the work) and may take
a minute. If GitHub asks for credentials, use a **Personal Access Token**, not
your password — create one at
https://github.com/settings/tokens/new?scopes=repo and paste it when prompted.
Or install GitHub Desktop / gh CLI, which handle auth for you.

---

## 3 · Turn on GitHub Pages

In your repo's web UI:

1. **Settings** → **Pages** (left sidebar)
2. Under "Build and deployment" → **Source**: select **Deploy from a branch**
3. **Branch**: `main`, **Folder**: `/ (root)`
4. Click **Save**

GitHub starts building. Watch it finish in the **Actions** tab
(usually 30–60 seconds). When done, **Pages** will show:

> Your site is live at **https://&lt;your-username&gt;.github.io/ninety-eight-web/**

Send that URL to the team. Done.

---

## 4 · Pushing updates

Any time you change a file, three commands ship it:

```bash
git add -A
git commit -m "tweak: hero copy"
git push
```

GitHub rebuilds Pages automatically — new version is live in ~30 seconds.

---

## 5 · When you're production-ready (optional)

To move to Cloudflare Pages or Netlify later, you don't need to change
anything in the code — both services just point at the same GitHub repo and
redeploy on every push. You can keep GitHub as the source of truth and
switch the serving layer whenever you want.

To attach a custom domain (e.g. `www.ninety-eight.in`):

1. Drop a file named `CNAME` into the repo root containing just your domain:
   ```
   www.ninety-eight.in
   ```
2. At your registrar, add a `CNAME` record:
   `www` → `<your-username>.github.io`
3. In GitHub → Settings → Pages, put the domain in the **Custom domain** box.
   Once DNS resolves (few minutes to a few hours), check **Enforce HTTPS**.

---

## Troubleshooting

- **"large file warning"** during push — GitHub warns on files > 50 MB.
  The 26 MB `train.glb` is fine; you'll only see the warning if you add
  something bigger.
- **Site loads but 3D doesn't show** — GitHub Pages must serve `.glb` as
  `model/gltf-binary`. It does so by default via MIME detection.
- **Site shows a 404** — give Pages 1–2 minutes after first enable.
  Refresh `Settings → Pages` until the green "Your site is live" bar appears.
