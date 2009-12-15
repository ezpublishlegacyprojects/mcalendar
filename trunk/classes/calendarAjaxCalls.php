<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of scuolaAjaxCalls
 *
 * @author mosa
 */
class calendarAjaxCalls {
    
  public static function removeEvent($args) {
        $nodeID=$args[0];
        $node = eZContentObjectTreeNode::fetch( $nodeID );
        if(is_object($node)){
        $node->removeNodeFromTree(false);}
    }

    public static function addEvent($args) {
        $user = eZUser::currentUser();
        $parentNodeId=$args[0];
        $fromTime=$args[1];
        $toTime=$args[2];
        $simpleText=$args[3];
        $title=$args[4];
        $xmlText='<?xml version="1.0" encoding="utf-8"?>
                <section xmlns:image="http://ez.no/namespaces/ezpublish3/image/"
                         xmlns:xhtml="http://ez.no/namespaces/ezpublish3/xhtml/"
                         xmlns:custom="http://ez.no/namespaces/ezpublish3/custom/">
                        <paragraph>'.$simpleText.'</paragraph></section>';
        $params = array();
        $params['creator_id'] = $user->id();
        $params['parent_node_id'] = (int)$parentNodeId;
        $params['class_identifier'] = 'event';
        $params['attributes']=array('short_title'=>$title,'text'=>$xmlText,
            'from_time'=>$fromTime,'to_time'=>$toTime,'frequency'=>'0','frequency_end'=>$toTime);
        $newObject = eZContentFunctions::createAndPublishObject($params);
        $node = eZContentObjectTreeNode::fetch( $newObject->attribute( 'main_node_id' ) );
        $data=array();
        $data['url_alias']=$node->urlAlias();
        $data['object_id']=$newObject->ID;
        $data['node_id']=$newObject->attribute( 'main_node_id' );
        $data['current_language']=$newObject->currentLanguage();
        return $data;

    }


}
?>
