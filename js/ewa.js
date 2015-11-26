/*==============================================================
	EWA : Editeur Web d'Auroran - Bootstrap version
==============================================================*/

var selected = false;
var cursor = {
	x:0,
	y:0,
	col:0,
	type:false
};
// Main object
var ewa = {
	version : 'v.0.99',
	body : $('#body'),
	bodyID : 'DIV_1',
	translations : ewaConfig.translations,
	data:{
		autoLoad : ewaConfig.bodyFile,
		folder : ewaConfig.dataFolder,
		pictures : ewaConfig.picturesFolder,
		jquery : { // jquery objects storage
			// IMG
			// URL/HREF
		}
	},
	url : {
		editor: $("#editor-ui-editorURL").val(),
		folder : ewaConfig.dataURL,
		pictures :ewaConfig.picturesURL
	}, 
	selection : null,
	UI : {
		main: $('#editor-ui-main'),
		mode : {
			save : ewaConfig.SaveMode, // body | html
			Bootstrap : (ewaConfig.BootstrapEnable=='true' || ewaConfig.BootstrapEnable==true),
			HTML : $('.fa-code').parent(),
			WYSIWYG : $('.fa-pencil-square-o').parent(),
		},
		insert:{
			hpr : $('li[role=insert]'), // h; p et row, ...
			obj : $('li[role=insertObj]'),	// pictures, videos, ...
			wrapper: $('li[role=wrap]')
		},
		stylize:{
			color : $('li[role=colorPicker]')
		},
		style : $('[data-action=style] li'),
		htmlCode : $("#editor-ui-htmlCode"),
		addonsMenu : $("#editor-ui-addonsInsertion"),
		paste : {
			interceptor : $("#editor-ui-pasteInterceptor"),
			area : $("#editor-ui-areaPaste")
		},
		ewatitle: $('#ewa_title'),
		lineDisplayer: $('#displayLines'),
		readme : $('#readme'),
		titleTagStart: parseInt( ewaConfig.titleTagStart.toUpperCase().replace('H','') ),
		file : $('#fileOpened')
	},
	user : $("#editor-ui-SiteUser").val(),
	rewrite : ewaRewrite,
	mode : {
		WYSIWYG : null,	// for WYSIWYG mode
		HTML : null		// for HTML Editor mode
	},
	modules : ewaModules,
	extra : ewaConfig.extra,
	tools :{
		rewrite : ewaRewrite
	}
};

// remove initial config variables
delete (ewaConfig);
delete (ewaModules);
delete (ewaRewrite);

window.trim = function(str, notEnd){
   str =  (str!=null) ? str.replace(/^\s+/g,'') : '';
   if (typeof notEnd=='undefined')  srt =str.replace(/^\s+/g,'').replace(/\s+$/g,'');
   return str;
}
window.idAlea = function(){
	    return Math.ceil( Math.floor( 100000000*Math.random() ) );
};

