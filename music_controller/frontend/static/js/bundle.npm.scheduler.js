"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([["npm.scheduler"],{

/***/ "./node_modules/scheduler/cjs/scheduler-tracing.development.js":
/*!*********************************************************************!*\
  !*** ./node_modules/scheduler/cjs/scheduler-tracing.development.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

/** @license React v0.20.2
 * scheduler-tracing.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

var DEFAULT_THREAD_ID = 0; // Counters used to generate unique IDs.

var interactionIDCounter = 0;
var threadIDCounter = 0; // Set of currently traced interactions.
// Interactions "stack"–
// Meaning that newly traced interactions are appended to the previously active set.
// When an interaction goes out of scope, the previous set (if any) is restored.

exports.__interactionsRef = null; // Listener(s) to notify when interactions begin and end.

exports.__subscriberRef = null;

{
  exports.__interactionsRef = {
    current: new Set()
  };
  exports.__subscriberRef = {
    current: null
  };
}
function unstable_clear(callback) {

  var prevInteractions = exports.__interactionsRef.current;
  exports.__interactionsRef.current = new Set();

  try {
    return callback();
  } finally {
    exports.__interactionsRef.current = prevInteractions;
  }
}
function unstable_getCurrent() {
  {
    return exports.__interactionsRef.current;
  }
}
function unstable_getThreadID() {
  return ++threadIDCounter;
}
function unstable_trace(name, timestamp, callback) {
  var threadID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_THREAD_ID;

  var interaction = {
    __count: 1,
    id: interactionIDCounter++,
    name: name,
    timestamp: timestamp
  };
  var prevInteractions = exports.__interactionsRef.current; // Traced interactions should stack/accumulate.
  // To do that, clone the current interactions.
  // The previous set will be restored upon completion.

  var interactions = new Set(prevInteractions);
  interactions.add(interaction);
  exports.__interactionsRef.current = interactions;
  var subscriber = exports.__subscriberRef.current;
  var returnValue;

  try {
    if (subscriber !== null) {
      subscriber.onInteractionTraced(interaction);
    }
  } finally {
    try {
      if (subscriber !== null) {
        subscriber.onWorkStarted(interactions, threadID);
      }
    } finally {
      try {
        returnValue = callback();
      } finally {
        exports.__interactionsRef.current = prevInteractions;

        try {
          if (subscriber !== null) {
            subscriber.onWorkStopped(interactions, threadID);
          }
        } finally {
          interaction.__count--; // If no async work was scheduled for this interaction,
          // Notify subscribers that it's completed.

          if (subscriber !== null && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        }
      }
    }
  }

  return returnValue;
}
function unstable_wrap(callback) {
  var threadID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_THREAD_ID;

  var wrappedInteractions = exports.__interactionsRef.current;
  var subscriber = exports.__subscriberRef.current;

  if (subscriber !== null) {
    subscriber.onWorkScheduled(wrappedInteractions, threadID);
  } // Update the pending async work count for the current interactions.
  // Update after calling subscribers in case of error.


  wrappedInteractions.forEach(function (interaction) {
    interaction.__count++;
  });
  var hasRun = false;

  function wrapped() {
    var prevInteractions = exports.__interactionsRef.current;
    exports.__interactionsRef.current = wrappedInteractions;
    subscriber = exports.__subscriberRef.current;

    try {
      var returnValue;

      try {
        if (subscriber !== null) {
          subscriber.onWorkStarted(wrappedInteractions, threadID);
        }
      } finally {
        try {
          returnValue = callback.apply(undefined, arguments);
        } finally {
          exports.__interactionsRef.current = prevInteractions;

          if (subscriber !== null) {
            subscriber.onWorkStopped(wrappedInteractions, threadID);
          }
        }
      }

      return returnValue;
    } finally {
      if (!hasRun) {
        // We only expect a wrapped function to be executed once,
        // But in the event that it's executed more than once–
        // Only decrement the outstanding interaction counts once.
        hasRun = true; // Update pending async counts for all wrapped interactions.
        // If this was the last scheduled async work for any of them,
        // Mark them as completed.

        wrappedInteractions.forEach(function (interaction) {
          interaction.__count--;

          if (subscriber !== null && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        });
      }
    }
  }

  wrapped.cancel = function cancel() {
    subscriber = exports.__subscriberRef.current;

    try {
      if (subscriber !== null) {
        subscriber.onWorkCanceled(wrappedInteractions, threadID);
      }
    } finally {
      // Update pending async counts for all wrapped interactions.
      // If this was the last scheduled async work for any of them,
      // Mark them as completed.
      wrappedInteractions.forEach(function (interaction) {
        interaction.__count--;

        if (subscriber && interaction.__count === 0) {
          subscriber.onInteractionScheduledWorkCompleted(interaction);
        }
      });
    }
  };

  return wrapped;
}

var subscribers = null;

{
  subscribers = new Set();
}

function unstable_subscribe(subscriber) {
  {
    subscribers.add(subscriber);

    if (subscribers.size === 1) {
      exports.__subscriberRef.current = {
        onInteractionScheduledWorkCompleted: onInteractionScheduledWorkCompleted,
        onInteractionTraced: onInteractionTraced,
        onWorkCanceled: onWorkCanceled,
        onWorkScheduled: onWorkScheduled,
        onWorkStarted: onWorkStarted,
        onWorkStopped: onWorkStopped
      };
    }
  }
}
function unstable_unsubscribe(subscriber) {
  {
    subscribers.delete(subscriber);

    if (subscribers.size === 0) {
      exports.__subscriberRef.current = null;
    }
  }
}

function onInteractionTraced(interaction) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onInteractionTraced(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onInteractionScheduledWorkCompleted(interaction) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onInteractionScheduledWorkCompleted(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkScheduled(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkScheduled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStarted(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkStarted(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStopped(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkStopped(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkCanceled(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkCanceled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

exports.unstable_clear = unstable_clear;
exports.unstable_getCurrent = unstable_getCurrent;
exports.unstable_getThreadID = unstable_getThreadID;
exports.unstable_subscribe = unstable_subscribe;
exports.unstable_trace = unstable_trace;
exports.unstable_unsubscribe = unstable_unsubscribe;
exports.unstable_wrap = unstable_wrap;
  })();
}


/***/ }),

