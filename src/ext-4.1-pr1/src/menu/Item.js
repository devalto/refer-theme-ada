/**
 * A base class for all menu items that require menu-related functionality such as click handling,
 * sub-menus, icons, etc.
 *
 *     @example
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 100,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'icon item',
 *             iconCls: 'add16'
 *         },{
 *             text: 'text item'
 *         },{
 *             text: 'plain item',
 *             plain: true
 *         }]
 *     });
 */
Ext.define('Ext.menu.Item', {
    extend: 'Ext.Component',
    alias: 'widget.menuitem',
    alternateClassName: 'Ext.menu.TextItem',

    /**
     * @property {Boolean} activated
     * Whether or not this item is currently activated
     */

    /**
     * @property {Ext.menu.Menu} parentMenu
     * The parent Menu of this item.
     */

    /**
     * @cfg {String} activeCls
     * The CSS class added to the menu item when the item is activated (focused/mouseover).
     * Defaults to `Ext.baseCSSPrefix + 'menu-item-active'`.
     */
    activeCls: Ext.baseCSSPrefix + 'menu-item-active',

    /**
     * @cfg {String} ariaRole
     * @private
     */
    ariaRole: 'menuitem',

    /**
     * @cfg {Boolean} canActivate
     * Whether or not this menu item can be activated when focused/mouseovered. Defaults to `true`.
     */
    canActivate: true,

    /**
     * @cfg {Number} clickHideDelay
     * The delay in milliseconds to wait before hiding the menu after clicking the menu item.
     * This only has an effect when `hideOnClick: true`. Defaults to `1`.
     */
    clickHideDelay: 1,

    /**
     * @cfg {Boolean} destroyMenu
     * Whether or not to destroy any associated sub-menu when this item is destroyed. Defaults to `true`.
     */
    destroyMenu: true,

    /**
     * @cfg {String} disabledCls
     * The CSS class added to the menu item when the item is disabled.
     * Defaults to `Ext.baseCSSPrefix + 'menu-item-disabled'`.
     */
    disabledCls: Ext.baseCSSPrefix + 'menu-item-disabled',

    /**
     * @cfg {String} href
     * The href attribute to use for the underlying anchor link. Defaults to `#`.
     * @markdown
     */

     /**
      * @cfg {String} hrefTarget
      * The target attribute to use for the underlying anchor link. Defaults to `undefined`.
      * @markdown
      */

    /**
     * @cfg {Boolean} hideOnClick
     * Whether to not to hide the owning menu when this item is clicked. Defaults to `true`.
     * @markdown
     */
    hideOnClick: true,

    /**
     * @cfg {String} icon
     * The path to an icon to display in this item. Defaults to `Ext.BLANK_IMAGE_URL`.
     * @markdown
     */

    /**
     * @cfg {String} iconCls
     * A CSS class that specifies a `background-image` to use as the icon for this item. Defaults to `undefined`.
     * @markdown
     */

    isMenuItem: true,

    /**
     * @cfg {Mixed} menu
     * Either an instance of {@link Ext.menu.Menu} or a config object for an {@link Ext.menu.Menu}
     * which will act as a sub-menu to this item.
     * @markdown
     * @property {Ext.menu.Menu} menu The sub-menu associated with this item, if one was configured.
     */

    /**
     * @cfg {String} menuAlign
     * The default {@link Ext.Element#getAlignToXY Ext.Element.getAlignToXY} anchor position value for this
     * item's sub-menu relative to this item's position. Defaults to `'tl-tr?'`.
     * @markdown
     */
    menuAlign: 'tl-tr?',

    /**
     * @cfg {Number} menuExpandDelay
     * The delay in milliseconds before this item's sub-menu expands after this item is moused over. Defaults to `200`.
     * @markdown
     */
    menuExpandDelay: 200,

    /**
     * @cfg {Number} menuHideDelay
     * The delay in milliseconds before this item's sub-menu hides after this item is moused out. Defaults to `200`.
     * @markdown
     */
    menuHideDelay: 200,

    /**
     * @cfg {Boolean} plain
     * Whether or not this item is plain text/html with no icon or visual activation. Defaults to `false`.
     * @markdown
     */

    arrowCls: Ext.baseCSSPrefix + 'menu-item-arrow',

    childEls: [
        'itemEl', 'iconEl', 'textEl', 'arrowEl'
    ],

    renderTpl: [
        '<tpl if="plain">',
            '{text}',
        '<tpl else>',
            '<a id="{id}-itemEl" class="' + Ext.baseCSSPrefix + 'menu-item-link" href="{href}" <tpl if="hrefTarget">target="{hrefTarget}"</tpl> hidefocus="true" unselectable="on">',
                '<img id="{id}-iconEl" src="{icon}" class="' + Ext.baseCSSPrefix + 'menu-item-icon {iconCls}" />',
                '<span id="{id}-textEl" class="' + Ext.baseCSSPrefix + 'menu-item-text" <tpl if="menu">style="margin-right: 17px;"</tpl> >{text}</span>',
                '<img id="{id}-arrowEl" src="{blank}" class="{arrowCls}" />',
            '</a>',
        '</tpl>'
    ],

    maskOnDisable: false,

    /**
     * @cfg {String} text
     * The text/html to display in this item. Defaults to `undefined`.
     * @markdown
     */

    /**
     * @cfg {Function} handler
     * A function called when the menu item is clicked (can be used instead of {@link #click} event).
     * @cfg {Ext.menu.Item} handler.item The item that was clicked
     * @cfg {Ext.EventObject} handler.e The underyling {@link Ext.EventObject}.
     */

    activate: function() {
        var me = this;

        if (!me.activated && me.canActivate && me.rendered && !me.isDisabled() && me.isVisible()) {
            me.el.addCls(me.activeCls);
            me.focus();
            me.activated = true;
            me.fireEvent('activate', me);
        }
    },

    blur: function() {
        this.$focused = false;
        this.callParent(arguments);
    },

    deactivate: function() {
        var me = this;

        if (me.activated) {
            me.el.removeCls(me.activeCls);
            me.blur();
            me.hideMenu();
            me.activated = false;
            me.fireEvent('deactivate', me);
        }
    },

    deferExpandMenu: function() {
        var me = this;

        if (!me.menu.rendered || !me.menu.isVisible()) {
            me.parentMenu.activeChild = me.menu;
            me.menu.parentItem = me;
            me.menu.parentMenu = me.menu.ownerCt = me.parentMenu;
            me.menu.showBy(me, me.menuAlign);
        }
    },

    deferHideMenu: function() {
        if (this.menu.isVisible()) {
            this.menu.hide();
        }
    },
    
    cancelDeferHide: function(){
        clearTimeout(this.hideMenuTimer);
    },

    deferHideParentMenus: function() {
        Ext.menu.Manager.hideAll();
    },

    expandMenu: function(delay) {
        var me = this;

        if (me.menu) {
            me.cancelDeferHide();
            if (delay === 0) {
                me.deferExpandMenu();
            } else {
                me.expandMenuTimer = Ext.defer(me.deferExpandMenu, Ext.isNumber(delay) ? delay : me.menuExpandDelay, me);
            }
        }
    },

    focus: function() {
        this.$focused = true;
        this.callParent(arguments);
    },

    getRefItems: function(deep){
        var menu = this.menu,
            items;

        if (menu) {
            items = menu.getRefItems(deep);
            items.unshift(menu);
        }
        return items || [];
    },

    hideMenu: function(delay) {
        var me = this;

        if (me.menu) {
            clearTimeout(me.expandMenuTimer);
            me.hideMenuTimer = Ext.defer(me.deferHideMenu, Ext.isNumber(delay) ? delay : me.menuHideDelay, me);
        }
    },

    initComponent: function() {
        var me = this,
            prefix = Ext.baseCSSPrefix,
            cls = [prefix + 'menu-item'];

        me.addEvents(
            /**
             * @event activate
             * Fires when this item is activated
             * @param {Ext.menu.Item} item The activated item
             */
            'activate',

            /**
             * @event click
             * Fires when this item is clicked
             * @param {Ext.menu.Item} item The item that was clicked
             * @param {Ext.EventObject} e The underyling {@link Ext.EventObject}.
             */
            'click',

            /**
             * @event deactivate
             * Fires when this tiem is deactivated
             * @param {Ext.menu.Item} item The deactivated item
             */
            'deactivate'
        );

        if (me.plain) {
            cls.push(prefix + 'menu-item-plain');
        }

        if (me.cls) {
            cls.push(me.cls);
        }

        me.cls = cls.join(' ');

        if (me.menu) {
            me.menu = Ext.menu.Manager.get(me.menu);
        }

        me.callParent(arguments);
    },

    onClick: function(e) {
        var me = this;

        if (!me.href) {
            e.stopEvent();
        }

        if (me.disabled) {
            return;
        }

        if (me.hideOnClick) {
            me.deferHideParentMenusTimer = Ext.defer(me.deferHideParentMenus, me.clickHideDelay, me);
        }

        Ext.callback(me.handler, me.scope || me, [me, e]);
        me.fireEvent('click', me, e);

        if (!me.hideOnClick) {
            me.focus();
        }
    },

    onDestroy: function() {
        var me = this;

        clearTimeout(me.expandMenuTimer);
        me.cancelDeferHide();
        clearTimeout(me.deferHideParentMenusTimer);

        me.setMenu(null);
        me.callParent(arguments);
    },

    beforeRender: function() {
        var me = this,
            blank = Ext.BLANK_IMAGE_URL;

        me.callParent();

        Ext.applyIf(me.renderData, {
            href: me.href || '#',
            hrefTarget: me.hrefTarget,
            icon: me.icon || blank,
            iconCls: me.iconCls + (me.checkChangeDisabled ? ' ' + me.disabledCls : ''),
            plain: me.plain,
            text: me.text,
            arrowCls: me.menu ? me.arrowCls : '',
            blank: blank
        });
    },
    
    /**
     * Set a child menu for this item. See the {@link #menu} configuration.
     * @param {Ext.menu.Menu/Object} menu A menu, or menu configuration. null may be
     * passed to remove the menu.
     * @param {Boolean} [destroyMenu] True to destroy any existing menu. False to
     * prevent destruction. If not specified, the {@link #destroyMenu} configuration
     * will be used.
     */
    setMenu: function(menu, destroyMenu) {
        var me = this,
            oldMenu = me.menu;
            
        if (oldMenu) {
            delete oldMenu.parentItem;
            delete oldMenu.parentMenu;
            delete oldMenu.ownerCt;
            if (destroyMenu === true || (destroyMenu !== false && me.destroyMenu)) {
                Ext.destroy(oldMenu);
            }
        }
        if (menu) {
            me.menu = Ext.menu.Manager.get(menu);
        } else {
            me.menu = null;
        }
        
        if (me.rendered && !me.destroying) {
            me.arrowEl[me.menu ? 'addCls' : 'removeCls'](me.arrowCls);
        }
    },

    /**
     * Sets the {@link #click} handler of this item
     * @param {Function} fn The handler function
     * @param {Object} scope (optional) The scope of the handler function
     */
    setHandler: function(fn, scope) {
        this.handler = fn || null;
        this.scope = scope;
    },

    /**
     * Sets the {@link #iconCls} of this item
     * @param {String} iconCls The CSS class to set to {@link #iconCls}
     */
    setIconCls: function(iconCls) {
        var me = this,
            iconEl;

        if (iconEl) {
            if (me.iconCls) {
                iconEl.removeCls(me.iconCls);
            }

            if (iconCls) {
                iconEl.addCls(iconCls);
            }
        }

        me.iconCls = iconCls;
    },

    /**
     * Sets the {@link #text} of this item
     * @param {String} text The {@link #text}
     */
    setText: function(text) {
        var me = this,
            el = me.textEl || me.el;

        me.text = text;

        if (me.rendered) {
            el.update(text || '');
            // cannot just call layout on the component due to stretchmax
            me.ownerCt.updateLayout();
        }
    }
});
