<?php
return array(
	'controllers' => array(
        'invokables' => array(
            'ELayout\Controller\Index' => 'ELayout\Controller\IndexController'
        ),
    ),
    'router' => array(
        'routes' => array(
            'e-map' => array(
                'type'        => 'segment',
                'options'    => array(
                    'route'        => '/emap[/]',
                    'defaults'    => array(
                        'controller'    => 'ELayout\Controller\Index',
                        'action'        => 'index',
                    ),
                ),
            ),
            'e-map-assets' => array(
                'type'        => 'segment',
                'options'    => array(
                    'route'        => '/emap/assets[/:filename]',
                    'defaults'    => array(
                        'controller'    => 'ELayout\Controller\Index',
                        'action'        => 'assets',
                        'filename'      => null
                    ),
                ),
            ),
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'elayout' => __DIR__ . '/../view',
        ),
        'template_map' => array(
            'layout/el_layout'                => __DIR__ . '/../view/ELayout/layout/layout.phtml',
            'layout/el_header'                => __DIR__ . '/../view/ELayout/layout/partials/common/header.phtml',
            'layout/el_footer'                => __DIR__ . '/../view/ELayout/layout/partials/common/footer.phtml',
        ),
    )
);