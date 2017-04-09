
(function(){
    var init = function() {
        var orderForm = document.forms.order,
            saveBtn = document.getElementById('save-order'),
            saveBtnClicked = false;

        /**
         * 点击保存表单时检查浏览器是否支持formAction属性（IE10以下不支持）
         * 如果不支持该属性，则利用setAttribute方法来手动设置表单的action属性
         */
        var saveForm = function(event) {
            if(!('formAction' in document.createElement('input'))) {
                var formAction = saveBtn.getAttribute('formaction');
                orderForm.setAttribute('action', formAction)
            }
            saveBtnClicked = true;
        };

        saveBtn.addEventListener('click', saveForm, false);


        var qtyFields = orderForm.quantity,
            totalFields = document.getElementsByClassName('item_total'),
            orderTotalField = document.getElementById('order_total');
        /**
         * 返回一个用来表示货币的格式化数值，并利用逗号来分隔千分位
         * @param value  货币数值
         * @returns {string}
         */
        var formatMoney = function(value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        };
        var calculateTotals = function() {
            var i = 0,
                ln = qtyFields.length,
                itemQty = 0,
                itemPrice = 0.00,
                itemTotal = 0.00,
                itemTotalMoney = '$0.00',
                orderTotal = 0.00,
                orderTotalMoney = '$0.00';

            for(; i < ln; i++) {
                //  测试valueAsNumber属性的存在性。！！用于将valueAsNumber属性值强制转换为布尔属性
                if(!!qtyFields[i].valueAsNumber) {
                    itemQty = qtyFields[i].valueAsNumber || 0;
                } else {
                    itemQty = parseFloat(qtyFields[i].value) || 0;
                }

                if(!!qtyFields[i].dataset) {
                    itemPrice = parseFloat(qtyFields[i].dataset.price);
                } else {
                    itemPrice = parseFloat(qtyFields[i].getAttribute('data-price'));
                }

                itemTotal = itemQty * itemPrice;
                itemTotalMoney = '$' + formatMoney(itemTotal.toFixed(2));
                orderTotal += itemTotal;
                orderTotalMoney = '$' + formatMoney(orderTotal.toFixed(2));

                if(!!totalFields[i].value) {
                    totalFields[i].value = itemTotalMoney;
                    orderTotalField.value = orderTotalMoney;
                } else {
                    totalFields[i].innerHTML = itemTotalMoney;
                    orderTotalField.innerHTML = orderTotalMoney;
                }
            }
        };

        //  执行初始计算，以防某个字段被预填充。由于init函数在页面加载时被调用，将会访问到预填充数据
        calculateTotals();

        var qtyListeners = function() {
            var i = 0,
                ln = qtyFields.length;
            for(; i < ln; i++) {
                qtyFields[i].addEventListener('input', calculateTotals, false);

                qtyFields[i].addEventListener('keyup', calculateTotals, false);  //  ie9中，input事件并不能侦测退格键与删除键以及剪切操作，所以要绑定keyup事件
            }
        };
        qtyListeners();

        var doCustomValidity = function(field, msg) {
            if('setCustomValidity' in field) {
                field.setCustomValidity(msg);
            } else {
                field.validationMessage = msg;
            }
        }

        var validateForm = function() {
            doCustomValidity(orderForm.name, '');
            doCustomValidity(orderForm.password, '');
            doCustomValidity(orderForm.confirm_password, '');
            doCustomValidity(orderForm.card_name, '');

            if(orderForm.name.value.length < 2) {
                doCustomValidity(orderForm.name, '名字长度不得少于两个字节');
            }

            if(orderForm.password.value.length < 6) {
                doCustomValidity(orderForm.password, '密码长度必须大于六个字节');
            }

            if(orderForm.password.value !== orderForm.confirm_password.value) {
                doCustomValidity(orderForm.confirm_password, '两次输入的密码不一致');
            }

            if(orderForm.card_name.value.length < 2) {
                doCustomValidity(orderForm.card_name, '信用卡用户名长度不得少于两个字节');
            }
        };

        orderForm.addEventListener('input', validateForm, false);
        orderForm.addEventListener('keyup', validateForm, false);

        var styleInvalidForm = function() {
            orderForm.className = 'invalid';
        }
        orderForm.addEventListener('invalid', styleInvalidForm, true);

        var getFieldLabel = function(field) {
            if('labels' in field && field.labels.length >0) {
                return field.labels[0].innerText;
            }
            if(field.parentNode && field.parentNode.tagName.toLowerCase() === 'label') {
                return field.parentNode.innerText;
            }
            return '';
        }
        // 针对safari 5.1版本的回退方案：防止表单未验证即提交
        var submitForm = function() {
            if(!saveBtnClicked) {
                validateForm();
                var i = 0,
                    ln = orderForm.length,
                    field,
                    errors = [],
                    errorFields = [],
                    errorMsg = '';

                for(; i < ln; i++) {
                    field = orderForm[i];
                    if((!!field.validationMessage && field.validationMessage.length > 0) || (!!field.checkValidity && field.checkValidity())) {
                        errors.push(getFieldLabel(field) + ': ' + field.validationMessage);
                        errorFields.push(field);
                    }
                }
            }

            if(errors.length > 0) {
                e.preventDefault();
                errorMsg = errors.join('\n');

                alert('Please fix the following errors:\n' + errorMsg, 'Error');
                orderForm.className = 'invalid';
                errorFields[0].focus();
            }
        }

        orderForm.addEventListener('submit', submitForm, false);

        var fallbackValidation = function() {
            var i = 0,
                ln = orderForm.length,
                field;

            for(; i < ln; i++) {
                field = orderForm[i];
                doCustomValidity(field, '');


                if(field.hasAttribute('pattern')) {
                    var pattern = new RegExp(field.getAttribute('pattern').toString());
                    if(!pattern.test(field.value)) {
                        var msg = 'Please match the requested format.';
                        if(field.hasAttribute('title') && field.getAttribute('title').length > 0) {
                            msg += ' ' + field.getAttribute('title');
                        }
                        doCustomValidity(field, msg);
                    }
                }
                if(field.hasAttribute('type') && field.getAttribute('type').toLowerCase() === 'email'){
                    var pattern = new RegExp(/\S+@/)
                }
            }
        }

    };

    window.addEventListener('load', init, false);
})()