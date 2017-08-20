# Avbot Chat WebClient(社区在线聊天网页客户端)
Avbot Chat WebClient用来桥接网页和Telegram，让av社区的友人不用登录IRC安装任何客户端即可参与社区技术讨论。<br/>
网站地址：https://avplayer.github.io/avbot_webclient

## 特点
* 完全采用Websocket协议
* 全程HTTPS TLS1.2加密

## 通讯协议
### bot向web推送text消息
```js
{
    "cmd" : 1,
    "data" : {
        "timestamp" : "1503132689",
        "msg" : "this is a message text",
        "from" : "nickname",
        "user" : {
            "id" : 162385454,
            "name" : "username"
        }
    }
}
```

### bot向web推送image消息
```js
{
    "cmd" : 2,
    "data" : {
        "timestamp" : "392873947",
        "img_type" : "image/png",
        "img_data" : "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "caption" : "this is a message text near the picture",
        "from" : "nickname",
        "user" : {
            "id" : 162385454,
            "name" : "username"
        }
    }
}
```
* img_type可为：image/png、image/jpeg等
* img_data为：base64 string from image file


### bot向web推送audio/video消息
```js
{
    "cmd" : 2,
    "data" : {
        "timestamp" : "392873947",
        "video_type" : "video/mp4",
        "video_data" : "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "from" : "nickname",
        "user" : {
            "id" : 162385454,
            "name" : "username"
        }
    }
}
```
* video_type可为：video/mp4、audio/mpeg3等
* video_data为：base64 string from audio/video file

### web向bot发送text消息
```js
{
    "cmd" : 1,
    "data" : {
        "timestamp" : "1503132689",
        "msg" : "this is a message text",
        "from" : "nickname"
    }
}
```

### web向bot发送image消息
```js
{
    "cmd" : 2,
    "data" : {
        "timestamp" : "392873947",
        "img_type" : "image/png",
        "img_data" : "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "caption" : "this is a message text near the picture",
        "from" : "nickname"
    }
}
```
