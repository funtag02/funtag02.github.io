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
    notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
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
    notes: ["TODO(theo): Add links to phase documentation, board photos, or demo videos."],
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
    notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
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
    notes: ["TODO(theo): Add links to phase documentation, photos, or videos."],
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
    notes: ["TODO(theo): Add links to project documentation, demo videos, or the technical write-up."],
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

    tab.append(number, name, status);
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

      const notesHeading = document.createElement("h5");
      notesHeading.textContent = "Notes and results";
      const notes = document.createElement("ul");
      notes.className = "roadmap-notes";
      phase.notes.forEach((note) => {
        const item = document.createElement("li");
        item.textContent = note;
        notes.append(item);
      });

      roadmapPanel.setAttribute("aria-labelledby", phaseTabs[index].id);
      roadmapPanel.replaceChildren(title, goal, tasksHeading, taskList, doneHeading, outcome, notesHeading, notes);
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

const experienceDetails = {
  amadeus: {
    date: "September 2024 — September 2026",
    title: "Apprenticeship · C++ Software Development",
    organization: "Amadeus · Sophia Antipolis, France (06)",
    details: [
      "Maintenance of large-scale microservices backends within the Hotel Distribution department.",
      "Built a Python log visualization tool to accelerate code flow analysis across a large codebase.",
      "Contributed to a Kafka BI monitoring migration from a legacy component to a new one.",
    ],
  },
  "infotel-apprenticeship": {
    date: "August 2023 — August 2024",
    title: "Apprenticeship · Fullstack Development",
    organization: "Infotel Conseil · Sophia Antipolis, France (06)",
    details: [
      "Advanced the development of a recruitment management web application.",
      "Implemented integration and regression testing.",
      "Improved API response times.",
      "Redesigned the user interface based on Figma mockups.",
      "Integrated MSAL for OAuth2-based authentication.",
    ],
  },
  "infotel-internship": {
    date: "April 2023 — July 2023",
    title: "Internship · Fullstack Development",
    organization: "Infotel Conseil · Sophia Antipolis, France (06)",
    details: [
      "Developed a web application to streamline recruitment process management for the agency.",
      "Technologies: Spring 6 and Angular 17.",
      "Worked in an Agile Scrum team.",
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