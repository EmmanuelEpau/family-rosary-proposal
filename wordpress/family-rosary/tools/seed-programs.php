<?php
/** Run explicitly with wp eval-file after installing this theme; activation never creates content. */
if (!defined('WP_CLI') || !WP_CLI) { return; }
$parent=get_page_by_path('programs');
$parent_id=$parent?$parent->ID:wp_insert_post(array('post_type'=>'page','post_status'=>'publish','post_name'=>'programs','post_title'=>'Programs'));
foreach(WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern){
 if(strpos($pattern['name'],'family-rosary/program-')!==0)continue;
 $slug=substr($pattern['name'],strlen('family-rosary/program-'));
 if(get_page_by_path('programs/'.$slug)){WP_CLI::log('Preserved existing '.$slug);continue;}
 $id=wp_insert_post(array('post_type'=>'page','post_status'=>'publish','post_parent'=>$parent_id,'post_name'=>$slug,'post_title'=>$pattern['title'],'post_content'=>$pattern['content']));
 update_post_meta($id,'_wp_page_template','page-program');
}
WP_CLI::success('Program pages created; existing pages preserved.');
