
console.log("Start");



var pointerDownName = 'pointerdown';
var pointerUpName = 'pointerup';
var pointerMoveName = 'pointermove';
var rafPending = false;
var initialTouchPos = null;
var lastTouchPos = null;
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
    console.log("touch start");
    if (evt.touches && evt.touches.length > 1) {
        return;
    }
    ActivePointers.push(evt);
    // Add the move and end listeners
    if (window.PointerEvent) {
        evt.target.setPointerCapture(evt.pointerId);
    } else {
        // Add Mouse Listeners
        document.addEventListener('mousemove', this.handleGestureMove, true);
        document.addEventListener('mouseup', this.handleGestureEnd, true);
    }

    initialTouchPos = getGesturePointFromEvent(evt);


};

// Handle end gestures
function handleGestureEnd(evt) {
    evt.preventDefault();
    console.log("touch end");
    if (evt.touches && evt.touches.length > 0) {
        return;
    }

    rafPending = false;

    // Remove Event Listeners
    if (window.PointerEvent) {
        evt.target.releasePointerCapture(evt.pointerId);
    } else {
        // Remove Mouse Listeners
        document.removeEventListener('mousemove', this.handleGestureMove, true);
        document.removeEventListener('mouseup', this.handleGestureEnd, true);
    }


    ActivePointers = [];
    initialTouchPos = null;
}

function handleGestureMove(evt) {
    evt.preventDefault();
    
    if (!initialTouchPos) {
        return;
    }

    lastTouchPos = getGesturePointFromEvent(evt);
    console.log("touch move: " + lastTouchPos.x + "  " + lastTouchPos.y);
    console.log(ActivePointers.length);
    if(ActivePointers.length = 2){
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
    }
    
    if (rafPending) {
        return;
    }

    rafPending = true;

    //window.requestAnimFrame(onAnimFrame);
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


if (window.PointerEvent) {
    console.log("PointerEvent true ");
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




window.onload = function () {
    'use strict';

    // We do this so :active pseudo classes are applied.
    window.onload = function () {
        if (/iP(hone|ad)/.test(window.navigator.userAgent)) {
            document.body.addEventListener('touchstart', function () { }, false);
        }
    };
}
