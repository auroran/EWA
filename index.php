<?php
	define( '_EWA_ROOT_',dirname(__FILE__).'/' );
	require_once _EWA_ROOT_.'classes/ewa.php';

	Ewa::modprobe();
	
	$json = 'window.ewaConfig = '.Ewa::getConfig();
	$config = Ewa::$config;

	$file = (isset($_GET['file'])) ? new Ewa($_GET['file'], true) : false;
	
	$editor_content= is_object($file) ? $file->content : "";
	$js_rewrite_rules = Ewa::getRewriteRulesJson();
	$js_modules = Ewa::getJsModulesJson();
	$data = $config['dataFolder'];

	include(_EWA_ROOT_.'views/_html.php');
?>
