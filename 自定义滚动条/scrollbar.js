//声明全局变量，讲闭包中创建的构造函数用全局变量接收。也可以使用window接收
var scrollBar = {

};

(function(win, doc, $){
    //  自定义滚动条的构造函数
    function CustomScrollBar(options) {
        this._init(options);
    }
    //  方法扩展到构造函数的原型上
    $.extend(CustomScrollBar.prototype, {
        //  初始化总入口
        _init: function(options) {
            // 声明默认的参数，可被实例化传入的参数覆盖
            this.options = {
                scrollDir: 'y',
                contSelector: '',
                barSelector: '',
                sliderSelector: '',
                tabItemSelector: '.tab-item',
                tabActiveClass: 'tab-active',
                anchorSelector: '.anchor',
                wheelStep: 10
            };
            $.extend(true, this.options, options || {});

            this._initDomEvent();
            return this;
        },
        //  调用初始化dom事件入口
        _initDomEvent: function() {
            var opts = this.options;
            this.$cont = $(opts.contSelector);
            this.$slider = $(opts.sliderSelector);
            this.$bar = opts.barSelector ? $(opts.barSelector) : this.$slider.parent();
            this.$tabItem = $(opts.tabItemSelector);
            this.$anchor = $(opts.anchorSelector);
            this.$doc = $(doc);
            this._initSliderDragEvent()
                ._bindContScroll()
                ._bindMouseWheel()
                ._initTabEvent();
        },
        _initTabEvent: function(){
            var self = this;
            self.$tabItem.on('click', function(e) {
                e.preventDefault();
                var index = $(this).index();
                self._changeTabSelect(index);
                self.scrollTo(self.$cont[0].scrollTop + self.getAnchorPosition(index) - 70);
            })
        },
        _changeTabSelect: function(index) {
            var self = this,
                active = self.options.tabActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        //  按下滑块拖动事件
        _initSliderDragEvent: function() {
            var self = this;
            var slider = this.$slider,
                sliderEl = slider[0];
            if(sliderEl) {
                var doc = this.$doc,
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragContBarRate;
                function mouseMoveHandler(e) {
                    e.preventDefault();
                    if(dragStartPagePosition == null) {
                        return;
                    }
                    self.scrollTo(dragStartScrollPosition + (e.pageY - dragStartPagePosition) * dragContBarRate);
                }
                slider.on('mousedown', function(e) {
                    e.preventDefault();

                    dragStartPagePosition = e.pageY;
                    dragStartScrollPosition = self.$cont[0].scrollTop;
                    dragContBarRate = self.getMaxScrollPosition() / self.getMaxSliderPosition();

                    doc.on('mousemove.scroll',mouseMoveHandler).on('mouseup.scroll', function(e) {
                        doc.off('.scroll');
                    })
                });
            }
            return self;
        },
        _bindContScroll: function(){
            var self = this;
            self.$cont.on('scroll', function(){
                var sliderEl = self.$slider && self.$slider[0];
                if(sliderEl) {
                    sliderEl.style.top = self.getSliderPosition() + 'px';
                }
            });
            return self;
        },
        _bindMouseWheel: function() {
            var self = this;
            self.$cont.on('mousewheel DOMMouseScroll', function(e) {
                e.preventDefault();
                var oEv = e.originalEvent,
                    wheelRange = oEv.wheelDelta ? -oEv.wheelDelta / 120 : (oEv.detail || 0) / 3;
                self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
            });
            return self;
        },
        getAnchorPosition: function(index) {
            return this.$anchor.eq(index).position().top;
        },
        getSliderPosition: function() {
            var self = this,
                maxSliderPosition = self.getMaxSliderPosition();
            return Math.min(maxSliderPosition, maxSliderPosition * self.$cont[0].scrollTop / self.getMaxScrollPosition());
        },
        getMaxScrollPosition: function() {
            var self = this;
            return Math.max(self.$cont.height(), self.$cont[0].scrollHeight) - self.$cont.height();
        },
        getMaxSliderPosition: function() {
            var self = this;
            return self.$bar.height() - self.$slider.height();
        },
        scrollTo: function(val) {
            this.$cont.scrollTop(val);
        }
    })

    scrollBar.CustomScrollBar = CustomScrollBar;
})(window, document, jQuery);