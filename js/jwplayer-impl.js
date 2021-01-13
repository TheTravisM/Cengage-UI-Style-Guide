
  var protocol = location.protocol;
  var domains = ["cengage.com/search/", "cengage.com/search-authoring/", "cengage.com/sandbox/"];
  var app = false;
  var env;
  for(i = 0; i < domains.length; i++){
    if(window.location.href.indexOf(domains[i]) > -1){
      app = true;
    }
  }
  if (window.location.hostname.toUpperCase().indexOf("S-") != -1 || (window.location.hostname.toUpperCase().indexOf("D-") != -1 && !app))
    env = "s-";
  else if((window.location.hostname.toUpperCase().indexOf("D-") != -1 || window.location.hostname.toUpperCase().indexOf("L-") != -1) && app)
    env = "d-";
  else
    env = "";

if(typeof jwplayer != "function"){
  var fileref = document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", location.protocol + "//" + env + "cdn.cengage.com/js/jwplayer/6.11/jwplayer.js");
  document.getElementsByTagName("head")[0].appendChild(fileref);
}
(function ($) {
  $.fn.extend({
    player: function (options) { 
      var defaults = {
        container: this,
        xml: null,
        json: null,
        width: '100%',
        height: 'auto',
        key: null,
        stream: null,
        single: false,
        details: true,
        columns: 4,
        loop: false,
        autostart: false,
        //download: false,
        downloadLink: null,
        downloadDesc: null,
        callback:function(){}
      };
      var opts = $.extend(defaults, options); 
      return this.each(function () {
        var o = $.meta ? $.extend({}, opts, $this.data()) : opts; 
        //Globals
        var playlist = new Array();
        var container = o.container;
        var tabs = false;
        var playerSetup = false;
        var display = "";
        var playerId = $(container).attr("player");
        var firstActive = true;
        var currentIndex = 0;
        var loadCount = 0;
        var count = 0;
        
        $(container).append(
          '<a class="player-container" href="#">' +
            '<div id="' + $(container).attr("player") + '"></div>' +
          '</a>'
        );
        if(o.xml != null)
        {
          $.get(o.xml, function (xml) {
            if($("title", xml).length >= 1 && o.details){
              $(container).append('<h2></h2>');
            }
            if($("desc", xml).length >= 1 && o.details){
              $(container).append('<p class="vidDesc"></p>'); 
            }
            if($("video", xml).length == 1 || o.single)
            {
              display = 'style="display:none"';
            }
            $('tab', xml).each(function (i) {
              tab = $(this);
              if($('tab', xml).length > 1 && !o.single)
              {
                if(i == 0 && $("video", xml).length > 1)
                {
                  tabs = true;
                  $(container).append('<ul class="nav"></ul>');
                }
                $(".nav", container).append('<li><a href="#tab' + i + '">' + tab.attr("title") + '</a></li>');
              }
              $(container).append('<ul id="tab' + i +'" ' + display + ' class="tabPanel"></ul>');
              $("video", this).each(function (j) {
                var $this = this;
                var sources = new Array();
                var details = {};
                var captions = new Array();
                var rtmp;
                var youtube;
                var output = "";
                if($("mp4", this).length > 0)
                {
                  var mp4 = $("mp4", this).text();
                  if(o.stream == true && mp4.indexOf("wowzahttp.cengage.com") >-1)
                  {
                    rtmp = getRtmp(mp4);
                  }
                  else if(o.stream != null && o.stream != false && typeof o.stream != 'boolean')
                  {
                    rtmp = o.stream;
                  }
                  if(rtmp != undefined && $("youtube", this).length == 0)
                  {
                    sources.push({file:rtmp});
                  }
                  if(mp4 != undefined)
                  {
                    sources.push({file:mp4});
                  }
                }
                if($("webm", this).length > 0)
                {
                  sources.push({file: $("webm", this).text()});
                }
                if($("youtube", this).length > 0)
                {
                  sources.push({file: $("youtube", this).text()});
                }
                if($("vtt", this).length > 0)
                {
                  captions.push({file:$("vtt",this).text(), kind:"chapters", label:"english", state:true});
                }
                if($("srt", this).length > 0)
                {
                  captions.push({file:$("srt",this).text(), label:"english", state:true});
                }
                if($("txt", this).length > 0)
                {
                  details["transcript"] = $("txt", this).text();
                }
                output += '<a href="#">';
                if($("img", this).length > 0)
                {
                  details["image"] = $("img", this).text();
                  output += '<img src="' + $("img", this).text() + '" alt="' + (($("alt", this).text() != '') ? $("alt", this).text() : $("title", this).text() + ' video') + '" title="' + $("title", this).text() + '" width="140px" height="79px" border="0">';
                }
                else if($("youtube", this).length > 0)
                {
                  details["image"] = getYoutubeImage($("youtube", this).text());
                  output += '<img src="' + getYoutubeImage($("youtube", this).text()) + '" alt="' + (($("alt", this).text() != '') ? $("alt", this).text() : $("title", this).text() + ' video') + '" title="' + $("title", this).text() + '" width="140px" height="79px" border="0">';
                }
                else
                {
                  details["image"] = "//cdn.cengage.com/images/jwplayer/no_video_image.jpg";
                  output += '<img title="No image avilable" src="//cdn.cengage.com/images/jwplayer/no_video_image.jpg" alt="' + (($("title", this).text() != '') ? $("title", this).text() + ' video' : null) + '" width="140px" height="79px" border="0">';
                }
                if($("alt", this).length > 0){
                  details["alt"] = $("alt", this).text();
                }
                if($("title", this).length > 0 && o.details)
                {
                  details['videoTitle'] = $("title", this).text();
                  output += '<h3 title="' + $("title", this).text() + '">' + $("title", this).text() + '</h3>';
                }
                output += '</a>';
                if($("desc", this).length > 0 && o.details)
                {
                  var html;
                  if (isIE () && isIE () <= 9) {
                    html = $($this).find('desc').text();
                  }else{
                    html = $('<div>').append($($this).find('desc')).html()
                  }
                  details["description"] = ((isIE () && isIE () <= 9) ? html : $(html).html());
                  output += '<p style="display:none" class="desc">' + ((isIE () && isIE () <= 9) ? html : $(html).html()) + "</p>";
                }
                if($("time", this).length > 0)
                {
                  details["time"] = $("time", this).text();
                  output += '<p title="Length of video">' + $("time", this).text() + '</p>';
                }
                if(o.downloadLink){
                  output += '<a href="' + $("mp4", this).text() + '" class="download-link">';
                  output +=   '<span>' + o.downloadLink + '</span>';
                  if(o.downloadDesc != null){
                    output += '<p>' + o.downloadDesc + '</p>';
                  }
                  output += "</a>";
                }

                $("#tab" + i, container).append(
                  '<li class="jwplayer-video-thumbnail ' + (j == 0 ? "active-video-state" : "") + '" >' +
                    output +
                  '</li>'
                );
                details["sources"] = sources;
                details["tracks"] = captions;
                playlist.push(details);
              });
            });
            if(tabs)
            {
              $(container).tabs();
            }
            if(typeof jwplayer == "function"){
              setup();
            }else {
              var interval = setInterval(function(){
                if(typeof jwplayer == "function"){
                  clearInterval(interval);
                  setup();
                }
              }, 500);
            }
          }, "xml").fail(function(){
            alert("Error occured when loading XML file");
          });
        }
        else if(o.json != null)
        {
          var sources = new Array();
          var details = {};
          var captions = new Array();
          var rtmp;
          var youtube;
          var output = "";
          $(container).append('<ul id="tab0" class="tabPanel" style="display:none"></ul>');
          if(o.json.mp4 != undefined)
          {
            var mp4 = o.json.mp4;
            if(o.stream == true && mp4.indexOf("wowzahttp.cengage.com") > -1)
            {
              rtmp = getRtmp(mp4);
            }
            else if(o.stream != null && o.stream != false && typeof o.stream != 'boolean')
            {
              rtmp = o.stream;
            }
            if(rtmp != undefined && $("youtube", this).length == 0)
            {
              sources.push({file:rtmp});
            }
            if(mp4 != undefined)
            {
              sources.push({file:mp4});
            }
            sources.push({file: mp4});
          }
          if(o.json.webm != undefined)
          {
            sources.push({file: o.json.webm});
          }
          if(o.json.youtube != undefined)
          {
            sources.push({file: o.json.youtube});
          }
          if(o.json.vtt != undefined)
          {
            captions.push({file: o.json.vtt, kind:"chapters", label:"english", state:true});
          }
          if(o.json.srt != undefined)
          {
            captions.push({file: o.json.srt, label:"english", state:true});
          }
          if(o.json.txt != undefined)
          {
            details["transcript"] = o.json.txt;
          }
          output += '<a href="#">';
          if(o.json.img != undefined)
          {
            details["image"] = o.json.img;
            output += '<img title="Image of video" src="' + o.json.img + '" alt="' + o.json.alt + '" width="140px" height="79px" border="0">';
          }
          else if(o.json.youtube != undefined)
          {
            details["image"] = getYoutubeImage(o.json.youtube);
            output += '<img title="Image of video" src="' + getYoutubeImage(o.json.youtube) + '" alt="' + o.json.alt + '" width="140px" height="79px" border="0">';
          }
          else
          {
            details["image"] = "//cdn.cengage.com/images/jwplayer/no_video_image.jpg";
            output += '<img title="Image of video" src="//cdn.cengage.com/images/jwplayer/no_video_image.jpg"  width="140px" height="79px" border="0">';
          }
          if(o.json.alt != undefined){
            details["alt"] = o.json.alt;
          }
          if(o.json.title != undefined && o.details)
          {
            details['videoTitle'] = o.json.title;
            $(container).append('<h2></h2>');
            output += '<h3 title="' + o.json.title + '">' + o.json.title + '</h3>';
          }
          output += '</a>';
          if(o.json.desc != undefined  && o.details)
          {
            details["description"] = o.json.desc;
            $(container).append('<p class="vidDesc"></p>'); 
            output += '<p style="display:none" class="desc">' + o.json.desc + "</p>";
          } 

          $(".tabPanel", container).append(
            '<li class="jwplayer-video-thumbnail">' +
              output +
            '</li>'
          );

          details["sources"] = sources;
          details["tracks"] = captions;
          playlist.push(details);

          if(typeof jwplayer == "function"){
            setup();
          }else {
            var interval = setInterval(function(){
              if(typeof jwplayer == "function"){
                clearInterval(interval);
                setup();
              }
            }, 500);
          }
        }
      
        //setup the controls and player
        function setup()
        {
          if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            //dynamically chhange thumbnail width and margin based on columns specified
            var margin = ($(container).width() / (o.columns - 1)) * .12;
            var liWidth = ($(container).width() / o.columns) -  margin + margin / o.columns;
            $(".tabPanel", container).css("margin-left", -margin);
            $(".tabPanel li", container).each(function(){
              $(this).css({
                "marginLeft": margin,
                "width": liWidth
              });
              $("img", this).css({
                "width": liWidth,
                "height": 'auto'
              });
            });
          }
          
          $(".jwplayer-video-thumbnail a h3").each(function () {
            if ($(this).text().length > 43) {
              $(this).html($(this).text().substring(0, 40) + "...");
            }
          });
          //setup the player
          setupPlayer(playlist);

          //when playing a video stop all others
          jwplayer(playerId).onPlay(function(){
            $(".video-container").each(function(){
              if($(".player-container", this).length > 0 && $(this).attr("player") != playerId){
                jwplayer($(this).attr("player")).stop();
              }
            });
            changeViaIndex(currentIndex, true);
          });

          //change title when changing videos
          jwplayer(playerId).onPlaylistItem(function(item){
            if(playlist[item.index].videoTitle != undefined)
            {
              $("div[id^=" + playerId + "]").attr("title", playlist[item.index].videoTitle);
            }

            changeViaIndex(item.index, false);

            this.stop();
          });

          //when pressing enter on the player, play the video
          $("a.player-container", container).on("click", function(e){
            e.preventDefault();
            if(navigator.userAgent.indexOf("Firefox") == -1 && navigator.userAgent.indexOf("Safari") == -1){
              jwplayer(playerId).play();
            }
          });

          //change video in playlist to video selected
          $(".jwplayer-video-thumbnail a", o.container).click(function (e) {
            count++;
            firstActive = false;
            $(this).parents("ul[id^=tab]").parent().find(".jwplayer-video-thumbnail").each(function(){
              if($(this).hasClass("active-video-state"))
                $(this).removeClass("active-video-state");
            });
            if(!$(this).parents(".jwplayer-video-thumbnail").hasClass("active-video-state")){
              $(this).parents(".jwplayer-video-thumbnail").addClass("active-video-state");
            }
            var index = $("[player=" + $(this).parents(".video-container").attr("player") + "] .tabPanel a[href='#']").index(this);
            currentIndex = index;
            $(this).parents("ul[id^=tab]").parent().find("h2").html(playlist[index].videoTitle);
            $(this).parents("ul[id^=tab]").parent().find(".vidDesc").html(playlist[index].description);

            jwplayer(playerId).playlistItem(index);

            e.preventDefault();
          });

          //if video title is supplied in hash tag then load that video
          if(location.hash != "")
          {
          	var found = false;
            $(".jwplayer-video-thumbnail", container).each(function(){
              if($("a h3", this).text() != ""){
                if(("#" + $("a h3", this).text().replace(/ /g, "").toUpperCase()).indexOf(location.hash.toUpperCase()) > -1){ 
                  loadCount = 1;
                  var hash = location.hash;
                  $("a", this).click();
                  //$("a", this).focus();
                  found = true;
                  if($("ul[id^=tab]").length > 0)
                  {
                    $("#" + $(this).parents("ul[id^=tab]").attr("id") + "-tab").click();
                    location.hash = hash;
                  }
                }
              }
            });
            if(!found){
              $(container).find("h2").html(playlist[0].videoTitle);
              $(container).find(".vidDesc").html(playlist[0].description);
            }
          }else{
            $(container).find("h2").html(playlist[0].videoTitle);
            $(container).find(".vidDesc").html(playlist[0].description);
          }   
          o.callback();
        }

        //setup this instance of the jwplayer
        function setupPlayer(playlist) {
          if(o.key != null)
          {
            jwplayer.key = o.key;
          }
          var protocol = location.protocol;
          var setup = {};
          setup["id"] = playerId;
          setup["width"] = o.width;
          setup["height"] = o.height;
          setup["repeat"] = o.loop;
          setup["primary"] = 'flash';
          setup["playlist"] = playlist;
          setup["aspectratio"] = '16:9';
          setup["autostart"] = o.autostart;
          setup["skin"] = protocol + "//" + env + "cdn.cengage.com/js/jwplayer/skins/six-default.xml";
          jwplayer(playerId).setup(setup);
        }

        function changeViaIndex(index, pressedPlay){
          //change transcript button on play of video
          if((playlist[index].transcript != undefined && pressedPlay) || (playlist[index].transcript != undefined && !pressedPlay && count > loadCount)){
            jwplayer(playerId).addButton(
              "//" + env + "cdn.cengage.com/images/jwplayer/transcriptIcon.png",
              "Download Transcript",
              function () {
                window.open(playlist[index].transcript);
              },
              "transcript"
            );
          }else{
            jwplayer(playerId).removeButton("transcript");
          }

          //change download button on play of video
          /*if((o.download && pressedPlay) || (o.download != undefined && !pressedPlay && count > loadCount)){
            jwplayer(playerId).addButton(
              "http://ettercap.github.io/ettercap/Download%20_256.png",
              "Download Video",
              function () {
                window.open(playlist[index].sources[2].file);
              },
              "downloadVideo"
            );
          }*/
        }
            
        function getRtmp(val) {
          if(val == undefined){ return null };
          var string = val.split("/");
          var rtmp = "rtmp://wowza.cengage.com:443/"+string[3]+"/mp4:";
          for (i = 4; i < string.length; i++) {
              rtmp += "/" + string[i];
          }
          return rtmp;
        }
        function gup(name, url) { name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); var regexS = "[\\?&]" + name + "=([^&#]*)"; var regex = new RegExp(regexS); var results = regex.exec(url); if (results == null) return ""; else return results[1]; }

        function getYoutubeImage(url) {
          if(url == undefined){ return null };
          var string = gup("v", url);
          var image = "http://img.youtube.com/vi/" + string + "/0.jpg";
          return image;
        }

        function isIE () {
          var myNav = navigator.userAgent.toLowerCase();
          return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        }
      });
    }
  });
})(jQuery);
