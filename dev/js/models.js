/**
 * Created by Philippe Simpson on 02-04-14.
 */

// Models:
var ActionModel = Backbone.Model.extend({
    defaults: {
        "name": "",
        "occurrences": 0,
        "period": "",
        "minutes": 0,
        "total_points": 0
    },
    initialize: function(){
        this.on("invalid", function(model, error){
            console.log("action model init", error);
        });
    }
}); // binds data for an action

// Collections:
var allActionsCollection; // singleton, holds all actions across players
var PlayerActionsCollection = Backbone.Collection.extend({
    model: ActionModel
}); // binds complete set of actions for a player
var matchesCollection = new Backbone.Collection();// singleton, collects all match models
var teamCollection = new Backbone.Collection(); // singleton, collects all player models