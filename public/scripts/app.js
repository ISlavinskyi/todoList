(function () {
    var idEl = 0;
    var data = [];
    var newDate = new Date();
    var dateString = newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate();
    var model = {
        requestData: function (obj) {
            var xhr = new XMLHttpRequest();
            xhr.open(obj.type, 'http://localhost:3000/api/todoListData/' + obj.id, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 201) {

                } else if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 302) {
                    var getData = xhr.responseText;
                    data = JSON.parse(getData);
                    controller.getData(data);
                } else if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {

                } else if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 204) {

                }
            };
            xhr.send(JSON.stringify(obj.body));
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
            if (typeof status === 'boolean') {
                var bool = this.updateData(element, status);
                return bool;
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
                    } else if (typeof status === 'boolean') {
                        if ('completed' in data[i]) {
                            data[i].completed = !data[i].completed;
                            return data[i].completed;
                        } else {
                            data[i].completed = true;
                            return true;
                        }
                    } else if (status === 'priority') {
                        data[i].priority = title;
                    } else if (status === 'date') {
                        data[i].date = title;
                    }
                    break;
                }
            }
        }
    };
    var controller = {
        addItem: function (title) {
            return model.addItem(title);
        },
        postData: function (data) {
            var obj = {
                type: 'POST',
                id: '',
                body: data
            };
            model.requestData(obj);
        },
        getData: function (data) {
            view.init(data);
        },
        catchEvent: function (id, status, title) {
            var checkStatus;
            var obj = {
                type: 'PUT',
                id: id,
                body: {
                    id: id,
                }
            };
            if (status === 'delete') {
                obj.type = 'DELETE';
                model.requestData(obj);
                checkStatus = model.deleteElement(id);
                return checkStatus;
            } else if (typeof status === 'boolean') {
                checkStatus = model.updateElement(id, status);
                obj.body.completed = !status;
                model.requestData(obj);
                return checkStatus;
            } else if (status === 'modify' || 'priority' || 'date') {
                if (status === 'modify') {
                    obj.body.title = title;
                } else if (status === 'priority') {
                    obj.body.priority = title;
                } else if (status === 'date') {
                    obj.body.date = title;
                }
                checkStatus = model.updateElement(id, status, title);
                model.requestData(obj);
                return checkStatus;
            }
        },
        findElement: function (id) {
            return model.findElement(id);
        },
        init: function () {
            var obj = {
                type: 'GET',
                id: '',
                body: null
            };
            model.requestData(obj);
        }
    };
    var view = {
        init: function (data) {
            this.input = document.querySelector('#add-input');
            this.form = document.querySelector('#todo-form');
            this.list = document.querySelector('#todo-list');
            this.filter = document.querySelector('.filter-text');
            this.settings = document.querySelector('#settings');
            this.filterDate = this.settings.querySelector('input');

            this.filter.addEventListener('click', filterClick);
            this.filterDate.addEventListener('change', dateChange);

            if (data.length > 0) {
                len = data.length;
                idEl = data[len - 1].id || 1;
                for (var i = 0; i < len; i++) {
                    var listItem = this.createLi(data[i]);
                    this.list.appendChild(listItem);
                }
            }
            this.form.addEventListener('submit', addHandler.bind(this));
            function dateChange() {
                var value = event.target.value;
                var list = document.querySelectorAll('.todo-item');
                for (var i = 0; i < data.length; i++) {
                    var block = list[i].querySelector('.date-block');
                    list[i].classList.remove('filter-data');
                    if (value != block.innerText) {
                        list[i].classList.add('filter-data');
                    }
                }
            }

            function filterClick(event) {
                var list = document.querySelectorAll('.todo-item');
                var priority = event.target.className[event.target.className.length - 1];
                var refresh = document.querySelector('.fa-refresh');
                if (event.target.classList.contains('fa-refresh')) {
                    for (var i = 0; i < data.length; i++) {
                        list[i].classList.remove('filter-data');
                    }
                } else if (event.target.classList.contains('fa-flag')) {
                    for (var i = 0; i < data.length; i++) {
                        list[i].classList.remove('filter-data');
                        var listId = list[i].getAttribute('data-id');
                        var flag = list[i].querySelector('.fa-flag');
                        if (flag.className[flag.className.length - 1] != priority) {
                            list[i].classList.add('filter-data');
                        }
                    }
                }
            }
            function addHandler(event) {
                event.preventDefault();
                try {
                    if (!this.input.value) {
                        throw new Error('Вы не ввели задание');
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
            var flag = this.createElement('i', { className: `fa fa-flag important-${todo.priority}` });
            var times = this.createElement('i', { className: 'fa fa-times' });
            var date = this.createElement('input', { id: 'date', type: 'date' });
            var dateBlock = this.createElement('div', { className: 'date-block' }, [todo.date || dateString]);
            var listBlock = this.createElement('div', { className: 'title list-block' }, [label, dateBlock]);
            var arr = []
            for (var i = 0; i < 4; i++) {
                var flagEl = this.createElement('i', { className: `fa fa-flag important-${i}` });
                arr.push(flagEl);
            }
            arr.push(times);
            var flagsContainer = this.createElement('div', { className: 'flagsContainer' }, arr);
            var cogs = this.createElement('i', { className: 'fa fa-cogs', });
            var block = this.createElement('div', { className: 'block' }, [times, flagsContainer, date]);
            var item = this.createElement('li', { className: `todo-item${todo.completed ? ' completed' : ''} `, 'data-id': todo.id }, [checkbox, flag, listBlock, editInput, editButton, removeButton, block, cogs]);
            return this.eventListeners(item);
        },
        eventListeners: function (listItem) {
            var checkbox = listItem.querySelector('.checkbox');
            var editButton = listItem.querySelector('button.edit');
            var removeButton = listItem.querySelector('button.remove');
            var cogs = listItem.querySelector('.fa-cogs');
            cogs.addEventListener('click', handleCogs.bind(this));
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
                var times = block.querySelector('.fa-times');
                // date = date.value;
                if (date.value) {
                    var dataElement = controller.findElement(id);
                    var dateBlock = listItem.querySelector('.date-block');
                    dateBlock.innerText = date.value;
                    dataElement.date = date.value;
                    controller.catchEvent(dataElement.id, 'date', date.value)
                }
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
            data.completed = false;
            data.date = dateString;
            controller.postData(data);

            function addEventListeners(listItem) {
                this.checkbox = listItem.querySelector('.checkbox');
                var editButton = listItem.querySelector('button.edit');
                var removeButton = listItem.querySelector('button.remove');
                this.checkbox.addEventListener('chenge', handleToggle.bind(this));

                return listItem;
            }
        }
    };
    controller.init();
})();
