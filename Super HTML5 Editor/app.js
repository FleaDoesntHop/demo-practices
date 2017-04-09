
(function() {

    var SuperEditor = function() {
        //  以下变量用于储存当前视图与文件名（判断是否在文件编辑器视图中）。其中isDirty用来跟踪文档是否被修改。
        var view, fileName, isDirty = false,
            unsavedMsg = 'Unsaved changes will be lost. Are you sure?',
            unsavedTitle = 'Discard changes';

        var markDirty = function() {
            isDirty = true;
        };

        var markClean = function() {
            isDirty = false;
        };

        var checkDirty = function() {
            if(isDirty)
                return unsavedMsg;
        };
        //  onbeforeunload在页面即将刷新、关闭、或跳转时触发。跳转前检查文档是否已编辑
        window.addEventListener('beforeunload', checkDirty, false);

        //  jump事件处理器利用url的散列值(hash)来切换两种视图
        var jump = function(e) {
            var hash = location.hash;

            //  如果url的hash值包含一个斜杠，则它将为斜杠后的文件（如果存在的话）呈现文件编辑器视图
            if(hash.indexOf('/') > -1) {
                var parts = hash.split('/'),
                    fileNameEl = document.getElementById('file_name');
                view = parts[0].substring(1) + '-view';
                fileName = parts[1];
                fileNameEl.innerHTML = fileName;
            } else {
                if(!isDirty || confirm(unsavedMsg, unsavedTitle)) {
                    markClean();
                    view = 'browser-view';
                    if(hash != '#list') {
                        location.hash = '#list';
                    }
                } else {
                    //  newURL和oldURL是hashchange事件下的两个属性
                    location.href = e.oldURL;
                }
            }
            //  利用body元素中的类属性来指定当前视图。必要时，由css负责显示或隐藏视图
            document.body.className = view;
        };
        jump();

        //  hashchange事件在当前页面URL中的hash值发生改变时触发
        window.addEventListener('hashchange', jump, false);

        /**
         * 开启designMode，连接visual、html两种编辑器
         */
        var editVisualButton = document.getElementById('edit_visual'),
            visualView = document.getElementById('file_contents_visual'),
            visualEditor = document.getElementById('file_contents_visual_editor'),
            //  iframe下的contentDocument返回目标文本的document对象,等同于contentWindow.document;IE8+及其它浏览器全面支持
            visualEditorDoc = visualEditor.contentDocument,
            editHtmlButton = document.getElementById('edit_html'),
            htmlView = document.getElementById('file_contents_html'),
            htmlEditor = document.getElementById('file_contents_html_editor');

        //  开启designMode模式，使iframe进入可编辑状态
        visualEditorDoc.designMode = 'on';
        //  当用户敲击键盘进行改动后，将文本标记为dirty状态
        visualEditorDoc.addEventListener('keyup', markDirty, false);
        htmlEditor.addEventListener('keyup', markDirty, false);

        /**
         * 更新可视化编辑器的内容。updateVisualEditor每次执行后，都会创建一个新文档，因此必须添加一个新的keyup事件侦听器
         * @param content
         */
        var updateVisualEditor = function(content) {
            visualEditorDoc.open();
            visualEditorDoc.write(content);
            visualEditorDoc.close();
            visualEditorDoc.addEventListener('keyup', markDirty, false);
        };

        //  更新HTML编辑器内容
        var updateHtmlEditor = function(content) {
            htmlEditor.value = content;
        }

        /**
         * 用于切换可视化编辑器与HTML编辑器的事件处理器。
         * 当更新HTML编辑器时， XMLSerializer对象会取回iframe元素中的HTML内容
         */
        var toggleActiveView = function() {
            if(htmlView.style.display == 'block') {
                editVisualButton.className = 'split_left active';
                visualView.style.display = 'block';
                editHtmlButton.className = 'split_right';
                htmlView.style.display = 'none';
                updateVisualEditor(htmlEditor.value);
            } else {
                editHtmlButton.className = 'split_right active';
                htmlView.style.display = 'block';
                editVisualButton.className = 'split_left';
                visualView.style.display = 'none';

                //  知识点：XMLSerializer构造函数及其serializeToString方法
                var x = new XMLSerializer();
                var content = x.serializeToString(visualEditorDoc);
                updateHtmlEditor(content);
            }
        }

        editVisualButton.addEventListener('click', toggleActiveView, false);
        editHtmlButton.addEventListener('click', toggleActiveView, false);
    };

    var init = function() {
        new SuperEditor();
    };

    window.addEventListener('load', init, false);
})()