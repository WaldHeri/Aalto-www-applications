$(document).ready(function () {

    var pointerDownName = 'pointerdown';
    var pointerUpName = 'pointerup';
    var pointerMoveName = 'pointermove';

    if (window.navigator.msPointerEnabled) {
        pointerDownName = 'MSPointerDown';
        pointerUpName = 'MSPointerUp';
        pointerMoveName = 'MSPointerMove';
    }


    window.PointerEventsSupport = false;
    if (window.PointerEvent || window.navigator.msPointerEnabled) {
        window.PointerEventsSupport = true;
    }


    if (window.PointerEvent) {
        window.addEventListener('pointerdown', this.handleGestureStart, true);
        window.addEventListener('pointermove', this.handleGestureMove, true);
        window.addEventListener('pointerup', this.handleGestureEnd, true);
        window.addEventListener('pointercancel', this.handleGestureEnd, true);
    } else {
        window.addEventListener('touchstart', this.handleGestureStart, true);
        window.addEventListener('touchmove', this.handleGestureMove, true);
        window.addEventListener('touchend', this.handleGestureEnd, true);
        window.addEventListener('touchcancel', this.handleGestureEnd, true);

        window.addEventListener('mousedown', this.handleGestureStart, true);
    }

    this.handleGestureStart = function(evt) {
        evt.preventDefault();

    }





})