/* =========================================================
   TASKFLOW — PERSONAL PRODUCTIVITY
   APP.JS — FIXED & FINAL VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. DOM ELEMENTS
       ===================================================== */

    const taskModal = document.getElementById("taskModal");
    const deleteModal = document.getElementById("deleteModal");
    const settingsModal = document.getElementById("settingsModal");
    const profileModal = document.getElementById("profileModal");
    const profileForm = document.getElementById("profileForm");
    const profileNameInput = document.getElementById("profileName");

    const taskForm = document.getElementById("taskForm");

    const taskModalTitle = document.getElementById("taskModalTitle");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelTaskBtn = document.getElementById("cancelTask");

    const taskTitleInput = document.getElementById("taskTitle");
    const taskCategoryInput = document.getElementById("taskCategory");
    const taskPriorityInput = document.getElementById("taskPriority");
    const taskStatusInput = document.getElementById("taskStatus");
    const taskDescriptionInput = document.getElementById("taskDescription");
    const taskStartDateInput = document.getElementById("taskStartDate");
    const taskEndDateInput = document.getElementById("taskEndDate");
    const taskDateInfo = document.getElementById("taskDateInfo");

    const taskList = document.getElementById("taskList");

    const totalTasksEl = document.getElementById("totalTasks");
    const completedTasksEl = document.getElementById("completedTasks");
    const pendingTasksEl = document.getElementById("pendingTasks");
    const overdueTasksEl = document.getElementById("overdueTasks");

    const progressPercentageEl = document.getElementById("progressPercentage");
    const progressTextEl = document.getElementById("progressText");
    const progressRemainingEl = document.getElementById("progressRemaining");
    const progressBarEl = document.getElementById("progressBar");

    const searchTaskInput = document.getElementById("searchTask");
    const categoryFilter = document.getElementById("categoryFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const deadlineFilter = document.getElementById("deadlineFilter");

    const filterButtons = document.querySelectorAll(".filter-btn");
    const menuItems = document.querySelectorAll(".menu-item");

    const settingsBtn = document.querySelector(".settings-btn");
    const avatarBtn = document.querySelector(".avatar");

    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const sidebar = document.querySelector(".sidebar");

    const addTaskButtons = document.querySelectorAll(
        ".add-task-btn, .empty-add-btn"
    );

    const dashboardStatsSection =
        document.getElementById("dashboardStatsSection");

    const taskSectionHeader =
        document.querySelector(".task-section .section-header");

    const taskToolbar =
        document.querySelector(".task-toolbar");

    const topSearchBtn = document.getElementById("topSearchBtn");

    /* =====================================================
   CUSTOM TOAST & CONFIRMATION HELPERS
   ===================================================== */
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✓";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showCustomConfirm(title, message, onConfirm, options = {}) {
    const {
        confirmText = "Lanjutkan",
        danger = false,
        extraText = "Backup dulu",
        onExtra = null
    } = options;

    const modal = document.getElementById("customConfirmModal");
    const titleEl = document.getElementById("confirmModalTitle");
    const msgEl = document.getElementById("confirmModalMessage");
    const iconEl = document.getElementById("confirmModalIcon");
    const okBtn = document.getElementById("confirmOkBtn");
    const cancelBtn = document.getElementById("confirmCancelBtn");
    const extraBtn = document.getElementById("confirmExtraBtn");
    const extraTextEl = document.getElementById("confirmExtraText");

    if (!modal) return;

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText;
    okBtn.classList.toggle("delete-confirm-btn", danger);
    okBtn.classList.toggle("save-btn", !danger);
    iconEl.hidden = !danger;

    const hasExtra = typeof onExtra === "function";
    extraBtn.hidden = !hasExtra;
    extraTextEl.textContent = extraText;

    openTaskflowPanel(modal);
    cancelBtn.focus(); // fokus awal di tombol yang aman

    const handleOk = () => {
        closeTaskflowPanel(modal);
        onConfirm();
        cleanup();
    };

    const handleCancel = () => {
        closeTaskflowPanel(modal);
        cleanup();
    };

    const handleExtra = () => {
        onExtra();
    };

    const cleanup = () => {
        okBtn.removeEventListener("click", handleOk);
        cancelBtn.removeEventListener("click", handleCancel);
        extraBtn.removeEventListener("click", handleExtra);
    };

    okBtn.addEventListener("click", handleOk);
    cancelBtn.addEventListener("click", handleCancel);

    if (hasExtra) {
        extraBtn.addEventListener("click", handleExtra);
    }
}

    /* =====================================================
       02. DELETE MODAL
       ===================================================== */

    const deleteModalTitle =
        document.getElementById("deleteModalTitle");

    const deleteModalMessage =
        document.getElementById("deleteModalMessage");

    const deleteCancelBtn =
        document.getElementById("deleteCancelBtn");

    const deleteConfirmBtn =
        document.getElementById("deleteConfirmBtn");

    /* =====================================================
       03. CALENDAR DOM
       ===================================================== */

    const calendarView =
        document.getElementById("calendarView");

    const calendarMonthTitle =
        document.getElementById("calendarMonthTitle");

    const calendarGrid =
        document.getElementById("calendarGrid");

    const calendarTodayBtn =
        document.getElementById("calendarTodayBtn");

    const calendarPrevBtn =
        document.getElementById("calendarPrevBtn");

    const calendarNextBtn =
        document.getElementById("calendarNextBtn");

    const calendarSelectedDate =
        document.getElementById("calendarSelectedDate");

    const calendarDayTasks =
        document.getElementById("calendarDayTasks");

    const upcomingTasksEl =
        document.getElementById("upcomingTasks");

    const calendarOverdueTasks =
        document.getElementById("calendarOverdueTasks");

    /* =====================================================
       04. PAGE HEADER
       ===================================================== */

    const pageHeadingTitle =
        document.querySelector(".page-heading h1");

    const pageHeadingDescription =
        document.querySelector(".section-header p");

    const taskSectionTitle =
        document.querySelector(".task-section .section-header h2");

    const breadcrumbCurrent =
        document.querySelector(".breadcrumb strong");

    /* =====================================================
       05. STATE
       ===================================================== */

    let tasks = loadTasks();

    let editingTaskId = null;
    let taskToDeleteId = null;

    let currentFilter = "all";

    let currentNavigation = "dashboard";

    let currentCategory = null;

    /* =====================================================
       06. CALENDAR STATE
       ===================================================== */

    const initialToday = new Date();

    let calendarDate = new Date(
        initialToday.getFullYear(),
        initialToday.getMonth(),
        1
    );

    let selectedCalendarDate = new Date(
        initialToday.getFullYear(),
        initialToday.getMonth(),
        initialToday.getDate()
    );

    /* =====================================================
       07. PAGE CONFIGURATION
       ===================================================== */

    const pageConfig = {
        dashboard: {
            breadcrumb: "Dashboard",
            title: "Let's get things done.",
            taskTitle: "Today's Tasks",
            description: "Manage and organize your daily work.",
            showStats: true
        },

        tasks: {
            breadcrumb: "My Tasks",
            title: "Stay on top of your tasks.",
            taskTitle: "My Tasks",
            description: "View and manage all of your tasks in one place.",
            showStats: false
        },

        important: {
            breadcrumb: "Important",
            title: "Focus on what matters.",
            taskTitle: "Important Tasks",
            description: "Tasks marked as Important or Urgent.",
            showStats: false
        },

        calendar: {
            breadcrumb: "Calendar",
            title: "Plan your schedule.",
            taskTitle: "Calendar",
            description: "View your tasks based on their scheduled dates.",
            showStats: false
        },

        category: {
            breadcrumb: "Category",
            title: "Organize your work.",
            taskTitle: "Category Tasks",
            description: "View tasks grouped by category.",
            showStats: false
        }
    };

    /* =====================================================
       08. LOCAL STORAGE
       ===================================================== */

    function normalizeTask(raw) {
        // Dipakai saat load dari localStorage DAN saat import backup,
        // sehingga data dari luar selalu bersih & aman dirender.
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            return null;
        }

        const validCategories = ["Work", "Personal", "Study", "Others"];
        const validPriorities = ["Normal", "Important", "Urgent"];
        const validStatuses = ["not-started", "in-progress", "completed"];

        const title = String(raw.title || "").trim();
        if (!title) {
            return null;
        }

        let status = raw.status || (raw.completed ? "completed" : "not-started");
        if (!validStatuses.includes(status)) {
            status = "not-started";
        }

        const cleanDate = value =>
            parseDate(String(value || "")) ? String(value) : "";

        const created = new Date(raw.createdAt);

        return {
            id: raw.id ? String(raw.id) : generateId(),
            title,
            description: String(raw.description || ""),
            category: validCategories.includes(raw.category) ? raw.category : "Others",
            priority: validPriorities.includes(raw.priority) ? raw.priority : "Normal",
            status,
            completed: status === "completed",
            startDate: cleanDate(raw.startDate),
            endDate: cleanDate(raw.endDate || raw.date),
            createdAt: isNaN(created.getTime())
                ? new Date().toISOString()
                : created.toISOString()
        };
    }

    function loadTasks() {
        try {
            const saved = JSON.parse(localStorage.getItem("taskflow_tasks"));
            if (!Array.isArray(saved)) {
                return [];
            }
            return saved.map(normalizeTask).filter(Boolean);
        } catch (error) {
            console.error("TaskFlow: gagal membaca task dari localStorage.", error);
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
        } catch (error) {
            console.error("TaskFlow: gagal menyimpan task.", error);
            showToast(
                "Data task tidak dapat disimpan. Pastikan browser mengizinkan localStorage.",
                "error"
            );
        }
    }

    // Fix: fungsi ini sebelumnya dipanggil tapi tidak pernah didefinisikan
    // (menyebabkan ReferenceError di halaman kategori).
    function capitalize(value) {
        const text = String(value || "");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    // Kunci scroll body hanya selama masih ada modal yang terbuka.
    function syncModalLock() {
        document.body.classList.toggle(
            "modal-open",
            Boolean(document.querySelector(".modal.active"))
        );
    }

    /* =====================================================
       09. GENERATE ID
       ===================================================== */

    function generateId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );
    }

    /* =====================================================
       10. ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       11. DATE HELPERS
       ===================================================== */

    function getTodayString() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(now.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(now.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function parseDate(dateString) {

        if (!dateString) {
            return null;
        }

        const parts =
            dateString.split("-");

        if (parts.length !== 3) {
            return null;
        }

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;

        const day =
            Number(parts[2]);

        const date =
            new Date(year, month, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            parseDate(dateString);

        if (!date) {
            return "";
        }

        return date.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatLongDate(dateString) {

        const date =
            parseDate(dateString);

        if (!date) {
            return "";
        }

        return date.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function getDayDifference(
        startDate,
        endDate
    ) {

        const start =
            parseDate(startDate);

        const end =
            parseDate(endDate);

        if (!start || !end) {
            return null;
        }

        return Math.round(
            (
                end.getTime() -
                start.getTime()
            ) /
            (1000 * 60 * 60 * 24)
        );
    }

    /* =====================================================
       12. DEADLINE HELPERS
       ===================================================== */

    function getDeadlineStatus(task) {

        if (!task.endDate) {

            return {
                type: "none",
                text: "No deadline"
            };
        }

        if (task.status === "completed") {

            return {
                type: "completed",
                text: "Completed"
            };
        }

        const today =
            parseDate(getTodayString());

        const endDate =
            parseDate(task.endDate);

        if (!today || !endDate) {

            return {
                type: "none",
                text: "No deadline"
            };
        }

        const difference =
            Math.round(
                (
                    endDate.getTime() -
                    today.getTime()
                ) /
                (1000 * 60 * 60 * 24)
            );

        if (difference < 0) {

            const daysLate =
                Math.abs(difference);

            return {
                type: "overdue",
                text:
                    daysLate === 1
                        ? "Overdue by 1 day"
                        : `Overdue by ${daysLate} days`
            };
        }

        if (difference === 0) {

            return {
                type: "today",
                text: "Due today"
            };
        }

        if (difference === 1) {

            return {
                type: "upcoming",
                text: "Due tomorrow"
            };
        }

        return {
            type: "upcoming",
            text: `${difference} days left`
        };
    }

    /* =====================================================
       13. STATUS HELPERS
       ===================================================== */

    function getStatusLabel(status) {

        switch (status) {

            case "in-progress":
                return "In Progress";

            case "completed":
                return "Completed";

            default:
                return "Not Started";
        }
    }

    function normalizeTaskStatus(task) {

        if (!task) {
            return "not-started";
        }

        if (
            ["not-started", "in-progress", "completed"]
                .includes(task.status)
        ) {
            return task.status;
        }

        return task.completed
            ? "completed"
            : "not-started";
    }

    /* =====================================================
       14. OPEN ADD MODAL
       ===================================================== */

    function openAddModal() {
        editingTaskId = null;
        taskModalTitle.textContent = "Add New Task";
        taskForm.reset();

        // Ambil nilai bawaan dari localStorage Settings
        const defaultCategory = localStorage.getItem("taskflow_default_category") || "Work";
        const defaultPriority = localStorage.getItem("taskflow_default_priority") || "Normal";

        taskCategoryInput.value = defaultCategory;
        taskPriorityInput.value = defaultPriority;
        taskStatusInput.value = "not-started";
        taskStartDateInput.value = getTodayString();
        taskEndDateInput.value = getTodayString();
        updateDateInfo();

        const saveButton = taskForm.querySelector(".save-btn");
        if (saveButton) {
            saveButton.textContent = "Add Task";
        }

        openTaskModal();

        setTimeout(() => {
            taskTitleInput.focus();
        }, 100);
    }

    /* =====================================================
       15. OPEN EDIT MODAL
       ===================================================== */

    function openEditModal(taskId) {

        const task =
            tasks.find(
                item => item.id === taskId
            );

        if (!task) {
            return;
        }

        editingTaskId =
            taskId;

        taskModalTitle.textContent =
            "Edit Task";

        taskTitleInput.value =
            task.title || "";

        taskDescriptionInput.value =
            task.description || "";

        taskCategoryInput.value =
            task.category || "Work";

        taskPriorityInput.value =
            task.priority || "Normal";

        taskStatusInput.value =
            normalizeTaskStatus(task);

        taskStartDateInput.value =
            task.startDate || "";

        taskEndDateInput.value =
            task.endDate || "";

        updateDateInfo();

        const saveButton =
            taskForm.querySelector(".save-btn");

        if (saveButton) {
            saveButton.textContent =
                "Save Changes";
        }

        openTaskModal();

        setTimeout(() => {
            taskTitleInput.focus();
        }, 100);
    }

    /* =====================================================
       16. TASK MODAL
       ===================================================== */

    function openTaskModal() {

        taskModal.classList.add("active");

        taskModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }

    function closeModal() {

        taskModal.classList.remove(
            "active"
        );

        taskModal.setAttribute(
            "aria-hidden",
            "true"
        );

        editingTaskId = null;

        taskForm.reset();

        taskDateInfo.textContent =
            "Set a start and end date to track the task period.";

        taskDateInfo.classList.remove(
            "error"
        );

        syncModalLock();
    }

    /* =====================================================
       17. DATE INFORMATION
       ===================================================== */

    function updateDateInfo() {

        const startDate =
            taskStartDateInput.value;

        const endDate =
            taskEndDateInput.value;

        taskDateInfo.classList.remove(
            "error"
        );

        if (!startDate && !endDate) {

            taskDateInfo.textContent =
                "Set a start and end date to track the task period.";

            return;
        }

        if (startDate && !endDate) {

            taskDateInfo.textContent =
                `Task starts ${formatDate(startDate)}.`;

            return;
        }

        if (!startDate && endDate) {

            taskDateInfo.textContent =
                `Task deadline: ${formatDate(endDate)}.`;

            return;
        }

        const difference =
            getDayDifference(
                startDate,
                endDate
            );

        if (difference < 0) {

            taskDateInfo.textContent =
                "End date cannot be earlier than start date.";

            taskDateInfo.classList.add(
                "error"
            );

            return;
        }

        if (difference === 0) {

            taskDateInfo.textContent =
                `Task scheduled for ${formatDate(startDate)}.`;

            return;
        }

        taskDateInfo.textContent =
            `Task period: ${formatDate(startDate)} → ${formatDate(endDate)} (${difference + 1} days).`;
    }

    /* =====================================================
       18. FORM SUBMIT
       ===================================================== */

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                taskTitleInput.value.trim();

            const description =
                taskDescriptionInput.value.trim();

            const category =
                taskCategoryInput.value;

            const priority =
                taskPriorityInput.value;

            const status =
                taskStatusInput.value;

            const startDate =
                taskStartDateInput.value;

            const endDate =
                taskEndDateInput.value;

            if (!title) {

                showToast("Task title harus diisi.", "error");

                taskTitleInput.focus();

                return;
            }

            if (
                startDate &&
                endDate &&
                endDate < startDate
            ) {

                showToast("End date tidak boleh lebih awal dari Start date.", "error");

                taskEndDateInput.focus();

                return;
            }

            if (editingTaskId) {

                const index =
                    tasks.findIndex(
                        task =>
                            task.id ===
                            editingTaskId
                    );

                if (index !== -1) {

                    tasks[index] = {
                        ...tasks[index],

                        title,

                        description,

                        category,

                        priority,

                        status,

                        startDate,

                        endDate,

                        completed:
                            status ===
                            "completed"
                    };
                }

            } else {

                tasks.unshift({

                    id: generateId(),

                    title,

                    description,

                    category,

                    priority,

                    status,

                    startDate,

                    endDate,

                    completed:
                        status ===
                        "completed",

                    createdAt:
                        new Date()
                            .toISOString()
                });
            }

            saveTasks();

            closeModal();

            renderAll();
        }
    );

    /* =====================================================
       19. DATE INPUT EVENTS
       ===================================================== */

    taskStartDateInput.addEventListener(
        "change",
        () => {

            if (
                taskEndDateInput.value &&
                taskStartDateInput.value >
                taskEndDateInput.value
            ) {

                taskEndDateInput.value =
                    taskStartDateInput.value;
            }

            updateDateInfo();
        }
    );

    taskEndDateInput.addEventListener(
        "change",
        updateDateInfo
    );

    /* =====================================================
       20. ADD TASK BUTTONS
       ===================================================== */

    addTaskButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                openAddModal
            );
        }
    );

    /* =====================================================
       21. CLOSE MODAL EVENTS
       ===================================================== */

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

    cancelTaskBtn.addEventListener(
        "click",
        closeModal
    );

    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskModal
            ) {
                closeModal();
            }
        }
    );

    /* =====================================================
       22. DELETE MODAL
       ===================================================== */

    function openDeleteModal(taskId) {

        const task =
            tasks.find(
                item => item.id === taskId
            );

        if (!task) {
            return;
        }

        taskToDeleteId =
            taskId;

        deleteModalTitle.textContent =
            "Delete Task?";

        deleteModalMessage.textContent =
            `Are you sure you want to delete "${task.title}"? This action cannot be undone.`;

        deleteModal.classList.add(
            "active"
        );

        deleteModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        setTimeout(() => {
            deleteConfirmBtn.focus();
        }, 50);
    }

    function closeDeleteModal() {

        deleteModal.classList.remove(
            "active"
        );

        deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );

        taskToDeleteId =
            null;

        syncModalLock();
    }

    deleteCancelBtn.addEventListener(
        "click",
        closeDeleteModal
    );

    deleteConfirmBtn.addEventListener(
        "click",
        () => {

            if (!taskToDeleteId) {
                return;
            }

            tasks =
                tasks.filter(
                    item =>
                        item.id !==
                        taskToDeleteId
                );

            saveTasks();

            closeDeleteModal();

            renderAll();
        }
    );

    deleteModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                deleteModal
            ) {
                closeDeleteModal();
            }
        }
    );

    /* =====================================================
       23. KEYBOARD EVENTS
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            
            const confirmModalEl = document.getElementById("customConfirmModal");
            if (confirmModalEl && confirmModalEl.classList.contains("active")) {
                // klik Batal agar listener konfirmasi ikut dibersihkan
                document.getElementById("confirmCancelBtn").click();
                return;
            }
            if (settingsModal && settingsModal.classList.contains("active")) {
                closeTaskflowPanel(settingsModal);
                return;
            }
            if (profileModal && profileModal.classList.contains("active")) {
                closeTaskflowPanel(profileModal);
                return;
            }

if (
                taskModal.classList.contains(
                    "active"
                )
            ) {

                closeModal();

                return;
            }

            if (
                deleteModal.classList.contains(
                    "active"
                )
            ) {

                closeDeleteModal();
            }
        }
    );

    /* =====================================================
       24. STATUS FILTER
       ===================================================== */

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.textContent
                            .trim()
                            .toLowerCase();

                    currentFilter =
                        filter;

                    setActiveFilterButton(
                        filter
                    );

                    renderAll();
                }
            );
        }
    );

    /* =====================================================
       25. SEARCH & FILTERS
       ===================================================== */

    function handleFilterChange() {

        renderAll();
    }

    if (searchTaskInput) {
        searchTaskInput.addEventListener("input", handleFilterChange);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", handleFilterChange);
    }

    if (priorityFilter) {
        priorityFilter.addEventListener("change", handleFilterChange);
    }

    if (deadlineFilter) {
        deadlineFilter.addEventListener("change", handleFilterChange);
    }

    /* =====================================================
       26. FILTER TASKS
       ===================================================== */

    function getFilteredTasks() {

        const search =
            searchTaskInput ? searchTaskInput.value.trim().toLowerCase() : "";

        const category =
            categoryFilter ? categoryFilter.value : "all";

        const priority =
            priorityFilter ? priorityFilter.value : "all";

        const deadline =
            deadlineFilter ? deadlineFilter.value : "all";

        return tasks.filter(task => {

            if (
                currentNavigation ===
                "important"
            ) {

                if (
                    task.priority !==
                        "Important" &&
                    task.priority !==
                        "Urgent"
                ) {

                    return false;
                }
            }

            if (
                currentNavigation ===
                    "category" &&
                currentCategory
            ) {

                const categoryName =
                    currentCategory
                        .charAt(0)
                        .toUpperCase() +
                    currentCategory
                        .slice(1);

                if (
                    task.category !==
                    categoryName
                ) {

                    return false;
                }
            }

            if (
                currentFilter ===
                "pending"
            ) {

                if (
                    task.status ===
                    "completed"
                ) {

                    return false;
                }
            }

            if (
                currentFilter ===
                "completed"
            ) {

                if (
                    task.status !==
                    "completed"
                ) {

                    return false;
                }
            }

            if (search) {

                const searchableText =
                    [
                        task.title,
                        task.category,
                        task.priority,
                        task.description,
                        getStatusLabel(
                            task.status
                        ),
                        getDeadlineStatus(
                            task
                        ).text
                    ]
                        .join(" ")
                        .toLowerCase();

                if (
                    !searchableText.includes(
                        search
                    )
                ) {

                    return false;
                }
            }

            if (
                category !== "all" &&
                task.category !==
                    category
            ) {

                return false;
            }

            if (
                priority !== "all" &&
                task.priority !==
                    priority
            ) {

                return false;
            }

            if (
                deadline !== "all"
            ) {

                const deadlineStatus =
                    getDeadlineStatus(
                        task
                    );

                if (
                    deadline ===
                        "today" &&
                    deadlineStatus.type !==
                        "today"
                ) {

                    return false;
                }

                if (
                    deadline ===
                        "upcoming" &&
                    deadlineStatus.type !==
                        "upcoming"
                ) {

                    return false;
                }

                if (
                    deadline ===
                        "overdue" &&
                    deadlineStatus.type !==
                        "overdue"
                ) {

                    return false;
                }

                if (
                    deadline ===
                        "none" &&
                    deadlineStatus.type !==
                        "none"
                ) {

                    return false;
                }
            }

            return true;
        });
    }

    /* =====================================================
       27. SORT TASKS
       ===================================================== */

    function sortTasks(taskArray) {

        const priorityOrder = {
            Urgent: 1,
            Important: 2,
            Normal: 3
        };

        return [...taskArray].sort(
            (a, b) => {

                if (
                    a.status ===
                        "completed" &&
                    b.status !==
                        "completed"
                ) {

                    return 1;
                }

                if (
                    a.status !==
                        "completed" &&
                    b.status ===
                        "completed"
                ) {

                    return -1;
                }

                const priorityA =
                    priorityOrder[
                        a.priority
                    ] || 9;

                const priorityB =
                    priorityOrder[
                        b.priority
                    ] || 9;

                if (
                    priorityA !==
                    priorityB
                ) {

                    return (
                        priorityA -
                        priorityB
                    );
                }

                const dateA =
                    parseDate(
                        a.startDate ||
                        a.endDate
                    );

                const dateB =
                    parseDate(
                        b.startDate ||
                        b.endDate
                    );

                if (dateA && dateB) {

                    const difference =
                        dateA - dateB;

                    if (
                        difference !==
                        0
                    ) {

                        return difference;
                    }
                }

                const createdA =
                    new Date(
                        a.createdAt ||
                        0
                    ).getTime();

                const createdB =
                    new Date(
                        b.createdAt ||
                        0
                    ).getTime();

                return createdB -
                    createdA;
            }
        );
    }

    /* =====================================================
       28. DASHBOARD STATS
       ===================================================== */

    function updateStats() {

        const total =
            tasks.length;

        const completed =
            tasks.filter(
                task =>
                    task.status ===
                    "completed"
            ).length;

        const pending =
            tasks.filter(
                task =>
                    task.status !==
                    "completed"
            ).length;

        const overdue =
            tasks.filter(
                task =>
                    task.status !==
                        "completed" &&
                    getDeadlineStatus(
                        task
                    ).type ===
                        "overdue"
            ).length;

        totalTasksEl.textContent =
            total;

        completedTasksEl.textContent =
            completed;

        pendingTasksEl.textContent =
            pending;

        overdueTasksEl.textContent =
            overdue;
    }

    /* =====================================================
       29. PRODUCTIVITY
       ===================================================== */

    function updateProductivity() {

        const total =
            tasks.length;

        const completed =
            tasks.filter(
                task =>
                    task.status ===
                    "completed"
            ).length;

        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (
                        completed /
                        total
                    ) * 100
                );

        progressPercentageEl.textContent =
            `${percentage}%`;

        progressTextEl.textContent =
            `${completed} of ${total} tasks completed`;

        progressBarEl.style.width =
            `${percentage}%`;

        if (total === 0) {

            progressRemainingEl.textContent =
                "No tasks yet";

        } else if (
            percentage === 100
        ) {

            progressRemainingEl.textContent =
                "All tasks completed";

        } else if (
            percentage >= 75
        ) {

            progressRemainingEl.textContent =
                "Almost there";

        } else if (
            percentage >= 50
        ) {

            progressRemainingEl.textContent =
                "Good progress";

        } else {

            progressRemainingEl.textContent =
                "Keep going";
        }
    }

    /* =====================================================
       30. TOGGLE DASHBOARD STATS
       ===================================================== */

    function toggleDashboardStats(
        show = true
    ) {

        if (!dashboardStatsSection) {
            return;
        }

        dashboardStatsSection.style.display =
            show
                ? ""
                : "none";
    }

    /* =====================================================
       31. SHOW TASK LIST
       ===================================================== */

    function showTaskList() {
        const taskSection = document.querySelector(".task-section");
        
        // Hanya tampilkan task-section jika bukan di halaman Dashboard
        if (taskSection && currentNavigation !== "dashboard") {
            taskSection.style.display = "block";
        }

        if (taskList) {
            taskList.style.display = "";
        }

        if (calendarView) {
            calendarView.style.display = "none";
        }

        if (taskSectionHeader) {
            taskSectionHeader.style.display = "";
        }

        if (taskToolbar) {
            taskToolbar.style.display = "";
        }
    }

    /* =====================================================
       32. SHOW CALENDAR
       ===================================================== */

    function showCalendarView() {

        if (taskList) {
            taskList.style.display =
                "none";
        }

        if (calendarView) {
            calendarView.style.display =
                "block";
        }

        if (taskSectionHeader) {
            taskSectionHeader.style.display =
                "none";
        }

        if (taskToolbar) {
            taskToolbar.style.display =
                "none";
        }
    }

    /* =====================================================
       33. TASK ELEMENT
       ===================================================== */

    function createTaskElement(task) {

        const element =
            document.createElement("div");

        element.className =
            "task-item";

        if (
            task.status ===
            "completed"
        ) {

            element.classList.add(
                "completed"
            );
        }

        const deadlineStatus =
            getDeadlineStatus(
                task
            );

        const statusLabel =
            getStatusLabel(
                task.status
            );

        const statusClass =
            task.status ||
            "not-started";

        const startText =
            task.startDate
                ? formatDate(
                    task.startDate
                )
                : null;

        const endText =
            task.endDate
                ? formatDate(
                    task.endDate
                )
                : null;

        let dateHTML = "";

        if (
            startText &&
            endText
        ) {

            if (
                task.startDate ===
                task.endDate
            ) {

                dateHTML = `
                    <span class="deadline ${deadlineStatus.type}">
                        ${escapeHTML(startText)}
                    </span>
                    <span class="deadline-status ${deadlineStatus.type}">
                        ${escapeHTML(deadlineStatus.text)}
                    </span>
                `;

            } else {

                dateHTML = `
                    <span class="deadline ${deadlineStatus.type}">
                        ${escapeHTML(startText)} → ${escapeHTML(endText)}
                    </span>
                    <span class="deadline-status ${deadlineStatus.type}">
                        ${escapeHTML(deadlineStatus.text)}
                    </span>
                `;
            }

        } else if (endText) {

            dateHTML = `
                <span class="deadline ${deadlineStatus.type}">
                    Due ${escapeHTML(endText)}
                </span>
                <span class="deadline-status ${deadlineStatus.type}">
                    ${escapeHTML(deadlineStatus.text)}
                </span>
            `;

        } else if (startText) {

            dateHTML = `
                <span class="deadline">
                    Starts ${escapeHTML(startText)}
                </span>
            `;

        } else {

            dateHTML = `
                <span class="deadline">
                    No deadline
                </span>
            `;
        }

        const descriptionHTML =
            task.description
                ? `
                    <p class="task-description">
                        ${escapeHTML(
                            task.description
                        )}
                    </p>
                `
                : "";

        element.innerHTML = `

            <button
                class="task-checkbox ${
                    task.status ===
                    "completed"
                        ? "checked"
                        : ""
                }"
                type="button"
                aria-label="${
                    task.status ===
                    "completed"
                        ? "Mark as pending"
                        : "Mark as completed"
                }"
            >
                ${
                    task.status ===
                    "completed"
                        ? "✓"
                        : ""
                }
            </button>

            <div class="task-content">

                <div class="task-title-row">

                    <h3 class="task-title">
                        ${escapeHTML(
                            task.title
                        )}
                    </h3>

                </div>

                ${descriptionHTML}

                <div class="task-meta">

                    <span
                        class="category ${String(
                            task.category ||
                            "Others"
                        ).toLowerCase()}"
                    >
                        ${escapeHTML(
                            task.category ||
                            "Others"
                        )}
                    </span>

                    <span
                        class="priority ${String(
                            task.priority ||
                            "Normal"
                        ).toLowerCase()}"
                    >
                        ${escapeHTML(
                            task.priority ||
                            "Normal"
                        )}
                    </span>

                    <span
                        class="task-status ${statusClass}"
                    >
                        <span class="task-status-dot"></span>
                        ${statusLabel}
                    </span>

                    ${dateHTML}

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="task-action edit"
                    type="button"
                    title="Edit task"
                    aria-label="Edit task"
                >
                    ✎
                </button>

                <button
                    class="task-action delete"
                    type="button"
                    title="Delete task"
                    aria-label="Delete task"
                >
                    ×
                </button>

            </div>
        `;

        const checkbox =
            element.querySelector(
                ".task-checkbox"
            );

        const editButton =
            element.querySelector(
                ".task-action.edit"
            );

        const deleteButton =
            element.querySelector(
                ".task-action.delete"
            );

        checkbox.addEventListener(
            "click",
            () => {

                toggleTask(
                    task.id
                );
            }
        );

        editButton.addEventListener(
            "click",
            () => {

                openEditModal(
                    task.id
                );
            }
        );

        deleteButton.addEventListener(
            "click",
            () => {

                openDeleteModal(
                    task.id
                );
            }
        );

        return element;
    }

    /* =====================================================
       34. RENDER TASKS
       ===================================================== */

    function renderTasks() {

        showTaskList();

        const filteredTasks =
            getFilteredTasks();

        const sortedTasks =
            sortTasks(
                filteredTasks
            );

        taskList.innerHTML =
            "";

        if (
            sortedTasks.length ===
            0
        ) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "empty-state";

            const hasAnyTasks =
                tasks.length > 0;

            if (hasAnyTasks) {

                empty.innerHTML = `

                    <div class="empty-icon">
                        ⌕
                    </div>

                    <h3>
                        No matching tasks
                    </h3>

                    <p>
                        Try changing your search or filter.
                    </p>

                    <button
                        class="empty-add-btn"
                        type="button"
                        id="clearFiltersBtn"
                    >
                        Clear Filters
                    </button>
                `;

            } else {

                empty.innerHTML = `

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No tasks yet
                    </h3>

                    <p>
                        Add your first task and start getting things done.
                    </p>

                    <button
                        class="empty-add-btn"
                        type="button"
                        id="emptyAddTaskBtn"
                    >
                        + Add New Task
                    </button>
                `;
            }

            taskList.appendChild(
                empty
            );

            const clearButton =
                document.getElementById(
                    "clearFiltersBtn"
                );

            if (clearButton) {

                clearButton.addEventListener(
                    "click",
                    clearAllFilters
                );
            }

            const emptyAddButton =
                document.getElementById(
                    "emptyAddTaskBtn"
                );

            if (emptyAddButton) {

                emptyAddButton.addEventListener(
                    "click",
                    openAddModal
                );
            }

            return;
        }

        sortedTasks.forEach(
            task => {

                taskList.appendChild(
                    createTaskElement(
                        task
                    )
                );
            }
        );
    }

    /* =====================================================
       35. TOGGLE TASK
       ===================================================== */

    function toggleTask(taskId) {

        const task =
            tasks.find(
                item =>
                    item.id ===
                    taskId
            );

        if (!task) {
            return;
        }

        if (
            task.status ===
            "completed"
        ) {

            task.status =
                "in-progress";

            task.completed =
                false;

        } else {

            task.status =
                "completed";

            task.completed =
                true;
        }

        saveTasks();

        renderAll();
    }

    /* =====================================================
       36. CALENDAR DATE
       ===================================================== */

    function formatCalendarDate(
        date
    ) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /* =====================================================
       37. TASK ACTIVE ON DATE
       ===================================================== */

    function isTaskActiveOnDate(
        task,
        dateString
    ) {

        if (
            !task.startDate &&
            !task.endDate
        ) {

            return false;
        }

        const start =
            task.startDate ||
            task.endDate;

        const end =
            task.endDate ||
            task.startDate;

        return (
            dateString >= start &&
            dateString <= end
        );
    }

    /* =====================================================
       38. CALENDAR TASK ITEM
       ===================================================== */

    function createCalendarTaskItem(
        task
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "calendar-task-item";

        if (
            task.status ===
            "completed"
        ) {

            item.classList.add(
                "completed"
            );
        }

        const priorityClass =
            String(
                task.priority ||
                "Normal"
            ).toLowerCase();

        const statusLabel =
            getStatusLabel(
                task.status
            );

        const startDate =
            task.startDate
                ? formatDate(
                    task.startDate
                )
                : "";

        const endDate =
            task.endDate
                ? formatDate(
                    task.endDate
                )
                : "";

        let dateText =
            "No deadline";

        if (
            startDate &&
            endDate
        ) {

            dateText =
                startDate ===
                endDate
                    ? startDate
                    : `${startDate} → ${endDate}`;

        } else if (endDate) {

            dateText =
                `Due ${endDate}`;

        } else if (startDate) {

            dateText =
                `Starts ${startDate}`;
        }

        item.innerHTML = `

            <button
                type="button"
                class="calendar-task-check ${
                    task.status ===
                    "completed"
                        ? "checked"
                        : ""
                }"
                aria-label="${
                    task.status ===
                    "completed"
                        ? "Mark as pending"
                        : "Mark as completed"
                }"
            >
                ${
                    task.status ===
                    "completed"
                        ? "✓"
                        : ""
                }
            </button>

            <div class="calendar-task-main">

                <div class="calendar-task-title">
                    ${escapeHTML(
                        task.title
                    )}
                </div>

                <div class="calendar-task-info">

                    <span class="calendar-task-date">
                        ${escapeHTML(
                            dateText
                        )}
                    </span>

                    <span class="calendar-task-category">
                        ${escapeHTML(
                            task.category ||
                            "Others"
                        )}
                    </span>

                    <span
                        class="calendar-task-priority ${priorityClass}"
                    >
                        ${escapeHTML(
                            task.priority ||
                            "Normal"
                        )}
                    </span>

                    <span class="calendar-task-status">
                        ${statusLabel}
                    </span>

                </div>

            </div>

            <div class="calendar-task-actions">

                <button
                    type="button"
                    class="calendar-edit-btn"
                    title="Edit task"
                    aria-label="Edit task"
                >
                    ✎
                </button>

                <button
                    type="button"
                    class="calendar-delete-btn"
                    title="Delete task"
                    aria-label="Delete task"
                >
                    ×
                </button>

            </div>
        `;

        const checkButton =
            item.querySelector(
                ".calendar-task-check"
            );

        const editButton =
            item.querySelector(
                ".calendar-edit-btn"
            );

        const deleteButton =
            item.querySelector(
                ".calendar-delete-btn"
            );

        checkButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleTask(
                    task.id
                );
            }
        );

        editButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openEditModal(
                    task.id
                );
            }
        );

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openDeleteModal(
                    task.id
                );
            }
        );

        return item;
    }

    /* =====================================================
       39. CALENDAR DAY
       ===================================================== */

    function createCalendarDay(
        year,
        month,
        day,
        isOtherMonth = false
    ) {

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "calendar-day";

        const date =
            new Date(
                year,
                month,
                day
            );

        const dateString =
            formatCalendarDate(
                date
            );

        const todayString =
            getTodayString();

        const selectedString =
            formatCalendarDate(
                selectedCalendarDate
            );

        if (isOtherMonth) {

            cell.classList.add(
                "other-month"
            );
        }

        if (
            dateString ===
            todayString
        ) {

            cell.classList.add(
                "today"
            );
        }

        if (
            dateString ===
            selectedString
        ) {

            cell.classList.add(
                "selected"
            );
        }

        const dateNumber =
            document.createElement(
                "div"
            );

        dateNumber.className =
            "calendar-date";

        dateNumber.textContent =
            day;

        cell.appendChild(
            dateNumber
        );

        const tasksOnDate =
            tasks.filter(
                task =>
                    isTaskActiveOnDate(
                        task,
                        dateString
                    )
            );

        const priorityOrder = {
            Urgent: 1,
            Important: 2,
            Normal: 3
        };

        tasksOnDate.sort(
            (a, b) => {

                if (
                    a.status ===
                        "completed" &&
                    b.status !==
                        "completed"
                ) {

                    return 1;
                }

                if (
                    a.status !==
                        "completed" &&
                    b.status ===
                        "completed"
                ) {

                    return -1;
                }

                return (
                    (
                        priorityOrder[
                            a.priority
                        ] || 9
                    ) -
                    (
                        priorityOrder[
                            b.priority
                        ] || 9
                    )
                );
            }
        );

        const visibleTasks =
            tasksOnDate.slice(
                0,
                2
            );

        visibleTasks.forEach(
            task => {

                const taskEl =
                    document.createElement(
                        "div"
                    );

                taskEl.className =
                    "calendar-task";

                if (
                    task.status ===
                    "completed"
                ) {

                    taskEl.classList.add(
                        "completed"
                    );
                }

                taskEl.title =
                    task.title;

                const dot =
                    document.createElement(
                        "span"
                    );

                dot.className =
                    "task-dot";

                if (
                    task.priority ===
                    "Urgent"
                ) {

                    dot.classList.add(
                        "urgent"
                    );

                } else if (
                    task.priority ===
                    "Important"
                ) {

                    dot.classList.add(
                        "important"
                    );
                }

                const title =
                    document.createElement(
                        "span"
                    );

                title.textContent =
                    task.title;

                taskEl.appendChild(
                    dot
                );

                taskEl.appendChild(
                    title
                );

                cell.appendChild(
                    taskEl
                );
            }
        );

        if (
            tasksOnDate.length >
            2
        ) {

            const more =
                document.createElement(
                    "div"
                );

            more.className =
                "calendar-more";

            more.textContent =
                `+${tasksOnDate.length - 2} more`;

            cell.appendChild(
                more
            );
        }

        cell.addEventListener(
            "click",
            () => {

                selectedCalendarDate =
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );

                if (isOtherMonth) {

                    calendarDate =
                        new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            1
                        );

                    renderCalendar();

                } else {

                    document
                        .querySelectorAll(
                            ".calendar-grid .selected"
                        )
                        .forEach(
                            selectedCell => {

                                selectedCell
                                    .classList
                                    .remove(
                                        "selected"
                                    );
                            }
                        );

                    cell.classList.add(
                        "selected"
                    );
                }

                renderCalendarDayTasks();
            }
        );

        return cell;
    }

    /* =====================================================
       40. RENDER CALENDAR
       ===================================================== */

    function renderCalendar() {

        if (
            !calendarGrid ||
            !calendarMonthTitle
        ) {

            return;
        }

        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        calendarMonthTitle.textContent =
            `${monthNames[month]} ${year}`;

        calendarGrid.innerHTML =
            "";

        const weekdays = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

        weekdays.forEach(
            day => {

                const weekdayEl =
                    document.createElement(
                        "div"
                    );

                weekdayEl.className =
                    "calendar-weekday";

                weekdayEl.textContent =
                    day;

                calendarGrid.appendChild(
                    weekdayEl
                );
            }
        );

        const firstDay =
            new Date(
                year,
                month,
                1
            );

        const startDay =
            (
                firstDay.getDay() +
                6
            ) % 7;

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        const previousMonthLastDay =
            new Date(
                year,
                month,
                0
            ).getDate();

        for (
            let i =
                startDay - 1;
            i >= 0;
            i--
        ) {

            const dayNumber =
                previousMonthLastDay -
                i;

            const cell =
                createCalendarDay(
                    year,
                    month - 1,
                    dayNumber,
                    true
                );

            calendarGrid.appendChild(
                cell
            );
        }

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const cell =
                createCalendarDay(
                    year,
                    month,
                    day,
                    false
                );

            calendarGrid.appendChild(
                cell
            );
        }

        const totalDayCells =
            calendarGrid.children.length -
            7;

        const targetCells =
            totalDayCells <= 35
                ? 35
                : 42;

        const remaining =
            targetCells -
            totalDayCells;

        for (
            let day = 1;
            day <= remaining;
            day++
        ) {

            const cell =
                createCalendarDay(
                    year,
                    month + 1,
                    day,
                    true
                );

            calendarGrid.appendChild(
                cell
            );
        }

        renderCalendarDayTasks();
    }

    /* =====================================================
       41. SELECTED DATE TASKS
       ===================================================== */

    function renderCalendarDayTasks() {

        if (!calendarDayTasks) {
            return;
        }

        const dateString =
            formatCalendarDate(
                selectedCalendarDate
            );

        const readableDate =
            selectedCalendarDate.toLocaleDateString(
                "id-ID",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        if (calendarSelectedDate) {

            calendarSelectedDate.textContent =
                readableDate;
        }

        const dayTasks =
            sortTasks(
                tasks.filter(
                    task =>
                        isTaskActiveOnDate(
                            task,
                            dateString
                        )
                )
            );

        calendarDayTasks.innerHTML =
            "";

        if (
            dayTasks.length ===
            0
        ) {

            calendarDayTasks.innerHTML = `
                <div class="calendar-empty">
                    Tidak ada task pada tanggal ini.
                </div>
            `;

            return;
        }

        dayTasks.forEach(
            task => {

                calendarDayTasks.appendChild(
                    createCalendarTaskItem(
                        task
                    )
                );
            }
        );
    }

    /* =====================================================
       42. UPCOMING TASKS
       ===================================================== */

    function renderUpcomingTasks() {

        if (!upcomingTasksEl) {
            return;
        }

        const today =
            getTodayString();

        const upcoming =
            tasks
                .filter(task => {

                    if (
                        task.status ===
                        "completed"
                    ) {

                        return false;
                    }

                    const start =
                        task.startDate ||
                        task.endDate;

                    if (!start) {
                        return false;
                    }

                    return start >
                        today;
                })
                .sort(
                    (a, b) => {

                        const dateA =
                            a.startDate ||
                            a.endDate;

                        const dateB =
                            b.startDate ||
                            b.endDate;

                        return dateA.localeCompare(
                            dateB
                        );
                    }
                )
                .slice(
                    0,
                    5
                );

        upcomingTasksEl.innerHTML =
            "";

        if (
            upcoming.length ===
            0
        ) {

            upcomingTasksEl.innerHTML = `
                <div class="calendar-empty">
                    Tidak ada upcoming task.
                </div>
            `;

            return;
        }

        upcoming.forEach(
            task => {

                upcomingTasksEl.appendChild(
                    createCalendarTaskItem(
                        task
                    )
                );
            }
        );
    }

    /* =====================================================
       43. OVERDUE TASKS
       ===================================================== */

    function renderCalendarOverdueTasks() {

        if (!calendarOverdueTasks) {
            return;
        }

        const today =
            getTodayString();

        const overdue =
            tasks
                .filter(task => {

                    if (
                        task.status ===
                        "completed"
                    ) {

                        return false;
                    }

                    const end =
                        task.endDate ||
                        task.startDate;

                    if (!end) {
                        return false;
                    }

                    return end <
                        today;
                })
                .sort(
                    (a, b) => {

                        const dateA =
                            a.endDate ||
                            a.startDate;

                        const dateB =
                            b.endDate ||
                            b.startDate;

                        return dateA.localeCompare(
                            dateB
                        );
                    }
                )
                .slice(
                    0,
                    5
                );

        calendarOverdueTasks.innerHTML =
            "";

        if (
            overdue.length ===
            0
        ) {

            calendarOverdueTasks.innerHTML = `
                <div class="calendar-empty">
                    Tidak ada overdue task.
                </div>
            `;

            return;
        }

        overdue.forEach(
            task => {

                calendarOverdueTasks.appendChild(
                    createCalendarTaskItem(
                        task
                    )
                );
            }
        );
    }

    /* =====================================================
       44. CALENDAR PAGE
       ===================================================== */

    function renderCalendarPage() {

        showCalendarView();

        renderCalendar();

        renderUpcomingTasks();

        renderCalendarOverdueTasks();
    }

    /* =====================================================
       45. CALENDAR PREVIOUS
       ===================================================== */

    if (calendarPrevBtn) {

        calendarPrevBtn.addEventListener(
            "click",
            () => {

                calendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth() - 1,
                        1
                    );

                selectedCalendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth(),
                        1
                    );

                renderCalendar();
            }
        );
    }

    /* =====================================================
       46. CALENDAR NEXT
       ===================================================== */

    if (calendarNextBtn) {

        calendarNextBtn.addEventListener(
            "click",
            () => {

                calendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth() + 1,
                        1
                    );

                selectedCalendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth(),
                        1
                    );

                renderCalendar();
            }
        );
    }

    /* =====================================================
       47. CALENDAR TODAY
       ===================================================== */

    if (calendarTodayBtn) {

        calendarTodayBtn.addEventListener(
            "click",
            () => {

                const today =
                    new Date();

                calendarDate =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                    );

                selectedCalendarDate =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                    );

                renderCalendar();
            }
        );
    }

    /* =====================================================
       48. ACTIVE MENU
       ===================================================== */

    function setActiveMenu(
        target
    ) {

        menuItems.forEach(
            item => {

                const spans =
                    item.querySelectorAll(
                        ":scope > span"
                    );

                const labelElement =
                    spans[spans.length - 1];

                const label =
                    labelElement
                        ? labelElement.textContent
                            .trim()
                            .toLowerCase()
                        : "";

                item.classList.toggle(
                    "active",
                    label === target
                );
            }
        );
    }

    /* =====================================================
       49. UPDATE PAGE UI
       ===================================================== */

    function updatePageUI() {
        const config =
            pageConfig[currentNavigation] || pageConfig.dashboard;

        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent =
                currentNavigation === "category" && currentCategory
                    ? capitalize(currentCategory)
                    : config.breadcrumb;
        }

        if (pageHeadingTitle) {
            pageHeadingTitle.textContent =
                currentNavigation === "category" && currentCategory
                    ? `${capitalize(currentCategory)} tasks, organized.`
                    : config.title;
        }

        if (taskSectionTitle) {
            taskSectionTitle.textContent =
                currentNavigation === "category" && currentCategory
                    ? `${capitalize(currentCategory)} Tasks`
                    : config.taskTitle;
        }

        if (pageHeadingDescription) {
            pageHeadingDescription.textContent =
                currentNavigation === "category" && currentCategory
                    ? `Manage and organize your ${capitalize(currentCategory).toLowerCase()} tasks.`
                    : config.description;
        }

        // Tampilkan kartu statistik di Dashboard
        toggleDashboardStats(currentNavigation === "dashboard");

        // SEMBUNYIKAN AREA TASK MANAGEMENT JIKA SEDANG DI DASHBOARD
        const taskSection = document.querySelector(".task-section");
        if (taskSection) {
            if (currentNavigation === "dashboard") {
                taskSection.style.display = "none";
            } else {
                taskSection.style.display = "block";
            }
        }
    }

    /* =====================================================
       50. MENU NAVIGATION
       ===================================================== */

    menuItems.forEach(
        item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const spans =
                        item.querySelectorAll(
                            ":scope > span"
                        );

                    const labelElement =
                        spans[
                            spans.length - 1
                        ];

                    if (!labelElement) {
                        return;
                    }

                    const label =
                        labelElement.textContent
                            .trim()
                            .toLowerCase();

                    setActiveMenu(
                        label
                    );

                    clearToolbarFilters();

                    if (
                        label ===
                        "dashboard"
                    ) {

                        currentNavigation =
                            "dashboard";

                        currentCategory =
                            null;

                        currentFilter =
                            "all";

                        setActiveFilterButton(
                            "all"
                        );
                    }

                    else if (
                        label ===
                        "my tasks"
                    ) {

                        currentNavigation =
                            "tasks";

                        currentCategory =
                            null;

                        currentFilter =
                            "all";

                        setActiveFilterButton(
                            "all"
                        );
                    }

                    else if (
                        label ===
                        "important"
                    ) {

                        currentNavigation =
                            "important";

                        currentCategory =
                            null;

                        currentFilter =
                            "all";

                        setActiveFilterButton(
                            "all"
                        );
                    }

                    else if (
                        label ===
                        "calendar"
                    ) {

                        currentNavigation =
                            "calendar";

                        currentCategory =
                            null;

                        currentFilter =
                            "all";

                        setActiveFilterButton(
                            "all"
                        );
                    }

                    else if (
                        [
                            "work",
                            "personal",
                            "study",
                            "others"
                        ].includes(
                            label
                        )
                    ) {

                        currentNavigation =
                            "category";

                        currentCategory =
                            label;

                        currentFilter =
                            "all";

                        setActiveFilterButton(
                            "all"
                        );
                    }

                    updatePageUI();

                    renderAll();

                    if (
                        window.innerWidth <=
                        800
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );
                    }
                }
            );
        }
    );

    /* =====================================================
       51. CLEAR TOOLBAR FILTERS
       ===================================================== */

    function clearToolbarFilters() {

        if (searchTaskInput) searchTaskInput.value = "";

        if (categoryFilter) categoryFilter.value = "all";

        if (priorityFilter) priorityFilter.value = "all";

        if (deadlineFilter) deadlineFilter.value = "all";
    }

    /* =====================================================
       52. CLEAR ALL FILTERS
       ===================================================== */

    function clearAllFilters() {

        currentNavigation =
            "dashboard";

        currentCategory =
            null;

        currentFilter =
            "all";

        clearToolbarFilters();

        setActiveFilterButton(
            "all"
        );

        setActiveMenu(
            "dashboard"
        );

        updatePageUI();

        renderAll();
    }

    /* =====================================================
       53. ACTIVE FILTER BUTTON
       ===================================================== */

    function setActiveFilterButton(
        filter
    ) {

        filterButtons.forEach(
            button => {

                const value =
                    button.textContent
                        .trim()
                        .toLowerCase();

                button.classList.toggle(
                    "active",
                    value === filter
                );
            }
        );
    }

    /* =====================================================
       54. SEARCH TOP BUTTON
       ===================================================== */

    if (topSearchBtn) {
        topSearchBtn.addEventListener("click", () => {

            if (currentNavigation === "calendar") {
                currentNavigation = "dashboard";
                currentCategory = null;
                currentFilter = "all";

                setActiveMenu("dashboard");
                setActiveFilterButton("all");
                updatePageUI();
                renderAll();
            }

            showTaskList();

            setTimeout(() => {
                if (searchTaskInput) {
                    searchTaskInput.focus();
                    searchTaskInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }, 100);
        });
    }

    /* =====================================================
       55. DARK MODE
       ===================================================== */

    const darkModeBtn = document.getElementById("darkModeBtn");

    function applyDarkMode(enabled) {
        document.body.classList.toggle("dark-mode", enabled);

        try {
            localStorage.setItem("taskflow_dark_mode", enabled ? "true" : "false");
        } catch (error) {
            console.error("TaskFlow: gagal menyimpan pengaturan tema.", error);
        }

        if (darkModeBtn) {
            darkModeBtn.textContent = enabled ? "☀" : "◐";
            darkModeBtn.setAttribute(
                "aria-label",
                enabled ? "Switch to light mode" : "Switch to dark mode"
            );
            darkModeBtn.setAttribute("title", enabled ? "Light Mode" : "Dark Mode");
        }
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            applyDarkMode(!document.body.classList.contains("dark-mode"));
        });
    }

    const savedDarkMode =
        localStorage.getItem(
            "taskflow_dark_mode"
        );

    applyDarkMode(
        savedDarkMode ===
        "true"
    );

    /* =====================================================
       56. SETTINGS, BACKUP/RESTORE & PROFILE (FIXED)
       ===================================================== */

    // Hapus deklarasi const settingsBtn dan settingsModal di sini
    // langsung ambil elemen-elemen baru untuk fitur Settings:
    const settingDefaultCategory = document.getElementById("settingDefaultCategory");
    const settingDefaultPriority = document.getElementById("settingDefaultPriority");
    const exportDataBtn = document.getElementById("exportDataBtn");
    const importDataBtn = document.getElementById("importDataBtn");
    const importFileInput = document.getElementById("importFileInput");
    const clearAllDataBtn = document.getElementById("clearAllDataBtn");

    // Helper Buka / Tutup Modal
    function openTaskflowPanel(modal) {
        if (!modal) return;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeTaskflowPanel(modal) {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        syncModalLock();
    }

    // A. Buka Modal Settings
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener("click", () => {
            if (settingDefaultCategory) {
                settingDefaultCategory.value = localStorage.getItem("taskflow_default_category") || "Work";
            }
            if (settingDefaultPriority) {
                settingDefaultPriority.value = localStorage.getItem("taskflow_default_priority") || "Normal";
            }
            openTaskflowPanel(settingsModal);
        });
    }

    // B. Tombol Simpan Pengaturan (Save Settings)
        // B. Simpan otomatis: nilai default tersimpan begitu dipilih
    function saveDefaultSetting(storageKey, value, label) {
        try {
            localStorage.setItem(storageKey, value);
            showToast(`${label} default: ${value}`, "success");
        } catch (error) {
            console.error("TaskFlow: gagal menyimpan pengaturan.", error);
            showToast("Pengaturan tidak dapat disimpan. Pastikan browser mengizinkan localStorage.", "error");
        }
    }

    if (settingDefaultCategory) {
        settingDefaultCategory.addEventListener("change", () => {
            saveDefaultSetting("taskflow_default_category", settingDefaultCategory.value, "Kategori");
        });
    }

    if (settingDefaultPriority) {
        settingDefaultPriority.addEventListener("change", () => {
            saveDefaultSetting("taskflow_default_priority", settingDefaultPriority.value, "Prioritas");
        });
    }

    
