const theoOsPhases = [
  {
    number: 1,
    shortName: "C foundations",
    title: "C foundations and tooling",
    status: "done",
    goal: "A working, understood toolchain before touching hardware.",
    tasks: [
      { title: "Toolchain setup", deliverable: 'A documented Makefile builds a "hello ARM" binary with no warnings.' },
      { title: "Linker script and memory map", deliverable: "FLASH/SRAM regions verified with objdump." },
      { title: "ELF and binary inspection", deliverable: "objdump, readelf, nm, and size documented in docs/architecture.md." },
    ],
    doneWhen: "The toolchain compiles, links, and produces a correct ELF, and every Makefile flag is understood and documented.",
    // notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
  },
  {
    number: 2,
    shortName: "Bare-metal STM32",
    title: "Bare-metal STM32 from scratch",
    status: "in-progress",
    goal: "No HAL, no CubeMX, every register address taken from the Reference Manual.",
    tasks: [
      { title: "Startup code and vector table", deliverable: "Boots to main(), verified with the debugger.", current: true },
      { title: "GPIO from registers", deliverable: "An LED blinks." },
      { title: "SysTick and NVIC", deliverable: "A 1 ms tick and delay_ms()." },
      { title: "UART from registers", deliverable: "Serial output with printf redirected." },
      { title: "ARM call stack and Thumb-2 notes", deliverable: "Exception entry/exit and MSP vs PSP documented." },
    ],
    doneWhen: "The board boots from custom startup code, the LED blinks, UART prints, and SysTick fires.",
    // notes: ["TODO(theo): Add links to phase documentation, board photos, or demo videos."],
  },
  {
    number: 3,
    shortName: "Minimal kernel",
    title: "Minimal kernel",
    status: "planned",
    goal: "Build a functional mini-RTOS.",
    tasks: [
      { title: "Heap allocator", deliverable: "A first-fit allocator." },
      { title: "Task control blocks", deliverable: "Task state and context stored in task control blocks." },
      { title: "Context switch via PendSV", deliverable: "Two tasks alternate." },
      { title: "Round-robin scheduler", deliverable: "A scheduler with an idle task." },
      { title: "Mutex", deliverable: "Mutual exclusion for shared resources." },
      { title: "Semaphore", deliverable: "Task synchronization through semaphores." },
    ],
    doneWhen: "Several tasks run, the scheduler switches between them, and a mutex prevents concurrent access.",
    // notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
  },
  {
    number: 4,
    shortName: "Drivers and IPC",
    title: "OS services: drivers and IPC",
    status: "planned",
    goal: "Build the infrastructure that makes the OS usable for real projects.",
    tasks: [
      { title: "Driver interface", deliverable: "A shared abstraction for hardware drivers." },
      { title: "SPI driver", deliverable: "SPI communication through the driver interface." },
      { title: "Message queues", deliverable: "Tasks exchange messages through queues." },
      { title: "Event flags", deliverable: "Tasks coordinate using event flags." },
      { title: "Software timers", deliverable: "Callbacks fire on schedule." },
      { title: "UART shell", deliverable: "Runtime commands for tasks, mem, and regs." },
    ],
    doneWhen: "Drivers are abstracted, tasks communicate through queues and events, timers fire on schedule, and the shell gives runtime visibility.",
    // notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
  },
  {
    number: 5,
    shortName: "Real application",
    title: "A real application on the OS",
    status: "planned",
    goal: "Prove the OS by running a real project on it, without bypassing the OS.",
    tasks: [
      { title: "Port or design a real application", deliverable: "An application runs as an OS workload." },
      { title: "README and architecture documentation", deliverable: "A stranger can build and understand the OS." },
      { title: "Demo video and technical write-up", deliverable: "At least one public technical artifact." },
    ],
    doneWhen: "The application runs stably, the docs let a stranger build and understand the OS, and at least one public technical artifact exists.",
    // notes: ["TODO(theo): Add links to project documentation, demo videos, or the technical write-up."],
  },
];

const menuButton = document.querySelector(".menu-button");
const menuLabel = menuButton?.querySelector(".sr-only");
const navigation = document.querySelector("#site-nav");

menuButton?.addEventListener("click", () => {
  if (!navigation) return;

  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  const nextState = !isOpen;
  menuButton.setAttribute("aria-expanded", String(nextState));
  if (menuLabel) menuLabel.textContent = nextState ? "Close navigation" : "Open navigation";
  navigation.classList.toggle("is-open", nextState);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Open navigation";
    navigation.classList.remove("is-open");
  });
});

