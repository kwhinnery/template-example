var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var jade = require('jade');
var browserify = require('browserify');

// Data for steps in a tutorial
var tutorialData = [
    {   
        title: 'Intro', 
        content: '<h2>This is an intro</h2><p>in the beginning...</p>' 
    },
    {   
        title: 'Middle', 
        content: '<h2>This is the middle</h2><p>...there was JavaScript...</p>' 
    },
    {   
        title: 'End', 
        content: '<h2>This is the end</h2><p>...and it was good.</p>' 
    }
];

// Server side route definitions
module.exports = function(app) {

    // Naked URL automatically renders the first step
    app.get('/tutorial', function(request, response) {
        if (request.get('Accept').indexOf('application/json') > -1) {
            response.send(tutorialData);
        } else {
            response.render('tutorial', _.extend({
                nextLink: '/tutorial/1'
            }, tutorialData[0]));
        }
    });

    // Render any individual step of the tutorial
    app.get('/tutorial/:stepIndex', function(request, response) {
        var context = {};
        var step = Number(request.params.stepIndex);
        if (step < tutorialData.length - 1) {
            context.nextLink = '/tutorial/' + (step+1);
        }
        if (step > 0) {
            context.previousLink = '/tutorial/' + (step-1);
        }
        response.render('tutorial', _.extend(context, tutorialData[step]));
    });

    // Return a browserified bundle for the client
    app.get('/browser.js', function(request, response) {
        // Precompile Jade templates
        var script = 'window.tpls={};\n';
        var tplPath = path.join(__dirname, 'views');
        fs.readdirSync(tplPath).forEach(function(fileName) {

            // Only include partial templates
            if (fileName.indexOf('_') === 0) {
                var fullPath = path.join(tplPath, fileName);
                var jadeSrc = fs.readFileSync(fullPath, 'utf-8');
                script += 'window.tpls.' + path.basename(fileName, '.jade') 
                    + '=' + jade.compileClient(jadeSrc) + ';\n';
            }

        });

        // Create browserified bundle and append it to the script
        var b = browserify('./browser');
        b.bundle(function(err, source) {
            if (err) {
                response.status(500).send(err);
            } else {
                response.type('application/javascript');
                response.send(script += source);
            }
        });
    });
};