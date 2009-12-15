<?php

/****************************************************
*Calendar definition
*
*****************************************************/
class Calendar {

    const VERSION = '0.5';

    /* Status */
    const STATUSID_0 = 'TENTATIVE';
    const STATUSID_1 = 'CONFIRMED';
    const STATUSID_3 = 'CANCELLED';

    /* Class*/
    const CLASSID_0 = 'PUBLIC';
    const CLASSID_1 = 'PRIVATE';
    const CLASSID_2 = 'CONFIDENTIAL';

    /*Periodicity constants*/
    const FREQUENCY_NONE_ID = 0;
    const FREQUENCY_DAILY_OPEN_ID = 1;
    const FREQUENCY_DAILY_ID = 2;
    const FREQUENCY_WEEKLY_ID = 3;
    const FREQUENCY_BIMONTHLY_ID = 4;
    const FREQUENCY_MONTHLY_ID = 5;
    const FREQUENCY_ANNUAL_ID = 6;


    public $eventClass = array();
    public $calendarSettings = array();


/******************************************
*Calendar Constructor
*method
******************************************/
    private function __construct() {
        $ini = eZINI::instance('calendar.ini');
        $this->eventClass = $ini->variableMulti('EventClass', array(
            'EventClassID'   => 'EventClassID',
            'Dictionary'     => 'Dictionary',
            ) );
        $this->calendarSettings = $ini->variableMulti('ICalSettings', array(
            'CacheTime'     => 'CacheTime',
            'PathPrefix'     => 'PathPrefix',
            ) );
    }
/*********************************************************************
* This method return an instance of the calendar class
*
*********************************************************************/
    static function instance() {
        $impl = &$GLOBALS["CalendarGlobalInstance"];
        $class = get_class( $impl );

        if ( $class != 'Calendar') {
            $impl = new Calendar();
        }
        return $impl;
    }

 /*****************************************************************
 *
 * Returns calendar nodeId (int)
 *
 *
 *****************************************************************/

    public function getNodeID() {
        $Module = &$GLOBALS['eZRequestedModule'];

        if ( array_key_exists(0, $Module->OriginalParameters) && is_int($Module->OriginalParameters[0]) ) {
            $nodeID = $Module->OriginalParameters[0];
        }
        else {
            $uriString = '';

            if ( array_key_exists(0, $Module->OriginalParameters) ) {
                $uriString = $Module->OriginalParameters[0];
            }

            if ( $this->calendarSettings['PathPrefix'] != ''  ) {
                $uriString = eZURLAliasML::cleanURL( $this->calendarSettings['PathPrefix'] ) . $uriString;
            }

            eZURLAliasML::cleanURL($uriString);

            if ( empty( $uriString ) ) {
                $ini = eZINI::instance('site.ini');
                $uri = eZURI::instance( $ini->variable( 'SiteSettings', 'IndexPage') );
                $url = $uri->elements();
                $url = eZURLAliasML::urlToAction( $url );
                $nodeID = eZURLAliasML::nodeIDFromAction( $url );
            }
            else {
                $uri = eZURI::instance($uriString);
                eZURLAliasML::translate($uri);
                $url = $uri->elements();
                $url = eZURLAliasML::urlToAction( $url );
                $nodeID = eZURLAliasML::nodeIDFromAction( $url );
            }
        }
        return $nodeID;
    }
}    

?>