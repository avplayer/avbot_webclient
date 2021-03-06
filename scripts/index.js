var message_field;
var send_button;
var history_message;
var top_div;
var telegram_ws;
var show_name = "";
var avbot_ws_address = "wss://vps3.hyq.me:6002";
var avbot_face_address = "https://vps3.hyq.me:6002/avbot/face/";
var avbot_media_baseurl = "https://vps3.hyq.me:6002";
var msg_ids = new Array();

$(document).ready(function () {
    message_field = document.getElementById("message");
    send_button = document.getElementById("send_button");
    top_div = document.getElementById("top_div");

    try{
        window.emojiPicker = new EmojiPicker.EmojiPicker({
            emojiable_selector: '[data-emojiable=true]',
            assetsPath: 'emoji/img/'
        });
        window.emojiPicker.discover();
    }catch(exception){
        console.error(exception.message);
    }


    show_name = "匿名" + Math.floor(Math.random() * 10000 % 10000);
    $("#nickname_edit_button").html(show_name);

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
        $("#status_msg").html("WebSocket connected");
        top_div.className = "alert alert-success";
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
                append_history_text_message(obj["data"]["id"], obj["data"]["timestamp"], obj["data"]["from"],
                    obj["data"]["msg"],  obj["data"]["user"]);
            }
            else if(obj["cmd"] == 2) {
                append_history_image_message(obj["data"]["id"], obj["data"]["timestamp"], obj["data"]["from"],
                    obj["data"]["file_path"], obj["data"]["caption"], obj["data"]["user"]);
            }
            else if(obj["cmd"] == 3) {
                append_history_video_message(obj["data"]["id"], obj["data"]["timestamp"], obj["data"]["from"],
                obj["data"]["file_path"], obj["data"]["user"]);
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
        $("#status_msg").html("WebSocket connect failed");
        top_div.className = "alert alert-danger";
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
function open_picture_dialog()
{
    BootstrapDialog.show({
        title: 'Send a picture',
        type: BootstrapDialog.TYPE_SUCCESS,
        message: `Please choose a file.
        <input id="file_input" type="file" onchange="preview_file()"/>
        <input id="file_base64" type="hidden"/>
        <img id="preview_img" style="max-width:90%;max-height:300px;"/><br/>
        <input id="caption_input" class="form-control" style="width:100%;display:none;" title="Picture caption" placeholder="Picture Caption(Optional)" required/>`,
        buttons: [{
            label: 'Cancel',
            action: function(dialog){
                dialog.close();
            }
        },{
            label: 'Send',
            cssClass: 'btn-success',
            action: function(dialog) {
                var file_base64_str = $("#file_base64").val();
                var caption_input_str = $("#caption_input").val();
                if(file_base64_str==""){
                    return;
                }
                var datetime = String(moment().unix());
                send_image(telegram_ws, "image/png", file_base64_str, caption_input_str, datetime);
                dialog.close();
            }
        }]
    });
}
function preview_file()
{
    var preview = document.querySelector('#preview_img');
    var file = document.querySelector('#file_input').files[0];
    $("#file_base64").val("");
    var reader_preview  = new FileReader();
    var reader  = new FileReader();

    reader.addEventListener("load", function () {
        preview.src = reader_preview.result;
        $("#file_base64").val(btoa(reader.result));
    }, false);

    if (file) {
        reader_preview.readAsDataURL(file);
        reader.readAsBinaryString(file);
    }
    $('#caption_input').show();
}
function resize()
{
    var el = $('#history_message');
    curHeight = el.height();
    autoHeight = window.innerHeight - $('body').offset().top - $('#top_div').height() - $('#bottom_div').height() - 20;
    el.height(curHeight).animate({height: autoHeight}, 5);
    $('#history_message').animate({scrollTop: $('#history_message')[0].scrollHeight}, 5);
}
function edit_nickname()
{
    BootstrapDialog.show({
        title: 'Change my nickname',
        type: BootstrapDialog.TYPE_SUCCESS,
        message: `Please input your Nickname: <input id="nickname" class="form-control" style="width:90%;" title="Set Nickname" placeholder="Nickname" value="${show_name}" required/>`,
        buttons: [{
            label: 'Cancel',
            action: function(dialog){
                dialog.close();
            }
        },{
            label: 'Save',
            cssClass: 'btn-success',
            action: function(dialog) {
                var new_name_str = $("#nickname").val();
                if(new_name_str==""){
                    return;
                }
                show_name = new_name_str;
                $("#nickname_edit_button").html(show_name);
                dialog.close();
            }
        }]
    });
}
function send_fun()
{
    var text_message = message_field.value;
    if (text_message == "")
    {
        return;
    }
    var datetime = String(moment().unix());
    send_text(telegram_ws, text_message, datetime);
    message_field.value = "";
    $(".emoji-wysiwyg-editor").html("");
}
function html_encode(value)
{
    return $('<div/>').text(value).html();
}

function insert_html_msg(msgid, message_html)
{
    var exists_index = msg_ids.findIndex(function(element){
        return element == msgid;
    });
    if(exists_index != -1)
    {
        return;
    }
    var index = msg_ids.findIndex(function(element){
        return element >= msgid;
    });
    if(index == -1)
    {
        $("#history_message").append(message_html);
        msg_ids.push(msgid);
    }
    else
    {
        $(message_html).insertAfter(`#msg_${msg_ids[index]}`);
        msg_ids.splice(index, 0, msgid);
    }
    $('#history_message').animate({scrollTop: $('#history_message')[0].scrollHeight}, 5);
}

function append_history_text_message(id, timestamp, from, message, user)
{
    var message_html = "";
    message = message == "" ? "&nbsp;" : message;
    message = html_encode(message);
    var mome = moment(parseInt(timestamp)*1000);
    var hhmm = mome.utcOffset(8).format("HH:mm");
    var img_url = "";
    if(user != null){
        img_url = avbot_face_address + user["id"];
    }
    else {
        img_url = "res/avbot.jpg";
    }
    if(from == show_name)
    {
        message_html =
        `<div class="rightd" id="msg_${id}">
            <span class="rightd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech right">
                ${message}
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    else
    {
        message_html =
        `<div class="leftd" id="msg_${id}">
            <span class="leftd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech left">
                <span class="nickname">${from}</span><br/>
                ${message}
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    insert_html_msg(id, message_html);
}

function append_history_image_message(id, timestamp, from, img_path, caption, user)
{
    var message_html = "";
    message = message == "" ? "&nbsp;" : message;
    var mome = moment(parseInt(timestamp)*1000);
    var hhmm = mome.utcOffset(8).format("HH:mm");
    var img_url = "";
    if(user != null){
        img_url = avbot_face_address + user["id"];
    }
    else {
        img_url = "res/avbot.jpg";
    }
    caption = html_encode(caption);
    var media_url = avbot_media_baseurl + img_path;
    if(from == show_name)
    {
        message_html =
        `<div class="rightd" id="msg_${id}">
            <span class="rightd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech right">
                <span class="nickname">${from}</span><br/>
                <img src="${media_url}"/>
                <br/><br/>${caption}
                <br/><span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    else
    {
        message_html =
        `<div class="leftd" id="msg_${id}">
            <span class="leftd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech left">
                <span class="nickname">${from}</span><br/>
                <img src="${media_url}"/>
                <br/><br/>${caption}
                <br/><span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    insert_html_msg(id, message_html);
}

function append_history_video_message(id, timestamp, from, video_path, user)
{
    var message_html = "";
    message = message == "" ? "&nbsp;" : message;
    var mome = moment(parseInt(timestamp)*1000);
    var hhmm = mome.utcOffset(8).format("HH:mm");
    var img_url = "";
    if(user != null){
        img_url = avbot_face_address + user["id"];
    }
    else {
        img_url = "res/avbot.jpg";
    }
    var media_url = avbot_media_baseurl + video_path;
    if(from == show_name)
    {
        message_html =
        `<div class="rightd" id="msg_${id}">
            <span class="rightd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech right">
                <span class="nickname">${from}</span><br/>
                <video src="${media_url}" autoplay="1" controls="controls" loop="loop"/>
                <br/><span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    else
    {
        message_html =
        `<div class="leftd" id="msg_${id}">
            <span class="leftd_h">
                <img src="${img_url}" title="${from}" onerror="this.src='res/default.png'"/>
            </span>
            <div class="speech left">
                <span class="nickname">${from}</span><br/>
                <video src="${media_url}" autoplay="1" controls="controls" loop="loop"/>
                <br/><span class="timestamp">${hhmm}</span>
            </div>
        </div>`;
    }
    insert_html_msg(id, message_html);
}

function send_text(ws, message, datetime)
{
    var obj =
    {
        "cmd" : 1, //type: text message
        "data" : {
            "timestamp" : datetime,
            "msg" : message,
            "from" : show_name
        }
    }
    var send_str = JSON.stringify(obj);
    ws.send(send_str);
    console.log("向服务器发送文字消息，数据：" + send_str);
}

function send_image(ws, img_type, img_data, caption, datetime)
{
    var obj =
    {
        "cmd" : 2, //type: image message
        "data" : {
            "timestamp" : datetime,
            "img_type" : img_type,
            "img_data" : img_data,
            "caption" : caption,
            "from" : show_name
        }
    }
    var send_str = JSON.stringify(obj);
    ws.send(send_str);
    console.log("向服务器发送图片消息，数据：" + send_str);
}