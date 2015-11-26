/*==============================================================
EWA : CSS Editor
==============================================================*/
// sub object about css editor
ewa.css={
	UI:{
		main : $('#cssEditor'),
		buttons : {},
		tabs:{
			buttons:{ all : $('.cssEditorUIButton') },
			UI:{ all : $('.cssEditorUI') },
		},
		tableAttr : $('.tableAttribute'),
		tableCellAttr : $('.tableCellAttribute'),
		listAttr : $('.listAttribute'),
		cplx: $('.cssEditorUI i.cplx')
	},
	attributes:{
		buttons:{},
		values:{},
		radio:{},
	},
	tools:{}
}

ewa.css.attributes.buttons.all = ewa.css.UI.tabs.UI.all.find('[role=validate]');
ewa.css.attributes.buttons.help = ewa.css.UI.tabs.UI.all.find('span.help button.glyphicon');
ewa.css.attributes.radio.all = ewa.css.UI.main.find('p input[type=radio]');
// fill ewa.css.UI.buttons
ewa.css.UI.tabs.buttons.all.each(function(){
	var id=$(this).attr('id');
	ewa.css.UI.tabs.buttons[id] = $(this);
	ewa.css.UI.tabs.UI[id] = $('#ui_'+id);
});
// fill ewa.css.attributes.buttons
ewa.css.UI.tabs.UI.all.find('[role=validate]').each(function(){
	ewa.css.attributes.buttons[$(this).attr('data')] = $(this);
});
// fill ewa.css.attributes.values
ewa.css.UI.tabs.UI.all.find('[role=value]').each(function(){
	ewa.css.attributes.values[$(this).attr('data')] = $(this);
});
// fill ewa.css.attribute.radio
ewa.css.attributes.radio.all.each(function(){
	if (typeof ewa.css.attributes.radio[$(this).attr('name')] == 'undefined')
		ewa.css.attributes.radio[$(this).attr('name')] = {};
	ewa.css.attributes.radio[$(this).attr('name')][$(this).val()] = $(this);
})

// switch between IMG and TXT tabs
ewa.css.setContentTab = function(){
	if (ewa.elements.active.type=="IMG"){
		active = ewa.css.UI.tabs.buttons.css_txt.hasClass('selected');
		ewa.css.UI.tabs.buttons.css_txt.hide();
		if ( active ){
			ewa.css.UI.tabs.UI.css_txt.fadeOut();
		}
	} else {
		active = ewa.css.UI.tabs.buttons.css_txt.hasClass('selected');
		ewa.css.UI.tabs.buttons.css_txt.show();
		if ( active ){
			ewa.css.UI.tabs.UI.css_txt.fadeIn();
		}
	}
}

