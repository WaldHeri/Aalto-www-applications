/// GLOBALS

let pointerDownName = 'pointerdown';
let pointerUpName = 'pointerup';
let pointerMoveName = 'pointermove';
let initialTouchPos = {};
let lastTouchPos = {};
let ActivePointers = [];

const touchTarget = window;


/// OLD IE SUPPORT

if (window.navigator.msPointerEnabled) {
    pointerDownName = 'MSPointerDown';
    pointerUpName = 'MSPointerUp';
    pointerMoveName = 'MSPointerMove';
}

window.PointerEventsSupport = false;
if (window.PointerEvent || window.navigator.msPointerEnabled) {
    window.PointerEventsSupport = true;
}


/// GESTURE HANDLING

function handleGestureStart(evt) {
    evt.preventDefault();
    
    if (evt.touches && evt.touches.length > 1) {
        return;
    }
    
    // Add the move and end listeners
    if (window.PointerEvent) {
        evt.target.setPointerCapture(evt.pointerId);
        ActivePointers.push(evt);
        initialTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);

    } else {
        // Add Mouse Listeners
        document.addEventListener('mousemove', this.handleGestureMove, true);
        document.addEventListener('mouseup', this.handleGestureEnd, true);
    }
};

function handleGestureEnd(evt) {
    evt.preventDefault();
    ActivePointers = [];

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
    evt.preventDefault();
    
    if (!initialTouchPos) {
        return;
    }

    lastTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);    

    if (isGestureUp(3)) {
        let scrollingElement = (document.scrollingElement || document.body);
        window.scrollTo({
            top: scrollingElement.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isGestureDown(3)) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isGestureUp(2)) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition + 1200,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isGestureDown(2)) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition - 1200,
            left: 0,
            behavior: 'smooth'
        });

    // TODO: check direction for this: have to check that the first pointer does not move (or move only a little) and the direction of other pointer
    } else if (false) {
        alert("hooray!");

    // If no gesture was recognized, return
    } else {
        return;
    }

    showGestureDetectedEffect();
}


/// HELPERS

function getGesturePointFromEvent(evt) {
    const point = {};

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

function getPosChange(activePointer, axis) {
    const id = activePointer.pointerId;
    return lastTouchPos[id][axis] - initialTouchPos[id][axis];   
}

function isGestureUp(pointerCount) {
    const allGesturesUp = ActivePointers.every((actPtr) => getPosChange(actPtr, 'y') < 0);
    return ActivePointers.length === pointerCount && allGesturesUp;
}

function isGestureDown(pointerCount) {
    const allGesturesUp = ActivePointers.every((actPtr) => getPosChange(actPtr, 'y') > 0);
    return ActivePointers.length === pointerCount && allGesturesUp;
}

function showGestureDetectedEffect() {
    const animationElem = document.getElementsByClassName('gesture-detected-indicator')[0];
    animationElem.classList.add('active');
    setTimeout(() => animationElem.classList.remove('active'), 500);
}


/// INITIALIZATION

if (window.PointerEvent) {
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
