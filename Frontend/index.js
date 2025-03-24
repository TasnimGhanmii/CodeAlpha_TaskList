document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const completedCountEl = document.querySelector('.completed');
    const totalCountEl = document.querySelector('.total');
    const progressBar = document.querySelector('.progress-bar');

    let tasks = [];

    // Fetch tasks from the backend
    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            tasks = data;
            renderTasks();
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Render tasks on the page
    function renderTasks() {
        taskList.innerHTML = '';
        let completed = 0;

        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            if (task.completed) taskDiv.classList.add('completed');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('task-checkbox');
            checkbox.checked = task.completed;

            const taskText = document.createElement('input');
            taskText.type = 'text';
            taskText.value = task.text;
            taskText.readOnly = true;
            taskText.classList.add('task-text');

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            const editButton = document.createElement('button');
            editButton.classList.add('edit');
            editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete');
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);

            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(taskText);
            taskDiv.appendChild(actionsDiv);

            taskList.appendChild(taskDiv);

            if (task.completed) completed++;
        });

        completedCountEl.textContent = completed;
        totalCountEl.textContent = tasks.length;
        updateProgressBar(completed, tasks.length);

        // Event listeners
        taskList.querySelectorAll('.task-checkbox').forEach((checkbox, index) => {
            checkbox.addEventListener('change', async () => {
                tasks[index].completed = checkbox.checked;
                await updateTask(tasks[index].id, { completed: checkbox.checked });
                fetchTasks();
            });
        });

        taskList.querySelectorAll('.edit').forEach((button, index) => {
            button.addEventListener('click', () => {
                const taskTextEl = taskList.children[index].querySelector('.task-text');
                taskTextEl.readOnly = !taskTextEl.readOnly;
                taskTextEl.style.border = taskTextEl.readOnly ? 'none' : '2px solid #FD1D75';

                if (!taskTextEl.readOnly) {
                    taskTextEl.focus();
                    taskTextEl.addEventListener('blur', async () => {
                        tasks[index].text = taskTextEl.value;
                        await updateTask(tasks[index].id, { text: taskTextEl.value });
                        fetchTasks();
                    });
                }
            });
        });

        taskList.querySelectorAll('.delete').forEach((button, index) => {
            button.addEventListener('click', async () => {
                await deleteTask(tasks[index].id);
                fetchTasks();
            });
        });
    }

    // Add a new task
    addTaskButton.addEventListener('click', async () => {
        const text = newTaskInput.value.trim();
        if (!text) return;

        const newTask = { text, completed: false };
        await createTask(newTask);
        newTaskInput.value = '';
        fetchTasks();
    });

    // Create a task
    async function createTask(task) {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
    }

    // Update a task
    async function updateTask(id, updates) {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    }

    // Delete a task
    async function deleteTask(id) {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    }

    // Update progress bar
    function updateProgressBar(completed, total) {
        const progress = total > 0 ? (completed / total) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }

    // Initial fetch
    fetchTasks();
});