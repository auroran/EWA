/*==============================================================
EWA : UI Tools
==============================================================*/

if (typeof window.getSelection == 'undefined'){
	$('body').html("<div class=\"alert alert-danger\"><h1>"+ewa.translations.msg.notCompatible+"</h1> <strong>"+ewa.translations.msg.notCompatibleInfo+"</strong></div>");
	throw new Error(ewa.translations.msg.notCompatible);
}

ewa.UI.clientX = null;
ewa.UI.clientY = null;
ewa.UI.initX = null;
ewa.UI.initY = null;
ewa.UI.click = null;
ewa.UI.target = null;
ewa.UI.resizableImg = false;
ewa.UI.draggableImg = true;

ewa.getSelected = function(){
 	var selection = window.getSelection();
	return selection.toString();
}
/*
	Define if a target tag exists in a list
*/
ewa.tools.isOn = function( list, target){
	if (list==undefined || target==undefined) return false;
	return ( (" "+list.toLowerCase()+",").search(" "+target.toLowerCase()+",") !==-1 )
}

// Code Mirror integration
ewa.UI.codeEditor = CodeMirror(function(elt) {
	hcoder = ewa.UI.htmlCode.get(0);
	elt.id='editor-ui-htmlCode';
	hcoder.parentNode.replaceChild(elt, hcoder);
	ewa.UI.htmlCode = $(elt);
}, {value: ewa.UI.htmlCode.val(), mode: "text/html"});

ewa.tools.currentHead = ewa.UI.titleTagStart;
// Editor will use Hn, with n>=titleTagStart
for(i=1; i< ewa.UI.titleTagStart; i++){
	$('#insert_H'+i).remove();
	$('#wrap_H'+i).remove();
}

// Elements Wrap menu
$('#wrapEditor').hide();	// not implented yet

// Elements menu
$('[role=insertElement]').click(function(){
	if ( $(this).hasClass('open') ) return;
	// on recupère la liste de compatibilité
	currentLevel = ewa.elements.active.level;
	minLevel = -1;
	maxLevel = 7;
	if (currentLevel>0){
		if (currentLevel<1) maxLevel = 5;
		if (currentLevel>=5) minLevel = 5;
		if (currentLevel>5) minLevel = 6;
		if (currentLevel==7) minLevel = 7;	
	}
	$('li[data-level]').hide().removeClass('forceAfter forceInside hiddenLi').addClass('hiddenLi');
	$('li[data-level=-1]').show().removeClass('hiddenLi');
	for (i=-1; i<=currentLevel; i++)
		$('li[data-level='+i+']').addClass('forceAfter').show().removeClass('hiddenLi');
	for (i=minLevel+1; i<maxLevel; i++)
		$('li[data-level='+i+']').show().removeClass('hiddenLi');

	for(i=6; i>ewa.UI.titleTagStart ; i--){
		if ( ewa.body.find('h'+(i-1)).length ==0 ){
			$('#insert_H'+i).hide().addClass('hiddenLi');
		}
	}

	ewa.elements.active.object.focus();
	if ( !ewa.tools.isOn( 'ul, ol, li',ewa.elements.active.type) ) 
		$('li[data-tag=li]').hide().removeClass('forceAfter hiddenLi').addClass('hiddenLi')
	$(this).find('ul>ul').each(function(){
		if( $(this).find('li').length-$(this).find('li.hiddenLi').length==0)
			$(this).hide();
		else $(this).show();
	})
})	

ewa.tools.closeNode = function(t, keepFocus){
	$('img[src="img/none.png"]').remove();
	t.parent().hide(100).queue(function(){
		$(this).dequeue().remove();
	});
	if (keepFocus==undefined || !keepFocus){
		ewa.elements.active.object.click();
		ewa.tools.caretAtEnd(ewa.elements.active.object.get(0));
	}
}
	
var getOffsetClass = function(){
	var Class = selected.attr('class');
	Class = Class.split(' ');
	for (var i in Class){
		if ( Class[i].search('col-xs-offset-')!==-1 ){
			return {
				'num': 		parseInt( Class[i].replace('col-xs-offset-','') ), 
				'name' : 	Class[i]
			};
		}
	}
	return {'num':0, 'name':''};
}
var getColClass = function(target){
	var Class = target.attr('class');
	Class = Class.split(' ');
	for (var i in Class){
		if ( Class[i].search('col-md-offset-')==-1 && Class[i].search('col-md-')!=-1){
			return {
				'num': 		parseInt( Class[i].replace('col-md-','') ), 
				'name' : 	Class[i]
			};
		}
	}
	return {'num':1, 'name':''};
}

