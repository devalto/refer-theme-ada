Ext.define('Refer.view.Page', {

	extend: 'Ext.panel.Panel',

	alias: 'widget.page',

	pagesPath: 'pages',

	ui: 'documentation-page',

	autoScroll: true,

	loadPage: function(page) {
		var me = this;

		this.setLoading(true);

		Ext.Ajax.request({
			url: this.pagesPath + '/' + page,
			success: function(response) {
				me.update(response.responseText);
				me.setLoading(false);
			}
		});
	}
});
