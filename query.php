<?php
/**
 * All Queries made by AJAX POST in the editor
 */
 
define( '_EWA_ROOT_',dirname(__FILE__).'/' );
require_once _EWA_ROOT_.'classes/ewa.php';
Ewa::modprobe();

$json = 'window.ewaConfig = '.Ewa::getConfig();
$config = Ewa::$config;

/*
 * Execute an action, and return the result as json object
 */
if (isset($_POST['action'])) {
	$file = (isset($_POST['file'])) ? new Ewa($_POST['file']) : new Ewa();
	//$display = ob_end_flush();
	//echo $display				// debug
	if (!$file or !is_object($file)) echo "ERREUR";
	switch( $_POST['action'] ){
		case 'open':
			echo $file->open();

			break;
		case 'write':
			echo $file->write($_POST['content']);
			break;
		case 'save':
			echo $file->save(true, $_POST['content']);
			break;		
	}
}

/*
 * Resquest the navigator, and return the folder content (filtered) as json object
 */
if (isset($_POST['navigator'])){

		
	$path = $_POST['navigator'];
	
	if ( !preg_match('/'.str_replace('/','\/',$config['dataFolder']).'/',$path) ){
		echo '<div style="margin:5em auto; width: 150px"><span class="glyphicon glyphicon-ban-circle" style="font-size:9em;"></span><div>';
		exit();
	}
	$filetype = $_POST['filetype'];
	$preselected = isset($_POST['preselected']) ? $_POST['preselected'] : null;
	$dir = opendir($path);
	if (!$dir) die ('Dossier inexistant');
	$list = array( 'Folders'=>array(), 'Documents'=>array(), 'Pictures'=>array(), 'Movies'=>array() );
	$dirs = array();
	$files= array();
	$img= array();
	while ($f = readdir($dir)) {	
		 if(is_dir($path.$f) && $f!="." && $f!=".." ) 
			$list['Folders'][] = $f;
		 if(is_file($path.$f) && !preg_match('/^(\.|\.\.)/',$f) && preg_match('/\.(html|tpl)$/', $f) && $filetype=='document')
			$list['Documents'][] = $f;
		 if(is_file($path.$f) && !preg_match('/^(\.|\.\.)/',$f) && preg_match('/\.(png|jpg|jpeg|tiff|tif|gif)$/', $f) && $filetype=='picture')
			$list['Pictures'][] = $f;
		 if(is_file($path.$f) && !preg_match('/^(\.|\.\.)/',$f) && preg_match('/\.(avi|mov|mkv|mpg|mpeg|mp4)$/', $f) && $filetype=='movie')
			$list['Movies'][] = $f;
	}
	include(_EWA_ROOT_.'views/navigator.php');
}


/*
 * Resquest a folder creation
 */
if (isset($_POST['createFolder'])){
	$path = $_POST['path'];
	if (!preg_match('/\/$/', $path)) $path.='/';
	if (!is_dir($path)) exit( Ewa::json_enc(false) );
	if ($path=='/') exit( Ewa::json_enc(false) );
	if ( empty($_POST['createFolder']) ) exit( Ewa::json_enc(false) );
	$newFolder = Ewa::cleanFileName($_POST['createFolder']);
	$r = @mkdir($path.$newFolder);
	echo Ewa::json_enc( array('success'=>$r, 'newFolder'=>$newFolder, 'path'=>$path) );
}
?>
