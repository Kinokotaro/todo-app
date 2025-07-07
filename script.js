document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const priorityInput = document.getElementById('priority-input');
    const addButton = document.getElementById('add-button');
    const filterButton = document.getElementById('filter-button');
    const taskList = document.getElementById('task-list');

    // ページ読み込み時に履歴を復元
    loadTasks();

    // 「追加」ボタンのクリックイベント
    addButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText, dateInput.value, priorityInput.value, false);
            taskInput.value = '';
            dateInput.value = '';
            saveTasks();
        }
    });

    // 「完了済みを隠す」ボタンのクリックイベント
    filterButton.addEventListener('click', () => {
        taskList.classList.toggle('hide-completed');
        if (taskList.classList.contains('hide-completed')) {
            filterButton.textContent = 'すべて表示';
        } else {
            filterButton.textContent = '完了済みを隠す';
        }
    });

    // タスクを追加する関数
    function addTask(text, date, priority, isCompleted) {
        const li = document.createElement('li');
        li.className = `priority-${priority}`;
        if (isCompleted) {
            li.classList.add('completed');
        }

        // タスク内容のコンテナ
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        if (isCompleted) {
            taskContent.classList.add('completed');
        }
        taskContent.addEventListener('click', () => {
            li.classList.toggle('completed');
            taskContent.classList.toggle('completed');
            saveTasks();
        });

        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = text;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        if(date) {
            dateSpan.textContent = `(期限: ${date})`;
        }

        taskContent.appendChild(taskSpan);
        taskContent.appendChild(dateSpan);

        // ボタンのグループ
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';

        // 編集ボタン
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = '編集';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 親要素へのクリックイベント伝播を停止
            const newText = prompt('タスクを編集してください:', text);
            if (newText !== null && newText.trim() !== '') {
                taskSpan.textContent = newText.trim();
                saveTasks();
            }
        });

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(li);
            saveTasks();
        });

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        li.appendChild(taskContent);
        li.appendChild(buttonGroup);
        taskList.appendChild(li);
    }

    // タスクをローカルストレージに保存する関数
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            const taskContent = li.querySelector('.task-content');
            const text = li.querySelector('.task-text').textContent;
            const dateText = li.querySelector('.task-date').textContent;
            const isCompleted = li.classList.contains('completed');
            const priority = li.className.replace('completed', '').trim().split('-')[1];
            
            let date = '';
            const dateMatch = dateText.match(/\(期限: (.*)\)/);
            if (dateMatch) {
                date = dateMatch[1];
            }

            tasks.push({ text, date, priority, isCompleted });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // ローカルストレージからタスクを読み込む関数
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                addTask(task.text, task.date, task.priority, task.isCompleted);
            });
        }
    }
});