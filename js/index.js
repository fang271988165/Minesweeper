function Mine (tr, td, mineNum) {
    this.tr = tr;   //行数
    this.td = td;   //列数
    this.mineNum = mineNum;     //雷的数量

    this.squares = [];  //存储所有方块信息，它是一个二维数组，按行与列的顺序排列  存取都使用行列的形式
    this.tds = [];      //存储所有的单元格的Dom对象
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false;  //右击标记的小红旗是否全是雷，用来判断用户是否游戏胜利

    this.parent = document.querySelector('.gameBox');
}

//生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i ++) {
        square[i] = i;
    }
    square.sort(function () {
        return 0.5 - Math.random();
    });
    // console.log(square.slice(0, this.mineNum));

    return square.slice(0, this.mineNum);
}

//初始化
Mine.prototype.init = function () {
    var rn = this.randomNum();  //雷在格子里的位置
    var n = 0;  //用来找到对应的格子的索引
    for(var i = 0; i < this.tr; i ++){
        this.squares[i] = [];
        for(var j = 0; j < this.td; j ++) {
            //取一个方块在数组里的数据要使用行与列的形式去取，找方块周围的方块的时候要用坐标的形式去取
            //行与列的形式与坐标的形式，x和y刚好相反
            // n++;
            if(rn.indexOf(n ++) != -1){ //如果这个条件成立，说明现在循环到的这个索引在雷的数组里找到了，那就表示这个索引对应的是个雷
                this.squares[i][j] = {type: 'mine', x: j, y: i};
            } else {
                this.squares[i][j] = {type: 'number', x: j, y: i, value: 0};
            }
        }
    }
    // console.log(this.squares);

    

    this.updateName();
    this.createDom();

    this.parent.oncontextmenu = function () {
        return false;
    }

    //剩余雷数
    this.mineNumberDom = document.querySelector('.mineNum');
    this.mineNumberDom.innerHTML = this.surplusMine;
}

//创建表格
Mine.prototype.createDom = function () {
    var table = document.createElement('table');
    var self = this;

    for(var i = 0; i < this.tr; i ++){  //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j = 0; j < this.td; j ++){  //列
            var domTd = document.createElement('td');
            // domTd.innerHTML = 0;

            domTd.pos = [i, j]; //表示把格子对应的行与列存到格子身上，为了下面通过这个值取数组里取到对应的数据
            domTd.onmousedown = function () {
                self.play(event, this);    //self指的是实例对象，this指的是点击的那个td
            }

            this.tds[i][j] = domTd; //把所有创建的数据添加到数组中

            /* if(this.squares[i][j].type == 'mine'){
                domTd.className = 'mine';
            }
            if(this.squares[i][j].type == 'number'){
                domTd.innerHTML = this.squares[i][j].value;
            } */

            
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = ''; //避免多次创建
    this.parent.appendChild(table);
}

// 找某个方格周围的所有方格
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = []; //把找到的格子的坐标返回出去（二维数组）

    for(var i = x - 1; i <= x + 1; i ++) {
        for (var j = y - 1; j <= y + 1; j ++) {
            if(
                i < 0 ||    //格子超出来左边的范围
                j < 0 ||    //格子超出了上边的范围
                i > this.td - 1 ||  // 格子超出了右边的范围
                j > this.tr - 1 ||  //格子超出了下边的范围
                (i == x && j == y) ||   //当前循环到的格子是自己
                this.squares[j][i].type == 'mine'   //周围的格子是雷
            ) {
                continue;
            }
            
            result.push([j,i]); //要以行与列的形式返回出去，因为到时候需要用它去取数组里的数据
        }
    }

    return result;
}

