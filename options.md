#Options
The following options are supported:

##eventLabel

This is the ```label``` sent to GA. If you don't know what it is please check [GA's doc](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide).

**default:** source of the video path so if the path is ```http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest(format=mpd-time-csf)``` the label would be ```amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest```

##debug
If set to false, console logs will be omitted
**default:** ```false```

##eventsToTrack

The events you want to track. Most of this events are videojs events. Some of them might reflects my needs.
I'm open to add some more if you care to provide a good use case or a pull request.
**default:** every events
  ```['playerConfig', 'loaded', 'playTime', 'percentsPlayed', 'start', 'end', 'play', 'pause', 'error', 'buffering', 'fullscreen', 'seek', 'bitrate']```
Here are some more details about events:

####```playerConfig```

sends configuration details regarding:

- ```AmpVersion```: what version is of AMP is being used
- ```PlaybackTech```: AzureHtml5JS, FlashSS, SilverlightSS, Html5 is selected
- ```MimeType```: DASH, Smooth, HLS, MP4 is selected
- ```isLive```: stream is VOD or Live
- ```Protection```: Unencrypted, AES, PlayReady, Widevine
	- **Note**: Exposing Widevine details is still being worked out

####```loaded```
sends an event whenever the player is loaded on every ```loadedmetadata``` event from the player. Note, just because the player is loaded, does not mean a view took place

####```playTime```
sends an event when the page is closed or if the stream is switched regarding cumulative amount that the video was watched.  So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, the ```playTimeMins``` sent would be 4 mins and ```playTimeSecs``` would be 240 seconds.  
####```percentsPlayed```
will send an event every X percents. X being defined by the option ```percentsPlayedInterval```. This is tracked by two categories:

- ```PercentsPlayed```:sends and event every X percent to show a cumulative viewing percentage. So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, events would fire (assuming default X=20), 0%, 20%, 40%, 60%.
- ```PartsPlayed```: sends and event every X percent to show the parts that were viewed. So if a viewer watched 2 mins in the beginning of a 5 minute video, then 1 min towards the end and rewatched 1 minute of the beginning, events would fire (assuming default X=20), 0-20%, 20-40%, 80-100%, 0-20%.
####```start```
sends when a player actually starts playing. Time to load the player in milliseconds is sent through the value
####```end```
sends an event that the end of the video was reached
####```play```
sends an event on each play action from the player
####```pause```
sends an event on each pause action from the player
####```error```
sends an error event and an error beacon with error code details 
####```buffering```
sends an event when buffering occurs with the value of the time spend buffering
####```fullscreen```
sends event when entering and exiting fullscreen
####```seek```
sends an event on each seek action from the player
####```bitrate```
sends several beacons when APIs are available. Sends ```DownloadBitrate``` and ```DownloadBitrateMbps``` for every downloaded chunk. On exit or a source change, the following beacons are sent if available:

-  ```AverageBitrate```: sends the average downloaded bitrate over the course of viewing the content
-  ```AveragePerceivedBandwidth```: sends the average perceived bandwidth over the course of viewing the content
-  ```AverageMeasuredBandwidth```: sends the average measured bandwidth over the course of viewing the content

##percentsPlayedInterval

This options goes with the ```percentsPlayed``` event. Every ```percentsPlayedInterval``` percents an event will be sent to GA.
**default:** 20