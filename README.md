# SteadyDay Android 5.2 — TEST BUILD

This is a testing build, **not a commercial release**. It packages the existing bilingual HTML interface inside an Android WebView, and adds local Android notifications for enabled habit/task reminders. No Play Console needed.

## Build on GitHub (phone only)
1. Create a **private** GitHub repository. Upload the CONTENTS of this project folder, keeping `.github/workflows/android.yml` intact. GitHub's web upload may not preserve hidden folders easily; using Acode/GitHub mobile with Git is preferable.
2. Open repository **Actions → Build Android test APK → Run workflow** (or push to main).
3. When the build finishes, open its run page and download the **SteadyDay-test-apk** artifact ZIP. Extract `app-debug.apk` and install it.
4. Android may ask to allow installing apps from your browser/files app. Only install your own build.

## Test
1. Open SteadyDay, go to Settings, enable reminders and grant Android notification permission.
2. Select **Sound**, **Silent**, **Vibration**, or **Sound + vibration** (not In-app only).
3. Turn off quiet hours temporarily, add a habit/task, turn on its individual reminder, and set its time 3–5 minutes in the future.
4. Leave the app, lock the screen, and wait. Android may delay inexact alarms depending on battery policy.
5. Use **Test reminder** for an immediate notification (the mode must not be In-app only).

## Limitations and known issues
- Android can delay inexact alarms, especially under battery restrictions. Force-stopping the app in Android Settings cancels its alarms until reopened.
- Sound/vibration are controlled by Android notification channels; once a channel is created, users may need to change it in Android Settings to change behavior.
- Reminder completion actions are not implemented in the native notification; tapping opens the app.
- Habit completion state is synced when the UI renders, and tasks are checked when alarms fire. Background rescheduling is inexact.
- HTML WebView localStorage is tied to this app install; export backups before uninstalling. This is an early prototype and data migration is not guaranteed.
- No iOS build, premium activation, or store distribution included.
- Test language switching, date calculations, and layouts before commercial use.
