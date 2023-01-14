var playerIsHost =  ko.observable(-1).extend({ session: 'playerIsHost' });
var playerDisconnected = ko.observable(false);
var disconnectedPlayers = [];
var hasSentReconnectMessage = false;

handlers.checkForDisconnect = function(){
    
    var disconnectedPlayer = false;
    for(var i = 0; i< model.players().length;i++){
        if(model.players()[i].disconnected == true){
            disconnectedPlayer = true;
            disconnectedPlayers.push(model.players()[i].name)
        }
    }
    playerDisconnected(disconnectedPlayer)
}

model.menuResumeGame = function(){
    if((playerDisconnected() || disconnectedPlayers.length > 0) && !playerIsHost()){model.closeMenu();return}
    model.playSim();
    model.closeMenu();
}

handlers["game_paused.resume"] = function(){
    if((playerDisconnected() || disconnectedPlayers.length > 0) && !playerIsHost()){model.closeMenu();return}
    model.playSim();
}

handlers.trueReconnect = function(playerName){
    for(var i = 0; i< disconnectedPlayers.length;i++){
        if(disconnectedPlayers[i] == playerName){
          disconnectedPlayers.splice(i,1);
          model.send_message("chat_message", {message: " "+playerName +" has fully reconnected"})
          if(disconnectedPlayers.length < 1){
             playerDisconnected(false);
          }
        }
    }
}



var loadTimeCounter = 0;
function sendReconnectMessage(){
    if(hasSentReconnectMessage == false){
        model.holodeck.focusedPlanet().then(function(ready){
            console.log(ready)
            if(ready !== null){
                model.send_message("chat_message", {message: "Reconnect:"})
                hasSentReconnectMessage = true;
            }
            else{
                if(loadTimeCounter > 60){hasSentReconnectMessage = true;}
                _.delay(sendReconnectMessage, 1000)
            }
        })
    }
    else{
        return
    }
    loadTimeCounter++
}


sendReconnectMessage();
_.delay(sendReconnectMessage, 2000);