if (exportDataBtn) {
    exportDataBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (!Array.isArray(tasks) || tasks.length === 0) {
            showToast("Tidak ada data tugas untuk diexport.", "error");
            return;
        }

        let downloadUrl = null;

        try {
            const backupData = JSON.stringify(tasks, null, 2);
            const backupBlob = new Blob(
                [backupData],
                { type: "application/json;charset=utf-8" }
            );

            downloadUrl = URL.createObjectURL(backupBlob);

            const dateFileName = new Date()
                .toISOString()
                .slice(0, 10);

            const downloadAnchor = document.createElement("a");
            downloadAnchor.href = downloadUrl;
            downloadAnchor.download =
                `taskflow-backup-${dateFileName}.json`;

            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            showToast("Backup data berhasil diunduh!", "success");
        } catch (error) {
            console.error("TaskFlow: gagal mengekspor backup.", error);
            showToast("Backup gagal dibuat. Silakan coba lagi.", "error");
        } finally {
            if (downloadUrl) {
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            }
        }
    });
}


    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener("click", (e) => {
            e.preventDefault();
            importFileInput.click();
        });

        importFileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (!Array.isArray(parsed)) {
                        throw new Error("Format file JSON tidak valid.");
                    }

                    // Bersihkan & validasi tiap item (sama seperti saat load)
                    const importedTasks = parsed.map(normalizeTask).filter(Boolean);
                    const skipped = parsed.length - importedTasks.length;

                    if (importedTasks.length === 0) {
                        showToast("Tidak ada tugas yang valid di file ini.", "error");
                        return;
                    }

                    const skippedNote = skipped > 0
                        ? ` (${skipped} item tidak valid dilewati)`
                        : "";

                    showCustomConfirm(
                        "Restore Data?",
                        `Apakah kamu yakin ingin mengimpor ${importedTasks.length} tugas${skippedNote}? Data lama akan digabungkan.`,
                        () => {
                            const existingIds = new Set(tasks.map(t => t.id));
                            const newTasks = [];
                            importedTasks.forEach(t => {
                                if (!existingIds.has(t.id)) {
                                    existingIds.add(t.id);
                                    newTasks.push(t);
                                }
                            });
                            tasks = [...newTasks, ...tasks];
                            saveTasks();
                            renderAll();
                            closeTaskflowPanel(settingsModal);
                            showToast(`${newTasks.length} tugas berhasil dipulihkan!`, "success");
                        }
                    );
                } catch (err) {
                    showToast("Gagal mengimpor data! Pastikan file berupa backup JSON dari TaskFlow.", "error");
                }
            };
            reader.readAsText(file);
            importFileInput.value = "";
        });
    }

    // E. Fitur Reset / Clear Data
    if (clearAllDataBtn) {
                clearAllDataBtn.addEventListener("click", (e) => {
            e.preventDefault();

            showCustomConfirm(
                "Hapus semua data?",
                "Seluruh tugasmu akan dihapus permanen dari browser ini. Tindakan ini tidak bisa dibatalkan.",
                () => {
                    tasks = [];
                    saveTasks();
                    renderAll();
                    closeTaskflowPanel(settingsModal);
                    showToast("Seluruh data tugas berhasil dihapus.", "info");
                },
                {
                    confirmText: "Hapus semua",
                    danger: true,
                    extraText: "Backup dulu",
                    onExtra: () => exportDataBtn && exportDataBtn.click()
                }
            );
        });
    }

    // F. TOMBOL CLOSE DAN SILANG (×)
    if (settingsModal) {
        const closeBtns = settingsModal.querySelectorAll(".close-btn, .cancel-btn, [data-close-modal]");
        closeBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                closeTaskflowPanel(settingsModal);
            });
        });

        settingsModal.addEventListener("click", (event) => {
            if (event.target === settingsModal) {
                closeTaskflowPanel(settingsModal);
            }
        });
    }

    /* =====================================================
       57. PROFILE
       ===================================================== */
    function getProfileName() {
        try {
            return (localStorage.getItem("taskflow_profile_name") || "").trim();
        } catch (error) {
            return "";
        }
    }

    function getInitials(name) {
        const parts = name.split(/\s+/).filter(Boolean);

        if (parts.length === 0) {
            return "";
        }

        // Satu kata -> 2 huruf pertama; lebih dari satu -> huruf awal kata pertama & terakhir
        const letters = parts.length === 1
            ? Array.from(parts[0]).slice(0, 2)
            : [
                Array.from(parts[0])[0],
                Array.from(parts[parts.length - 1])[0]
            ];

        return letters.join("").toUpperCase();
    }

    function applyProfile() {
        const name = getProfileName();

        if (avatarBtn) {
            avatarBtn.textContent = getInitials(name) || "SN";
            avatarBtn.setAttribute("title", name ? `${name} (edit profile)` : "Edit profile");
            avatarBtn.setAttribute("aria-label", name ? `Profile: ${name}` : "Profile");
        }

        updateGreeting();
    }

    if (avatarBtn && profileModal && profileForm && profileNameInput) {
        avatarBtn.addEventListener("click", () => {
            profileNameInput.value = getProfileName();
            openTaskflowPanel(profileModal);

            setTimeout(() => {
                profileNameInput.focus();
                profileNameInput.select();
            }, 50);
        });

        profileForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = profileNameInput.value.trim().replace(/\s+/g, " ");

            if (!name) {
                showToast("Nama tidak boleh kosong.", "error");
                profileNameInput.focus();
                return;
            }

            try {
                localStorage.setItem("taskflow_profile_name", name);
            } catch (error) {
                console.error("TaskFlow: gagal menyimpan profil.", error);
                showToast("Profil tidak dapat disimpan. Pastikan browser mengizinkan localStorage.", "error");
                return;
            }

            applyProfile();
            closeTaskflowPanel(profileModal);
            showToast("Profil berhasil disimpan!", "success");
        });

        profileModal.querySelectorAll("[data-close-modal]").forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                closeTaskflowPanel(profileModal);
            });
        });

        profileModal.addEventListener("click", event => {
            if (event.target === profileModal) {
                closeTaskflowPanel(profileModal);
            }
        });
    }

    /* =====================================================
       58. MOBILE MENU
       ===================================================== */

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }

    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth <=
                    800 &&
                sidebar.classList.contains(
                    "open"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !mobileMenuBtn.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }
    );

    /* =====================================================
   NOTIFICATION SYSTEM LOGIC
   ===================================================== */
