/**
 * 类：单向链接的列表项——列表项内的元素通过next指针互相连接。无法通过index遍历列表项，但可以通过某个元素的next指针找到它的下一个元素。
 * @constructor
 */
function LinkedList() {

    //  工厂函数；实例化对象的默认next为空
    var Node = function(element) {
        this.element = element;
        this.next = null;
    }

    var length = 0,
        head = null;

    //  在列表最末尾添加元素
    this.append = function(element) {
        var node = new Node(element),
            current;
        if(head === null)
            //  如果头元素为空，则直接将元素向头元素映射
            head = node
        else {
            //  若头元素不为空，即列表项内有一个或多个元素，则通过next链接的目标遍历列表项，直至找到对应的最后一个元素，将要添加的元素与该最后的元素的next链接
            current = head;
            while (current.next)
                current = current.next;
            current.next = node;
        }
        length++; //  更新列表项的长度
    };
    /**
     * 在任意位置插入元素。思路：修改该位置前一位元素的next指针，使之指向该元素，同时其原先指向的目标由该元素的next指针替代。
     * @param position  插入位置
     * @param element   插入元素
     */
    this.insert = function(position, element) {
        if(position >= 0 && position <= length) {
            var node = new Node(element),
                current = head,
                previous,
                index = 0;
            if(position === 0) {
                head = node;
                node.next = current;
            } else {
                while(index++ < position) {
                    previous = current;
                    current = current.next;
                }
                previous.next = node;
                node.next = current;
            }
            length++;
            return true;
        } else {
            //  若传入的position值为非法，则返回错误
            return false;
        }
    };

    /**
     * 移除列表项特定位置的元素。思路：修改该位置元素的上一个元素的next链接，使之指向该元素的next指向的元素；从而实现在列表项中移除该元素（因为列表项中无任何元素指向该元素）
     * @param position  需要移除的元素在列表项中的位置
     */
    this.removeAt = function(position) {
        //  检查传入的position值的合法性
        if(position > -1 && position < length) {
            var current = head,
                previous,
                index = 0;
            if(position === 0)
                head = current.next;
            else {
                while(index++ < position) {
                    previous = current;
                    current = current.next;
                }
                previous.next = current.next;
            }
            length--;
            return current.element;
        } else {
            //  若position值非法，则什么都不做
            return null;
        }
    };
    /**
     * 根据传入的元素移除其在列表项中的位置。思路一：修改该元素上一个元素的next链接，使之指向该元素的next；
     * 思路二：根据传入的元素调用列表项的indexOf方法，获得对应的位置，再调用removeAt方法移除该位置的元素；
     * @param element  需要移除的元素
     */
    this.remove = function(element) {
        //  思路一：
        /* var current = head,
            previous;
        while(current.element !== element) {
            previous = current;
            current = current.next;
        }
        if(current.element === element) {
            previous.next = current.next;
            length--;
        } else {
            return false;
        } */

        //  思路二：
        var index = this.indexOf(element);
        return this.removeAt(index);
    };
    /**
     * 返回元素在列表项中的位置。思路：遍历列表项，使用变量index跟踪遍历的位置，对比每次遍历所对应的元素与传入的元素，如果相等，则返回此时的index的值；如果遍历完毕后尚未找到对应的元素，则返回-1；
     * @param element
     */
    this.indexOf = function(element) {
        var current = head,
            index = 0;
        while(current) {
            if(element === current.element) {
                return index;
            }
            index++;
            current = current.next;
        }
        return -1;
    };
    this.isEmpty = function() {
        return length === 0;
    };
    this.size = function() {
        return length;
    };
    //  将列表项输出为字符串
    this.toString = function() {
        var current = head,
            string = '';
        while(current){
            string += current.element + ' ';
            current = current.next;
        }
        return string;
    };
    this.getHead = function() {
        return head;
    };
}

/**
 * 类：双向链接的列表项——与单向链接的列表项类似，但是除了next指针外，每个元素通过prev指针与前一个元素链接。因而遍历元素时，除考虑正向遍历外，若需要遍历的位置大于列表项长度的一半，则可以考虑从列表项末尾向前遍历，以减少遍历次数。
 * @constructor
 */
function DoublyLinkedList() {
    var Node = function(element) {
        this.element = element;
        this.next = null;
        this.prev = null;
    }

    var length = 0,
        head = null,
        tail = null;
    this.insert = function(position, element) {
        if(position >= 0 && position <= length) {
            var node = new Node(element),
                current = head,
                previous,
                index = 0;
            if(position === 0) {
                if(!head) {
                    head = node;
                    tail = node;
                } else {
                    node.next = current;
                    current.prev = node;
                    head = node;
                }
            } else if(position === length) {
                current = tail;
                current.next = node;
                node.prev = current;
                tail = node;
            } else {
                while(index++ < position) {
                    previous = current;
                    current = current.next;
                }
                node.next = current;
                previous.next = node;
                current.prev = node;
                node.prev = previous;
            }
            length++;

            return true;
        } else {
            return false;
        }
    }
    this.removeAt = function(position) {
        if(position > -1 && position < length) {
            var current = head,
                previous,
                index = 0;

            if(position === 0) {
                head = current.next;

                if(length === 1){
                    tail = null;
                } else {
                    head.prev = null;
                }
            } else if(position === length - 1) {
                current = tail;
                tail = current.prev;
                tail.next = null;
            } else {
                while(index++ < position) {
                    previous = current;
                    current = current.next;
                }

                // link previous with current's next - skip it
                previous.next = current.next;
                current.next.prev = previous;
            }
            length--;
            return current.element;
        } else {
            return null;
        }
    }
}