"use strict";

var sequeue = require('seq-queue');

function TaskManager(opts) {
	opts = opts || {};
	this._closeOnEmpty = !!opts.closeOnEmpty;
	this._queues = {};
	if ( opts.timeout ) {
		this.timeout = opts.timeout;
	}
}

var manager = TaskManager.prototype;

manager.timeout = 3000;


/**
 * Add tasks into task group. Create the task group if it dose not exist.
 */
manager.addTask = function (key, fn, ontimeout) {
	var queue = this._queues[key], self = this;
	if ( !queue ) {
		queue = sequeue.createQueue(this.timeout);
		if ( this._closeOnEmpty ) {
			queue.on('drain', function () {
				self.closeQueue(key);
			})
		}
		this._queues[key] = queue;
	}

	var timeout = this.timeout;
	return queue.push(fn, function () {
		ontimeout && ontimeout(new Error('task timeout on ' + timeout + ' ms'));
	});
};


/**
 * Destroy task group
 */
manager.closeQueue = function (key, force) {
	if ( !this._queues[key] ) {
		// ignore illeagle key
		return;
	}

	this._queues[key].close(force);
	delete this._queues[key];
};

module.exports             = new TaskManager();
module.exports.TaskManager = TaskManager;