const projectTabs = document.querySelectorAll(".project-tab");
const projectPanels = document.querySelectorAll("[data-panel]");

projectTabs.forEach((tab) => {
  function selectTab() {
    const selectedProject = tab.dataset.project;

    projectTabs.forEach((candidate) => {
      const isSelected = candidate === tab;
      candidate.classList.toggle("is-active", isSelected);
      candidate.setAttribute("aria-selected", String(isSelected));
      candidate.tabIndex = isSelected ? 0 : -1;
    });

    projectPanels.forEach((panel) => {
      const isVisible = panel.dataset.panel === selectedProject;
      panel.hidden = !isVisible;
      panel.setAttribute("aria-hidden", String(!isVisible));
    });
  }

  tab.addEventListener("click", () => {
    selectTab();
  });

  tab.addEventListener("keydown", (event) => {
    const currentIndex = Array.from(projectTabs).indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % projectTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + projectTabs.length) % projectTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = projectTabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = projectTabs[nextIndex];
    nextTab.focus();
    nextTab.click();
  });
});

const roadmapStepper = document.querySelector("#roadmap-stepper");
const roadmapPanel = document.querySelector("#roadmap-panel");
const roadmapPrevious = document.querySelector("#roadmap-previous");
const roadmapNext = document.querySelector("#roadmap-next");
const roadmapCurrentPhase = document.querySelector("#roadmap-current-phase");

function initializeTheoOsRoadmap() {
  if (!roadmapStepper || !roadmapPanel || !roadmapPrevious || !roadmapNext || !roadmapCurrentPhase) return;

  const currentPhaseIndex = Math.max(0, theoOsPhases.findIndex((phase) => phase.status === "in-progress"));
  let selectedPhaseIndex = currentPhaseIndex;
  const phaseTabs = theoOsPhases.map((phase, index) => {
    const tab = document.createElement("button");
    tab.className = "roadmap-tab";
    tab.id = `roadmap-tab-${phase.number}`;
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "roadmap-panel");
    tab.setAttribute("aria-selected", String(index === selectedPhaseIndex));
    tab.tabIndex = index === selectedPhaseIndex ? 0 : -1;

    const number = document.createElement("span");
    number.className = "roadmap-number";
    number.textContent = `Phase ${phase.number}`;
    const name = document.createElement("span");
    name.className = "roadmap-phase-name";
    name.textContent = phase.shortName;
    const status = document.createElement("span");
    status.className = `roadmap-status roadmap-status-${phase.status}`;
    status.textContent = phase.status === "in-progress" ? "In progress" : phase.status === "done" ? "Done" : "Planned";

    tab.append(status, number, name);
    tab.addEventListener("click", () => selectPhase(index));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % phaseTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + phaseTabs.length) % phaseTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = phaseTabs.length - 1;
      else return;

      event.preventDefault();
      phaseTabs[nextIndex].focus();
      selectPhase(nextIndex);
    });
    roadmapStepper.append(tab);
    return tab;
  });

  const currentProgress = currentPhaseIndex / (theoOsPhases.length - 1) * 100;
  roadmapStepper.style.setProperty("--roadmap-progress", `${currentProgress}%`);
  roadmapStepper.style.setProperty("--roadmap-track-width", `${(theoOsPhases.length - 1) * 9}rem`);

  function selectPhase(index) {
    selectedPhaseIndex = index;
    const phase = theoOsPhases[index];
    phaseTabs.forEach((tab, tabIndex) => {
      const isSelected = tabIndex === index;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });

    roadmapPanel.classList.add("is-changing");
    window.requestAnimationFrame(() => {
      const title = document.createElement("h4");
      title.textContent = phase.title;
      const goal = document.createElement("p");
      goal.className = "roadmap-goal";
      goal.textContent = phase.goal;

      const tasksHeading = document.createElement("h5");
      tasksHeading.textContent = "Tasks and deliverables";
      const taskList = document.createElement("ul");
      taskList.className = "roadmap-tasks";
      phase.tasks.forEach((task) => {
        const item = document.createElement("li");
        if (task.current) item.classList.add("is-current-task");
        const taskTitle = document.createElement("h6");
        taskTitle.textContent = task.title;
        const deliverable = document.createElement("p");
        deliverable.textContent = task.deliverable;
        item.append(taskTitle, deliverable);
        if (task.current) {
          const current = document.createElement("span");
          current.className = "roadmap-task-current";
          current.textContent = "Current";
          item.append(current);
        }
        taskList.append(item);
      });

      const doneHeading = document.createElement("h5");
      doneHeading.textContent = "Done when";
      const outcome = document.createElement("p");
      outcome.className = "roadmap-outcome";
      outcome.textContent = phase.doneWhen;

      /*
      const notesHeading = document.createElement("h5");
      notesHeading.textContent = "Notes and results";
      const notes = document.createElement("ul");
      notes.className = "roadmap-notes";
      phase.notes.forEach((note) => {
        const item = document.createElement("li");
        item.textContent = note;
        notes.append(item);
      });
      */

      roadmapPanel.setAttribute("aria-labelledby", phaseTabs[index].id);
      roadmapPanel.replaceChildren(title, goal, tasksHeading, taskList, doneHeading, outcome);
      roadmapCurrentPhase.textContent = `Phase ${phase.number} of ${theoOsPhases.length}`;
      roadmapPrevious.disabled = index === 0;
      roadmapNext.disabled = index === theoOsPhases.length - 1;
      roadmapPanel.classList.remove("is-changing");
    });
  }

  roadmapPrevious.addEventListener("click", () => selectPhase(Math.max(0, selectedPhaseIndex - 1)));
  roadmapNext.addEventListener("click", () => selectPhase(Math.min(theoOsPhases.length - 1, selectedPhaseIndex + 1)));
  selectPhase(selectedPhaseIndex);
}

