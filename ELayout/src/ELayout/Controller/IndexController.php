<?php

namespace ELayout\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class IndexController extends AbstractActionController
{
    public function indexAction() 
    {       
            $view = new ViewModel( );
            
            $module_list = $this->_getAllModules( );

            $view->setVariable('module_list', json_encode( $module_list ) );
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

    private function _getAllModules( )
    {
        $manager = $this->getServiceLocator()->get('ModuleManager');
        $modules = include __DIR__ . ' /../../../../../autoload_classmap.php';
        $basepath = dirname( dirname( dirname( dirname( dirname( __DIR__ ) ) ) ) );

        foreach( $modules as $index => $filename )
            if( strpos( $filename, "Module.php" ) > 0 )
                $loaded_modules[ ] = str_replace( array( $basepath, "/Module.php"), "", $filename);

        asort( $loaded_modules );

        return $loaded_modules;
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