var moveLeft = function(){
	var col = getOffsetClass();
	selected.removeClass(col.name);
	if (col.num-1>0) selected.addClass('col-md-offset-'+(col.num-1) );
}
var moveRight = function(){
	var col = getOffsetClass();
	selected.removeClass(col.name);
	if (col.num+1<12) selected.addClass('col-md-offset-'+(col.num+1) );
}
var sizeUp = function(target){
	var col = getColClass(target);
	target.removeClass(col.name);
	if (col.num+1<12) target.addClass('col-md-'+(col.num+1) );
	else target.addClass('col-md-12');
}
var sizeDown = function(target){
	var col = getColClass(target);
	target.removeClass(col.name);
	if (col.num-1>0) target.addClass('col-md-'+(col.num-1) );
	else target.addClass('col-md-1');

}

BootstrapClassTypes = 'col-';

/*
	Enable/disabe drawing lines
*/
ewa.UI.lineDisplayer.click(function(){
	if ( ewa.body.hasClass('displayLines') ){
		ewa.body.removeClass('displayLines');
		$(this).removeClass('glyphicon-eye-open');
		$(this).addClass('glyphicon-eye-close');
	}
	else {
		ewa.body.addClass('displayLines');
		$(this).removeClass('glyphicon-eye-close');
		$(this).addClass('glyphicon-eye-open');
	}
})

/*
	Switch in HTML Editor mode
*/
ewa.UI.mode.HTML.click(function(){
	ewa.mode.HTML();
});
/*
	Switch in WYSIWYG mode
*/
ewa.UI.mode.WYSIWYG.click(function(){
	ewa.mode.WYSIWYG();
});

/*
	Display informations block about EWA
*/
ewa.UI.ewatitle.click(function(){
	ewa.nodes.insert('ewa_description', ewa.translations.ewa);
	var content = $('<div>').html( ewa.UI.readme.html() ).css(
		{
			'text-align' : 'left',
			'color' : '#222222',
			'padding' : '2em 3em',
			'fontSize' : '1.1em'
		});
	ewa.nodes.insertContent('ewa_description', content);
	ewa.nodes.insertFooter('ewa_description', "© 2015 - Grégory Gaudin")
})