/***/ "./node_modules/scheduler/cjs/scheduler.development.js":
/*!*************************************************************!*\
  !*** ./node_modules/scheduler/cjs/scheduler.development.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

/** @license React v0.20.2
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

var enableSchedulerDebugging = false;
var enableProfiling = false;

var requestHostCallback;
var requestHostTimeout;
var cancelHostTimeout;
var requestPaint;
var hasPerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';

if (hasPerformanceNow) {
  var localPerformance = performance;

  exports.unstable_now = function () {
    return localPerformance.now();
  };
} else {
  var localDate = Date;
  var initialTime = localDate.now();

  exports.unstable_now = function () {
    return localDate.now() - initialTime;
  };
}

if ( // If Scheduler runs in a non-DOM environment, it falls back to a naive
// implementation using setTimeout.
typeof window === 'undefined' || // Check if MessageChannel is supported, too.
typeof MessageChannel !== 'function') {
  // If this accidentally gets imported in a non-browser environment, e.g. JavaScriptCore,
  // fallback to a naive implementation.
  var _callback = null;
  var _timeoutID = null;

  var _flushCallback = function () {
    if (_callback !== null) {
      try {
        var currentTime = exports.unstable_now();
        var hasRemainingTime = true;

        _callback(hasRemainingTime, currentTime);

        _callback = null;
      } catch (e) {
        setTimeout(_flushCallback, 0);
        throw e;
      }
    }
  };

  requestHostCallback = function (cb) {
    if (_callback !== null) {
      // Protect against re-entrancy.
      setTimeout(requestHostCallback, 0, cb);
    } else {
      _callback = cb;
      setTimeout(_flushCallback, 0);
    }
  };

  requestHostTimeout = function (cb, ms) {
    _timeoutID = setTimeout(cb, ms);
  };

  cancelHostTimeout = function () {
    clearTimeout(_timeoutID);
  };

  exports.unstable_shouldYield = function () {
    return false;
  };

  requestPaint = exports.unstable_forceFrameRate = function () {};
} else {
  // Capture local references to native APIs, in case a polyfill overrides them.
  var _setTimeout = window.setTimeout;
  var _clearTimeout = window.clearTimeout;

  if (typeof console !== 'undefined') {
    // TODO: Scheduler no longer requires these methods to be polyfilled. But
    // maybe we want to continue warning if they don't exist, to preserve the
    // option to rely on it in the future?
    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;

    if (typeof requestAnimationFrame !== 'function') {
      // Using console['error'] to evade Babel and ESLint
      console['error']("This browser doesn't support requestAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://reactjs.org/link/react-polyfills');
    }

    if (typeof cancelAnimationFrame !== 'function') {
      // Using console['error'] to evade Babel and ESLint
      console['error']("This browser doesn't support cancelAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://reactjs.org/link/react-polyfills');
    }
  }

  var isMessageLoopRunning = false;
  var scheduledHostCallback = null;
  var taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
  // thread, like user events. By default, it yields multiple times per frame.
  // It does not attempt to align with frame boundaries, since most tasks don't
  // need to be frame aligned; for those that do, use requestAnimationFrame.

  var yieldInterval = 5;
  var deadline = 0; // TODO: Make this configurable

  {
    // `isInputPending` is not available. Since we have no way of knowing if
    // there's pending input, always yield at the end of the frame.
    exports.unstable_shouldYield = function () {
      return exports.unstable_now() >= deadline;
    }; // Since we yield every frame regardless, `requestPaint` has no effect.


    requestPaint = function () {};
  }

  exports.unstable_forceFrameRate = function (fps) {
    if (fps < 0 || fps > 125) {
      // Using console['error'] to evade Babel and ESLint
      console['error']('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing frame rates higher than 125 fps is not supported');
      return;
    }

    if (fps > 0) {
      yieldInterval = Math.floor(1000 / fps);
    } else {
      // reset the framerate
      yieldInterval = 5;
    }
  };

  var performWorkUntilDeadline = function () {
    if (scheduledHostCallback !== null) {
      var currentTime = exports.unstable_now(); // Yield after `yieldInterval` ms, regardless of where we are in the vsync
      // cycle. This means there's always time remaining at the beginning of
      // the message event.

      deadline = currentTime + yieldInterval;
      var hasTimeRemaining = true;

      try {
        var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

        if (!hasMoreWork) {
          isMessageLoopRunning = false;
          scheduledHostCallback = null;
        } else {
          // If there's more work, schedule the next message event at the end
          // of the preceding one.
          port.postMessage(null);
        }
      } catch (error) {
        // If a scheduler task throws, exit the current browser task so the
        // error can be observed.
        port.postMessage(null);
        throw error;
      }
    } else {
      isMessageLoopRunning = false;
    } // Yielding to the browser will give it a chance to paint, so we can
  };

  var channel = new MessageChannel();
  var port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;

  requestHostCallback = function (callback) {
    scheduledHostCallback = callback;

    if (!isMessageLoopRunning) {
      isMessageLoopRunning = true;
      port.postMessage(null);
    }
  };

  requestHostTimeout = function (callback, ms) {
    taskTimeoutID = _setTimeout(function () {
      callback(exports.unstable_now());
    }, ms);
  };

  cancelHostTimeout = function () {
    _clearTimeout(taskTimeoutID);

    taskTimeoutID = -1;
  };
}

function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}
function peek(heap) {
  var first = heap[0];
  return first === undefined ? null : first;
}
function pop(heap) {
  var first = heap[0];

  if (first !== undefined) {
    var last = heap.pop();

    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }

    return first;
  } else {
    return null;
  }
}

function siftUp(heap, node, i) {
  var index = i;

  while (true) {
    var parentIndex = index - 1 >>> 1;
    var parent = heap[parentIndex];

    if (parent !== undefined && compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, i) {
  var index = i;
  var length = heap.length;

  while (index < length) {
    var leftIndex = (index + 1) * 2 - 1;
    var left = heap[leftIndex];
    var rightIndex = leftIndex + 1;
    var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

    if (left !== undefined && compare(left, node) < 0) {
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  var diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

// TODO: Use symbols?
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;

function markTaskErrored(task, ms) {
}

/* eslint-disable no-var */
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111

var maxSigned31BitInt = 1073741823; // Times out immediately

var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // Tasks are stored on a min heap

var taskQueue = [];
var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
var currentTask = null;
var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrancy.

var isPerformingWork = false;
var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;

function advanceTimers(currentTime) {
  // Check for tasks that are no longer delayed and add them to the queue.
  var timer = peek(timerQueue);

  while (timer !== null) {
    if (timer.callback === null) {
      // Timer was cancelled.
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // Timer fired. Transfer to the task queue.
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // Remaining timers are pending.
      return;
    }

    timer = peek(timerQueue);
  }
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

function flushWork(hasTimeRemaining, initialTime) {


  isHostCallbackScheduled = false;

  if (isHostTimeoutScheduled) {
    // We scheduled a timeout but it's no longer needed. Cancel it.
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  isPerformingWork = true;
  var previousPriorityLevel = currentPriorityLevel;

  try {
    if (enableProfiling) {
      try {
        return workLoop(hasTimeRemaining, initialTime);
      } catch (error) {
        if (currentTask !== null) {
          var currentTime = exports.unstable_now();
          markTaskErrored(currentTask, currentTime);
          currentTask.isQueued = false;
        }

        throw error;
      }
    } else {
      // No catch in prod code path.
      return workLoop(hasTimeRemaining, initialTime);
    }
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

function workLoop(hasTimeRemaining, initialTime) {
  var currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);

  while (currentTask !== null && !(enableSchedulerDebugging )) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || exports.unstable_shouldYield())) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }

    var callback = currentTask.callback;

    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

      var continuationCallback = callback(didUserCallbackTimeout);
      currentTime = exports.unstable_now();

      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
      } else {

        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }

      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  } // Return whether there's additional work


  if (currentTask !== null) {
    return true;
  } else {
    var firstTimer = peek(timerQueue);

    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }

    return false;
  }
}

function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;

    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

function unstable_next(eventHandler) {
  var priorityLevel;

  switch (currentPriorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
      // Shift down to normal priority
      priorityLevel = NormalPriority;
      break;

    default:
      // Anything lower than normal priority should remain at the current level.
      priorityLevel = currentPriorityLevel;
      break;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

function unstable_wrapCallback(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function () {
    // This is a fork of runWithPriority, inlined for performance.
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;

    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
}

function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = exports.unstable_now();
  var startTime;

  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;

    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  var timeout;

  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;

    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;

    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;

    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;

    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  var expirationTime = startTime + timeout;
  var newTask = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: startTime,
    expirationTime: expirationTime,
    sortIndex: -1
  };

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);

    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      } // Schedule a timeout.


      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // wait until the next time we yield.


    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}

function unstable_pauseExecution() {
}

function unstable_continueExecution() {

  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
}

function unstable_getFirstCallbackNode() {
  return peek(taskQueue);
}

function unstable_cancelCallback(task) {
  // remove from the queue because you can't remove arbitrary nodes from an
  // array based heap, only the first one.)


  task.callback = null;
}

function unstable_getCurrentPriorityLevel() {
  return currentPriorityLevel;
}

var unstable_requestPaint = requestPaint;
var unstable_Profiling =  null;

exports.unstable_IdlePriority = IdlePriority;
exports.unstable_ImmediatePriority = ImmediatePriority;
exports.unstable_LowPriority = LowPriority;
exports.unstable_NormalPriority = NormalPriority;
exports.unstable_Profiling = unstable_Profiling;
exports.unstable_UserBlockingPriority = UserBlockingPriority;
exports.unstable_cancelCallback = unstable_cancelCallback;
exports.unstable_continueExecution = unstable_continueExecution;
exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
exports.unstable_next = unstable_next;
exports.unstable_pauseExecution = unstable_pauseExecution;
exports.unstable_requestPaint = unstable_requestPaint;
exports.unstable_runWithPriority = unstable_runWithPriority;
exports.unstable_scheduleCallback = unstable_scheduleCallback;
exports.unstable_wrapCallback = unstable_wrapCallback;
  })();
}


/***/ }),

/***/ "./node_modules/scheduler/index.js":
/*!*****************************************!*\
  !*** ./node_modules/scheduler/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/scheduler.development.js */ "./node_modules/scheduler/cjs/scheduler.development.js");
}


/***/ }),

