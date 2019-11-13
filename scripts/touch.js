
console.log("Start");



var pointerDownName = 'pointerdown';
var pointerUpName = 'pointerup';
var pointerMoveName = 'pointermove';
var initialTouchPos = {};
var lastTouchPos = {};
var ActivePointers = [];

var touchTarget = window;

if (window.navigator.msPointerEnabled) {
    pointerDownName = 'MSPointerDown';
    pointerUpName = 'MSPointerUp';
    pointerMoveName = 'MSPointerMove';
}


window.PointerEventsSupport = false;
if (window.PointerEvent || window.navigator.msPointerEnabled) {
    window.PointerEventsSupport = true;
    console.log("PointerEvent true " + pointerDownName);
}




// Handle the start of gestures
function handleGestureStart(evt) {
    evt.preventDefault();
    
    console.log("touch start " + ActivePointers.length);

    // alert("active pointers: " + ActivePointers.length);

    if (evt.touches && evt.touches.length > 1) {
        return;
    }
    
    // Add the move and end listeners
    if (window.PointerEvent) {
        evt.target.setPointerCapture(evt.pointerId);
        ActivePointers.push(evt);
        console.log("touch pointerid: " + evt.pointerId);
        initialTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);
    } else {
        // Add Mouse Listeners
        document.addEventListener('mousemove', this.handleGestureMove, true);
        document.addEventListener('mouseup', this.handleGestureEnd, true);
    }

    


};

// Handle end gestures
function handleGestureEnd(evt) {
    evt.preventDefault();
    ActivePointers = [];
    console.log("touch end: " + ActivePointers.length);

    if (evt.touches && evt.touches.length > 0) {
        return;
    }

    // Remove Event Listeners
    if (window.PointerEvent) {
        evt.target.releasePointerCapture(evt.pointerId);
    } else {
        // Remove Mouse Listeners
        document.removeEventListener('mousemove', this.handleGestureMove, true);
        document.removeEventListener('mouseup', this.handleGestureEnd, true);
    }


    
    initialTouchPos = {};
    lastTouchPos = {};
}

function handleGestureMove(evt) {
    console.log("HANDLE GESTURE MOVE!");

    evt.preventDefault();
    
    if (!initialTouchPos) {
        return;
    }
    lastTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);
    
    let direction = getDirectionFromEvents();

    if (ActivePointers.length === 3 && direction === "up") {
        let scrollingElement = (document.scrollingElement || document.body);
        window.scrollTo({
            top: scrollingElement.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (ActivePointers.length === 3 && direction === "down") {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (ActivePointers.length === 2 && direction === "up") {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition + 1200,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (ActivePointers.length === 2 && direction === "down") {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition - 1200,
            left: 0,
            behavior: 'smooth'
        });
    
    // If no action was triggered, return
    } else {
        return;
    }

    // Otherwise trigger animation for gesture detection
    const animationElem = document.getElementsByClassName('gesture-detected-indicator')[0];
    animationElem.classList.add('active');
    setTimeout(() => animationElem.classList.remove('active'), 500);
}



function getGesturePointFromEvent(evt) {
    var point = {};

    if (evt.targetTouches) {
        // Prefer Touch Events
        point.x = evt.targetTouches[0].clientX;
        point.y = evt.targetTouches[0].clientY;
    } else {
        // Either Mouse event or Pointer Event
        point.x = evt.clientX;
        point.y = evt.clientY;
    }

    return point;
}

function getDirectionFromEvents(){
    let up = true;
    let down = true;
    
    for (let i = 0; i < ActivePointers.length; i++) {
        let id = ActivePointers[i].pointerId;
        let deltaY = lastTouchPos[id].y - initialTouchPos[id].y;
        if (deltaY >= 0) {
            up = false;
        }
        if (deltaY <= 0) {
            down = false;
        }

    }
    if (up) {
        return "up";
    } else if (down) {
        return "down";
    } else {
        return "none";
    }
}


if (window.PointerEvent) {
    console.log("PointerEvent true!");
    touchTarget.addEventListener('pointerdown', this.handleGestureStart, true);
    touchTarget.addEventListener('pointermove', this.handleGestureMove, true);
    touchTarget.addEventListener('pointerup', this.handleGestureEnd, true);
    touchTarget.addEventListener('pointercancel', this.handleGestureEnd, true);
} else {
    touchTarget.addEventListener('touchstart', this.handleGestureStart, true);
    touchTarget.addEventListener('touchmove', this.handleGestureMove, true);
    touchTarget.addEventListener('touchend', this.handleGestureEnd, true);
    touchTarget.addEventListener('touchcancel', this.handleGestureEnd, true);

    touchTarget.addEventListener('mousedown', this.handleGestureStart, true);
}

function handleGestureEnd(evt) {
    console.log("handleGestureEnd");
    console.log(ActivePointers.length);

    // remove all active pointers when gesture handling is done
    ActivePointers = [];
    console.log(ActivePointers.length);
}


window.onload = function () {
    'use strict';

    // We do this so :active pseudo classes are applied.
    window.onload = function () {
        if (/iP(hone|ad)/.test(window.navigator.userAgent)) {
            document.body.addEventListener('touchstart', function () { }, false);
        }
    };
}
