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
				me.highlightCodeBloc(me.getEl().dom);
				me.setLoading(false);
			}
		});
	},
	
	highlightCodeBloc: function(parentDom) {
		SyntaxHighlighter.config.useScriptTags = false;
		SyntaxHighlighter.defaults.toolbar = false;

		var elems = Ext.DomQuery.select('pre code', parentDom);
		for (var i = 0; i < elems.length; i++) {
			var code = elems[i];
			var brush = this.detectCodeType(code);
			SyntaxHighlighter.highlight({
				brush: brush
			}, code);
		}

	},

	detectCodeType: function(code) {
		var text = Ext.String.htmlDecode(code.innerHTML);
		if (Ext.String.trim(text).substr(0, 2) == "<?") {
			return "php";
		}

		// Check if there is the line type=brushname
		// If there is, then isolate brushname and then remove the line
		var lines = text.split("\n");
		if (lines.length && lines[0].indexOf("type=") == 0) {
			var brush = lines[0].substr(5);
			lines.shift();
			code.innerHTML = Ext.String.htmlEncode(lines.join("\n"));
			return brush;
		}

		return "html";
	}
});
