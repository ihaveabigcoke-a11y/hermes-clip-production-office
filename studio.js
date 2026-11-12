"use strict";

const stations = [
  { id: "research", label: "Nghiên cứu", x: 16.5, y: 48 },
  { id: "script", label: "Kịch bản", x: 50, y: 47 },
  { id: "media", label: "Media", x: 83.5, y: 48 },
  { id: "review", label: "Duyệt & xuất", x: 29, y: 92 },
  { id: "social", label: "Instagram", x: 71, y: 92 },
];

const products = {
  brush: {
    name: "Cây lăn lông thú",
    tasks: [
      {
        id: "brush-s03-media", station: "media", kind: "media", scene: "Cảnh 03 · Test trên sofa",
        title: "Nhập video cho cảnh 03", status: "Chờ nhập MP4",
        note: "Chọn tệp MP4 để xem thử và gắn vào cảnh này trong phiên mẫu.",
      },
      {
        id: "brush-s02-v02", station: "review", kind: "review", scene: "Cảnh 02 · Demo sản phẩm",
        title: "Duyệt take 02", status: "Chờ chọn bản chính",
        version: "Take 02 · Cảnh 02", video: "assets/sample-take-02.mp4",
      },
      {
        id: "brush-job-014", station: "media", kind: "job", scene: "Cảnh 04 · Kết quả trước và sau",
        title: "Đối soát lượt #014", status: "Chưa rõ kết quả",
        note: "Lượt mẫu đã được gửi nhưng chưa có tệp kết quả trong Thư viện.",
        history: [["16:28", "Đã lưu lượt chạy"], ["16:29", "Đã gửi yêu cầu"], ["16:43", "Cần đối soát kết quả"]],
      },
      {
        id: "brush-research", station: "research", kind: "record",
        title: "Chốt góc nội dung", status: "Đã xong", done: true, note: "Thử góc demo dọn lông trên sofa.",
      },
      {
        id: "brush-script", station: "script", kind: "record",
        title: "Duyệt storyboard", status: "Đã xong", done: true, note: "Storyboard mẫu gồm bốn cảnh.",
      },
    ],
  },
  lamp: {
    name: "Đèn đọc sách kẹp",
    tasks: [
      {
        id: "lamp-script", station: "script", kind: "record",
        title: "Duyệt kịch bản demo", status: "Chờ duyệt",
        note: "Cảnh mở cho thấy vùng sáng tập trung trên trang sách.",
      },
      {
        id: "lamp-research", station: "research", kind: "record",
        title: "Chốt góc nội dung", status: "Đã xong", done: true, note: "Góc mẫu: đọc sách buổi tối.",
      },
    ],
  },
};

const detailNames = { media: "Hộp nhận media", review: "Thư viện", job: "Hàng đợi", record: "Chi tiết công việc" };
const symbols = { media: "↑", review: "▷", job: "!", record: "✓" };

const select = document.querySelector("#product");
const stationList = document.querySelector("#stations");
const taskList = document.querySelector("#tasks");
const progress = document.querySelector("#progress-steps");
const filters = document.querySelector("#filters");
const dialog = document.querySelector("#detail");
const title = document.querySelector("#detail-title");
const body = document.querySelector("#detail-body");
const feedback = document.querySelector("#feedback");
const stationButtons = new Map();
let selectedStation = null;
let selectedFilter = "open";
let opener = null;
let previewUrl = null;
const reset = button("plain-button", "Xem tất cả trạm");
document.querySelector("#studio-controls").append(reset);

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value != null) node.textContent = value;
  return node;
}

function button(className, label) {
  const node = element("button", className, label);
  node.type = "button";
  return node;
}

function makeTask(task) {
  const item = button("task");
  item.dataset.done = String(Boolean(task.done));
  const icon = element("span", "task-icon", symbols[task.kind]);
  icon.dataset.tone = task.kind;
  icon.setAttribute("aria-hidden", "true");
  const station = stations.find(entry => entry.id === task.station);
  const text = element("span");
  text.append(
    element("span", "task-title", task.title),
    element("span", "task-context", task.scene ?? station.label),
    element("span", "task-status", task.status),
  );
  const arrow = element("span", "task-arrow", "↗");
  arrow.setAttribute("aria-hidden", "true");
  item.append(icon, text, arrow);
  item.addEventListener("click", () => openTask(task, item));
  return item;
}

function render() {
  const product = products[select.value];
  const scoped = product.tasks.filter(task => !selectedStation || task.station === selectedStation);
  const pending = scoped.filter(task => !task.done).length;
  const visible = scoped.filter(task => selectedFilter === "all" || Boolean(task.done) === (selectedFilter === "done"));
  const activeStation = stations.find(station => station.id === selectedStation);

  document.querySelector("#pending-count").textContent = pending;
  document.querySelector("#work-scope").textContent = activeStation?.label ?? product.name;
  reset.hidden = !selectedStation;
  taskList.replaceChildren(...visible.map(makeTask));
  if (!visible.length) {
    const message = selectedFilter === "done" ? "Chưa có việc hoàn tất." : "Không có việc đang chờ.";
    taskList.append(element("p", "empty", message));
  }

  const states = stations.map(station => {
    const tasks = product.tasks.filter(task => task.station === station.id);
    const waiting = tasks.filter(task => !task.done).length;
    const node = stationButtons.get(station.id);
    node.setAttribute("aria-pressed", String(station.id === selectedStation));
    node.lastElementChild.textContent = waiting ? `${waiting} đang chờ` : tasks.length ? "Đã xong" : "Chưa có việc";
    return waiting ? "active" : tasks.length ? "complete" : "";
  });
  progress.replaceChildren(...states.map(state => element("span", state)));
  document.querySelector("#progress-summary").textContent = `${states.filter(state => state === "complete").length}/5 trạm hoàn tất`;
}

