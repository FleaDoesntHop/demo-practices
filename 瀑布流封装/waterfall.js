window.onload = function() {
    var boxes = $('box'),
        container = $('container')[0],
        boxWidth = boxes[0].offsetWidth,
        winWidth = document.documentElement.offsetWidth || document.body.offsetWidth,
        cols = Math.floor(winWidth / boxWidth),
        lineImgs = [];
    container.style = 'position: relative; margin: 0 auto; width: ' + cols * boxWidth + 'px';
    for (var i = 0; i < boxes.length; i++) {
        if(i < cols) {
            lineImgs.push(boxes[i].offsetHeight);
        } else {
            layoutImages(boxes[i]);
        }
    }

    function layoutImages(ele) {
        var minH = Math.min.apply(null, lineImgs),
            minIndex = lineImgs.indexOf(minH);
        ele.style = 'position: absolute; left: ' + minIndex * boxWidth + 'px; top: ' + minH + 'px';
        lineImgs[minIndex] += ele.offsetHeight;
    }

    var imgData = {
        'data': {
            'src': ['12.jpg', '15.jpg', '19.jpg', '20.jpg', '5.jpg', '1.jpg', '13.jpg', '10.jpg', '8.jpg', '7.jpg', '14.jpg']
        }
    };
    window.onscroll = function() {
        loadImgs();
    }

    function loadImgs() {
        var winHeight = document.documentElement.clientHeight || document.body.clientHeight,
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            lastBoxH = boxes[boxes.length - 1].offsetHeight / 2 + boxes[boxes.length - 1].offsetTop;
        if(lastBoxH <= scrollTop + winHeight) {
            for(var i = 0; i < imgData.data.src.length; i++) {
                var newBox = document.createElement('div'),
                    newImgWrapper = document.createElement('div'),
                    newImg = document.createElement('img'),
                    imgSrc = imgData.data.src;
                newBox.className = 'box';
                newImgWrapper.className = 'img-wrapper';
                newImg.src = './images/'+imgData.data.src[i];
                newImgWrapper.append(newImg);
                newBox.append(newImgWrapper);
                container.append(newBox);
                layoutImages(newBox);
            }

        }

    }
}

var $ = function(className) {
    return document.getElementsByClassName(className);
}