const notifBtn = document.getElementById("notifBtn");
const notifBadge = document.getElementById("notifBadge");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");

function updateNotifications() {
    if (!notifList || !notifBadge) return;

    const todayStr = getTodayString();
    
    // Cari tugas overdue dan tugas due today yang belum selesai
    const overdueTasks = tasks.filter(t => t.status !== "completed" && t.endDate && t.endDate < todayStr);
    const todayTasks = tasks.filter(t => t.status !== "completed" && t.endDate === todayStr);

    const totalAlerts = overdueTasks.length + todayTasks.length;

    // Update Badge Red Dot
    if (totalAlerts > 0) {
        notifBadge.textContent = totalAlerts > 9 ? "9+" : totalAlerts;
        notifBadge.style.display = "flex";
    } else {
        notifBadge.style.display = "none";
    }

    // Render List Notifikasi
    notifList.innerHTML = "";

    if (totalAlerts === 0) {
        notifList.innerHTML = `<div class="notif-empty">Tidak ada notifikasi. Semua tugas aman!</div>`;
        return;
    }

    overdueTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "notif-item urgent";
        item.innerHTML = `
            <div class="notif-item-title">Task Overdue!</div>
            <div class="notif-item-desc">"${escapeHTML(task.title)}" sudah melewati deadline.</div>
        `;
        notifList.appendChild(item);
    });

    todayTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "notif-item";
        item.innerHTML = `
            <div class="notif-item-title">Jatuh Tempo Hari Ini</div>
            <div class="notif-item-desc">Selesaikan "${escapeHTML(task.title)}" sebelum hari ini berakhir.</div>
        `;
        notifList.appendChild(item);
    });
}

