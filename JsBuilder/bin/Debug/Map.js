/*Содержит методы и данные для работы с картой лабиринта и его генерации.
 */

var roadCode = '7'; //Представление элемента дороги в виде числа
var borderCode = '0'; //Представление элемента внешних стенок в виде числа
var entryCode = '8'; //Представление элемента входа в лаюиринт в виде числа
var exitCode = '9'; //Представление элемента выхода из лабиринта в виде числа
var wallCode1 = '1'; //Всего доступно 3 типа стенок внутри игры КОДЫ 1,2,3
var wallCode2 = '2'; //Всего доступно 3 типа стенок внутри игры КОДЫ 1,2,3
var wallCode3 = '3'; //Всего доступно 3 типа стенок внутри игры КОДЫ 1,2,3
//Коды игровых предметов
var coinCode = '4'; //КОД МОНЕТКИ

//Массив содержащий игровые код всех игровых элементов
var allGameItemsCode = [roadCode, borderCode, coinCode, exitCode, entryCode, wallCode1, wallCode2, wallCode3];

//Разрешение одного тайла на поле
var oneTileWidth = 100;
var oneTileHeight = 100;
//Переменная для хранения бинарного представления поля
var binMap = null;
//Массив хранящий игровые объекты(монетки)
var gameObjects = new Array();

var entrySide = "NONE" //Хранит местоположение входа в лабиринте - необходимо для инициализации робота

var field = new Array(); //Массив хранящий экземпляры fieldElement, представляющие элементы поля

//Класс описывающий элемент поля. Содержит в себе элементы для графической части, и массив команд.
function fieldElement(imgSource, comm, elemcode, fx, fy, fw, fh) {
    //Параметры элемента
    this.code = elemcode;
    this.commands = comm;
    this.commandsImgs = undefined;
    this.isCommandsReaded = false;
    this.isStroke = false;

    //Объекты изображений
    //Объект который хранит графическое представление элемента с исходным изображением
    //var this.__proto__ = newImageObj(this.imgSrc, fx, fy, fw, fh);
    this.__proto__ = newImageObj(imgSource, fx, fy, fw, fh);
    this.parent = this.__proto__;

    //Добавляем обработчик на клик если этот элемент дорога либо вход
    if (this.code == roadCode || this.code == entryCode) {
        this.setUserData({
            onClick: function (index) {//index - индекс элемента в массиве где он хранится
                return labyrinthRoadClick(index)
            }
        });
    }

    //Задает полностью новое изображение для элемента
    this.setNewImageSrc = function (src) {
        this.__proto__.file = imgPath;
    }

    //Задает файл с картинкой элемента
    this.setNewSourceImage = function (imgPath) {
        this.imgSrc = imgPath;
        this.__proto__ = newImageObj(this.imgSrc, this.__proto__.x, this.__proto__.y, this.__proto__.w, this.__proto__.h);
    }

    //Задает размер элемента
    this.setNewSize = function (x, y, w, h) {
        this.__proto__.x = x;
        this.__proto__.y = y;
        this.__proto__.w = w;
        this.__proto__.h = h;
    }

    //Возвращает текущее графическое представление элемента по исходному изображению
    this.getImageObject = function () {
        return this.__proto__;
    }

    //Отрисовывает элемент на экране
    this.draw = function () {
        this.__proto__.draw();
        if (this.__proto__.strokeWidth !== 0) {
            this.__proto__.drawStaticBox();
        }
    }

    //Задает наличие выделения элемента.(Нужно для отображения когда добавляем команды на поле)
    this.setStroke = function (isStroke) {
        this.isStroke = isStroke;
        if (this.isStroke) {
            this.__proto__.strokeWidth = 100;
        } else {
            this.__proto__.strokeWidth = 0;
        }
    }
    //Возвращает массив ImageObject-ов элементов команд по заданному index из стека
    this.getCommandsImagesArr = function () {
        var result = [];
        OOP.forArr(this.commands, function (comm) {

            var obj = game.newImageObject({
                file: comm.imgSource,
                x: 0,
                y: 0,
                w: 15,
                h: 15
            });

            obj.setUserData({
                command: comm
            });
            result.push(obj);
        });
        return result;
    }

    //Возвращает общее число команд в этом элементе
    this.getTotalCommands = function () {
        return this.commands.length;
    }

    //Удаляем indexElem элемент из indexMass массива
    this.removeCommand = function (indexElem) {
        //Потому что индексация в графике идет с начала списка, а тут - с конца
        var indx = this.commands.length - 1 - indexElem;
        //log("Индекс в командах : " + indx);
        //Удаляем элемент
        this.commands.splice(indx, 1);
    }

    //Полностью очищает стек команд элемента
    this.commandsClear = function () {
        this.commands = new Array();
    }

    this.getTopCommand = function (isRead) {
        if (this.commands[0]) {
            var result = this.commands.length - 1;
            if (isRead !== undefined && isRead)
                if (isRead !== undefined && isRead) {
                    if (this.isCommandsReaded && this.code != entryCode) return undefined;
                    this.isCommandsReaded = true;
                }
            return result;
        }
    }

    //Если isDelete = true - то он удаляется
    this.getCommands = function (isRead) {
        //Если флаг не поставлен то просто возвращаем команды
        if (!isRead) return this.commands;
        //Если читаем команды с флагом, то надо пометить что они уже были считаны
        if (this.isCommandsReaded) return [];
        //Помечаем считанные команды
        this.isCommandsReaded = true;
        return this.commands;
    }

    //Добавляет elem в массив комманд
    this.addCommand = function (elem) {
        if (this.commands) {
            this.commands.push(elem);
        }
    }

    //comms - массив ImageObjectов с данными в commands
    this.addCommands = function (comms, isClear) {
        if (isClear) //Если удаляем предыдущие элементы
            this.commands = new Array();
        for (var i = 0; i < comms.length; i++)
            this.commands.unshift(comms[i].command);
    }

    //Создает новый ImageObject этого элемента - приватный метод
    function newImageObj(src, X, Y, W, H) {
        var res = game.newImageObject({
            file: src,
            x: X,
            y: Y,
            w: W,
            h: H
        });
        res.file = src;
        return res;
    }
}

