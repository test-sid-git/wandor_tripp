const FINISH_GLOWS = {
  desert: "radial-gradient(circle, rgba(199, 166, 136, 0.30), transparent 70%)",
  natural: "radial-gradient(circle, rgba(165, 162, 154, 0.28), transparent 70%)",
  white: "radial-gradient(circle, rgba(229, 229, 234, 0.24), transparent 70%)",
  black: "radial-gradient(circle, rgba(90, 90, 105, 0.28), transparent 70%)"
};

const CHIP_DATA = {
  m4max: {
    cpu: "16-core",
    cpuLabel: "CPU up to 3.4x faster",
    gpu: "40-core",
    gpuLabel: "GPU hardware ray tracing",
    mem: "128GB",
    memLabel: "Unified memory bandwidth"
  },
  m4pro: {
    cpu: "14-core",
    cpuLabel: "CPU up to 2.6x faster",
    gpu: "20-core",
    gpuLabel: "GPU Pro rendering engine",
    mem: "64GB",
    memLabel: "Unified memory bandwidth"
  },
  m4: {
    cpu: "10-core",
    cpuLabel: "CPU blazing everyday speed",
    gpu: "10-core",
    gpuLabel: "GPU dynamic caching",
    mem: "32GB",
    memLabel: "Unified memory bandwidth"
  }
};

const bag = JSON.parse(localStorage.getItem("apple_ui_bag") || "[]");
const $ = (sel) => document.querySelector(sel);

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._id);
  showToast._id = setTimeout(() => t.classList.remove("show"), 2000);
}

function renderBag() {
  const countEl = $("#bagCount");
  const totalQty = bag.reduce((sum, item) => sum + item.qty, 0);
  countEl.hidden = totalQty === 0;
  countEl.textContent = totalQty;

  const itemsEl = $("#bagItems");
  if (bag.length === 0) {
    itemsEl.innerHTML = `<p style="color:var(--text-secondary);padding:20px 0;">Your bag is empty.</p>`;
    $("#bagTotal").textContent = "$0";
    return;
  }

  let total = 0;
  itemsEl.innerHTML = bag
    .map((item, idx) => {
      total += item.price * item.qty;
      return `
        <div class="bag-item">
          <div>
            <strong>${item.name}</strong>
            <small>Qty ${item.qty} · $${(item.price * item.qty).toLocaleString()}</small>
          </div>
          <button class="bag-remove" data-remove="${idx}" type="button">Remove</button>
        </div>`;
    })
    .join("");

  $("#bagTotal").textContent = `$${total.toLocaleString()}`;
}

function saveBag() {
  localStorage.setItem("apple_ui_bag", JSON.stringify(bag));
  renderBag();
}

function toggleBag(open) {
  const drawer = $("#bagDrawer");
  const backdrop = $("#bagBackdrop");
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  backdrop.hidden = !open;
}

document.addEventListener("DOMContentLoaded", () => {
  // Live clock on hero iPhone
  const updateClock = () => {
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, "0");
    $("#liveClock").textContent = `${h}:${m}`;
  };
  updateClock();
  setInterval(updateClock, 30000);

  // Responsive navbar, smooth scrolling & active section indicator
  const nav = $("#globalNav");
  const navLinks = $("#navLinks");
  const menuToggle = $("#menuToggle");
  const navItems = Array.from(document.querySelectorAll(".nav-link"));

  const setMenuOpen = (isOpen) => {
    navLinks.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !nav.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780 && navLinks.classList.contains("open")) {
      setMenuOpen(false);
    }
  });

  // Smooth scrolling with sticky navbar offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      setMenuOpen(false);

      const navHeight = nav.offsetHeight || 44;
      const top = targetId === "#top"
        ? 0
        : targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  });

  // Highlight active nav link based on scroll position
  const sections = navItems
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute("href"))
    }))
    .filter((item) => item.section);

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + (nav.offsetHeight || 44) + 80;
    let activeLink = null;
    for (const item of sections) {
      if (item.section.offsetTop <= scrollPos) {
        activeLink = item.link;
      }
    }
    navItems.forEach((l) => l.classList.toggle("active", l === activeLink));
  };

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // Titanium Finish Switcher
  document.querySelectorAll(".swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
      const finish = btn.dataset.finish;
      $("#iphoneFrame").dataset.finish = finish;
      $("#finishName").textContent = btn.dataset.label;
      $("#deviceGlow").style.background = FINISH_GLOWS[finish];
    });
  });

  // M4 Chip Benchmark Switcher
  document.querySelectorAll(".bench-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".bench-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const data = CHIP_DATA[tab.dataset.chip];
      $("#metricCpu").textContent = data.cpu;
      $("#metricCpu").nextElementSibling.textContent = data.cpuLabel;
      $("#metricGpu").textContent = data.gpu;
      $("#metricGpu").nextElementSibling.textContent = data.gpuLabel;
      $("#metricMem").textContent = data.mem;
      $("#metricMem").nextElementSibling.textContent = data.memLabel;
    });
  });

  // Shopping Bag
  renderBag();

  document.querySelectorAll(".add-bag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.product;
      const price = Number(btn.dataset.price);
      const existing = bag.find((i) => i.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        bag.push({ name, price, qty: 1 });
      }
      saveBag();
      showToast(`Added ${name} to Bag`);
    });
  });

  $("#bagToggle").addEventListener("click", () => toggleBag(true));
  $("#closeBagBtn").addEventListener("click", () => toggleBag(false));
  $("#bagBackdrop").addEventListener("click", () => toggleBag(false));

  $("#bagItems").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (!rm) return;
    bag.splice(Number(rm.dataset.remove), 1);
    saveBag();
  });

  $("#checkoutBtn").addEventListener("click", () => {
    if (bag.length === 0) return showToast("Your bag is empty");
    bag.length = 0;
    saveBag();
    toggleBag(false);
    showToast("Order placed! (Demo)");
  });

  // Scroll Reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
});