/***/ "./node_modules/scheduler/tracing.js":
/*!*******************************************!*\
  !*** ./node_modules/scheduler/tracing.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/scheduler-tracing.development.js */ "./node_modules/scheduler/cjs/scheduler-tracing.development.js");
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLm5wbS5zY2hlZHVsZXIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUMxVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDcm9CQTtBQUNBO0FBQ0E7QUFHQTtBQUNBOzs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUdBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udGVuZC8uL25vZGVfbW9kdWxlcy9zY2hlZHVsZXIvY2pzL3NjaGVkdWxlci10cmFjaW5nLmRldmVsb3BtZW50LmpzIiwid2VicGFjazovL2Zyb250ZW5kLy4vbm9kZV9tb2R1bGVzL3NjaGVkdWxlci9janMvc2NoZWR1bGVyLmRldmVsb3BtZW50LmpzIiwid2VicGFjazovL2Zyb250ZW5kLy4vbm9kZV9tb2R1bGVzL3NjaGVkdWxlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9mcm9udGVuZC8uL25vZGVfbW9kdWxlcy9zY2hlZHVsZXIvdHJhY2luZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGxpY2Vuc2UgUmVhY3QgdjAuMjAuMlxuICogc2NoZWR1bGVyLXRyYWNpbmcuZGV2ZWxvcG1lbnQuanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgREVGQVVMVF9USFJFQURfSUQgPSAwOyAvLyBDb3VudGVycyB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMuXG5cbnZhciBpbnRlcmFjdGlvbklEQ291bnRlciA9IDA7XG52YXIgdGhyZWFkSURDb3VudGVyID0gMDsgLy8gU2V0IG9mIGN1cnJlbnRseSB0cmFjZWQgaW50ZXJhY3Rpb25zLlxuLy8gSW50ZXJhY3Rpb25zIFwic3RhY2tcIuKAk1xuLy8gTWVhbmluZyB0aGF0IG5ld2x5IHRyYWNlZCBpbnRlcmFjdGlvbnMgYXJlIGFwcGVuZGVkIHRvIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBzZXQuXG4vLyBXaGVuIGFuIGludGVyYWN0aW9uIGdvZXMgb3V0IG9mIHNjb3BlLCB0aGUgcHJldmlvdXMgc2V0IChpZiBhbnkpIGlzIHJlc3RvcmVkLlxuXG5leHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmID0gbnVsbDsgLy8gTGlzdGVuZXIocykgdG8gbm90aWZ5IHdoZW4gaW50ZXJhY3Rpb25zIGJlZ2luIGFuZCBlbmQuXG5cbmV4cG9ydHMuX19zdWJzY3JpYmVyUmVmID0gbnVsbDtcblxue1xuICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmID0ge1xuICAgIGN1cnJlbnQ6IG5ldyBTZXQoKVxuICB9O1xuICBleHBvcnRzLl9fc3Vic2NyaWJlclJlZiA9IHtcbiAgICBjdXJyZW50OiBudWxsXG4gIH07XG59XG5mdW5jdGlvbiB1bnN0YWJsZV9jbGVhcihjYWxsYmFjaykge1xuXG4gIHZhciBwcmV2SW50ZXJhY3Rpb25zID0gZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50O1xuICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBuZXcgU2V0KCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBwcmV2SW50ZXJhY3Rpb25zO1xuICB9XG59XG5mdW5jdGlvbiB1bnN0YWJsZV9nZXRDdXJyZW50KCkge1xuICB7XG4gICAgcmV0dXJuIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgfVxufVxuZnVuY3Rpb24gdW5zdGFibGVfZ2V0VGhyZWFkSUQoKSB7XG4gIHJldHVybiArK3RocmVhZElEQ291bnRlcjtcbn1cbmZ1bmN0aW9uIHVuc3RhYmxlX3RyYWNlKG5hbWUsIHRpbWVzdGFtcCwgY2FsbGJhY2spIHtcbiAgdmFyIHRocmVhZElEID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBERUZBVUxUX1RIUkVBRF9JRDtcblxuICB2YXIgaW50ZXJhY3Rpb24gPSB7XG4gICAgX19jb3VudDogMSxcbiAgICBpZDogaW50ZXJhY3Rpb25JRENvdW50ZXIrKyxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHRpbWVzdGFtcDogdGltZXN0YW1wXG4gIH07XG4gIHZhciBwcmV2SW50ZXJhY3Rpb25zID0gZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50OyAvLyBUcmFjZWQgaW50ZXJhY3Rpb25zIHNob3VsZCBzdGFjay9hY2N1bXVsYXRlLlxuICAvLyBUbyBkbyB0aGF0LCBjbG9uZSB0aGUgY3VycmVudCBpbnRlcmFjdGlvbnMuXG4gIC8vIFRoZSBwcmV2aW91cyBzZXQgd2lsbCBiZSByZXN0b3JlZCB1cG9uIGNvbXBsZXRpb24uXG5cbiAgdmFyIGludGVyYWN0aW9ucyA9IG5ldyBTZXQocHJldkludGVyYWN0aW9ucyk7XG4gIGludGVyYWN0aW9ucy5hZGQoaW50ZXJhY3Rpb24pO1xuICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBpbnRlcmFjdGlvbnM7XG4gIHZhciBzdWJzY3JpYmVyID0gZXhwb3J0cy5fX3N1YnNjcmliZXJSZWYuY3VycmVudDtcbiAgdmFyIHJldHVyblZhbHVlO1xuXG4gIHRyeSB7XG4gICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblRyYWNlZChpbnRlcmFjdGlvbik7XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgICBzdWJzY3JpYmVyLm9uV29ya1N0YXJ0ZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVyblZhbHVlID0gY2FsbGJhY2soKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IHByZXZJbnRlcmFjdGlvbnM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdG9wcGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpbnRlcmFjdGlvbi5fX2NvdW50LS07IC8vIElmIG5vIGFzeW5jIHdvcmsgd2FzIHNjaGVkdWxlZCBmb3IgdGhpcyBpbnRlcmFjdGlvbixcbiAgICAgICAgICAvLyBOb3RpZnkgc3Vic2NyaWJlcnMgdGhhdCBpdCdzIGNvbXBsZXRlZC5cblxuICAgICAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsICYmIGludGVyYWN0aW9uLl9fY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXR1cm5WYWx1ZTtcbn1cbmZ1bmN0aW9uIHVuc3RhYmxlX3dyYXAoY2FsbGJhY2spIHtcbiAgdmFyIHRocmVhZElEID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBERUZBVUxUX1RIUkVBRF9JRDtcblxuICB2YXIgd3JhcHBlZEludGVyYWN0aW9ucyA9IGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgdmFyIHN1YnNjcmliZXIgPSBleHBvcnRzLl9fc3Vic2NyaWJlclJlZi5jdXJyZW50O1xuXG4gIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgc3Vic2NyaWJlci5vbldvcmtTY2hlZHVsZWQod3JhcHBlZEludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICB9IC8vIFVwZGF0ZSB0aGUgcGVuZGluZyBhc3luYyB3b3JrIGNvdW50IGZvciB0aGUgY3VycmVudCBpbnRlcmFjdGlvbnMuXG4gIC8vIFVwZGF0ZSBhZnRlciBjYWxsaW5nIHN1YnNjcmliZXJzIGluIGNhc2Ugb2YgZXJyb3IuXG5cblxuICB3cmFwcGVkSW50ZXJhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGludGVyYWN0aW9uKSB7XG4gICAgaW50ZXJhY3Rpb24uX19jb3VudCsrO1xuICB9KTtcbiAgdmFyIGhhc1J1biA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIHdyYXBwZWQoKSB7XG4gICAgdmFyIHByZXZJbnRlcmFjdGlvbnMgPSBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQ7XG4gICAgZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50ID0gd3JhcHBlZEludGVyYWN0aW9ucztcbiAgICBzdWJzY3JpYmVyID0gZXhwb3J0cy5fX3N1YnNjcmliZXJSZWYuY3VycmVudDtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmV0dXJuVmFsdWU7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdGFydGVkKHdyYXBwZWRJbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBwcmV2SW50ZXJhY3Rpb25zO1xuXG4gICAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25Xb3JrU3RvcHBlZCh3cmFwcGVkSW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKCFoYXNSdW4pIHtcbiAgICAgICAgLy8gV2Ugb25seSBleHBlY3QgYSB3cmFwcGVkIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9uY2UsXG4gICAgICAgIC8vIEJ1dCBpbiB0aGUgZXZlbnQgdGhhdCBpdCdzIGV4ZWN1dGVkIG1vcmUgdGhhbiBvbmNl4oCTXG4gICAgICAgIC8vIE9ubHkgZGVjcmVtZW50IHRoZSBvdXRzdGFuZGluZyBpbnRlcmFjdGlvbiBjb3VudHMgb25jZS5cbiAgICAgICAgaGFzUnVuID0gdHJ1ZTsgLy8gVXBkYXRlIHBlbmRpbmcgYXN5bmMgY291bnRzIGZvciBhbGwgd3JhcHBlZCBpbnRlcmFjdGlvbnMuXG4gICAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IHNjaGVkdWxlZCBhc3luYyB3b3JrIGZvciBhbnkgb2YgdGhlbSxcbiAgICAgICAgLy8gTWFyayB0aGVtIGFzIGNvbXBsZXRlZC5cblxuICAgICAgICB3cmFwcGVkSW50ZXJhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGludGVyYWN0aW9uKSB7XG4gICAgICAgICAgaW50ZXJhY3Rpb24uX19jb3VudC0tO1xuXG4gICAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwgJiYgaW50ZXJhY3Rpb24uX19jb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB3cmFwcGVkLmNhbmNlbCA9IGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBzdWJzY3JpYmVyID0gZXhwb3J0cy5fX3N1YnNjcmliZXJSZWYuY3VycmVudDtcblxuICAgIHRyeSB7XG4gICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgICBzdWJzY3JpYmVyLm9uV29ya0NhbmNlbGVkKHdyYXBwZWRJbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gVXBkYXRlIHBlbmRpbmcgYXN5bmMgY291bnRzIGZvciBhbGwgd3JhcHBlZCBpbnRlcmFjdGlvbnMuXG4gICAgICAvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBzY2hlZHVsZWQgYXN5bmMgd29yayBmb3IgYW55IG9mIHRoZW0sXG4gICAgICAvLyBNYXJrIHRoZW0gYXMgY29tcGxldGVkLlxuICAgICAgd3JhcHBlZEludGVyYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpbnRlcmFjdGlvbikge1xuICAgICAgICBpbnRlcmFjdGlvbi5fX2NvdW50LS07XG5cbiAgICAgICAgaWYgKHN1YnNjcmliZXIgJiYgaW50ZXJhY3Rpb24uX19jb3VudCA9PT0gMCkge1xuICAgICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbnZhciBzdWJzY3JpYmVycyA9IG51bGw7XG5cbntcbiAgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX3N1YnNjcmliZShzdWJzY3JpYmVyKSB7XG4gIHtcbiAgICBzdWJzY3JpYmVycy5hZGQoc3Vic2NyaWJlcik7XG5cbiAgICBpZiAoc3Vic2NyaWJlcnMuc2l6ZSA9PT0gMSkge1xuICAgICAgZXhwb3J0cy5fX3N1YnNjcmliZXJSZWYuY3VycmVudCA9IHtcbiAgICAgICAgb25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQ6IG9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkLFxuICAgICAgICBvbkludGVyYWN0aW9uVHJhY2VkOiBvbkludGVyYWN0aW9uVHJhY2VkLFxuICAgICAgICBvbldvcmtDYW5jZWxlZDogb25Xb3JrQ2FuY2VsZWQsXG4gICAgICAgIG9uV29ya1NjaGVkdWxlZDogb25Xb3JrU2NoZWR1bGVkLFxuICAgICAgICBvbldvcmtTdGFydGVkOiBvbldvcmtTdGFydGVkLFxuICAgICAgICBvbldvcmtTdG9wcGVkOiBvbldvcmtTdG9wcGVkXG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gdW5zdGFibGVfdW5zdWJzY3JpYmUoc3Vic2NyaWJlcikge1xuICB7XG4gICAgc3Vic2NyaWJlcnMuZGVsZXRlKHN1YnNjcmliZXIpO1xuXG4gICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDApIHtcbiAgICAgIGV4cG9ydHMuX19zdWJzY3JpYmVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBvbkludGVyYWN0aW9uVHJhY2VkKGludGVyYWN0aW9uKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uVHJhY2VkKGludGVyYWN0aW9uKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCFkaWRDYXRjaEVycm9yKSB7XG4gICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGRpZENhdGNoRXJyb3IpIHtcbiAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbikge1xuICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICB2YXIgY2F1Z2h0RXJyb3IgPSBudWxsO1xuICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgIHRocm93IGNhdWdodEVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uV29ya1NjaGVkdWxlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbldvcmtTY2hlZHVsZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICghZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgY2F1Z2h0RXJyb3IgPSBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmIChkaWRDYXRjaEVycm9yKSB7XG4gICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Xb3JrU3RhcnRlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbldvcmtTdGFydGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgIHRocm93IGNhdWdodEVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uV29ya1N0b3BwZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCkge1xuICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICB2YXIgY2F1Z2h0RXJyb3IgPSBudWxsO1xuICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN1YnNjcmliZXIub25Xb3JrU3RvcHBlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCFkaWRDYXRjaEVycm9yKSB7XG4gICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGRpZENhdGNoRXJyb3IpIHtcbiAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbldvcmtDYW5jZWxlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbldvcmtDYW5jZWxlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCFkaWRDYXRjaEVycm9yKSB7XG4gICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGRpZENhdGNoRXJyb3IpIHtcbiAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgfVxufVxuXG5leHBvcnRzLnVuc3RhYmxlX2NsZWFyID0gdW5zdGFibGVfY2xlYXI7XG5leHBvcnRzLnVuc3RhYmxlX2dldEN1cnJlbnQgPSB1bnN0YWJsZV9nZXRDdXJyZW50O1xuZXhwb3J0cy51bnN0YWJsZV9nZXRUaHJlYWRJRCA9IHVuc3RhYmxlX2dldFRocmVhZElEO1xuZXhwb3J0cy51bnN0YWJsZV9zdWJzY3JpYmUgPSB1bnN0YWJsZV9zdWJzY3JpYmU7XG5leHBvcnRzLnVuc3RhYmxlX3RyYWNlID0gdW5zdGFibGVfdHJhY2U7XG5leHBvcnRzLnVuc3RhYmxlX3Vuc3Vic2NyaWJlID0gdW5zdGFibGVfdW5zdWJzY3JpYmU7XG5leHBvcnRzLnVuc3RhYmxlX3dyYXAgPSB1bnN0YWJsZV93cmFwO1xuICB9KSgpO1xufVxuIiwiLyoqIEBsaWNlbnNlIFJlYWN0IHYwLjIwLjJcbiAqIHNjaGVkdWxlci5kZXZlbG9wbWVudC5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBlbmFibGVTY2hlZHVsZXJEZWJ1Z2dpbmcgPSBmYWxzZTtcbnZhciBlbmFibGVQcm9maWxpbmcgPSBmYWxzZTtcblxudmFyIHJlcXVlc3RIb3N0Q2FsbGJhY2s7XG52YXIgcmVxdWVzdEhvc3RUaW1lb3V0O1xudmFyIGNhbmNlbEhvc3RUaW1lb3V0O1xudmFyIHJlcXVlc3RQYWludDtcbnZhciBoYXNQZXJmb3JtYW5jZU5vdyA9IHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJztcblxuaWYgKGhhc1BlcmZvcm1hbmNlTm93KSB7XG4gIHZhciBsb2NhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG5cbiAgZXhwb3J0cy51bnN0YWJsZV9ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxvY2FsUGVyZm9ybWFuY2Uubm93KCk7XG4gIH07XG59IGVsc2Uge1xuICB2YXIgbG9jYWxEYXRlID0gRGF0ZTtcbiAgdmFyIGluaXRpYWxUaW1lID0gbG9jYWxEYXRlLm5vdygpO1xuXG4gIGV4cG9ydHMudW5zdGFibGVfbm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsb2NhbERhdGUubm93KCkgLSBpbml0aWFsVGltZTtcbiAgfTtcbn1cblxuaWYgKCAvLyBJZiBTY2hlZHVsZXIgcnVucyBpbiBhIG5vbi1ET00gZW52aXJvbm1lbnQsIGl0IGZhbGxzIGJhY2sgdG8gYSBuYWl2ZVxuLy8gaW1wbGVtZW50YXRpb24gdXNpbmcgc2V0VGltZW91dC5cbnR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IC8vIENoZWNrIGlmIE1lc3NhZ2VDaGFubmVsIGlzIHN1cHBvcnRlZCwgdG9vLlxudHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAnZnVuY3Rpb24nKSB7XG4gIC8vIElmIHRoaXMgYWNjaWRlbnRhbGx5IGdldHMgaW1wb3J0ZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudCwgZS5nLiBKYXZhU2NyaXB0Q29yZSxcbiAgLy8gZmFsbGJhY2sgdG8gYSBuYWl2ZSBpbXBsZW1lbnRhdGlvbi5cbiAgdmFyIF9jYWxsYmFjayA9IG51bGw7XG4gIHZhciBfdGltZW91dElEID0gbnVsbDtcblxuICB2YXIgX2ZsdXNoQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF9jYWxsYmFjayAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZXhwb3J0cy51bnN0YWJsZV9ub3coKTtcbiAgICAgICAgdmFyIGhhc1JlbWFpbmluZ1RpbWUgPSB0cnVlO1xuXG4gICAgICAgIF9jYWxsYmFjayhoYXNSZW1haW5pbmdUaW1lLCBjdXJyZW50VGltZSk7XG5cbiAgICAgICAgX2NhbGxiYWNrID0gbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0VGltZW91dChfZmx1c2hDYWxsYmFjaywgMCk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJlcXVlc3RIb3N0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICBpZiAoX2NhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICAvLyBQcm90ZWN0IGFnYWluc3QgcmUtZW50cmFuY3kuXG4gICAgICBzZXRUaW1lb3V0KHJlcXVlc3RIb3N0Q2FsbGJhY2ssIDAsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX2NhbGxiYWNrID0gY2I7XG4gICAgICBzZXRUaW1lb3V0KF9mbHVzaENhbGxiYWNrLCAwKTtcbiAgICB9XG4gIH07XG5cbiAgcmVxdWVzdEhvc3RUaW1lb3V0ID0gZnVuY3Rpb24gKGNiLCBtcykge1xuICAgIF90aW1lb3V0SUQgPSBzZXRUaW1lb3V0KGNiLCBtcyk7XG4gIH07XG5cbiAgY2FuY2VsSG9zdFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KF90aW1lb3V0SUQpO1xuICB9O1xuXG4gIGV4cG9ydHMudW5zdGFibGVfc2hvdWxkWWllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHJlcXVlc3RQYWludCA9IGV4cG9ydHMudW5zdGFibGVfZm9yY2VGcmFtZVJhdGUgPSBmdW5jdGlvbiAoKSB7fTtcbn0gZWxzZSB7XG4gIC8vIENhcHR1cmUgbG9jYWwgcmVmZXJlbmNlcyB0byBuYXRpdmUgQVBJcywgaW4gY2FzZSBhIHBvbHlmaWxsIG92ZXJyaWRlcyB0aGVtLlxuICB2YXIgX3NldFRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dDtcbiAgdmFyIF9jbGVhclRpbWVvdXQgPSB3aW5kb3cuY2xlYXJUaW1lb3V0O1xuXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBUT0RPOiBTY2hlZHVsZXIgbm8gbG9uZ2VyIHJlcXVpcmVzIHRoZXNlIG1ldGhvZHMgdG8gYmUgcG9seWZpbGxlZC4gQnV0XG4gICAgLy8gbWF5YmUgd2Ugd2FudCB0byBjb250aW51ZSB3YXJuaW5nIGlmIHRoZXkgZG9uJ3QgZXhpc3QsIHRvIHByZXNlcnZlIHRoZVxuICAgIC8vIG9wdGlvbiB0byByZWx5IG9uIGl0IGluIHRoZSBmdXR1cmU/XG4gICAgdmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgdmFyIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIFVzaW5nIGNvbnNvbGVbJ2Vycm9yJ10gdG8gZXZhZGUgQmFiZWwgYW5kIEVTTGludFxuICAgICAgY29uc29sZVsnZXJyb3InXShcIlRoaXMgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLiBcIiArICdNYWtlIHN1cmUgdGhhdCB5b3UgbG9hZCBhICcgKyAncG9seWZpbGwgaW4gb2xkZXIgYnJvd3NlcnMuIGh0dHBzOi8vcmVhY3Rqcy5vcmcvbGluay9yZWFjdC1wb2x5ZmlsbHMnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNhbmNlbEFuaW1hdGlvbkZyYW1lICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBVc2luZyBjb25zb2xlWydlcnJvciddIHRvIGV2YWRlIEJhYmVsIGFuZCBFU0xpbnRcbiAgICAgIGNvbnNvbGVbJ2Vycm9yJ10oXCJUaGlzIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IGNhbmNlbEFuaW1hdGlvbkZyYW1lLiBcIiArICdNYWtlIHN1cmUgdGhhdCB5b3UgbG9hZCBhICcgKyAncG9seWZpbGwgaW4gb2xkZXIgYnJvd3NlcnMuIGh0dHBzOi8vcmVhY3Rqcy5vcmcvbGluay9yZWFjdC1wb2x5ZmlsbHMnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSBmYWxzZTtcbiAgdmFyIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IG51bGw7XG4gIHZhciB0YXNrVGltZW91dElEID0gLTE7IC8vIFNjaGVkdWxlciBwZXJpb2RpY2FsbHkgeWllbGRzIGluIGNhc2UgdGhlcmUgaXMgb3RoZXIgd29yayBvbiB0aGUgbWFpblxuICAvLyB0aHJlYWQsIGxpa2UgdXNlciBldmVudHMuIEJ5IGRlZmF1bHQsIGl0IHlpZWxkcyBtdWx0aXBsZSB0aW1lcyBwZXIgZnJhbWUuXG4gIC8vIEl0IGRvZXMgbm90IGF0dGVtcHQgdG8gYWxpZ24gd2l0aCBmcmFtZSBib3VuZGFyaWVzLCBzaW5jZSBtb3N0IHRhc2tzIGRvbid0XG4gIC8vIG5lZWQgdG8gYmUgZnJhbWUgYWxpZ25lZDsgZm9yIHRob3NlIHRoYXQgZG8sIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuXG5cbiAgdmFyIHlpZWxkSW50ZXJ2YWwgPSA1O1xuICB2YXIgZGVhZGxpbmUgPSAwOyAvLyBUT0RPOiBNYWtlIHRoaXMgY29uZmlndXJhYmxlXG5cbiAge1xuICAgIC8vIGBpc0lucHV0UGVuZGluZ2AgaXMgbm90IGF2YWlsYWJsZS4gU2luY2Ugd2UgaGF2ZSBubyB3YXkgb2Yga25vd2luZyBpZlxuICAgIC8vIHRoZXJlJ3MgcGVuZGluZyBpbnB1dCwgYWx3YXlzIHlpZWxkIGF0IHRoZSBlbmQgb2YgdGhlIGZyYW1lLlxuICAgIGV4cG9ydHMudW5zdGFibGVfc2hvdWxkWWllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy51bnN0YWJsZV9ub3coKSA+PSBkZWFkbGluZTtcbiAgICB9OyAvLyBTaW5jZSB3ZSB5aWVsZCBldmVyeSBmcmFtZSByZWdhcmRsZXNzLCBgcmVxdWVzdFBhaW50YCBoYXMgbm8gZWZmZWN0LlxuXG5cbiAgICByZXF1ZXN0UGFpbnQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgfVxuXG4gIGV4cG9ydHMudW5zdGFibGVfZm9yY2VGcmFtZVJhdGUgPSBmdW5jdGlvbiAoZnBzKSB7XG4gICAgaWYgKGZwcyA8IDAgfHwgZnBzID4gMTI1KSB7XG4gICAgICAvLyBVc2luZyBjb25zb2xlWydlcnJvciddIHRvIGV2YWRlIEJhYmVsIGFuZCBFU0xpbnRcbiAgICAgIGNvbnNvbGVbJ2Vycm9yJ10oJ2ZvcmNlRnJhbWVSYXRlIHRha2VzIGEgcG9zaXRpdmUgaW50IGJldHdlZW4gMCBhbmQgMTI1LCAnICsgJ2ZvcmNpbmcgZnJhbWUgcmF0ZXMgaGlnaGVyIHRoYW4gMTI1IGZwcyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGZwcyA+IDApIHtcbiAgICAgIHlpZWxkSW50ZXJ2YWwgPSBNYXRoLmZsb29yKDEwMDAgLyBmcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXNldCB0aGUgZnJhbWVyYXRlXG4gICAgICB5aWVsZEludGVydmFsID0gNTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHBlcmZvcm1Xb3JrVW50aWxEZWFkbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2NoZWR1bGVkSG9zdENhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICB2YXIgY3VycmVudFRpbWUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpOyAvLyBZaWVsZCBhZnRlciBgeWllbGRJbnRlcnZhbGAgbXMsIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgd2UgYXJlIGluIHRoZSB2c3luY1xuICAgICAgLy8gY3ljbGUuIFRoaXMgbWVhbnMgdGhlcmUncyBhbHdheXMgdGltZSByZW1haW5pbmcgYXQgdGhlIGJlZ2lubmluZyBvZlxuICAgICAgLy8gdGhlIG1lc3NhZ2UgZXZlbnQuXG5cbiAgICAgIGRlYWRsaW5lID0gY3VycmVudFRpbWUgKyB5aWVsZEludGVydmFsO1xuICAgICAgdmFyIGhhc1RpbWVSZW1haW5pbmcgPSB0cnVlO1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaGFzTW9yZVdvcmsgPSBzY2hlZHVsZWRIb3N0Q2FsbGJhY2soaGFzVGltZVJlbWFpbmluZywgY3VycmVudFRpbWUpO1xuXG4gICAgICAgIGlmICghaGFzTW9yZVdvcmspIHtcbiAgICAgICAgICBpc01lc3NhZ2VMb29wUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUncyBtb3JlIHdvcmssIHNjaGVkdWxlIHRoZSBuZXh0IG1lc3NhZ2UgZXZlbnQgYXQgdGhlIGVuZFxuICAgICAgICAgIC8vIG9mIHRoZSBwcmVjZWRpbmcgb25lLlxuICAgICAgICAgIHBvcnQucG9zdE1lc3NhZ2UobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIElmIGEgc2NoZWR1bGVyIHRhc2sgdGhyb3dzLCBleGl0IHRoZSBjdXJyZW50IGJyb3dzZXIgdGFzayBzbyB0aGVcbiAgICAgICAgLy8gZXJyb3IgY2FuIGJlIG9ic2VydmVkLlxuICAgICAgICBwb3J0LnBvc3RNZXNzYWdlKG51bGwpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9IC8vIFlpZWxkaW5nIHRvIHRoZSBicm93c2VyIHdpbGwgZ2l2ZSBpdCBhIGNoYW5jZSB0byBwYWludCwgc28gd2UgY2FuXG4gIH07XG5cbiAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgdmFyIHBvcnQgPSBjaGFubmVsLnBvcnQyO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IHBlcmZvcm1Xb3JrVW50aWxEZWFkbGluZTtcblxuICByZXF1ZXN0SG9zdENhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgc2NoZWR1bGVkSG9zdENhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICBpZiAoIWlzTWVzc2FnZUxvb3BSdW5uaW5nKSB7XG4gICAgICBpc01lc3NhZ2VMb29wUnVubmluZyA9IHRydWU7XG4gICAgICBwb3J0LnBvc3RNZXNzYWdlKG51bGwpO1xuICAgIH1cbiAgfTtcblxuICByZXF1ZXN0SG9zdFRpbWVvdXQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIG1zKSB7XG4gICAgdGFza1RpbWVvdXRJRCA9IF9zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKGV4cG9ydHMudW5zdGFibGVfbm93KCkpO1xuICAgIH0sIG1zKTtcbiAgfTtcblxuICBjYW5jZWxIb3N0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBfY2xlYXJUaW1lb3V0KHRhc2tUaW1lb3V0SUQpO1xuXG4gICAgdGFza1RpbWVvdXRJRCA9IC0xO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwdXNoKGhlYXAsIG5vZGUpIHtcbiAgdmFyIGluZGV4ID0gaGVhcC5sZW5ndGg7XG4gIGhlYXAucHVzaChub2RlKTtcbiAgc2lmdFVwKGhlYXAsIG5vZGUsIGluZGV4KTtcbn1cbmZ1bmN0aW9uIHBlZWsoaGVhcCkge1xuICB2YXIgZmlyc3QgPSBoZWFwWzBdO1xuICByZXR1cm4gZmlyc3QgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBmaXJzdDtcbn1cbmZ1bmN0aW9uIHBvcChoZWFwKSB7XG4gIHZhciBmaXJzdCA9IGhlYXBbMF07XG5cbiAgaWYgKGZpcnN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgbGFzdCA9IGhlYXAucG9wKCk7XG5cbiAgICBpZiAobGFzdCAhPT0gZmlyc3QpIHtcbiAgICAgIGhlYXBbMF0gPSBsYXN0O1xuICAgICAgc2lmdERvd24oaGVhcCwgbGFzdCwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNpZnRVcChoZWFwLCBub2RlLCBpKSB7XG4gIHZhciBpbmRleCA9IGk7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB2YXIgcGFyZW50SW5kZXggPSBpbmRleCAtIDEgPj4+IDE7XG4gICAgdmFyIHBhcmVudCA9IGhlYXBbcGFyZW50SW5kZXhdO1xuXG4gICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUocGFyZW50LCBub2RlKSA+IDApIHtcbiAgICAgIC8vIFRoZSBwYXJlbnQgaXMgbGFyZ2VyLiBTd2FwIHBvc2l0aW9ucy5cbiAgICAgIGhlYXBbcGFyZW50SW5kZXhdID0gbm9kZTtcbiAgICAgIGhlYXBbaW5kZXhdID0gcGFyZW50O1xuICAgICAgaW5kZXggPSBwYXJlbnRJbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIHBhcmVudCBpcyBzbWFsbGVyLiBFeGl0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaWZ0RG93bihoZWFwLCBub2RlLCBpKSB7XG4gIHZhciBpbmRleCA9IGk7XG4gIHZhciBsZW5ndGggPSBoZWFwLmxlbmd0aDtcblxuICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgbGVmdEluZGV4ID0gKGluZGV4ICsgMSkgKiAyIC0gMTtcbiAgICB2YXIgbGVmdCA9IGhlYXBbbGVmdEluZGV4XTtcbiAgICB2YXIgcmlnaHRJbmRleCA9IGxlZnRJbmRleCArIDE7XG4gICAgdmFyIHJpZ2h0ID0gaGVhcFtyaWdodEluZGV4XTsgLy8gSWYgdGhlIGxlZnQgb3IgcmlnaHQgbm9kZSBpcyBzbWFsbGVyLCBzd2FwIHdpdGggdGhlIHNtYWxsZXIgb2YgdGhvc2UuXG5cbiAgICBpZiAobGVmdCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUobGVmdCwgbm9kZSkgPCAwKSB7XG4gICAgICBpZiAocmlnaHQgIT09IHVuZGVmaW5lZCAmJiBjb21wYXJlKHJpZ2h0LCBsZWZ0KSA8IDApIHtcbiAgICAgICAgaGVhcFtpbmRleF0gPSByaWdodDtcbiAgICAgICAgaGVhcFtyaWdodEluZGV4XSA9IG5vZGU7XG4gICAgICAgIGluZGV4ID0gcmlnaHRJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhlYXBbaW5kZXhdID0gbGVmdDtcbiAgICAgICAgaGVhcFtsZWZ0SW5kZXhdID0gbm9kZTtcbiAgICAgICAgaW5kZXggPSBsZWZ0SW5kZXg7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyaWdodCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUocmlnaHQsIG5vZGUpIDwgMCkge1xuICAgICAgaGVhcFtpbmRleF0gPSByaWdodDtcbiAgICAgIGhlYXBbcmlnaHRJbmRleF0gPSBub2RlO1xuICAgICAgaW5kZXggPSByaWdodEluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZWl0aGVyIGNoaWxkIGlzIHNtYWxsZXIuIEV4aXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICAvLyBDb21wYXJlIHNvcnQgaW5kZXggZmlyc3QsIHRoZW4gdGFzayBpZC5cbiAgdmFyIGRpZmYgPSBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICByZXR1cm4gZGlmZiAhPT0gMCA/IGRpZmYgOiBhLmlkIC0gYi5pZDtcbn1cblxuLy8gVE9ETzogVXNlIHN5bWJvbHM/XG52YXIgSW1tZWRpYXRlUHJpb3JpdHkgPSAxO1xudmFyIFVzZXJCbG9ja2luZ1ByaW9yaXR5ID0gMjtcbnZhciBOb3JtYWxQcmlvcml0eSA9IDM7XG52YXIgTG93UHJpb3JpdHkgPSA0O1xudmFyIElkbGVQcmlvcml0eSA9IDU7XG5cbmZ1bmN0aW9uIG1hcmtUYXNrRXJyb3JlZCh0YXNrLCBtcykge1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby12YXIgKi9cbi8vIE1hdGgucG93KDIsIDMwKSAtIDFcbi8vIDBiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExXG5cbnZhciBtYXhTaWduZWQzMUJpdEludCA9IDEwNzM3NDE4MjM7IC8vIFRpbWVzIG91dCBpbW1lZGlhdGVseVxuXG52YXIgSU1NRURJQVRFX1BSSU9SSVRZX1RJTUVPVVQgPSAtMTsgLy8gRXZlbnR1YWxseSB0aW1lcyBvdXRcblxudmFyIFVTRVJfQkxPQ0tJTkdfUFJJT1JJVFlfVElNRU9VVCA9IDI1MDtcbnZhciBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVCA9IDUwMDA7XG52YXIgTE9XX1BSSU9SSVRZX1RJTUVPVVQgPSAxMDAwMDsgLy8gTmV2ZXIgdGltZXMgb3V0XG5cbnZhciBJRExFX1BSSU9SSVRZX1RJTUVPVVQgPSBtYXhTaWduZWQzMUJpdEludDsgLy8gVGFza3MgYXJlIHN0b3JlZCBvbiBhIG1pbiBoZWFwXG5cbnZhciB0YXNrUXVldWUgPSBbXTtcbnZhciB0aW1lclF1ZXVlID0gW107IC8vIEluY3JlbWVudGluZyBpZCBjb3VudGVyLiBVc2VkIHRvIG1haW50YWluIGluc2VydGlvbiBvcmRlci5cblxudmFyIHRhc2tJZENvdW50ZXIgPSAxOyAvLyBQYXVzaW5nIHRoZSBzY2hlZHVsZXIgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG52YXIgY3VycmVudFRhc2sgPSBudWxsO1xudmFyIGN1cnJlbnRQcmlvcml0eUxldmVsID0gTm9ybWFsUHJpb3JpdHk7IC8vIFRoaXMgaXMgc2V0IHdoaWxlIHBlcmZvcm1pbmcgd29yaywgdG8gcHJldmVudCByZS1lbnRyYW5jeS5cblxudmFyIGlzUGVyZm9ybWluZ1dvcmsgPSBmYWxzZTtcbnZhciBpc0hvc3RDYWxsYmFja1NjaGVkdWxlZCA9IGZhbHNlO1xudmFyIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSkge1xuICAvLyBDaGVjayBmb3IgdGFza3MgdGhhdCBhcmUgbm8gbG9uZ2VyIGRlbGF5ZWQgYW5kIGFkZCB0aGVtIHRvIHRoZSBxdWV1ZS5cbiAgdmFyIHRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcblxuICB3aGlsZSAodGltZXIgIT09IG51bGwpIHtcbiAgICBpZiAodGltZXIuY2FsbGJhY2sgPT09IG51bGwpIHtcbiAgICAgIC8vIFRpbWVyIHdhcyBjYW5jZWxsZWQuXG4gICAgICBwb3AodGltZXJRdWV1ZSk7XG4gICAgfSBlbHNlIGlmICh0aW1lci5zdGFydFRpbWUgPD0gY3VycmVudFRpbWUpIHtcbiAgICAgIC8vIFRpbWVyIGZpcmVkLiBUcmFuc2ZlciB0byB0aGUgdGFzayBxdWV1ZS5cbiAgICAgIHBvcCh0aW1lclF1ZXVlKTtcbiAgICAgIHRpbWVyLnNvcnRJbmRleCA9IHRpbWVyLmV4cGlyYXRpb25UaW1lO1xuICAgICAgcHVzaCh0YXNrUXVldWUsIHRpbWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVtYWluaW5nIHRpbWVycyBhcmUgcGVuZGluZy5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aW1lciA9IHBlZWsodGltZXJRdWV1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlVGltZW91dChjdXJyZW50VGltZSkge1xuICBpc0hvc3RUaW1lb3V0U2NoZWR1bGVkID0gZmFsc2U7XG4gIGFkdmFuY2VUaW1lcnMoY3VycmVudFRpbWUpO1xuXG4gIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQpIHtcbiAgICBpZiAocGVlayh0YXNrUXVldWUpICE9PSBudWxsKSB7XG4gICAgICBpc0hvc3RDYWxsYmFja1NjaGVkdWxlZCA9IHRydWU7XG4gICAgICByZXF1ZXN0SG9zdENhbGxiYWNrKGZsdXNoV29yayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaXJzdFRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcblxuICAgICAgaWYgKGZpcnN0VGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgcmVxdWVzdEhvc3RUaW1lb3V0KGhhbmRsZVRpbWVvdXQsIGZpcnN0VGltZXIuc3RhcnRUaW1lIC0gY3VycmVudFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmbHVzaFdvcmsoaGFzVGltZVJlbWFpbmluZywgaW5pdGlhbFRpbWUpIHtcblxuXG4gIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gZmFsc2U7XG5cbiAgaWYgKGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQpIHtcbiAgICAvLyBXZSBzY2hlZHVsZWQgYSB0aW1lb3V0IGJ1dCBpdCdzIG5vIGxvbmdlciBuZWVkZWQuIENhbmNlbCBpdC5cbiAgICBpc0hvc3RUaW1lb3V0U2NoZWR1bGVkID0gZmFsc2U7XG4gICAgY2FuY2VsSG9zdFRpbWVvdXQoKTtcbiAgfVxuXG4gIGlzUGVyZm9ybWluZ1dvcmsgPSB0cnVlO1xuICB2YXIgcHJldmlvdXNQcmlvcml0eUxldmVsID0gY3VycmVudFByaW9yaXR5TGV2ZWw7XG5cbiAgdHJ5IHtcbiAgICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gd29ya0xvb3AoaGFzVGltZVJlbWFpbmluZywgaW5pdGlhbFRpbWUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRUYXNrICE9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZXhwb3J0cy51bnN0YWJsZV9ub3coKTtcbiAgICAgICAgICBtYXJrVGFza0Vycm9yZWQoY3VycmVudFRhc2ssIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICBjdXJyZW50VGFzay5pc1F1ZXVlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIGNhdGNoIGluIHByb2QgY29kZSBwYXRoLlxuICAgICAgcmV0dXJuIHdvcmtMb29wKGhhc1RpbWVSZW1haW5pbmcsIGluaXRpYWxUaW1lKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgY3VycmVudFRhc2sgPSBudWxsO1xuICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJldmlvdXNQcmlvcml0eUxldmVsO1xuICAgIGlzUGVyZm9ybWluZ1dvcmsgPSBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3b3JrTG9vcChoYXNUaW1lUmVtYWluaW5nLCBpbml0aWFsVGltZSkge1xuICB2YXIgY3VycmVudFRpbWUgPSBpbml0aWFsVGltZTtcbiAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG4gIGN1cnJlbnRUYXNrID0gcGVlayh0YXNrUXVldWUpO1xuXG4gIHdoaWxlIChjdXJyZW50VGFzayAhPT0gbnVsbCAmJiAhKGVuYWJsZVNjaGVkdWxlckRlYnVnZ2luZyApKSB7XG4gICAgaWYgKGN1cnJlbnRUYXNrLmV4cGlyYXRpb25UaW1lID4gY3VycmVudFRpbWUgJiYgKCFoYXNUaW1lUmVtYWluaW5nIHx8IGV4cG9ydHMudW5zdGFibGVfc2hvdWxkWWllbGQoKSkpIHtcbiAgICAgIC8vIFRoaXMgY3VycmVudFRhc2sgaGFzbid0IGV4cGlyZWQsIGFuZCB3ZSd2ZSByZWFjaGVkIHRoZSBkZWFkbGluZS5cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFjayA9IGN1cnJlbnRUYXNrLmNhbGxiYWNrO1xuXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY3VycmVudFRhc2suY2FsbGJhY2sgPSBudWxsO1xuICAgICAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBjdXJyZW50VGFzay5wcmlvcml0eUxldmVsO1xuICAgICAgdmFyIGRpZFVzZXJDYWxsYmFja1RpbWVvdXQgPSBjdXJyZW50VGFzay5leHBpcmF0aW9uVGltZSA8PSBjdXJyZW50VGltZTtcblxuICAgICAgdmFyIGNvbnRpbnVhdGlvbkNhbGxiYWNrID0gY2FsbGJhY2soZGlkVXNlckNhbGxiYWNrVGltZW91dCk7XG4gICAgICBjdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7XG5cbiAgICAgIGlmICh0eXBlb2YgY29udGludWF0aW9uQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY3VycmVudFRhc2suY2FsbGJhY2sgPSBjb250aW51YXRpb25DYWxsYmFjaztcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRUYXNrID09PSBwZWVrKHRhc2tRdWV1ZSkpIHtcbiAgICAgICAgICBwb3AodGFza1F1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhZHZhbmNlVGltZXJzKGN1cnJlbnRUaW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9wKHRhc2tRdWV1ZSk7XG4gICAgfVxuXG4gICAgY3VycmVudFRhc2sgPSBwZWVrKHRhc2tRdWV1ZSk7XG4gIH0gLy8gUmV0dXJuIHdoZXRoZXIgdGhlcmUncyBhZGRpdGlvbmFsIHdvcmtcblxuXG4gIGlmIChjdXJyZW50VGFzayAhPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBmaXJzdFRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcblxuICAgIGlmIChmaXJzdFRpbWVyICE9PSBudWxsKSB7XG4gICAgICByZXF1ZXN0SG9zdFRpbWVvdXQoaGFuZGxlVGltZW91dCwgZmlyc3RUaW1lci5zdGFydFRpbWUgLSBjdXJyZW50VGltZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX3J1bldpdGhQcmlvcml0eShwcmlvcml0eUxldmVsLCBldmVudEhhbmRsZXIpIHtcbiAgc3dpdGNoIChwcmlvcml0eUxldmVsKSB7XG4gICAgY2FzZSBJbW1lZGlhdGVQcmlvcml0eTpcbiAgICBjYXNlIFVzZXJCbG9ja2luZ1ByaW9yaXR5OlxuICAgIGNhc2UgTm9ybWFsUHJpb3JpdHk6XG4gICAgY2FzZSBMb3dQcmlvcml0eTpcbiAgICBjYXNlIElkbGVQcmlvcml0eTpcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHByaW9yaXR5TGV2ZWwgPSBOb3JtYWxQcmlvcml0eTtcbiAgfVxuXG4gIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwcmlvcml0eUxldmVsO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlcigpO1xuICB9IGZpbmFsbHkge1xuICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJldmlvdXNQcmlvcml0eUxldmVsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX25leHQoZXZlbnRIYW5kbGVyKSB7XG4gIHZhciBwcmlvcml0eUxldmVsO1xuXG4gIHN3aXRjaCAoY3VycmVudFByaW9yaXR5TGV2ZWwpIHtcbiAgICBjYXNlIEltbWVkaWF0ZVByaW9yaXR5OlxuICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgY2FzZSBOb3JtYWxQcmlvcml0eTpcbiAgICAgIC8vIFNoaWZ0IGRvd24gdG8gbm9ybWFsIHByaW9yaXR5XG4gICAgICBwcmlvcml0eUxldmVsID0gTm9ybWFsUHJpb3JpdHk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBBbnl0aGluZyBsb3dlciB0aGFuIG5vcm1hbCBwcmlvcml0eSBzaG91bGQgcmVtYWluIGF0IHRoZSBjdXJyZW50IGxldmVsLlxuICAgICAgcHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICB2YXIgcHJldmlvdXNQcmlvcml0eUxldmVsID0gY3VycmVudFByaW9yaXR5TGV2ZWw7XG4gIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJpb3JpdHlMZXZlbDtcblxuICB0cnkge1xuICAgIHJldHVybiBldmVudEhhbmRsZXIoKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByZXZpb3VzUHJpb3JpdHlMZXZlbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV93cmFwQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgdmFyIHBhcmVudFByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUaGlzIGlzIGEgZm9yayBvZiBydW5XaXRoUHJpb3JpdHksIGlubGluZWQgZm9yIHBlcmZvcm1hbmNlLlxuICAgIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHBhcmVudFByaW9yaXR5TGV2ZWw7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJldmlvdXNQcmlvcml0eUxldmVsO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfc2NoZWR1bGVDYWxsYmFjayhwcmlvcml0eUxldmVsLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICB2YXIgY3VycmVudFRpbWUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpO1xuICB2YXIgc3RhcnRUaW1lO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgIHZhciBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIGRlbGF5ID09PSAnbnVtYmVyJyAmJiBkZWxheSA+IDApIHtcbiAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzdGFydFRpbWUgPSBjdXJyZW50VGltZTtcbiAgfVxuXG4gIHZhciB0aW1lb3V0O1xuXG4gIHN3aXRjaCAocHJpb3JpdHlMZXZlbCkge1xuICAgIGNhc2UgSW1tZWRpYXRlUHJpb3JpdHk6XG4gICAgICB0aW1lb3V0ID0gSU1NRURJQVRFX1BSSU9SSVRZX1RJTUVPVVQ7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgICB0aW1lb3V0ID0gVVNFUl9CTE9DS0lOR19QUklPUklUWV9USU1FT1VUO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIElkbGVQcmlvcml0eTpcbiAgICAgIHRpbWVvdXQgPSBJRExFX1BSSU9SSVRZX1RJTUVPVVQ7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgTG93UHJpb3JpdHk6XG4gICAgICB0aW1lb3V0ID0gTE9XX1BSSU9SSVRZX1RJTUVPVVQ7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgTm9ybWFsUHJpb3JpdHk6XG4gICAgZGVmYXVsdDpcbiAgICAgIHRpbWVvdXQgPSBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgdmFyIGV4cGlyYXRpb25UaW1lID0gc3RhcnRUaW1lICsgdGltZW91dDtcbiAgdmFyIG5ld1Rhc2sgPSB7XG4gICAgaWQ6IHRhc2tJZENvdW50ZXIrKyxcbiAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgcHJpb3JpdHlMZXZlbDogcHJpb3JpdHlMZXZlbCxcbiAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICBleHBpcmF0aW9uVGltZTogZXhwaXJhdGlvblRpbWUsXG4gICAgc29ydEluZGV4OiAtMVxuICB9O1xuXG4gIGlmIChzdGFydFRpbWUgPiBjdXJyZW50VGltZSkge1xuICAgIC8vIFRoaXMgaXMgYSBkZWxheWVkIHRhc2suXG4gICAgbmV3VGFzay5zb3J0SW5kZXggPSBzdGFydFRpbWU7XG4gICAgcHVzaCh0aW1lclF1ZXVlLCBuZXdUYXNrKTtcblxuICAgIGlmIChwZWVrKHRhc2tRdWV1ZSkgPT09IG51bGwgJiYgbmV3VGFzayA9PT0gcGVlayh0aW1lclF1ZXVlKSkge1xuICAgICAgLy8gQWxsIHRhc2tzIGFyZSBkZWxheWVkLCBhbmQgdGhpcyBpcyB0aGUgdGFzayB3aXRoIHRoZSBlYXJsaWVzdCBkZWxheS5cbiAgICAgIGlmIChpc0hvc3RUaW1lb3V0U2NoZWR1bGVkKSB7XG4gICAgICAgIC8vIENhbmNlbCBhbiBleGlzdGluZyB0aW1lb3V0LlxuICAgICAgICBjYW5jZWxIb3N0VGltZW91dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNIb3N0VGltZW91dFNjaGVkdWxlZCA9IHRydWU7XG4gICAgICB9IC8vIFNjaGVkdWxlIGEgdGltZW91dC5cblxuXG4gICAgICByZXF1ZXN0SG9zdFRpbWVvdXQoaGFuZGxlVGltZW91dCwgc3RhcnRUaW1lIC0gY3VycmVudFRpbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBuZXdUYXNrLnNvcnRJbmRleCA9IGV4cGlyYXRpb25UaW1lO1xuICAgIHB1c2godGFza1F1ZXVlLCBuZXdUYXNrKTtcbiAgICAvLyB3YWl0IHVudGlsIHRoZSBuZXh0IHRpbWUgd2UgeWllbGQuXG5cblxuICAgIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgJiYgIWlzUGVyZm9ybWluZ1dvcmspIHtcbiAgICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3RIb3N0Q2FsbGJhY2soZmx1c2hXb3JrKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3VGFzaztcbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfcGF1c2VFeGVjdXRpb24oKSB7XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX2NvbnRpbnVlRXhlY3V0aW9uKCkge1xuXG4gIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgJiYgIWlzUGVyZm9ybWluZ1dvcmspIHtcbiAgICBpc0hvc3RDYWxsYmFja1NjaGVkdWxlZCA9IHRydWU7XG4gICAgcmVxdWVzdEhvc3RDYWxsYmFjayhmbHVzaFdvcmspO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX2dldEZpcnN0Q2FsbGJhY2tOb2RlKCkge1xuICByZXR1cm4gcGVlayh0YXNrUXVldWUpO1xufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV9jYW5jZWxDYWxsYmFjayh0YXNrKSB7XG4gIC8vIHJlbW92ZSBmcm9tIHRoZSBxdWV1ZSBiZWNhdXNlIHlvdSBjYW4ndCByZW1vdmUgYXJiaXRyYXJ5IG5vZGVzIGZyb20gYW5cbiAgLy8gYXJyYXkgYmFzZWQgaGVhcCwgb25seSB0aGUgZmlyc3Qgb25lLilcblxuXG4gIHRhc2suY2FsbGJhY2sgPSBudWxsO1xufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV9nZXRDdXJyZW50UHJpb3JpdHlMZXZlbCgpIHtcbiAgcmV0dXJuIGN1cnJlbnRQcmlvcml0eUxldmVsO1xufVxuXG52YXIgdW5zdGFibGVfcmVxdWVzdFBhaW50ID0gcmVxdWVzdFBhaW50O1xudmFyIHVuc3RhYmxlX1Byb2ZpbGluZyA9ICBudWxsO1xuXG5leHBvcnRzLnVuc3RhYmxlX0lkbGVQcmlvcml0eSA9IElkbGVQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfSW1tZWRpYXRlUHJpb3JpdHkgPSBJbW1lZGlhdGVQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfTG93UHJpb3JpdHkgPSBMb3dQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfTm9ybWFsUHJpb3JpdHkgPSBOb3JtYWxQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfUHJvZmlsaW5nID0gdW5zdGFibGVfUHJvZmlsaW5nO1xuZXhwb3J0cy51bnN0YWJsZV9Vc2VyQmxvY2tpbmdQcmlvcml0eSA9IFVzZXJCbG9ja2luZ1ByaW9yaXR5O1xuZXhwb3J0cy51bnN0YWJsZV9jYW5jZWxDYWxsYmFjayA9IHVuc3RhYmxlX2NhbmNlbENhbGxiYWNrO1xuZXhwb3J0cy51bnN0YWJsZV9jb250aW51ZUV4ZWN1dGlvbiA9IHVuc3RhYmxlX2NvbnRpbnVlRXhlY3V0aW9uO1xuZXhwb3J0cy51bnN0YWJsZV9nZXRDdXJyZW50UHJpb3JpdHlMZXZlbCA9IHVuc3RhYmxlX2dldEN1cnJlbnRQcmlvcml0eUxldmVsO1xuZXhwb3J0cy51bnN0YWJsZV9nZXRGaXJzdENhbGxiYWNrTm9kZSA9IHVuc3RhYmxlX2dldEZpcnN0Q2FsbGJhY2tOb2RlO1xuZXhwb3J0cy51bnN0YWJsZV9uZXh0ID0gdW5zdGFibGVfbmV4dDtcbmV4cG9ydHMudW5zdGFibGVfcGF1c2VFeGVjdXRpb24gPSB1bnN0YWJsZV9wYXVzZUV4ZWN1dGlvbjtcbmV4cG9ydHMudW5zdGFibGVfcmVxdWVzdFBhaW50ID0gdW5zdGFibGVfcmVxdWVzdFBhaW50O1xuZXhwb3J0cy51bnN0YWJsZV9ydW5XaXRoUHJpb3JpdHkgPSB1bnN0YWJsZV9ydW5XaXRoUHJpb3JpdHk7XG5leHBvcnRzLnVuc3RhYmxlX3NjaGVkdWxlQ2FsbGJhY2sgPSB1bnN0YWJsZV9zY2hlZHVsZUNhbGxiYWNrO1xuZXhwb3J0cy51bnN0YWJsZV93cmFwQ2FsbGJhY2sgPSB1bnN0YWJsZV93cmFwQ2FsbGJhY2s7XG4gIH0pKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvc2NoZWR1bGVyLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci10cmFjaW5nLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci10cmFjaW5nLmRldmVsb3BtZW50LmpzJyk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=