/**
 * @class Ext.util.KeyMap
 * Handles mapping keys to actions for an element. One key map can be used for multiple actions.
 * The constructor accepts the same config object as defined by {@link #addBinding}.
 * If you bind a callback function to a KeyMap, anytime the KeyMap handles an expected key
 * combination it will call the function with this signature (if the match is a multi-key
 * combination the callback will still be called only once): (String key, Ext.EventObject e)
 * A KeyMap can also handle a string representation of keys. By default KeyMap starts enabled.<br />
 * Usage:
 <pre><code>
// map one key by key code
var map = new Ext.util.KeyMap("my-element", {
    key: 13, // or Ext.EventObject.ENTER
    fn: myHandler,
    scope: myObject
});

// map multiple keys to one action by string
var map = new Ext.util.KeyMap("my-element", {
    key: "a\r\n\t",
    fn: myHandler,
    scope: myObject
});

// map multiple keys to multiple actions by strings and array of codes
var map = new Ext.util.KeyMap("my-element", [
    {
        key: [10,13],
        fn: function(){ alert("Return was pressed"); }
    }, {
        key: "abc",
        fn: function(){ alert('a, b or c was pressed'); }
    }, {
        key: "\t",
        ctrl:true,
        shift:true,
        fn: function(){ alert('Control + shift + tab was pressed.'); }
    }
]);
</code></pre>
 */