//更新所有的数字
Mine.prototype.updateName = function () {
    for(var i = 0; i < this.tr; i ++) {
        for(var j = 0; j < this.td; j ++) {
            if(this.squares[i][j].type == 'number') {   //当前格子是否为数字，若为数字，则跳出循环，只找雷周围的格子
                continue;
            }

            var num = this.getAround(this.squares[i][j]);   //获取到每一个雷周围的数字 得到的是一个二维数组
            
            for(var k = 0; k < num.length; k ++) {  
                // num[k] == [m, n]
                // num[k][0] == m
                // num[k][1] == n
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}

Mine.prototype.play = function (e, obj){
    var self = this;
    if(e.which == 1 && obj.className != 'flag'){   //表示点击的是左键
        // console.log(obj);

        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
        // console.log(curSquare);

        if(curSquare.type == 'number') {    //用户点到的是否为数字
            // console.log('number');
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            // console.log(obj);

            if(curSquare.value == 0) {  //使用递归的思想，先找零周围的格子，看有没有也是零的格子，如果有，则继续找周围为零的格子的周围有没有 周围为零的格子
                obj.innerHTML = ''; //如果数字为零则不显示

                function getAllZero(square) {
                    var around = self.getAround(square);    //找到了周围的n个格子

                    for(var i = 0; i < around.length; i ++) {
                        // around[i] = [0, 0]
                        var x = around[i][0];   //行
                        var y = around[i][1];   //列

                        self.tds[x][y].className = cl[self.squares[x][y].value];

                        if(self.squares[x][y].value == 0) { //判断以某个格子为中心找到的格子value值为零那就需要接着调用函数（递归）
                            if(!self.tds[x][y].check){  //对应的td添加一个属性，看是否被找过，如果被找过，则属性为真，如果没找过，则为undefind所以能进去
                                self.tds[x][y].check = true;
                                getAllZero(self.squares[x][y]);
                            }
                        } else {
                            //如果以某个格子为中心找到的格子value值不为零，则把找到的格子的value值显示出来
                            self.tds[x][y].innerHTML = self.squares[x][y].value;
                        }
                    }

                }

                getAllZero(curSquare);
            }
        } else {
            // console.log('bom~')
            this.gameOver (obj);
        }
    }

    if(e.which == 3) {
        if(obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';

        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;   //表示用户标的小红旗都对了
        } else {
            this.allRight = false;
        }

        if(obj.className == 'flag') {
            // console.log(this.surplusMine);
            this.mineNumberDom.innerHTML = -- this.surplusMine;
        } else {
            this.mineNumberDom.innerHTML = ++ this.surplusMine;
        }

        if(this.surplusMine == 0) { //用户认为剩余雷的数量为零
            if(this.allRight) {
                alert('恭喜你，通关游戏！');
            } else {
                alert('游戏失败');
                this.gameOver();
            }
        }
    }
    
}

//游戏失败
Mine.prototype.gameOver = function (clickTd) {
    for(var i = 0; i < this.tr; i ++) {
        for(var j = 0; j < this.td; j ++) {
            if(this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }

    if(clickTd) {
        clickTd.style.backgroundColor = '#f00';
    }
}

// var mine = new Mine(28,28,99);
// mine.init();

// console.log(mine.getAround(mine.squares[0][0]));

//上边button的功能
var btns = document.querySelectorAll('.level button');
var mine = null;    //用来存储生成的实例
var ln = 0; //用来处理当前选中的状态
var arr = [[9,9,10], [16, 16, 40], [28, 28, 99]];   //扫雷的不同级别

for(let i = 0; i <btns.length - 1; i ++) {
    btns[i].onclick = function () {
        btns[ln].className = '';
        this.className = 'active';

        // mine = new Mine(arr[i][0], arr[i][1], arr[i][2]);
        mine = new Mine(...arr[i]);

        mine.init();
        ln = i;
    }
}


//重新开始
btns[3].onclick = function () {
    mine.init();
    this.mineNumberDom = document.querySelector('.mineNum');
    this.surplusMine = btns[ln].onclick();
}

btns[0].onclick();  //初始化一下