initializeTheoOsRoadmap();

const demoDialog = document.querySelector("#luminasnake-demo-dialog");
const demoOpenButton = document.querySelector(".project-demo-open");
const demoCloseButton = demoDialog?.querySelector(".demo-dialog-close");
const demoPlayButton = document.querySelector("#demo-play-all");
const demoPlayStatus = document.querySelector("#demo-play-status");
const demoVideos = Array.from(document.querySelectorAll(".luminasnake-demo-video"));
let demoPlaybackRequest = 0;

function updateDemoPlaybackState() {
  if (!demoPlayButton || !demoPlayStatus || demoVideos.length === 0) return;

  const allPlaying = demoVideos.every((video) => !video.paused && !video.ended);
  const allPaused = demoVideos.every((video) => video.paused);
  demoPlayButton.textContent = allPlaying ? "Pause both demos" : "Play both demos";
  demoPlayStatus.textContent = allPlaying
    ? "Both demos are playing."
    : allPaused
      ? "Each video also has its own native controls."
      : "One demo is playing. Use the shared button to play both.";
}

demoOpenButton?.addEventListener("click", () => {
  if (!demoDialog || demoDialog.open) return;
  demoDialog.showModal();
  demoCloseButton?.focus();
});

demoCloseButton?.addEventListener("click", () => demoDialog?.close());
demoDialog?.addEventListener("click", (event) => {
  if (event.target === demoDialog) demoDialog.close();
});
demoDialog?.addEventListener("close", () => {
  demoPlaybackRequest += 1;
  demoVideos.forEach((video) => video.pause());
  demoOpenButton?.focus();
});

demoVideos.forEach((video) => {
  video.addEventListener("play", updateDemoPlaybackState);
  video.addEventListener("pause", updateDemoPlaybackState);
  video.addEventListener("ended", updateDemoPlaybackState);
  video.addEventListener("error", () => {
    if (demoPlayStatus) demoPlayStatus.textContent = "A demo video could not be loaded.";
  });
});

demoPlayButton?.addEventListener("click", async () => {
  if (demoVideos.length === 0) return;

  if (demoVideos.every((video) => !video.paused && !video.ended)) {
    demoPlaybackRequest += 1;
    demoVideos.forEach((video) => video.pause());
    updateDemoPlaybackState();
    return;
  }

  const request = ++demoPlaybackRequest;
  demoVideos.forEach((video) => {
    if (video.ended) video.currentTime = 0;
  });
  const playResults = await Promise.allSettled(demoVideos.map((video) => video.play()));
  if (!demoDialog?.open) {
    demoVideos.forEach((video) => video.pause());
    return;
  }
  if (request !== demoPlaybackRequest) return;

  const failedPlay = playResults.some((result) => result.status === "rejected");
  if (failedPlay) {
    demoVideos.forEach((video) => video.pause());
    if (demoPlayStatus) demoPlayStatus.textContent = "Could not play both demos. Try the individual video controls.";
  } else {
    updateDemoPlaybackState();
  }
});

