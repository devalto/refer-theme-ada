Ext.define('Refer.proxy.Page', {
	extend: 'Ext.data.proxy.Memory',

	read: function(operation, callback, scope) {
		var me = this;
		var reader = me.getReader();

		Ext.Ajax.request({
			url: 'pages.json',
			success: function(response) {
				var node = Ext.JSON.decode(response.responseText);
				var data = me._processNode(node);
				data.text = data.text || "Home";
				data.expanded = true;

				var result = reader.read(data);

				Ext.apply(operation, {
					resultSet: result
				});

				operation.setCompleted();
				operation.setSuccessful();

				Ext.callback(callback, scope || me, [operation]);
			}
		});
	},

	_processNode: function(node) {
		var children = [];

		for (var i = 0; i < node.child_nodes.length; i++) {
			children.push(this._processNode(node.child_nodes[i]));
		}

		for (var i = 0; i < node.pages.length; i++) {
			var page = node.pages[i];
			children.push({
				id: page.id,
				text: page.title,
				leaf: true,
			});
		}

		var data = {
			text: node.name,
			children: children
		};

		return data;
	}
});
