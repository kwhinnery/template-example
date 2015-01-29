var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
window.jade = require('jade/runtime');

// Tell Backbone to use our jQuery
Backbone.$ = $;

// a data store for all tutorial data, fetched via ajax
var tutorialData = [];

// A view model for the current tutorial UI state - we only care about the
// current step we're viewing from a UI state perspective
var StepModel = Backbone.Model.extend({
    defaults: {
        stepIndex: 0
    }
});

// Create Backbone View for the current content of the tutorial
var StepView = Backbone.View.extend({

    // init
    initialize: function() {
        this.model.on('change', this.render, this);
    },

    // The model which backs this view
    model: StepModel,

    // The DOM element to mount to
    el: '#step',

    // The compiled jade template
    template: tpls._content,

    // Called when the model state changes
    render: function() {
        if (tutorialData.length === 0) return;

        var context = {};
        var step = Number(this.model.get('stepIndex'));
        var stepData = tutorialData[step];

        // get links
        if (step < tutorialData.length - 1) {
            context.nextLink = '/tutorial/' + (step+1);
        }
        if (step > 0) {
            context.previousLink = '/tutorial/' + (step-1);
        }

        this.$el.html(this.template(_.extend(context, stepData)));
    }
});

// Create router
var Router = Backbone.Router.extend({
    initialize: function(options) {
        this.model = options.model;
    },

    routes: {
        '': 'home',
        'tutorial/:step': 'doRoute'
    },

    home: function() {
        this.model.set('stepIndex', 0);
    },

    doRoute: function(step) {
        this.model.set('stepIndex', step);
    }
});

// Initialize app
$(document).ready(function() {
    // create and initialize view model
    var model = new StepModel();

    // create view
    var view = new StepView({
        model: model
    });

    // start router
    var router = new Router({
        model: model
    });
    Backbone.history.start({
        pushState: true
    });


    // fetch data to back client-side rendering
    var p = $.ajax('/tutorial', {
        method: 'GET',
        dataType: 'json'
    });

    p.done(function(data) {
        tutorialData = data;
    });

    p.fail(function(err) {
        console.log(err);
    });

    // Intercept link clicks
    $(document).on('click', "a[href^='/']", function(event) {
        event.preventDefault();
        var href = $(event.currentTarget).attr('href');
        router.navigate(href, {
            trigger: true
        });
    });
});