// CSS Editor fields update
ewa.css.UI.update = function(idElmt,style,params){ 
		if(idElmt==null){	idElmt = ewa.elements.active.id;}
		if(style==null){	style = ewa.elements.getStyle(idElmt);} 
		if(params==null){ params = ewa.elements.getParam(idElmt);}
		
		// attributs complexes
		ewa.css.UI.cplx.each(function(){
			var attr = $(this).attr('data-attr');
			var part = parseInt($(this).attr('data-part'));
			var style = ewa.elements.getStyle(ewa.elements.active.id);
			if (style=={}) return;
			$(this).find('input[type=checkbox]').prop( "checked", ewa.elements.getParam(ewa.elements.active.id).merged[attr] );
			Attr = attr.charAt(0).toUpperCase() + attr.substring(1);
			if ( ewa.elements.getParam(ewa.elements.active.id).merged[attr] ){
				$('.splited'+Attr).hide();
				$('.united'+Attr).show();
				console.log(ewa.elements.getStyle(ewa.elements.active.id));
				ewa.elements.setStyle( ewa.elements.active.id,
					ewa.css.tools.mergeMethods( style, Attr.toLowerCase() )
				);

			} else {
				$('.splited'+Attr).show();
				$('.united'+Attr).hide();
				ewa.elements.setStyle( ewa.elements.active.id,
					ewa.css.tools.splitMethods( style, Attr.toLowerCase() )
				);
			}
			var used = ewa.css.tools.complexAttrUse( attr, part );
			(used == part || used == 0 || ewa.elements.getParam(ewa.elements.active.id).merged[attr]) ? $(this).show() : $(this).hide();
		})
		
		if (typeof( style )!=='undefined'){
			// find each css attribute and fill the field
			for (var attr in ewa.css.attributes.values) {
				var cssAttr = ewa.css.attributes.values[attr];
				var value =  (typeof( style[attr] )!=='undefined') ? style[attr] : '';
				cssAttr.val(value);
				if (value=='') value ='inherit';
				if (typeof ewa.css.attributes.radio[attr]!=='undefined' && typeof ewa.css.attributes.radio[attr][value]!=='undefined')
					ewa.css.attributes.radio[attr][value].prop( "checked", true );
			 }; 
		}
		var displayAttr=  ( typeof ewa.css.attributes.values['display']!=='undefined' ) ? ewa.css.attributes.values['display'].val() : '';
		var tableDisplay=  (displayAttr=='table' || displayAttr=='inline-table');
		var tableCellDisplay=  (displayAttr=='table-cell');
		if (ewa.elements.active.type=='TABLE' || tableDisplay) ewa.css.UI.tableAttr.show();
		else ewa.css.UI.tableAttr.hide();
		if (ewa.elements.active.type=='TD' || ewa.elements.active.type=='TH' || tableCellDisplay) ewa.css.UI.tableCellAttr.show();
		else ewa.css.UI.tableCellAttr.hide();
		if (ewa.elements.active.type=='UL' || ewa.elements.active.type=='OL'){
			ewa.css.UI.listAttr.show();
			ewa.css.UI.listAttr.find('option[data-tag=ul]').hide();
			ewa.css.UI.listAttr.find('option[data-tag=ol]').hide();
		} else ewa.css.UI.listAttr.hide();
		if (ewa.elements.active.type=='UL') ewa.css.UI.listAttr.find('option[data-tag=ul]').show();
		if (ewa.elements.active.type=='OL') ewa.css.UI.listAttr.find('option[data-tag=ol]').show();

		//ewa.css.main.UI.trigger("addons-cssEditorUpdate"); // permet aux addons de participer
	}

// auto set css attribute value
ewa.css.UI.forceValueUpdate = function(attribute, value, itemToReturn){
	$('input[data='+attribute+']').val( value );
	$('button[role=validate][data='+attribute+']').click();
	if( typeof itemToReturn!=='undefined') itemToReturn.click().focus();
}
	

// ***************************************************
//	EVENTS
var styleWithCSS = document.queryCommandSupported('styleWithCSS');
// force cs sue when use execCommand (oh, bad !)
try{
   document.execCommand('styleWithCSS', true);
} catch(e){
	styleWithCSS = false;
	console.log('ERROR DECTECTED');
	console.log(e);
	//special case for Mozilla Bug #442186
    if(e && e.result == 2147500037){
    	//alert('Bug de Firefox détecté, Probablement Bug #442186');
    }
}



ewa.UI.style.click(function(){
	var copy = ewa.elements.active.object;
	switch($(this).attr('data-style')){
		default :
			switch(ewa.elements.active.type){
				case 'SPAN':
					var attribute = $(this).attr('data-attribute');
					newval= ($('input[data='+attribute+']').val()!==$(this).attr('data-style') ) ?
						$(this).attr('data-style') : ''	;
					ewa.css.UI.forceValueUpdate(attribute,  newval);
					break;

				default :
					document.execCommand($(this).attr('data-style') ,false,null);
					ewa.elements.active.object.find('span').each(function(){
					 	if ( typeof $(this).attr('htmlelement')=='undefined') {
							$(this).trigger('click');
					 		ewa.css.UI.forceValueUpdate($(this).attr('data-attribute'),  $(this).attr('data-style'));
					 	}
					})
					break;
			}
			break;
	}
       
});

// tab switch
ewa.css.UI.tabs.buttons.all.click(function(){
	ewa.css.UI.tabs.UI.all.hide();
	id = $(this).attr('id');
	ewa.css.UI.tabs.UI[id].fadeIn(190);
	ewa.css.UI.tabs.buttons.all.removeClass('selected');
	$(this).addClass('selected');
})
// text tab (auto select)
ewa.css.UI.tabs.buttons['css_txt'].click();


