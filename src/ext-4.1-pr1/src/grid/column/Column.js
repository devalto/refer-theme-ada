/**
 * This class specifies the definition for a column inside a {@link Ext.grid.Panel}. It encompasses
 * both the grid header configuration as well as displaying data within the grid itself. If the
 * {@link #columns} configuration is specified, this column will become a column group and can
 * contain other columns inside. In general, this class will not be created directly, rather
 * an array of column configurations will be passed to the grid:
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'senority', 'dep', 'hired'],
 *         data:[
 *             {firstname:"Michael", lastname:"Scott", senority:7, dep:"Manangement", hired:"01/10/2004"},
 *             {firstname:"Dwight", lastname:"Schrute", senority:2, dep:"Sales", hired:"04/01/2004"},
 *             {firstname:"Jim", lastname:"Halpert", senority:3, dep:"Sales", hired:"02/22/2006"},
 *             {firstname:"Kevin", lastname:"Malone", senority:4, dep:"Accounting", hired:"06/10/2007"},
 *             {firstname:"Angela", lastname:"Martin", senority:5, dep:"Accounting", hired:"10/21/2008"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {text: 'Hired Month',  dataIndex:'hired', xtype:'datecolumn', format:'M'},
 *             {text: 'Department (Yrs)', xtype:'templatecolumn', tpl:'{dep} ({senority})'}
 *         ],
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 * # Convenience Subclasses
 *
 * There are several column subclasses that provide default rendering for various data types
 *
 *  - {@link Ext.grid.column.Action}: Renders icons that can respond to click events inline
 *  - {@link Ext.grid.column.Boolean}: Renders for boolean values
 *  - {@link Ext.grid.column.Date}: Renders for date values
 *  - {@link Ext.grid.column.Number}: Renders for numeric values
 *  - {@link Ext.grid.column.Template}: Renders a value using an {@link Ext.XTemplate} using the record data
 *
 * # Setting Sizes
 *
 * The columns are laid out by a {@link Ext.layout.container.HBox} layout, so a column can either
 * be given an explicit width value or a flex configuration. If no width is specified the grid will
 * automatically the size the column to 100px. For column groups, the size is calculated by measuring
 * the width of the child columns, so a width option should not be specified in that case.
 *
 * # Header Options
 *
 *  - {@link #text}: Sets the header text for the column
 *  - {@link #sortable}: Specifies whether the column can be sorted by clicking the header or using the column menu
 *  - {@link #hideable}: Specifies whether the column can be hidden using the column menu
 *  - {@link #menuDisabled}: Disables the column header menu
 *  - {@link #draggable}: Specifies whether the column header can be reordered by dragging
 *  - {@link #groupable}: Specifies whether the grid can be grouped by the column dataIndex. See also {@link Ext.grid.feature.Grouping}
 *
 * # Data Options
 *
 *  - {@link #dataIndex}: The dataIndex is the field in the underlying {@link Ext.data.Store} to use as the value for the column.
 *  - {@link #renderer}: Allows the underlying store value to be transformed before being displayed in the grid
 */