//Перерасчитывает размеры существующего поля
function calcField(w, h, x, y, elemsInLine, elemsInColumn) {

    oneTileWidth = w / elemsInLine; //Расчет ширины одного элемента
    oneTileHeight = h / elemsInColumn; //Расчет высоты одного элемента
    //Обходим все элементы лабиринта
    pjs.levels.forStringArray({
            w: oneTileWidth,
            h: oneTileHeight,
            source: binMap
        },
        function (S, X, Y, W, H) {
            //Извлекаем старый элемент
            var element = field.shift();
            var img = element.imgSrc;
            var comm = element.commands;
            //На его место добавляем новый
            var newElem = new fieldElement(img, comm, S, X + x, Y + y, oneTileWidth, oneTileHeight);
            if (element.this.__proto__ectSource.strokeWidth != 0)
                newElem.setStroke(true);
            field.push(newElem);
        });
    if (gameObjects !== undefined)
        for (var i = 0; i < gameObjects.length; i++)
            gameObjects[i].setSize(field[gameObjects[i].position]);
}

//Смещает всю карту в нужный размер
function calcMapPosition(){
    oneTileWidth = gameSpaceW / totalWidth; //Расчет ширины одного элемента
    oneTileHeight = gameSpaceH / totalHeight; //Расчет высоты одного элемента
    var poz = new point(gameSpaceX,gameSpaceY);
    var counter = 0;
    //Обходим все элементы поля
    for(var i = field.length - 1; i > -1; i--){
        field[i].setNewSize(poz.x,poz.y,oneTileWidth,oneTileHeight);
        counter++;
        //Если надо сместить координаты на строку вниз
        if(counter == totalWidth){
            poz.x = gameSpaceX;
            poz.y += oneTileHeight;
            counter = 0;
        }
        else poz.x += oneTileWidth;//Если это следующий элемент в строке поля
    }
}

