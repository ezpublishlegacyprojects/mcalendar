<?php


class calendarContentObject {

    public  $calendar;
    private $calendarFromTimeDate;
    private $calendarToTimeDate;
    private $calendarFromTimeDayOfWeek;


    function __construct( $from_time, $to_time) {
        $this->calendarFromTimeDate = new calDate($from_time);
        $this->calendarToTimeDate = new calDate($to_time);
        $this->calendarFromTimeDayOfWeek = date('N', $this->calendarFromTimeDate->timeStamp() );
        $this->calendar = array();
    }

    function view($events,$view='month') {
        $CalendarRaw = Calendar::instance();
        foreach ( $events as $event ) {
            $eventdataMap = $event->dataMap();
            $eventFromTimeDate = new calDate( $eventdataMap['from_time']->content()->attribute('timestamp') );
            $eventToTimeDate = new calDate( $eventdataMap['to_time']->content()->attribute('timestamp') );
            $test=$eventdataMap['from_time']->content()->attribute('timestamp');
            if ( self::isSameDay($eventFromTimeDate, $eventToTimeDate) ) {

                if ( !self::hasFrequency($event) ) {
                    $this->addSimpleEvent( $event, $eventFromTimeDate,$view);
                }
                else {
                    $this->addFrequentEvent( $event, $eventFromTimeDate, $eventToTimeDate,$view );
                }
            }

            else {
                $this->addMultiDaysEvent( $event, $eventFromTimeDate, $eventToTimeDate,$view);
            }
        }
        return true;

    }

    static function isSameDay( $fromDate, $toDate ) {
        if ( $fromDate->timeStamp() == $toDate->timeStamp() || $toDate->timeStamp() == 0||$toDate->timeStamp()==-3600 ) {
            return true;
        }
        return false;
    }

    static function hasFrequency ( $event ) {
        $CalendarRaw = Calendar::instance();
        $dataMap = $event->dataMap();
        $attributeFrequency = $CalendarRaw->eventClass['Dictionary']['Frequency'];
        if (isset($dataMap[$attributeFrequency])):
            $frequency = $dataMap[$attributeFrequency]->content();
        else:
            $frequency=array(0);
        endif;
        if ( strtolower($attributeFrequency) == 'disabled' || $frequency[0] == Calendar::FREQUENCY_NONE_ID ) {
            return false;
        }

        return true;
    }



    private function addEvent( $event,$timeStamp,$view) {
        $CalendarRaw = Calendar::instance();
        $attribute = $CalendarRaw->eventClass['Dictionary']['FullDay'];
        $nature = 'partial';
        if ( strtolower($attribute) != 'disabled' && $this->dataMap[$attribute]->content() ) {
            $nature = 'full';
        }
        switch($view):
            case 'month':
                $this->calendar[(int)$timeStamp->year()]
                        [(int)$timeStamp->month()][(int)$timeStamp->day()][$nature][] = $event;
                break;
            case 'week':
                $this->calendar[(int)$timeStamp->year()]
                        [(int)$timeStamp->week()][(int)$timeStamp->dayW()][$nature][] = $event;
                break;
            case 'ajaxweek':
                $attributes=$event->ContentObject->contentObjectAttributes(false);
                $out=$event->canEdit();
                $shortTitle=$attributes[0]->DataText;
                $textContent=$attributes[2]->DataText;
                $fromTime=(int)($attributes[4]->DataInt);
                $toTime=(int)($attributes[5]->DataInt);
                $frequency=(int)($attributes[6]->DataText);
                $isMain=true;
                $currentTimeStamp=$timeStamp->timeStamp();
                if(!$toTime) $toTime=$currentTimeStamp+86399;
                if ($frequency>0) {
                    $toTimeMain=$toTime;
                    $toTime=mktime( (int)(date('G',$toTime)),(int)(date('i',$toTime)),0,(int)$timeStamp->month(),(int)$timeStamp->day(),(int)$timeStamp->year());
                    $fromTime=mktime( (int)(date('G',$fromTime)),(int)(date('i',$fromTime)),0,(int)$timeStamp->month(),(int)$timeStamp->day(),(int)$timeStamp->year());
                    if( $toTime>$toTimeMain+100) $isMain=false;
                }
                $this->calendar[]=array('id'=>(int)($event->NodeID),
                        'start'=>$fromTime,'end'=>$toTime,'title'=>$shortTitle,
                        'nodeId'=>$event->NodeID,'parentNodeId'=>$event->ParentNodeID,
                        'urlAlias'=>$event->PathIdentificationString,'currentLanguage'=>$event->CurrentLanguage,
                        'objectId'=>$event->ContentObjectID,'frequency'=>$frequency,'isMain'=>$isMain);
                 break;
            case 'plain':
                $this->calendar[]=$event;
                break;
            default:
            endswitch;
        return true;
    }

    private function addSimpleEvent( $event, $eventFromTimeDate,$view ) {
        $this->addEvent($event,$eventFromTimeDate,$view );
        return true;
    }


