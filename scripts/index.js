var message_field;
var telegram_ws;
var potato_ws;

window.onload = function ()
{
    var avbot_ws_address = "ws://127.0.0.1/avbot/chat";

    // Get references to elements on the page.
    message_field = document.getElementById("message");
    var ws_status = document.getElementById("ws_status");

    // Create a new WebSocket.
    telegram_ws = new ReconnectingWebSocket(avbot_ws_address, null, {reconnectInterval: 5000, timeoutInterval: 10000});

    // Handle any errors that occur.
    telegram_ws.onerror = function (error)
    {
        console.log("WebSocket Error: " + error);
    };

    // Show a connected message when the WebSocket is opened.
    telegram_ws.onopen = function (event)
    {
        ws_status.innerHTML = "Telegram WebSocket connect success";
        ws_status.className = "alert alert-success";
        push.className = "btn btn-small btn-success";
    };

    // Handle messages sent by the server.
    telegram_ws.onmessage = function (event)
    {
        var message = event.data;
        try{
            var obj = JSON.parse(message);
            if(obj["cmd"] == 1) {
                var str = `[${obj["data"]["timestamp"]}]${obj["data"]["from"]}: ${obj["data"]["msg"]}`;
                ws_status.innerHTML += str + "\n";
                console.log("从服务器接收到数据：" + message);
            }
        }
        catch(e)
        {
            console.log("从服务器接收到有误的数据：" + message);
        }
    };

    telegram_ws.onclose = function (event)
    {
        ws_status.innerHTML = "Telegram WebSocket connect failed";
        ws_status.className = "alert alert-danger";
        push.className = "btn btn-small btn-danger";
    };
};

function push_fun()
{
    var message = message_field.value;

    if (message == "")
    {
        return;
    }

    var datetime = moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss");

    send_to_telegram_ws(telegram_ws, message, datetime);
    message_field.value = "";
};

function send_to_telegram_ws(ws, message, datetime)
{
    var obj =
    {
        "cmd" : 1, //type: text message
        "data" : {
            "timestamp" : datetime,
            "msg" : message,
            "from" : "hyq"
        }
    }
    ws.send(JSON.stringify(obj));
}
