
//  队和栈不同，队遵循先进先出（FIFO: first in first out）的原则，而栈遵循LIFO：last in first out的原则
function Queue() {
    var item = [];

    this.enqueue = function(element) {
        return item.push(element);
    }

    this.dequeue = function() {
        return item.shift();
    }

    this.front = function() {
        return item[0];
    }

    this.isEmpty = function() {
        return item.length === 0;
    }

    this.clear = function() {
        item = [];
    }

    this.size = function() {
        return item.length;
    }

    this.print = function() {
        console.log(item.toString());
    }
}

//  特权队列：priority queue：按优先级顺序排列队内元素
function PriorityQueue() {
    var items = [];

    //  工厂函数；将传入的参数转化为对应的实例属性
    function QueueElement(element, priority) {
        this.element = element;
        this.priority = priority;
    }

    this.enqueue = function(ele, prio) {
        var queueElement = new QueueElement(ele, prio);

        if(this.isEmpty())
            //  检查队列为空时，直接添加元素
            items.push(queueElement);
        else {
            //  声明flag，当遍历队列结束时，元素尚未被添加到队列中（即：added依旧为false），则将元素添加到队列的最末尾
            var added = false;
            for(var i = 0; i < items.length; i++) {
                //  比较队列内已有元素的优先级与待添加元素优先级的大小，优先级的数值越低，则优先级越高，对应的在队列内的位置越靠前
                if(queueElement.priority < items[i].priority) {
                    //  巧妙地利用数组splice的方法将元素插入到对应的位置
                    items.splice(i, 0, queueElement);
                    //  添加后将flag声明为true，并跳出循环
                    added = true;
                    break;
                }
            }
            if(!added)
                items.push(queueElement);
        }
    };

    this.dequeue = function() {
        return items.shift();
    }

    this.front = function() {
        return items[0];
    }

    this.isEmpty = function() {
        return items.length === 0;
    }

    this.clear = function() {
        items = [];
    }

    this.size = function() {
        return items.length;
    }

    this.print = function() {
        console.log(items.toString());
    }
}

var priorityQueue = new PriorityQueue();
priorityQueue.enqueue('John', 3);
priorityQueue.enqueue('Mike', 3);
priorityQueue.enqueue('Rose', 1);
priorityQueue.enqueue('Elvis', 2);

priorityQueue.size();  // 4
priorityQueue.front();  // QueueElement {element: "Rose", priority: 1}
priorityQueue.dequeue();  // QueueElement {element: "Rose", priority: 1}
priorityQueue.front();  // QueueElement {element: "Elvis", priority: 2}

/**
 * 传花鼓队列，类似于传花鼓的游戏，玩家围成一圈坐定，一人敲鼓，玩家依次传花，鼓毕，持花者剔除；如是反复，直至最后只剩下一个玩家，游戏结束。
 * @param nameList  设定玩家列表
 * @param num  设定击鼓的时长
 */
function hotPotato(nameList, num) {
    //  实例化队列
    var queue = new Queue();
    //  将名单内的玩家加入队列数组中
    for(var i = 0; i < nameList.length; i++) {
        queue.enqueue(nameList[i]);
    }

    var eliminated = '';
    while(queue.size() > 1) {
        //  每一轮击鼓传花，玩家每持花一次，如鼓未停，则玩家循环至队列末尾；鼓停时队列首位玩家退出游戏；如是反复，直至队列内只剩下一名玩家
        for(var i = 0; i < num; i++) {
            queue.enqueue(queue.dequeue());
        }
        eliminated = queue.dequeue();
        console.log(eliminated + ' was eliminated from the Hot Potato game.');
    }
    //  返回最后一名位于队列内的玩家
    return queue.dequeue();
}

var names = ['John', 'Mike', 'Rose', 'Elvis', 'Spike'];
var winner = hotPotato(names, 3);
console.log('The winner is ' + winner);
/**
 * Elvis was eliminated from the Hot Potato game.
 * Rose was eliminated from the Hot Potato game.
 * Spike was eliminated from the Hot Potato game.
 * Mike was eliminated from the Hot Potato game.
 * The winner is John
 */