const experienceDetails = {
  amadeus: {
    date: "September 2024 — September 2026",
    title: "Apprenticeship · C++ Software Development",
    organization: "Amadeus · Sophia Antipolis, France (06)",
    details: [
      "Maintained high-performance C++ backend microservices for distributed systems.",
      "Optimized legacy C++ code for memory management and low-latency execution.",
      "Built a Python log analysis tool to visualize complex execution flows.",
      "Diagnosed and resolved critical production incidents across large codebases.",
      "Designed automated unit and regression tests to guarantee system stability.",
      "Wrote up bugfixes and communicated post-mortems to clients.",
    ],
  },
  infotel: {
    date: "April 2023 — August 2024",
    title: "Fullstack developer, Infotel Conseil",
    organization: "Infotel Conseil · Sophia Antipolis, France (06)",
    details: [
      "Optimized REST API response times and database query performance.",
      "Implemented integration and regression test suites.",
      "Integrated MSAL and OAuth2 authentication.",
    ],
  },
};

const experienceDialog = document.querySelector("#experience-dialog");
const dialogClose = experienceDialog?.querySelector(".dialog-close");
let activeExperienceTrigger = null;

function openExperienceDialog(trigger) {
  const experience = experienceDetails[trigger.dataset.experience];
  if (!experience || !experienceDialog) return;

  activeExperienceTrigger = trigger;
  experienceDialog.querySelector("#experience-dialog-date").textContent = experience.date;
  experienceDialog.querySelector("#experience-dialog-title").textContent = experience.title;
  experienceDialog.querySelector("#experience-dialog-org").textContent = experience.organization;
  experienceDialog.querySelector("#experience-dialog-details").replaceChildren(
    ...experience.details.map((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;
      return item;
    }),
  );
  experienceDialog.showModal();
  dialogClose?.focus();
}

document.querySelectorAll(".experience-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => openExperienceDialog(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openExperienceDialog(trigger);
  });
});

dialogClose?.addEventListener("click", () => experienceDialog.close());
experienceDialog?.addEventListener("click", (event) => {
  if (event.target === experienceDialog) experienceDialog.close();
});
experienceDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  experienceDialog.close();
});
experienceDialog?.addEventListener("close", () => activeExperienceTrigger?.focus());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && experienceDialog?.open) experienceDialog.close();
});

window.addEventListener("DOMContentLoaded", () => {
  window.lucide?.createIcons();
});

// Visit analytics (GoatCounter). Everything is guarded so the page never breaks
// if the analytics script is blocked or fails to load.
function countEvent(name) {
  try {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  } catch (error) {
    // Analytics must never break the page.
  }
}

function eventNameForLink(link) {
  const href = link.getAttribute("href") || "";
  if (href.startsWith("mailto:")) return "click-email";
  if (/\.pdf($|[?#])/i.test(href)) return "click-cv";

  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (error) {
    return null;
  }

  if (url.hostname.endsWith("linkedin.com")) return "click-linkedin";
  if (url.hostname === "github.com") {
    const path = url.pathname.replace(/\/+$/, "").toLowerCase();
    if (path === "/funtag02") return "click-github";
    if (path === "/funtag02/theoos") return "click-theoos-repo";
  }
  return null;
}

function trackLinkClick(event) {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!link) return;
  const name = eventNameForLink(link);
  if (name) countEvent(name);
}

document.addEventListener("click", trackLinkClick);
document.addEventListener("auxclick", trackLinkClick);

// Remove tracking codes (?ref=..., ?utm_...) from the address bar once the visit
// has had time to be counted, so a copied URL stays clean.
window.addEventListener("load", () => {
  window.setTimeout(() => {
    try {
      const url = new URL(window.location.href);
      const keysToRemove = [...url.searchParams.keys()].filter(
        (key) => key === "ref" || key.startsWith("utm_"),
      );
      if (keysToRemove.length === 0) return;
      keysToRemove.forEach((key) => url.searchParams.delete(key));
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (error) {
      // Leave the address bar as it is if anything goes wrong.
    }
  }, 1500);
});