var message_field;
var send_button;
var history_message;
var ws_status;
var telegram_ws;
var show_name = "";
var avbot_ws_address = "wss://www.hyb1.com/avbot/chat";

$(document).ready(function () {
    message_field = document.getElementById("message");
    send_button = document.getElementById("send_button");
    ws_status = document.getElementById("ws_status");

    show_name = "匿名" + Math.floor(Math.random() * 10000 % 10000);
    $("#nickname").val(show_name);

    $("#message").keyup(function(event){
        if(event.keyCode == 13){
            send_fun();
        }
    });

    telegram_ws = new ReconnectingWebSocket(avbot_ws_address, null, {reconnectInterval: 100, timeoutInterval: 10000});

    telegram_ws.onerror = function (error)
    {
        console.log("服务器WebSocket连接发生错误：" + error);
    };

    telegram_ws.onopen = function (event)
    {
        ws_status.innerHTML = "Telegram WebSocket connect success";
        ws_status.className = "alert alert-success";
        message_field.disabled = false;
        send_button.className = "btn btn-small btn-success";
        send_button.disabled = false;
        console.log("与服务器建立了websocket连接");
    };

    telegram_ws.onmessage = function (event)
    {
        var message = event.data;
        try{
            var obj = JSON.parse(message);
            if(obj["cmd"] == 1) {
                append_history_text_message(obj["data"]["timestamp"], obj["data"]["from"], obj["data"]["msg"]);
            }
            else if(obj["cmd"] == 2) {
                append_history_image_message(obj["data"]["timestamp"], obj["data"]["from"],
                    obj["data"]["img_type"], obj["data"]["img_data"],
                    obj["data"]["caption"]);
            }
            console.log("从服务器接收到数据：" + message);
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
        message_field.disabled = true;
        send_button.className = "btn btn-small btn-danger";
        send_button.disabled = true;
        console.log("服务器断开了websocket连接");
    };

    $(window).resize(function() {
        resize();
    });
    resize();

});
function resize()
{
    var el = $('#history_message');
    curHeight = el.height();
    autoHeight = window.innerHeight - $('body').offset().top - $('#ws_status').height() - $('#bottom_div').height() - 32;
    el.height(curHeight).animate({height: autoHeight}, 100);
    $('#history_message').animate({scrollTop: $('#history_message')[0].scrollHeight}, 100);
}
function send_fun()
{
    var text_message = message_field.value;
    if (text_message == "")
    {
        return;
    }
    var datetime = moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
    show_name = $("#nickname").val();
    send_text(telegram_ws, text_message, datetime);
    message_field.value = "";
};
function append_history_text_message(timestamp, from, message)
{
    var message_html = "";
    message = message == "" ? "&nbsp;" : message;
    var mome = moment(parseInt(timestamp)*1000);
    var hhmm = mome.utcOffset(8).format("HH:mm");
    if(from == show_name)
    {
        message_html =
        `<div class="rightd">
            <span class="rightd_h">
                ${from}[${hhmm}]
            </span>
            <div class="speech right" ng-class="speech left">
                ${message}
            </div>
        </div>`;
    }
    else
    {
        message_html =
        `<div class="leftd">
            <span class="leftd_h">
                [${hhmm}]${from}:
            </span>
            <div class="speech left" ng-class="speech left">
                ${message}
            </div>
        </div>`;
    }
    $("#history_message").append(message_html);
    $('#history_message').animate({scrollTop: $('#history_message')[0].scrollHeight}, 100);
}

function append_history_image_message(timestamp, from, img_type, img_data, caption)
{
    var message_html = "";
    message = message == "" ? "&nbsp;" : message;
    var mome = moment(parseInt(timestamp)*1000);
    var hhmm = mome.utcOffset(8).format("HH:mm");
    caption = caption == "" ? "" : "<br/>" + caption;
    if(from == show_name)
    {
        //todo: image message by my sended
    }
    else
    {
        message_html =
        `<div class="leftd">
            <span class="leftd_h">
                [${hhmm}]${from}:
            </span>
            <div class="speech left" ng-class="speech left">
                <img src="data:${img_type};base64, ${img_data}" alt="Red dot" />${caption}
            </div>
        </div>`;
    }
    $("#history_message").append(message_html);
    $('#history_message').animate({scrollTop: $('#history_message')[0].scrollHeight}, 100);
}

function send_text(ws, message, datetime)
{
    var obj =
    {
        "cmd" : 1, //type: text message
        "data" : {
            "timestamp" : datetime,
            "msg" : message,
            "from" : $("#nickname").val()
        }
    }
    var send_str = JSON.stringify(obj);
    ws.send(send_str);
    console.log("向服务器发送数据：" + send_str);
}
