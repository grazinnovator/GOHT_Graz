window.createCurtainOverlay = function() {
    if (document.getElementById("fadeCurtain")) return;

    const curtain = document.createElement("div");
    curtain.id = "fadeCurtain";
    Object.assign(curtain.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        opacity: 0,
        zIndex: 9999,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
        willChange: "opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
    });
    document.body.appendChild(curtain);
};

window.fadeCurtainIn = function(duration = 500) {
    window.createCurtainOverlay();
    const curtain = document.getElementById("fadeCurtain");
    curtain.style.transition = `opacity ${duration}ms ease`;
    curtain.style.opacity = 1;
};

window.fadeCurtainOut = function(duration = 500) {
    const curtain = document.getElementById("fadeCurtain");
    if (curtain) {
        curtain.style.transition = `opacity ${duration}ms ease`;
        curtain.style.opacity = 0;
        setTimeout(() => curtain.remove(), duration + 50);
    }
};