var specialCharConverter = function(input){
	return input.replace(/\?/gi,'\\?')
		.replace(/\./gi,'\\.')
		.replace(/\$/gi,'\\$')
		.replace(/\&/gi,'\\&')
		.replace(/\[/gi,'\\[')
		.replace(/\]/gi,'\\]')
		.replace(/\(/gi,'\\(')
		.replace(/\)/gi,'\\)')
		.replace(/\{/gi,'\\}')
		.replace(/\}/gi,'\\}')
		.replace(/\^/gi,'\\^')
		.replace(/\?/gi,'\\?')
		.replace(/\*/gi,'\\*')
		.replace(/\+/gi,'\\+')
		.replace(/\-/gi,'\\-');
}
// Code indentation traitment (private function of ewa.js)
var workOnCode = function(code){
	var code_A = code.split('\n'); // split code in an array (each index = each line)
	var newCode_A = new Array();
	var indent = "";
	var mergeExept = "br, img";
	var signsAccepted = "[\.\>\?]$"; // signs allowed on end line, if present, line jump will be cancelled
	var j = 0;
	var lign='', start_tag=null, end_tag=null ,dontMerge=false, tag='',mergeLines=false, prevlign='', nextLign='';
	for( var i=0; i<code_A.length; i++){
		// line per line reading
		lign = trim(code_A[i]);
		start_tag = lign.match(/^<[A-Za-z0-9_]+/);	// search a tag opening
		end_tag = lign.match(/^<\/[A-Za-z0-9_]+>$/); // search a tag closure
		tag = (start_tag!==null && typeof start_tag[0]!=='undefined') 
			? start_tag[0].replace(/<|\/|>/gi,'')  : ( (end_tag!==null && typeof end_tag[0]!=='undefined') ? end_tag[0].replace(/<|\/|>/gi,'') : '#content');		
		mergeLines = ( tag!=='#content' && ewa.elements.getTagLevel(tag) == 6 && !dontMerge);
		dontMerge = ewa.tools.isOn( mergeExept, tag )
		if ( end_tag !==null && !dontMerge && !mergeLines){
			// bloc tag or br found, add indent
			indent = indent.replace('\t','');
		}
		if (mergeLines){
			if (i>0){
				prevlign = trim(newCode_A[j-1], true);
				
				if (prevlign.search(signsAccepted)==-1){
					lign = prevlign.replace(/\n/gi,'') + trim(lign, true);
					j--;
				}
			}
			if (typeof code_A[i+1]!='undefined') {
				nextLign =  code_A[i+1];
				lign += trim(nextLign, true);
				i++;
			}
		}
		if (trim(lign)!=="") { 
			newCode_A[j]=indent + lign;
			j++;
		}
		if (start_tag!==null && end_tag==null && !dontMerge && !mergeLines) 
			indent +='\t'; // end bloc tag found, add indent (not for br)
	}
	return newCode_A.join('\n');
}
// switch to HTML Editor mode
ewa.mode.HTML = function(toggle){ 	
	ewa.body.click();	
	ewa.UI.htmlCode.trigger("addons-HTML"); // for addons
	// toggle : "flash" mode if true
	if (ewa.UI.mode.save!="html" && ewa.UI.mode.save !="body" && ewa.UI.mode.save !="inBody"){
		alert('mauvaise configuration, fonction indisponible');	
		return;
	}

	if(!toggle) {
		$("#ewa_toolBar li").toggle(400);  
	}

	// write complete html page
		if (ewa.UI.mode.save == 'html'){
			$editorContent = $("<html>").html( ewa.body.html() ) ;
			$editorContent.find('body').attr('style',ewa.elements.html.generateStyle(ewa.bodyID));
		}
		// write body container
		if (ewa.UI.mode.save == 'body') {
			$editorContent = $('<section>', {'class' : "container"}).append (ewa.body.clone() );
			$editorContent.find('#'+ewa.bodyID)
						.removeAttr("contentEditable")
						.attr({
							'class' : 	"container",
							'id': 		"pageContainer",
							'style' : 	ewa.elements.html.generateStyle(ewa.bodyID)
						});
		}
		// Only body inside
		if (ewa.UI.mode.save == 'inBody') {
			$editorContent = $('<section class="container">').html(ewa.body.html());
		}
	
	// line break adding
	$editorContent.html( 
				trim($editorContent.html().replace(/</gi,"\n<" )
									.replace(/>/gi,">\n" )
									.replace(/<br>/gi,"<br>\n" ) 
									.replace(/\n<\/a>\n/gi,"<\/a>")
					)	
	);	
	$editorContent.find('img[src="img/js.png"]').each(function(){
		id = $(this).attr('data-script');
		$(this).replaceWith( ewa.elements.scripts[id] ) ;
	});
	// css Editor style application
	$editorContent.find('#'+ewa.bodyID)
					.removeAttr("contentEditable")
					.removeAttr("style")
					.attr({
						'class' : 	"container",
						'id': 		"pageContainer",
						'style' : 	ewa.elements.generateStyle(ewa.bodyID)
					});

	$editorContent.find(ewa.getSupportedElmt).each(function(){
		var elt = $(this).attr('htmlelement');
		$(this).attr('style',ewa.elements.generateStyle(elt));
		$(this).removeAttr('htmlelement').removeAttr('contenteditable').removeClass('ui-sortable');
		if ( $(this).attr('class')=='' ) $(this).removeAttr('class');
		if ( $(this).attr('style')=='' ) $(this).removeAttr('style');
	});
	code = $editorContent.html();
	for (var rule in ewa.rewrite.read){
		var r =  new RegExp(ewa.rewrite.write[rule], 'gi');
		code = code.replace( r, ewa.rewrite.read[rule] );
	}
	// display html if we are not in flash mode
	if(!toggle) {
		ewa.UI.htmlCode.animate({width:'toggle'},400);
	}
	ewa.UI.codeEditor.setValue( workOnCode(code.replace(/\t/gi,'')) );
	$("#WAIT").fadeOut();
}