// element selection
ewa.body.on('click', ewa.getSupportedElmt, function(e){
	ewa.tools.lastKey = 0;
	e.stopPropagation();
	if ( trim(ewa.getSelected()) !== '') return;
	if ($(this).hasClass('resize')) return;
	if ($(this).hasClass('notscanable')) return;
	ewa.elements.enabler( $(this) );
	$('.active').removeClass('active');
	$(this).addClass('active');
	ewa.css.setContentTab();
	$("#menuWrap").attr('data-toggle','dropdown').css('color', '');
	ewa.css.UI.update();
});
// body selection
ewa.body.click(function(){
	$('.active').removeClass('active');
	ewa.elements.enabler( $(this) );
	 $("#wrapEditor, #structureEditor").removeClass('open');
	$("#menuWrap").attr('data-toggle','dropdown_lock').css('color', '#aaaaaa');
	ewa.css.UI.update();
});
// parent element selection
ewa.elements.active.parent.click(function(){
	if (ewa.elements.active.object.attr('id')==ewa.bodyID) return;
	ewa.elements.active.object.parent().click();
	ewa.tools.caretAtEnd(ewa.elements.active.object.get(0));
})

// unwrap current selection
ewa.elements.active.unwrap.click(function(){
	if (ewa.elements.active.object.attr('id')==ewa.bodyID) return;
	var selection = window.getSelection();
	var selTxt = selection.toString();
	var parent = ewa.elements.active.object.parent();
	if ( ewa.elements.active.object.text().search(selTxt) ==-1 ) return;
	if ( ewa.elements.active.object.text().search(selTxt) ==0 )
		ewa.elements.active.object.before( selTxt=="" ? ewa.elements.active.object.html() : selTxt );
	else
		ewa.elements.active.object.after( selTxt=="" ? ewa.elements.active.object.html() : selTxt );
	if (selTxt == ""){
		ewa.elements.active.object.remove();
		parent.click();
	}else {
		var range = selection.getRangeAt(0);
    	range.deleteContents();
		selection.removeAllRanges(); // Avoid no linear selections
        selection.addRange(range);
	}
})

// delete current element
ewa.elements.active.remove.click(function(){
	if (ewa.elements.active.object.attr('id')==ewa.bodyID) return;
	if ( confirm('Supprimer cet élément ['+ewa.elements.active.type+']') ) ewa.elements.removeHtml(ewa.elements.active.object);
})

// css attribute set
ewa.css.attributes.buttons.all.click(function(){
	var attr = $(this).attr('data');
	var val = ewa.css.attributes.values[attr].val();
	ewa.elements.setStyle(ewa.elements.active.id, attr, val);
	ewa.elements.active.object.css(attr, val);
	ewa.css.UI.update();
	ewa.elements.active.object.focus();
});


// css attribute set by radio input (auto set)
ewa.css.attributes.radio.all.click(function(){
	var attribute = $(this).attr('name');
	var val = $(this).val()!='inherit' ? $(this).val() : '';
	ewa.css.attributes.values[attribute].val( val );
	ewa.css.attributes.buttons[attribute].click();
})

// margin/padding tools
ewa.css.united= {
	padding : $('#ui-editor-unifyPadding'),
	margin : $('#ui-editor-unifyMargin')
}

// complexes attribute
ewa.css.tools.complexAttrUse = function(Attr, numPart, styleArray){
	var used = 0;
	if (typeof styleArray=='undefined') styleArray = ewa.elements.getStyle(ewa.elements.active.id);
	for(i=0; i<numPart; i++){
		Sattr = $('[data-attr='+Attr+'][data-part='+i+']').attr('data');
		if (typeof styleArray[Sattr]!=='undefined' && styleArray[Sattr]!=='') used++;
	}
	return used;	
}
ewa.css.UI.cplx.find('input[type=checkbox]').change(function(){
	var checked = $(this).is(':checked');
	var Attr = $(this).attr('id').replace('editor-ui-unify','');
	ewa.elements.getParam(ewa.elements.active.id).merged[Attr.toLowerCase()] = checked;	
	ewa.css.UI.update();
})