Ext.define('Ext.grid.column.Column', {
    extend: 'Ext.grid.header.Container',
    alias: 'widget.gridcolumn',
    requires: ['Ext.util.KeyNav', 'Ext.grid.ColumnComponentLayout', 'Ext.grid.ColumnLayout'],
    alternateClassName: 'Ext.grid.Column',

    baseCls: Ext.baseCSSPrefix + 'column-header ' + Ext.baseCSSPrefix + 'unselectable',

    // Not the standard, automatically applied overCls because we must filter out overs of child headers.
    hoverCls: Ext.baseCSSPrefix + 'column-header-over',

    handleWidth: 5,

    sortState: null,

    possibleSortStates: ['ASC', 'DESC'],

    childEls: [
        'titleEl', 'triggerEl', 'textEl'
    ],

    renderTpl:
        '<div id="{id}-titleEl" class="' + Ext.baseCSSPrefix + 'column-header-inner">' +
            '<span id="{id}-textEl" class="' + Ext.baseCSSPrefix + 'column-header-text">' +
                '{text}' +
            '</span>' +
            '<tpl if="!menuDisabled">'+
                '<div id="{id}-triggerEl" class="' + Ext.baseCSSPrefix + 'column-header-trigger"></div>'+
            '</tpl>' +
        '</div>' +
        '{%this.renderContainer(out,values)%}',

    /**
     * @cfg {Object[]} columns
     * An optional array of sub-column definitions. This column becomes a group, and houses the columns defined in the
     * `columns` config.
     *
     * Group columns may not be sortable. But they may be hideable and moveable. And you may move headers into and out
     * of a group. Note that if all sub columns are dragged out of a group, the group is destroyed.
     */

    /**
     * @cfg {String} dataIndex
     * The name of the field in the grid's {@link Ext.data.Store}'s {@link Ext.data.Model} definition from
     * which to draw the column's value. **Required.**
     */
    dataIndex: null,

    /**
     * @cfg {String} text
     * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
     * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
     */
    text: '&#160;',

    /**
     * @cfg {Boolean} sortable
     * False to disable sorting of this column. Whether local/remote sorting is used is specified in
     * `{@link Ext.data.Store#remoteSort}`. Defaults to true.
     */
    sortable: true,

    /**
     * @cfg {Boolean} groupable
     * If the grid uses a {@link Ext.grid.feature.Grouping}, this option may be used to disable the header menu
     * item to group by the column selected. By default, the header menu group option is enabled. Set to false to
     * disable (but still show) the group option in the header menu for the column.
     */

    /**
     * @cfg {Boolean} fixed
     * @deprecated.
     * True to prevent the column from being resizable.
     */

    /**
     * @cfg {Boolean} resizable
     * Set to <code>false</code> to prevent the column from being resizable. Defaults to <code>true</code>
     */

    /**
     * @cfg {Boolean} hideable
     * False to prevent the user from hiding this column. Defaults to true.
     */
    hideable: true,

    /**
     * @cfg {Boolean} menuDisabled
     * True to disable the column header menu containing sort/hide options. Defaults to false.
     */
    menuDisabled: false,

    /**
     * @cfg {Function} renderer
     * A renderer is an 'interceptor' method which can be used transform data (value, appearance, etc.)
     * before it is rendered. Example:
     *
     *     {
     *         renderer: function(value){
     *             if (value === 1) {
     *                 return '1 person';
     *             }
     *             return value + ' people';
     *         }
     *     }
     *
     * @cfg {Object} renderer.value The data value for the current cell
     * @cfg {Object} renderer.metaData A collection of metadata about the current cell; can be used or modified
     * by the renderer. Recognized properties are: tdCls, tdAttr, and style.
     * @cfg {Ext.data.Model} renderer.record The record for the current row
     * @cfg {Number} renderer.rowIndex The index of the current row
     * @cfg {Number} renderer.colIndex The index of the current column
     * @cfg {Ext.data.Store} renderer.store The data store
     * @cfg {Ext.view.View} renderer.view The current view
     * @cfg {String} renderer.return The HTML string to be rendered.
     */
    renderer: false,

    /**
     * @cfg {String} align
     * Sets the alignment of the header and rendered columns. Defaults to 'left'.
     */
    align: 'left',

    /**
     * @cfg {Boolean} draggable
     * False to disable drag-drop reordering of this column. Defaults to true.
     */
    draggable: true,

    // Header does not use the typical ComponentDraggable class and therefore we
    // override this with an emptyFn. It is controlled at the HeaderDragZone.
    initDraggable: Ext.emptyFn,

    /**
     * @cfg {String} tdCls
     * A CSS class names to apply to the table cells for this column.
     */

    /**
     * @cfg {Object/String} editor
     * An optional xtype or config object for a {@link Ext.form.field.Field Field} to use for editing.
     * Only applicable if the grid is using an {@link Ext.grid.plugin.Editing Editing} plugin.
     */

    /**
     * @cfg {Object/String} field
     * Alias for {@link #editor}.
     * @deprecated 4.0.5 Use {@link #editor} instead.
     */

    /**
     * @property {Ext.Element} triggerEl
     * Element that acts as button for column header dropdown menu.
     */

    /**
     * @property {Ext.Element} textEl
     * Element that contains the text in column header.
     */

    /**
     * @private
     * Set in this class to identify, at runtime, instances which are not instances of the
     * HeaderContainer base class, but are in fact, the subclass: Header.
     */
    isHeader: true,

    componentLayout: 'columncomponent',

    initComponent: function() {
        var me = this,
            i,
            len,
            item;

        if (Ext.isDefined(me.header)) {
            me.text = me.header;
            delete me.header;
        }

        // Flexed Headers need to have a minWidth defined so that they can never be squeezed out of existence by the
        // HeaderContainer's specialized Box layout, the ColumnLayout. The ColumnLayout's overridden calculateChildboxes
        // method extends the available layout space to accommodate the "desiredWidth" of all the columns.
        if (me.flex) {
            me.minWidth = me.minWidth || Ext.grid.plugin.HeaderResizer.prototype.minColWidth;
        }
        // Non-flexed Headers may never be squeezed in the event of a shortfall so
        // always set their minWidth to their current width.
        else {
            //me.minWidth = me.width;
            // we cannot set minWidth as that is a user controlled value... we need to not
            // apply shortfall squeeze instead
        }

        if (!me.triStateSort) {
            me.possibleSortStates.length = 2;
        }

        // A group header; It contains items which are themselves Headers
        if (Ext.isDefined(me.columns)) {
            me.isGroupHeader = true;

            //<debug>
            if (me.dataIndex) {
                Ext.Error.raise('Ext.grid.column.Column: Group header may not accept a dataIndex');
            }
            if ((me.width && me.width !== Ext.grid.header.Container.prototype.defaultWidth) || me.flex) {
                Ext.Error.raise('Ext.grid.column.Column: Group header does not support setting explicit widths or flexs. The group header width is calculated by the sum of its children.');
            }
            //</debug>

            // The headers become child items
            me.items = me.columns;
            delete me.columns;
            delete me.flex;
            delete me.width;
            me.cls = (me.cls||'') + ' ' + Ext.baseCSSPrefix + 'group-header';
            me.sortable = false;
            me.resizable = false;
            me.align = 'center';
        } else {
            // If we are not a group header, then this is not to be used as a container, and must not have a container layout executed, and it must
            // acquire layout height from DOM content, not from child items.
            me.isContainer = false;
        }
        me.addCls(Ext.baseCSSPrefix + 'column-header-align-' + me.align);

        // Initialize as a HeaderContainer
        me.callParent(arguments);

        me.on({
            element:  'el',
            click:    me.onElClick,
            dblclick: me.onElDblClick,
            scope:    me
        });
        me.on({
            element:    'titleEl',
            mouseenter: me.onTitleMouseOver,
            mouseleave: me.onTitleMouseOut,
            scope:      me
        });
    },

    onAdd: function(childHeader) {
        childHeader.isSubHeader = true;
        childHeader.addCls(Ext.baseCSSPrefix + 'group-sub-header');
        this.callParent(arguments);
    },

    onRemove: function(childHeader) {
        childHeader.isSubHeader = false;
        childHeader.removeCls(Ext.baseCSSPrefix + 'group-sub-header');
        this.callParent(arguments);
    },

    initRenderData: function() {
        var me = this;
        return Ext.applyIf(me.callParent(arguments), {
            text: me.text,
            menuDisabled: me.menuDisabled
        });
    },

    applyColumnState: function (state) {
        var me = this,
            defined = Ext.isDefined;
            
        // apply any columns
        me.applyColumnsState(state.columns);

        // Only state properties which were saved should be restored.
        // (Only user-changed properties were saved by getState)
        if (defined(state.hidden)) {
            me.hidden = state.hidden;
        }
        if (defined(state.locked)) {
            me.locked = state.locked;
        }
        if (defined(state.sortable)) {
            me.sortable = state.sortable;
        }
        if (defined(state.width)) {
            delete me.flex;
            me.width = state.width;
        } else if (defined(state.flex)) {
            delete me.width;
            me.flex = state.flex;
        }
    },

    getColumnState: function () {
        var me = this,
            columns = [],
            state = {
                id: me.headerId
            };

        me.savePropsToState(['hidden', 'sortable', 'locked', 'flex', 'width'], state);
        
        if (me.isGroupHeader) {
            me.items.each(function(column){
                columns.push(column.getColumnState());
            });
            if (columns.length) {
                state.columns = columns;
            }
        } else if (me.isSubHeader && me.ownerCt.hidden) {
            // don't set hidden on the children so they can auto height
            delete me.hidden;
        }

        if ('width' in state) {
            delete state.flex; // width wins
        }
        return state;
    },

    /**
     * Sets the header text for this Column.
     * @param {String} text The header to display on this Column.
     */
    setText: function(text) {
        this.text = text;
        if (this.rendered) {
            this.textEl.update(text);
        }
    },

    // Find the topmost HeaderContainer: An ancestor which is NOT a Header.
    // Group Headers are themselves HeaderContainers
    getOwnerHeaderCt: function() {
        return this.up(':not([isHeader])');
    },

    /**
     * Returns the true grid column index associated with this column only if this column is a base level Column. If it
     * is a group column, it returns `false`.
     * @return {Number}
     */
    getIndex: function() {
        return this.isGroupColumn ? false : this.getOwnerHeaderCt().getHeaderIndex(this);
    },

    beforeRender: function() {
        var me = this,
            grid = me.up('tablepanel');

        me.callParent();

        // Disable the menu if there's nothing to show in the menu, ie:
        // Column cannot be sorted, grouped or locked, and there are no grid columns which may be hidden
        if (grid && (!me.sortable || grid.sortableColumns === false) && !me.groupable &&
                     !me.lockable && (grid.enableColumnHide === false ||
                     !me.getOwnerHeaderCt().getHideableColumns().length)) {
            me.menuDisabled = true;
        }
    },

    afterRender: function() {
        var me = this,
            el = me.el;

        me.callParent(arguments);

        if (me.overCls) {
            el.addClsOnOver(me.overCls);
        }

        // BrowserBug: Ie8 Strict Mode, this will break the focus for this browser,
        // must be fixed when focus management will be implemented.
        if (!Ext.isIE8 || !Ext.isStrict) {
            me.mon(me.getFocusEl(), {
                focus: me.onTitleMouseOver,
                blur: me.onTitleMouseOut,
                scope: me
            });
        }

        me.keyNav = new Ext.util.KeyNav(el, {
            enter: me.onEnterKey,
            down: me.onDownKey,
            scope: me
        });
    },

    /**
     * Sets the width of this Column.
     * @param {Number} width New width.
     */
    setWidth: function(width, /* private - used internally */ doLayout) {
        var me = this,
            headerCt = me.ownerCt,
            siblings,
            len, i,
            oldWidth = me.getWidth(),
            groupWidth = 0,
            sibling;

        if (width !== oldWidth) {
            me.oldWidth = oldWidth;

            // Non-flexed Headers may never be squeezed in the event of a shortfall so
            // always set the minWidth to their current width.
            me.minWidth = me.width = width;

            // Bubble size changes upwards to group headers
            if (headerCt.isGroupHeader) {
                siblings = headerCt.items.items;
                len = siblings.length;

                for (i = 0; i < len; i++) {
                    sibling = siblings[i];
                    if (!sibling.hidden) {
                        groupWidth += (sibling === me) ? width : sibling.getWidth();
                    }
                }
                headerCt.setWidth(groupWidth, doLayout);
            } else if (doLayout !== false) {
                // Allow the owning Container to perform the sizing
                headerCt.doLayout();
            }
        }
    },

    afterComponentLayout: function(width, height, oldWidth, oldHeight) {
        var me = this,
            ownerHeaderCt = me.getOwnerHeaderCt();

        me.callParent(arguments);

        // Skip this if it's the initial size setting in which case there is no ownerheaderCt yet - that is set afterRender
        // Skip firing a resize event if the oldWidth is undefined which will be the first Component layout
        if (ownerHeaderCt) {
            if (width !== oldWidth) {
                ownerHeaderCt.onHeaderResize(me, width, true);
            }
        }
        delete me.oldWidth;
    },

    // private
    // After the container has laid out and stretched, it calls this to correctly pad the inner to center the text vertically
    // Total available header height must be passed to enable padding for inner elements to be calculated.
    setPadding: function(headerHeight) {
        var me = this,
            lineHeight = parseInt(me.textEl.getStyle('line-height'), 10);

        // Top title containing element must stretch to match height of sibling group headers
        if (!me.isGroupHeader) {
            if (me.titleEl.getHeight() < headerHeight) {
                me.titleEl.dom.style.height = headerHeight + 'px';
            }
        }
        headerHeight = me.titleEl.getViewSize().height;

        // Vertically center the header text in potentially vertically stretched header
        if (lineHeight) {
            me.titleEl.setStyle({
                paddingTop: Math.max(((headerHeight - lineHeight) / 2), 0) + 'px'
            });
        }

        // Only IE needs this
        if (Ext.isIE && me.triggerEl) {
            me.triggerEl.setHeight(headerHeight);
        }
    },

    onDestroy: function() {
        var me = this;
        // force destroy on the textEl, IE reports a leak
        Ext.destroy(me.textEl, me.keyNav);
        delete me.keyNav;
        me.callParent(arguments);
    },

    onTitleMouseOver: function() {
        this.titleEl.addCls(this.hoverCls);
    },

    onTitleMouseOut: function() {
        this.titleEl.removeCls(this.hoverCls);
    },

    onDownKey: function(e) {
        if (this.triggerEl) {
            this.onElClick(e, this.triggerEl.dom || this.el.dom);
        }
    },

    onEnterKey: function(e) {
        this.onElClick(e, this.el.dom);
    },

    /**
     * @private
     * Double click
     * @param e
     * @param t
     */
    onElDblClick: function(e, t) {
        var me = this,
            ownerCt = me.ownerCt;
        if (ownerCt && Ext.Array.indexOf(ownerCt.items, me) !== 0 && me.isOnLeftEdge(e) ) {
            ownerCt.expandToFit(me.previousSibling('gridcolumn'));
        }
    },

    onElClick: function(e, t) {

        // The grid's docked HeaderContainer.
        var me = this,
            ownerHeaderCt = me.getOwnerHeaderCt();

        if (ownerHeaderCt && !ownerHeaderCt.ddLock) {
            // Firefox doesn't check the current target in a within check.
            // Therefore we check the target directly and then within (ancestors)
            if (me.triggerEl && (e.target === me.triggerEl.dom || t === me.triggerEl.dom || e.within(me.triggerEl))) {
                ownerHeaderCt.onHeaderTriggerClick(me, e, t);
            // if its not on the left hand edge, sort
            } else if (e.getKey() || (!me.isOnLeftEdge(e) && !me.isOnRightEdge(e))) {
                me.toggleSortState();
                ownerHeaderCt.onHeaderClick(me, e, t);
            }
        }
    },

    /**
     * @private
     * Process UI events from the view. The owning TablePanel calls this method, relaying events from the TableView
     * @param {String} type Event type, eg 'click'
     * @param {Ext.view.Table} view TableView Component
     * @param {HTMLElement} cell Cell HtmlElement the event took place within
     * @param {Number} recordIndex Index of the associated Store Model (-1 if none)
     * @param {Number} cellIndex Cell index within the row
     * @param {Ext.EventObject} e Original event
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e) {
        return this.fireEvent.apply(this, arguments);
    },

    toggleSortState: function() {
        var me = this,
            idx,
            nextIdx;

        if (me.sortable) {
            idx = Ext.Array.indexOf(me.possibleSortStates, me.sortState);

            nextIdx = (idx + 1) % me.possibleSortStates.length;
            me.setSortState(me.possibleSortStates[nextIdx]);
        }
    },

    doSort: function(state) {
        var ds = this.up('tablepanel').store;
        ds.sort({
            property: this.getSortParam(),
            direction: state
        });
    },

    /**
     * Returns the parameter to sort upon when sorting this header. By default this returns the dataIndex and will not
     * need to be overriden in most cases.
     * @return {String}
     */
    getSortParam: function() {
        return this.dataIndex;
    },

    //setSortState: function(state, updateUI) {
    //setSortState: function(state, doSort) {
    setSortState: function(state, skipClear, initial) {
        var me = this,
            colSortClsPrefix = Ext.baseCSSPrefix + 'column-header-sort-',
            ascCls = colSortClsPrefix + 'ASC',
            descCls = colSortClsPrefix + 'DESC',
            nullCls = colSortClsPrefix + 'null',
            ownerHeaderCt = me.getOwnerHeaderCt(),
            oldSortState = me.sortState;

        if (oldSortState !== state && me.getSortParam()) {
            me.addCls(colSortClsPrefix + state);
            // don't trigger a sort on the first time, we just want to update the UI
            if (state && !initial) {
                me.doSort(state);
            }
            switch (state) {
                case 'DESC':
                    me.removeCls([ascCls, nullCls]);
                    break;
                case 'ASC':
                    me.removeCls([descCls, nullCls]);
                    break;
                case null:
                    me.removeCls([ascCls, descCls]);
                    break;
            }
            if (ownerHeaderCt && !me.triStateSort && !skipClear) {
                ownerHeaderCt.clearOtherSortStates(me);
            }
            me.sortState = state;
            ownerHeaderCt.fireEvent('sortchange', ownerHeaderCt, me, state);
        }
    },

    hide: function() {
        var me = this,
            items,
            len, i,
            lb,
            newWidth = 0,
            ownerHeaderCt = me.getOwnerHeaderCt();

        // Hiding means setting to zero width, so cache the width
        me.oldWidth = me.getWidth();

        // Hiding a group header hides itself, and then informs the HeaderContainer about its sub headers (Suppressing header layout)
        if (me.isGroupHeader) {
            items = me.items.items;
            me.callParent(arguments);
            ownerHeaderCt.onHeaderHide(me);
            for (i = 0, len = items.length; i < len; i++) {
                items[i].hidden = true;
                ownerHeaderCt.onHeaderHide(items[i], true);
            }
            return;
        }

        // TODO: Work with Jamie to produce a scheme where we can show/hide/resize without triggering a layout cascade
        lb = me.ownerCt.componentLayout.layoutBusy;
        me.ownerCt.componentLayout.layoutBusy = true;
        me.callParent(arguments);
        me.ownerCt.componentLayout.layoutBusy = lb;

        // Notify owning HeaderContainer
        ownerHeaderCt.onHeaderHide(me);

        if (me.ownerCt.isGroupHeader) {
            // If we've just hidden the last header in a group, then hide the group
            items = me.ownerCt.query('>:not([hidden])');
            if (!items.length) {
                me.ownerCt.hide();
            }
            // Size the group down to accommodate fewer sub headers
            else {
                for (i = 0, len = items.length; i < len; i++) {
                    newWidth += items[i].getWidth();
                }
                me.ownerCt.minWidth = newWidth;
                me.ownerCt.setWidth(newWidth);
            }
        }
    },

    show: function() {
        var me = this,
            ownerCt = me.ownerCt,
            ownerCtCompLayout = ownerCt.componentLayout,
            ownerCtCompLayoutBusy = ownerCtCompLayout.layoutBusy,
            ownerCtLayout = ownerCt.layout,
            ownerCtLayoutBusy = ownerCtLayout.layoutBusy,
            items,
            len, i,
            item,
            newWidth = 0;

        // TODO: Work with Jamie to produce a scheme where we can show/hide/resize without triggering a layout cascade

        // Suspend our owner's layouts (both component and container):
        ownerCtCompLayout.layoutBusy = ownerCtLayout.layoutBusy = true;

        me.callParent(arguments);

        ownerCtCompLayout.layoutBusy = ownerCtCompLayoutBusy;
        ownerCtLayout.layoutBusy = ownerCtLayoutBusy;

        // If a sub header, ensure that the group header is visible
        if (me.isSubHeader) {
            if (!ownerCt.isVisible()) {
                ownerCt.show();
            }
        }

        // If we've just shown a group with all its sub headers hidden, then show all its sub headers
        if (me.isGroupHeader && !me.query(':not([hidden])').length) {
            items = me.query('>*');
            for (i = 0, len = items.length; i < len; i++) {
                item = items[i];
                item.preventLayout = true;
                item.show();
                newWidth += item.getWidth();
                delete item.preventLayout;
            }
            me.setWidth(newWidth);
        }

        // Resize the owning group to accommodate
        if (ownerCt.isGroupHeader && me.preventLayout !== true) {
            items = ownerCt.query('>:not([hidden])');
            for (i = 0, len = items.length; i < len; i++) {
                newWidth += items[i].getWidth();
            }
            ownerCt.minWidth = newWidth;
            ownerCt.setWidth(newWidth);
        }

        // Notify owning HeaderContainer
        ownerCt = me.getOwnerHeaderCt();
        if (ownerCt) {
            ownerCt.onHeaderShow(me, me.preventLayout);
        }
    },

    getDesiredWidth: function() {
        var me = this;
        if (me.rendered && me.componentLayout && me.componentLayout.lastComponentSize) {
            // headers always have either a width or a flex
            // because HeaderContainer sets a defaults width
            // therefore we can ignore the natural width
            // we use the componentLayout's tracked width so that
            // we can calculate the desired width when rendered
            // but not visible because its being obscured by a layout
            return me.componentLayout.lastComponentSize.width;
        // Flexed but yet to be rendered this could be the case
        // where a HeaderContainer and Headers are simply used as data
        // structures and not rendered.
        }
        else if (me.flex) {
            // this is going to be wrong, the defaultWidth
            return me.width;
        }
        else {
            return me.width;
        }
    },

    getCellSelector: function() {
        return '.' + Ext.baseCSSPrefix + 'grid-cell-' + this.getItemId();
    },

    getCellInnerSelector: function() {
        return this.getCellSelector() + ' .' + Ext.baseCSSPrefix + 'grid-cell-inner';
    },

    isOnLeftEdge: function(e) {
        return (e.getXY()[0] - this.el.getLeft() <= this.handleWidth);
    },

    isOnRightEdge: function(e) {
        return (this.el.getRight() - e.getXY()[0] <= this.handleWidth);
    }

    // intentionally omit getEditor and setEditor definitions bc we applyIf into columns
    // when the editing plugin is injected

    /**
     * @method getEditor
     * Retrieves the editing field for editing associated with this header. Returns false if there is no field
     * associated with the Header the method will return false. If the field has not been instantiated it will be
     * created. Note: These methods only has an implementation if a Editing plugin has been enabled on the grid.
     * @param {Object} record The {@link Ext.data.Model Model} instance being edited.
     * @param {Object} defaultField An object representing a default field to be created
     * @return {Ext.form.field.Field} field
     */
    /**
     * @method setEditor
     * Sets the form field to be used for editing. Note: This method only has an implementation if an Editing plugin has
     * been enabled on the grid.
     * @param {Object} field An object representing a field to be created. If no xtype is specified a 'textfield' is
     * assumed.
     */
});
