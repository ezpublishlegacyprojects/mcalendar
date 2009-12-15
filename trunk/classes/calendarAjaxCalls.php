<?php
/************************************************************************************
 * This class contains methods for updating calendar events through an ajax interface
 *
 * @author mosarg@gmail.com
 ***********************************************************************************/

class calendarAjaxCalls {


/************************************************************
*
*Remove events from calendar enforcing user permissions
*
*************************************************************/
    public static function removeEvent($args) {
        $nodeID=$args[0];
        $node = eZContentObjectTreeNode::fetch( $nodeID );
        if(is_object($node)) {
            if($node->canRemove()):
                $node->removeNodeFromTree(false);
            else:
                return 'You are not allowed to remove this node';
            endif;
        }
        return 'Node removal succesfull';
    }

/****************************************************************
*
* Updated event from ajax input checking users permissions
*
*
****************************************************************/

    public static function updateEventAjax($args) {
        $objectId=$args[0];
        $arguments=json_decode($_POST['postdata'],true);
        $event=eZContentObject::fetch($objectId);
        if($event->canEdit()) {
            $xmlText='<?xml version="1.0" encoding="utf-8"?>
                <section xmlns:image="http://ez.no/namespaces/ezpublish3/image/"
                         xmlns:xhtml="http://ez.no/namespaces/ezpublish3/xhtml/"
                         xmlns:custom="http://ez.no/namespaces/ezpublish3/custom/">
                        <paragraph>'.$arguments['text'].'</paragraph></section>';

            $mod_attributes=array('to_time'=>array('data_int',(int)$args[2]),
                'from_time'=>array('data_int',(int)$args[1]),
                'short_title'=>array('data_text',$arguments['short_title']),
                'text'=>array('data_text',$xmlText));

            $datamap=$event->attribute('data_map');
            foreach($mod_attributes as $key=>$content) {
                $current_attribute=$datamap[$key];
                $current_attribute->setContent($content[1]);
                $current_attribute->setAttribute($content[0],$content[1]);
                $current_attribute->sync();
            }

        }
        else {
            return 'You are not allowed to edit this event';
        }
        return 'Edit success';

    }



/***************************************************************
*
*DEPRECATED
*
*
***************************************************************/
    public static function addEvent($args) {
        $user = eZUser::currentUser();
        $parentNodeId=$args[0];
        $fromTime=$args[1];
        $toTime=$args[2];
        $arguments=json_decode($_POST['postdata'],true);

        $xmlText='<?xml version="1.0" encoding="utf-8"?>
                <section xmlns:image="http://ez.no/namespaces/ezpublish3/image/"
                         xmlns:xhtml="http://ez.no/namespaces/ezpublish3/xhtml/"
                         xmlns:custom="http://ez.no/namespaces/ezpublish3/custom/">
                        <paragraph>'.$arguments['text'].'</paragraph></section>';
        $params = array();
        $params['creator_id'] = $user->id();
        $params['parent_node_id'] = (int)$parentNodeId;
        $params['class_identifier'] = 'event';
        $params['attributes']=array('short_title'=>$arguments['short_title'],'text'=>$xmlText,
            'from_time'=>$fromTime,'to_time'=>$toTime,'frequency'=>'0','frequency_end'=>$toTime);
        $newObject = eZContentFunctions::createAndPublishObject($params);
        $node = eZContentObjectTreeNode::fetch( $newObject->attribute( 'main_node_id' ) );
        $data=array();
        $data['url_alias']=$node->urlAlias();
        $data['object_id']=$newObject->ID;
        $data['node_id']=$newObject->attribute( 'main_node_id' );
        $data['current_language']=$newObject->currentLanguage();
        $data['title']=$arguments['short_title'];
        return $data;

    }

/*****************************************************************
 * $ajaxid=fake id to synx with ajax frontend
 * This method creates an event object from ajax input
 *
 *****************************************************************/
    public static function addEventAjax($args) {
        $user = eZUser::currentUser();
        $parentNodeId=$args[0];
        $fromTime=$args[1];
        $toTime=$args[2];
        $arguments=json_decode($_POST['postdata'],true);
        $xmlText='<?xml version="1.0" encoding="utf-8"?>
                <section xmlns:image="http://ez.no/namespaces/ezpublish3/image/"
                         xmlns:xhtml="http://ez.no/namespaces/ezpublish3/xhtml/"
                         xmlns:custom="http://ez.no/namespaces/ezpublish3/custom/">
                        <paragraph>'.$arguments['text'].'</paragraph></section>';
        $params = array();
        $params['creator_id'] = $user->id();
        $params['parent_node_id'] = (int)$parentNodeId;
        $params['class_identifier'] = 'event';
        $params['attributes']=array('short_title'=>$arguments['short_title'],'text'=>$xmlText,
            'from_time'=>$fromTime,'to_time'=>$toTime,'frequency'=>'0','frequency_end'=>$toTime);
        $newObject = eZContentFunctions::createAndPublishObject($params);
        $node = eZContentObjectTreeNode::fetch( $newObject->attribute( 'main_node_id' ) );

        $data=array('id'=>$arguments['id'],
            'start'=>$fromTime*1000,'end'=>$toTime*1000,'title'=>$arguments['short_title'],
            'nodeId'=>(int)($newObject->attribute( 'main_node_id' )),'parentNodeId'=>(int)$parentNodeId,
            'urlAlias'=>$node->urlAlias(),'currentLanguage'=>$newObject->currentLanguage(),
            'objectId'=>$newObject->ID,'frequency'=>0,'isMain'=>true);
        return $data;
    }

/************************************************
*
 * Fetches events from db and outputs json data
 *
 *
 *
 ************************************************/
    public static function fetchEvents($args) {
        $parentNodeId=(int)$args[0];
        $fromTime=(int)$args[1];
        $toTime=(int)$args[2];
        $view=$args[3];
        return calendarFetchFunctions::fetchEventsAjax($parentNodeId,$fromTime,$toTime,$view);

    }


}
?>