function generateMap(w, h, x, y, elemsInLine, elemsInColumn) {

    oneTileWidth = w / elemsInLine; //Расчет ширины одного элемента
    oneTileHeight = h / elemsInColumn; //Расчет высоты одного элемента
    //Получаем массив сгенерированного поля
    binMap = genBin(elemsInColumn, elemsInLine, [], [], [0, 0]);
    var itersX = 0,
        itersY = 0;
    var gObjs = new Array();
    //Обходим каждый элемент сгенерированного поля и создаем объекты характеризующие элементы поля
    pjs.levels.forStringArray({
            w: oneTileWidth,
            h: oneTileHeight,
            source: binMap
        },
        function (S, X, Y, W, H) {

            var img = bordersPath;
            var comm = new Array();

            if (S == roadCode || S == entryCode || S == exitCode) {
                img = groundPath;
                //Если это клетка входа в лабиринт, инициализируем сразу команду для игрока в ней
                if (S == entryCode) {
                    if (entrySide == "DOWN") comm.push(COMMANDS[1]);
                    else if (entrySide == "UP") comm.push(COMMANDS[2]);
                    else if (entrySide == "LEFT") comm.push(COMMANDS[4]);
                    else if (entrySide == "RIGHT") comm.push(COMMANDS[3]);
                    comm[0].undeletable = true; //Делаем эту команду неудаляемой
                    img = entryPath;
                } else if (S == exitCode) {
                    img = exitPath;
                    //comm.push(COMMANDS.STOP);
                }
            } else if (S > 0) {
                img = wallPaths[S - 1];
            }
            var fEl = new fieldElement(img, comm, S, X + x, Y + y, oneTileWidth, oneTileHeight);
            //Заполняем массив элементов лабиринта
            field.push(fEl);
        });

    //ГЕНЕРИМ МЕСТОПОЛОЖЕНИЕ ИГРОВЫХ ОБЪЕКТОВ ЕСЛИ НАДО
    if (totalTokensOnMap !== 0) {
        gameObjects = new Array();
        var roadElems = new Array();
        //Индексируем все элементы дороги на поле
        OOP.forArr(field, function (el, i) {
            if (el.code == roadCode)
                roadElems.push(i);
        });
        //Защита от того, чтобы вдруг не случилось так чтобы все боле было усыпано монетками
        var total = totalTokensOnMap > (roadElems.length / 3) ? roadElems.length / 3 : totalTokensOnMap;
        //Ставим в случайных точках карты монетки
        for (var i = 0; i < total; i++) {
            var rndIndx = getRandomInt(0, roadElems.length);
            var obj = new CoinBattery("coin", coinCode, roadElems[rndIndx], coinPath, true);
            roadElems.splice(rndIndx, 1);
            gameObjects.push(obj);
        }
    }
}