function videoPreview(source) {
  const video = element("video", "preview");
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  if (source) video.src = source;
  return video;
}

function clearPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
}

function renderMedia(task) {
  const note = element("p", "detail-note", task.done ? "Đã gắn trong phiên mẫu." : task.note);
  body.append(note);
  if (task.done) {
    body.append(element("p", "detail-context", task.fileName));
    return;
  }
  const file = element("input", "file-input");
  file.id = "media-file";
  file.type = "file";
  file.accept = "video/mp4,.mp4";
  const error = element("p", "detail-error");
  error.setAttribute("role", "status");
  file.setAttribute("aria-describedby", "media-error");
  error.id = "media-error";
  const preview = videoPreview();
  preview.hidden = true;
  const confirm = button("primary-button", "Gắn vào cảnh mẫu");
  confirm.hidden = true;
  let candidate = null;
  file.addEventListener("change", () => {
    clearPreview();
    candidate = null;
    preview.hidden = confirm.hidden = true;
    preview.removeAttribute("src");
    preview.load();
    error.textContent = "";
    const chosen = file.files[0];
    if (!chosen) return;
    if (!/\.mp4$/i.test(chosen.name) || !chosen.size) {
      error.textContent = "Chọn tệp MP4 có nội dung.";
      return;
    }
    candidate = chosen;
    previewUrl = URL.createObjectURL(chosen);
    preview.src = previewUrl;
  });
  preview.addEventListener("loadedmetadata", () => {
    if (!candidate || preview.currentSrc !== previewUrl) return;
    if (!preview.videoWidth || !Number.isFinite(preview.duration) || preview.duration <= 0) {
      error.textContent = "Tệp cần chứa video có thời lượng hợp lệ.";
      candidate = null;
      return;
    }
    preview.hidden = confirm.hidden = false;
  });
  preview.addEventListener("error", () => {
    if (!candidate) return;
    candidate = null;
    error.textContent = "Không đọc được video. Chọn một tệp MP4 khác.";
  });
  confirm.addEventListener("click", () => {
    if (!candidate) return;
    task.fileName = candidate.name;
    finish(task, "Đã gắn vào cảnh mẫu");
  });
  const label = element("label", "detail-context", "Chọn tệp MP4");
  label.htmlFor = file.id;
  body.append(label, file, error, preview, confirm);
}

function renderReview(task) {
  body.append(element("p", "detail-note", `${task.version} · Video mẫu`), videoPreview(task.video));
  if (task.done) return;
  const selectTake = button("primary-button", "Chọn làm bản chính mẫu");
  selectTake.addEventListener("click", () => finish(task, "Đã chọn bản chính mẫu"));
  body.append(selectTake);
}

function renderJob(task) {
  body.append(element("p", "detail-note", task.note));
  const history = element("ol", "timeline");
  for (const [time, event] of task.history) {
    const row = element("li");
    row.append(element("time", "", time), document.createTextNode(event));
    history.append(row);
  }
  body.append(history);
}

const renderDetail = {
  media: renderMedia,
  review: renderReview,
  job: renderJob,
  record: task => body.append(element("p", "detail-note", task.note)),
};

function openTask(task, trigger) {
  opener = trigger;
  document.querySelector("#detail-type").textContent = detailNames[task.kind];
  title.textContent = task.title;
  body.replaceChildren(element("p", "detail-context", task.scene ?? task.status));
  renderDetail[task.kind](task);
  dialog.showModal();
  title.focus();
}

function finish(task, status) {
  task.done = true;
  task.status = status;
  dialog.close();
  render();
  feedback.textContent = status;
}

dialog.addEventListener("close", () => {
  clearPreview();
  body.replaceChildren();
  const focusTarget = opener?.isConnected ? opener : filters.querySelector('[aria-pressed="true"]');
  focusTarget.focus();
});

for (const [id, product] of Object.entries(products)) {
  const option = element("option", "", product.name);
  option.value = id;
  select.append(option);
}

stations.forEach((station, index) => {
  const node = button("station");
  node.style.setProperty("--x", `${station.x}%`);
  node.style.setProperty("--y", `${station.y}%`);
  const number = element("span", "station-index", String(index + 1).padStart(2, "0"));
  number.setAttribute("aria-hidden", "true");
  node.append(number, element("span", "station-name", station.label), element("span", "station-status"));
  node.addEventListener("click", () => {
    selectedStation = selectedStation === station.id ? null : station.id;
    render();
  });
  stationButtons.set(station.id, node);
  stationList.append(node);
});

select.addEventListener("change", () => {
  selectedStation = null;
  render();
});

reset.addEventListener("click", () => {
  const previous = stationButtons.get(selectedStation);
  selectedStation = null;
  render();
  previous?.focus();
});

for (const [id, label] of [["open", "Đang chờ"], ["done", "Đã xong"], ["all", "Tất cả"]]) {
  const node = button("", label);
  node.setAttribute("aria-pressed", String(id === selectedFilter));
  node.addEventListener("click", () => {
    selectedFilter = id;
    filters.querySelector('[aria-pressed="true"]').setAttribute("aria-pressed", "false");
    node.setAttribute("aria-pressed", "true");
    render();
  });
  filters.append(node);
}

render();
