/*==============================================================
EWA : Element Insertion
==============================================================*/
/*
	insert a temporary object / requested object
*/
ewa.createTempObj = function(jump, el){
	txt = ewa.getSelected(true);
	_newEl = (typeof el=="object") ? el : $('<img>', {'src':'img/none.png'});
	if (txt!=='' && typeof el=="object") _newEl.html( txt );
	if (jump==true && !ewa.tools.forceInside){
   		if ( ewa.elements.active.id==ewa.bodyID ) ewa.elements.active.object.append( _newEl );
		else 		
			ewa.elements.active.object.after( _newEl );
	}
    else {
		// on doit vérifier que le curseur est dans cet élement, si non nous allons pas utiliser l'insertion à la sélection.
    	if (ewa.elements.active.id == ewa.elements.focused.id || el==undefined) {
    	 	var selection = window.getSelection();
			var range = selection.getRangeAt(0);
        	var el = _newEl.get(0);
        	range.deleteContents();
	        range.insertNode(el);
	        range.setStartAfter(el);
	        if ( ewa.elements.getTagLevel(_newEl)==6 ) range.insertNode( document.createTextNode(" \u00a0") );
			selection.removeAllRanges(); // Avoid no linear selections
	        selection.addRange(range);
    	} else 
    		return ewa.createTempObj(true, _newEl);
    }
    return txt;
}

ewa.tools.nid = null;
/*
	insert a new element with temp object insertion
*/
ewa.tools.placeElement = function(tag, text, attrs, jump){
	var _newEl = $('<'+tag+'>',attrs).html(text) ;
	ewa.createTempObj(jump, _newEl);
	ewa.elements.insertHtml(_newEl);
    return _newEl;
}

/*
	insert an Element
*/
ewa.UI.insert.hpr.on('click',function(e){
			
	var action = typeof $(this).attr('id')!=='undefined' ? $(this).attr('id').replace('insert_','') : '';
	ewa.tools.nid = idAlea();
	
	var tag = $(this).attr('data-tag');
	var attrs = {};
	if ( typeof $(this).attr('data-class')!=='undefined' ) attrs['class'] = $(this).attr('data-class');
	
	var txt = ewa.translations.htmlText.default; 									// default texte
	var tagLevel = ewa.elements.getTagLevel( tag ); 	// level of requested tag
	var current = ewa.elements.active.object;			// active object
	var parent = ewa.elements.active.object.parent();	// parent of active object

	if (ewa.elements.active.id == ewa.bodyID ) {
		insertAfter = false;							// inside body root
	} else {		
		while ( 	tagLevel < ewa.elements.getTagLevel( current ) 	// search near valid element
				&& 	tagLevel <= ewa.elements.getTagLevel( parent ) 
				&& 	current.attr('id')!==ewa.bodyID  
				&& 	parent.attr('id')!==ewa.bodyID 
		) {
			current = current.parent();
			parent = current.parent();
		}		
		insertAfter = false;
		
		if ( tagLevel <= ewa.elements.getTagLevel( current )  ) insertAfter = true;
		if ( tagLevel > ewa.elements.getTagLevel( current )  ) insertAfter = false;
		current.trigger('click');
		switch (ewa.elements.active.type){
			case 'UL':
			case 'OL':
				if (tag=='li'){
					insertAfter = false;
					ewa.elements.active.object.find('li:last').click(); // insertion after the last <li>
				} else 
					insertAfter = true;
				break;
		}
	}	
	var headLevel = function(elt){
		if (elt==undefined) elt = current;
		var h = elt.find('h1, h2, h3, h4, h5, h6').first();
		console.log( ewa.elements.getTagLevel( current ) );
		console.log( tagLevel );
		if ( h.length!==0 ) {
			var level = parseInt(h.get(0).tagName.replace('H',''));
			if ( (insertAfter==false  || ewa.tools.forceInside) || ewa.elements.getTagLevel( current ) > tagLevel )
				level++;
			if (level>6) level = 6;
			return level;
		}
		return ewa.UI.titleTagStart;
	}
	switch (tag){	
		case 'section':
			var n = headLevel();
			txt = '<h'+n+'>'+ewa.translations.htmlText.section+'</h'+n+'><p>'+ewa.translations.htmlText.p+'</p><br>';
			break;
		case 'article':
			var n = headLevel();
			txt = '<h'+n+'>'+ewa.translations.htmlText.article+'</h'+n+'><p>'+ewa.translations.htmlText.p+'</p><br>';
			break;
		case 'div':
			if (typeof attrs['class']!=='undefined' && attrs['class'].search('row')!==-1) 
				txt = '<p class="col-md-12">'+ewa.translations.htmlText.row+'</p>';
			else txt = "<p>"+ewa.translations.htmlText.p+"</p><br>";
			break;
		
		case 'header':
			txt = ewa.translations.htmlText.header	
			break;
		case 'footer':
			txt = ewa.translations.htmlText.footer;
			break;
		case 'nav':
			txt = ewa.translations.htmlText.nav+'<ul><li>'+ewa.translations.htmlText.link+' 1<li></ul>';
			break;
			
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			txt = ewa.translations.htmlText.h+" "+tag.replace('h','');
			break;		
		case 'aside':
			txt	= ewa.translations.htmlText.aside;
			break;			
		case 'ul':
		case 'ol':
			txt = '<li>'+ewa.translations.htmlText.li+'</li>';
			break;
		case 'li':
			insertAfter = true;
			txt = ewa.translations.htmlText.li;
			break;	
		case 'p':
			txt = ewa.translations.htmlText.p;
			break;
	}
	newEl = ewa.tools.placeElement(tag, txt, attrs, insertAfter); // place the new element
	newEl.trigger('click');	// selection this new element
	// custom selection
	switch(tag){
		case 'ul':
		case 'ol':
			newEl = newEl.find('li').trigger('click');
			break;
		case 'section':
			newEl = newEl.trigger('click');
			break;
		case 'article':
		case 'div':
			newEl = newEl.find('p').trigger('click');
			break;
	}
	ewa.tools.caretAtEnd(newEl.get(0)); // place caret at end of the selected element
})
/*
	insert an Image
*/
ewa.UI.insert.insertImage = function(url, alt, linkwrap){
	switch( ewa.UI.insert.destination){
		case 'new' : 
			//new image insertion
			image = $('img[src="img/none.png"]');
			image.attr('src',url );
			if (alt!=null && alt!="") image.attr('alt',alt ) 
			if (linkwrap) image.wrap($('<a>', {'href':url, 'target': '_blank'}));
			ewa.elements.insertHtml( image );
			image.click();
		break;
	}
}
/*
	insert a Link
*/
ewa.UI.insert.insertLink = function(url, txt, selected, target){
	switch( ewa.UI.insert.destination){
		case 'new' : 
			// new link insertion
			if (txt==null || txt=='' || txt=='NewLink') txt = url;
			var a = $('a[href="NewLink"]').attr('href', url);
			if (selected=='' || txt!==selected) a.text(txt);
			if (target!='') a.attr('target', target);
		break;

	}
}
/*
	insert a Table
*/
ewa.UI.insert.insertTable = function( cols, rows, caption, header ){
	var table = $('<table>').css({'width':'100%'});
	if (border) table.attr( 'border', "1");

	if (caption) table.append( $('<caption>').text('Titre du tableau')  );
	if (header){
		var thead = $('<thead>').append( $('<tr>') );
		// head building
		for(var i=1 ; i<=cols; i++)
			thead.find('tr').append( $('<th>').text('Titre Col. '+i) );		
		table.append(thead);
	}
	var tbody = $('<tbody>');
	for(var r=1 ; r<=rows; r++){
		row = $('<tr>');
		for(var c=1 ; c<=cols; c++)
			row.append( $('<td>').text('Cellule '+c) );
		tbody.append(row);
	}
	table.append(tbody);
	$('img[src="img/none.png"]').replaceWith(table);
	ewa.elements.insertHtml(table);
}

