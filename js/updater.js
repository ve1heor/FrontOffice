    //var fs = require('fs');
    var http = require('http');
    const url_check = 'http://localhost:8000/update';

    window.checkForUpdates = function() {
        var curr_version = fs.readFileSync(__dirname + "/version-app", "utf8");
        console.log("Curr. version: " + curr_version);
        $.post(url_check, function( data ) {
          var json = JSON.parse(data);
          var last_version = json.last;
          var last_url = json.source;

          //console.log(data);
          console.log("Last version: " + last_version);
          if(curr_version == last_version){
            return;
          }
          var apply = confirm("New Update Available.\nWould you like to update?");
          if (apply){
            //var update_file_path_new = __dirname + "/resources/app.asar";
            var file = fs.createWriteStream(update_file_path);
            var request = http.get(last_url, function(response) {
              response.pipe(file);
              //fs.rename(update_file_path, update_file_path_new, function(response){
                console.log("Загрузка завершена!");
              //});
              //console.log(response.length);
            });
            /*$.post(last_url, function( data ) {
                console.log("Start download");
                console.log(data);
                //fs.writeFileSync("update.asar", data, "utf8");
                console.log("End download");
            }); */ 
          }
          //console.log(json.source);
          //console.log(JSON.stringify(data));
        });
    }
    //checkForUpdates();