//Генерит лабиринт в виде строк с кодами элементов поля
function genBin(hate, width, maze, walls, currentPosition) {
    //7 - дорога, 0 - стена, 1,2,3 другие стены, 8 - вход, 9 - выход
    hate = hate % 2 == 0 ? hate + 1 : hate;
    width = width % 2 == 0 ? width + 1 : width;
    hate -= 2;
    width -= 2;

    var mazeTmp = [];
    for (var y = 0; y < hate + 2; y++) {
        maze[y] = [];
        mazeTmp[y] = [];
        for (var x = 0; x < width + 2; maze[y][x++] = borderCode) {
            mazeTmp[y][x] = borderCode;
        }
    }

    function amaze(y, x, addBlockWalls) {
        maze[y][x] = roadCode;
        log(y + " " + x);
        if (addBlockWalls && valid(y + 1, x) && (maze[y + 1][x] == borderCode)) walls.push([y + 1, x, [y, x]]);
        if (addBlockWalls && valid(y - 1, x) && (maze[y - 1][x] == borderCode)) walls.push([y - 1, x, [y, x]]);
        if (addBlockWalls && valid(y, x + 1) && (maze[y][x + 1] == borderCode)) walls.push([y, x + 1, [y, x]]);
        if (addBlockWalls && valid(y, x - 1) && (maze[y][x - 1] == borderCode)) walls.push([y, x - 1, [y, x]]);
    }

    function valid(a, b) {
        return (a < hate && a >= 0 && b < width && b >= 0) ? true : false;
    };
    amaze(currentPosition[0], currentPosition[1], true);

    while (walls.length != 0) {
        var randomWall = walls[Math.floor(Math.random() * walls.length)],
            host = randomWall[2],
            opposite = [(host[0] + (randomWall[0] - host[0]) * 2), (host[1] + (randomWall[1] - host[1]) * 2)];
        if (valid(opposite[0], opposite[1])) {
            if (maze[opposite[0]][opposite[1]] == roadCode) walls.splice(walls.indexOf(randomWall), 1);
            else amaze(randomWall[0], randomWall[1], false), amaze(opposite[0], opposite[1], true);
        } else walls.splice(walls.indexOf(randomWall), 1);
    }

    for (var i = 1; i < mazeTmp.length - 1; i++) {
        for (var j = 1; j < mazeTmp.length - 1; j++) {
            mazeTmp[i][j] = maze[i - 1][j - 1];
            if (mazeTmp[i][j] == borderCode) {
                mazeTmp[i][j] = "" + getRandomInt(1, 4); //Генерит случайную стенку внутри лабиринта КОДЫ 1 2 3
            }
        }
    }

    //Генерим местоположение входа и выхода из лабиринта
    var indx = 0;
    //Рэндомим вход или выход
    var isEntry = getRandomInt(0, 2) == 1;
    //Если вход/выход будет на левой и правой стенке
    if (getRandomInt(0, 2) == 1) {

        //Инициализируем местоположение входа
        if (isEntry) entrySide = "LEFT";
        else entrySide = "RIGHT";

        //Генерим рэндомный индекс из левой стенки для входа
        indx = getRandomInt(1, mazeTmp.length - 2);
        //Проверяем, чтобы прямо перед элементом не было стены
        if (mazeTmp[indx][1] != roadCode) indx++;
        //Ставим вход или выход на левую стенку
        mazeTmp[indx][0] = isEntry ? entryCode : exitCode;

        //Генерим рэндомный индекс из правой стенки для входа
        indx = getRandomInt(1, mazeTmp.length - 2);
        //Проверяем, чтобы прямо пере элементом не было стены
        if (mazeTmp[indx][mazeTmp[0].length - 2] != roadCode) indx++;
        //Ставим вход или выход на правую стенку
        mazeTmp[indx][mazeTmp[0].length - 1] = isEntry ? exitCode : entryCode;
    } else { //Если вход и выход будет на верхней и нижней стенке

        //Инициализируем местоположение входа
        if (isEntry) entrySide = "UP";
        else entrySide = "DOWN";

        //Генерим рэндомный индекс из верхней стенки для входа
        indx = getRandomInt(1, mazeTmp[0].length - 2);
        //Проверяем, чтобы прямо перед элементом не было стены
        if (mazeTmp[1][indx] != roadCode) indx++;
        //Ставим вход или выход на верхней стенке
        mazeTmp[0][indx] = isEntry ? entryCode : exitCode;

        //Генерим рэндомный индекс из нижней стенки для выходв
        indx = getRandomInt(1, mazeTmp[mazeTmp.length - 1].length - 2);
        //Проверяем, чтобы прямо перед элементом не было стены
        if (mazeTmp[mazeTmp.length - 2][indx] != roadCode) indx++;
        //Ставим вход или выход на нижней стенке
        mazeTmp[mazeTmp.length - 1][indx] = isEntry ? exitCode : entryCode;
    }

    return mazeTmp;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getCloneObject(obj) {
    let clone = {}; // Создаем новый пустой объект
    for (let prop in obj) { // Перебираем все свойства копируемого объекта
        if (obj.hasOwnProperty(prop)) { // Только собственные свойства
            if ("object" === typeof obj[prop]) // Если свойство так же объект
                clone[prop] = getCloneObject(obj[prop]); // Делаем клон свойства
            else
                clone[prop] = obj[prop]; // Или же просто копируем значение
        }
    }
    return clone;
}
