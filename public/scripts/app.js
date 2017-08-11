(function () {
    var idEl = 0;
    var data = [];
    console.log('init')
    
    // Модель
    var model = {
        getItem: function () {
            var httpRequest;
            makeRequest();
            function makeRequest() {
                httpRequest = new XMLHttpRequest();

                if (!httpRequest) {
                    console.log('Giving up :( Cannot create an XMLHTTP instance');
                    return false;
                }
                httpRequest.onreadystatechange = alertContents;
                httpRequest.open('GET', 'http://localhost:3000/api/todoListData');
                httpRequest.send();
            }
            function alertContents() {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 302) {
                        console.log(JSON.parse(httpRequest.responseText));            
                    } else {
                        console.log('There was a problem with the request.');
                    }
                }
            }
        },
        addItem: function (title) {
            idEl++;
            data.push({
                id: idEl,
                title: title,
                priority: 0,
                date: '',
                completed: false
            });
            var currentEl = data.length - 1;
            return data[currentEl];
        },
        deleteElement: function (id) {
            var element = this.findElement(id);
            var position = data.indexOf(element);
            data.splice(position, 1);
            return true;
        },
        updateElement: function (id, status, title) {
            var element = this.findElement(id);
            if ( typeof status === 'boolean') {
                this.updateData(element, status);
                return element.completed;
            }
            else if (status === 'modify' || 'priority' || 'date') {
                var isModify = this.updateData(element, status, title);
                return isModify;
            } 
        },
        findElement: function (id) {
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].id == id) {
                    return data[i];
                }
            }
        },
        updateData: function (element, status, title) {
            for (var i in data) {
                if (data[i].id == element.id) {
                    if (status === 'modify') {
                        data[i].title = title;
                        return true;
                    } else if ( typeof status === 'boolean') {
                        data[i].completed = !data[i].completed;
                    } else if (status === 'priority') {
                        data[i].priority = title;
                    } else if (status === 'date') {
                        data[i].date = title;
                    }
                    break;
                }
            }
        }
    }

    // Контролер
    var controller = {
        addItem: function (title) {
            return model.addItem(title);
        },
        catchEvent: function (id, status, title) {
            if (status === 'delete') {
                var status = model.deleteElement(id);
                return status;
            } else if (typeof status === 'boolean') {                
                var checkStatus = model.updateElement(id, status);
                return checkStatus;
            } else if (status === 'modify' || 'priority' || 'date') {
                var status = model.updateElement(id, status, title);
                return status;
            }

        },

        init: function () {
            view.init();

        }
    }

    // View - представление
    var view = {
        // Инициализация
        init: function () {
            this.input = document.querySelector('#add-input');
            this.form = document.querySelector('#todo-form');

            this.form.addEventListener('submit', addHandler.bind(this))
            function addHandler(event) {
                event.preventDefault();
                try {
                    if (!this.input.value) {
                        throw new Error('Вы не ввели задание')
                    } else {
                        var title = this.input.value;
                        var curentTask = controller.addItem(title);
                        this.render(curentTask);
                        this.input.value = '';
                    }
                } catch (err) {
                    alert(err.message);
                }
            }
        },
        createLi: function (todo) {
            var checkbox = this.createElement('input', { type: 'checkbox', className: 'checkbox', checked: todo.completed ? 'cheked' : '' });
            var label = this.createElement('label', { className: 'title' }, [todo.title]);
            var editInput = this.createElement('input', { type: 'text', className: 'textfield' });
            var editButton = this.createElement('button', { className: 'edit' }, ['Изменить']);
            var removeButton = this.createElement('button', { className: 'remove' }, ['Удалить']);
            var flag = this.createElement('i', { className: 'fa fa-flag important-0' });
            var times = this.createElement('i', { className: 'fa fa-times' });
            var date = this.createElement('input', { id: 'date', type: 'date' });
            var arr = []
            for (var i = 0; i < 4; i++) {
                var flagEl = this.createElement('i', { className: `fa fa-flag important-${i}` });
                arr.push(flagEl);
            }
            arr.push(times);
            var flagsContainer = this.createElement('div', { className: 'flagsContainer' }, arr);
            var cogs = this.createElement('i', { className: 'fa fa-cogs', });
            var block = this.createElement('div', { className: 'block' }, [times, flagsContainer, date]);
            var item = this.createElement('li', { className: `todo-item${todo.completed ? ' completed' : ''} `, 'data-id': todo.id }, [checkbox, flag, label, editInput, editButton, removeButton, block, cogs]);
            return this.eventListeners(item);
        },
        eventListeners: function (listItem) {
            var checkbox = listItem.querySelector('.checkbox');
            var editButton = listItem.querySelector('button.edit');
            var removeButton = listItem.querySelector('button.remove');
            var cogs = listItem.querySelector('.fa-cogs');
            // var times = listItem.querySelector('.fa-times');

            cogs.addEventListener('click', handleCogs.bind(this));
            // times.addEventListener('click', disableMenu.bind(this));
            checkbox.addEventListener('change', handleToggle.bind(this));
            editButton.addEventListener('click', handleEdit.bind(this));
            removeButton.addEventListener('click', handleRemove.bind(this));

            return listItem;

            function handleToggle(event) {
                var listItem = event.target.parentNode;
                var id = listItem.getAttribute('data-id');
                var isComplete = listItem.classList.contains('completed');
                var status = controller.catchEvent(id, isComplete);
                if (status) {
                    listItem.classList.add('completed');
                } else {
                    listItem.classList.remove('completed');
                }
            }
            function handleEdit(event) {
                var listItem = event.target.parentNode;
                var id = listItem.getAttribute('data-id');
                var label = listItem.querySelector('.title');
                var input = listItem.querySelector('.textfield');
                var editButton = listItem.querySelector('button.edit');
                var title = input.value;
                var isEditing = listItem.classList.contains('editing');
                if (isEditing) {
                    var title = input.value;
                    var status = controller.catchEvent(id, 'modify', title);
                    if (status) {
                        listItem.classList.remove('editing');
                        label.textContent = title;
                        editButton.textContent = 'Изменить';
                    } else {
                        alert('Error');
                    }
                } else {
                    input.value = label.textContent;
                    editButton.textContent = 'Сохранить';
                    listItem.classList.add('editing');
                }
            }
            function handleRemove(event) {
                var listItem = event.target.parentNode;
                var id = listItem.getAttribute('data-id');
                var status = controller.catchEvent(id, 'delete');
                if (status) {
                    listItem.remove();
                }
            }
            function handleCogs(event) {
                var listItem = event.target.parentNode;
                var block = listItem.querySelector('.block');
                var times = block.querySelector('.fa-times');
                var flagsList = block.querySelectorAll('.fa-flag');

                for (var i = 0, len = flagsList.length; i < len; i++) {
                    flagsList[i].addEventListener('click', changeFlag.bind(this));
                }
                block.classList.add('show');
                times.addEventListener('click', disableMenu.bind(this));
            }
            function disableMenu(event) {
                var listItem = event.target.parentNode.parentNode;
                var block = event.target.parentNode;
                var date = block.querySelector('#date');
                var id = listItem.getAttribute('data-id');
                date = date.value;

                controller.catchEvent(id, 'date', date);
                block.classList.remove('show');
            }
            function changeFlag() {
                var listItem = event.target.offsetParent.offsetParent;
                var flag = listItem.querySelector('.fa-flag');
                var onChange = event.target.getAttribute('class');
                var toChange = flag.getAttribute('class');
                var id = listItem.getAttribute('data-id');

                if (!(onChange == toChange)) {
                    flag.setAttribute('class', onChange);
                    var priority = onChange[onChange.length - 1];
                    controller.catchEvent(id, 'priority', priority);
                }
            }
            function disableFlagListener(element) {
                element.removeEventListener('click', this.changeFlag);
            }
        },

        createElement: function (tag, props, childrens) {
            var element = document.createElement(tag);
            var arr = Object.keys(props);
            for (var i = 0, propsLen = arr.length; i < propsLen; i++) {
                if (arr[i].startsWith('data-')) {
                    element.setAttribute(arr[i], props[arr[i]]);
                } else {
                    element[arr[i]] = props[arr[i]];
                }
            }
            if (childrens && childrens.length > 0) {
                for (var i = 0, childLen = childrens.length; i < childLen; i++) {
                    if (typeof childrens[i] === 'string') {
                        childrens[i] = document.createTextNode(childrens[i]);
                    }
                    element.appendChild(childrens[i]);
                }
            }
            return element;
        },
        render: function (data) {
            this.list = document.querySelector('#todo-list');
            this.form = document.querySelector('#todo-form');
            var listItem = this.createLi(data);
            this.list.appendChild(listItem);

            function addEventListeners(listItem) {
                this.checkbox = listItem.querySelector('.checkbox');
                var editButton = listItem.querySelector('button.edit');
                var removeButton = listItem.querySelector('button.remove');
                this.checkbox.addEventListener('chenge', handleToggle.bind(this));

                return listItem;
            }
        }
    };
    model.getItem();
    controller.init();
})();