/*
	Set Context Menu from active elements type
*/
ewa.tools.contextFn = function(){
	var items= {
	    "copy": {name: ewa.translations.contextMenu.copy},
	    "cut": {name: ewa.translations.contextMenu.cut},
	    "paste": {name: ewa.translations.contextMenu.paste},
        "sep1": "---------"
    };
	var rowMenu = {
        name: ewa.translations.contextMenu.table.rows,
        items: {
	        insertRowBefore: {name: ewa.translations.contextMenu.table.insertRowBefore},
	        insertRowAfter: {name: ewa.translations.contextMenu.table.insertRowAfter},
			rowT1 : "---------",
			selectRow : {name: ewa.translations.contextMenu.table.selectRow},
	        deleteCurRow: {name: ewa.translations.contextMenu.table.deleteCurRow},
	    }
    }
	var colMenu = {
        name: "Colonnes",
        items: {
	        insertColBefore: {name: ewa.translations.contextMenu.table.insertColBefore},
	        insertColAfter: {name: ewa.translations.contextMenu.table.insertColAfter},
			rowT1 : "---------",
	        deleteCurCol: {name: ewa.translations.contextMenu.table.deleteCurCol}
	    }
    }
	switch(ewa.elements.active.type){
		// Cell
		case 'TD':
			items.row = rowMenu;
			items.col = colMenu;
		case 'TH':	
			map = ewa.elements.mapArray( ewa.elements.active.object.parents("tbody") );
			colspan = typeof ewa.elements.active.object.attr('colspan')!=='undefined' ?
						parseInt(ewa.elements.active.object.attr('colspan')) : 1;
			rowspan = typeof ewa.elements.active.object.attr('rowspan')!=='undefined' ?
						parseInt(ewa.elements.active.object.attr('rowspan')) : 1;
			
			// Get the location of this cell
			var curLoc = ewa.elements.currentArrayMapRel[ewa.elements.active.id];
			var cellItems = {}
			if (curLoc.col>0 && map[curLoc.row][curLoc.col-1]!==false
				&& rowspan == 1
				&& map[curLoc.row][curLoc.col-1]!==false 
				&& ( typeof map[curLoc.row+1]=='undefined' || map[curLoc.row+1][curLoc.col-1]!==false ) ) 
				cellItems.mergeLeft = {name: ewa.translations.contextMenu.table.mergeLeft};
				
			if (ewa.elements.active.object.next('td').length>0 
				&& rowspan == 1
				&& map[curLoc.row][curLoc.col+colspan]!==false 
				&& ( typeof map[curLoc.row+1]=='undefined' || map[curLoc.row+1][curLoc.col+1]!==false) )
				cellItems.mergeRight = {name: ewa.translations.contextMenu.table.mergeRight};
				
			if ( colspan>1 ) {
				cellItems.sepSplit1 = "---------";
				cellItems.splitRight = {name: ewa.translations.contextMenu.table.splitRight};
				cellItems.splitLeft = {name: ewa.translations.contextMenu.table.splitLeft};
				
			} else {
				if (  typeof map[curLoc.row+rowspan]!=='undefined' )
					cellItems.mergeDown = {name: ewa.translations.contextMenu.table.mergeDown};
				if (rowspan>1)
					cellItems.splitDown = {name: ewa.translations.contextMenu.table.splitDown};
			}		
			
			var cellMenu = {
		        name: ewa.translations.contextMenu.table.cells,
		        items: cellItems
		    }
		    items.cellMenu = cellMenu;
			items.sepT1 = "---------";
			items.selectTbody = {name: ewa.translations.contextMenu.table.selectTbody};
			items.selectTable = {name: ewa.translations.contextMenu.table.selectTable};
			if ( ewa.elements.active.object.parents('table').find('caption').length==0){
				items.sepSplitCaption1 = "---------";
				items.createCaption= {
				    name: ewa.translations.contextMenu.table.createCaption
			    }
			}				 
			items.sepB1 = "---------";
			if (typeof ewa.elements.active.object.parents('table').attr('border') =='undefined')
				items.enableBorders= { name: ewa.translations.contextMenu.table.enableBorders}
			else 
				items.disableBorders= { name: ewa.translations.contextMenu.table.disableBorders}
			break;
		// Table line
		case 'TR':
			items.selectTbody = {name: ewa.translations.contextMenu.table.selectTbody};
			items.selectTable = {name: ewa.translations.contextMenu.table.selectTable};
			break;
		// Table caption
		case 'CAPTION':
			items.selectTable = {name: ewa.translations.contextMenu.table.selectTable};
			break;
		// Table body
		case 'TBODY':
			items.row = rowMenu;
			items.col = colMenu;
			items.sepIns1 = "---------";
			items.selectTable = {name: ewa.translations.contextMenu.table.selectTable};
			break;
		case 'TABLE':
			items.row = rowMenu;
			items.col = colMenu;
			items.sepIns1 = "---------";
			if ( ewa.elements.active.object.find('caption').length==0)
			    items.createCaption= {
				    name: ewa.translations.contextMenu.table.createCaption
			    }
			break;
			
		default:				
			ewa.UI.htmlCode.trigger("addons-CONTEXTMENU_SET");
		
	}
	return items;
}
/*
	Set actions on contextual menu
*/
ewa.tools.contextActionFn = function(action){
	switch(action){
		case 'selectRow':
			ewa.elements.active.object.parents('tr').click();
			break;
		case 'selectTbody':
			ewa.elements.active.object.parents('tbody').click();
			break;
		case 'selectTable':
			ewa.elements.active.object.parents('table').click();
			break;
		case 'mergeLeft':
		case 'mergeRight':
			other = (action=='mergeLeft') ? ewa.elements.active.object.prev() : ewa.elements.active.object.next();
			colspan = ( typeof ewa.elements.active.object.attr('colspan')!=='undefined' ) 
						? parseInt(ewa.elements.active.object.attr('colspan')) : 1;
			colspanOther = ( typeof other.attr('colspan')!=='undefined' ) 
						? parseInt(other.attr('colspan')) : 1;
			ewa.elements.active.object.attr('colspan',colspan+colspanOther);
			nhtml = (action=='mergeLeft') 
				? other.html()+' '+ewa.elements.active.object.html() 
				: ewa.elements.active.object.html()+' '+other.html();
			ewa.elements.active.object.html( nhtml );
			other.remove();
			break;
		case 'splitRight':
		case 'splitLeft':
		case 'split':
			colspan = ( typeof ewa.elements.active.object.attr('colspan')!=='undefined' ) 
						? parseInt(ewa.elements.active.object.attr('colspan')) : 1;
			if (colspan==1) return;
			if (colspan>2) ewa.elements.active.object.attr('colspan',colspan-1);
			else ewa.elements.active.object.removeAttr('colspan');
			(action=='splitLeft') ?
				ewa.elements.active.object.before( $('<td>').text('Cellule'))
				: ewa.elements.active.object.after( $('<td>').text('Cellule'));
			break;
		case 'mergeDown':
			// Gett loaction of this cell
			var curLoc = ewa.elements.currentArrayMapRel[ewa.elements.active.id];
			rowspan = ( typeof ewa.elements.active.object.attr('rowspan')!=='undefined' ) 
						? parseInt(ewa.elements.active.object.attr('rowspan')) : 1;
			var target = map[curLoc.row+rowspan][curLoc.col];
			rowspanOther = ( typeof target.attr('rowspan')!=='undefined' ) 
						? parseInt(target.attr('rowspan')) : 1;
			ewa.elements.active.object.attr('rowspan',rowspan+rowspanOther);
			ewa.elements.active.object.html( ewa.elements.active.object.html()+' '+target.html());
			target.remove();
			break;
		case 'insertRowBefore':
		case 'insertRowAfter':
			switch( ewa.elements.active.type ){
				case 'TD':
					target = ewa.elements.active.object.parent();
					break;
				case 'TR':
					target = ewa.elements.active.object;
					break;
				case 'TBODY':
					target = (action == 'insertRowBefore')
						? ewa.elements.active.object.find('tr:first')
						: ewa.elements.active.object.find('tr:last');
					break;
				case 'TABLE':
					target = (action == 'insertRowBefore') 
						? ewa.elements.active.object.find('tbody tr:first')
						: ewa.elements.active.object.find('tbody tr:last');
					break;
				default:
					console.log('Not a valid table element');
					return;
			}
			tr = $('<tr>');
			var count = 0;
			for( var cell in ewa.elements.currentArrayMap[target.index()] ){
				tr.append( $('<td>').text('Cellule '+( parseInt(cell)+1 )) );
				count++;
			}
			if ( target.length == 0 ) return;
			if (action == 'insertRowBefore'){
				while(typeof target.prev()!== 'undefined' && target.find('td').length<count)
					target = target.prev();
			} else {
				while(target.next().length!=0 && target.next().find('td').length<count)
					target = target.next();					
			}
			action == 'insertRowBefore' ? target.before( tr ) : target.after( tr );
			break;
			
		case 'insertColBefore':
		case 'insertColAfter':
			var count = {row: 0, col: 0};
			if (typeof ewa.elements.currentArrayMap[0]=='undefined') return;
			for( var row in ewa.elements.currentArrayMap )
				count.row++;
			for( var row in ewa.elements.currentArrayMap[0] )
				count.col++;
			switch( ewa.elements.active.type ){
				case 'TD':
					col = ewa.elements.currentArrayMapRel[ewa.elements.active.id].col;
					break;
				case 'TR':
				case 'TBODY':
				case 'TABLE':
					col = action == 'insertColBefore' ? 0 : (count.col-1);
				default:
					console.log('Not a valid table element');
					return;
			}
			// col est la colonne de référence
			var tc = 0;
			// positionement de la colonne de référence
			var rel = action == 'insertColBefore' ? -1 : 1;
			while(tc != count.row && col >0 && col<count.col){
				tc = 0;
				for(i=0; i<count.row; i++){
					tc += ( (ewa.elements.currentArrayMap[i][col+rel]==false || (rel==-1 && ewa.elements.currentArrayMap[i][col]==false))  ? 0 : 1 );
				}
				col += rel;
			}
			col += -rel;	// on le fait une fois de trop
			
			for( var row in ewa.elements.currentArrayMap ){
				add = 0;
				while (ewa.elements.currentArrayMap[row][col+add]==false){
					add -= 1; // la première cellule ne peut pas etre =
				}
				action == 'insertColBefore' 
					? ewa.elements.currentArrayMap[row][col+add].before( $('<td>').text(ewa.translations.htmlText.td) )
					: ewa.elements.currentArrayMap[row][col+add].after( $('<td>').text(ewa.translations.htmlText.td) );
			}
			break;
			
		case 'deleteCurRow':
			switch( ewa.elements.active.type ){
				case 'TD':
					target = ewa.elements.active.object.parent();
					break;
				case 'TR':
					target = ewa.elements.active.object;
					break;
				default:
					console.log('Not a valid table element');
					return;
			}
			if ( target.length == 0 ) return;
			target.remove();
			break;
		case 'deleteCurCol':
			if (ewa.elements.active.type!=='TD') return;
			target = ewa.elements.active.object.parent();
			if ( target.length == 0 ) return;
			
			// on récupère l'index de la colonne
			var curLoc = ewa.elements.currentArrayMapRel[ewa.elements.active.id];
			var lastCellRowspan = 1;
			for( var row in ewa.elements.currentArrayMap ){
				if ( ewa.elements.currentArrayMap[row][curLoc.col] !== false
					&& typeof ewa.elements.currentArrayMap[row][curLoc.col] !== 'undefined'){
					// Défini si cette cellule est fusionée avec celle du dessous
					lastCellRowspan = typeof ewa.elements.currentArrayMap[row][curLoc.col].attr('rowspan')!=='undefined' ? 
						parseInt( ewa.elements.currentArrayMap[row][curLoc.col].attr('rowspan') ) : 1;
					// replacement des cellules fusionées
					var colSpan = typeof ewa.elements.currentArrayMap[row][curLoc.col].attr('colspan')!=='undefined' ? 
						parseInt( ewa.elements.currentArrayMap[row][curLoc.col].attr('colspan') ) -1 : 0;
					for (i=0; i< colSpan; i++)
						ewa.elements.currentArrayMap[row][curLoc.col].after( $('<td>').text(ewa.translations.htmlText.td) );
					
					// Suppression de la cellule
					ewa.elements.currentArrayMap[row][curLoc.col].remove();
				} else {
					// selection de la dernière cellule de la ligne
					rel = 1;
					while(curLoc.col-rel>=0 && ewa.elements.currentArrayMap[row][curLoc.col-rel]==false)
						rel++;
					if (lastCellRowspan==1){
						// on réduit le colspan de la cellule précédente si elle en a un
						// et si cette cellule n'est pas fusionnée avec celle du haut
						var prev = ewa.elements.currentArrayMap[row][curLoc.col-rel];
						var colSpan = typeof prev.attr('colspan')!=='undefined' ? 
							parseInt( prev.attr('colspan') ) -1 : 0;
						if (colSpan < 2) prev.removeAttr('colspan');
						else prev.attr('colspan', colSpan);
					}
					else lastCellRowspan--;
				}
			}
				
			break;
		case 'createCaption':
			switch( ewa.elements.active.type ){
				case 'TD':
				case 'TR':
				case 'TBODY':
					target = ewa.elements.active.object.parents('table');
					break;
				case 'TABLE':
					target = ewa.elements.active.object;
				default:
					console.log('Not a valid table element');
					return;
			}
			target.append( $('<caption>').text(ewa.translations.htmlText.caption) );
			break;
		case 'enableBorders':
		case 'disableBorders':
			switch( ewa.elements.active.type ){
				case 'TD':
				case 'TR':
				case 'TBODY':
					target = ewa.elements.active.object.parents('table');
					break;
				case 'TABLE':
					target = ewa.elements.active.object;
				default:
					console.log('Not a valid table element');
					return;
			}
			action=='enableBorders' ? target.attr('border', 1) : target.removeAttr('border');
			break;
		default:
			ewa.UI.htmlCode.trigger("addons-CONTEXTMENU_ACTION");
	}
} 
/*
	Context Menu JQuery plugin
	Plugin from : http://swisnl.github.io/jQuery-contextMenu/
*/
$.contextMenu({
	selector: "#"+ewa.UI.main.attr('id'), 
	trigger: 'none',
	reposition: true,
	build: function($trigger, e) {
	    // this callback is executed every time the menu is to be shown
	    // its results are destroyed every time the menu is hidden
	    // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
	    return {
	        callback: function(key, options) {
	            ewa.tools.contextActionFn(key);
	        },
	        items: ewa.tools.contextFn()
	    };
	}
});

