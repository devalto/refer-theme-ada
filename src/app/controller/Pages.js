Ext.define('Refer.controller.Pages', {
	extend: 'Ext.app.Controller',
	views: ['PageTree', 'Page', 'Header', 'Footer'],

	refs: [{
		ref: 'page',
		selector: 'page'
	}],

	init: function() {
		this.control({
			'pagetree': {
				itemclick: function(pagetree, record) {
					if (record.get('leaf')) {
						var path_elems = [record.get('id')];

						node = record.parentNode;

						while (node && node.parentNode) {
							if (node.get('text') != '') {
								path_elems.unshift(node.get('text'));
							}
							node = node.parentNode;
						}

						var path = path_elems.join('/') + ".html";

						this.getPage().loadPage(path);
					}
				}
			}
		});
	}
});
