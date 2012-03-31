(function() {
    var global = this;

    // BEGIN some interesting objects to play with.

    var tweet1 = 'Great sandwich!';
    var tweet1b = '@bar hey!';
    var tweet2 = 'So tired!';
    var tweet3 = 'Homework sucks!';
    var tweet4 = 'No thoughts lately.';
    var tweet5 = 'My last tweet ever. Bye-bye.';

    var feed1;
    var feed1b;
    var feed2;
    var feed3;
    var feed4;
    var feedAll;

    var listener1 = function(data) {
        feed1.push(data.tweet);
    };

    var listener1b = function(data) {
        feed1b.push(data.tweet);
    };

    var listener2 = function(data) {
        feed2.push(data.tweet);
    };

    var listener3 = function(data) {
        feed3.push(data.tweet);
    };

    var listener4 = function(data) {
        feed4.push(data.tweet);
    };
    
    var listenerAll = function(data) {
        feedAll.push(data.tweet);
    };

    var twitter = new LIB_EventTarget();

    function APP_Twitter(name) {
        this.name = name;
    };
    LIB_mixinEventTarget(APP_Twitter.prototype);

    var tweetsRUs = new APP_Twitter('Tweets R Us');

    // END some interesting objects to play with.


    buster.testCase("event target test suite", {

        setUp: function() {
            // clear the feeds
            feed1 = [];
            feed1b = [];
            feed2 = [];
            feed3 = [];
            feed4 = [];
            feedAll = [];

            // add some listeners
            LIB_EventTarget.prototype.addEventListener('foo', listener1);
            LIB_EventTarget.prototype.addEventListener('bar', listener1b);
            LIB_EventTarget.prototype.addAllEventListener(listenerAll);
            twitter.addEventListener('foo', listener2);
            tweetsRUs.addEventListener('foo', listener3);
            APP_Twitter.prototype.addEventListener('foo', listener4);

            // send some tweets
            LIB_EventTarget.prototype.dispatchEvent({
                type: 'foo',
                tweet: tweet1
            });

            LIB_EventTarget.prototype.dispatchEvent({
                type: 'bar',
                tweet: tweet1b
            });

            twitter.dispatchEvent({
                type: 'foo',
                tweet: tweet2
            });

            tweetsRUs.dispatchEvent({
                type: 'foo',
                tweet: tweet3
            });

            APP_Twitter.prototype.dispatchEvent({
                type: 'foo',
                tweet: tweet4
            });

            APP_Twitter.prototype.dispatchEvent({
                type: 'foo',
                tweet: tweet5
            });

        },

        tearDown: function() {
            // remove the listeners
            LIB_EventTarget.prototype.removeEventListener('foo', listener1);
            LIB_EventTarget.prototype.removeEventListener('bar', listener1b);
            LIB_EventTarget.prototype.removeAllEventListener(listenerAll);
            twitter.removeEventListener('foo', listener2);
            tweetsRUs.removeEventListener('foo', listener3);
            APP_Twitter.prototype.removeEventListener('foo', listener4);
        },

        "test LIB_EventTarget.prototype constructor": function() {
            assert.same(LIB_EventTarget, LIB_EventTarget.prototype.constructor, "LIB_EventTarget.prototype's constructor should be Object.");
        },


        "test LIB_EventTarget instance's constructor": function() {
            assert.same(LIB_EventTarget, LIB_EventTarget.prototype.constructor, "LIB_EventTarget.prototype should have Object as its constructor.");
            assert.same(LIB_EventTarget, (new LIB_EventTarget()).constructor, "an instance of LIB_EventTarget should have LIB_EventTarget as its constructor.");
        },
        
        "test LIB_mixinEventTarget does not change constructor": function() {
            function F() {}
            var obj = new F();
            var constructorBefore = obj.constructor;
            assert.same(F, constructorBefore, "sanity check");
            LIB_mixinEventTarget(obj);
            assert.same(constructorBefore, obj.constructor, "the constructor should not have changed");
        },
        
        "test event lists of listeners are separate for one subject": function() {
            assert.arrayEquals([tweet1], feed1);
            assert.arrayEquals([tweet1b], feed1b);
        },
        
        "test lists of listeners for same event are separate for multiple subjects": function() {
            assert.arrayEquals([tweet1], feed1);
            assert.arrayEquals([tweet2], feed2);
            assert.arrayEquals([tweet3], feed3);
            assert.arrayEquals([tweet4, tweet5], feed4);
        },
        
        "test all listeners": function() {
            assert.arrayEquals([tweet1, tweet1b], feedAll);
        },
        
        "test methodName defaults to \"handleEvent\"": function() {
            var s = new LIB_EventTarget();
            var called = false;
            var listener = {
                handleEvent: function() {
                    called = true;
                }
            };
            s.addEventListener('foo', listener);
            s.dispatchEvent({type:'foo'});
            assert.same(true, called);
            called = false;
            s.removeEventListener('foo', listener);
            s.dispatchEvent({type:'foo'});
            assert.same(false, called);
        },
        
        "test methodName argument": function() {
            var s = new LIB_EventTarget();
            var obj0 = {
                name: 'obj0_name',
                handler: function(ev) {
                    this.result = this.name;
                }
            };
            s.addEventListener('foo', obj0, 'handler');
        
            assert.same(undefined, obj0.result);
        
            s.dispatchEvent({type: 'foo'});
        
            assert.same('obj0_name', obj0.result);
            
            delete obj0.result;
        
            assert.same(undefined, obj0.result);
        
            s.removeEventListener('foo', obj0, 'handler');
        
            s.dispatchEvent({type: 'foo'});
        
            assert.same(undefined, obj0.result);
        },
        
        "test thisObj not supplied is event target object": function() {
            var s = new LIB_EventTarget();
            var thisObj = null;
            var f = function() {
                thisObj = this;
            };
            s.addEventListener('foo', f);
            refute.same(s, thisObj);
            s.dispatchEvent({type:'foo'});
            assert.same(s, thisObj);
            thisObj = null;
            s.removeEventListener('foo', f);
            s.dispatchEvent({type:'foo'});
            assert.same(null, thisObj);
        },
        
        "test thisObj is not event target if auxArg is explicitly false": function() {
            var s = new LIB_EventTarget();
            var f = function() {
                f.thisObj = this;
            };
            s.addEventListener('foo', f, false);
            s.dispatchEvent({type:'foo'});
            refute.same(s, f.thisObj);
            assert.same('object', typeof f.thisObj);
            assert.same(false, f.thisObj.valueOf());
        },
        
        "test thisObj is not event target if auxArg is explicitly null": function() {
            var s = new LIB_EventTarget();
            var g = function() {
                g.thisObj = this;
            };
            s.addEventListener('foo', g, null);
            s.dispatchEvent({type:'foo'});
            refute.same(s, g.thisObj);
            assert.same('object', typeof g.thisObj);
            assert.same(global, g.thisObj);
        },
        
        "test thisObj is not event target if auxArg is explicitly undefined": function() {
            var s = new LIB_EventTarget();
            var h = function() {
                h.thisObj = this;
            };
            h.thisObj = true; // some value other than undefined
            s.addEventListener('foo', h, undefined);
            s.dispatchEvent({type:'foo'});
            refute.same(s, h.thisObj);
            assert.same('object', typeof h.thisObj);
            assert.same(global, h.thisObj);
        },
        
        "test thisObj is not event target if auxArg is explicitly empty string": function() {
            var s = new LIB_EventTarget();
            var i = function() {
                i.thisObj = this;
            };
            s.addEventListener('foo', i, '');
            s.dispatchEvent({type:'foo'});
            refute.same(s, i.thisObj);
            assert.same('object', typeof i.thisObj);
            assert.same('', i.thisObj.valueOf());
        },
        
        "test thisObj is not event target if auxArg is explicitly zero": function() {
            var s = new LIB_EventTarget();
            var j = function() {
                j.thisObj = this;
            };
            s.addEventListener('foo', j, 0);
            s.dispatchEvent({type:'foo'});
            refute.same(s, j.thisObj);
            assert.same('object', typeof j.thisObj);
            assert.same(0, j.thisObj.valueOf());
        },
        
        "test thisObj is not event target if auxArg is explicitly NaN": function() {
            var s = new LIB_EventTarget();
            var k = function() {
                k.thisObj = this;
            };
            s.addEventListener('foo', k, NaN);
            s.dispatchEvent({type:'foo'});
            refute.same(s, isNaN(k.thisObj));
            assert.same('object', typeof k.thisObj);
            assert.same(true, isNaN(k.thisObj.valueOf()));
        },
        
        "test if auxArg explicitly undefined for adding then must be explicitly undefined for removing": function() {
            var s = new LIB_EventTarget();
            var f = function() {
                f.called = true;
            };
            var g = function() {
                g.called = true;
            };
            var reset = function() {
                f.called = false;
                g.called = false;
            };
            reset();
            s.addEventListener('foo', f);
            s.addEventListener('foo', g, undefined);
            s.dispatchEvent({type:'foo'});
            assert.same(true, f.called, 'one');
            assert.same(true, g.called, 'two');
            reset();
            s.removeEventListener('foo', f);
            s.removeEventListener('foo', g);
            s.dispatchEvent({type:'foo'});
            assert.same(false, f.called, 'three');
            assert.same(true, g.called, 'four');
            reset();
            s.removeEventListener('foo', g, undefined);
            s.dispatchEvent({type:'foo'});
            assert.same(false, f.called, 'five');
            assert.same(false, g.called, 'six');
        },
        
        "test adding same listener function twice with same parameters only adds it once": function() {
            var s = new LIB_EventTarget();
            var f = function() {
                f.count++;
            };
            var reset = function() {
                f.count = 0;
            };
            reset();
            assert.same(0, f.count, 'start with zero');
            s.addEventListener('foo', f, {});
            s.addEventListener('foo', f, {});
            s.dispatchEvent({type: 'foo'});
            assert.same(2, f.count, 'f should only have been called twice');
        },
        
        "test adding same listener function with different type parameters adds it twice": function() {
            var s = new LIB_EventTarget();
            var f = function() {
                f.count++;
            };
            var reset = function() {
                f.count = 0;
            };
            reset();
            assert.same(0, f.count, 'start with zero');
            s.addEventListener('foo', f);
            s.addEventListener('bar', f);
            s.dispatchEvent({type: 'foo'});
            s.dispatchEvent({type: 'bar'});
            assert.same(2, f.count, 'f should only have been called twice');
        },
        
        "test adding same listener function with different auxArg parameters adds it twice": function() {
            var s = new LIB_EventTarget();
            var f = function() {
                f.count++;
            };
            var reset = function() {
                f.count = 0;
            };
            reset();
            assert.same(0, f.count, 'start with zero');
            s.addEventListener('foo', f);
            s.addEventListener('foo', f);
            s.dispatchEvent({type: 'foo'});
            assert.same(1, f.count, 'f should only have been called once');
        },
        
        "test thisObj argument differentiates two listeners": function() {
            var s = new LIB_EventTarget();
            var obj0 = {
                name: 'obj0_name',
                handler: function(ev) {
                    this.result = this.name;
                }
            };
            var obj1 = {
                name: 'obj1_name'
            };
            s.addEventListener('foo', obj0.handler, obj0);
            // borrow obj0's handler and use for obj1
            s.addEventListener('foo', obj0.handler, obj1);
        
            assert.same(undefined, obj0.result);
            assert.same(undefined, obj1.result);
        
            s.dispatchEvent({type: 'foo'});
        
            assert.same('obj0_name', obj0.result);
            assert.same('obj1_name', obj1.result);
            
            delete obj0.result;
            delete obj1.result;
        
            assert.same(undefined, obj0.result);
            assert.same(undefined, obj1.result);
        
            s.removeEventListener('foo', obj0.handler, obj1);
            s.dispatchEvent({type: 'foo'});
        
            assert.same('obj0_name', obj0.result);
            assert.same(undefined, obj1.result);
        },
        
        "test implements": function() {
            assert.same(false, LIB_implementsEventTarget({}), 'basic objects should not implement the subject interface.');
            assert.same(true, LIB_implementsEventTarget(new LIB_EventTarget()), 'subject objects should implement the subject interface.');
        },
        
        "test that target doesn't change and that currentTarget does change when bubbling": function() {
        
            var child0 = new LIB_EventTarget();
            var child1 = new LIB_EventTarget();
        
            var result0;
            var result1;
        
            child0.addEventListener('foo', function(ev) {
                result0 = ev;
                // bubble the event
                child1.dispatchEvent(ev);
            });
        
            child1.addEventListener('foo', function(ev) {
                result1 = ev;
            });
        
            child0.dispatchEvent({type:'foo'});
        
            assert.same(result0.target, child0, 'assertion 1: The target should be child0.');
            assert.same(result0.currentTarget, child0, 'assertion 2: The currentTarget should be child0.');
            assert.same(result1.target, child0, 'assertion 3: The target should be child0.');
            assert.same(result1.currentTarget, child1, 'assertion 4: The currentTarget should be child1.');
        
        },
        
        "test that bubbling while handling an event does not alter the original event": function() {
        
            var child0 = new LIB_EventTarget();
            var child1 = new LIB_EventTarget();
            var child2 = new LIB_EventTarget();
        
            var result0;
            var result1;
            var result2;
        
            child0.addEventListener('foo', function(ev) {
                result0 = ev;
            });
        
            child0.addEventListener('foo', function(ev) {
                child1.dispatchEvent(ev);
                result1 = ev;
            });
        
            child1.addEventListener('foo', function(ev) {
                result2 = ev;
            });
        
            child0.dispatchEvent({type:'foo'});
        
            assert.same(result0.target, child0, 'assertion 1: The target should be child0.');
            assert.same(result0.currentTarget, child0, 'assertion 2: The currentTarget should be child0.');
            assert.same(result1.target, child0, 'assertion 3: The target should be child0.');
            assert.same(result1.currentTarget, child0, 'assertion 4: The currentTarget should be child0.');
            assert.same(result2.target, child0, 'assertion 5: The target should be child0.');
            assert.same(result2.currentTarget, child1, 'assertion 6: The currentTarget should be child1.');
        
        }

    });

}());