ewa.tools.openContextMenu = function( t, e ){
	t.trigger('click');
	ewa.UI.main.contextMenu({x :e.clientX, y:e.clientY});
	return false;
}

/*
	Convert rgb color to hex
*/
ewa.tools.rgb2hex = function(rgb){
    if (rgb == "transparent") return rgb;
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return  (rgb && rgb.length === 4) ? "#" +
                    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
/*
	Convert hex color to rgba
*/
ewa.tools.convertHex= function(hex,opacity){
	hex = hex.replace('#','');
	r = parseInt(hex.substring(0,2), 16);
	g = parseInt(hex.substring(2,4), 16);
	b = parseInt(hex.substring(4,6), 16);
	result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
	return result;
}
/*
	Convert hex to RGBA Array
*/
ewa.tools.HexToRGBAtable = function(hex){
	hex = hex.replace('#','');
	rgba = new Array();
	rgba['R'] = parseInt(hex.substring(0,2), 16);
	rgba['G'] = parseInt(hex.substring(2,4), 16);
	rgba['B'] = parseInt(hex.substring(4,6), 16);
	rgba['A'] = 1;
	return rgba;
}
/*
	Convert RGBA Table to Hex
*/
ewa.tools.RGBtableToHex = function(RGBA){
   return "#" +
        ("0" + parseInt(RGBA['R'],10).toString(16)).slice(-2) +
        ("0" + parseInt(RGBA['G'],10).toString(16)).slice(-2) +
        ("0" + parseInt(RGBA['B'],10).toString(16)).slice(-2);
	
}
/*
	Create a RGBA Table from rgb/rgba string
*/
ewa.tools.setRGBAtable = function(RGBA){
	rgba = new Array();
	if (RGBA!=null && RGBA!=''){
		RGBAcolor = RGBA.replace('rgba(','').replace('rgb(','').replace(')','').split(', ');
		rgba['R'] = parseInt(RGBAcolor[0]);
		rgba['G'] = parseInt(RGBAcolor[1]);
		rgba['B'] = parseInt(RGBAcolor[2]);
		if(RGBAcolor[3]==null) RGBAcolor[3]=1;
		rgba['A'] = parseFloat(RGBAcolor[3]);
	} else {
		rgba['R'] = 0;
		rgba['G'] = 0;
		rgba['B'] = 0;
		rgba['A'] = 1;
	}
	return rgba;
}           
/*
	Help buttons
*/
ewa.css.attributes.buttons.help.click(function(){
	var tool = $(this).attr('data-tool');
	var attr = $(this).parent().parent().find('[role=validate]').attr('data');
	switch(tool){
		case 'color':
			val = ewa.css.attributes.values[attr].val();
			val = (val.match(/#/g) && val.length==7) ? ewa.tools.HexToRGBAtable(val, 1) : ewa.tools.setRGBAtable(val);
			ewa.tools.color(attr, val);
		break;		
	}
});

/* 
	set color tools
*/
ewa.tools.color = function( attribut, color ){
	$('#editor-ui-colorSetter').remove();
	content = $('<div><p data-color="R"><i>0</i></p><p data-color="G"><i>0</i></p><p data-color="B"><i>0</i></p><p data-color="A"><i>1</i></p><pre class="color_preview"></pre></</div><input type="checkbox" data-input="linkTarget" id="editor-ui-colorFormat" value="_blank"><label for="editor-ui-colorFormat" data-hex="'+ewa.translations.colorTools.hex+'" data-rgba="'+ewa.translations.colorTools.rgba+'"></label>');
	ewa.nodes.insert('editor-ui-colorSetter', ewa.translations.colorTools.title, true);
	ewa.nodes.insertContent('editor-ui-colorSetter', content);
	
	ewa.UI.color = {
		UI : {
			node : $('#editor-ui-colorSetter'),
			attr: 'color',
			content : $('#editor-ui-colorSetter [role=content]')
		},
		mvt: {
			channel : null
		},
		value: color,
		hexa: $('#editor-ui-colorFormat[type="checkbox"]')
	}
	
	ewa.UI.color.UI.attr = attribut;
	ewa.UI.color.UI.handles = {
		all : ewa.UI.color.UI.content.find('div p i'),
		R : ewa.UI.color.UI.content.find('div p[data-color=R] i'),
		G : ewa.UI.color.UI.content.find('div p[data-color=G] i'),
		B : ewa.UI.color.UI.content.find('div p[data-color=B] i'),
		A : ewa.UI.color.UI.content.find('div p[data-color=A] i'),
		width : 300
	}
	ewa.UI.color.preview = ewa.UI.color.UI.content.find('div pre');	
	
	ewa.UI.color.getValue = function(channel){
		var v = channel!='A' ? 
				parseInt(parseInt(ewa.UI.color.UI.handles[channel].css('left') )*255/ewa.UI.color.UI.handles.width)
				: parseFloat(parseInt(ewa.UI.color.UI.handles[channel].css('left') )/ewa.UI.color.UI.handles.width);
		if ( parseInt(v) == v) return v;
		return v.toFixed(2);
	};
	
	ewa.UI.color.setValue = function(channel){
		val = channel!='A' ? 
				parseInt( ewa.UI.color.value[channel]*ewa.UI.color.UI.handles.width /255 )
				: parseInt(ewa.UI.color.value[channel] *ewa.UI.color.UI.handles.width);
		ewa.UI.color.UI.handles[channel].text(ewa.UI.color.value[channel]).css('left',val);
	};

	ewa.UI.color.rgbaToHandles = function( ){
		for(var c in ewa.UI.color.value)
			ewa.UI.color.setValue( c );
	    var rgba= "rgba( "+ewa.UI.color.value.R+", "+ewa.UI.color.value.G+", "+ewa.UI.color.value.B+", "+ewa.UI.color.value.A+")";
		ewa.UI.color.preview.css("background-color",rgba);
		return rgba;
	}
	
	ewa.UI.color.rgbaToHandles();
	ewa.UI.color.UI.handles.all.on('mousedown',function(e){
		ewa.UI.target = $(this);
		ewa.UI.color.mvt.channel =  $(this).parent().attr('data-color');
		ewa.UI.click = true;
		ewa.UI.initX = parseInt(e.clientX)
	});
	
	ewa.UI.color.UI.node.on('mouseup',function(){
		ewa.UI.click = false;
	});
	
	ewa.UI.color.UI.node.on('mousemove', function(e, evt){
	    if (!ewa.UI.click) return;
	    if (ewa.UI.color.mvt.channel=='A' && ewa.UI.color.hexa.is(':checked')){
		    ewa.UI.color.value[ ewa.UI.color.mvt.channel ] = 1;
		    newLeft = 300;
	    } else {
		    attribut = ewa.UI.color.UI.attr;
		    leftInit = parseInt( ewa.UI.target.css('left') );
		    ewa.UI.clientX = parseInt(e.clientX); 
		    mv = parseInt((ewa.UI.clientX-ewa.UI.initX));
		    newLeft = leftInit + mv;
		    if (newLeft<0) newLeft=0;
		    if (newLeft>300) newLeft=300;
		    ewa.UI.color.value[ ewa.UI.color.mvt.channel ] = ewa.UI.color.getValue(ewa.UI.color.mvt.channel);
	    } 
	    
	    ewa.UI.target.css('left',newLeft).text( ewa.UI.color.value[ ewa.UI.color.mvt.channel ] );
	    ewa.UI.initX = e.clientX;
	    var col= "rgba( "+ewa.UI.color.value.R+", "+ewa.UI.color.value.G+", "+ewa.UI.color.value.B+", "+ewa.UI.color.value.A+")";
	    
	    if (ewa.UI.color.hexa.is(':checked') ) col =  ewa.tools.RGBtableToHex(ewa.UI.color.value);
	    ewa.UI.color.preview.css("background-color",col);
	    ewa.css.attributes.values[attribut].val(col);   
	});   
	
	ewa.UI.color.hexa.on('click', function(){
	 	if($(this).is(':checked')){
		 	ewa.UI.target = ewa.UI.color.UI.handles.A.css('left','300px').text('1');
		 	value = ewa.tools.RGBtableToHex(ewa.UI.color.value);
	 	} else {
		 	ewa.UI.color.value = ewa.tools.HexToRGBAtable( ewa.css.attributes.values[attribut].val() );
	    	value= "rgba( "+ewa.UI.color.value.R+", "+ewa.UI.color.value.G+", "+ewa.UI.color.value.B+", "+ewa.UI.color.value.A+")";
	 	}
		
		ewa.css.attributes.values[attribut].val(value );
	    ewa.UI.color.preview.css("background-color",value);
	});
	
	ewa.UI.color.UI.node.find('[role=closeNode]').click(function(e){
	    ewa.css.attributes.buttons[ewa.UI.color.UI.attr].click();
		ewa.UI.color.UI.node.off('mouseup');
		ewa.UI.color.UI.handles.all.off('mousedown');
		ewa.UI.color.UI.node.off('mousemove');
	})
	      
}

/*
	Set caret position at start of active element
*/
ewa.tools.caretAtStart = function(el, insertBr){
	var range = document.createRange();
	var sel = window.getSelection();
	range.setStart(el, 0);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
	if (insertBr){
	    $(el).append('<br>'); // create a BR if the element is empty
	}
}
/*
	Set caret position at end of active element
*/
ewa.tools.caretAtEnd = function(el){
	var empty = (typeof el.childNodes[el.childNodes.length-1] == 'undefined');
	if (empty) {
		ewa.tools.caretAtStart(el, (empty && ewa.elements.active.id!==ewa.bodyID) ? true : false );
		return;
	}
	var range = document.createRange();
	var sel = window.getSelection();
	range.setStart(el, $(el).length);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}

// Avoid selection lost on some navigator (ie Safari)
$('#editor-ui-bar nav li').mousedown(function(e){
	e.preventDefault();
});

// Last key code used
ewa.tools.lastKey = 0;
ewa.tools.forceInside = false;

/* 
	key events for keyboard shortcut
*/
ewa.tools.listenKeyEvents = function(e){
	switch (e.which){
		case 83:
			if (e.ctrlKey) {
				e.preventDefault();
				ewa.navigator.action.save.click();
			}
			break;
		case 78:
			if (e.ctrlKey) {
				e.preventDefault();
				ewa.navigator.action.newfile.click();
			}
			break;
		case 79:
			if (e.ctrlKey) {
				e.preventDefault();
				ewa.navigator.action.open.click();
			}
			break;
	}
}
/* Events on document */
$('body').on('keyup', function(e){
	cursor.type=false;
	ewa.tools.forceInside = false;
	// Disable resortable elements
	if (ewa.UI.target!==null && ewa.UI.target.hasClass('ui-sortable')) ewa.UI.target.sortable("destroy").enableSelection();	
	ewa.UI.target= null;	
	$('.forceInside').removeClass('forceInside');
	
}).on('keydown', function(e){
	e.stopPropagation();
	ewa.tools.listenKeyEvents(e);
	
}).on('mouseup', function(e){
	selected = false;
}).mousemove(function(e){
	if (!selected) return;
	if (!e.ctrlKey) return;
	
	if (cursor.type) newVal = cursor.initX + e.clientX-cursor.x;
	else newVal = e.clientX-cursor.x;
	if (newVal!=0 && cursor.type) selected.css('left',newVal);
	else selected.css('left','');
	if (cursor.initX + e.clientX-cursor.x > cursor.col) {
		selected.css('left','');
		cursor.x = e.clientX;
		moveRight();
	}
	if (cursor.initX + e.clientX-cursor.x < -cursor.col) {
		selected.css('left','');
		cursor.x = e.clientX;
		moveLeft();
	}
	return false;
});

/* Events on BODY of Editable Document */
ewa.body.on('click','a, button', function(e){
	// Do not fallow links
	e.preventDefault()
}).on('submit', function(e){
	// Do not sumbit forms
	e.preventDefault();
}).on('keydown', function(e){
	// Key release
	e.stopPropagation();
	if (e.which !== 13 || !window.getSelection) ewa.tools.lastKey = e.which;
	ewa.tools.listenKeyEvents(e);
	switch (e.which){
		case 13:
			e.preventDefault();
			elType =  (e.ctrlKey || e.shiftKey) ? ewa.elements.active.type : null;
			switch (elType){
				case 'LI' :
					// Enter press = create a new LI on UL container
					$('#insert_LI').click();
					break;
					
				/*	Some navigator create a new container insteads of a BR */
				default:
			        var selection = window.getSelection();
			        range = selection.getRangeAt(0);
			        var insertBr = function(){
			        	var br = document.createElement("br");
				        range.insertNode(br);
				        range.setStartAfter(br);
			        }
			        insertBr();
			        if (ewa.tools.lastKey != 13) insertBr(); // The first Entrer do not works sometimes
			        selection.removeAllRanges(); // Avoid no linear selections
			        selection.addRange(range);
			}
			ewa.tools.lastKey = e.which;
			break;
			
		case 32:
			cursor.type=true;
			break;
			
		case 43: // right
			if (e.shiftKey) sizeUp(ewa.elements.active.object);
			break;
			
		case 45: // left
			if (e.shiftKey) sizeDown(ewa.elements.active.object);
			break;
		
		case 40: // down
			break;
	}
	if (e.shiftKey){
		if ( ewa.elements.active.level<=6 && !ewa.tools.isOn('h1, h2, h3, h4, h5, h6', ewa.elements.active.type) )
			ewa.tools.forceInside = true;
		if( ewa.elements.active.level!=5) $('li[data-level='+ewa.elements.active.level+']').addClass('forceInside');
		if (ewa.elements.active.type=='LI') $('li[data-level='+(ewa.elements.active.level-1)+']').addClass('forceInside');
	}
	
	if (e.altKey){
		var target = ewa.elements.active.id==ewa.bodyID ? ewa.body : ewa.elements.active.object.parent();
		if (! ewa.elements.getTagLevel(target)>5 || target.get(0).tagName == 'P') return;
		if (ewa.UI.target== null) {
			target.disableSelection().sortable();
			ewa.UI.target=target;
		}		
	}
}).on('contextmenu', ewa.getSupportedElmt,  function(e){
	// Context Menu on body compatibles elements
	e.stopPropagation();
	return ewa.tools.openContextMenu( $(this), e );
}).contextmenu( function(e){
	// Context Menu on body
	return ewa.tools.openContextMenu( $(this), e );
}).on('mouseenter','p, div, article, section, aside, h', function(e){
	//bootstrap tools displayer
	if (!ewa.body.hasClass('displayLines')) return;
	if ( !$(this).parent().hasClass('row') && !$(this).parent().hasClass('clearfix')  ) return;
	if (!ewa.UI.mode.Bootstrap) return;
	if ( $(this).attr('class').search( BootstrapClassTypes )==-1 || $(this).attr('class')=='' ) return;
	e.preventDefault();
	if ( $(this).hasClass('row') ) return;
	$(this).append(
		$('<span>', {'class':'fa fa-compress resize resizeLeft'})
			.height($(this).height())
			.css('padding-top',($(this).height()-$(this).css('font-size').replace('px',''))/2+'px')
			.on('click',function(){
				sizeDown( $(this).parent() );
			}),
		$('<span>', {'class':'fa fa-expand resize resizeRight'})
			.height($(this).height())
			.css('padding-top',($(this).height()-16)/2+'px')
			.on('click',function(){
				sizeUp( $(this).parent() );
			})
	);
	$(this).mouseleave(function(){
			$(this).find('.resize').remove();
			$(this).find('.move').remove();
		}).mousedown(function(){
			e.stopPropagation();
			selected = $(this);
			left = parseInt(selected.css('left').replace('px',''));
			left = ( !isNaN( left ) ) ? left : 0;
			cursor.x = e.clientX;
			cursor.y = e.clientY;
			cursor.initX = left;
			cursor.col = $('.col-xs-1').width();
		});
});