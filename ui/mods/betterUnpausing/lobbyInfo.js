var playerIsHost =  ko.observable(-1).extend({ session: 'playerIsHost' });
playerIsHost(model.isGameCreator())
var playerIsHostUpdater = ko.computed(function(){
    playerIsHost(model.isGameCreator())
})


