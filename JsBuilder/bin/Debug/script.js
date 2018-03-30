/* Файл описания методов рбаоты с данными пользователя на локальной машине */

// диалог выбора рабочей платформы
// не вфбрав платформу - нельзя работать
var login = document.getElementById("user_dialog");

// имея сессионной переменной для передачи данных пользователя
const userSession = "userdata";
var typeGame = "typeGame"

// араметры игрового мира
const gameOptions = "gameOptions";

// указатель на место отображения имени пользователя на форме
var userName = document.getElementById("user_name");

// данные пользователя
//           логин  user
//          пароль  password
// глобальный опыт  experiance
//    текущая игра  game
var userdata = 
    {
        user        : "demo",
        password    : "",
        experiance  : "0",
        game        : "",
        userID      : ""
    };
//класс для хранения временных данных пользователя
var tmpUserData = 
{
    userName: "user",
    userId: 'id',
};
// определяем событие на закрытие диалога платформы
// не позволяем закрыть диалог не выбрав плафторму
login.addEventListener('close', function() 
    {
        // очистим содержимое формы ввода данных пользователя
        document.getElementById("userName").value = ""; 
        document.getElementById("userPswd").value = "";

        if(this.returnValue != 'cancel')
        {
            //userdata = JSON.parse(this.returnValue);
            userName.innerHTML = userdata.user;
        }
//        userName.innerHTML = userdata.user;
    }
);

// отображает диалоговое оккно входа нового пользователя
function loginShow()
{
    login.showModal();
}

// определение пользователя в системе и вход его
function userEnter()
{
    userdata.user = document.getElementById("userName").value; 
    userdata.password = document.getElementById("userPswd").value;
    if(userdata.user.length >0 && userdata.password.length > 0)
    {
        userID = 'id_' + CRC32.str(userdata.user + userdata.password);
        userdata.userID = userID;
        var error = true;

        if(localStorage.getItem(userID))
        {
            login.close(localStorage.getItem(userID));
        }
        else
        {
            //if(confirm('Пользователь:%0\rПароль:%1\rНе зарегестрирован в системе\r\rХотите зарегестрироваться?'.replace('%0', userdata.user).replace('%1', userdata.password)))
            //{
                localStorage.setItem(userID, JSON.stringify(userdata));
                login.close(localStorage.getItem(userID));
            //}
        }
    }
}

// отмена входа нового пользователя
function userCancel()
{
    login.close('cancel');
}
function userExit()
{
    sessionStorage.removeItem(userSession)
    sessionStorage.removeItem("tmpUserData")
    localStorage.removeItem("tmpUserData");
    userID = undefined;
    userdata.user = "Demo пользователь"
    login.close('close')
}
// запускает игру с читыми данными полльзователя
// если пользователь не новый - стирает старые данные
// (возможно) выводит запрос на действие
function newGame()
{
    // userID = 'id_' + CRC32.str(userdata.user + userdata.password);
   // if(userID !== undefined)
     //   {
            userdata.experiance = "0";
            userdata.game = "";
            sessionStorage.setItem(typeGame, "NewGame");
            sessionStorage.setItem(userSession, userID);
            tmpUserData.userName = userdata.user;
            tmpUserData.userId = userID;
            var tud = JSON.stringify(tmpUserData);
            sessionStorage.setItem("tmpUserData",tud);
            localStorage.setItem("tmpUserData",tud);
       // }
   // continueGame();
}

// если имеются схранённые днные - загружает их
// если данных нет - запускается новая игра
function continueGame()
{
   if(userID !== undefined)
       {
         sessionStorage.setItem(typeGame, "LoadGame");
        // передаём ID пользователя в игровой движок
        sessionStorage.setItem(userSession, userID);
        tmpUserData.userName = userdata.user;
        tmpUserData.userId = userID;
        var tud = JSON.stringify(tmpUserData);
        sessionStorage.setItem("tmpUserData",tud);
        localStorage.setItem("tmpUserData",tud);
       }
}

// выводит диалог ностроек программы
function optionsShow()
{

}