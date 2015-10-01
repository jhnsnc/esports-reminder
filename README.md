# eSports Reminder

This is an app I created to send myself daily reminders about upcoming League of Legends pro/championship matches. It uses [Mandrill](https://mandrillapp.com/) to send emails and the Riot Games [eSports API](http://2015.na.lolesports.com/api/swagger#!/api) to collect data.

Note that the eSports API is note officially supported (and has recently been deprecated...), so this app could break at any time.

There's also some hard-coded references to my email address. I'll need to fix that too if I want to use it.

Generally, this app is not in a particularly usable state, but I wanted to go ahead and upload it to github.

## Running the Project

I need to add steps for running the project. For now, just take a look in the gulpfile.

## Deploying the App

This repo was built to be deployed on [Bluemix](https://console.ng.bluemix.net/) (with environmental variables set for Mandrill authentication). It could easily be modified for deployment on [Heroku](https://www.heroku.com/home) or a similar service.