ewa.UI.insert.obj.on('mouseup', function(e){
	e.preventDefault();
});

/*
	generic nodal div building for element insertion
*/
ewa.tools.createInsertNode = function(type, title, content, callback, footer){
	if (typeof footer=='undefined') 
		footer = $('<ul>').append(
			$('<li>').append('<input type="text" data-input="nameFile">'),
			$('<li>', {'class':'btn btn-default glyphicon glyphicon-ok btn-nav-action'}).on('click', function(){ callback() })
	
		);
	ewa.nodes.insert('editor-ui-'+type+'Insert', title);
	ewa.nodes.insertContent('editor-ui-'+type+'Insert', content);
	ewa.nodes.insertFooter('editor-ui-'+type+'Insert', footer);
	$('#editor-ui-'+type+'Insert').addClass('smallNode');
}
/*
	 request element insertion
*/
ewa.UI.insert.obj.on('click',function(){
	ewa.elements.active.object.focus();
	var nid = idAlea();	
	switch($(this).attr('data-obj')){
		case 'picture':
			var imgInsert = function(){
				ewa.UI.insert.destination = 'new';
				var GUI = $('#editor-ui-imgInsert');
				src =GUI.find('[data-input=nameFile]').val();
				alt = GUI.find('[data-input=altContent]').val();
				linkwrap = GUI.find('[data-input=imgWrap]').is(':checked');
				ewa.UI.insert.insertImage( src, alt, linkwrap);
				GUI.hide(100).queue(function(){
					$(this).dequeue().remove();
				});
			};
			alt = ewa.createTempObj();
			var content = $('<div>').append(
				$('<button>', {'data-action': 'upload', 'class':'btn-default glyphicon glyphicon-upload'}),
				$('<button>', {'data-action': 'select', 'class':'btn-default glyphicon glyphicon-folder-open'})
						.on('click', function(){ ewa.navigator.action.Explore('img') }),
				$('<div>').append('<br><label>'+ewa.translations.nodes.image.alt+'</label> <br><input type="text" data-input="altContent" style="width: 250px" value="'+alt+'">'),
				$('<div>').append('<br><input type="checkbox" data-input="imgWrap" id="editor-ui-imgWrap" value="_blank"><label for="editor-ui-imgWrap">'+ewa.translations.nodes.image.link+'</label>')
			);
			ewa.tools.createInsertNode('img',ewa.translations.nodes.image.title, content, imgInsert);
			
			break;
		case 'link':	
			selected = ewa.getSelected();
		    var newLink = document.execCommand('createlink', false, 'NewLink');
			var linkInsert = function(){
				var GUI = $('#editor-ui-linkInsert');
				ewa.UI.insert.destination = 'new';
				href = GUI.find('[data-input=nameFile]').val();
				txt = GUI.find('[data-input=linkText]').val();
				sel = GUI.find('[data-input=linkText]').attr('data-init');
				target = GUI.find('[data-input=linkTarget]').is(':checked') ? '_blank' : '';
				ewa.UI.insert.insertLink( href, txt, sel, target );
				GUI.hide(100).queue(function(){
					$(this).dequeue().remove();
				});
			};
			var content = $('<div>').append(
				$('<button>', {'data-action': 'select', 'class':'btn-default glyphicon glyphicon-folder-open'}).on('click', function(){ ewa.navigator.action.Explore('link') }),
				$('<div>').append('<br><label>,'+ewa.translations.nodes.link.txt+'</label> <br><input type="text" data-input="linkText" style="width: 250px" value="'+selected+'" data-init="'+selected+'">'),
				$('<div>').append('<br><input type="checkbox" data-input="linkTarget" id="editor-ui-linkTarget" value="_blank"><label for="editor-ui-linkTarget">'+ewa.translations.nodes.link.target+'</label>')
				
			);
			ewa.tools.createInsertNode('link',ewa.translations.nodes.link.title, content, linkInsert);
			$('#editor-ui-linkInsert').find('[role=closeNode]').on('click', function(){
				 if (selected=false || selected=='') $('a[href=NewLink]').remove();
				 else {
				 	$('a[href=NewLink]').click();
				 	ewa.elements.active.unwrap.click();	
				 }
				 ewa.elements.active.object.focus();
			})
			break;
		case 'table':
			var jump = (ewa.elements.active.level==5);	
			alt = ewa.createTempObj(jump);
			var tableInsert = function(){
				var GUI = $('#editor-ui-tableInsert');
				ewa.UI.insert.destination = 'new';
				cols 		= GUI.find('[data-input=COLS]').val();
				rows 		= GUI.find('[data-input=ROWS]').val();
				caption 	= GUI.find('[data-input=tableCaption]').is(':checked') ? true : false;
				header 		= GUI.find('[data-input=tableHeader]').is(':checked') ? true : false;
				border 		= GUI.find('[data-input=tableBorder]').is(':checked') ? true : false;
				ewa.UI.insert.insertTable( cols, rows, caption, header, border );
				GUI.hide(100).queue(function(){
					$(this).dequeue().remove();
				});
			};
			var content = $('<div>').append(
				$('<div>').css('color', '#000000').append('<br><label>'+ewa.translations.nodes.table.cols+'</label> <input type="text" data-input="COLS" style="width: 50px" value="2"> &nbsp;&nbsp;<label>'+ewa.translations.nodes.table.rows+' </label> <input type="text" data-input="ROWS" style="width: 50px" value="2">'),
				$('<div style="text-align: left">').append('<br><input type="checkbox" data-input="tableCaption" checked="checked" id="editor-ui-tableCaption" value="_blank"><label for="editor-ui-tableCaption">'+ewa.translations.nodes.table.caption+' <span style="font-size:.7em">'+ewa.translations.nodes.table.advised+'</span></label><input type="checkbox" data-input="tableHeader" id="editor-ui-tableHeader" value="_blank"><label for="editor-ui-tableHeader">'+ewa.translations.nodes.table.headers+'</label><input type="checkbox" data-input="tableBorder" id="editor-ui-tableBorder" value="_blank"><label for="editor-ui-tableBorder">'+ewa.translations.nodes.table.border+'</label>')
				
			);
			footer = $('<div style="text-align:center">').append(
				$('<span>', {'class':'btn btn-default glyphicon glyphicon-ok btn-nav-action'}).on('click', function(){ tableInsert() })
		
			);
			ewa.tools.createInsertNode('table',ewa.translations.nodes.table.title, content, null, footer);
			break;
		case 'ul':
			$('#insert_UL').click();
			break;
		case 'ol':
			$('#insert_OL').click();
			break;
	}
});