Solution for 'Ultimate Manager developer challenge'
================

### Objective

* To develop a small statistical dashboard to be used as a second screen.
* Visualize how many points each player on the team made in the match.
* Visualize the points each player made for each minute of the match.

### The solution

* The application simulates real time progress (at 'fast forward' speed) while displaying actions made by the player team over time.
* Click on a player name for detailed info.
* Mouseover/touch graph items for scored points per minutes.
* Tip: Click on an 'upcoming match' info label to skip forward in time to the starting time of the match.

### Links

* Live: http://philippesimpson.dk/livemanager/

### Technologies

* [SASS](http://sass-lang.com/)
* [jQuery](http://jquery.com/)
* [Backbone.js](http://backbonejs.org/)
* [Marionette.js](http://marionettejs.com/), [docs](https://github.com/marionettejs/backbone.marionette/tree/master/docs)

### App Architecture

The app is event based and is primarily based on Marionette.js features.

`/dev/index.html` contains of the main html markup, templates, loading of data, scripts and css.

* `/dev/js/models.js` Contains general models and collections definitions based on the Backbone.js.
* `/dev/js/views.js` Contains general views definitions based on the Marionette.js.
* `/dev/js/app.js` Contains main app code scoped in Marionette.js Application object.


#### Third Party Libraries

Third party libraries are located in `.../js/vendor/`.

#### Styling

* Global css styles are located in `.../css/`.

