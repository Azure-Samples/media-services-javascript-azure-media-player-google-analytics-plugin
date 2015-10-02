---
services: media-services
platforms: javascript
author: rajputam
---

# Azure Media Services: Google Analytics Plugin for Azure Media Player

Google Analytics plugin for Azure Media Player

## Getting Started
Set up Azure Media Player in your web page.  See the AMP [documentation](http://aka.ms/ampdocs) and [samples](http://aka.ms/ampsamples)

In your web page, add the AMP scripts to the head of your page, followed by the amp-ga.js script.  Make sure to add your own Google Analytics tracking code:
```html
<head>
<!--replace "latest" with a version number from http://aka.ms/ampchangelog -->
<script src="//amp.azure.net/libs/amp/latest/azuremediaplayer.min.js"></script>
<link href="//amp.azure.net/libs/amp/latest/skins/amp-default/azuremediaplayer.min.css" rel="stylesheet">
<!--Add the amp-ga plugin script-->
<script src="amp-ga.min.js"></script>
</head>
<body>
<script>
<!--Add Google Analytics Tracking Code-->
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', 'UA-XXXX-Y', 'auto');
    ga('send', 'pageview');
</script>
</body>
```

## Loading the Plugin

You can provide options to the plugin either by passing them in the javascript or in the html.

```javascript
var myOptions = {
    "nativeControlsForTouch": false,
    autoplay: true,
    controls: true,
    width: "640",
    height: "400",
    poster: "",
    plugins: {
        ga: {
            'eventsToTrack': ['playerConfig', 'loaded', 'playTime', 'percentsPlayed', 'start', 'end', 'play', 'pause', 'error', 'buffering', 'fullscreen', 'seek', 'bitrate'],
            'debug': true
        }
    }
};
var myPlayer = amp("azuremediaplayer", myOptions);
myPlayer.src([{ src: "//amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest", type: "application/vnd.ms-sstr+xml" }, ]);
```

OR

```html
<video id="azuremediaplayer" class="azuremediaplayer amp-default-skin amp-big-play-centered" controls autoplay width="640" height="400" poster="" data-setup='{"nativeControlsForTouch": false, "plugins": {"ga":{ "eventsToTrack": ["playerConfig", "loaded", "playTime", "percentsPlayed", "start", "end", "play", "pause", "error", "buffering", "fullscreen", "seek", "bitrate"], "debug": true}}}' tabindex="0">
    <source src="http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest" type="application/vnd.ms-sstr+xml" />
    <p class="amp-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
</video>
video>
```

The plugin will take in priority options provided in the javascript, followed by the ones provided in html and finally the defaults.

##Google Analytics Dashboard
The following Dashboards are created for your convenience, however you are more than welcome to create your own Dashboard inside of Google Analytics.  To use the provided dashboards, simply click on the URLs below, and when prompted, attach the correct data set associated with the data that is being collected in Azure Media Player.  

- [Azure Media Player - Demographics and Usage](https://www.google.com/analytics/web/template?uid=IU1Ptp-LSpmb-OgzGzLViA)
- [Azure Media Player - Audience Engagement](https://www.google.com/analytics/web/template?uid=9lMJFwqnSLaBuCTig16BTQ)

##Options
The following options are supported:

###eventLabel

This is the ```label``` sent to GA. If you don't know what it is please check [GA's doc](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
**default:** source of the video path so if the path is ```http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest(format=mpd-time-csf)``` the label would be ```amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest```

###debug
If set to false, console logs will be omitted
**default:** ```false```

###eventsToTrack

The events you want to track. Most of this events are videojs events. Some of them might reflects my needs.
I'm open to add some more if you care to provide a good use case or a pull request.
**default:** every events
  ```['playerConfig', 'loaded', 'playTime', 'percentsPlayed', 'start', 'end', 'play', 'pause', 'error', 'buffering', 'fullscreen', 'seek', 'bitrate']```
Here are some more details about events:

- ```playerConfig```: sends configuration details regarding:
	- ```AmpVersion```: what version is of AMP is being used
	- ```PlaybackTech```: AzureHtml5JS, FlashSS, SilverlightSS, Html5 is selected
	- ```MimeType```: DASH, Smooth, HLS, MP4 is selected
	- ```isLive```: stream is VOD or Live
	- ```Protection```: Unencrypted, AES, PlayReady, Widevine
		- **Note**: Exposing Widevine details is still being worked out
- ```loaded```: sends an event whenever the player is loaded on every ```loadedmetadata``` event from the player. Note, just because the player is loaded, does not mean a view took place
- ```playTime```: sends an event when the page is closed or if the stream is switched regarding cumulative amount that the video was watched.  So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, the ```playTimeMins``` sent would be 4 mins and ```playTimeSecs``` would be 240 seconds.  
- ```percentsPlayed```: will send an event every X percents. X being defined by the option ```percentsPlayedInterval```. This is tracked by two categories:
	- ```PercentsPlayed```: sends and event every X percent to show a cumulative viewing percentage. So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, events would fire (assuming default X=20), 0%, 20%, 40%, 60%.
	- ```PartsPlayed```: sends and event every X percent to show the parts that were viewed. So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, events would fire (assuming default X=20), 0-20%, 20-40%, 80-100%, 0-20%.
- ```start```: sends when a player actually starts playing. Time to load the player in milliseconds is sent through the value
- ```end```: sends an event that the end of the video was reached
- ```play```: sends an event on each play action from the player
- ```pause```: sends an event on each pause action from the player
- ```error```: sends an error event and an error beacon with error code details 
- ```buffering```: sends an event when buffering occurs with the value of the time spend buffering
- ```fullscreen```: sends event when entering and exiting fullscreen
- ```seek```: sends an event on each seek action from the player
- ```bitrate```: sends several beacons when APIs are available. Sends ```DownloadBitrate``` for every downloaded chunk. On exit or a source change, the following beacons are sent if available:
	-  ```AverageBitrate```: sends the average downloaded bitrate over the course of viewing the content
	-  ```AveragePerceivedBandwidth```: sends the average perceived bandwidth over the course of viewing the content
	-  ```AverageMeasuredBandwidth```: sends the average measured bandwidth over the course of viewing the content

###percentsPlayedInterval

This options goes with the ```percentsPlayed``` event. Every ```percentsPlayedInterval``` percents an event will be sent to GA.
**default:** 20

## More information

This plugin supports the ga.js and the newer analytics.js Google Analytics libraries. It autodetects the library you use.

## TODO

- [ ] Issue reported with average load time
- [ ] Track disposal of video element
- [ ] Tracking Widevine protection info