
//  十进制转换二进制
function divideByTwo(num) {
    var rem, ret = [], str = '';
    while (num > 0) {
        rem = num % 2;
        ret.push(rem);
        num = Math.floor(num / 2);
    }
    while(ret.length > 0)
        str += ret.pop();
    return str;
}

//  十进制转化二进制、八进制、十六进制的通用写法
function convertDecimal(num, base) {
    var rem, ret = [], str = '', defaultStr = '0123456789ABCDEF';
    while (num > 0) {
        /**
         * 二进制求余尾数为0，1；
         * 八进制求余尾数为0~7；
         * 需要注意的是十六进制求余，尾数为0~15，但是10~15在十六进制中用A~F表示，所以需要在求得余数后利用defaultStr巧妙得转化为对应的字母；
         * @type {number}
         */
        rem = num % base;
        ret.push(rem);
        num = Math.floor(num / base);
    }

    while (ret.length > 0)
        str += defaultStr[ret.pop()];

    return str;
}