ewa.css.tools.attrToMerge = ['margin', 'padding', 'border'];

// merge tools
ewa.css.tools.mergeMethods = function( styleArray, attr ){
	if (styleArray==null) return;
	function check (attr, array){
		switch( attr ){
			case 'margin': 
			case 'padding':
				if ( array[attr]!=undefined && array[attr]!=='' ){
					var _array = new Array();
					var temp =  (array[attr].search(' ')!=-1) ? temp = array[attr].split(' ') : array[attr];
					var match = new Array(attr+'-top', attr+'-right', attr+'-bottom', attr+'-left');
					for (var i in match){
						_array[ match[i] ] = typeof temp == 'object' ? temp[i] : temp;
					}
				} else 
					var _array = array;
				// merge only if the 4 were set
				if ( ewa.css.tools.complexAttrUse(attr, 4, array) < 4) return array;
				var _style = new Array( 
								_array[attr+'-top'], 
								_array[attr+'-right'], 
								_array[attr+'-bottom'], 
								_array[attr+'-left']
							);
					
				if (_style[1] == _style[3]){
					_style.pop();
					if (_style[0] == _style[2]){
						_style.pop();
						if (_style[0] == _style[1]) _style.pop();
					}
				}
				delete(array[attr+'-top']);
				delete(array[attr+'-right']);
				delete(array[attr+'-bottom']);
				delete(array[attr+'-left']);
				array[attr] = _style.join(' ');
				break;
			
			case 'border':
				var border = new Array();
				var match = new Array(attr+'-width', attr+'-style', attr+'-color');
				var keep = [false, false, false];
				i = 0;
				for (var j in match){ // OUPS CAS DU WIDTH MULTIPLE
					if ( (typeof array[match[j]] != 'undefined') ) {						
						if (array[match[j]].replace(', ',',').split(' ').length>1){
							keep[j] = array[match[j]];
						} else {
							border[i] = array[match[j]];
							i++;
						}
					}
				}
				array['border'] = border.join(' ');
				delete array['border-width'];
				delete array['border-style'];
				delete array['border-color'];
				for (var j in keep)  // specific border attribute should be after border 
					if (keep[j]!==false) array[match[j]] = keep[j];
				break;
		}
		return array;		
	}
	if (attr)
		styleArray = check( attr, styleArray );
	else {
		for(var i in ewa.css.tools.attrToMerge)
			styleArray = check( ewa.css.tools.attrToMerge[i], styleArray );
	}
	return styleArray;
}

// split method
ewa.css.tools.splitMethods = function( styleArray, attr ){
	function check(attr, array){
		switch( attr ){
			case 'margin': 
			case 'padding':
				if (typeof array[attr]=='undefined') return array;
				var temp = array[attr];
				if (temp.search(' ')!=-1) temp = temp.split(' ');
				var match = new Array(attr+'-top', attr+'-right', attr+'-bottom', attr+'-left');
				delete(array[attr]);
				if (typeof temp == 'object' && temp.length==2) {
					temp[2] = temp[0];
					temp[3] = temp[1];
				}
				if (typeof temp == 'object' && temp.length==3) {
					temp[3] = temp[1];
				}
				for (var i in match){
					var value = typeof temp == 'object' ? temp[i] : temp;
					if (value!=='' && value!==undefined){
						array[match[i]] = value;
					}
				}
				break;
			
			case 'border':
				if (typeof array[attr]=='undefined') return array;
				border_A = array[attr].split(' ');
				if (typeof border_A=='object'){
					switch(border_A.length){
						case 1 :
							array['border-style'] = border_A[0];
							break;
						case 2 :
							array['border-style'] = border_A[0];
							array['border-color'] = border_A[1];
						break;
						case 3 :
							array['border-width'] = border_A[0];
							array['border-style'] = border_A[1];
							array['border-color'] = border_A[2];
						break;
					}
				}
				delete(array['border']);
				break;
		}	
		return array;
	}
	
	if (attr)
		styleArray = check( attr, styleArray );
	else {
		for(var i in ewa.css.tools.attrToMerge)
			styleArray = check( ewa.css.tools.attrToMerge[i], styleArray );
	}
	return styleArray;
}