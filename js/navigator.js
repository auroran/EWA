// sub object about navigation
ewa.navigator = {
	content : $("#editor-ui-folders"),
	div : $("#editor-ui-navigator"),
	title: $("#editor-ui-navigator h1 div"),
	parent: $('#editor-ui-navigatorMenuBar li.glyphicon-arrow-up'),
	newDir: $("#editor-ui-newFolderName input"),
	validate : {
		dir : $(".btn-nav-action"),
		open : $("#editor-ui-validateOpen"),
		save : $("#editor-ui-validateSave"),
		insert : {
			img : $("#editor-ui-validateImgInsert"),
			link : $("#editor-ui-validateLinkInsert")
		}
	},
	action : {
		newfile : $(".ewa-action .glyphicon-file"),
		open : $(".ewa-action .glyphicon-folder-open"),
		save : $(".ewa-action .glyphicon-floppy-disk"),
		imgUpload : $(".editor-ui-imgImport, #editor-ui-imgImport"),
		linkSelect : $("#editor-ui-linkInsert"),
		createFolderIcon: $("#editor-ui-navigatorMenuBar .glyphicon-plus"),
		createFolderBlock: $("#editor-ui-newFolderName"),
		createFolderSave: $("#editor-ui-newFolderName button"),
	},
	workdir: ewa.data.folder,
	filetype: 'document',
	filename : $('[name=editor-ui-nameFile]')
}


