# PhysioRegistry

**A local-first desktop app for physiotherapy clinics to manage patient records, treatment notes, and payments — entirely offline.**

Built with Electron, React 19, and TypeScript. Patient data is stored as plain JSON files on the clinician's own machine; nothing is sent to a server or the cloud, which keeps sensitive clinical records on-site by design.

<p align="center"><em>⬇️ Add screenshots here — see <a href="#screenshots">Screenshots</a>.</em></p>

---

## Why it exists

Small clinics often track patients in spreadsheets or paper files. PhysioRegistry gives a physiotherapist a single desktop application to register patients, keep formatted treatment histories, log payments, and see clinic-level statistics — without a subscription, an internet connection, or patient data leaving the computer.

## Features

- **Patient registry** — create, edit, search, and delete patient records (name, date of birth, contact, address, diagnosis).
- **Rich-text treatment notes** — a formatted editor (React Quill) for each patient's ongoing treatment story.
- **Payment tracking** — log dated payments per patient with amounts and descriptions.
- **Statistics dashboard** — clinic metrics and total income visualised with charts (Recharts).
- **Bilingual UI** — full Turkish/English interface, switchable at runtime via React Context.
- **Offline-first storage** — every patient is a JSON file in the OS app-data directory; no database server to install or maintain.
- **Auto-updates** — packaged builds check GitHub Releases and update themselves in the background (electron-updater).

## Tech stack

| Area | Tools |
| --- | --- |
| Desktop shell | Electron 40 |
| UI | React 19, TypeScript, Vite 7 |
| Editor & charts | React Quill, Recharts |
| Packaging & updates | electron-builder, electron-updater, electron-log |
| CI | GitHub Actions (tag-triggered build & publish) |

## Architecture

PhysioRegistry follows Electron's two-process model. The React UI runs in the **renderer** and never touches the filesystem directly; all persistence happens in the **main** process over IPC.

```text
┌────────────────────────────┐        IPC        ┌──────────────────────────────┐
│  Renderer (React + Vite)   │  save/get/delete  │  Main process (Electron)      │
│  • Patient form & list     │ ───────────────▶  │  • IPC handlers               │
│  • Treatment-notes editor  │ ◀───────────────  │  • Reads/writes JSON files    │
│  • Statistics dashboard    │     patient data  │  • Auto-update (GitHub)       │
└────────────────────────────┘                   └──────────────┬───────────────┘
                                                                 │
                                                       userData/registry/<id>.json
```

Each patient is persisted as `<userData>/registry/<patient-id>.json`, so records are human-readable, easy to back up, and keyed by ID to stay stable across renames.

## Getting started

**Prerequisites:** Node.js 20+.

```bash
git clone https://github.com/cypriotCodder/PhysioRegistry-App.git
cd PhysioRegistry-App
npm install

# Run in development (Vite dev server + Electron with hot reload)
npm run electron:dev
```

### Building a distributable

```bash
# Produce installers for the current platform (macOS .dmg/.zip, Windows .nsis)
npm run electron:build
```

Installers are written to `dist-app/`. Tagging a release (`git tag v0.1.14 && git push --tags`) triggers the GitHub Actions workflow, which builds and publishes the release automatically.

## Where patient data lives

Records are stored under the Electron `userData` directory:

| OS | Path |
| --- | --- |
| Windows | `%APPDATA%/PhysioRegistry/registry/` |
| macOS | `~/Library/Application Support/PhysioRegistry/registry/` |

Backing up the clinic's data is as simple as copying that folder.

## Roadmap / known limitations

- **Harden the Electron security model** — the current build uses `nodeIntegration` with IPC for simplicity; migrating to a strict `contextIsolation` + typed preload bridge is the next step.
- **Encryption at rest** for the local record files.
- **Export** to PDF/CSV for individual patient histories and payment reports.

## Screenshots

> _Add a few screenshots so visitors can see the app without building it. Suggested shots: the patient list, the registry form with the notes editor, and the statistics dashboard. Place image files in `docs/screenshots/` and reference them here, e.g._
>
> ```markdown
> ![Patient list](docs/screenshots/patient-list.png)
> ![Statistics dashboard](docs/screenshots/dashboard.png)
> ```

## License

Released under the [MIT License](LICENSE).
