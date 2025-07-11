document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const priorityInput = document.getElementById('priority-input');
    const addButton = document.getElementById('add-button');
    const filterButton = document.getElementById('filter-button');
    const taskList = document.getElementById('task-list');
    let draggedItem = null;

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
        li.draggable = true;
        if (isCompleted) {
            li.classList.add('completed');
        }

        // タスク内容のコンテナ
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        if (isCompleted) {
            taskContent.classList.add('completed');
        }
        taskContent.addEventListener('click', (e) => {
            // ボタン、編集中のinput、日付や優先度スパンがクリックされた場合は、完了状態を切り替えない
            if (e.target.closest('.button-group') || e.target.matches('.edit-input, .date-edit-input, .task-date, .priority-span')) {
                return;
            }
            // ドラッグ中は完了状態を切り替えない
            if (li.classList.contains('dragging')) {
                return;
            }
            li.classList.toggle('completed');
            taskContent.classList.toggle('completed');
            saveTasks();
        });

        // タスクテキスト
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = text;

        // 日付 (インライン編集)
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = date ? `(期限: ${date})` : '(期限なし)';
        dateSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            if (li.classList.contains('editing')) return;
            li.classList.add('editing');
            const originalDate = date;
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = originalDate;
            dateInput.className = 'date-edit-input';

            // 日付スパンをinputに置き換え
            const parent = dateSpan.parentNode;
            parent.insertBefore(dateInput, dateSpan);
            parent.removeChild(dateSpan);
            dateInput.focus();

            const finishDateEdit = () => {
                const newDate = dateInput.value;
                date = newDate; // date変数を更新
                dateSpan.textContent = newDate ? `(期限: ${newDate})` : '(期限なし)';
                if (document.body.contains(dateInput)) {
                    parent.insertBefore(dateSpan, dateInput);
                    parent.removeChild(dateInput);
                }
                li.classList.remove('editing');
                saveTasks();
            };

            dateInput.addEventListener('blur', finishDateEdit);
            dateInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finishDateEdit();
                else if (e.key === 'Escape') {
                    dateSpan.textContent = originalDate ? `(期限: ${originalDate})` : '(期限なし)';
                    if (document.body.contains(dateInput)) {
                        parent.insertBefore(dateSpan, dateInput);
                        parent.removeChild(dateInput);
                    }
                    li.classList.remove('editing');
                }
            });
        });

        // 優先度 (クリックで切り替え)
        const prioritySpan = document.createElement('span');
        prioritySpan.className = 'priority-span';
        const priorities = ['low', 'medium', 'high'];
        const priorityMap = { low: '低', medium: '中', high: '高' };
        prioritySpan.textContent = `[${priorityMap[priority]}]`;
        prioritySpan.addEventListener('click', (e) => {
            e.stopPropagation();
            let currentPriorityIndex = priorities.indexOf(priority);
            let nextPriorityIndex = (currentPriorityIndex + 1) % priorities.length;
            let nextPriority = priorities[nextPriorityIndex];

            li.classList.remove(`priority-${priority}`);
            li.classList.add(`priority-${nextPriority}`);
            priority = nextPriority; // priority変数を更新
            prioritySpan.textContent = `[${priorityMap[priority]}]`;
            saveTasks();
        });

        taskContent.appendChild(taskSpan);
        taskContent.appendChild(dateSpan);
        taskContent.appendChild(prioritySpan);

        // ボタンのグループ
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';

        // 編集ボタン
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = '✏️';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (li.classList.contains('editing')) return;
            li.classList.add('editing');
            const originalText = taskSpan.textContent;
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = originalText;
            editInput.className = 'edit-input';

            // テキストスパンをinputに置き換え
            const parent = taskSpan.parentNode;
            parent.insertBefore(editInput, taskSpan);
            parent.removeChild(taskSpan);
            editInput.focus();

            const finishEdit = () => {
                const newText = editInput.value.trim();
                taskSpan.textContent = newText === '' ? originalText : newText;
                if (document.body.contains(editInput)) {
                    parent.insertBefore(taskSpan, editInput);
                    parent.removeChild(editInput);
                }
                li.classList.remove('editing');
                saveTasks();
            };

            editInput.addEventListener('blur', finishEdit);
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finishEdit();
                else if (e.key === 'Escape') {
                    taskSpan.textContent = originalText;
                    if (document.body.contains(editInput)) {
                        parent.insertBefore(taskSpan, editInput);
                        parent.removeChild(editInput);
                    }
                    li.classList.remove('editing');
                }
            });
        });


        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '🗑️';
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

    // ドラッグアンドドロップのイベントリスナー
    taskList.addEventListener('dragstart', e => {
        draggedItem = e.target;
        e.target.classList.add('dragging');
    });

    taskList.addEventListener('dragend', e => {
        e.target.classList.remove('dragging');
        draggedItem = null;
        saveTasks();
    });

    taskList.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            if (afterElement == null) {
                taskList.appendChild(dragging);
            } else {
                taskList.insertBefore(dragging, afterElement);
            }
        }
    });

    // モバイル用のタッチイベント
    let touchTimeout;

    taskList.addEventListener('touchstart', e => {
        const li = e.target.closest('li');
        if (!li) return;

        touchTimeout = setTimeout(() => {
            draggedItem = li;
            li.classList.add('dragging');
            // 他の要素が反応しないようにする
            navigator.vibrate && navigator.vibrate(50); // 触覚フィードバック
        }, 500); // 500msの長押しでドラッグ開始
    }, { passive: true });

    taskList.addEventListener('touchmove', e => {
        clearTimeout(touchTimeout); // 動いたら長押しではない
        if (!draggedItem) return;

        e.preventDefault(); // ページのスクロールを止める
        const clientY = e.touches[0].clientY;
        const afterElement = getDragAfterElement(taskList, clientY);

        if (afterElement == null) {
            taskList.appendChild(draggedItem);
        } else {
            taskList.insertBefore(draggedItem, afterElement);
        }
    });

    taskList.addEventListener('touchend', e => {
        clearTimeout(touchTimeout);
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            saveTasks();
        }
    });

    taskList.addEventListener('touchcancel', e => {
        clearTimeout(touchTimeout);
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    });


    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    // タスクをローカルストレージに保存する関数
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            const text = li.querySelector('.task-text').textContent;
            const dateSpan = li.querySelector('.task-date');
            const isCompleted = li.classList.contains('completed');
            const priorityClass = li.className.split(' ').find(c => c.startsWith('priority-'));
            const priority = priorityClass ? priorityClass.split('-')[1] : 'medium';

            let date = '';
            if (dateSpan) {
                const dateMatch = dateSpan.textContent.match(/\(期限: (.*)\)/);
                if (dateMatch) {
                    date = dateMatch[1];
                }
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