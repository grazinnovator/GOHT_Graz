(() => {
    const _Graphics_playVideo = Graphics.playVideo;

    Graphics.playVideo = function(src) {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOS = /iP(ad|hone|od)/i.test(navigator.userAgent);
        const extension = (isSafari || isIOS) ? '.mp4' : '.webm';
        const baseName = src.replace(/\.(webm|mp4)$/i, '');
        const fullSrc = baseName + extension;

        console.log('[RPGMZ Video Patch] Detected browser:', navigator.userAgent);
        console.log('[RPGMZ Video Patch] Original video request:', src);
        console.log('[RPGMZ Video Patch] Using extension:', extension);
        console.log('[RPGMZ Video Patch] Final video path:', fullSrc);

        const video = document.createElement("video");
        video.src = fullSrc;
        video.setAttribute("playsinline", "");
        video.volume = 1;
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.zIndex = "100";
        video.style.objectFit = "cover"; // Optional: fills screen nicely

        video.onended = () => {
            Graphics._onVideoEnd();
            document.body.removeChild(video);
            document.getElementById('GameCanvas').style.display = 'block';
        };

        video.onerror = Graphics._onVideoError.bind(Graphics);
        Graphics._video = video;

        // Hide the canvas so video is on top
        document.getElementById('GameCanvas').style.display = 'none';

        document.body.appendChild(video);
        video.play();
    };
})();