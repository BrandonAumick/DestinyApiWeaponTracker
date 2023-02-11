//weaponId is the id of the weapon being searched for and playerName is the name of the player being searched for
function printWeaponKills(playerName, weaponId) {

  /* In order to get the number of all-time kills a player has on a weapon, this function goes through every single activity a
   player as done and logs the number of kills they got with that weapon in each activity, adding that to a total number.
   To get every activity, the function gets the membership info of a player, finds each of their characters, finds every activity
   done by that character, gets the PostGameCarnageReport for each activity, and gets weapon kills from that. */

   /*Due to the high number of API requests being made, some are going to fail, meaning the final number will likely be lower
     than the true number. This can lead to slight or major inaccuracies based on how many fetches fail and which fail.*/
   
  var myHeaders = new Headers();
  myHeaders.append("x-api-key", "b79ca68003714acf8ccf1a0848a37a5b");
  myHeaders.append("Content-Type", "text/plain");

  let requestOptions = { method: "Get", headers: myHeaders};

  //Variable to track the total number of calculated kills on a weapon
  var totalKills = 0;

  //Fetches the Bungie API for players with the chosen name
  fetch("https://www.bungie.net/Platform/User/Search/GlobalName/0/", {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow',
    body: `{\"displayNamePrefix\" : \"${playerName}\"}`
  })
    .then(response => response.json())
    .then(result => {
      //Finds and sets the memberId of the first listed account
      var memberId = result["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipId"];

      //Finds and sets the membershipId of the first listed account
      var memberType = result["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipType"];
      
      //Fetches the Bungie API for the characters of the found memberId(player)
      fetch(`https://bungie.net/Platform/Destiny2/${memberType}/Profile/${memberId}/?components=200`, requestOptions)
        .then(response => response.json())
        .then(result => {

          //forEach loop going through each of the player's characters, which are dictonary entries
          Object.keys(result["Response"]["characters"]["data"]).forEach(function (characterId){

            /*Loops through a page number used for the next fetch. 50 is an approximation for the number of pages, going over is fine,
            but unfortunatley creates more API requests, but going under would be inaccurate*/
            for (var page = 0; page < 50; page++){

              //Fetches activity pages, 250 activities per page, page number based on previous for loop
              fetch(`https://bungie.net/Platform/Destiny2/${memberType}/Account/${memberId}/Character/${characterId}/Stats/Activities/?count=250&mode=7&page=${page}`, requestOptions)
                .then(response => response.json())
                .then(result => {

                  /*forEach loop going through each activity, which are stored as list items.
                    Does nothing if the API returns a page without activites*/
                  result["Response"]["activities"].forEach(function (element) {

                    //Sets the instanceId of the selected activity
                    var instanceId = element["activityDetails"]["instanceId"]

                    //Fetches the PostGameCarnageReport of the activity from its instanceId
                    fetch(`https://bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${instanceId}/`, requestOptions)
                      .then(response => response.json())
                      .then(result => {
                         
                        //forEach loop going through each listed player in an activity
                        result["Response"]["entries"].forEach(function (player) {

                          /*Checks weapons if the player has the same character ID as the one currently being checked for.
                            This prevents it from checking kills from other players in the activity and in cases where the
                            searched player played on multiple characters in the activity it will only log kills for the 
                            currently selected character, it will go back and log the kills for the other character when
                            that one is selected.*/
                          if (player["characterId"] === characterId){

                            //forEach loop going through the list of weapons used by the character in the activity.
                            player["extended"]["weapons"].forEach(function (weapon) {
                              
                              //Checks if each weapon's referenceId is equal to the one being searched for.
                              if (weapon["referenceId"] === weaponId){

                                //Adds weapon kills from the activity to the total.
                                totalKills += weapon["values"]["uniqueWeaponKills"]["basic"]["value"];

                                /*Due to this running asynchronously, I don't know how to get it to print only the final value, so
                                  it prints the total every time it's added to.*/
                                console.log(totalKills);
                              } 
                            })
                          }
                        })
                      })
                      .catch(error => {});
                    
          
                  })
                })
                .catch(error => {});
                }
          })

        })
    })
}


printWeaponKills("Guardian", 46524085)