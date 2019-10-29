
console.log("Start");



var pointerDownName = 'pointerdown';
var pointerUpName = 'pointerup';
var pointerMoveName = 'pointermove';
var rafPending = false;
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

    rafPending = false;

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
    evt.preventDefault();
    
    if (!initialTouchPos) {
        return;
    }
    lastTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);
    if(ActivePointers.length == 3){
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

function getDirectionFromEvents(){
    var up = true;
    var down = true;
    
    for (var i = 0; i < ActivePointers.length; i++ ){
        var id = ActivePointers[i].pointerId;
        var deltaY = lastTouchPos[id].y - initialTouchPos[id].y;
        if(deltaY >= 0){
            up = false;
        }
        if(deltaY <= 0){
            down = false;
        }

    }
    if(up){
        return "up";
    } else if(down){
        return "down";
    }else{
        return "none";
    }
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
