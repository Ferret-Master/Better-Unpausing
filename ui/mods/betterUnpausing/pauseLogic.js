var playerIsHost =  ko.observable(false).extend({ session: 'playerIsHost' });
var playerDisconnected = ko.observable(false);
var disconnectedPlayers = [];
var connectedPlayers = [];
var pauseInfoMessageSent = false;
var hasSentReconnectMessage = false;

handlers.checkForDisconnect = function(){//ran on any chat message
    
    var disconnectedPlayer = false;
    for(var i = 0; i< model.players().length;i++){
        if(model.players()[i].disconnected == true){
            disconnectedPlayer = true;
            lastDcTime = Date.now()/1000;
            if(!_.includes(disconnectedPlayers, model.players()[i].name)){
                disconnectedPlayers.push(model.players()[i].name)
            }
            
            
        }
        else{connectedPlayers.push(i)}
    }
    if(connectedPlayers[0] == model.armyIndex() && disconnectedPlayer == true && pauseInfoMessageSent == false && model.paused() == true){model.send_message("chat_message", {message: "Someone has disconnected, only the host can unpause unless 3 mins have past, 1 minute pause buffer if re-paused"}); pauseInfoMessageSent = true}
    playerDisconnected(disconnectedPlayer)
}

model.menuResumeGame = function(){
    if((playerDisconnected() || disconnectedPlayers.length > 0) && !model.allowedToUnpause()){model.closeMenu();return}
    model.playSim();
    model.closeMenu();
}

handlers["game_paused.resume"] = function(){
    if((playerDisconnected() || disconnectedPlayers.length > 0) && !model.allowedToUnpause()){model.closeMenu();return}
    model.playSim();
}


var lastDcTime = 0;
var lastPauseTime = 0;
var pausedState = false;
ko.computed(function(){
    if(model.paused() !== pausedState){
        pausedState = model.paused();
        lastPauseTime =  (Date.now()/1000)
    }
})

model.allowedToUnpause = function(){//can unpause if you are the host or 3 minutes have past(mod is mainly for quick un-pausers anyway)
    if(playerIsHost()){return true}
    if((Date.now()/1000)-lastDcTime > 180 && (Date.now()/1000)-lastPauseTime > 60){return true}
    return false;
}

handlers.trueReconnect = function(playerName){
    for(var i = 0; i< disconnectedPlayers.length;i++){
        if(disconnectedPlayers[i] == playerName){
          disconnectedPlayers.splice(i,1);
          if(connectedPlayers[0] == model.armyIndex()){model.send_message("chat_message", {message: " "+playerName +" has fully reconnected"})}
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
                model.send_message("chat_message", {message: " "+playerName +" has fully reconnected"})
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