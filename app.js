const inquiries = [
  {
    id: "inq-01",
    company: "Casa Norte Imports",
    country: "Mexico",
    source: "Alibaba International",
    product: "折叠收纳箱",
    quantity: 1200,
    score: 92,
    value: 12400,
    stage: "已询价",
    time: "09:18",
    owner: "Lina",
    tags: ["hot"],
    message:
      "We are looking for collapsible storage boxes for a supermarket chain. Please quote 1,200 pcs first order, with private label and color box. Need delivery before July if sample is approved next week.",
    intent: "连锁渠道采购，数量明确，交期敏感",
    next: "先确认颜色、logo文件和目标港口，同时给阶梯报价",
    risk: "私标包装需确认商标授权，交期承诺应保守"
  },
  {
    id: "inq-02",
    company: "Nordic Home AB",
    country: "Sweden",
    source: "官网表单",
    product: "竹纤维收纳篮",
    quantity: 600,
    score: 76,
    value: 6900,
    stage: "新询盘",
    time: "10:44",
    owner: "Aaron",
    tags: [],
    message:
      "Can you provide eco friendly baskets with FSC packaging? We need samples and your best price for 600 units to start. Please include dimensions and carton size.",
    intent: "环保类产品询价，先小单测试",
    next: "发送认证材料、尺寸表和样品费用说明",
    risk: "FSC、环保描述必须基于真实证书"
  },
  {
    id: "inq-03",
    company: "BrightMart LLC",
    country: "United States",
    source: "展会名片导入",
    product: "厨房密封罐套装",
    quantity: 3000,
    score: 84,
    value: 22800,
    stage: "待报价",
    time: "13:06",
    owner: "Mia",
    tags: ["hot"],
    message:
      "We met at Canton Fair. Please send quotation for the 4pcs airtight container set. Target price is below USD 7.2/set and we need Amazon-ready packaging.",
    intent: "展会跟进，高客单，明确目标价",
    next: "按目标价拆分包装方案，并确认FBA标签需求",
    risk: "Amazon-ready包装需确认平台标签和跌落测试要求"
  },
  {
    id: "inq-04",
    company: "MediPlus Trading",
    country: "UAE",
    source: "WhatsApp",
    product: "智能消毒盒",
    quantity: 500,
    score: 58,
    value: 9800,
    stage: "新询盘",
    time: "15:22",
    owner: "Ken",
    tags: ["risk"],
    message:
      "Need sterilizer boxes for medical clinics. Can you claim 99.99% virus killing and send certificate? We need urgent shipment.",
    intent: "医疗相关用途，客户要求功效宣称",
    next: "先确认应用场景，仅提供真实检测报告范围内表述",
    risk: "医疗功效、杀菌率、认证声明均需人工复核"
  }
];

const products = [
  { name: "折叠收纳箱", cost: 2.22, price: 2.84, lead: "15-18天", pack: "彩盒 + 外箱", moq: 500, ready: 96 },
  { name: "竹纤维收纳篮", cost: 3.62, price: 4.65, lead: "18-22天", pack: "牛皮纸吊牌 + 外箱", moq: 300, ready: 78 },
  { name: "厨房密封罐套装", cost: 5.48, price: 6.95, lead: "20-25天", pack: "亚马逊彩盒 + FBA标签", moq: 1000, ready: 88 },
  { name: "智能消毒盒", cost: 10.9, price: 13.8, lead: "25-30天", pack: "中性彩盒 + 说明书", moq: 200, ready: 62 }
];

const knowledgeItems = [
  { name: "产品报价表", meta: "4个产品 · MOQ/成本/阶梯价", status: "ready", label: "可用" },
  { name: "包装与装箱资料", meta: "缺少2个产品外箱毛重", status: "missing", label: "待补" },
  { name: "认证与检测报告", meta: "FSC/跌落测试/电气安全", status: "missing", label: "需复核" },
  { name: "历史邮件样本", meta: "已学习86封成交邮件", status: "ready", label: "可用" }
];

let tasks = [
  { title: "给 Casa Norte 发送私标阶梯报价", meta: "Lina · 今天16:00前 · 高意向", urgent: true, done: false },
  { title: "向 BrightMart 确认FBA标签和跌落测试", meta: "Mia · 今天18:00前", urgent: true, done: false },
  { title: "补齐竹纤维收纳篮FSC证书文件", meta: "Aaron · 明天上午", urgent: false, done: false },
  { title: "复核智能消毒盒杀菌率表述", meta: "Ken · 合规确认后再发送", urgent: true, done: false }
];

const reports = [
  "本周高意向询盘集中在折叠收纳箱和厨房密封罐，建议优先补齐私标包装案例图。",
  "Casa Norte Imports和BrightMart LLC已进入报价阶段，预计合计机会金额$35,200。",
  "11条客户超过3天未跟进，其中3条已超过7天，建议今天分配给业务员复联。",
  "涉及环保、医疗、认证的询盘占比上升，AI已标记4条需人工复核的宣传表述。"
];

let activeInquiry = inquiries[0];
let activeFilter = "all";
let toastTimer;

