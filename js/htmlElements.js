/*==============================================================
	EWA : ewa.elements
==============================================================*/
// sub object about elements
ewa.elements = {
	active : {
		id : ewa.bodyID,
		type : null,
		level : -1,
		object : ewa.body,
		display : $('#ElmtActive'),
		parent: $('#cssEditor button[data-action=parent]'),
		remove: $('#cssEditor button[data-action=remove]'),
		unwrap: $('#cssEditor button[data-action=unwrap]')
	},
	focused : {
		id : ewa.bodyID,
		type : null,
		level : 6,
		object : null
	},
	attr : {
		all: { UI:$('.ui_attr') }
	}
}
ewa.elements.counter = {};
// html elements supported
ewa.getSupportedElmt = 'section, article, aside, footer, header, nav, div, code, blockquote, table, caption, thead, tbody, tr, td, th, span, p, pre, h1, h2, h3, h4, h5, h6, h, strong, b, img, ul, li, i, u, ol, a, label, input, button, select, acronym, abbr, dfn, cite, var, figure, figcaption, summary, details, del, ins';
	

ewa.elements.levels = {
	'div' 			: -1,	// special case
	// lever 0 to level 5 : block elements
	'form' 			: 0,
	'article' 		: 0,
	'section' 		: 1,
	'footer' 		: 2,
	'header' 		: 2,
	'nav' 			: 2,
	'aside' 		: 2,
	'th' 			: 2,
	'td' 			: 2,
	'ul' 			: 3,
	'ol' 			: 3,
	'li' 			: 4,
	'blockquote' 	: 4,	
	'table'			: 4,
	// level 5 : no block allowed into this element => contains only inline elements	
	'pre' 			: 5,
	'p' 			: 5,
	'h1' 			: 5,
	'h2' 			: 5,
	'h3' 			: 5,
	'h4' 			: 5,
	'h5' 			: 5,
	'h6' 			: 5,
	'caption' 		: 5,
	'figure' 		: 5,
	// level 6 : inlines elements
	// level 7+ : no element allowed => specials features	
	'table'			: 7,
	'tr' 			: 7,
	'tbody' 		: 7,
	'thead' 		: 7,
	'tfoot' 		: 7,
};


ewa.elements.getTagLevel = function( tag ){
	if (typeof tag == 'object')
		tag = typeof tag.get(0) !== 'undefined' ? tag.get(0).tagName : tag.tagName;
	return typeof ewa.elements.levels[tag.toLowerCase()] !=='undefined' ? ewa.elements.levels[tag.toLowerCase()] : 6;
}

// set level on each menu
$('[role=insertElement] ul ul li').each(function(){
	$(this).attr('data-level', ewa.elements.getTagLevel( $(this).attr('data-tag') ) )
			.append('<code style="float:right">'+$(this).attr('data-tag')+'</code>');
})


ewa.elements.attr.all.buttons = ewa.elements.attr.all.UI.find('[role=validate]');
// remplissage de ewa.element.attr
ewa.elements.attr.all.UI.each(function(){
	ewa.elements.attr[ $(this).attr('data') ] = {
		UI: $(this),
		value : $(this).find('[role=value]'),
		button : $(this).find('[role=validate]')
	}
})
ewa.elements.enabler = function(object){

	if (typeof object.attr('htmlelement')=='undefined'){
		nid = 	ewa.elements.insertHtml( object );
	}

	ewa.elements.active.object= object;
	ewa.elements.active.id= object.attr('htmlelement');
	ewa.elements.active.type = object.get(0).nodeName;
	ewa.elements.active.level = ewa.elements.getTagLevel( ewa.elements.active.type );
	
	if (ewa.elements.active.id!=='DIV_1'){
		ewa.elements.active.display.text(ewa.elements.active.type);
		ewa.elements.active.parent.fadeIn();
		ewa.elements.active.remove.fadeIn();
		classNames = typeof object.attr('class')!=='undefined' 
						? object.attr('class').replace('active','').replace(/ $/gi,'') : '';
		ewa.elements.attr.class.value.val( classNames );
	} else {
		ewa.elements.active.display.text('Base du Document');
		ewa.elements.active.parent.fadeOut();
		ewa.elements.active.remove.fadeOut();
		ewa.elements.attr.class.value.val( "" );
	}
	
	if ( !ewa.elements.active.type.match(/TABLE|TBODY|THEAD|TFOOT|CAPTION|LI|OL|TD|TR|TH|UL/gi) 
		&& ewa.elements.active.id!==ewa.bodyID )
		ewa.elements.active.unwrap.fadeIn();
	else 
		ewa.elements.active.unwrap.fadeOut();
		
	ewa.elements.attr.all.UI.each(function(){
		attr = $(this).attr('data');
		tags = $(this).attr('data-tags')+' ';
		value = typeof object.attr(attr)!=='undefined' ? object.attr(attr) : '';
		if ( tags.search(ewa.elements.active.type+" ")!=-1){
			ewa.elements.attr[attr].value.val( value );
			ewa.elements.attr[attr].UI.fadeIn();
		} else {
			if (tags != 'excl ') ewa.elements.attr[attr].UI.hide();
			else ewa.elements.attr[attr].UI.show();
		}
	})
	var focuseNode = window.getSelection().focusNode
	if ( focuseNode!== null){
		focused = focuseNode.nodeType==3 
			? $( window.getSelection().focusNode.parentElement ) : $( window.getSelection().focusNode );
		ewa.elements.focused = {
			id : focused.attr('htmlelement'),
			type : focused.get(0).tagName,
			level : ewa.elements.getTagLevel( focused ),
			object : focused
		};	
	}
	
}

