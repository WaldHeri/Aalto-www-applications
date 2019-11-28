/// GLOBALS

let pointerDownName = 'pointerdown';
let pointerUpName = 'pointerup';
let pointerMoveName = 'pointermove';

let initialTouchPos = {};
let lastTouchPos = {};
let ActivePointers = [];

const params = {
    swipeThreshold: 50,
    stillThreshold: 5,
    pageSize: 1200
}

const gestureToEffectIdx = {
    "2-swipe-up": 0,
    "2-swipe-down": 1,
    "2-swipe-left": 4,
    "2-swipe-right": 5,
    "3-swipe-up": 2,
    "3-swipe-down": 3,
    "hold-n-swipe-up": 2,
    "hold-n-swipe-down": 3
};

const allEffects = [
    scrollPageDown,
    scrollPageUp,
    scrollBottom,
    scrollTop,
    moveCarouselNext,
    moveCarouselPrev
];

const touchTarget = window;


/// CONFIGURATION FORM FIELDS

// Initialize configuration form fields to default values
$(document).ready(() => {
    const idsToValues = [
        ...Object.entries(gestureToEffectIdx),
        ...Object.entries(params)
    ];

    idsToValues.forEach(([id, value]) => 
        $(`#${id}`).val(value)
    );
});

function handleFormFieldChange(formElem) {
    const id = formElem.id;
    const tag = formElem.tagName;
    const value = parseInt(formElem.value); // All values are numerical

    // Gesture effects are handled with select
    if (tag === "SELECT") {
        gestureToEffectIdx[id] = value;

    // All other form field values are in params
    } else {
        params[id] = value;
    }
}

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


/// GESTURE EFFECTS
function scrollToVertical(top) {
    window.scrollTo({
        top: top,
        left: 0,
        behavior: 'smooth'
    });
}

function scrollBottom() {
    const scrollingElement = (document.scrollingElement || document.body);
    scrollToVertical(scrollingElement.scrollHeight);
}

function scrollTop() {
    scrollToVertical(0);
}

function scrollPageUp() {
    scrollToVertical(document.documentElement.scrollTop - params.pageSize);
}

function scrollPageDown() {
    scrollToVertical(document.documentElement.scrollTop + params.pageSize)
}

function moveCarouselNext() {
    $('.carousel').carousel('next');
}

function moveCarouselPrev() {
    $('.carousel').carousel('prev');
}


/// GESTURE HANDLING

function handleGestureStart(evt) {
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
    const gestureType = getGestureType();

    if (gestureType === null) {
        return;
    } 

    const effectIdx = gestureToEffectIdx[gestureType];
    const gestureEffect = allEffects[effectIdx];

    gestureEffect();
    showGestureDetectedEffect();
}

function getGestureType() {
    if (isMultiSwipe('up', 3)) {
        return "3-swipe-up";
    
    } else if (isMultiSwipe('down', 3)) {
        return "3-swipe-down";
    
    } else if (isMultiSwipe('up', 2)) {
        return "2-swipe-up";
    
    } else if (isMultiSwipe('down', 2)) {
        return "2-swipe-down";

    } else if (isMultiSwipe('left', 2)) {
        return "2-swipe-left";
        
    } else if (isMultiSwipe('right', 2)) {
        return "2-swipe-right";

    } else if (isHoldAndSwipe('up')) {
        return "hold-n-swipe-up";

    } else if (isHoldAndSwipe('down')) {
        return "hold-n-swipe-down";

    } else {
        return null;
    }
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
            return (actPtr) => getPosChange(actPtr, 'y') < -params.swipeThreshold;
        case 'down':
            return (actPtr) => getPosChange(actPtr, 'y') > params.swipeThreshold;
        case 'left':
            return (actPtr) => getPosChange(actPtr, 'x') < -params.swipeThreshold;
        case 'right':
            return (actPtr) => getPosChange(actPtr, 'x') > params.swipeThreshold;
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
                                                Math.abs(getPosChange(actPtr, 'y')) < params.stillThreshold &&
                                                Math.abs(getPosChange(actPtr, 'x')) < params.stillThreshold);

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