// Toggle Dropdown Notifikasi Saat Diklik
if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.style.display === "block";
        notifDropdown.style.display = isOpen ? "none" : "block";
    });

    // Tutup dropdown jika klik di luar
    document.addEventListener("click", (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
            notifDropdown.style.display = "none";
        }
    });
}

    /* =====================================================
       59. PAGE DATE
       ===================================================== */

    function updatePageDate() {

        const dateElement =
            document.querySelector(
                ".page-heading .date"
            );

        if (!dateElement) {
            return;
        }

        dateElement.textContent =
            new Date().toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }

    /* =====================================================
       60. GREETING
       ===================================================== */

    function updateGreeting() {
        const greeting = document.querySelector(".greeting");

        if (!greeting) {
            return;
        }

        const hour = new Date().getHours();
        let text = "Good morning";

        if (hour >= 18) {
            text = "Good evening";
        } else if (hour >= 12) {
            text = "Good afternoon";
        }

        const firstName = getProfileName().split(/\s+/)[0];

        // textContent (bukan innerHTML) -> nama aman dari injeksi HTML
        greeting.textContent = firstName ? `${text}, ${firstName}` : text;
    }

    /* =====================================================
       60b. DASHBOARD: UP NEXT
       ===================================================== */
    function renderUpNext() {
        const listEl = document.getElementById("upNextList");
        const viewAllBtn = document.getElementById("upNextViewAll");

        if (!listEl) {
            return;
        }

        const priorityOrder = { Urgent: 1, Important: 2, Normal: 3 };
        const noDeadline = "9999-12-31";

        // Belum selesai, diurutkan: deadline terdekat (overdue paling atas),
        // lalu prioritas, lalu yang paling baru dibuat.
        const pending = tasks
            .filter(task => task.status !== "completed")
            .sort((a, b) => {
                const dateA = a.endDate || noDeadline;
                const dateB = b.endDate || noDeadline;

                if (dateA !== dateB) {
                    return dateA < dateB ? -1 : 1;
                }

                const priorityA = priorityOrder[a.priority] || 9;
                const priorityB = priorityOrder[b.priority] || 9;

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                return new Date(b.createdAt) - new Date(a.createdAt);
            });

        const visible = pending.slice(0, 5);
        const hiddenCount = pending.length - visible.length;

        listEl.innerHTML = "";

        if (visible.length === 0) {
            const empty = document.createElement("div");
            empty.className = "up-next-empty";
            empty.textContent = tasks.length === 0
                ? "No tasks yet. Add your first task to see it here."
                : "No pending tasks. Nice work!";
            listEl.appendChild(empty);
        } else {
            visible.forEach(task => {
                listEl.appendChild(createTaskElement(task));
            });
        }

        if (viewAllBtn) {
            viewAllBtn.textContent = hiddenCount > 0
                ? `View all (${hiddenCount} more)`
                : "View all";
        }
    }

    const upNextViewAllBtn = document.getElementById("upNextViewAll");

    if (upNextViewAllBtn) {
        upNextViewAllBtn.addEventListener("click", () => {
            const target = Array.from(menuItems).find(item =>
                item.textContent.trim().toLowerCase().endsWith("my tasks")
            );

            if (target) {
                target.click();
            }
        });
    }

    /* =====================================================
       61. RENDER ALL
       ===================================================== */

    function renderAll() {

        updateStats();

        updateProductivity();
        updateNotifications();
        renderUpNext();
        updatePageUI();

        if (
            currentNavigation ===
            "calendar"
        ) {

            renderCalendarPage();

            return;
        }

        renderTasks();
    }

    /* =====================================================
       62. INITIALIZATION
       ===================================================== */

    updatePageDate();

    applyProfile();

    setActiveFilterButton(
        "all"
    );

    setActiveMenu(
        "dashboard"
    );

    updatePageUI();

    if (calendarView) {

        calendarView.style.display =
            "none";
    }

    renderAll();

});