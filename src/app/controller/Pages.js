Ext.define('Refer.controller.Pages', {
	extend: 'Ext.app.Controller',
	views: ['PageTree', 'Page', 'Header', 'Footer'],

	refs: [{
		ref: 'page',
		selector: 'page'
	},{
		ref: 'pagetree',
		selector: 'pagetree'
	}],

	init: function() {
		this.control({
			'pagetree': {
				itemclick: {
					fn: function(pagetree, record) {
						if (record.get('leaf')) {
							var path_elems = [record.get('id')];

							var node = record.parentNode;

							while (node && node.parentNode) {
								if (node.get('text') != '') {
									path_elems.unshift(node.get('text'));
								}
								node = node.parentNode;
							}
							
							this.loadPage(path_elems);
						}
					},
					scope: this
				}
			}
		});
	},
	
	procedeHash: function() {
        if (window.location.hash) {
			var path_elems = window.location.hash.split('/');
			var exclamation = path_elems.shift();
			if (exclamation == "#!") {
				this.loadPage(path_elems, true);
				this.getPagetree().on('load', function(store) {
					this.expandPath('/root/' + path_elems.join('/'));
					this.selectPath('/root/' + path_elems.join('/'));
				});
			}
		}
    },
	
	loadPage: function(path_elems, no_hash) {
		var path = path_elems.join('/') + ".html";

		this.getPage().loadPage(path);

		if (no_hash == false) {
			window.location.hash = "!/" + path_elems.join('/');
		}
	}
	
});