Ext.define('Ext.util.KeyMap', {
    alternateClassName: 'Ext.KeyMap',

    /**
     * Creates new KeyMap.
     * @param {String/HTMLElement/Ext.Element} el The element or its ID to bind to
     * @param {Object} binding The binding (see {@link #addBinding})
     * @param {String} [eventName="keydown"] The event to bind to
     */
    constructor: function(el, binding, eventName){
        var me = this;

        Ext.apply(me, {
            el: Ext.get(el),
            eventName: eventName || me.eventName,
            bindings: []
        });
        if (binding) {
            me.addBinding(binding);
        }
        me.enable();
    },

    eventName: 'keydown',

    /**
     * Add a new binding to this KeyMap. The following config object properties are supported:
     * <pre>
Property            Type             Description
----------          ---------------  ----------------------------------------------------------------------
key                 String/Array     A single keycode or an array of keycodes to handle
shift               Boolean          True to handle key only when shift is pressed, False to handle the key only when shift is not pressed (defaults to undefined)
ctrl                Boolean          True to handle key only when ctrl is pressed, False to handle the key only when ctrl is not pressed (defaults to undefined)
alt                 Boolean          True to handle key only when alt is pressed, False to handle the key only when alt is not pressed (defaults to undefined)
handler             Function         The function to call when KeyMap finds the expected key combination
fn                  Function         Alias of handler (for backwards-compatibility)
scope               Object           The scope of the callback function
defaultEventAction  String           A default action to apply to the event. Possible values are: stopEvent, stopPropagation, preventDefault. If no value is set no action is performed.
</pre>
     *
     * Usage:
     * <pre><code>
// Create a KeyMap
var map = new Ext.util.KeyMap(document, {
    key: Ext.EventObject.ENTER,
    fn: handleKey,
    scope: this
});

//Add a new binding to the existing KeyMap later
map.addBinding({
    key: 'abc',
    shift: true,
    fn: handleKey,
    scope: this
});
</code></pre>
     * @param {Object/Object[]} binding A single KeyMap config or an array of configs
     */
    addBinding : function(binding){
        if (Ext.isArray(binding)) {
            Ext.each(binding, this.addBinding, this);
            return;
        }

        var keyCode = binding.key,
            processed = false,
            key,
            keys,
            keyString,
            i,
            len;

        if (Ext.isString(keyCode)) {
            keys = [];
            keyString = keyCode.toUpperCase();

            for (i = 0, len = keyString.length; i < len; ++i){
                keys.push(keyString.charCodeAt(i));
            }
            keyCode = keys;
            processed = true;
        }

        if (!Ext.isArray(keyCode)) {
            keyCode = [keyCode];
        }

        if (!processed) {
            for (i = 0, len = keyCode.length; i < len; ++i) {
                key = keyCode[i];
                if (Ext.isString(key)) {
                    keyCode[i] = key.toUpperCase().charCodeAt(0);
                }
            }
        }

        this.bindings.push(Ext.apply({
            keyCode: keyCode
        }, binding));
    },

    /**
     * Process any keydown events on the element
     * @private
     * @param {Ext.EventObject} event
     */
    handleKeyDown: function(event) {
        if (this.enabled) { //just in case
            var bindings = this.bindings,
                i = 0,
                len = bindings.length;

            event = this.processEvent(event);
            for(; i < len; ++i){
                this.processBinding(bindings[i], event);
            }
        }
    },

    /**
     * Ugly hack to allow this class to be tested. Currently WebKit gives
     * no way to raise a key event properly with both
     * a) A keycode
     * b) The alt/ctrl/shift modifiers
     * So we have to simulate them here. Yuk!
     * This is a stub method intended to be overridden by tests.
     * More info: https://bugs.webkit.org/show_bug.cgi?id=16735
     * @private
     */
    processEvent: function(event){
        return event;
    },

    /**
     * Process a particular binding and fire the handler if necessary.
     * @private
     * @param {Object} binding The binding information
     * @param {Ext.EventObject} event
     */
    processBinding: function(binding, event){
        if (this.checkModifiers(binding, event)) {
            var key = event.getKey(),
                handler = binding.fn || binding.handler,
                scope = binding.scope || this,
                keyCode = binding.keyCode,
                defaultEventAction = binding.defaultEventAction,
                i,
                len,
                keydownEvent = new Ext.EventObjectImpl(event);


            for (i = 0, len = keyCode.length; i < len; ++i) {
                if (key === keyCode[i]) {
                    if (handler.call(scope, key, event) !== true && defaultEventAction) {
                        keydownEvent[defaultEventAction]();
                    }
                    break;
                }
            }
        }
    },

    /**
     * Check if the modifiers on the event match those on the binding
     * @private
     * @param {Object} binding
     * @param {Ext.EventObject} event
     * @return {Boolean} True if the event matches the binding
     */
    checkModifiers: function(binding, e){
        var keys = ['shift', 'ctrl', 'alt'],
            i = 0,
            len = keys.length,
            val, key;

        for (; i < len; ++i){
            key = keys[i];
            val = binding[key];
            if (!(val === undefined || (val === e[key + 'Key']))) {
                return false;
            }
        }
        return true;
    },

    /**
     * Shorthand for adding a single key listener
     * @param {Number/Number[]/Object} key Either the numeric key code, array of key codes or an object with the
     * following options:
     * {key: (number or array), shift: (true/false), ctrl: (true/false), alt: (true/false)}
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    on: function(key, fn, scope) {
        var keyCode, shift, ctrl, alt;
        if (Ext.isObject(key) && !Ext.isArray(key)) {
            keyCode = key.key;
            shift = key.shift;
            ctrl = key.ctrl;
            alt = key.alt;
        } else {
            keyCode = key;
        }
        this.addBinding({
            key: keyCode,
            shift: shift,
            ctrl: ctrl,
            alt: alt,
            fn: fn,
            scope: scope
        });
    },

    /**
     * Returns true if this KeyMap is enabled
     * @return {Boolean}
     */
    isEnabled : function(){
        return this.enabled;
    },

    /**
     * Enables this KeyMap
     */
    enable: function(){
        var me = this;
        
        if (!me.enabled) {
            me.el.on(me.eventName, me.handleKeyDown, me);
            me.enabled = true;
        }
    },

    /**
     * Disable this KeyMap
     */
    disable: function(){
        var me = this;
        
        if (me.enabled) {
            me.el.removeListener(me.eventName, me.handleKeyDown, me);
            me.enabled = false;
        }
    },

    /**
     * Convenience function for setting disabled/enabled by boolean.
     * @param {Boolean} disabled
     */
    setDisabled : function(disabled){
        if (disabled) {
            this.disable();
        } else {
            this.enable();
        }
    },

    /**
     * Destroys the KeyMap instance and removes all handlers.
     * @param {Boolean} removeEl True to also remove the attached element
     */
    destroy: function(removeEl){
        var me = this;

        me.bindings = [];
        me.disable();
        if (removeEl === true) {
            me.el.remove();
        }
        delete me.el;
    }
});