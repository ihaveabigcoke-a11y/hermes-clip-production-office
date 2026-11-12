"use strict";

const signalOrigins = [
  { id: "claude", label: "Claude", initials: "CL" },
  { id: "codex", label: "Codex", initials: "CX" },
  { id: "human", label: "Thao tác tay", initials: "T" },
];

const signalStages = [
  { id: "queued", label: "Hàng chờ" },
  { id: "sending", label: "Đang gửi" },
  { id: "generating", label: "Đang tạo" },
  { id: "checking", label: "Kiểm / nhập" },
  { id: "library", label: "Vào Thư viện" },
  { id: "manual", label: "Chờ file tay" },
  { id: "attention", label: "Cần đối soát" },
  { id: "failed", label: "Thất bại" },
  { id: "stopped", label: "Đã dừng" },
  { id: "unmapped", label: "Chưa phân loại" },
];

const signalStateGroups = {
  queued: "queued",
  preflight: "sending", preparing: "sending", prepared: "sending", submitting: "sending",
  submitted: "generating", waiting: "generating", running: "generating",
  downloading: "checking", validating: "checking",
  waiting_manual_file: "manual",
  needs_attention: "attention", unknown: "attention",
  failed: "failed", cancelled: "stopped",
};

function signalStage(job) {
  if (job.importError) return "attention";
  if (job.state === "ready") return job.assetId ? "library" : "checking";
  return Object.hasOwn(signalStateGroups, job.state) ? signalStateGroups[job.state] : "unmapped";
}

const signalFixtures = [
  { id: "012", origin: "claude", title: "Hook thử trên sofa", scene: "Cảnh 01", provider: "FAL mẫu", mediaType: "Video", state: "queued", at: "16:28:00", note: "Đã xếp lượt vào hàng chờ." },
  { id: "013", origin: "codex", title: "Khung mở đầu demo", scene: "Cảnh 02", provider: "FAL mẫu", mediaType: "Ảnh", state: "preflight", at: "16:28:10", note: "Đang kiểm đầu vào trước khi gửi." },
  { id: "014", origin: "claude", title: "Kết quả trước và sau", scene: "Cảnh 04", provider: "Muse · đã tạm dừng", mediaType: "Video", state: "needs_attention", at: "16:28:30", note: "Lượt trước chưa có kết quả được xác nhận." },
  { id: "015", origin: "human", title: "Quay demo trên sofa", scene: "Cảnh 03", provider: "Flow · nhập file tay", mediaType: "Video", state: "waiting_manual_file", at: "16:29:00", note: "Đã xuất prompt. Đang chờ người dùng nhập MP4." },
  { id: "016", origin: "codex", title: "Chuyển động cận sản phẩm", scene: "Cảnh 02", provider: "FAL mẫu", mediaType: "Video", state: "running", at: "16:29:20", note: "Provider mẫu đã nhận lượt tạo video." },
  { id: "017", origin: "human", title: "Góc ngang sản phẩm", scene: "Cảnh 02", provider: "Nhập file tay", mediaType: "Video", state: "ready", at: "16:29:30", note: "Tệp sẵn sàng. Đang chờ ghi nhận vào Thư viện." },
  { id: "018", origin: "human", title: "Take 02 · Demo sản phẩm", scene: "Cảnh 02", provider: "Nhập file tay", mediaType: "Video", state: "ready", assetId: "ASSET-018", at: "16:29:45", note: "Tệp mẫu đã có mã trong Thư viện." },
];

const signalEvents = [
  { id: "012", state: "submitting", at: "16:30:01", note: "Đang gửi yêu cầu mẫu." },
  { id: "013", state: "failed", at: "16:30:04", note: "Đầu vào mẫu thiếu ảnh tham chiếu." },
  { id: "012", state: "running", at: "16:30:07", note: "Provider mẫu xác nhận đang tạo video." },
  { id: "016", state: "validating", at: "16:30:10", note: "Đã nhận tệp mẫu. Đang kiểm định dạng." },
  { id: "017", state: "ready", assetId: "ASSET-017", at: "16:30:12", note: "Đã ghi nhận tệp vào Thư viện mẫu." },
  { id: "016", state: "needs_attention", importError: true, at: "16:30:15", note: "Chưa xác nhận được lượt nhập Thư viện." },
  { id: "012", state: "cancelled", at: "16:30:18", note: "Lượt mô phỏng đã dừng theo kịch bản." },
];

function seedSignalJobs() {
  return signalFixtures.map(job => ({ ...job, history: [{ at: job.at, note: job.note }] }));
}

function nextSignalJobs(jobs, event) {
  return jobs.map(job => job.id === event.id
    ? { ...job, ...event, history: [...job.history, { at: event.at, note: event.note }] }
    : job);
}