const inquiryList = document.querySelector("#inquiryList");
const productSelect = document.querySelector("#productSelect");
const quantityInput = document.querySelector("#quantityInput");
const termSelect = document.querySelector("#termSelect");
const marginInput = document.querySelector("#marginInput");

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function renderInquiries() {
  const filtered = inquiries.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "hot") return item.tags.includes("hot");
    if (activeFilter === "risk") return item.tags.includes("risk") || item.risk.includes("复核");
    return true;
  });

  inquiryList.innerHTML = filtered
    .map((item) => {
      const tagHtml = item.tags
        .map((tag) => `<span class="tag ${tag}">${tag === "hot" ? "高意向" : "需复核"}</span>`)
        .join("");

      return `
        <button class="inquiry-card ${item.id === activeInquiry.id ? "active" : ""}" type="button" data-id="${item.id}">
          <div class="inquiry-main">
            <strong>${item.company}</strong>
            <span class="score-badge">${item.score}</span>
          </div>
          <div class="inquiry-meta">
            <span>${item.country}</span>
            <span>${item.product}</span>
            <span>${item.stage}</span>
            <span>${item.owner}</span>
            ${tagHtml}
          </div>
        </button>
      `;
    })
    .join("");
}

function renderDetail() {
  document.querySelector("#detailSource").textContent = activeInquiry.source;
  document.querySelector("#detailTitle").textContent = activeInquiry.company;
  document.querySelector("#scoreBadge").textContent = `${activeInquiry.score}分`;
  document.querySelector("#detailCountry").textContent = activeInquiry.country;
  document.querySelector("#detailStage").textContent = activeInquiry.stage;
  document.querySelector("#detailValue").textContent = money(activeInquiry.value);
  document.querySelector("#messageTime").textContent = activeInquiry.time;
  document.querySelector("#detailMessage").textContent = activeInquiry.message;
  document.querySelector("#aiIntent").textContent = activeInquiry.intent;
  document.querySelector("#aiNext").textContent = activeInquiry.next;
  document.querySelector("#aiRisk").textContent = activeInquiry.risk;
  document.querySelector("#nextBestAction").textContent = `${activeInquiry.company}: ${activeInquiry.next}`;
  document.querySelector("#riskItem").classList.toggle("hot-risk", activeInquiry.tags.includes("risk"));

  productSelect.value = activeInquiry.product;
  quantityInput.value = activeInquiry.quantity;
  updateQuote();
}

function renderProducts() {
  productSelect.innerHTML = products.map((product) => `<option>${product.name}</option>`).join("");
  document.querySelector("#productTable").innerHTML = products
    .map(
      (product) => `
        <div class="product-row">
          <div>
            <strong>${product.name}</strong>
            <span class="product-meta">MOQ ${product.moq} · ${product.lead} · 资料完整度 ${product.ready}%</span>
          </div>
          <span class="product-price">$${product.price.toFixed(2)}</span>
        </div>
      `
    )
    .join("");
}

function updateQuote() {
  const selected = products.find((product) => product.name === productSelect.value) || products[0];
  const margin = Math.min(Math.max(Number(marginInput.value || 22), 5), 60);
  const suggestedPrice = selected.cost / (1 - margin / 100);
  const quantity = Math.max(Number(quantityInput.value || selected.moq), selected.moq);
  const total = suggestedPrice * quantity;

  document.querySelector("#unitPrice").textContent = `$${suggestedPrice.toFixed(2)}`;
  document.querySelector("#totalPrice").textContent = money(total);
  document.querySelector("#leadTime").textContent = selected.lead;
  document.querySelector("#packaging").textContent = selected.pack;

  document.querySelector("#replyDraft").textContent =
    `Dear ${activeInquiry.company},\n\nThank you for your inquiry about ${selected.name}. Based on ${quantity.toLocaleString()} pcs, our reference quotation is ${money(total)} under ${termSelect.value}. Suggested unit price is $${suggestedPrice.toFixed(2)}, with ${margin}% target gross margin. Lead time is ${selected.lead} after sample approval and deposit.\n\nTo prepare a more accurate offer, please confirm target color, logo file, destination port, and packaging requirement. We can also provide a stepped quotation for larger quantities.\n\nCompliance note: any certificate, eco-friendly claim, or sterilization performance should be confirmed against the original report before sending.\n\nBest regards,\nSales Team`;
}

function renderPipeline() {
  const stages = [
    { name: "新询盘", count: 36, width: 78 },
    { name: "已回复", count: 28, width: 62 },
    { name: "已报价", count: 19, width: 48 },
    { name: "寄样/谈判", count: 7, width: 24 }
  ];

  document.querySelector("#pipeline").innerHTML = stages
    .map(
      (stage) => `
        <div class="stage-card ${activeInquiry.stage === stage.name ? "active-stage" : ""}">
          <span>${stage.name}</span>
          <strong>${stage.count}</strong>
          <div class="bar"><i style="width: ${stage.width}%"></i></div>
        </div>
      `
    )
    .join("");
}