// Passage en mode éditeur WYSIWYG
ewa.mode.WYSIWYG = function(toggle, code){
	// toggle : use flash mode if true
	if (code==null || typeof code=='undefined') {
		code = ewa.UI.codeEditor.getValue();
	} 

	for (var rule in ewa.rewrite.read){
		var reg=new RegExp(ewa.rewrite.read[rule], "g");
		code = code.replace( reg, ewa.rewrite.write[rule] );
	}
	// on recherche le style du body
	bodyStyle = "font-size:1em;";
	notBody = 0;
	r = code.split("<body");
	if (typeof r[1] =='undefined') {
		notBody += 1;
		r = code.split("<section class=\"container\"");
		if (typeof r[1] =='undefined'){
			r = code.split("<div class=\"container\""); // in case of sectionning is made with div
		}
	}			
	if (typeof r[1] !='undefined'){
		notBody += 1;
		r = r[1].split('<'); // avoid a bad style attribute use if body has no style
		if (typeof r[0] !='undefined'){
			r = r[0].split('style');
			if (typeof r[1] !='undefined'){
				r = r[1].split('=');
				if (typeof r[1] !='undefined'){
					r = r[1].split('"');
					if (typeof r[1] !='undefined')	{
						r = r[1].split('"');
						bodyStyle = r[0]; 
					}
				}
			}
		}
	} 
	var $newBody = $('<html>').html( code).delay(2000);
	ewa.elements.scripts = {};
	$newBody.find('script').each(function(){
		id = idAlea();
		var repl = $('<img>',{'src': 'img/js.png', 'data-script':id});
		$(this).replaceWith(repl);
		ewa.elements.scripts[id] = $(this);
	});
	
	ewa.body.focus().attr('style',bodyStyle);
	if (ewa.UI.mode.save == 'html'){
		// get <style>, remove it and update document style
		var newStyle = $newBody.find('style').html();
		$newBody.find('style').remove();
		$('#editor-ui-cssClass').html(newStyle);
	}
	
    if (notBody>0) {
    	// if no body found
    	if (notBody <2){
    		// 'pageContainer' not found, "inBody" edition mode
    		ewa.body.html( $newBody.html().replace(/\n/gi,"") ).attr('contenteditable',true);
    	} else {
    		// found a 'pageContainer',  "body" edition mode
    		ewa.body.html( $newBody.find('#pageContainer').html().replace(/\n/gi,"") ).attr('contentEditable',true);
    	}
    } else {
    	// body found, use mode "html"
    	ewa.body.html( $newBody.html().replace(/\n/gi,"") ).attr('contentEditable',true);
    }
    // html elements map
    ewa.elements.readSource( ewa.body );
    // display wysiwyg mode if we are not in mode "flash"
	if(!toggle) {
		ewa.UI.htmlCode.animate({width:'toggle'},400);
		$("#ewa_toolBar li").toggle(400);// display toolsbar
	}
	ewa.UI.htmlCode.trigger("addons-WYSIWYG"); // for addons
	ewa.body.click();
}

// Modules Loads
for (key in ewa.modules){
	$.getScript('modules/'+ewa.modules[key]+'/module.js');
}

$('#ewa_version').text(ewa.version);

// UI Nodes 
ewa.nodes={};
ewa.nodes.template = $('<div>', {
	'class' : 'uiNode'
}).append( 
	$('<span>', {'role':'title'}),
	$('<div>', {'role':'closeNode'}),
	$('<div>', {'role':'content'}),
	$('<nav>', {'class': 'navbar col-xs-12'}).css('display','none')
);

$('div[role=closeNode]').on('click', function(){
	$(this).parent().hide(200);
})

ewa.nodes.insert = function(id, title, keepFocus){
	$e = ewa.nodes.template.clone().attr('id', id);
	$e.find('[role=title]').html(title);
	$e.find('[role=closeNode]').on('click', function(){
		ewa.tools.closeNode( $(this), keepFocus==undefined ? false : keepFocus );
	});
	$('body').append($e);
	return $e;
}
ewa.nodes.insertContent = function(id, contentNode){
	$('#'+id).find('div[role=content]').append(contentNode);
}

ewa.nodes.insertFooter = function(id, contentNode){
	$('#'+id).find('nav').css('display','').append(contentNode);
}