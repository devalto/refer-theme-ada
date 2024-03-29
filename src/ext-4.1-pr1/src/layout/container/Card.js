/**
 * This layout manages multiple child Components, each fitted to the Container, where only a single child Component can be
 * visible at any given time.  This layout style is most commonly used for wizards, tab implementations, etc.
 * This class is intended to be extended or created via the layout:'card' {@link Ext.container.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.
 *
 * The CardLayout's focal method is {@link #setActiveItem}.  Since only one panel is displayed at a time,
 * the only way to move from one Component to the next is by calling setActiveItem, passing the next panel to display
 * (or its id or index).  The layout itself does not provide a user interface for handling this navigation,
 * so that functionality must be provided by the developer.
 *
 * To change the active card of a container, call the setActiveItem method of its layout:
 *
 *     Ext.create('Ext.panel.Panel', {
 *         layout: 'card',
 *         items: [
 *             { html: 'Card 1' },
 *             { html: 'Card 2' }
 *         ],
 *         renderTo: Ext.getBody()
 *     });
 *
 *     p.getLayout().setActiveItem(1);
 *
 * In the following example, a simplistic wizard setup is demonstrated.  A button bar is added
 * to the footer of the containing panel to provide navigation buttons.  The buttons will be handled by a
 * common navigation routine.  Note that other uses of a CardLayout (like a tab control) would require a
 * completely different implementation.  For serious implementations, a better approach would be to extend
 * CardLayout to provide the custom functionality needed.
 *
 *     @example
 *     var navigate = function(panel, direction){
 *         // This routine could contain business logic required to manage the navigation steps.
 *         // It would call setActiveItem as needed, manage navigation button state, handle any
 *         // branching logic that might be required, handle alternate actions like cancellation
 *         // or finalization, etc.  A complete wizard implementation could get pretty
 *         // sophisticated depending on the complexity required, and should probably be
 *         // done as a subclass of CardLayout in a real-world implementation.
 *         var layout = panel.getLayout();
 *         layout[direction]();
 *         Ext.getCmp('move-prev').setDisabled(!layout.getPrev());
 *         Ext.getCmp('move-next').setDisabled(!layout.getNext());
 *     };
 *
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Example Wizard',
 *         width: 300,
 *         height: 200,
 *         layout: 'card',
 *         bodyStyle: 'padding:15px',
 *         defaults: {
 *             // applied to each contained panel
 *             border: false
 *         },
 *         // just an example of one possible navigation scheme, using buttons
 *         bbar: [
 *             {
 *                 id: 'move-prev',
 *                 text: 'Back',
 *                 handler: function(btn) {
 *                     navigate(btn.up("panel"), "prev");
 *                 },
 *                 disabled: true
 *             },
 *             '->', // greedy spacer so that the buttons are aligned to each side
 *             {
 *                 id: 'move-next',
 *                 text: 'Next',
 *                 handler: function(btn) {
 *                     navigate(btn.up("panel"), "next");
 *                 }
 *             }
 *         ],
 *         // the panels (or "cards") within the layout
 *         items: [{
 *             id: 'card-0',
 *             html: '<h1>Welcome to the Wizard!</h1><p>Step 1 of 3</p>'
 *         },{
 *             id: 'card-1',
 *             html: '<p>Step 2 of 3</p>'
 *         },{
 *             id: 'card-2',
 *             html: '<h1>Congratulations!</h1><p>Step 3 of 3 - Complete</p>'
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Card', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.Fit',

    alternateClassName: 'Ext.layout.CardLayout',

    alias: 'layout.card',

    /* End Definitions */

    type: 'card',

    hideInactive: true,

    /**
     * @cfg {Boolean} deferredRender
     * True to render each contained item at the time it becomes active, false to render all contained items
     * as soon as the layout is rendered (defaults to false).  If there is a significant amount of content or
     * a lot of heavy controls being rendered into panels that are not displayed by default, setting this to
     * true might improve performance.
     */
    deferredRender : false,

    beforeLayout: function() {
        var me = this;
        me.getActiveItem();
        if (me.activeItem && me.deferredRender) {
            me.renderItems([me.activeItem], me.getRenderTarget());
            return true;
        } else {
            return me.callParent(arguments);
        }
    },

    getRenderTree: function () {
        var me = this;
        me.getActiveItem();
        if (me.activeItem && me.deferredRender) {
            return me.getItemsRenderTree([me.activeItem]);
        } else {
            return me.callParent(arguments);
        }
   },

    renderChildren: function () {
        var me = this,
            active = me.getActiveItem();
            
        if (!me.deferredRender) {
            me.callParent();
        } else if (active) {
            // ensure the active item is configured for the layout
            me.renderItems([active], me.getRenderTarget());
        }
    },

    onLayout: function() {
        var me = this,
            activeItem = me.activeItem,
            items = me.getVisibleItems(),
            ln = items.length,
            targetBox = me.getTargetBox(),
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            me.setItemBox(item, targetBox);
        }

        if (!me.firstActivated && activeItem) {
            if (activeItem.fireEvent('beforeactivate', activeItem) !== false) {
                activeItem.fireEvent('activate', activeItem);
            }
            me.firstActivated = true;
        }
    },

    isValidParent : function(item, target, position) {
        // Note: Card layout does not care about order within the target because only one is ever visible.
        // We only care whether the item is a direct child of the target.
        var itemEl = item.el ? item.el.dom : Ext.getDom(item);
        return (itemEl && itemEl.parentNode === (target.dom || target)) || false;
    },

    /**
     * Return the active (visible) component in the layout.
     * @returns {Ext.Component}
     */
    getActiveItem: function() {
        var me = this;
        if (!me.activeItem && me.owner) {
            me.activeItem = me.parseActiveItem(me.owner.activeItem);
        }

        if (me.activeItem && me.owner.items.indexOf(me.activeItem) != -1) {
            return me.activeItem;
        }

        return null;
    },

    // @private
    parseActiveItem: function(item) {
        if (item && item.isComponent) {
            return item;
        } else if (typeof item == 'number' || item === undefined) {
            return this.getLayoutItems()[item || 0];
        } else {
            return this.owner.getComponent(item);
        }
    },

    // @private
    afterRenderItem: function(item, position) {
        this.callParent([item, position]);
        if (this.hideInactive && this.activeItem !== item) {
            item.hide();
        } else {
            item.show();
        }
    },

    onRemove: function(component) {
        var me = this;
        
        if (component === me.activeItem) {
            me.activeItem = null;
            if (me.owner.items.getCount() === 0) {
                me.firstActivated = false;
            }
        }
    },

    // @private
    getAnimation: function(newCard, owner) {
        var newAnim = (newCard || {}).cardSwitchAnimation;
        if (newAnim === false) {
            return false;
        }
        return newAnim || owner.cardSwitchAnimation;
    },

    /**
     * Return the active (visible) component in the layout to the next card
     * @returns {Ext.Component} The next component or false.
     */
    getNext: function() {
        //NOTE: Removed the JSDoc for this function's arguments because it is not actually supported in 4.0. This 
        //should come back in 4.1
        var wrap = arguments[0],
            items = this.getLayoutItems(),
            index = Ext.Array.indexOf(items, this.activeItem);
            
        return items[index + 1] || (wrap ? items[0] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the next card
     * @return {Ext.Component} the activated component or false when nothing activated.
     */
    next: function() {
        //NOTE: Removed the JSDoc for this function's arguments because it is not actually supported in 4.0. This 
        //should come back in 4.1
        var anim = arguments[0], 
            wrap = arguments[1];
        return this.setActiveItem(this.getNext(wrap), anim);
    },

    /**
     * Return the active (visible) component in the layout to the previous card
     * @returns {Ext.Component} The previous component or false.
     */
    getPrev: function() {
        //NOTE: Removed the JSDoc for this function's arguments because it is not actually supported in 4.0. This 
        //should come back in 4.1
        var wrap = arguments[0],
            items = this.getLayoutItems(),
            index = Ext.Array.indexOf(items, this.activeItem);
            
        return items[index - 1] || (wrap ? items[items.length - 1] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the previous card
     * @return {Ext.Component} the activated component or false when nothing activated.
     */
    prev: function() {
        //NOTE: Removed the JSDoc for this function's arguments because it is not actually supported in 4.0. This 
        //should come back in 4.1
        var anim = arguments[0], 
            wrap = arguments[1];
        return this.setActiveItem(this.getPrev(wrap), anim);
    },

    /**
     * Makes the given card active.
     *
     *     var card1 = Ext.create('Ext.panel.Panel', {itemId: 'card-1'});
     *     var card2 = Ext.create('Ext.panel.Panel', {itemId: 'card-2'});
     *     var panel = Ext.create('Ext.panel.Panel', {
     *         layout: 'card',
     *         activeItem: 0,
     *         items: [card1, card2]
     *     });
     *     // These are all equivalent
     *     panel.getLayout().setActiveItem(card2);
     *     panel.getLayout().setActiveItem('card-2');
     *     panel.getLayout().setActiveItem(1);
     *
     * @param {Ext.Component/Number/String} newCard  The component, component {@link Ext.Component#id id},
     * {@link Ext.Component#itemId itemId}, or index of component.
     * @return {Ext.Component} the activated component or false when nothing activated.
     * False is returned also when trying to activate an already active card.
     */
    setActiveItem: function(newCard) {
        var me = this,
            owner = me.owner,
            oldCard = me.activeItem,
            newIndex;

        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);

        // If the card is not a child of the owner, then add it
        if (newIndex == -1) {
            newIndex = owner.items.items.length;
            owner.add(newCard);
        }

        // Is this a valid, different card?
        if (newCard && oldCard != newCard) {
            // If the card has not been rendered yet, now is the time to do so.
            if (!newCard.rendered) {
                me.configureItem(newCard, 0);
                me.renderItem(newCard, me.getRenderTarget(), owner.items.length);
                me.afterRenderItem(newCard);
            }

            me.activeItem = newCard;

            // Fire the beforeactivate and beforedeactivate events on the cards
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }

            me.owner.suspendLayouts();

            if (oldCard) {
                if (me.hideInactive) {
                    oldCard.hide();
                    oldCard.hiddenByLayout = true;
                }
                oldCard.fireEvent('deactivate', oldCard, newCard);
            }
            // Make sure the new card is shown
            if (newCard.hidden) {
                newCard.show();
            }

            me.owner.resumeLayouts(true);

            newCard.fireEvent('activate', newCard, oldCard);

            return newCard;
        }
        return false;
    }
});
