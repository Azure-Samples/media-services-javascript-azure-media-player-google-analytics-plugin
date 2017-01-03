/*
* Google Analytics plugin for Azure Media Player - Microsoft Sample Code - Copyright (c) 2015 - Licensed MIT
* Attribution: "AMP-Analytics" - Copyright (c) 2015 Juan Pablo - Licensed MIT
* Attribution: "videojs-ga - v0.4.2" - Copyright (c) 2015 Michael Bensoussan - Licensed MIT
*/

(function () {
    var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    amp.plugin('ga', function (options) {
        var player = this;
        var parsedOptions;
        if (options == null) {
            options = {};
        }
        var dataSetupOptions = {};
        if (this.options()["data-setup"]) {
            parsedOptions = JSON.parse(this.options()["data-setup"]);
            if (parsedOptions.ga) {
                dataSetupOptions = parsedOptions.ga;
            }
        }
        var defaultEventsToTrack = ['playerConfig', 'loaded', 'playTime', 'percentsPlayed', 'start', 'end', 'play', 'pause', 'error', 'buffering', 'fullscreen', 'seek', 'bitrate'];
        var eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultEventsToTrack;
        var trackEvent = {};
        eventsToTrack.forEach(function (value, index, array) {
            trackEvent[value] = true;
        });
        var percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 20;
        var eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
        options.debug = options.debug || false;

        //Initializing tracking variables
        var percentsAlreadyTracked = [];
        var percentPlayed = 0;
        var seeking = false;

        //Loading information for tracking start, load times, unload events
        //loadTime is in milliseconds
        var load = {
            loadTime: 0,
            //incase loadedmetadata doesn't fire
            loadTimeStart: new Date().getTime(),
            firstPlay: false,
            videoElementUsed: false,
            unloaddatasent: false,
            updateLoadTime: function () {
                this.loadTime = Math.abs(new Date().getTime() - this.loadTimeStart);
            },
            send: function () {
                //removing outliers @100s for load
                if (this.loadtime < 100000) {
                    sendEventBeacon('Video', 'start', true, this.loadTime);
                }
            },
            reset: function () {
                this.loadTime = 0;
                this.loadTimeStart = new Date().getTime();
                this.firstPlay = false;
                eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
            }
        }

        //Buffering information for tracking waiting events
        //bufferingTime is in milliseconds
        var buffering = {
            state: false,
            bufferingTime: 0,
            bufferingTimeStart: 0,
            enterBuffering: function () {
                this.bufferingTimeStart = new Date().getTime();
                this.state = true;
            },
            send: function () {
                if (this.state) {
                    this.bufferingTime = Math.abs(new Date().getTime() - this.bufferingTimeStart);
                    if (Math.round(player.currentTime()) !== 0) {
                        sendEventBeacon('Video', 'buffering', true, this.bufferingTime);
                    }
                    this.state = false;
                }
            },
            reset: function () {
                this.bufferingTime = 0;
                this.state = false;
            }
        }

        var download = {
            videoBuffer: null,
            sumBitrate: 0,
            sumPerceivedBandwidth: 0,
            sumMeasuredBandwidth: 0,
            downloadedChunks: 0,
            update: function () {
                if (player.currentDownloadBitrate()) {
                    this.downloadedChunks += 1;
                    this.sumBitrate += player.currentDownloadBitrate();
                    if (this.videoBuffer) {
                        if (player.currentDownloadBitrate() >= 8000000){
                            sendEventBeacon("DownloadBitrateMbps", "8+", false, player.currentDownloadBitrate());
                        }else if (player.currentDownloadBitrate() >= 5000000) {
                            sendEventBeacon("DownloadBitrateMbps", "5-8", false, player.currentDownloadBitrate());
                        } else if (player.currentDownloadBitrate() >= 3000000) {
                            sendEventBeacon("DownloadBitrateMbps", "3-5", false, player.currentDownloadBitrate());
                        } else if (player.currentDownloadBitrate() >= 2000000) {
                            sendEventBeacon("DownloadBitrateMbps", "2-3", false, player.currentDownloadBitrate());
                        } else if (player.currentDownloadBitrate() >= 1000000) {
                            sendEventBeacon("DownloadBitrateMbps", "1-2", false, player.currentDownloadBitrate());
                        } else if (player.currentDownloadBitrate() >= 500000) {
                            sendEventBeacon("DownloadBitrateMbps", "0.5-1", false, player.currentDownloadBitrate());
                        } else if (player.currentDownloadBitrate() >= 0) {
                            sendEventBeacon("DownloadBitrateMbps", "0-0.5", false, player.currentDownloadBitrate());
                        }
                        sendEventBeacon("DownloadBitrate", player.currentDownloadBitrate(), false, player.currentDownloadBitrate());
                        this.sumPerceivedBandwidth += this.videoBuffer.perceivedBandwidth;
                        this.sumMeasuredBandwidth += this.videoBuffer.downloadCompleted.measuredBandwidth;
                    }
                }
            },
            send: function () {
                if (this.downloadedChunks > 0) {
                    sendEventBeacon("Download", "AverageBitrate", false, Math.round(this.sumBitrate / this.downloadedChunks));
                    if (this.videoBuffer) {
                        sendEventBeacon("Download", "AveragePerceivedBandwidth", false, Math.round(this.sumPerceivedBandwidth / this.downloadedChunks));
                        sendEventBeacon("Download", "AverageMeasuredBandwidth", false, Math.round(this.sumMeasuredBandwidth / this.downloadedChunks));
                    }
                }
            },
            reset: function () {
                this.videoBuffer = null;
                this.sumBitrate = 0;
                this.sumPerceivedBandwidth = 0;
                this.sumMeasuredBandwidth = 0;
                this.downloadedChunks = 0;
            }
        }

        //Timer for playTime tracking
        //Tracking totalSeconds in seconds
        //Event sent with both minutes and seconds total minutes
        var playTime = {
            totalSeconds: 0,
            start: function () {
                var self = this;
                this.interval = setInterval(function () {
                    self.totalSeconds += 1;
                }, 1000);
            },
            pause: function () {
                clearInterval(this.interval);
                delete this.interval;
            },
            resume: function () {
                if (!this.interval) this.start();
            },
            send: function () {
                var minutes = (this.totalSeconds / 60).toFixed(2);
                sendEventBeacon('playTimeMins', minutes, false, minutes);
                sendEventBeacon('playTimeSecs', this.totalSeconds, false, this.totalSeconds);
            },
            reset: function () {
                this.totalSeconds = 0;
            }
        };

        var loaded = function () {
            //resetting state for channel change scenario
            load.reset()
            buffering.reset();
            if (load.videoElementUsed) {
                if (trackEvent.playTime) {
                    playTime.send();
                }
            }
            playTime.reset();
            percentPlayed = 0;
            if (!eventLabel) {
                var sourceManifest = player.currentSrc().split("//")[1];
                if (sourceManifest.match(/.ism\/manifest/i)) {
                    sourceManifest = sourceManifest.split(/.ism\/manifest/i)[0] + ".ism/manifest"
                }
                eventLabel = sourceManifest;
                if (options.debug) {
                    console.log("eventLabel set as: " + eventLabel);
                }
            }

            //sending loadedmetadata event
            if (trackEvent.loaded) {
                sendEventBeacon('Video', 'loadedmetadata', true);
            }
            //sending player configuration data
            if (trackEvent.playerConfig) {
                sendEventBeacon("AmpVersion", player.getAmpVersion(), false);
                sendEventBeacon("PlaybackTech", player.currentTechName(), false);
                sendEventBeacon("MimeType", player.currentType(), false);
                if (this.isLive()) {
                    sendEventBeacon('isLive', "Live", false);
                } else {
                    sendEventBeacon('isLive', "VOD", false);
                }
                if (player.currentProtectionInfo()) {
                    sendEventBeacon("Protection", player.currentProtectionInfo()[0].type, false);
                } else {
                    sendEventBeacon("Protection", "Unencrypted", false);
                }
            }
            //used to track if the video element is reused to appropriately send playTime data
            load.videoElementUsed = true;
        };

        var timeupdate = function () {
            var currentTime = Math.round(player.currentTime());
            //Currently not tracking percentage watched information for Live 
            if (!this.isLive()) {
                var duration = Math.round(player.duration());
                var currentTimePercent = Math.round(currentTime / duration * 100);
                if (currentTimePercent % percentsPlayedInterval == 0 && currentTimePercent <= 100) {
                    if (__indexOf.call(percentsAlreadyTracked, currentTimePercent) < 0) {
                        if (currentTimePercent !== 0) {
                            percentPlayed += percentsPlayedInterval;
                            if (percentPlayed <= 100) {
                                sendEventBeacon('PercentsPlayed', percentPlayed, true);
                            }
                        }
                        percentsAlreadyTracked.push(currentTimePercent);
                    }
                    if (currentTimePercent != 0) {
                        if (currentTimePercent != percentsPlayedInterval) {
                            sendEventBeacon('PartsPlayed', (currentTimePercent - percentsPlayedInterval + 1) + "-" + currentTimePercent, true);
                        } else {
                            sendEventBeacon('PartsPlayed', "0-" + currentTimePercent, true);
                        }
                    }
                }
            }
            if (trackEvent.bitrate) {
                if (!download.videoBuffer && player.currentDownloadBitrate()) {
                    download.update();
                }
            }
        };

        var canplaythrough = function () {
            load.updateLoadTime();
        }

        var play = function () {
            var currentTime;
            currentTime = Math.round(player.currentTime());
            sendEventBeacon('Video', 'play', true, currentTime);
        };

        var playing = function () {
            seeking = false;
            if (!load.firstPlay) {
                if (trackEvent.start) {
                    load.send();
                }
                load.firstPlay = true;
            }
            if (trackEvent.buffering) {
                buffering.send();
            }

            if (trackEvent.playTime) {
                if (playTime.totalSeconds == 0) {
                    playTime.start();
                } else {
                    playTime.resume();
                }
            }
        }

        var pause = function () {
            if (trackEvent.buffering) {
                buffering.send();
            }

            if (trackEvent.playTime) {
                playTime.pause();
            }

            if (trackEvent.pause) {
                var currentTime = Math.round(player.currentTime());
                var duration = Math.round(player.duration());

                if (currentTime !== duration && !seeking) {
                    sendEventBeacon('Video', 'pause', false, currentTime);
                }
            }
        };

        var seek = function () {
            seeking = true;

            if (trackEvent.buffering) {
                buffering.reset();
            }
            if (trackEvent.seek) {
                var currentTime = Math.round(player.currentTime());
                sendEventBeacon('Video', 'seek', false, currentTime);
            }
        }

        var end = function () {
            if (trackEvent.playTime) {
                playTime.pause();
            }
            if (trackEvent.end) {
                sendEventBeacon('Video', 'ended', true);
            }
        };

        var waiting = function () {
            buffering.enterBuffering();
        }

        var downloadcompleted = function () {
            download.update();
        }

        var error = function () {
            if (trackEvent.playTime) {
                playTime.pause();
            }
            if (trackEvent.error) {
                var currentTime;
                currentTime = Math.round(player.currentTime());
                var errorHexCode = player.error().code.toString(16);
                sendEventBeacon('Video', 'error', true, currentTime);
                sendEventBeacon('Error', errorHexCode, true, errorHexCode);
                sendErrorBeacon(errorHexCode, true);
            }
        };

        var fullscreen = function () {
            var currentTime = Math.round(player.currentTime());
            if ((typeof player.isFullscreen === "function" ? player.isFullscreen() : void 0) || (typeof player.isFullScreen === "function" ? player.isFullScreen() : void 0)) {
                sendEventBeacon('Video', 'enter fullscreen', false, currentTime);
            } else {
                sendEventBeacon('Video', 'exit fullscreen', false, currentTime);
            }
        };

        function exit() {
            //Check that you haven't already sent this data
            //iOS fires event twice
            if (!load.unloaddatasent) {
                load.unloaddatasent = true;
                sendEventBeacon('page', 'onbeforeunload');
                if (trackEvent.playTime) {
                    playTime.send();
                }
                if (trackEvent.bitrate) {
                    download.send();
                }
            }
        }

        function sendEventBeacon(category, action, nonInteraction, value) {
            //check if Google Tag Manager is initialized on the page
            if (window['google_tag_manager']) {
                //Send event data to the data layer. Do not forget to create an Event Tag (Fire On - trackEvent)
                dataLayer.push({ 'event' : 'trackEvent', 'eventCategory' : category, 'eventAction' : action, 'eventLabel' : eventLabel, 'eventValue' : value });
                 if (options.debug) {
                        console.log("sent to gtm...'send', 'event', {'eventCategory': " + category + ", 'eventAction': " + action + ", 'eventLabel': " + eventLabel + ",'eventValue': " + value + "});
                    }
                //Todo: add nonInteraction.
            }
            //check if Universal API for Google Analytics is initialized on the page
            else if (window.ga || window.ga2) {
                //send event data to a the first google analytics account
                if (window.ga) {
                    ga('send', 'event', {
                        'eventCategory': category,
                        'eventAction': action,
                        'eventLabel': eventLabel,
                        'eventValue': value,
                        'nonInteraction': nonInteraction
                    });
                    if (options.debug) {
                        console.log("sent to ga...'send', 'event', {'eventCategory': " + category + ", 'eventAction': " + action + ", 'eventLabel': " + eventLabel + ",'eventValue': " + value + ", 'nonInteraction': " + nonInteraction);
                    }
                }
                //send to a second google analytics account if present
                if (window.ga2) {
                    ga2('send', 'event', {
                        'eventCategory': category,
                        'eventAction': action,
                        'eventLabel': eventLabel,
                        'eventValue': value,
                        'nonInteraction': nonInteraction
                    });
                    if (options.debug) {
                        console.log("sent to ga2...'send', 'event', {'eventCategory': " + category + ", 'eventAction': " + action + ", 'eventLabel': " + eventLabel + ",'eventValue': " + value + ", 'nonInteraction': " + nonInteraction);
                    }
                }
            } else if (window._gaq) {
                //if old google analytics apis are present
                _gaq.push(['_trackEvent', category, action, eventLabel, value, nonInteraction]);
                if (options.debug) {
                    console.log("sent to gaq...'_trackEvent', " + category + ", " + action + ", " + eventLabel + ", " + value + ", " + nonInteraction);
                }
            } else if (options.debug) {
                console.log("Google Analytics not detected");
            }
        };

        function sendErrorBeacon(code, fatal) {
            //Error tracking seems only to be available in GA Universal API
            if (window.ga || window.ga2) {
                if (window.ga) {
                    ga('send', 'exception', {
                        'exDescription': code,
                        'exFatal': fatal,
                        'appName': 'AMP',
                        'appVersion': player.getAmpVersion()
                    });
                    if (options.debug) {
                        console.log("sent to ga...'send', 'exception', {'exDescription': " + code + ", 'exFatal': " + fatal + ", 'appName': 'AMP','appVersion': " + player.getAmpVersion());
                    }
                }
                if (window.ga2) {
                    ga2('send', 'exception', {
                        'exDescription': code,
                        'exFatal': fatal,
                        'appName': 'AMP',
                        'appVersion': player.getAmpVersion()
                    });
                    if (options.debug) {
                        console.log("sent to ga2...'send', 'exception', {'exDescription': " + code + ", 'exFatal': " + fatal + ", 'appName': 'AMP','appVersion': " + player.getAmpVersion());
                    }
                }

            } else if (options.debug) {
                console.log("Google Analytics not detected");
            }
        };

        //add event listeners for tracking
        player.addEventListener("loadedmetadata", loaded);
        if (trackEvent.bitrate) {
            player.addEventListener("loadedmetadata", function () {
                download.send();
                download.reset();
                download.videoBuffer = player.videoBufferData();
                if (download.videoBuffer) {
                    download.videoBuffer.addEventListener("downloadcompleted", downloadcompleted);
                }
            });
        }
        if (trackEvent.start) {
            player.addEventListener("canplaythrough", canplaythrough);
        }
        if (trackEvent.percentsPlayed || trackEvent.bitrate) {
            player.addEventListener("timeupdate", timeupdate);
        }
        player.addEventListener("playing", playing);
        if (trackEvent.playTime || trackEvent.bitrate) {
            //Missing an event for player dispose
            window.addEventListener("onbeforeunload", exit, false);
            window.addEventListener("pagehide", exit, false);
        }
        if (trackEvent.error || trackEvent.playTime) {
            player.addEventListener("error", error);
        }
        if (trackEvent.end || trackEvent.playTime) {
            player.addEventListener("ended", end);
        }
        if (trackEvent.play) {
            player.addEventListener("play", play);
        }
        if (trackEvent.pause || trackEvent.playTime || trackEvent.buffering) {
            player.addEventListener("pause", pause);
        }
        if (trackEvent.buffering) {
            player.addEventListener("waiting", waiting);
        }
        if (trackEvent.buffering || trackEvent.seek) {
            player.addEventListener("seeking", seek);
        }
        if (trackEvent.fullscreen) {
            player.addEventListener("fullscreenchange", fullscreen);
        }

    });

}).call(this);
