Ext.define('KitchenSink.view.examples.trees.BasicTree', {
    extend: 'KitchenSink.view.examples.Example',

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    
    defaults: {
        defaults: {
            xtype: 'treepanel',
            width: 300,
            height: 200,
            margin: 10,
            rootVisible: false,
            lines: false,
            useArrows: false,
            store: Ext.create('KitchenSink.store.TreeStore')
        },

        style: 'background:transparent',
        bodyStyle: 'background:transparent',

        layout: {
            type : 'hbox',
            align: 'center',
            pack : 'center'
        }
    },
    
    items: [
        {
            items: [
                {
                    title: 'Tree'
                },
                {
                    title: 'Tree with lines',
                    lines: true
                }
            ]
        },
        {
            items: [
                {
                    title: 'Tree with arrows',
                    useArrows: true
                },
                {
                    title: 'Tree with arrows and lines',
                    useArrows: true,
                    lines: true
                }
            ]
        },
    ]
});