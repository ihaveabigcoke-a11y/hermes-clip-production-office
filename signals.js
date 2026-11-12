"use strict";

function makeNode(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label != null) node.textContent = label;
  return node;
}

function makeButton(className, label, action) {
  const node = makeNode("button", className, label);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

const id = name => document.getElementById(name);
const jobDialog = id("job-dialog");
const jobTitle = id("job-title");
const jobDetail = id("job-detail");
const stageButtons = new Map();
const originButtons = new Map();
let jobs = seedSignalJobs();
let step = 0;
let timer = null;
let activeStage = null;
let activeOrigin = null;
let currentJobId = null;
let latest = null;

function selectedJobs() {
  return jobs.filter(job => !activeOrigin || job.origin === activeOrigin);
}

function changeStage(stage) {
  activeStage = activeStage === stage ? null : stage;
  renderSignals();
}

function changeOrigin(origin) {
  activeOrigin = activeOrigin === origin ? null : origin;
  renderSignals();
}

function clearFilters() {
  activeStage = null;
  activeOrigin = null;
  renderSignals();
}

function makeStage(stage, primary) {
  const node = makeButton(primary ? "signal-node" : "signal-side", "", () => changeStage(stage.id));
  node.dataset.stage = stage.id;
  const total = makeNode("span", "signal-total", "0");
  const label = makeNode("span", "signal-label", stage.label);
  const breakdown = stage.id === "generating" ? makeNode("span", "signal-breakdown") : null;
  node.append(total, label);
  if (breakdown) node.append(breakdown);
  stageButtons.set(stage.id, { node, total, breakdown });
  return node;
}

function makeOrigin(origin) {
  const node = makeButton("origin-button", "", () => changeOrigin(origin.id));
  const initials = makeNode("span", "origin-initials", origin.initials);
  initials.setAttribute("aria-hidden", "true");
  const total = makeNode("span", "origin-total", "0");
  node.append(initials, makeNode("span", "", origin.label), total);
  originButtons.set(origin.id, { node, total });
  return node;
}

function jobRow(job) {
  const row = makeNode("li");
  const node = makeButton("job-row", "", () => openJob(job.id));
  node.dataset.job = job.id;
  const status = signalStage(job);
  node.dataset.stage = status;
  const title = makeNode("span", "job-row-title", job.title);
  const context = makeNode("span", "job-context", `#${job.id} · ${job.scene} · ${job.mediaType}`);
  const phase = makeNode("span", "job-phase", signalStages.find(stage => stage.id === status).label);
  const arrow = makeNode("span", "job-row-arrow", "›");
  arrow.setAttribute("aria-hidden", "true");
  const text = makeNode("span");
  text.append(title, context, phase);
  node.append(text, arrow);
  row.append(node);
  return row;
}

function renderJobDetail(job) {
  jobTitle.textContent = job.title;
  id("job-id").textContent = `Lượt #${job.id} · ${job.scene}`;
  const status = signalStages.find(stage => stage.id === signalStage(job)).label;
  const origin = signalOrigins.find(item => item.id === job.origin).label;
  const summary = makeNode("dl", "job-summary");
  const fields = [
    ["Trạng thái", status], ["Giao việc", origin], ["Nhà cung cấp", job.provider],
    ["Loại media", job.mediaType], ["Mã Thư viện", job.assetId ?? "Chưa ghi nhận"],
  ];
  for (const [label, value] of fields) {
    const pair = makeNode("div");
    pair.append(makeNode("dt", "", label), makeNode("dd", "", value));
    summary.append(pair);
  }
  const history = makeNode("ol", "timeline");
  for (const event of job.history) {
    const row = makeNode("li");
    row.append(makeNode("time", "", event.at), document.createTextNode(event.note));
    history.append(row);
  }
  jobDetail.replaceChildren(summary, makeNode("h3", "job-history-heading", "Lịch sử lượt chạy"), history);
}

function openJob(jobId) {
  currentJobId = jobId;
  renderJobDetail(jobs.find(job => job.id === jobId));
  jobDialog.showModal();
  jobTitle.focus();
}

jobDialog.addEventListener("close", () => {
  const trigger = id("jobs").querySelector(`[data-job="${currentJobId}"]`);
  (trigger ?? coreButton).focus();
  currentJobId = null;
});

function renderSignals() {
  const scoped = selectedJobs();
  const counts = new Map(signalStages.map(stage => [stage.id, 0]));
  for (const job of scoped) {
    const stage = signalStage(job);
    counts.set(stage, counts.get(stage) + 1);
  }

  for (const [stage, { node, total, breakdown }] of stageButtons) {
    const count = counts.get(stage);
    total.textContent = count;
    if (breakdown) {
      const images = scoped.filter(job => signalStage(job) === stage && job.mediaType === "Ảnh").length;
      breakdown.textContent = `${images} ảnh · ${count - images} video`;
    }
    node.setAttribute("aria-pressed", String(stage === activeStage));
    node.dataset.hasJobs = String(count > 0);
    node.dataset.event = String(latest?.stage === stage && timer !== null);
    node.hidden = stage === "unmapped" && !count && activeStage !== stage;
  }

  for (const [origin, { node, total }] of originButtons) {
    total.textContent = jobs.filter(job => job.origin === origin).length;
    node.setAttribute("aria-pressed", String(origin === activeOrigin));
  }

  const visible = scoped.filter(job => !activeStage || signalStage(job) === activeStage);
  visible.sort((left, right) => right.at.localeCompare(left.at));
  const focusedJob = document.activeElement?.dataset.job;
  id("jobs").replaceChildren(...visible.map(jobRow));
  if (!visible.length) id("jobs").append(makeNode("li", "empty", "Không có lượt chạy trong bộ lọc này."));
  if (focusedJob) (id("jobs").querySelector(`[data-job="${focusedJob}"]`) ?? coreButton).focus();
  const labels = [
    signalOrigins.find(origin => origin.id === activeOrigin)?.label,
    signalStages.find(stage => stage.id === activeStage)?.label,
  ].filter(Boolean);
  id("visible-count").textContent = visible.length;
  id("list-scope").textContent = labels.join(" · ") || "Tất cả lượt mẫu";
  coreCount.textContent = `${jobs.length} lượt mẫu`;
  coreButton.setAttribute("aria-pressed", String(!activeOrigin && !activeStage));
  id("replay-step").textContent = `Sự kiện ${step}/${signalEvents.length}`;
  id("latest-event").textContent = latest ? `${latest.at} · #${latest.id} · ${latest.note}` : "Chưa phát sự kiện mô phỏng";
  playButton.textContent = timer === null ? "Phát mô phỏng" : "Tạm dừng";
  playButton.disabled = step === signalEvents.length;
  nextButton.disabled = timer !== null || step === signalEvents.length;
  resetButton.disabled = step === 0 && timer === null;
  if (step === signalEvents.length && [playButton, nextButton].includes(document.activeElement)) resetButton.focus();
  if (jobDialog.open && currentJobId) renderJobDetail(jobs.find(job => job.id === currentJobId));
}

function pauseReplay() {
  clearInterval(timer);
  timer = null;
}

function advanceReplay() {
  const event = signalEvents[step];
  if (!event) return;
  jobs = nextSignalJobs(jobs, event);
  latest = { ...event, stage: signalStage(jobs.find(job => job.id === event.id)) };
  step += 1;
  if (step === signalEvents.length) pauseReplay();
  renderSignals();
  if (timer === null) id("replay-feedback").textContent = id("latest-event").textContent;
}

function toggleReplay() {
  if (timer === null) timer = setInterval(advanceReplay, 1250);
  else pauseReplay();
  renderSignals();
}

function resetReplay() {
  pauseReplay();
  jobs = seedSignalJobs();
  step = 0;
  latest = null;
  renderSignals();
  id("replay-feedback").textContent = "Đã đặt lại mô phỏng.";
}

const coreButton = makeButton("core-button", "", clearFilters);
const coreCount = makeNode("span", "core-count");
const coreName = makeNode("span", "core-name", "Hermes Clip");
coreButton.setAttribute("aria-label", "Hermes Clip · Xem tất cả lượt chạy");
coreButton.append(makeNode("span", "core-symbol", "H"), coreName, coreCount);
id("core").append(coreButton);
id("origins").append(...signalOrigins.map(makeOrigin));
id("main-flow").append(...signalStages.slice(0, 5).map(stage => makeStage(stage, true)));
id("side-flow").append(...signalStages.slice(5).map(stage => makeStage(stage, false)));

const playButton = makeButton("signal-action signal-primary", "Phát mô phỏng", toggleReplay);
const nextButton = makeButton("signal-action", "Bước tiếp", advanceReplay);
const resetButton = makeButton("signal-action", "Đặt lại", resetReplay);
id("replay-controls").append(playButton, nextButton, resetButton);

renderSignals();