// class attrbute modification
ewa.elements.attr.all.buttons.click(function(){
	if (ewa.elements.active.id==ewa.bodyID) return;
	var attr = $(this).attr('data');
	var value = ewa.elements.attr[attr].value.val();
	if ( attr=='class' ) value += ' active';
	ewa.elements.active.object.attr(attr, value );
})

ewa.elements.currentArrayMap = {};
ewa.elements.currentArrayMapRel = {};

/*
	Map a table
*/
ewa.elements.mapArray = function(obj){
	var row = 0;
	ewa.elements.currentArrayMap = {};
	ewa.elements.currentArrayMapRel = {};
	var rowspans = {};
	obj.find('tr').each(function(){
		var col = 0;
		if (typeof ewa.elements.currentArrayMap[row] == 'undefined' ) ewa.elements.currentArrayMap[row] = {};
		$(this).find('td').each(function(){
			colspan = typeof $(this).attr('colspan')!=='undefined' ? parseInt($(this).attr('colspan')) : 1;
			rowspan = typeof $(this).attr('rowspan')!=='undefined' ? parseInt($(this).attr('rowspan')) : 1;
			
				
			for( r=1; r<rowspan; r++){
				if (typeof ewa.elements.currentArrayMap[row+r] == 'undefined' ) 
					ewa.elements.currentArrayMap[row+r] = {};
				ewa.elements.currentArrayMap[row+r][col] = false;
			}
			
			while( ewa.elements.currentArrayMap[row][col] == false ){
				col=col+1;
			}
			
			rowspans[col] = rowspan;
			
			ewa.elements.currentArrayMap[row][col] = $(this);
			for(i=1; i<colspan; i++){
				ewa.elements.currentArrayMap[row][col+i] = false;
			}
			
			ewa.elements.currentArrayMapRel[$(this).attr('htmlelement')] = {'row':row, 'col':col };
			col = col+colspan; 
		});
		row++;
	});
	return ewa.elements.currentArrayMap;
}

// Attribute object
Attribut = function(){
	for (var i in arguments){
		if (i != 'count'){
			if (typeof arguments[i]=='Object'){
				for (var j in arguments[i]){
					this[j] = arguments[i][j];
				}
			} else {
				this[i] = arguments[i];
			}
		}
	}
}

var count = function(object){var count = 0;for (var i in object){count++;}return count;}

// ## Check
var existElement = function(id){
	return (typeof ewa.elements.html[id] !== "undefined");
};
var existStyle = function(id){
	if (! existElement(id) ) return false;
	return (typeof ewa.elements.html[id].style !== "undefined");
};
var existAttribute = function(id, attribute){
	if( existElement(id) )
		return (typeof ewa.elements.html[id].style[attribute] !== "undefined");
	else return false;
};


// css parameter object
var cssParam = function(){
	this.merged= {
		padding: false,
		margin:	false
	}
}
/*
	Count attributes in a style array
*/
ewa.elements.countStyleAttr = function(styleArray){
	var i = 0;
	for (var key in styleArray) i++;
	return i;
}

