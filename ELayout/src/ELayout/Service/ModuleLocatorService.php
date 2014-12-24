<?php

namespace ELayout\Service;

class ModuleLocatorService 
{
	protected $paths;
	protected $modules;
	protected $modules_filepath;
	protected $services_contained = array();
	protected $services_used = array();
	protected $services_linked;
	protected $current_module;
	protected $current_file;

	public function getModulesPath( )
	{
		return array_unique( $this->modules_filepath );
	}


	public function setPaths( $paths )
	{
		$this->paths = $paths;

		return $this;
	}


	public function setModules( $modules )
	{
		$this->modules = $modules;

		return $this;
	}


	public function locate( )
	{
		$type = 'php';

		foreach( $this->paths as $path )
		{
			$folder = $path;
		
			$this->iterateFolder( $folder . "/*", $type );

		}

		$this->generateLinks();
		
		return $this->services_linked;
	}


	private function generateLinks()
	{
		foreach( $this->services_used as $module => $used_service )
		{
			foreach( $used_service as $used_index => $used_value )
			{
				foreach ( $this->services_contained as $contained_module => $contained_service ) 
				{
					foreach ($contained_service as $contained_key => $contained_value) 
					{
						if( $used_value == $contained_key ) {
							$this->services_linked[ $module ][ $used_index ] = $contained_module; 
						}
					}
				}
			}			
		}
	}


	private function iterateFolder( $folder, $find )
	{
		$files = glob( $folder );

		foreach ( $files as $file ) 
		{
			if( filetype( $file ) == 'dir' ) $this->iterateFolder( $file . "/*", $find );
		    
		    if( $this->isIncludedModule( $file ) ) {

		    	$this->current_file = $file;

			    switch( basename( $file ) )
			    {
			    	case 'service.config.php':
			    	case 'services.config.php':
			    		$this->getInvokables( $file );
			    	break;

			    	case 'autoload_classmap.php':
			    	case 'module.config.php':
			    	break;

			    	case 'Module.php':
			    		$this->modules_filepath[] = dirname( $file );
			    	break;

			    	default:
			    		$this->searchUsed( $file, $find );
			    	break;
			    }
		    }
		}
	}


	private function searchUsed( $filepath, $type )
	{
		if( filetype( $filepath ) != 'file' ) return false;
		if( substr( $filepath, -3 ) != $type ) return false;

		$contents = file_get_contents( $filepath );

		preg_match_all("/([$]this->getServiceLocator[(][)]->get[(][\"'])([A-Za-z0-9_ \-]*)([\"'][)])/", $contents, $output_array);

		if( isset( $output_array[2] ) && count( $output_array[2] ) > 0 )
			foreach( $output_array[2] as $service ) 
				$this->services_used[ $this->current_module ][ $service ] = $service;

		preg_match_all("/namespace ([A-Za-z0-9_\-]*);/", $contents, $output_array);

		if( count( $output_array[1] ) > 0 ) $this->modules_filepath[] = dirname( $filepath );

	}


	private function isIncludedModule( $filepath )
	{
		foreach( $this->modules as $module )
		{
			if( stripos( $filepath, $module . "/" ) > 0 ){
				
				$this->current_module = $module;

				return true;
			}
		}

		return false;
	}


	private function getInvokables( $filepath )
	{
		$list = include $filepath;

		if( !isset( $list['invokables'] ) || empty( array_filter( $list['invokables'] ) ) ) return;

		if( !isset( $this->services_contained[ $this->current_module ] ) ) 
			$this->services_contained[ $this->current_module ] = $list['invokables'];
		else 
			$this->services_contained[ $this->current_module ] = array_merge( $list['invokables'], $this->services_contained[ $this->current_module ] );
	}

}



?>