//version 1.0

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

if(typeof Vidyard !== "object"){
  var fileref = document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", "//play.vidyard.com/v0/api.js");
  document.getElementsByTagName("head")[0].appendChild(fileref);
}
(function ($) {
  $.fn.extend({
    vidyard: function (options) { 
      var defaults = {
        container: this,
        xml: null,
        json: null,
        single: false,
        details: true,
        columns: 4,
        callback:function(){},
        changeVideo: function(){}
      };
      var opts = $.extend(true, defaults, options); 
      return this.each(function () {
        var o = $.meta ? $.extend({}, opts, $this.data()) : opts; 
        //Globals
        var playlist = new Array();
        var container = o.container;
        var tabs = false;
        var playerSetup = false;
        var display = "";
        var firstActive = true;
        var currentIndex = 0;
        var loadCount = 0;
        var count = 0;
        
        $(container).append(
          '<div class="vidyard-container" ></div>'
        );
        if(o.xml != null)
        {
          $.get(o.xml, function (xml) {
            if($("headline", xml).length >= 1 && o.details){
              $(container).append('<h2></h2>');
            }
            if($("description", xml).length >= 1 && o.details){
              $(container).append('<p class="vidDesc"></p>'); 
            }
            if($("item", xml).length == 1 || o.single)
            {
              display = 'style="display:none"';
            }
            $('tab', xml).each(function (i) {
              tab = $(this);
              if($('tab', xml).length > 1 && !o.single)
              {
                if(i == 0 && $("item", xml).length > 1)
                {
                  tabs = true;
                  $(container).append('<ul class="nav"></ul>');
                }
                $(".nav", container).append('<li><a href="#tab' + i + '">' + tab.attr("title") + '</a></li>');
              }
              $(container).append('<ul id="tab' + i +'" ' + display + ' class="tabPanel"></ul>');
              $("item", this).each(function (j) {
                var $this = this;
                var sources = new Array();
                var details = {};
                var captions = new Array();
                var rtmp;
                var youtube;
                var output = "";
                if($("uuid", this).length > 0) {
                  details["uuid"] = $("uuid", this).text();
                }
                output += '<a href="#' + $(o.container).attr('id') + '">';
                if($("image", this).length > 0)
                {
                  details["image"] = $("image", this).text();
                  output += '<img src="' + $("image", this).text() + '" alt="' + (($("alt", this).text() != '') ? $("alt", this).text() : $("headline", this).text() + ' video') + '" title="' + $("headline", this).text() + '" width="140px" height="79px" border="0">';
                }
                else
                {
                  details["image"] = "//cdn.cengage.com/images/jwplayer/no_video_image.jpg";
                  output += '<img title="No image avilable" src="//cdn.cengage.com/images/jwplayer/no_video_image.jpg" alt="' + (($("headline", this).text() != '') ? $("headline", this).text() + ' video' : null) + '" width="140px" height="79px" border="0">';
                }
                if($("alt", this).length > 0){
                  details["alt"] = $("alt", this).text();
                }
                if($("headline", this).length > 0 && o.details)
                {
                  details['headline'] = $("headline", this).text();
                  output += '<h3 title="' + $("headline", this).text() + '">' + $("headline", this).text() + '</h3>';
                }
                output += '</a>';
                if($("description", this).length > 0 && o.details)
                {
                  var html;
                  if (isIE () && isIE () <= 9) {
                    html = $($this).find('desc').text();
                  }else{
                    html = $('<div>').append($($this).find('description')).html()
                  }
                  details["description"] = ((isIE () && isIE () <= 9) ? html : $(html).html());
                  output += '<p style="display:none" class="desc">' + ((isIE () && isIE () <= 9) ? html : $(html).html()) + "</p>";
                }
                if($("time", this).length > 0)
                {
                  details["time"] = $("time", this).text();
                  output += '<p title="Length of video">' + $("time", this).text() + '</p>';
                }

                $("#tab" + i, container).append(
                  '<li class="vidyard-video-thumbnail ' + (j == 0 ? "active-video-state" : "") + '" >' +
                    output +
                  '</li>'
                );
                playlist.push(details);
              });
            });

            if(tabs)
            {
              $(container).tabs();
            }
            
            if(typeof Vidyard === "object"){
              setup();
            }else {
              var interval = setInterval(function(){
                if(typeof Vidyard === "object"){
                  clearInterval(interval);
                  setup();
                }
              }, 500);
            }
          }, "xml").fail(function(response){
            alert("Error occured when loading XML file");
            console.log(response);
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
          if(o.json.uuid != undefined) {
            details["uuid"] = o.json.uuid;
          }
          output += '<a href="#">';
          if(o.json.image != undefined)
          {
            details["image"] = o.json.image;
            output += '<img title="Image of video" src="' + o.json.image + '" alt="' + o.json.alt + '" width="140px" height="79px" border="0">';
          }
          else
          {
            details["image"] = "//cdn.cengage.com/images/jwplayer/no_video_image.jpg";
            output += '<img title="Image of video" src="//cdn.cengage.com/images/jwplayer/no_video_image.jpg"  width="140px" height="79px" border="0">';
          }
          if(o.json.alt != undefined){
            details["alt"] = o.json.alt;
          }
          if(o.json.headline != undefined && o.details)
          {
            details['headline'] = o.json.headline;
            $(container).append('<h2></h2>');
            output += '<h3 title="' + o.json.headline + '">' + o.json.headline + '</h3>';
          }
          output += '</a>';
          if(o.json.description != undefined  && o.details)
          {
            details["description"] = o.json.description;
            $(container).append('<p class="vidDesc"></p>'); 
            output += '<p style="display:none" class="desc">' + o.json.description + "</p>";
          } 

          $(".tabPanel", container).append(
            '<li class="vidyard-video-thumbnail">' +
              output +
            '</li>'
          );

          playlist.push(details);

          if(typeof Vidyard === "object"){
            setup();
          }else {
            var interval = setInterval(function(){
              if(typeof Vidyard === "object"){
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
          
          $(".vidyard-video-thumbnail a h3").each(function () {
            if ($(this).text().length > 43) {
              $(this).html($(this).text().substring(0, 40) + "...");
            }
          });

          //change video in playlist to video selected
          $(".vidyard-video-thumbnail a", o.container).click(function (e) {
            $(this).parents("ul[id^=tab]").parent().find(".vidyard-video-thumbnail").each(function(){
              if($(this).hasClass("active-video-state"))
                $(this).removeClass("active-video-state");
            });
            if(!$(this).parents(".vidyard-video-thumbnail").hasClass("active-video-state")){
              $(this).parents(".vidyard-video-thumbnail").addClass("active-video-state");
            }
            var index = $(".tabPanel a", o.container).index(this);
            currentIndex = index;
            $(this).parents("ul[id^=tab]").parent().find("h2").html(playlist[index].headline);
            $(this).parents("ul[id^=tab]").parent().find(".vidDesc").html(playlist[index].description);

            if($(".loading-symbol", o.container).length === 0){
              $(o.container).prepend('<span class="loading-symbol">')
            } 
            $("div", o.container).first().hide();
            
            changePlayer($("div", o.container).first(), playlist[index].uuid);

            o.changeVideo(e);
            //e.preventDefault();
          });

          //if video title is supplied in hash tag then load that video
          if(location.hash != "")
          {
          	var found = false;
            $(".vidyard-video-thumbnail", container).each(function(){
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
              $(container).find("h2").html(playlist[0].headline);
              $(container).find(".vidDesc").html(playlist[0].description);
              $(".vidyard-video-thumbnail a", o.container).first().click();
            }
          }else{
            $(container).find("h2").html(playlist[0].headline);
            $(container).find(".vidDesc").html(playlist[0].description);

            $(".vidyard-video-thumbnail a", o.container).first().click();
          }   
        }

        function getEmbedCode(uuid) {
            var script=document.createElement('script');
            script.type='text/javascript';
            script.id='vidyard_embed_code_'+uuid;
            script.src='https://play.vidyard.com/'+uuid+'.js?v=3.1&type=inline';   
            return script;
        }
        function changePlayer(el,uuid) {
            $(el).empty();
            $(el).append(getEmbedCode(uuid));

            var video = new Vidyard.player(uuid);
            video.on("ready", function() {
              $("span.loading-symbol", o.container).remove();
              $(el).show();
              o.callback();
            });
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
