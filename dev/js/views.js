/**
 * Created by Philippe Simpson on 02-04-14.
 */
// Views:
var PlayerView = Backbone.Marionette.ItemView.extend({
    tagName: 'a',
    template: "#player-row-template",
    actionsCollection: null,
    initialize: function(){
        this.actionsCollection = this.model.get('actionsCollection');
        this.listenTo(this.actionsCollection, "add", this.actionAdded);
    },
    actionAdded: function(model, value){
        // update player total points:
        var currentSum = this.model.get('points');
        currentSum = currentSum + model.get('total_points')
        this.model.set('points', currentSum);

        this.render();
    }
});
var MatchNoticeView = Backbone.Marionette.ItemView.extend({
    tagName: 'a',
    className: "match-notice",
    template: "#match-notice-template",
    events: {
        "click": "setTime"
    },
    setTime: function(){
        simTime = this.model.get('played_on');
    }
});
var ActionNoticeView = Backbone.Marionette.ItemView.extend({
    template: "#action-notice-template",
    className: "latest",
    onRender: function(){
        var actionClass = this.model.get('action_name').replace(/ /g, "-"); // convert action name to corresponding class name
        this.$('.match-icon').addClass(actionClass);
    }
});
var ActionsDetailView = Backbone.Marionette.ItemView.extend({
    template: "#actions-detail-template",
    className: "actions-detail",
    initialize: function(){
        this.listenTo(this.collection, "add", this.actionAdded);
        this.listenTo(App, "ticked", this.updateMatchDuration);
    },
    actionAdded: function(model, value){
        this.render();
    },
    updateMatchDuration: function(){
        var matchduration = Math.floor((simTime - this.model.get('played_on')) / 60000);
        var txt = "";
        if(matchduration < 91){
            if(matchduration < 46){
                txt = " (First half: " + matchduration + " min)";
            } else {
                txt = " (Second half: " + (matchduration -45) + " min)";
            }
            this.$('.duration').html(txt);
        } else {
            this.$('.duration').html("  (Match over)");
        }
    },
    onDomRefresh: function(){
        // create and draw player performance graph based on gained points per minute:
        var w = this.$el.width(); // container width

        App.createGraph("graph-container-firsthalf", w, 1, 45, this.collection); // first half
        App.createGraph("graph-container-secondhalf", w, 46, 90, this.collection); // second half
    }
});

// Regions and layout:
var PlayerLayout = Backbone.Marionette.Layout.extend({
    template: "#player-layout",
    className: "player-container",
    regions: {
        head: "#head",
        latest: "#latest"/*,
         detail: "#detail"*/
    },
    events: {
        "click #head": "showDetail"
    },
    actionsCollection: null,
    initialize: function(){
        this.actionsCollection = this.model.get('actionsCollection');
        this.listenTo(this.actionsCollection, "add", this.actionAdded);
        this.listenTo(App, "detail:close", this.closeDetail);
    },
    showDetail: function(){
        App.trigger('detail:show');
        this.addRegion("detail", "#detail");
        this.detail.show(new ActionsDetailView({
            model: this.model.get('match'),
            collection: this.model.get('actionsCollection')
        }));
    },
    closeDetail: function(){
        if(this.detail){
            this.removeRegion("detail", "#detail");
        }

    },
    actionAdded: function(){
        // match in progress, player made an action
        this.latest.show(new ActionNoticeView({
            model: this.actionsCollection.at(this.actionsCollection.length - 1)
        }));
    },
    onShow: function(){
        this.head.show(new PlayerView({
            model: this.model
        }));

        // upcoming match
        this.latest.show(new MatchNoticeView({
            model: this.model.get('match')
        }));
    }
});

var teamView = new Backbone.Marionette.CompositeView({
    template: "#team-overview-template",
    itemView: PlayerLayout,
    itemViewContainer: ".rows",
    collection: teamCollection
}); // singleton

var appContainer = new Backbone.Marionette.Region({
    el: "#wrapper"
});
var AppLayout = Backbone.Marionette.Layout.extend({
    template: "#app-layout",

    regions: {
        clock: "#clock",
        team: "#team"
    }
});
var layout = new AppLayout();
layout.render();
appContainer.show(layout);

layout.team.show(teamView); // Show the player views in the "team" region