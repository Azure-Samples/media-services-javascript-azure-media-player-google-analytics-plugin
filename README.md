---
services: media-services
platforms: javascript
author: rajputam
---

# Media Services: Google Analytics Plugin for Azure Media Player

Google Analytics plugin for Azure Media Player

##Google Analytics Dashboard
The following dashboards are created for your convenience, however you are more than welcome to create your own dashboard inside of Google Analytics.  To use the provided dashboards, simply click on the URLs below, and when prompted, attach the correct data set associated with the data that is being collected in Azure Media Player.  

- [Azure Media Player - Summary](https://www.google.com/analytics/web/template?uid=Xg_X9O4OTJW4AL5_SVZKAw)
- [Azure Media Player - Demographics and Usage](https://www.google.com/analytics/web/template?uid=HyIN_vt_Tq-JOu7JodSYgg)
- [Azure Media Player - QoS](https://www.google.com/analytics/web/template?uid=yth9Z2iGQgqj6PrR6esQsQ)

![Dashboard Sample](https://github.com/Azure-Samples/media-services-javascript-azure-media-player-google-analytics-plugin/raw/master/sample-google-analytics-dashboard.png)

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
<video id="azuremediaplayer" class="azuremediaplayer amp-default-skin amp-big-play-centered" data-setup='{"nativeControlsForTouch": false}' tabindex="0"> </video>
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
            'debug': false
        }
    }
};
var myPlayer = amp("azuremediaplayer", myOptions);
myPlayer.src([{ src: "//amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest", type: "application/vnd.ms-sstr+xml" }, ]);
```

OR

```html
<video id="azuremediaplayer" class="azuremediaplayer amp-default-skin amp-big-play-centered" controls autoplay width="640" height="400" poster="" data-setup='{"nativeControlsForTouch": false, "plugins": {"ga":{ "eventsToTrack": ["playerConfig", "loaded", "playTime", "percentsPlayed", "start", "end", "play", "pause", "error", "buffering", "fullscreen", "seek", "bitrate"], "debug": false}}}' tabindex="0">
    <source src="http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest" type="application/vnd.ms-sstr+xml" />
    <p class="amp-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
</video>
video>
```

The plugin will take in priority options provided in the javascript, followed by the ones provided in html and finally the defaults.

##Options
Check out the supported [options](https://github.com/Azure-Samples/media-services-javascript-azure-media-player-google-analytics-plugin/blob/master/options.md)

## More information

This plugin supports the ga.js and the newer analytics.js Google Analytics libraries. It autodetects the library you use.

## TODO

- [ ] Issue reported with average load time
- [ ] Track disposal of video element
- [ ] Tracking Widevine protection info