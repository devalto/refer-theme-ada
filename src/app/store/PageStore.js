Ext.define('Refer.store.PageStore', {
	extend: 'Ext.data.TreeStore',
	requires: ['Refer.proxy.Page'],

	proxy: Ext.create('Refer.proxy.Page', {
		reader: {
			type: 'json',
			root: 'children'
		}
	})
});