function renderTasks() {
  const openCount = tasks.filter((task) => !task.done).length;
  document.querySelector("#priorityCount").textContent = `${openCount + 4}条询盘待处理`;
  document.querySelector("#overdueMetric").textContent = String(Math.max(6, openCount + 7));

  document.querySelector("#taskList").innerHTML = tasks
    .map(
      (task, index) => `
        <label class="task-row ${task.done ? "done" : ""}">
          <input type="checkbox" data-task="${index}" ${task.done ? "checked" : ""}>
          <span>
            <span class="task-title">${task.title}</span>
            <span class="task-meta">${task.meta}</span>
          </span>
          <span class="task-chip ${task.urgent ? "urgent" : ""}">${task.urgent ? "优先" : "普通"}</span>
        </label>
      `
    )
    .join("");
}

function renderKnowledge() {
  const health = Math.round(products.reduce((sum, product) => sum + product.ready, 0) / products.length);
  document.querySelector("#healthBadge").textContent = `${health}%`;
  document.querySelector("#healthBar").style.width = `${health}%`;
  document.querySelector("#knowledgeList").innerHTML = knowledgeItems
    .map(
      (item) => `
        <div class="knowledge-item">
          <div>
            <strong>${item.name}</strong>
            <span class="product-meta">${item.meta}</span>
          </div>
          <span class="status-pill ${item.status}">${item.label}</span>
        </div>
      `
    )
    .join("");
}

function renderReports() {
  document.querySelector("#reportList").innerHTML = reports.map((item) => `<li>${item}</li>`).join("");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function advanceStage() {
  const stages = ["新询盘", "已询价", "待报价", "已报价", "寄样/谈判"];
  const index = stages.indexOf(activeInquiry.stage);
  activeInquiry.stage = stages[(index + 1) % stages.length];
  renderInquiries();
  renderDetail();
  renderPipeline();
  showToast(`${activeInquiry.company} 已推进到「${activeInquiry.stage}」`);
}

function addGeneratedTask(kind) {
  const taskMap = {
    quote: `为 ${activeInquiry.company} 生成并人工确认报价单`,
    follow: `给 ${activeInquiry.company} 安排3天后复联话术`,
    risk: `复核 ${activeInquiry.product} 的认证、功效和交期表述`
  };

  tasks.unshift({
    title: taskMap[kind],
    meta: `${activeInquiry.owner} · AI自动创建 · ${activeInquiry.country}`,
    urgent: kind !== "follow",
    done: false
  });
  renderTasks();
}

function initEvents() {
  inquiryList.addEventListener("click", (event) => {
    const card = event.target.closest(".inquiry-card");
    if (!card) return;
    activeInquiry = inquiries.find((item) => item.id === card.dataset.id) || activeInquiry;
    renderInquiries();
    renderDetail();
    renderPipeline();
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      renderInquiries();
    });
  });

  productSelect.addEventListener("change", updateQuote);
  quantityInput.addEventListener("input", updateQuote);
  termSelect.addEventListener("change", updateQuote);
  marginInput.addEventListener("input", updateQuote);

  document.querySelector("#advanceBtn").addEventListener("click", advanceStage);
  document.querySelector("#replyBtn").addEventListener("click", () => {
    updateQuote();
    showToast("已生成可人工确认的英文回复草稿");
  });

  document.querySelector("#copyQuoteBtn").addEventListener("click", async () => {
    const text = document.querySelector("#replyDraft").textContent;
    try {
      await navigator.clipboard.writeText(text);
      showToast("报价回复已复制");
    } catch {
      showToast("当前浏览器不支持自动复制");
    }
  });

  document.querySelector("#syncBtn").addEventListener("click", () => {
    showToast("已同步邮箱、官网表单、WhatsApp和展会导入数据");
  });

  document.querySelector("#dailyBtn").addEventListener("click", () => {
    addGeneratedTask("quote");
    showToast("今日待办已生成，并插入高意向报价任务");
  });

  document.querySelector("#makeQuoteBtn").addEventListener("click", () => {
    addGeneratedTask("quote");
    updateQuote();
    showToast("已生成报价任务和报价草稿");
  });

  document.querySelector("#makeFollowBtn").addEventListener("click", () => {
    addGeneratedTask("follow");
    showToast("已加入3天后复联任务");
  });

  document.querySelector("#markRiskBtn").addEventListener("click", () => {
    addGeneratedTask("risk");
    showToast("已加入合规复核任务");
  });

  document.querySelector("#addTaskBtn").addEventListener("click", () => {
    addGeneratedTask("follow");
  });

  document.querySelector("#taskList").addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    tasks[Number(checkbox.dataset.task)].done = checkbox.checked;
    renderTasks();
  });

  document.querySelector("#refreshReportBtn").addEventListener("click", () => {
    reports.unshift("AI发现美国客户对Amazon-ready包装关注上升，建议新增FBA包装说明模板。");
    renderReports();
    showToast("老板周报已刷新");
  });
}

renderProducts();
renderInquiries();
renderDetail();
renderPipeline();
renderTasks();
renderKnowledge();
renderReports();
initEvents();
