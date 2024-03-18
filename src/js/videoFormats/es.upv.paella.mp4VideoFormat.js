import VideoPlugin, { Video } from 'paella-core/js/core/VideoPlugin';
import { resolveResourcePath } from 'paella-core/js/core/utils';
import PaellaCoreVideoFormats from './PaellaCoreVideoFormats';

let video = null;

export function supportsVideoType(type) {
    if (!type) return false;
    if (!video) {
        video = document.createElement("video");
    }

    let canPlay = video.canPlayType(type);
    if (canPlay === "maybe" || canPlay === "probably") {
        return true;
    }
    else if (/video\/mp4/i.test(type)) {
        canPlay = video.canPlayType("video/mp4");
        return canPlay === "maybe" || canPlay === "probably";
    }
}

export class Mp4Video extends Video {
    constructor(player, parent, isMainAudio, config) {
        super('video', player, parent);
        this._config = config || {};

        const crossorigin = this._config.crossOrigin ?? "";
        this.element.setAttribute("playsinline","");
        if (crossorigin !== false) {
            this.element.setAttribute("crossorigin",crossorigin);
        }

        this.isMainAudio = isMainAudio;

        // Autoplay is required to play videos in some browsers
        this.element.setAttribute("autoplay","");
        this.element.autoplay = true;

        // The video is muted by default, to allow autoplay to work
        if (!isMainAudio) {
            this.element.setAttribute("muted", "");
            this.element.muted = true;
        }

        this._videoEnabled = true;
    }

    async play() { 
        if (this._videoEnabled) {
            try {
                await this.waitForLoaded();
                return this.video.play();
            }
            catch (e) {
                // Prevent AbortError exception
            }
        }
        else {
            this._disabledProperties.paused = false;
        }
    }
    
    async pause() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.pause();
        }
        else {
            this._disabledProperties.paused = true;
        }
    }

    async duration() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.duration;
        }
        else {
            return this._disabledProperties.duration;
        }
    }

    get currentTimeSync() {
        if (this._videoEnabled) {
            return this.ready ? this.video.currentTime : -1;
        }
        else {
            return this._disabledProperties.currentTime;
        }
    }
    
    async currentTime() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.currentTimeSync;
        }
        else {
            return this._disabledProperties.currentTime;
        }
    }

    async setCurrentTime(t) {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.currentTime = t;
        }
        else {
            this._disabledProperties.currentTime = t;
            return t;
        }
    }

    async volume() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.volume;
        }
        else {
            return this._disabledProperties.volume;
        }
    }

    async setVolume(v) {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            if (v === 0) {
                this.video.setAttribute("muted", "");
            }
            else {
                this.video.removeAttribute("muted");
            }
            return this.video.volume = v;
        }
        else {
            this._disabledProperties.volume = v;
            return v;
        }
    }

    async paused() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.paused;
        }
        else {
            return this._disabledProperties.paused;
        }
    }

    async playbackRate() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return await this.video.playbackRate;
        }
        else {
            return this._disabledProperties.playbackRate;
        }
    }

    async setPlaybackRate(pr) {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return this.video.playbackRate = pr;
        }
        else {
            this._disabledProperties.playbackRate = pr;
            return pr;
        }
    }

    async getQualities() {

    }

    async setQuality(/* q */) {
    }

    get currentQuality() {
        return 0;
    }

    async getDimensions() {
        if (this._videoEnabled) {
            await this.waitForLoaded();
            return { w: this.video.videoWidth, h: this.video.videoHeight };
        }
        else {
            return { w: this._disabledProperties.videoWidth, h: this._disabledProperties.videoHeight };
        }
    }

    saveDisabledProperties(video) {
        this._disabledProperties = {
            duration: video.duration,
            volume: video.volume,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            playbackRate: video.playbackRate,
            paused: video.paused,
            currentTime: video.currentTime
        }
    }

    // This function is called when the player loads, and it should
    // make everything ready for video playback to begin.
    async loadStreamData(streamData = null) {
        this._streamData = this._streamData || streamData;
        this.player.log.debug("es.upv.paella.mp4VideoFormat: loadStreamData");

        if (!this._currentSource) {
            this._sources = null;
            this._currentQuality = 0;
    
            this._sources = streamData.sources.mp4;
            this._sources.sort((a,b) => {
                return Number(a.res.w) - Number(b.res.w);
            });
            this._currentQuality = this._sources.length - 1;
            this._currentSource = this._sources[this._currentQuality];
        }

        if (!this.isMainAudioPlayer) {
            this.video.muted = true;
        }

        if (this._initialVolume) {
            this.video.volume = this._initialVolume;
            if (this._initialVolume === 0) {
                this.video.muted = true;
            }
        }
        
        this.video.src = resolveResourcePath(this.player, this._currentSource.src);
        this._endedCallback = this._endedCallback || (() => {
            if (typeof(this._videoEndedCallback) == "function") {
                this._videoEndedCallback();
            }
        });
        this.video.addEventListener("ended", this._endedCallback);
        
        // It's necessary to play the video because some browsers don't update the
        // readyState property until the video is played.
        try {
            await this.video.play();
        }
        catch (err) {
            // Prevent AbortError exception
        }
        await this.waitForLoaded(true);

        this.player.log.debug(`es.upv.paella.mp4VideoFormat (${ this.streamData.content }): video loaded and ready.`);
        this.saveDisabledProperties(this.video);
    }

    async clearStreamData() {
        this.video.src = "";
        this.video.removeEventListener("ended", this._endedCallback);
        this.video.removeEventListener("loadeddata", this._handleLoadedCallback);
        this._ready = false;
    }

    get isEnabled() {
        return this._videoEnabled;
    }

    async enable() {
        this._videoEnabled = true;
    }

    async disable() {
        if (this.isMainAudio) {
            this.player.log.debug("video.disable() - the video is not disabled because it is the main audio source.");
        }
        else {
            this._videoEnabled = false;
        }

        return this._videoEnabled;
    }

    waitForLoaded(pauseOnLoaded) {
        return new Promise((resolve,reject) => {
            if (this.video.readyState>=2) {
                if (pauseOnLoaded) {
                    this.video.pause();
                }
                this._ready = true;
            }

            if (this.ready) {
                resolve();
            }
            else {
                this._handleLoadedCallback = evt => {
                    if (this.video.readyState>=2) {
                        if (pauseOnLoaded) {
                            this.video.pause();
                        }
                        this._ready = true;
                        resolve();
                    }
                }
                this.video.addEventListener("loadeddata", this._handleLoadedCallback);
            }
        })
    }
}

export default class Mp4VideoPlugin extends VideoPlugin {
    getPluginModuleInstance() {
        return PaellaCoreVideoFormats.Get();
    }
    
    get name() {
		return super.name || "es.upv.paella.mp4VideoFormat";
	}

    get streamType() {
        return "mp4";
    }

    isCompatible(streamData) {
        const { mp4 } = streamData.sources;
        return mp4 && supportsVideoType(mp4[0]?.mimetype);
    }

    async getVideoInstance(playerContainer, isMainAudio) {
        return new Mp4Video(this.player, playerContainer, isMainAudio, this.config);
    }
    
    getCompatibleFileExtensions() {
        return ["m4v","mp4"];
    }

    getManifestData(fileUrls) {
        return {
            mp4: fileUrls.map(url => ({
                src: url,
                mimetype: 'video/mp4'
            }))
        };
    }
}
