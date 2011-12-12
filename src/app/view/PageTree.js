Ext.define('Refer.view.PageTree', {
	extend: 'Ext.tree.Panel',
	requires: ['Refer.store.PageStore'],
	
	alias: 'widget.pagetree',

	store: Ext.create('Refer.store.PageStore'),

	rootVisible: false
});
