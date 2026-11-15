 :root {
  --bg: #eff5f7;
  --bg-elevated: #ffffff;
  --bg-soft: #eaf1f4;
  --panel: #ffffff;
  --panel-alt: #f7fafb;
  --ink: #0e2430;
  --muted: #617985;
  --line: #d7e3e7;
  --primary: #0f7c87;
  --primary-soft: #dfeff2;
  --accent: #c56d41;
  --success: #2e7d5b;
  --danger: #b3392b;
  --shadow: 0 14px 34px rgba(12, 34, 44, 0.08);
}

body.dark {
  --bg: #091c26;
  --bg-elevated: #112a36;
  --bg-soft: #142e3a;
  --panel: #132d38;
  --panel-alt: #183543;
  --ink: #edf8ff;
  --muted: #9ab4be;
  --line: #2a4e5d;
  --primary: #5ac6d6;
  --primary-soft: #123e49;
  --accent: #e69869;
  --success: #71d3a0;
  --danger: #ef7d6e;
  --shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Public Sans", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  background: #0a1d28;
  color: #ebf7fb;
  padding: 24px 14px 18px;
  border-right: 1px solid rgba(255,255,255,0.08);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 20px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), #f2bca2);
  color: #0e1d27;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand-block h1 {
  margin: 0;
  font-size: 1.2rem;
  font-family: "Bricolage Grotesque", sans-serif;
}

.brand-block p {
  margin: 4px 0 0;
  color: rgba(255,255,255,0.72);
  font-size: 0.8rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  background: transparent;
  border: 0;
  color: rgba(235,247,251,0.78);
  text-align: left;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 600;
  transition: 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255,255,255,0.09);
  color: #fff;
}

.main-panel {
  padding: 24px clamp(18px, 3vw, 36px) 36px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  font-weight: 700;
}

h2,
h3,
h4 {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.8rem, 2.5vw, 2.5rem);
}

h3 {
  font-size: clamp(1.4rem, 2vw, 2rem);
}

h4 {
  font-size: 1.1rem;
}

.panel {
  display: none;
  animation: fadeIn 0.25s ease;
}

.panel.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero,
.section-heading,
.toolbar-row,
.action-row,
.toggle-row,
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.hero {
  padding: 22px 24px;
  background: linear-gradient(135deg, var(--panel), var(--bg-soft));
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
  margin-bottom: 22px;
}

.hero h3 {
  max-width: 600px;
  line-height: 1.2;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  border-radius: 10px;
  padding: 0.78rem 1.1rem;
  border: 1px solid transparent;
  font-weight: 700;
  transition: 0.2s ease;
}

.primary-btn {
  background: var(--primary);
  color: #ffffff;
}

.primary-btn:hover {
  filter: brightness(1.04);
}

.secondary-btn {
  background: transparent;
  border-color: var(--line);
  color: var(--ink);
}

.ghost-btn {
  background: var(--panel);
  border-color: var(--line);
  color: var(--ink);
}

.stats-grid,
.card-grid,
.tool-grid {
  display: grid;
  gap: 16px;
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-bottom: 22px;
}

.stat-card,
.panel-card,
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.stat-card {
  padding: 18px 18px 16px;
}

.stat-card.accent {
  background: linear-gradient(135deg, var(--primary-soft), rgba(255,255,255,0));
}

.label {
  display: block;
  color: var(--muted);
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.stat-card strong {
  display: block;
  font-size: clamp(1.7rem, 2vw, 2.3rem);
  margin-bottom: 6px;
  font-family: "Bricolage Grotesque", sans-serif;
}

.stat-card small {
  color: var(--muted);
}

.card-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.panel-card,
.card {
  padding: 18px 18px 20px;
}

.mini-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.mini-list li {
  position: relative;
  padding-left: 14px;
  color: var(--muted);
}

.mini-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary);
}

.wide-card {
  margin-bottom: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

th,
td {
  padding: 10px 10px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

th {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.table-wrap {
  overflow-x: auto;
}

.form-card {
  margin-top: 20px;
}

.form-grid {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.form-grid.two-cols {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.form-grid.three-cols {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

label {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-size: 0.85rem;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg-soft);
  color: var(--ink);
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
}

textarea {
  resize: vertical;
}

.toolbar-row {
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.field-group {
  min-width: 170px;
  flex: 1 1 180px;
  display: grid;
  gap: 8px;
}

.file-field {
  flex: 1.5 1 260px;
}

.action-row {
  justify-content: flex-start;
  margin-top: 16px;
}

.result-card {
  margin-top: 20px;
}

.result-summary,
.result-box {
  margin-top: 12px;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--ink);
  line-height: 1.6;
}

.status-note {
  margin-top: 12px;
  color: var(--muted);
}

.tool-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.tool-card {
  display: grid;
  gap: 10px;
}

.csv-label,
.report-label {
  margin-top: 18px;
}

.layer-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--bg-soft);
}

.layer-item .meta {
  color: var(--muted);
  font-size: 0.8rem;
}

.map-wrapper {
  padding-bottom: 12px;
}

#map-canvas,
#cad-canvas {
  width: 100%;
  height: auto;
  background: linear-gradient(180deg, var(--bg-soft), rgba(255,255,255,0.02));
  border: 1px solid var(--line);
  border-radius: 14px;
  margin-top: 12px;
}

.toggle-row {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.toggle-row label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
  font-size: 0.9rem;
}

.toggle-row input {
  width: auto;
}

.hidden {
  display: none !important;
}

@media (max-width: 820px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 10px;
  }

  .nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .hero,
  .topbar,
  .section-heading,
  .toolbar-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
{