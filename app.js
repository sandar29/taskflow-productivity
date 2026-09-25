document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // DOM ELEMENTS
    // =========================================
    const taskModal = document.getElementById("taskModal");
    const deleteModal = document.getElementById("deleteModal");
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
    const iconButtons = document.querySelectorAll(".top-actions .icon-btn");
    const avatarBtn = document.querySelector(".avatar");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const sidebar = document.querySelector(".sidebar");
    const addTaskButtons = document.querySelectorAll(".add-task-btn, .empty-add-btn");
    const dashboardStatsSection = document.getElementById("dashboardStatsSection");

    // Header & Toolbar Elements
    const taskSectionHeader = document.querySelector(".task-section .section-header");
    const taskToolbar = document.querySelector(".task-toolbar");

    // Delete modal elements
    const deleteModalTitle = document.getElementById("deleteModalTitle");
    const deleteModalMessage = document.getElementById("deleteModalMessage");
    const deleteCancelBtn = document.getElementById("deleteCancelBtn");
    const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

    // =========================================
    // CALENDAR DOM
    // =========================================
    const calendarView = document.getElementById("calendarView");
    const calendarMonthTitle = document.getElementById("calendarMonthTitle");
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarTodayBtn = document.getElementById("calendarTodayBtn");
    const calendarPrevBtn = document.getElementById("calendarPrevBtn");
    const calendarNextBtn = document.getElementById("calendarNextBtn");
    const calendarSelectedDate = document.getElementById("calendarSelectedDate");
    const calendarDayTasks = document.getElementById("calendarDayTasks");
    const upcomingTasksEl = document.getElementById("upcomingTasks");
    const calendarOverdueTasks = document.getElementById("calendarOverdueTasks");

    // =========================================
    // STATE
    // =========================================
    let tasks = loadTasks();
    let editingTaskId = null;
    let currentFilter = "all";
    let currentNavigation = "dashboard";
    let currentCategory = null;
    let taskToDeleteId = null;

    // =========================================
    // CALENDAR STATE
    // =========================================
    const todayDate = new Date();
    let calendarDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    let selectedCalendarDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

    // =========================================
    // LOAD TASKS
    // =========================================
    function loadTasks() {
        try {
            const saved = JSON.parse(localStorage.getItem("taskflow_tasks"));
            if (!Array.isArray(saved)) {
                return [];
            }
            return saved.map(task => {
                let status = task.status;
                if (!status) {
                    status = task.completed ? "completed" : "not-started";
                }
                return {
                    ...task,
                    description: task.description || "",
                    startDate: task.startDate || "",
                    endDate: task.endDate || task.date || "",
                    status,
                    completed: status === "completed"
                };
            });
        } catch (error) {
            console.error("Gagal membaca task:", error);
            return [];
        }
    }

    // =========================================
    // SAVE TASKS
    // =========================================
    function saveTasks() {
        localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }

    // =========================================
    // GENERATE ID
    // =========================================
    function generateId() {
        return Date.now().toString() + Math.random().toString(36).substring(2, 8);
    }

    // =========================================
    // ESCAPE HTML
    // =========================================
    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // =========================================
    // TODAY STRING
    // =========================================
    function getTodayString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // =========================================
    // PARSE DATE
    // =========================================
    function parseDate(dateString) {
        if (!dateString) return null;
        const parts = dateString.split("-");
        if (parts.length !== 3) return null;
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    // =========================================
    // FORMAT DATE
    // =========================================
    function formatDate(dateString) {
        if (!dateString) return "";
        const date = parseDate(dateString);
        if (!date) return "";
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // =========================================
    // DATE DIFFERENCE
    // =========================================
    function getDayDifference(startDate, endDate) {
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        if (!start || !end) return null;
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    // =========================================
    // DEADLINE STATUS
    // =========================================
    function getDeadlineStatus(task) {
        if (!task.endDate) {
            return { type: "none", text: "No deadline" };
        }
        if (task.status === "completed") {
            return { type: "completed", text: "Completed" };
        }
        const today = parseDate(getTodayString());
        const endDate = parseDate(task.endDate);
        if (!endDate) {
            return { type: "none", text: "No deadline" };
        }
        const difference = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (difference < 0) {
            return { type: "overdue", text: "Overdue" };
        }
        if (difference === 0) {
            return { type: "today", text: "Due today" };
        }
        return { type: "upcoming", text: `${difference} day${difference > 1 ? "s" : ""} left` };
    }

    // =========================================
    // STATUS LABEL
    // =========================================
    function getStatusLabel(status) {
        switch (status) {
            case "in-progress": return "In Progress";
            case "completed": return "Completed";
            default: return "Not Started";
        }
    }

    // =========================================
    // OPEN ADD MODAL
    // =========================================
    function openAddModal() {
        editingTaskId = null;
        taskModalTitle.textContent = "Add New Task";
        taskForm.reset();
        taskCategoryInput.value = "Work";
        taskPriorityInput.value = "Normal";
        taskStatusInput.value = "not-started";
        taskStartDateInput.value = getTodayString();
        taskEndDateInput.value = getTodayString();
        updateDateInfo();
        const saveButton = taskForm.querySelector(".save-btn");
        if (saveButton) {
            saveButton.textContent = "Add Task";
        }
        taskModal.classList.add("active");
        taskModal.setAttribute("aria-hidden", "false");
        setTimeout(() => taskTitleInput.focus(), 100);
    }

    // =========================================
    // OPEN EDIT MODAL
    // =========================================
    function openEditModal(taskId) {
        const task = tasks.find(item => item.id === taskId);
        if (!task) return;
        editingTaskId = taskId;
        taskModalTitle.textContent = "Edit Task";
        taskTitleInput.value = task.title || "";
        taskDescriptionInput.value = task.description || "";
        taskCategoryInput.value = task.category || "Work";
        taskPriorityInput.value = task.priority || "Normal";
        taskStatusInput.value = task.status || "not-started";
        taskStartDateInput.value = task.startDate || "";
        taskEndDateInput.value = task.endDate || "";
        updateDateInfo();
        const saveButton = taskForm.querySelector(".save-btn");
        if (saveButton) {
            saveButton.textContent = "Save Changes";
        }
        taskModal.classList.add("active");
        taskModal.setAttribute("aria-hidden", "false");
        setTimeout(() => taskTitleInput.focus(), 100);
    }

    // =========================================
    // CLOSE MODAL
    // =========================================
    function closeModal() {
        taskModal.classList.remove("active");
        taskModal.setAttribute("aria-hidden", "true");
        editingTaskId = null;
        taskForm.reset();
        taskDateInfo.textContent = "Set a start and end date to track the task period.";
        taskDateInfo.classList.remove("error");
    }

    // =========================================
    // DATE INFO
    // =========================================
    function updateDateInfo() {
        const startDate = taskStartDateInput.value;
        const endDate = taskEndDateInput.value;
        taskDateInfo.classList.remove("error");
        if (!startDate && !endDate) {
            taskDateInfo.textContent = "Set a start and end date to track the task period.";
            return;
        }
        if (startDate && !endDate) {
            taskDateInfo.textContent = `Task starts ${formatDate(startDate)}.`;
            return;
        }
        if (!startDate && endDate) {
            taskDateInfo.textContent = `Task deadline: ${formatDate(endDate)}.`;
            return;
        }
        const difference = getDayDifference(startDate, endDate);
        if (difference < 0) {
            taskDateInfo.textContent = "End date cannot be earlier than start date.";
            taskDateInfo.classList.add("error");
            return;
        }
        if (difference === 0) {
            taskDateInfo.textContent = `Task scheduled for ${formatDate(startDate)}.`;
            return;
        }
        taskDateInfo.textContent = `Task period: ${formatDate(startDate)} → ${formatDate(endDate)} (${difference + 1} days).`;
    }

    // =========================================
    // FORM SUBMIT
    // =========================================
    taskForm.addEventListener("submit", event => {
        event.preventDefault();
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const category = taskCategoryInput.value;
        const priority = taskPriorityInput.value;
        const status = taskStatusInput.value;
        const startDate = taskStartDateInput.value;
        const endDate = taskEndDateInput.value;

        if (!title) {
            alert("Task title harus diisi.");
            taskTitleInput.focus();
            return;
        }
        if (startDate && endDate && endDate < startDate) {
            alert("End date tidak boleh lebih awal dari Start date.");
            taskEndDateInput.focus();
            return;
        }

        if (editingTaskId) {
            const index = tasks.findIndex(task => task.id === editingTaskId);
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
                    completed: status === "completed"
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
                completed: status === "completed",
                createdAt: new Date().toISOString()
            });
        }
        saveTasks();
        closeModal();
        renderAll();
    });

    // =========================================
    // DATE EVENTS
    // =========================================
    taskStartDateInput.addEventListener("change", () => {
        if (taskEndDateInput.value && taskStartDateInput.value > taskEndDateInput.value) {
            taskEndDateInput.value = taskStartDateInput.value;
        }
        updateDateInfo();
    });
    taskEndDateInput.addEventListener("change", updateDateInfo);

    // =========================================
    // ADD BUTTONS
    // =========================================
    addTaskButtons.forEach(button => {
        button.addEventListener("click", openAddModal);
    });

    // =========================================
    // CLOSE MODAL BUTTONS
    // =========================================
    closeModalBtn.addEventListener("click", closeModal);
    cancelTaskBtn.addEventListener("click", closeModal);
    taskModal.addEventListener("click", event => {
        if (event.target === taskModal) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && taskModal.classList.contains("active")) closeModal();
        if (event.key === "Escape" && deleteModal.classList.contains("active")) closeDeleteModal();
    });

    // =========================================
    // DELETE MODAL FUNCTIONS
    // =========================================
    function openDeleteModal(taskId) {
        const task = tasks.find(item => item.id === taskId);
        if (!task) return;
        taskToDeleteId = taskId;
        deleteModalTitle.textContent = "Delete Task?";
        deleteModalMessage.textContent = `Are you sure you want to delete "${escapeHTML(task.title)}"? This action cannot be undone.`;
        deleteModal.classList.add("active");
        deleteModal.setAttribute("aria-hidden", "false");
        deleteConfirmBtn.focus();
    }

    function closeDeleteModal() {
        deleteModal.classList.remove("active");
        deleteModal.setAttribute("aria-hidden", "true");
        taskToDeleteId = null;
    }

    deleteCancelBtn.addEventListener("click", closeDeleteModal);
    deleteConfirmBtn.addEventListener("click", () => {
        if (taskToDeleteId) {
            tasks = tasks.filter(item => item.id !== taskToDeleteId);
            saveTasks();
            closeDeleteModal();
            renderAll();
        }
    });
    deleteModal.addEventListener("click", event => {
        if (event.target === deleteModal) closeDeleteModal();
    });

    // =========================================
    // STATUS FILTER
    // =========================================
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.textContent.trim().toLowerCase();
            currentFilter = filter;
            if (currentNavigation === "calendar") {
                currentNavigation = "dashboard";
                currentCategory = null;
                updateBreadcrumb("Dashboard");
                setActiveMenu("dashboard");
            }
            setActiveFilterButton(filter);
            renderAll();
        });
    });

    // =========================================
    // SEARCH & TOOLBAR FILTERS
    // =========================================
    const handleFilterChange = () => {
        if (currentNavigation === "calendar") {
            currentNavigation = "dashboard";
            updateBreadcrumb("Dashboard");
            setActiveMenu("dashboard");
        }
        renderAll();
    };

    searchTaskInput.addEventListener("input", handleFilterChange);
    categoryFilter.addEventListener("change", handleFilterChange);
    priorityFilter.addEventListener("change", handleFilterChange);
    deadlineFilter.addEventListener("change", handleFilterChange);

    // =========================================
    // GET FILTERED TASKS
    // =========================================
    function getFilteredTasks() {
        const search = searchTaskInput.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const priority = priorityFilter.value;
        const deadline = deadlineFilter.value;

        return tasks.filter(task => {
            if (currentNavigation === "important") {
                if (task.priority !== "Important" && task.priority !== "Urgent") return false;
            }
            if (currentNavigation === "category" && currentCategory) {
                const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
                if (task.category !== categoryName) return false;
            }

            if (currentFilter === "pending" && task.status === "completed") return false;
            if (currentFilter === "completed" && task.status !== "completed") return false;

            if (search) {
                const title = String(task.title || "").toLowerCase();
                const taskCategory = String(task.category || "").toLowerCase();
                const taskPriority = String(task.priority || "").toLowerCase();
                const description = String(task.description || "").toLowerCase();
                const status = getStatusLabel(task.status).toLowerCase();
                const searchableText = `${title} ${taskCategory} ${taskPriority} ${description} ${status}`;
                if (!searchableText.includes(search)) return false;
            }

            if (category !== "all" && task.category !== category) return false;
            if (priority !== "all" && task.priority !== priority) return false;

            if (deadline !== "all") {
                const deadlineStatus = getDeadlineStatus(task);
                if (deadline === "today" && deadlineStatus.type !== "today") return false;
                if (deadline === "upcoming" && deadlineStatus.type !== "upcoming") return false;
                if (deadline === "overdue" && deadlineStatus.type !== "overdue") return false;
                if (deadline === "none" && deadlineStatus.type !== "none") return false;
            }

            return true;
        });
    }

    // =========================================
    // TOGGLE DASHBOARD STATS
    // =========================================
    function toggleDashboardStats(show = true) {
        if (dashboardStatsSection) {
            dashboardStatsSection.style.display = show ? "" : "none";
        }
    }

    // =========================================
    // SHOW TASK LIST / CALENDAR
    // =========================================
    function showTaskList() {
        if (taskList) taskList.style.display = "";
        if (calendarView) calendarView.style.display = "none";
        
        if (taskSectionHeader) taskSectionHeader.style.display = "";
        if (taskToolbar) taskToolbar.style.display = "";
    }

    function showCalendarView() {
        if (taskList) taskList.style.display = "none";
        if (calendarView) calendarView.style.display = "block";
        
        if (taskSectionHeader) taskSectionHeader.style.display = "none";
        if (taskToolbar) taskToolbar.style.display = "none";
    }

    // =========================================
    // CREATE MAIN TASK ELEMENT
    // =========================================
    function createTaskElement(task) {
        const element = document.createElement("div");
        element.className = "task-item";
        if (task.status === "completed") {
            element.classList.add("completed");
        }

        const deadlineStatus = getDeadlineStatus(task);
        const statusLabel = getStatusLabel(task.status);
        const statusClass = task.status || "not-started";
        const startText = task.startDate ? formatDate(task.startDate) : null;
        const endText = task.endDate ? formatDate(task.endDate) : null;

        let dateHTML = "";
        if (startText && endText) {
            dateHTML = `
                <span class="deadline ${deadlineStatus.type}">${startText} → ${endText}</span>
                <span class="deadline-status ${deadlineStatus.type}">${deadlineStatus.text}</span>
            `;
        } else if (endText) {
            dateHTML = `
                <span class="deadline ${deadlineStatus.type}">Due ${endText}</span>
                <span class="deadline-status ${deadlineStatus.type}">${deadlineStatus.text}</span>
            `;
        } else if (startText) {
            dateHTML = `<span class="deadline">Starts ${startText}</span>`;
        } else {
            dateHTML = `<span class="deadline">No deadline</span>`;
        }

        let descriptionHTML = task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : "";

        element.innerHTML = `
            <button class="task-checkbox ${task.status === "completed" ? "checked" : ""}" type="button" aria-label="${task.status === "completed" ? "Mark as pending" : "Mark as completed"}">
                ${task.status === "completed" ? "✓" : ""}
            </button>
            <div class="task-content">
                <div class="task-title-row">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                </div>
                ${descriptionHTML}
                <div class="task-meta">
                    <span class="category ${String(task.category || "").toLowerCase()}">${escapeHTML(task.category || "Others")}</span>
                    <span class="priority ${String(task.priority || "").toLowerCase()}">${escapeHTML(task.priority || "Normal")}</span>
                    <span class="task-status ${statusClass}">
                        <span class="task-status-dot"></span>${statusLabel}
                    </span>
                    ${dateHTML}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action edit" type="button" title="Edit task" aria-label="Edit task">✎</button>
                <button class="task-action delete" type="button" title="Delete task" aria-label="Delete task">×</button>
            </div>
        `;

        element.querySelector(".task-checkbox").addEventListener("click", () => toggleTask(task.id));
        element.querySelector(".task-action.edit").addEventListener("click", () => openEditModal(task.id));
        element.querySelector(".task-action.delete").addEventListener("click", () => openDeleteModal(task.id));

        return element;
    }

    // =========================================
    // RENDER TASKS
    // =========================================
    function renderTasks() {
        showTaskList();
        const filteredTasks = getFilteredTasks();
        taskList.innerHTML = "";

        if (filteredTasks.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            const hasAnyTasks = tasks.length > 0;

            if (hasAnyTasks) {
                empty.innerHTML = `
                    <div class="empty-icon">⌕</div>
                    <h3>No matching tasks</h3>
                    <p>Try changing your search or filter.</p>
                    <button class="empty-add-btn" type="button" id="clearFiltersBtn">Clear Filters</button>
                `;
            } else {
                empty.innerHTML = `
                    <div class="empty-icon">✓</div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task and start getting things done.</p>
                    <button class="empty-add-btn" type="button" id="emptyAddTaskBtn">+ Add New Task</button>
                `;
            }
            taskList.appendChild(empty);

            const clearButton = document.getElementById("clearFiltersBtn");
            if (clearButton) clearButton.addEventListener("click", clearAllFilters);

            const emptyAddButton = document.getElementById("emptyAddTaskBtn");
            if (emptyAddButton) emptyAddButton.addEventListener("click", openAddModal);

            return;
        }

        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;
            if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
            if (a.priority !== "Urgent" && b.priority === "Urgent") return 1;

            const dateA = parseDate(a.startDate || a.endDate);
            const dateB = parseDate(b.startDate || b.endDate);
            if (dateA && dateB) return dateA - dateB;
            return 0;
        });

        sortedTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }

    // =========================================
    // TOGGLE TASK
    // =========================================
    function toggleTask(taskId) {
        const task = tasks.find(item => item.id === taskId);
        if (!task) return;

        if (task.status === "completed") {
            task.status = "in-progress";
            task.completed = false;
        } else {
            task.status = "completed";
            task.completed = true;
        }
        saveTasks();
        renderAll();
    }

    // =========================================
    // STATISTICS & PRODUCTIVITY
    // =========================================
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === "completed").length;
        const overdue = tasks.filter(task => task.status !== "completed" && getDeadlineStatus(task).type === "overdue").length;
        const pending = tasks.filter(task => task.status !== "completed").length;

        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
        overdueTasksEl.textContent = overdue;
    }

    function updateProductivity() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === "completed").length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressPercentageEl.textContent = `${percentage}%`;
        progressTextEl.textContent = `${completed} of ${total} tasks completed`;
        progressBarEl.style.width = `${percentage}%`;

        if (total === 0) progressRemainingEl.textContent = "No tasks yet";
        else if (percentage === 100) progressRemainingEl.textContent = "All tasks completed";
        else if (percentage >= 75) progressRemainingEl.textContent = "Almost there";
        else if (percentage >= 50) progressRemainingEl.textContent = "Good progress";
        else progressRemainingEl.textContent = "Keep going";
    }

    // =========================================
    // CALENDAR HELPERS
    // =========================================
    function formatCalendarDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function isTaskActiveOnDate(task, dateString) {
        if (!task.startDate && !task.endDate) return false;
        const start = task.startDate || task.endDate;
        const end = task.endDate || task.startDate;
        return dateString >= start && dateString <= end;
    }

    // =========================================
    // CALENDAR ITEM CREATION
    // =========================================
    function createCalendarTaskItem(task) {
        const item = document.createElement("div");
        item.className = "calendar-task-item";
        if (task.status === "completed") item.classList.add("completed");

        const priorityClass = String(task.priority || "Normal").toLowerCase();
        const statusLabel = getStatusLabel(task.status);
        const startDate = task.startDate ? formatDate(task.startDate) : "";
        const endDate = task.endDate ? formatDate(task.endDate) : "";

        let dateText = "No deadline";
        if (startDate && endDate) {
            dateText = startDate === endDate ? startDate : `${startDate} → ${endDate}`;
        } else if (endDate) {
            dateText = `Due ${endDate}`;
        } else if (startDate) {
            dateText = `Starts ${startDate}`;
        }

        item.innerHTML = `
            <button type="button" class="calendar-task-check ${task.status === "completed" ? "checked" : ""}" aria-label="${task.status === "completed" ? "Mark as pending" : "Mark as completed"}">
                ${task.status === "completed" ? "✓" : ""}
            </button>
            <div class="calendar-task-main">
                <div class="calendar-task-title">${escapeHTML(task.title)}</div>
                <div class="calendar-task-info">
                    <span class="calendar-task-date">${escapeHTML(dateText)}</span>
                    <span class="calendar-task-category">${escapeHTML(task.category || "Others")}</span>
                    <span class="calendar-task-priority ${priorityClass}">${escapeHTML(task.priority || "Normal")}</span>
                    <span class="calendar-task-status">${statusLabel}</span>
                </div>
            </div>
            <div class="calendar-task-actions">
                <button type="button" class="calendar-edit-btn" title="Edit task" aria-label="Edit task">✎</button>
                <button type="button" class="calendar-delete-btn" title="Delete task" aria-label="Delete task">×</button>
            </div>
        `;

        item.querySelector(".calendar-task-check").addEventListener("click", event => {
            event.stopPropagation();
            toggleTask(task.id);
        });
        item.querySelector(".calendar-edit-btn").addEventListener("click", event => {
            event.stopPropagation();
            openEditModal(task.id);
        });
        item.querySelector(".calendar-delete-btn").addEventListener("click", event => {
            event.stopPropagation();
            openDeleteModal(task.id);
        });

        return item;
    }

    function createCalendarDay(year, month, day, isOtherMonth = false) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        const date = new Date(year, month, day);
        const dateString = formatCalendarDate(date);

        if (isOtherMonth) cell.classList.add("other-month");
        if (dateString === getTodayString()) cell.classList.add("today");
        if (dateString === formatCalendarDate(selectedCalendarDate)) cell.classList.add("selected");

        const dateNumber = document.createElement("div");
        dateNumber.className = "calendar-date";
        dateNumber.textContent = day;
        cell.appendChild(dateNumber);

        const tasksOnDate = tasks.filter(task => isTaskActiveOnDate(task, dateString));
        tasksOnDate.sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;
            const priorityOrder = { "Urgent": 1, "Important": 2, "Normal": 3 };
            return (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9);
        });

        const visibleTasks = tasksOnDate.slice(0, 2);
        visibleTasks.forEach(task => {
            const taskEl = document.createElement("div");
            taskEl.className = "calendar-task";
            if (task.status === "completed") taskEl.classList.add("completed");
            taskEl.title = task.title;

            const dot = document.createElement("span");
            dot.className = "task-dot";
            if (task.priority === "Urgent") dot.classList.add("urgent");
            else if (task.priority === "Important") dot.classList.add("important");

            const title = document.createElement("span");
            title.textContent = task.title;

            taskEl.appendChild(dot);
            taskEl.appendChild(title);
            cell.appendChild(taskEl);
        });

        if (tasksOnDate.length > 2) {
            const more = document.createElement("div");
            more.className = "calendar-more";
            more.textContent = `+${tasksOnDate.length - 2} more`;
            cell.appendChild(more);
        }

        cell.addEventListener("click", () => {
            selectedCalendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (isOtherMonth) {
                calendarDate = new Date(date.getFullYear(), date.getMonth(), 1);
                renderCalendar();
            } else {
                document.querySelectorAll(".calendar-grid .selected").forEach(selectedCell => {
                    selectedCell.classList.remove("selected");
                });
                cell.classList.add("selected");
            }
            renderCalendarDayTasks();
        });

        return cell;
    }

    // =========================================
    // RENDER CALENDAR
    // =========================================
    function renderCalendar() {
        if (!calendarGrid || !calendarMonthTitle) return;

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        calendarMonthTitle.textContent = `${monthNames[month]} ${year}`;
        calendarGrid.innerHTML = "";

        const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        weekdays.forEach(day => {
            const weekdayEl = document.createElement("div");
            weekdayEl.className = "calendar-weekday";
            weekdayEl.textContent = day;
            calendarGrid.appendChild(weekdayEl);
        });

        const firstDay = new Date(year, month, 1);
        const startDay = (firstDay.getDay() + 6) % 7;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const previousMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = startDay - 1; i >= 0; i--) {
            const dayNumber = previousMonthLastDay - i;
            const cell = createCalendarDay(year, month - 1, dayNumber, true);
            calendarGrid.appendChild(cell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = createCalendarDay(year, month, day, false);
            calendarGrid.appendChild(cell);
        }

        const totalCells = calendarGrid.children.length - 7;
        const remaining = 35 - totalCells > 0 ? 35 - totalCells : 42 - totalCells;

        for (let day = 1; day <= remaining; day++) {
            const cell = createCalendarDay(year, month + 1, day, true);
            calendarGrid.appendChild(cell);
        }

        renderCalendarDayTasks();
    }

    function renderCalendarDayTasks() {
        if (!calendarDayTasks) return;
        const dateString = formatCalendarDate(selectedCalendarDate);
        const readableDate = selectedCalendarDate.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        if (calendarSelectedDate) calendarSelectedDate.textContent = readableDate;

        const dayTasks = tasks.filter(task => isTaskActiveOnDate(task, dateString));
        calendarDayTasks.innerHTML = "";

        if (dayTasks.length === 0) {
            calendarDayTasks.innerHTML = `<div class="calendar-empty">Tidak ada task pada tanggal ini.</div>`;
            return;
        }

        dayTasks.forEach(task => {
            calendarDayTasks.appendChild(createCalendarTaskItem(task));
        });
    }

    function renderUpcomingTasks() {
        if (!upcomingTasksEl) return;
        const today = getTodayString();
        const upcoming = tasks
            .filter(task => {
                if (task.status === "completed") return false;
                const start = task.startDate || task.endDate;
                if (!start) return false;
                return start > today;
            })
            .sort((a, b) => (a.startDate || a.endDate).localeCompare(b.startDate || b.endDate))
            .slice(0, 5);

        upcomingTasksEl.innerHTML = "";
        if (upcoming.length === 0) {
            upcomingTasksEl.innerHTML = `<div class="calendar-empty">Tidak ada upcoming task.</div>`;
            return;
        }

        upcoming.forEach(task => {
            upcomingTasksEl.appendChild(createCalendarTaskItem(task));
        });
    }

    function renderCalendarOverdueTasks() {
        if (!calendarOverdueTasks) return;
        const today = getTodayString();
        const overdue = tasks
            .filter(task => {
                if (task.status === "completed") return false;
                const end = task.endDate || task.startDate;
                if (!end) return false;
                return end < today;
            })
            .sort((a, b) => (a.endDate || a.startDate).localeCompare(b.endDate || b.startDate))
            .slice(0, 5);

        calendarOverdueTasks.innerHTML = "";
        if (overdue.length === 0) {
            calendarOverdueTasks.innerHTML = `<div class="calendar-empty">Tidak ada overdue task.</div>`;
            return;
        }

        overdue.forEach(task => {
            calendarOverdueTasks.appendChild(createCalendarTaskItem(task));
        });
    }

    function renderCalendarPage() {
        showCalendarView();
        renderCalendar();
        renderUpcomingTasks();
        renderCalendarOverdueTasks();
    }

    // =========================================
    // CALENDAR CONTROLS
    // =========================================
    if (calendarPrevBtn) {
        calendarPrevBtn.addEventListener("click", () => {
            calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
            selectedCalendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
            renderCalendar();
        });
    }

    if (calendarNextBtn) {
        calendarNextBtn.addEventListener("click", () => {
            calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
            selectedCalendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
            renderCalendar();
        });
    }

    if (calendarTodayBtn) {
        calendarTodayBtn.addEventListener("click", () => {
            const today = new Date();
            calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
            selectedCalendarDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            renderCalendar();
        });
    }

    // =========================================
    // SET ACTIVE MENU & NAVIGATION
    // =========================================
    function setActiveMenu(target) {
        menuItems.forEach(item => {
            const labelElement = item.querySelector(":scope > span:last-child");
            const label = labelElement ? labelElement.textContent.trim().toLowerCase() : "";
            item.classList.toggle("active", label === target);
        });
    }

    menuItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            const labelElement = item.querySelector(":scope > span:last-child");
            if (!labelElement) return;

            const label = labelElement.textContent.trim().toLowerCase();
            setActiveMenu(label);
            clearToolbarFilters();

            if (label === "dashboard") {
                currentNavigation = "dashboard";
                currentCategory = null;
                currentFilter = "all";
                updateBreadcrumb("Dashboard");
                toggleDashboardStats(true);
            } else if (label === "my tasks") {
                currentNavigation = "tasks";
                currentCategory = null;
                currentFilter = "pending";
                setActiveFilterButton("pending");
                updateBreadcrumb("My Tasks");
                toggleDashboardStats(false);
            } else if (label === "important") {
                currentNavigation = "important";
                currentCategory = null;
                currentFilter = "all";
                updateBreadcrumb("Important");
                toggleDashboardStats(false);
            } else if (label === "calendar") {
                currentNavigation = "calendar";
                currentCategory = null;
                currentFilter = "all";
                updateBreadcrumb("Calendar");
                toggleDashboardStats(false);
            } else if (["work", "personal", "study", "others"].includes(label)) {
                currentNavigation = "category";
                currentCategory = label;
                currentFilter = "all";
                const categoryName = label.charAt(0).toUpperCase() + label.slice(1);
                updateBreadcrumb(categoryName);
                toggleDashboardStats(false);
            }

            renderAll();

            if (window.innerWidth <= 800) {
                sidebar.classList.remove("open");
            }
        });
    });

    // =========================================
    // CLEAR FILTERS
    // =========================================
    function clearToolbarFilters() {
        searchTaskInput.value = "";
        categoryFilter.value = "all";
        priorityFilter.value = "all";
        deadlineFilter.value = "all";
        currentFilter = "all";
        setActiveFilterButton("all");
    }

    function clearAllFilters() {
        currentNavigation = "dashboard";
        currentCategory = null;
        clearToolbarFilters();
        setActiveMenu("dashboard");
        updateBreadcrumb("Dashboard");
        renderAll();
    }

    function setActiveFilterButton(filter) {
        filterButtons.forEach(button => {
            const value = button.textContent.trim().toLowerCase();
            button.classList.toggle("active", value === filter);
        });
    }

    // =========================================
    // BREADCRUMB
    // =========================================
    function updateBreadcrumb(page) {
        const breadcrumb = document.querySelector(".breadcrumb strong");
        if (breadcrumb) {
            breadcrumb.textContent = page;
        }
    }

    // =========================================
    // TOP ACTIONS & DARK MODE
    // =========================================
    if (iconButtons.length > 0) {
        iconButtons[0].addEventListener("click", () => {
            searchTaskInput.focus();
            searchTaskInput.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    if (iconButtons.length > 1) {
        iconButtons[1].addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const darkMode = document.body.classList.contains("dark-mode");
            localStorage.setItem("taskflow_dark_mode", darkMode ? "true" : "false");
            iconButtons[1].textContent = darkMode ? "☀" : "◐";
        });
    }

    if (localStorage.getItem("taskflow_dark_mode") === "true") {
        document.body.classList.add("dark-mode");
        if (iconButtons.length > 1) {
            iconButtons[1].textContent = "☀";
        }
    }

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            alert("Settings akan dikembangkan pada tahap berikutnya.");
        });
    }

    if (avatarBtn) {
        avatarBtn.addEventListener("click", () => {
            alert("Profile akan dikembangkan pada tahap berikutnya.");
        });
    }

    // =========================================
    // MOBILE MENU
    // =========================================
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    document.addEventListener("click", event => {
        if (
            window.innerWidth <= 800 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !mobileMenuBtn.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }
    });

    // =========================================
    // PAGE DATE & GREETING
    // =========================================
    function updatePageDate() {
        const dateElement = document.querySelector(".page-heading .date");
        if (!dateElement) return;
        dateElement.textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function updateGreeting() {
        const greeting = document.querySelector(".greeting");
        if (!greeting) return;
        const hour = new Date().getHours();
        if (hour < 12) greeting.textContent = "Good morning";
        else if (hour < 18) greeting.textContent = "Good afternoon";
        else greeting.textContent = "Good evening";
    }

    // =========================================
    // RENDER ALL
    // =========================================
    function renderAll() {
        updateStats();
        updateProductivity();

        const showStats = currentNavigation === "dashboard";
        toggleDashboardStats(showStats);

        if (currentNavigation === "calendar") {
            renderCalendarPage();
            return;
        }

        renderTasks();
    }

    // =========================================
    // INITIALIZATION
    // =========================================
    updatePageDate();
    updateGreeting();
    setActiveFilterButton("all");
    setActiveMenu("dashboard");
    if (calendarView) calendarView.style.display = "none";
    renderAll();
});