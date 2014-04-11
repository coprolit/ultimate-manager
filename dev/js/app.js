/**
 * Created by Philippe Simpson on 02-04-14.
 */

var simTime = 1376073710000; // close to when the first match starts
var interval = 10; // milliseconds between each (one second) tick. Controls simulation of real-time progress.

var App = new Backbone.Marionette.Application();
App.on('detail:show', function(){
    this.trigger("detail:close"); // broadcast to all listening: close detail view
});
App.addInitializer(function(options){
    this.setupModels(dataJSON);
    this.tick(); // start simulating real-time progress, while checking for matching action timestamp each second
});
App.tick = function(){
    simTime = simTime + 1000; // increment time: one second
    $('#clock').text(new Date(simTime).toUTCString());

    var actionModels = allActionsCollection.where({timestamp: simTime}); // get actions with timestamp matching current sim time
    for(var i = 0; i < actionModels.length; i++){
        App.addActionToPlayer(actionModels[i].clone());
    }
    App.trigger("ticked");
    setTimeout(App.tick, interval);
};
App.setupModels = function(json) {
    allActionsCollection = new Backbone.Collection(json.actions);

    /* Run through action list, add items to collections if not already registered */
    for(var i = 0; i < json.actions.length; i++){
        var itemJSON = json.actions[i];

        var actionModel = allActionsCollection.at(i);
        var normalizedName = actionModel.get('action_name').replace(/_/g, " "); // 'normalize' action name
        actionModel.set('action_name', normalizedName);

        // Register matches
        var match = itemJSON.match;
        match.played_on_UTC = new Date(match.played_on).toUTCString();
        var matchRegistered = matchesCollection.where({home_squad: match.home_squad, away_squad: match.away_squad});
        if(matchRegistered.length === 0){
            // non-registered match - add it to collection:
            matchesCollection.add(match);
        }

        // Register players of team:
        var playerRegistered = teamCollection.where({name: itemJSON.player_name}); // check if current player has already been added
        if(playerRegistered.length === 0){
            // non-registered player - add him to team:
            var newplayer = {
                name: itemJSON.player_name,
                id: itemJSON.player_id,
                squad: itemJSON.squad_id ? itemJSON.squad_id : itemJSON.squad,
                points: 0,
                lastaction: "",
                match: new Backbone.Model(match), /*itemJSON.match.home_squad + " vs. " + itemJSON.match.away_squad,*/
                actionsCollection: new PlayerActionsCollection()
            };
            teamCollection.add(newplayer);
        }
    }
};
App.addActionToPlayer = function(actionModel){
    // Adds an action model to matching player's action collection
    var player = teamCollection.findWhere({name: actionModel.get('player_name')}); // grab the team member of current action
    var playeractions = player.get('actionsCollection'); // grab reference to player actions collection
    playeractions.add(actionModel); // add action model to actions collection of the performing team member
};
App.createGraph = function(el, width, start, end, collection){
    var r = Raphael(el, width - 50, 260); // Create canvas at #graph-container:
    // extract graph data for each minute:

    var valuesX = []; // minutes
    var valuesY = []; // summed points for each minute

    for(var i = start; i <= end; i++){
        valuesX.push(i); // minute value

        var actionsArray = collection.where({minutes: i});
        var points = 0;
        for(var x = 0; x < actionsArray.length; x++){
            points = points + actionsArray[x].get('total_points');
        }
        valuesY.push(points);
    }

    var lines = r.linechart(50, 60, width-60, 200, valuesX, valuesY,
        {
            nostroke: true,
            axis: "0 0 0 0",
            symbol: "circle",
            smooth: false
        }).hoverColumn(function() {
            // Activate tooltip:
            this.tags = r.set();
            for (var i = 0, ii = this.y.length; i < ii; i++) {
                var text = this.axis + " min";
                if(this.values[i] !== 0){
                    text = text + ": " + this.values[i] + " pts";
                }
                this.tags.push(r.tag(this.x, this.y[i], text, 140, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));
            }
        }, function () {
            this.tags && this.tags.remove();
        }
    );

    lines.symbols.attr({ r: 4 });
}
App.start();