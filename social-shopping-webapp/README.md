README for purchasing-enrichment-tool
==========================

# Installation of Social Shopping

## Installation steps

* Check if npm is already installed at your machine 'npm -version' if so you can skip the next step.
* Install node.js
    * Run `curl https://raw.github.com/creationix/nvm/master/install.sh | sh`
    * Put the `[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh` in your profile (.bashrc, .bash_profile) if it's not already there and do `source .bashrc`
    * Run `nvm install 0.10.23`
    * To set default node version run `nvm alias default 0.10.23`
    * After installation type `node -v` in your terminal to check if everything works :)
* Navigate to `cd path/to/pet/`
* Build the project `mvn clean install` to install npm and bower dependencies


## Run the application

* To start the application inside your IDE, right-click `de.zalando.purchase.pet.PetApplication` and choose Run
    * Add the maven task before lunch under directory `zeos-purchase` with  `-pl pet clean install -Pdev -am`
* Navigate to `cd path/to/pet/`
* Run `grunt serve` for live reloading
* Application URL should be opened as a new tab at your default browser

## Run the unit tests at dev mode
* Navigate to `cd path/to/pet/`
* Run `grunt test:dev` with live reloading
* As soon as some .js or .html file changed the unit tests are executed again.
* Code coverage can be accessible under ``cd path/to/pet/karma-resources/coverage`

## Run the unit tests at ci mode
* Navigate to `cd path/to/pet/`
* Run `grunt test:ci` for running tests once
* Code coverage can be accessible under ``cd path/to/pet/karma-resources/coverage`
