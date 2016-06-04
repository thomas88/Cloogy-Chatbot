const request = require('request');
const config = require('../config');



function sendTextMessage(sender, messageData) {
    const payload = {
        recipient: {id: sender},
        message: messageData,
    };

    console.log(payload);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: config.FB.ACCESS_TOKEN},
        method: 'POST',
        json: payload
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
const carSelection = {
    "attachment":{
        "type":"template",
        "payload":{
            "template_type":"button",
            "text":"What kind of car do you drive?",
            "buttons":[
                {
                    "type":"postback",
                    "title":"Small",
                    "payload":"CAR_SMALL"
                },
                {
                    "type":"postback",
                    "title":"Medium",
                    "payload":"CAR_MEDIUM"
                },
                {
                    "type":"postback",
                    "title":"Large",
                    "payload":"CAR_LARGE"
                }
            ]
        }
    }
};

function startTrivia(sender){
    sendTextMessage(sender, {text:'Hi, let\'s do a trivia quiz.'});
    sendTextMessage(sender, carSelection);
    GLOBAL.phase = 'trivia';
}

function handleTrivia(event, sender) {
  console.log(event);
    if (event.postback) {

        id = event.postback.payload
        if(id.indexOf('CAR_') >= 0 ){
            sendTextMessage(sender, {text: 'Okay cool! And how many kilometers do you drive on a normal day?'});
            GLOBAL.selectedCar = id;
            console.log('Selected car '+id)
            GLOBAL.phase = 'trivia_kms'
        }
    } else if (GLOBAL.phase == 'trivia_kms') {
        var daily = parseFloat(event.message.text);
        console.log('Daily: '+daily);
        var coefs = {'CAR_SMALL': 2.2, 'CAR_MEDIUM': 4.1, 'CAR_LARGE': 5.85}
        sendTextMessage(sender, {text: 'Thanks, so let me think...'})
        var weight = daily / 1000 * 12 * coefs[GLOBAL.selectedCar];
        sendTextMessage(sender, {text: 'That means your car produces ' + weight.toFixed(2)  + ' tons of CO2 per year.'});
        sendTextMessage(sender, {text: 'How many trees do you think are needed to process that?'});
        GLOBAL.correctAnswer = weight * 5;
        GLOBAL.phase = 'trivia_answer1';
    } else if (GLOBAL.phase == 'trivia_answer1') {
        var response = parseFloat(event.message.text);
        if (response > GLOBAL.correctAnswer * 0.9 && response < GLOBAL.correctAnswer * 1.1) {
            sendTextMessage(sender, {text:'That\'s right!'});
        } else {
            if (response > GLOBAL.correctAnswer) {
                sendTextMessage(sender, {text:'Nope it\'s not that much.'});
            } else {
                sendTextMessage(sender, {text:'Nope it\'s even more!'});
            }
        }
        sendTextMessage(sender, {text: 'It\'s ' + GLOBAL.correctAnswer.toFixed(2) + ' trees to be precise.'});
        sendTextMessage(sender, {text: 'TODO.'});
        GLOBAL.phase = 'trivia_answer2';
    } else if (GLOBAL.phase == 'trivia_answer2') {
        var response = event.message.text;

        sendTextMessage(sender, {text: 'Ha ' + response});
        GLOBAL.phase = '';
    }
}

module.exports = {
  startTrivia: startTrivia,
  handleTrivia: handleTrivia
};