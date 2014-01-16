/*
* API initialization.
* You have to change 2 parameters here.
*/
var hasPublishPermission;
var sig;
var currentUserId;
var feedPostingObject = {};
var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          /*
          * First parameter:
          * this function will be called
          * if initialization would finish successfully
          */
          function() {
              initCard();
              currentUserId = FAPI.Util.getRequestParameters()["logged_user_id"];
          },
          /*
          * Second parameter:
          * this function will be called
          * if initialization would finish with error.
          */
          function(error) {
              processError(error);
          }
);
/*
* End initialization.
*/

/*
* This function will be called as a callback for these methods:
* showPermissions, showInvite, showNotification, showPayment, showConfirmation, setWindowSize
*/
function API_callback(method, result, data) {
    alert("Method "+method+" finished with result "+result+", "+data);
     if (method == "showConfirmation" && result == "ok") { 
         FAPI.Client.call(feedPostingObject, function(status, data, error) {
            console.log(status + "   " + data + " " + error["error_msg"]);
        }, data);
    }
}

/*
* This function will be called if initialization would fail.
*/
function processError(e) {
    console.log(e);
    alert("I'm so sorrry, but there's an error :(");
}

/*
* This function will be called after success initialization.
* Here you can see some examples of using of "FAPI.Client.call()" method.
*/
function initCard(){
    // at the beginning we prepare callback functions
    var callback_users_getCurrentUser = function(method,result,data) {
        if (result) {
            fillCard(result);
        } else {
            processError(data);
        }
    };
    
    var callback_friends_get = function(method,result,data){
        if(result){
            var randomFriendId = result[getRandomInt(0,result.length)];
            var callback_users_getInfo = function(method,result,data){
                if (result){
                    document.getElementById("random_friend_name_surname").innerHTML = result[0]["first_name"] + " " + result[0]["last_name"];
                }else{
                    processError(data);
                }
            }
            FAPI.Client.call({"method":"users.getInfo", "fields":"first_name,last_name", "uids":randomFriendId}, callback_users_getInfo); 
        }else{
            processError(data);
        }
    }
    
    // and then we call the method:
    
    // first example: we need to call method with parameters
    // parameters' sequence is unimportant!
    FAPI.Client.call({"fields":"first_name,last_name,location,pic128x128","method":"users.getCurrentUser"}, callback_users_getCurrentUser);
    // second example: we need to call method without parameters
    FAPI.Client.call({"method":"friends.get"}, callback_friends_get);    
}

/*
* An example of making a publication.
*/
function publish(){
    var description_utf8 = "Can I publish?";
    var caption_utf8 = "Published text";
    // preparing parameters
    feedPostingObject = {method: 'stream.publish',
                        message: description_utf8,
                     attachment: JSON.stringify({'caption': caption_utf8}),
                   action_links: '[]'
                        };
    // counting signature
    sig = FAPI.Client.calcSignature(feedPostingObject);
    // showing confirmation
    FAPI.UI.showConfirmation('stream.publish', description_utf8, sig);
}

function fillCard(userInfo){
    document.getElementById("name").innerHTML = userInfo["first_name"];
    document.getElementById("surname").innerHTML = userInfo["last_name"];
    document.getElementById("city").innerHTML = userInfo["location"]["city"];
    document.getElementById("userPhoto").src = userInfo["pic128x128"];
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}