/*
	Open the navigator
*/
ewa.navigator.open = function(directory, type, file){
	ewa.navigator.filename.val(file);
	ewa.navigator.filetype = (typeof type=='undefined') ? 'document' : type;
	var p =directory.replace(/\/$/gi,'').split('/');
	p.pop();
	var control = ewa.data.folder.replace(/\/$/gi,'').split('/');
 	if (p.length>= control.length) {
 		ewa.navigator.parent.fadeIn(190);
 		ewa.navigator.parent.attr('data-dir', p.join('/')+'/');
 	}else {
 		ewa.navigator.parent.fadeOut(220);
 		ewa.navigator.parent.attr('data-dir',directory);
 	}
	ewa.navigator.workdir = directory;
	ewa.navigator.title.html('&nbsp;&nbsp;'+directory.replace(ewa.data.folder,'').replace(/\/$/gi,'').replace(/\//gi,' <span class="glyphicon glyphicon-chevron-right" style="font-size:.75em;"> </span> ') );
	$.ajax({
		url: 'query.php',
		type:'post',
		data: {
			'navigator': directory,
			'filetype': ewa.navigator.filetype,
			'preselected': file
		}		
	}).done(function(nav_html){
		ewa.navigator.div.fadeIn(200);
		//on obtient un object avec chaque type de contenu (dossier, image, vidéo)
		ewa.navigator.content.html(nav_html);
		ewa.navigator.content.find('[data-item=directory]').on('click', function(){
			ewa.navigator.open( $(this).attr('data-dir')+'/', ewa.navigator.filetype );
		});
		fileIcon = ewa.navigator.content.find('[data-item='+ewa.navigator.filetype+']');
		fileIcon.on('click', function(){
			fileIcon.removeClass('selected');
			$(this).addClass('selected');
			ewa.navigator.filename.val( $(this).attr('data-file') );
		});
	}).fail(function(){
		// @todo : make a fail msg
	})
};

/*
	Open the requested file
*/
ewa.data.openFile = function(directory, filename){
	if (typeof filename!='undefined'){ 		
		$("#WAIT").show();
		ewa.navigator.filename.val(filename);
		ewa.UI.file.text(directory.replace(ewa.data.folder,'')+filename); 

		$.ajax({
			url : 'query.php',
			data: {
				'file': directory+filename,
				'action': 'open'
			},
			type : 'POST'
		}).done(function(content){
			$("body").hide().delay(800).show();
			ewa.mode.WYSIWYG(true, content);
			$("#WAIT").fadeOut(200);
		}).fail(function(){		
			$("#WAIT").fadeOut(200);

		})
	} else {
		ewa.mode.WYSIWYG(true);
		ewa.body.focus();
	}
}

/*
	Launch navigator for inclusion/link...
*/
ewa.navigator.action.Explore = function(type){ 
	ewa.navigator.validate.dir.hide();
	typenav = 'document';
	switch(type){
		case 'img' : 
			var dir = ewa.data.pictures;
			typenav = 'picture';
			ewa.navigator.validate.insert.img.show(2);
			break;
		case 'link': 
			var dir = ewa.data.folder;	
			ewa.navigator.validate.insert.link.show(2);
			break;
	}
	ewa.navigator.open(dir,typenav);
	ewa.navigator.div.fadeIn(200);
};

// Save a file (confirmation)
ewa.navigator.validate.save.click(function(){
	var directory = ewa.navigator.workdir; 
	var filename = ewa.navigator.filename.val();
	var path = directory+filename;
	ewa.mode.HTML(true);
	data = { 
		'action': 'save',
		'content' : ewa.UI.codeEditor.getValue(),
		'file' : path
	};
	ewa.mode.WYSIWYG(true);
	ewa.navigator.div.hide(200);	
	$("#WAIT").show();
	$.ajax({
		url : 'query.php',
		data : data,
		type : 'post',
		datatype: 'json'
	}).done(function(h){
		if (h!==false && h!=="false"){
			ewa.UI.file.text(path.replace(ewa.data.folder,''));
		}else{
			$('#editor-ui-saveFail').remove();
			content = $('<br><p style="color:red">'+ewa.translations.msg.errorSave+'</p>');
			ewa.nodes.insert('editor-ui-saveFail', ewa.translations.msg.error);
			ewa.nodes.insertContent('editor-ui-saveFail', content);
			$('#editor-ui-saveFail').css('width',300);

		}
	}).always(function(){
		$("#WAIT").fadeOut(250)
	})
	
});
ewa.navigator.validate.dir.hide();

// Save the chosen file
ewa.navigator.action.save.click(function(){
	ewa.navigator.validate.dir.hide();
	ewa.navigator.validate.save.show(2);
	file = ewa.data.folder+ewa.UI.file.text();
	path = file.split('/');
	filename = path.pop();
	path = path.join('/')+'/';
	ewa.navigator.open(path, 'document',filename );
});

// open a file
ewa.navigator.validate.open.click(function(){
	var directory = ewa.navigator.workdir; 
	var filename = ewa.navigator.filename.val();
	var path = directory+filename; 
	ewa.navigator.div.hide(200);
	ewa.data.openFile(directory, filename);
});

// Go to the parent folder
ewa.navigator.parent.click(function(){
	ewa.navigator.open( $(this).attr('data-dir'), ewa.navigator.filetype );
})

// Make a new file
ewa.navigator.action.newfile.click(function(){ 
	ewa.nodes.insert('createNewFile', ewa.translations.nodes.newFile.title);
	ewa.nodes.insertContent('createNewFile', $('<div>').html(ewa.translations.nodes.newFile.info).css({'color':'#333333', 'padding':'15px'}));
	ewa.nodes.insertFooter('createNewFile', 
		$('<div>').append( $('<button>', {'class':'btn btn-default glyphicon glyphicon-ok btn-nav-action'}))
				.css('text-align','center')
				.on('click', function(){
					ewa.mode.WYSIWYG(true, '');
					$('#createNewFile').find('[role=closeNode]').click(); 
					ewa.UI.file.text(ewa.translations.navigator.newFile+'.html');
				})
	);
});

// Request navigator to open a file
ewa.navigator.action.open.click(function(){ 
	ewa.navigator.validate.dir.hide();
	ewa.navigator.validate.open.show(2);
	ewa.navigator.open(ewa.data.folder);
})

// Enable Folder creation
ewa.navigator.action.createFolderIcon.click(function(){
	ewa.navigator.action.createFolderBlock.animate({
        width: 'toggle'
    }, 100);
});
ewa.navigator.action.createFolderBlock.click(function(e){
	e.preventDefault();
	return false;
});
// Create a new folder
ewa.navigator.action.createFolderSave.click(function(e){
	dirname = ewa.navigator.newDir.val();
	$.ajax({
			url : 'query.php',
			data: {
				'path': ewa.navigator.workdir,
				'createFolder': dirname
			},
			type : 'POST',
			datatype: 'json'
		}).done(function(result){
			if (result==false || result=='false') console.log('Problem...');
			else {
				ewa.navigator.open(ewa.navigator.workdir, ewa.navigator.filetype);
			}
		}).fail(function(){	
			// @todo : make a fail msg
		})
	ewa.navigator.action.createFolderIcon.click();
})

// Image creation validation
ewa.navigator.validate.insert.img.click(function(){ 
	var newVal =  ewa.navigator.workdir +ewa.navigator.filename.val();
	newVal = newVal.replace( ewa.data.pictures, ewa.url.pictures);
	$('#editor-ui-imgInsert').find('[data-input=nameFile]').val( newVal );
	ewa.navigator.div.hide(200);
});

// Link insertion validation
ewa.navigator.validate.insert.link.click(function(){ 
	var newVal =  ewa.navigator.workdir +ewa.navigator.filename.val();
	newVal = newVal.replace( ewa.data.folder, ewa.url.folder);
	$('#editor-ui-linkInsert').find('[data-input=nameFile]').val( newVal );
	ewa.navigator.div.hide(200);
});

// auto load
if (ewa.data.autoLoad !==''){
	ewa.data.openFile(ewa.data.folder, ewa.data.autoLoad);
}