Insight-Grid — Registration Website
A registration site for the Insight-Grid Excel + Power BI + SQL bundle, with
SIWES logbook/report add-on, a live "lucky 10" pricing tracker, and
registrations saved straight into a Google Sheet — all hosted free on
GitHub Pages.
No paid backend needed: a free Google Apps Script does the work of
reading/writing the sheet, and the static site (HTML/CSS/JS) talks to it.
---
1. Set up the Google Sheet + Apps Script (do this first)
Go to sheets.google.com and create a new blank spreadsheet.
Name it something like `Insight-Grid Registrations`.
In the sheet, go to Extensions → Apps Script.
Delete any starter code in `Code.gs`, and paste in the contents of
`google-apps-script/Code.gs` from this repo.
Click Save (the disk icon), then Deploy → New deployment.
Click the gear icon next to "Select type" and choose Web app.
Fill in:
Description: Insight-Grid registrations
Execute as: Me (your Google account)
Who has access: Anyone
Click Deploy. The first time, Google will ask you to authorize the
script — click through (you may see an "unverified app" screen since this
is your own script; click Advanced → Go to project (unsafe) to
continue, this is expected for personal Apps Script projects).
Copy the Web app URL it gives you. It looks like:
`https://script.google.com/macros/s/AKfycby.../exec`
The script will automatically create a `Registrations` tab with headers
the first time someone registers (or you can run `getSheet_` once
manually from the Apps Script editor to create it immediately).
> **Updating the script later:** if you ever edit `Code.gs`, you need to
> **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**
> for the changes to go live. Editing the code alone isn't enough.
2. Connect the website to your sheet
Open `js/script.js` in this repo.
Find this line near the top:
```js
   SCRIPT_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
   ```
Replace the placeholder with the Web app URL you copied in step 1.8.
Save the file.
That's it — the registration form and the "lucky 10" counter on the pricing
section now both read/write the same Google Sheet.
3. Host it on GitHub Pages
Create a new GitHub repository (e.g. `insight-grid-registration`).
Upload everything in this folder (`index.html`, `css/`, `js/`,
`assets/`, `google-apps-script/`) to the repo — either by dragging the
files into GitHub's web uploader, or via git:
```bash
   git init
   git add .
   git commit -m "Insight-Grid registration site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
In the repo, go to Settings → Pages.
Under Build and deployment → Source, choose Deploy from a branch.
Branch: `main`, folder: `/ (root)` → Save.
After a minute, your site will be live at:
`https://YOUR-USERNAME.github.io/YOUR-REPO/`
4. Test it
Open the live link, scroll to Reserve your seat, and submit a test
registration with your own details.
Check your Google Sheet — a new row should appear in the
`Registrations` tab within a few seconds.
Refresh the site and check the Lucky 10 tracker on the pricing
section — the dot count and price should reflect what's in the sheet.
---
How the pricing logic works
The sheet is the single source of truth for how many people have
registered (number of rows under the header).
While that count is below 10, the site shows the bundle at
₦90,000 with ₦100,000 struck through, and the tracker shows how
many lucky-10 spots are left.
Once 10 or more people have registered, the price automatically
switches to the standard ₦100,000, and the tracker says the lucky-10
window is closed.
This logic lives in `LUCKY_SLOTS`, `PRICE_LUCKY`, and `PRICE_STANDARD`
near the top of both `js/script.js` and `google-apps-script/Code.gs` —
change both files together if these numbers ever need to change.
Editing site content
Contact details (email / WhatsApp) are in the `#contact` section of
`index.html`.
SIWES pricing/terms are in the `#siwes` section of `index.html`.
Logos live in `assets/` — `logo.png` (Insight-Grid), `excel-logo.png`,
`powerbi-logo.png`, `sql-logo.jpg`. Swap any file in place (keep the same
filename) to update a logo without touching the HTML.
File structure
```
.
├── index.html                  Main page
├── css/style.css                All styling
├── js/script.js                 Form submission + lucky-10 tracker logic
├── google-apps-script/Code.gs   Backend script (paste into Google Sheet)
├── assets/                      Logos (Insight-Grid, Excel, Power BI, SQL)
└── README.md                    This file
```
