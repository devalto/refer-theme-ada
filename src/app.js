Ext.Loader.setConfig({
	enabled: true
});

Ext.application({
	name: 'Refer',

	appFolder: 'app',

	controllers: ['Pages'],

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [{
				layout: 'border',
				items: [{
					region: 'north',
					height: 40,
					xtype: 'header'
				}, {
					region: 'west',
					width: 250,
					xtype: 'pagetree'
				}, {
					region: 'center',
					xtype: 'page'
				}, {
					region: 'south',
					height: 26,
					xtype: 'footer'
				}]
			}]
		});
	}
});