    private function addMultiDaysEvent( $event, $eventFromTimeDate, $eventToTimeDate,$view) {
        $cursorDate = new calDate( max($this->calendarFromTimeDate->timeStamp(), $eventFromTimeDate->timeStamp()) );
        $cursorEndDate = new calDate( min($this->calendarToTimeDate->timeStamp(), $eventToTimeDate->timeStamp()) );

        switch($view){

        case 'ajaxweek':
            $this->addEvent($event,$eventFromTimeDate,$view );
        break;
        default:
        if ( !self::hasFrequency( $event ) ) {
            while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {
                if ( $eventFromTimeDate->timeStamp() <= $cursorDate->timeStamp() || $cursorDate->timeStamp() > $eventToTimeDate->timeStamp() ) {
                    $this->addEvent($event,$cursorDate,$view );

                }
                $cursorDate->adjustDate(0, 1);
            }
        }

        else {
            eZDebug::writeWarning( $event->Name . " : Frequency event on few day is not implemented" );
        }
        break;

        }
    }

    private function addFrequentEvent( $event, $eventFromTimeDate, $eventToTimeDate,$view) {
        $CalendarRaw = Calendar::instance();
        $eventdataMap = $event->dataMap();
        $frequency = $eventdataMap[$CalendarRaw->eventClass['Dictionary']['Frequency']]->content();
        $frequencyEnd = $eventdataMap[$CalendarRaw->eventClass['Dictionary']['FrequencyEnd']]->content()->attribute('timestamp');
        $frequencyEndDate = new calDate( $frequencyEnd );

        $cursorDate = new calDate( max($this->calendarFromTimeDate->timeStamp(), $eventFromTimeDate->timeStamp()) );
        if ( $frequencyEnd == 0 ) {
            $cursorEndDate = new calDate( $this->calendarToTimeDate->timeStamp() );
        }
        else {
            $cursorEndDate = new calDate( min($this->calendarToTimeDate->timeStamp(), $frequencyEnd) );
        }

        $eventDayOfYear = date('Z', $eventToTimeDate->timeStamp() );

        switch ( $frequency[0] ) {

            case Calendar::FREQUENCY_DAILY_OPEN_ID:
                $this->addDailyOpenEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view);
                break;


            case Calendar::FREQUENCY_DAILY_ID:
                $this->addDailyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view );
                break;


            case Calendar::FREQUENCY_WEEKLY_ID:
                $this->addWeeklyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view);
                break;


            case Calendar::FREQUENCY_BIMONTHLY_ID:
                $this->addBiMonthlyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view);
                break;


            case Calendar::FREQUENCY_MONTHLY_ID:
                $this->addMonthlyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view);
                break;


            case Calendar::FREQUENCY_ANNUAL_ID:
                $this->addAnnualEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view);
                break;
        }

        return true;
    }


    private function addDailyOpenEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view) {
        $eventDayOfWeek = date('N', $eventToTimeDate->timeStamp() );
        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {
            $cursorDayOfWeek = date('N', $cursorDate->timeStamp() );
            if ( $cursorDayOfWeek < 6 ) {

                $this->addEvent($event,$cursorDate,$view );

            }
            $cursorDate->adjustDate(0, 1);
        }
    }

    private function addDailyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view ) {
        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {
            $this->addEvent($event,$cursorDate,$view );
            $cursorDate->adjustDate(0, 1);
        }
    }

    private function addWeeklyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view ) {
        $eventDayOfWeek = date('N', $eventToTimeDate->timeStamp() );
        $cursorDayOfWeek = date('N', $cursorDate->timeStamp() );
        $goTo = $eventDayOfWeek - $cursorDayOfWeek;

        if ( $goTo >= 0) {
            $cursorDate->adjustDate(0, $goTo);
        }
        else {
            $cursorDate->adjustDate(0, $goTo+7);
        }

        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {

            $this->addEvent($event,$cursorDate,$view );


            $cursorDate->adjustDate(0, 7);
        }
    }
    private function addBiMonthlyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view ) {
        $eventDayOfWeek = date('N', $eventToTimeDate->timeStamp() );
        $cursorDayOfWeek = date('N', $cursorDate->timeStamp() );
        $eventWeekOfUnix = floor($eventToTimeDate->timeStamp() / 604800);


        $goTo = $eventDayOfWeek - $cursorDayOfWeek;
        if ( $goTo >= 0) {
            $cursorDate->adjustDate(0, $goTo);
        }
        else {
            $cursorDate->adjustDate(0, $goTo+7);
        }

        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {
            $cursorWeekOfUnix = floor($cursorDate->timeStamp() / 604800);
            if ( $eventWeekOfUnix % 2 == $cursorWeekOfUnix % 2 ) {


                $this->addEvent($event,$cursorDate,$view );


                $cursorDate->adjustDate(0, 14);
            }
            else {
                $cursorDate->adjustDate(0, 7);
            }
        }

    }
    private function addMonthlyEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate,$view ) {
        $goTo = $eventToTimeDate - $cursorDate->day();
        if ( $goTo >= 0) {
            $cursorDate->adjustDate(0, $goTo);
        }
        else {
            $cursorDate->adjustDate(1, $goTo);
        }

        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {

            $this->addEvent($event,$cursorDate,$view);


            $cursorDate->adjustDate(1);
        }
    }

    private function addAnnualEvent( $event, $cursorDate, $cursorEndDate, $eventToTimeDate ,$view) {
        $goTo = new calDate();
        $goTo->setMDY( $eventToTimeDate->month(), $eventToTimeDate->day(), $cursorDate->year() );

        while ( $cursorDate->timeStamp() <= $cursorEndDate->timeStamp() ) {
            if ( $cursorDate->timeStamp() <= $goTo->timeStamp() && $goTo->timeStamp() < $cursorEndDate->timeStamp() ) {

                $this->addEvent($event,$cursorDate,$view);


            }
            $cursorDate->adjustDate(12);
        }

    }

}    

?>