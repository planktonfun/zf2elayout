ZF2ELayout
==========

Zendframework 2 Electronic Representation

- Displays current application modules in relation to other modules in HTML5
- Helps developers understand current application with ease 
  without having to go through scripts one by one.

Installation:
  - Generate zf2 classmap via command line if haven't already:
  
  ```  
  $ vendor/bin/zf.php generate class_map
  ```
  
  - Install this module to your vendor folder via command line:	
  
  ```
  $ php composer.phar require planktonfun/zf2elayout:dev-master
  $ cp -r vendor/planktonfun/zf2elayout/ELayout module/ELayout
  $ rm -r vendor/planktonfun
  ```
  
  - Add "ELayout" Module to your application.config.php
  - Browse the module through "/emap"
  - Enjoy!

What it looks like:
==========
![Alt text](/Screenshot.png "Title")
