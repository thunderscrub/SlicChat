const url = "ws://88.192.28.149:8080"
const protocols = "echo-protocol"
const chatbox = document.querySelector(".chatbox")
const sidebar = document.querySelector(".sidebar")
const msgtemp = document.querySelector(".messagetemp")
const chatinput = document.querySelector(".chatinput")
const charlimit = document.querySelector(".charlimit")
const main = document.querySelector(".main")
const reader = new FileReader()
const dec = new TextDecoder()

function createroom(id){
    if(id != "" && id != null){
        msgobj = {
            target: {
                type: "room",
                id: id},
            content: undefined,
            sender: user
        }
        client.send(new Blob([JSON.stringify(msgobj, null, 2)], {type:'application/json'}));
        if(!(id in rooms.roomlist)){
            sidebar.innerHTML += `<button onclick = loadRoom('${id}')> ${id} </button>`
            rooms.addRoom(id);
            rooms.currentRoom = id
        }
    }
}

function timeFunc(callback){
    let t1 = Date.now();
    callback()
    let t2 = Date.now();
    console.log(t2-t1);
}

chatinput.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        if(chatinput.value != "" && chatinput.value.length <= 1000){
            time = new Date();
            msgtime = {hours: time.getHours(), minutes: time.getMinutes()}
            if(time.getMinutes() < 10){
                msgtime.minutes = "0"+time.getMinutes();
            }
            if(time.getHours() < 10){
                msgtime.hours = "0"+time.getHours();
            }
            let type = "all"
            let id = undefined
            if(rooms.currentRoom != undefined){
                type = "roomMsg"
                id = rooms.currentRoom
            }
            msgobj = {
                target: {type: type, id: id},
                content: chatinput.value,
                sender: user,
                time: msgtime.hours+":"+msgtime.minutes
            }
            client.send(new Blob([JSON.stringify(msgobj, null, 2)], {type:'application/json'}));
            chatinput.value = "";
            charlimit.innerHTML = "(0 / 1000)"
        }
    }
})
chatinput.oninput = () => {
    charlimit.innerHTML = "("+chatinput.value.length+" / 1000)"
    if(chatinput.value.length < 1000){
        charlimit.style.color = "black";
    }else{
        charlimit.style.color = "red";
    }
}

function createMessage(msg){

    const sender = msg.sender;
    const content = msg.content;
    const time = msg.time;
    const message = msgtemp.content.cloneNode(true);
    const messages = document.querySelectorAll(".message");
    const lastmessage = messages[messages.length-1];
    const msgsender = message.querySelector(".sender");

    if(lastmessage != undefined){
        if(lastmessage.id != sender){
            msgsender.innerHTML = sender;
        }else{
            msgsender.remove;
        }
        if(lastmessage.querySelector(".time").innerHTML == time){
            lastmessage.querySelector(".time").innerHTML = "";
        }
    }else{
        msgsender.innerHTML = sender;
    }
    message.querySelector(".message").id = sender;
    message.querySelector(".content").innerHTML = content;
    message.querySelector(".time").innerHTML = time;
    return message;
}

function loadRoom(roomId){
    chatbox.innerHTML = ""
    //while(chatbox.firstChild)chatbox.removeChild(chatbox.firstChild)
    rooms.currentRoom = roomId
    rooms.roomlist[roomId].initLoad()
}

let client = new WebSocket(url, protocols);

client.onerror = function() {
    console.log('Connection Error');
};
let user;
client.onopen = function() {
    console.log('WebSocket Client Connected');
    user = prompt("Username: ");
    if(user == null || user ==""){
        const id = Math.floor(Math.random() * (9999 - 1000) + 1000);
        user = "User#" + id;
    }
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};
client.onmessage = function(e) {
    reader.onload = function(event){

        let msg = (JSON.parse(dec.decode(event.target.result)))
        switch(msg.target.type){
            case "roomMsg":
                rooms.roomlist[msg.target.id].addMsg(msg)
                if(rooms.currentRoom == msg.target.id){
                    chatbox.appendChild(createMessage(msg))
                    //console.log(msg)
                }
                break;
        }

        //chatbox.appendChild(createMessage(msg));
    }
    reader.readAsArrayBuffer(e.data);

    window.scrollTo(0,chatbox.scrollHeight);
    
};

const rooms = {
    currentRoom: undefined,
    roomlist: {},
    addRoom: function(id){
        if(!(id in this.roomlist)) this.roomlist[id] = {
            counter: 0,
            messagelists: [[]],
            addMsg: function(msg){
                if(this.counter > 24){
                    this.messagelists.push([])
                    this.counter = 0;
                }
                this.messagelists[this.messagelists.length-1].push(msg)
                this.counter++
            },
            loadMessages: function(msgListArr){
                for(i = 0; i < msgListArr.length; i++){
                    msgListArr[msgListArr.length - 1 - i].forEach(e => chatbox.appendChild(createMessage(e)))
                }
                //msgListArr.forEach(msgArr => msgArr.forEach(e => chatbox.appendChild(createMessage(e))))
            },
            initLoad: function(){
                let temp = []
                for(i=1; i-1<Math.min(this.messagelists.length, 3); i++){temp.push(this.messagelists[this.messagelists.length-i])} 
                this.loadMessages(temp)
            }
        }
    },
    removeRoom: function(id){
        if(id in this.roomlist) delete this.roomlist[id];
    }

}

const messages = {
    msgQ: [],
    createMsg: function(routingType, routingId, content, sender){
        this.msgQ.push({
            routing: {type: routingType, Id: routingId},
            message:{
                content: content,
                sender: sender,
                timesent: time
            }
        })
    },
    sendMsg: function(){

    }
}
