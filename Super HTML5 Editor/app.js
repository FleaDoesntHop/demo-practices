
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

        //  开启designMode模式，使iframe进入可编辑状态; designMode类似于contentEditable，但是赋值对象是document本身
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

        var visualEditorToolbar = document.getElementById('file_contents_visual_toolbar');

        /**
         * 事件处理器RichTextAction应用于可视化编辑器工具栏上所有的按钮。当用户点击工具栏按钮时，该事件处理器会判断用户点击的到底是什么按钮。
         * 点击按钮时通过标签上的data-command属性向execCommand方法传递command指令
         * execCommand接收1~3个参数：
         * 1. 第一个参数command是字符串，command含有编辑或格式化行为的名称；
         * 2. 第二个参数showUI是布尔值，确定用户是否能看到与command相关的默认UI（有些command没有UI）；
         * 3. 第三个参数value是字符串。execCommand将调入以value为参数的command参数
         * execCommand所需传入的参数个数跟第一个参数的命令相关。
         * @param e
         */
         var richTextAction = function(e) {
             var command,
                 node = (e.target.nodeName === 'BUTTON') ? e.target : e.target.parentNode;

             if(node.dataset) {
                 command = node.dataset.command;
             } else {
                 command = node.getAttribute('data-command');
             }

             var doPopupCommand = function(command, promptText, promptDefault) {
                 //  由于该应用需要一种自定义UI，所以将showUI设置为false。第三个参数value被传入一个（window对象的）prompt方法。它共有两个字符串参数，第一个参数提示用户输入值，另一个参数含有默认的输入值。
                 visualEditorDoc.execCommand(command, false, prompt(promptText, promptDefault));
             }

             if(command === 'createLink') {
                 doPopupCommand(command, 'Enter link URL:', 'http://www.example.com');
             } else if(command === 'insertImage') {
                 doPopupCommand(command, 'Enter image URL:', 'http://www.example.com/image.png');
             } else if(command === 'insertMap') {
                 //  使用navigator.geolocation.getCurrentPosition()方法获取当前位置的经纬度，然后作为center的参数传给google map api，返回的图片用execCommand的insertImage方法插入到文本中
                 if(navigator.geolocation) {
                     node.innerHTML = 'Loading';

                     navigator.geolocation.getCurrentPosition(function(pos) {
                         var coords = pos.coords.latitude + ',' + pos.coords.longitude;
                         var img = 'https://maps.googleapis.com/maps/api/staticmap?center=' + coords + '&zoom=11&size=200x200&sensor=false';

                         visualEditorDoc.execCommand('insertImage', false, img);
                         node.innerHTML = 'Location Map';
                     })
                 } else {
                     alert('Geolocation not available', 'No geolocation data');
                 }
             } else {
                 visualEditorDoc.execCommand(command);
             }
         }

         visualEditorToolbar.addEventListener('click', richTextAction, false);

        /**
         * 以下为HTML5 File System API的调用。File System API目前只有chrome13.0以上支持。其它浏览器都不支持。
         * @type {*}
         */

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem || window.mozRequestFileSystem || window.msRequestFileSystem || false;

        window.storageInfo = navigator.persistentStorage || navigator.webkitPersistentStorage || navigator.mozPersistentStorage || navigator.msPersistentStorage || false;

        var stType = window.PERSISTENT || 1,
            stSize = (5 * 1024 * 1024),
            fileSystem,
            fileListEl = document.getElementById('files'),
            currentFile;

        /**
         * 适用于所有file system api方法调用的标准错误函数
         * @param e
         */
        var fsError = function(e) {
            if(e.code === 9) {
                alert('File name already exists.', 'File System Error');
            } else {
                alert('An unexpected error occured. Error code: ' + e.code);
            }
        };

        var qmError = function(e) {
            if(e.code === 22) {
                alert('Quota exceeded.', 'Quota Management Error');
            } else {
                alert('An unexpected error occured. Error code: ' + e.code);
            }
        };


        /**
         * 查看浏览器是否支持file system api与quota management api.
         */
        if(requestFileSystem && storageInfo) {
            var checkQuota = function(currentUsage, quota) {
                var checkQuota = function(currentUsage, quota) {
                    if(quota === 0) {
                        //  因为该应用存在一个持久性文件系统，配额请求将触发一个消息，该消息征求用户的允许，以便访问浏览器文件系统
                        storageInfo.requestQuota(stType, stSize, getFs, qmError);
                    } else {
                        getFS(quota);
                    }
                };
            };

             // 如果queryUsageAndQuota成功执行，则它会把usage和quotainfo一并赋予回调函数checkQuota，否则就会调用qmError。checkQuota函数用于确定是否有足够的配额来储存文件，如果配额不够，则需要请求一个更大的配额。
            storageInfo.queryUsageAndQuota(stType, checkQuota, qmError);

            var getFS = function(quota) {
                //  利用requestFileSystem获取文件系统对象
                requestFileSystem(stType, quota, displayFileSystem, fsError);
            };

            var displayFileSystem = function(fs) {
                fileSystem = fs;
                updateBrowserFileList();
                // 如果编辑器视图为当前视图，则将该文件加载进编辑器
                if(view === 'editor') {
                    loadFile(fileName);
                }
            }

        } else {
            alert('File System API not supported', 'Unsupported');
        }

        var displayBrowserFileList = function(files) {
            fileListEl.innerHTML = '';
            //  利用文件系统中的文件数目来更新文件计数器
            document.getElementById('file_count').innerHTML = files.length;
            if(file.length > 0) {
                files.forEach(function(file, i) {
                    //  注意li设定draggable = true
                    var li = '<li id="li_' + i + '"draggable="true">' + file.name + '<div><button id="view_' + i + '">View</button>'+ '<button class="green" id="edit_'+ i + '">Edit</button>' + '<button class="red" id="del_' + i + '">Delete</button>' +'</div></li>';

                    //  insertAdjacentHTML函数（类似的还有insertAdjacentText，insertAdjacentElement这两种方法）——接收的参数有两个，position, text —— position可选四个值，'beforebegin', 'afterbegin', 'beforeend', 'afterend'

                    fileListEl.insertAdjacentHTML('beforeend', li);
                    var listItem = document.getElementById('li_' + i),
                        viewBtn = document.getElementById('view_' + i),
                        editBtn = document.getElementById('edit_' + i),
                        deleteBtn = document.getElementById('del_' + i);
                    var doDrag = function(e) {
                        dragFile(file, e);
                    };
                    var doView = function() {
                        viewFile(file);
                    };
                    var doEdit = function() {
                        editFile(file);
                    };
                    var doDelete = function() {
                        deleteFile(file);
                    }

                    viewBtn.addEventListener('click', doView, false);
                    editBtn.addEventListener('click', doEdit, false);
                    deleteBtn.addEventListener('click', doDelete, false);
                    listItem.addEventListener('dragstart', doDrag, false);

                });
            } else {
                //  如果没有文件，则显示空列表信息
                fileListEl.innerHTML = '<li class="empty">No files to display</li>';
            }
        }

        var updateBrowserFilesList = function() {
            //  创建一个DirectoryReader对象，稍后将用它来获取整个列表的文件
            var dirReader = fileSystem.root.createReader(),
                files = [];

            //  使用循环函数，每次读取目录列表中的一组文件，知道所有文件都被读取完为止
            var readFileList = function() {
                dirReader.readEntries(function(fileSet) {
                    if(!fileSet.length) {
                        //  当到达目录的末尾时，调用displayBrowserFileList函数，将按字母排序的文件数组作为参数传入
                        displayBrowserFileList(files.sort());
                    } else {
                        for(var i = 0, len = fileSet.length; i< len; i++) {
                            //  如果还未到达目录末尾，将刚读取的文件推送入文件数组，然后再次循环调用readFileList函数
                            files.push(fileSet[i]);
                        }
                        readFileList();
                    }
                }, fsError);
            }
            readFileList();
        }

        /**
         * file system api的getFile方法可获取文件系统的文件条目。
         * readAsText方法将读取文件内容。
         * 最后，loadFile函数会将文件内容显示在可视化编辑器与HTML编辑器中。
         *
         * getFile方法需要4个参数：（1）文件的相对或绝对路径；（2）选项对象（{create: boolean, exclusive: boolean},都默认设置为false）;（3）成功的回调函数；（4）错误回调函数
         */

        var loadFile = function(name) {
            fileSystem.root.getFile(name, {}, function(fileEntry) {
                currentFile = fileEntry;
                //  FileReader对象（也就是文件读取器）用来读取文件内容。当文件读取器读取完毕时，会触发onloadend事件处理器，更新可视化编辑器与HTML编辑器。
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    //  File System API的file方法用来获取fileEntry的文件，并将文件传入回调函数
                    reader.onloadend = function(e) {
                        updateVisualEditor(this.result);
                        updateHTMLEditor(this.result);
                    }
                    //  创建好心的FileReader并且定义了它的onloadend事件后，调用readAsText，读取文件并将文件加载到文件读取器的result属性中。
                    reader.readAsText(file);
                }, fsError);
            }, fsError);
        };

    //    查看、编辑、删除文件
        /**
         * 利用toURL方法，可轻松实现查看文件内容的功能，只需将文件的URL位置传给一个浏览器窗口，使文件显示出来即可。
         * @param file
         */
        var viewFile = function(file) {
            window.open(file.toURL(), 'SuperEditorPreview', 'width=800,height=600');
        };

        /**
         * 通过改变URL散列值，激活文件编辑器视图
         * @param file
         */
        var editFile = function(file) {
            loadFile(file.name);
            location.href = '#editor/' + file.name;
        };

        var deleteFile = function(file) {
            var deleteSuccess = function() {
                alert('File ' + file.name + ' deleted successfully', 'File deleted');
                updateBrowserFilesList();
            };

            if(confirm('File will be deleted. Are you sure?', 'Confirm delete')) {
                //  remove函数完成后，将执行deleteSuccess回调函数，它将调用updateBrowserFileList来确保列表得到更新。
                file.remove(deleteSuccess, fsError);
            }
        };

    };

    var init = function() {
        new SuperEditor();
    };

    window.addEventListener('load', init, false);
})()