/*
	Make a style array from a style string
*/
ewa.elements.createStyleArray = function(styleString){
	var styleArray = {}, style =  "";
	if (typeof styleString !== "undefined" && styleString!=='') {
		style =  styleString.split(';');
		for(var i in style){
			// on parcout le tableau des styles, sans les éclater
			temp = style[i].split(':');
			attribute = temp[0].replace(/^\s|\s$/gi,'');
			if (attribute !== "" && typeof temp[1] !== "undefined" && trim(temp[1]) !== "") {
				styleArray[attribute.replace(/^\s|\s$/gi,'')] = temp[1].replace(/^\s|\s$/gi,'');
			}
		}
		styleArray = ewa.css.tools.splitMethods(styleArray);
	}
	return styleArray;
}

/*
	Make a style string from a style array
*/
ewa.elements.createStyleString = function(styleArray){
	var styleString = "";
	var newStyleArray=new Array();
	var i=0;
	//traiter les cas particuliers
	var styleArray = ewa.css.tools.mergeMethods(styleArray);
	for(var key in styleArray){
		if (trim(styleArray[key])!="") newStyleArray[i]=key+":"+styleArray[key];
		i++;
	}
	styleString = newStyleArray.join(';');
	if (styleString!=";") return styleString;
	else return "";
}

/*
	Generate a style string for an element (use htmlelement attribute, id)
*/
ewa.elements.generateStyle = function(idElmt){
	if (!existStyle(idElmt)) return "";
	var style= ewa.elements.getStyle(idElmt);
	if ( ewa.elements.countStyleAttr(style) == 0 ) {
		return "";
	}
	return ewa.elements.createStyleString( style );
}

/*
	Get the style array of an element
*/
ewa.elements.getStyle = function (idElmt){		// récupérer le tableau de style d'un élément
	if (!existStyle(idElmt)) return new Array();
	return ewa.elements.html[idElmt].style;
}	
/*
	Set the style array or a style array attribute
*/
ewa.elements.setStyle = function (idElmt, attribut, value){
	if (typeof attribut == "object"){
		ewa.elements.html[idElmt].style = attribut;
	} else {
		if (value!="") {
			ewa.elements.html[idElmt].style[attribut]=value
		}else {
			if ( existStyle(idElmt) ){
				r = delete ewa.elements.html[idElmt].style[attribut];
				if (!r) ewa.elements.html[idElmt].style[attribut]=='undefined';
			}
		}
	}
}
/*
	Get a css param for an element
*/
ewa.elements.getParam = function (idElmt){		// récupérer les paramètre de style d'un élément
	if (typeof(ewa.elements.html[idElmt]) !=='undefined'){
		return ewa.elements.html[idElmt].param;
	} 
	return false;
}
/*
	HTML element objet
*/
var htmlelement = function(idElmt, styleString, href, src, type) {	// un élément HTML
	this.id = idElmt;
	this.type = type;
	this.style = styleString!== undefined ? ewa.elements.createStyleArray(styleString): {};
	this.href = href!=undefined ? href : '';
	this.src = src!=undefined ? src : '';		
	this.param = new cssParam();
};

/*
	Insert a HTML Element into the array ewa.elements.html
*/
ewa.elements.insertHtml = function(elt){
	if (typeof elt!='object' || typeof elt.get(0)=='undefined') return false;
	var tag = elt.get(0).tagName;
	if (ewa.elements.counter[tag]!== undefined) ewa.elements.counter[tag] += 1;
	else ewa.elements.counter[tag] = 1;
	var id = elt.get(0).tagName+'_'+ewa.elements.counter[elt.get(0).tagName];
	ewa.elements.html[id] = new htmlelement( id, elt.attr('style'), elt.attr('href'), elt.attr('src'), tag );
	elt.attr('htmlelement', id);
	console.log("htmlelement : "+id);
	return id;
}
/*
	Insert a HTML Element from the array ewa.elements.html
*/
ewa.elements.removeHtml = function(elt){
	if (typeof elt!='object' || typeof elt.get(0)=='undefined') return false;
	var id = elt.attr('htmlelement');
	delete(ewa.elements.html[id]);
	elt.remove();
}

/*
	Read a source an map all HTML elements
*/
ewa.elements.readSource = function( source ){
	ewa.elements.html = {};
	ewa.elements.counter = {};
	if (typeof source !=='object') return;
	ewa.elements.insertHtml( source );
	source.find( ewa.getSupportedElmt ).each(function(){
		ewa.elements.insertHtml( $(this) );
	})
}

// initializations
ewa.elements.html = {};
ewa.elements.counter = {};