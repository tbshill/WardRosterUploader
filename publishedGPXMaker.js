    /*V2.1.1 ----START COPYING HERE----------------------------------------------------
    
    
      I apologize to all those who have Tomtom because this code will ONLY WORK FOR GARMIN GPS'S 
    
        Instructions: 
            1. Turn the GPS off (hold down the power button until the GPS asks you if you want to turn it off) and then plug it into the computer.
              1.1 - Sometimes the GPS requires you use an official Garmin USB cord inorder to connect it to the computer. If your GPS is not
                    connecting make sure you are using an offical Garmin Cord.
              1.2 - If your GPS is not connecting and you are on a library computer, try using a Family History Center computer or a members computer.
                    Often  libraries will have special blocks on USB devices to prevent viruses. 
            
            2. Sign into lds.org on Google Chrome - I haven't tested this on other Internet Browsers. If Google Chrome is not available try 
               anything but Internet Explorer.
            
            3. While on LDS.org Press Control+Shift+I - This will open a developer console.
            
            4. Click on the Console Tab - This is where you will put my code so you can run it.
            
            5. Copy and Past all of this code into the console. You can't use Ctrl+A to select everything because it might select text that is not part of the code. 
               First use your mouse to select the code and then use Ctrl+C to copy it and then Ctrl+V to paste it into the console.
            
            6. Press Enter
              6.1 - The program is going to ask you where you are serving. Type in your ward and press enter.
              6.2 - If the computer askes you where to save the file save it to the desktop or the downloads folder.
                    You cannot save the file directly into the GPX folder.
              
            7. Drag downloaded file onto the GPS in the GPX folder.
              7.1 - Open the folder the file was downloaded into. This will usually be the Downloads folder
              7.2 - Open the GPX folder by clicking on the Start Button and going to "Computer". You should notice your GPS their as "NUVI" or something
                    similar to that. Open it and then open the "Internal Storage folder". Then you should see the GPX folder.
              7.3 - Drag the downloaded gpx file into the GPX folder on the GPS. 
            
            8. Unplug GPS and turn it on.
            
            
            MISSING MENBERS?
            ----------------
            !!! Not all of the contacts will be on the GPS. It will automatically take off PO Boxes and bad addresses. Also, some times a member 
                has asked the church to not have their house public on the Ward Map on LDS.org. If this is the case, then their house will not
                appear on the GPS as well. Please check to see what their address is like on LDS.org and if you can view them on the ward map before 
                emailing me.
                
                
                If you notice people are missing from your GPS that should be there then I have to look behind the scenes to see why they are missing.
                To do this, please change line 81 from:
                
                  var DOWNLOAD_ERRORS = false;
              
                To:
              
                  var DOWNLOAD_ERRORS = true;
                
                This will generate an error report that will be downloaded the next time you run the code. Follow instructions 3-6 to get the report 
                and email me both the GPX file and the Error report. I will try to figure out what happened.
                
            
            Do Not Contacts
            ----------------
            I have seen in many wards the roster includes some sort of mark indicating that the person is Do Not Contact. If there is a 
            "Do Not Contact" marked on the roster, then it will be automatically catorgorized into a 'DNC' category on your GPS. 
            
            
            Versioning Information
            ---------------------------
            Yall dont have to worry about this. It helps me know what I still need to do and what is already finished.
            
            
            Version 2.1: - outDated
            - Asks the user to type in their area and automatically renames the gpx files and categories on the GPS
            
            Version 2.1.1 - published
            - Better instructions
            
            Version 2.2: - unpublished
            -Todo BetterErrorReports
            
    */
  
    function GPXMAKER() {
      var DOWNLOAD_ERRORS = false; // CHANGE THIS LINE IF THERE ARE ERRORS
      
      function GET(url,callback){
        var xmlRequest = new window.XMLHttpRequest();
        xmlRequest.onloadend = function(res){
          var r = res.target.response;
          var j = JSON.parse(r);
          callback(j);
        };
        xmlRequest.open("GET",url);
        xmlRequest.send();
      }
      
      function download(data, filename, type) {
        var a = document.createElement("a"),
            file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }
      function GPX(){
          var jwpt = [];
          var errors = [];
          var ret =  {};
          
          function addError(name, errorType, data){
            var newError = {
              name: name || "",
              errorType: errorType || "",
              data:data || "",
              id: errors.length
            };
            
            errors.push(newError);
          }
          
          function stateInitials(state){
              switch(state){
                  case("North Carolina"):
                      return "NC";
                  case("Virginia"):
                      return "VA";
                  default:
                      addError("--","StateInitials",state);
                      return state;
              }
          }
          
          function formatPhoneNumber(phone){
              var reg = /[\W\s\-\D]/;
              var format,area,o,a,b,c;
              //console.groupCollapsed("Phone:"+phone);
              
              while(phone.search(reg) != -1){
                  phone = phone.replace(reg,"");
              }
              
              format = phone;
              if(phone.length == 10){ // 252-268-7664
                  area = phone.substring(0,3);
                  b = phone.substring(3,6);
                  c = phone.substring(6);
                  
                  format = "("+area+")"+b+"-"+c;
                  //console.log("10:",format);
              }
              if(phone.length == 11){ // 1-800-999-1234
                  o = phone.substring(1);
              }
              if(phone.length == 7){ // 268-7664
                  b = phone.substring(0,3);
                  c = phone.substring(3);
                  format = b+"-"+c;
                  //console.log("7:",format);
                  
              }
              
              console.groupEnd();
              return format;
          }
          function isPOBox(jwpt){
            var poBoxRegex = /p.?o.?\s?b/i;
            return poBoxRegex.test(jwpt.street);
          }
          
          function createGPXCategory(category){
            return "<gpxx:Category>" + category +"</gpxx:Category>";
          }
          function createGPXCategories(categories){
            var categoriesGPX = "<gpxx:Categories>";
        
            for(var c in categories){
                categoriesGPX += "<gpxx:Category>"+categories[c]+"</gpxx:Category>";
            }
            categoriesGPX += "</gpxx:Categories>";
            
            return categoriesGPX;
          }
          function createGPXSymbol(symbol){
            switch(symbol){
                case(1):
                    return "<sym>Parking Area</sym>";
                case(2):
                    return "<sym>Contact, Smiley</sym>";
                case(3):
                    return "<sym>City (Capitol)</sym>";
                case(4):
                    return "<sym>Police Station</sym>";
                case(5):
                    return "<sym>Stadium</sym>";
                case(6):
                    return "<sym>Information</sym>";
                case(7):
                    return "<sym>Medical Facility</sym>";
                case(8):
                    return "<sym>Residence</sym>";
                default:
                    return "";
            }
          }
          function createGPXName(name){
              name = name.replace("&","&amp;");
              return  "<name>"+name+"</name>";
          }
          function createGPXPhone(phoneNumber){
            if(phoneNumber !== null && phoneNumber !== "" && phoneNumber !== undefined){
                return "<gpxx:PhoneNumber>"+formatPhoneNumber(phoneNumber)+"</gpxx:PhoneNumber>";
            }
            else{
                return "";
            }
          }
          function createGPXDescription(street,city,postal){
              return "<desc>"+street+" \n "+city+", NC "+postal+"</desc>";
          }
          function createGPXAddress(streetAddress, city, state,postal){
              var address = "<gpxx:Address>"+
                      "<gpxx:StreetAddress>"+streetAddress+"</gpxx:StreetAddress>"+
                      "<gpxx:City>"+city+"</gpxx:City>"+
                      "<gpxx:State>"+stateInitials(state)+"</gpxx:State>"+
                      "<gpxx:PostalCode>"+postal+"</gpxx:PostalCode>"+
                  "</gpxx:Address>";
              return address;
          }
          function createGPXExtentions(wpt){
              var ext = "<extensions><gpxx:WaypointExtension>";
              ext += createGPXCategories(wpt.categories);
              ext += createGPXAddress(wpt.street,wpt.city,wpt.state,wpt.postal);
              ext += createGPXPhone(wpt.phone);
              ext +=  "</gpxx:WaypointExtension></extensions>";
              return ext;
          }
          function createGPXWpt(wpt){
            
            if(!isPOBox(wpt)){ //TODO: MAKE SURE THIS WORKS
              var nwpt = "<wpt lat=\""+wpt.lat+"\" lon=\""+wpt.lon+"\">"+
                createGPXName(wpt.name)+
                createGPXDescription(wpt.street, wpt.city, wpt.postal)+
                createGPXSymbol(wpt.symbol)+
                createGPXExtentions(wpt)+
                "</wpt>";
              return nwpt;
            }else{
              addError(wpt.name,"PO BOX", JSON.stringify(wpt));
              
              //error.push("PO BOX: "+ wpt.name);
              return "";
            }
          }
          
          ret.addWpt  = function(lon,lat,name,phone,streetAddress,city,state,postal,symbol,categories){
              //check for valid
              if(lon === null || lat === null || streetAddress === null){
                
                  var e = {
                      lon: lon,
                      lat: lat,
                      name: name,
                      phone: phone,
                      streetAddress: streetAddress,
                      city: city,
                      state: state,
                      postal: postal,
                      symbol: symbol,
                      categories: categories,
                  }
                  addError(name,"AddWpt",JSON.stringify(e))
                  return false;
              } else {
                  jwpt.push({
                      lon: lon,
                      lat: lat,
                      street: streetAddress,
                      city: city,
                      state: state,
                      postal: postal,
                      symbol: symbol,
                      categories: categories,
                      name: name,
                      phone:phone
                  });
                  return true;
              }
          };
          ret.getjwpts = function(){
              return jwpt;
          };
          ret.compile = function(){
             var gpxFileArray = ["<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:gpxx=\"http://www.garmin.com/xmlschemas/GpxExtensions/v3\" xmlns:gpxtpx=\"http://www.garmin.com/xmlschemas/TrackPointExtension/v2\" xmlns:trp=\"http://www.garmin.com/xmlschemas/TripExtensions/v1\" creator=\"nüvi 55\" version=\"1.1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v2 http://www.garmin.com/xmlschemas/TrackPointExtensionv2.xsd http://www.garmin.com/xmlschemas/TripExtensions/v1 http://www.garmin.com/xmlschemas/TripExtensionsv1.xsd\"><metadata><link href=\"http://www.garmin.com\"><text>Garmin International</text></link><time>2016-08-22T20:34:36Z</time></metadata>"];
              
              for(var w in jwpt){
                var wpt = createGPXWpt(jwpt[w]);
                if( wpt !== ""){
                  gpxFileArray.push(wpt);
                }
              }
              gpxFileArray.push("</gpx>");
              
              var gpxfile = "";
              for(var a in gpxFileArray){
                gpxfile += gpxFileArray[a];
              }
              
              return gpxfile;
              
          };
          ret.compileErrors = function(){
              var estr = "";
              for(var e in errors){
                var tmp = errors[e];
                var line = tmp.id + "- "+tmp.name+": "+"("+tmp.errorType+")"+ " "+tmp.data+"|\n\r";
                estr += line;
              }
              return estr;
          };
          
          return ret;
      }
      
      function LDS(wardName){
        //"p.o.box 104, 355 Riverlane"
          var dncRegex = /dnc|no\scontact/i;
          var poBoxRegex = /p.?o.?\s?b/i
          var roster = [];
          var error = [];
          var errors = [];
          var ret = {};
          var ward = wardName || "Roster";
          
          var wardName = ward;
          function addError(name, errorType, data){
            var newError = {
              name: name || "",
              errorType: errorType || "",
              data:data || "",
              id: errors.length
            };
            
            errors.push(newError);
          }
          function setWardName(name){
              wardName = name;
          }
      
          function isDNC(house){
            var s = dncRegex.test(house.street);
            var p = dncRegex.test(house.phone);
            
            return s || p
          }
          function isPO(house){
            var s = poBoxRegex.test(house.street)
            return s;
          }
          function isPartMemberFamily(house){
            
          }
          function extractImportantInformation(raw_house){
            try{
              var house = {};
              
              house.phone = raw_house.phone || null;
              house.name = raw_house.name;
              house.street = raw_house.address.street;
              house.state = raw_house.address.state;
              house.zip = raw_house.address.zip;
              house.city = raw_house.address.city;
              house.lat = raw_house.coordinates[0];
              house.lon = raw_house.coordinates[1];
              house.categories = [wardName];
              
              if(isDNC(house)){
                house.categories.push("DNC");
                addError(house.name,"LDS-DNC",JSON.stringify(house));
              }
              if(isPO(house)){
                house.categories.push("PO Box")
                addError(house.name,"LDS-PO",JSON.stringify(house));
              }
              
              
              return house;
            }catch(e){
              addError(raw_house.name,"ExtractImportantInformation *name/address/lat*",JSON.stringify(raw_house));
              //error.push(raw_house);
              return null;
            }
          }
          
          ret.loadRoster = function(raw_roster){
            
            for(var r in raw_roster){
              
              var house = extractImportantInformation(raw_roster[r]);
              if(house !== null){
                roster.push(house);
              }
            }
            
          };
          ret.compile = function(){
            return roster;
          }
          ret.getError = function(){return error};
          ret.compileErrors = function(){
              var estr = "";
              for(var e in errors){
                var tmp = errors[e];
                var line = tmp.id + "- "+tmp.name+": "+"("+tmp.errorType+")"+ " "+tmp.data+"|\n\r ";
                estr += line;
              }
              return estr;
          };
          return ret;
      }
      
      function Missionary(){
          
          var _investigators = [];
          var _formers = [];
          var _potentials = [];
          
          var ret = {};
          ret.getInvestigators = function(){
            return _investigators;
          }
          ret.getFormers = function(){
            return _formers;
          }
          ret.getPotentials = function (){
            return _potentials;
          }
          ret.loadInvestigators = function(investigators){
            for(var i in investigators){
              var inv = investigators[i]
              if(inv.Category == ""){
                inv.Category = [];
              }
              inv.Category.push("Investigators")
              _investigators.push(inv);
            }
          }
          ret.loadFormers = function(formers){
            for(var f in formers){
              var form = formers[f]
              if(form.Category == ""){
                form.Category = [];
              }
              form.Category.push("Formers")
              _formers.push(form);
            }
          };
          ret.loadPotentials = function(potentials){
            for(var p in potentials){
              var pot = potentials[p]
              if(pot.Category == ""){
                pot.Category = [];
              }
              pot.Category.push("Potentials")
              _potentials.push(pot);
            }
          };
          ret.loadAll = function(jsonData){
            var potentials = jsonData.Potentials || [];
            var formers = jsonData.Formers || [];
            var investigators = jsonData.Investigators || [];
            
            this.loadPotentials(potentials);
            this.loadFormers(formers);
            this.loadInvestigators(investigators);
            
          }
          ret.compile = function(){
            var m = _investigators.concat(_formers)
            var t = m.concat(_potentials)
            return t;
          };
          
          return ret;
          
      }
      
      function insertMissionaryContactsIntoGPX(gpx,m_contacts){
        for(var c in m_contacts){
          var temp = m_contacts[c];
          if(temp.Category.includes("Media Refferal")){
            gpx.addWpt(temp.Latitude,temp.Longitude, temp.Name, temp.Phone, temp.Address, temp.City, temp.State, temp.Zip, 0, temp.Category);
          }
          if(temp.Category.includes("Potentials")){
            gpx.addWpt(temp.Latitude,temp.Longitude, temp.Name, temp.Phone, temp.Address, temp.City, temp.State, temp.Zip, 1, temp.Category);
            
          }
          if(temp.Category.includes("Investigator")){
            gpx.addWpt(temp.Latitude,temp.Longitude, temp.Name, temp.Phone, temp.Address, temp.City, temp.State, temp.Zip, 6, temp.Category);
          }
          if(temp.Category.includes("Former")){
            gpx.addWpt(temp.Latitude,temp.Longitude, temp.Name, temp.Phone, temp.Address, temp.City, temp.State, temp.Zip, 0, temp.Category);
          }
        }
      }
      function insertLDSContactsIntoGPX(gpx,l_contacts){
        for(var c in l_contacts){
          var temp = l_contacts[c];
          //console.log(temp);
          if(temp.categories.includes("DNC")){
            gpx.addWpt(temp.lat, temp.lon, temp.name, temp.phone, temp.street, temp.city, temp.state, temp.zip, 4, temp.categories);
          }else if(temp.categories.includes("PO")){
            gpx.addWpt(temp.lat, temp.lon, temp.name, temp.phone, temp.street, temp.city, temp.state, temp.zip, 2, temp.categories); //TODO: get Frowny face number
          }
          else{
            gpx.addWpt(temp.lat, temp.lon, temp.name, temp.phone, temp.street, temp.city, temp.state, temp.zip, 2, temp.categories);
          }
         
        }
      }
    
      //Scripts
      var AREA = prompt("Where are you serving?");
      
      
      var lds = LDS(AREA);
      var gpx = GPX();
      if(AREA != null){
          
          GET("https://www.lds.org/maps/api/user?lang=en",function(res){
            var missionUnitId = res.units[1];
            
            GET("https://www.lds.org/maps/api/households?lang=en&units="+missionUnitId,function(res){
              var rawRoster = res;
              lds.loadRoster(rawRoster);
              
              var l_contacts = lds.compile();
              insertLDSContactsIntoGPX(gpx, l_contacts);
              var gpxFile = gpx.compile();
              
              var gpxErrors = gpx.compileErrors();
              var ldsErrors = lds.compileErrors();
              
              var totalErrors = "GPXErrors: | "+gpxErrors + "| LDSErrors: |"+ldsErrors;
              AREA.replace(" ","");
              download(gpxFile, AREA+".gpx",String);
              
              if(DOWNLOAD_ERRORS){
                download(totalErrors,"errors.csv",String);
              }
              
              //download(gpxErrors,"GPXErrors.csv",String);
              //download(ldsErrors,"LDSErrors.csv",String);
              // console.log(gpxErrors)
            })
          })
        }else{
            console.log("You need to type in your area");
        }
    }
    
    
    
    (GPXMAKER())
    //--END COPYING HERE
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
