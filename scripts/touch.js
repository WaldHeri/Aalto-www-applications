/// GLOBALS

let pointerDownName = 'pointerdown';
let pointerUpName = 'pointerup';
let pointerMoveName = 'pointermove';

let initialTouchPos = {};
let lastTouchPos = {};
let ActivePointers = [];

let swipeThreshold = 50;
let stillThreshold = 5;

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

function removePointerData(id) {
    const removeIdx = ActivePointers.findIndex(actPtr => actPtr.pointerId === id);

    ActivePointers.splice(removeIdx, 1);
    delete initialTouchPos[id];
    delete lastTouchPos[id];
}

function handleGestureEnd(evt) {
    evt.preventDefault();

    removePointerData(evt.pointerId);

    // Remove Event Listeners
    if (window.PointerEvent) {
        evt.target.releasePointerCapture(evt.pointerId);
    } else {
        // Remove Mouse Listeners
        document.removeEventListener('mousemove', this.handleGestureMove, true);
        document.removeEventListener('mouseup', this.handleGestureEnd, true);
    }
}

function handleGestureMove(evt) {
    evt.preventDefault();

    if (!initialTouchPos) {
        return;
    }

    lastTouchPos[evt.pointerId] = getGesturePointFromEvent(evt);    

    if (isMultiSwipe('up', 3)) {
        let scrollingElement = (document.scrollingElement || document.body);
        window.scrollTo({
            top: scrollingElement.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isMultiSwipe('down', 3)) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isMultiSwipe('up', 2)) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition + 1200,
            left: 0,
            behavior: 'smooth'
        });
    
    } else if (isMultiSwipe('down', 2)) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition - 1200,
            left: 0,
            behavior: 'smooth'
        });

    } else if (isHoldAndSwipe('up')) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition + 1200,
            left: 0,
            behavior: 'smooth'
        });

    } else if (isHoldAndSwipe('down')) {
        let currentPosition = document.documentElement.scrollTop;
        window.scrollTo({
            top: currentPosition - 1200,
            left: 0,
            behavior: 'smooth'
        });

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

    if (!lastTouchPos[id] || !initialTouchPos[id]) {
        return null;
    }

    return lastTouchPos[id][axis] - initialTouchPos[id][axis];   
}

function getIsSwipe(dir) {
    switch (dir) {
        case 'up':
            return (actPtr) => getPosChange(actPtr, 'y') < -swipeThreshold
        case 'down':
            return (actPtr) => getPosChange(actPtr, 'y') > swipeThreshold;
    }
}

/*
 * Check that there are `pointerCount` active pointers, and that all have moved to `dir` direction.
 */
function isMultiSwipe(dir, pointerCount) {
    const isSwipeDir = getIsSwipe(dir);
    const allGesturesDir = ActivePointers.every(isSwipeDir);

    return ActivePointers.length === pointerCount && allGesturesDir;
}

/*
 * Check that one pointer has moved up by at least `swipeThreshold` and that the other pointer
 * has stayed still, i.e. moved at most `stillThreshold`.
 */
function isHoldAndSwipe(dir) {
    const isSwipeDir = getIsSwipe(dir);

    const swipeGesture = ActivePointers.some(isSwipeDir);
    const holdGesture = ActivePointers.some((actPtr) => 
                                                Math.abs(getPosChange(actPtr, 'y')) < stillThreshold &&
                                                Math.abs(getPosChange(actPtr, 'x')) < stillThreshold);

    return swipeGesture && holdGesture && ActivePointers.length === 2;
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
