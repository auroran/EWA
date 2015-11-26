<?php
/**
 * Ewa Main Methods
 * 
 * @package EWA \classes\
 * @copyright 2015 AuroraN
 *
 * @Author Auroran
 */
if (!defined('_EWA_ROOT_')) trigger_error('EWA : Bad initialization', E_USER_ERROR);


/**
 * Core Class
 *
 * @Author Auroran
 */

class Ewa{
	public $file;
	public $content="";
	public $exists=false;
	public static $lang = 'fr';
	public static $rewrite=array('read'=>array(), 'write'=>array());	// code rewrite rules
	public static $phpmods=array();
	public static $jsmods=array();
	public static $config=array();
	public static $configOverride=array('extra'=>array());	// config overrides

	/**
	 * Get an instance of Ewa
	 *
	 * @param 	string		$file		file to open
	 * 
	 * The path should be a relative path from data dir defined in config
	 */
	public function __construct($file=false, $autoload=false){
		if ( empty(self::$config) ) self::getConfig();
		// and if relative path ?
		if ($file) $this->file = $file;
		if ($file) $this->exists = ( is_file($this->file) );
		if ($autoload) $this->open();
	}

	/**
	 * Open the file associed with the object
	 *
	 * @return	string		Content of the file, after modume traitments
	 */
	public function open(){
		if (! $this->exists) return false;
		$this->content = file_get_contents($this->file);

		foreach( self::$phpmods as $mod=>$fun){
			$fun .= '_Read';
			$mod .= 'EwaModule';
			if (class_exists($mod) && method_exists($fun) ) $this->content = $mod::$fun( $this->content );
		}
		return $this->content;
	}


	/**
	 * Open the file associed with the object
	 *
	 * @return	string		Content of the file, after modume traitments
	 */
	public function write( $content=false ){
		if ($content) $this->content = $content;
		foreach( self::$phpmods as $mod=>$fun){
			$fun .= '_Write';
			$mod .= 'EwaModule';
			if (class_exists($mod) && method_exists($fun) ) $this->content = $mod::$fun( $this->content );
		}
		return $this->content;
	}
	
	/**
	 * Save the file associed with the object
	 *
	 * @return	string		Content of the file, after modume traitments
	 */
	public function save($prewrite = false, $content=false){
		if ($prewrite) $this->write($content);
		$r = file_put_contents( $this->file, $this->content);
		return json_encode($r);
	}

	/**
	 * Get config
	 */
	public static function getConfig(){
		/*
		 * Load Thirty-part library : SPYC, YAML Parser/Dumper
		 */
		if (!class_exists('Spyc')) require_once _EWA_ROOT_.'frameworks/spyc/Spyc.php';
		self::$config = Spyc::YAMLLoad( _EWA_ROOT_.'config/editor.yml' );
		self::$config['translations'] = Spyc::YAMLLoad( _EWA_ROOT_.'config/lang/'.self::$lang.'.yml' );

		foreach(self::$configOverride as $key=>$value){
			if (is_array($value) && isset(self::$config[$key]))
				foreach($value as $k=>$v)
					self::$config[$key][$k] = $value;
			else
				self::$config[$key] = $value;
		}
		return json_encode(self::$config);
	}
	/*
	 * Module reading
	 */
	public static function modprobe(){
		$dirContent = scandir(_EWA_ROOT_.'modules/');
		$modDirs = array();
		
		foreach( $dirContent as $item ){
			if ( is_dir(_EWA_ROOT_.'modules/'.$item) ){
				if (is_file(_EWA_ROOT_.'modules/'.$item.'/module.php')){
					include(_EWA_ROOT_.'modules/'.$item.'/module.php');
					self::$phpmods[$item] = 'modRewrite';
				}
				
				if (is_file(_EWA_ROOT_.'modules/'.$item.'/module.js'))
					self::$jsmods[] = $item;
			}
		}
	}

	/*
	 * Get rewrite rules for json
	 *
	 * Theses rules works with JS
	 *
	 * @return	json	array of rules
	 */
	public static function getRewriteRulesJson(){
		return json_encode( self::$rewrite );
	}

	/*
	 * Get js modules array in json
	 */
	public static function getJsModulesJson(){
		return json_encode( self::$jsmods );
	}
	
	public static function addRewrite($read, $write){
		Ewa::$rewrite['read'][] = $read;
		Ewa::$rewrite['write'][] = $write;
	}

	
	//+ Maigret Aurélien
	//@ http://www.dewep.net
	public static function cleanFileName ($input){
		setlocale(LC_ALL, 'fr_FR');
	
		$input = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $input);
	
		$input = preg_replace('#[^0-9a-z]+#i', '', $input);
	
		while(strpos($input, '--') !== false)
			$input = str_replace('--', '-', $input);
	
		$input = trim($input, '-');
	
		return $input;
	}
}
error_reporting(E_ERROR);
date_default_timezone_set('Europe/Paris');
ini_set('log_errors', 1);
ini_set('error_log', _EWA_ROOT_.'logs/'.date('d-m-Y__H:i').'.txt');		// save log into a file

?>
