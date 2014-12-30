<?php

namespace ELayout\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\Loader\ModuleAutoloader;

class IndexController extends AbstractActionController
{
    protected $test = true;

    public function indexAction() 
    {       
            $view = new ViewModel( );
            
            if( $this->test )
                $module_list = $this->_getTestData( );
            else
                $module_list = $this->_getAllModules( );

            $view->setVariable('module_list', json_encode( $module_list ) );
            $view->setVariable('linked_list', json_encode( $this->linked_list ) );
            $view->setTemplate('ELayout/ELayout/index');            
            $this->layout('layout/el_layout');
        
            return $view;
    }

    public function assetsAction() 
    {
        $file_name = $this->params( 'filename' );

        $this->_setHeaderBasedOnFileName( $file_name );
        
        $view = new ViewModel();

        $this->_setViewBasedOnFileName( $file_name, $view );
        $view->setTerminal( true );

        return $view;
    }

    private function _getTestData( )
    { 
        $module_list[] = './module/Album';
        $module_list[] = './module/Application';
        $module_list[] = './module/ZF2ELayout/ELayout';
        $module_list[] = './api/EWay';
        $module_list[] = './api/EWay1';
        $module_list[] = './api/EWay2';
        $module_list[] = './vendor/zendframework/zend-developer-tools/src/ZendDeveloperTools/Match';
        $module_list[] = './vendor/zendframework/zend-developer-tools/src/ZendDeveloperTools';
        $module_list[] = './vendor/zendframework/zend-developer-tools/src/ZendDeveloperTools3';
        $module_list[] = './api2/EWa2y';
        $module_list[] = './api2/EWa2y1';
        $module_list[] = './api2/EWa2y2';
        $module_list[] = './api3/EWa22y';
        $module_list[] = './api3/EWa12y1';
        $module_list[] = './api3/EWa12y2';

        $this->linked_list['EWa2y'][ microtime() ] = 'Album';
        $this->linked_list['EWa2y'][ microtime() ] = 'Application';
        $this->linked_list['EWa2y'][ microtime() ] = 'ELayout';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWay1';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWay2';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWay3';
        $this->linked_list['EWa2y'][ microtime() ] = 'Match';
        $this->linked_list['EWa2y'][ microtime() ] = 'ZendDeveloperTools';
        $this->linked_list['EWa2y'][ microtime() ] = 'ZendDeveloperTools3';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa2y';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa2y1';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa2y2';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa22y';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa12y1';
        $this->linked_list['EWa2y'][ microtime() ] = 'EWa12y2';

        return $module_list;
    }

    private function _getAllModules( )
    {
        if( $loaded_modules = $this->_getCache( 'loaded_modules' ) ) {

            $this->linked_list = $this->_getCache( 'linked_list' );

            return $loaded_modules;

        } else {

            $config = include "config/application.config.php";
            $service = $this->getServiceLocator()->get('module_locator_service');
            // $sample_req = $this->getServiceLocator()->get('preg_album_controller');
            // $sample_req = $this->getServiceLocator()->get('eway_rapid_prepare_token_service');

            $this->linked_list = $service->setPaths( $config["module_listener_options"]["module_paths"] )
                                         ->setModules( $config["modules"] )
                                         ->locate();
            
            $this->_setCache( 'linked_list', $this->linked_list );

            $loaded_modules = $service->getModulesPath( );
            
            $this->_setCache( 'loaded_modules', $loaded_modules );

            asort( $loaded_modules );

        }
      
        return $loaded_modules;
    }

    private function _getCache( $name )
    {
        $binary = json_decode( file_get_contents('data/cache.log'), true );

        if( isset( $binary[ $name ] ) ) {
            return $binary[ $name ];
        } else {
            return false;
        }
    }

    private function _setCache( $name, $data )
    {
        $binary = json_decode( file_get_contents('data/cache.log'), true );
        $binary[ $name ] = $data;

        file_put_contents('data/cache.log', json_encode( $binary ) );
    }

    private function _setViewBasedOnFileName( $file_name, $view ) 
    {
        $folder = $this->_getFolderBasedOnFileName( $file_name );
        $file_extension = $this->_getExtension( $file_name );

        switch( $file_extension ) {
            case "js": $folder="js"; break;
            case "css": $folder="css"; break;
            case "gif":
            case "png":
            case "jpeg":
            case "jpg": 
                echo file_get_contents( __DIR__ . ' /../../../view/ELayout/assets/' . $folder . '/' . $file_name );
                die();
            break;
            default:
        }

        $view->setTemplate('ELayout/assets/' . $folder . '/' . $file_name );
    }

    private function _getFolderBasedOnFileName( $file ) 
    {
        $file_extension = $this->_getExtension( $file );

        switch( $file_extension ) {
            case "js": $folder="js"; break;
            case "css": $folder="css"; break;
            case "gif":
            case "png":
            case "jpeg":
            case "jpg": $folder="img"; break;
            default:
        }

        return $folder;
    }

    private function _setHeaderBasedOnFileName( $file ) 
    {
        $file_extension = $this->_getExtension( $file );

        switch( $file_extension ) {
            case "gif": $ctype="image/gif"; break;
            case "png": $ctype="image/png"; break;
            case "jpeg":
            case "jpg": $ctype="image/jpg"; break;
            case "js": $ctype="application/x-javascript"; break;
            case "css": $ctype="text/css"; break;
            default:
        }

        header('Content-type: ' . $ctype);
    }

    private function _getExtension( $file ) 
    {    
        $filename = basename($file);
    
        return strtolower(substr(strrchr($filename,"."),1));
    
    }
            
}
