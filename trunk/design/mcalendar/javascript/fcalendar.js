

$(document).ready(function() {
    var $actionUrl =$('p[title="action"]').text();
    var $editIcon=$('p[title="editIcon"]').text();
    var nodeId=$('p[title="node_id"]').text();
    var $calendar = $('#calendar');


    $calendar.fullCalendar({
        defaultView: 'agendaWeek',
        firstHour:7,
        timeslotsPerDay:30,
        allDayDefault:false,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        events: function(start, end, callback) {
            $.ez('mcalendar::fetchEvents::'+nodeId+'::'+Math.round(start.getTime()/1000)+'::'+Math.round(end.getTime()/1000)+'::ajaxweek',function(data) {
                callback(data.content);
            });
        },
        eventResize:function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view){
            var ezaction;
            var start=Math.round(event.start.getTime()/1000),
                end=Math.round(event.end.getTime()/1000);

            ezaction='mcalendar::updateEventTimeSlot::'+event.objectId+'::'+start+'::'+end;
            $.ez(ezaction);
        },
        eventDrop: function(event, delta) {
            var ezaction;
            var start=Math.round(event.start.getTime()/1000),
                end=Math.round(event.end.getTime()/1000);
  
            ezaction='mcalendar::updateEventTimeSlot::'+event.objectId+'::'+start+'::'+end;
            $.ez(ezaction);
        },
        loading: function(bool) {
            if (bool) $('#loading').show();
            else $('#loading').hide();
        },
        dayClick: function(dayDate, allDay, jsEvent, view){
            var timestamp=dayDate.getTime()/1000;
            var calEvent={
                id:Math.floor(100000+Math.random()*10000),
                title:'New Event',
                start: timestamp,
                end:timestamp+3600,
                isMain:true,
                frequency:0
            };
            $calendar.fullCalendar('renderEvent',calEvent,true);
            var $dialogContent = $("#event_edit_container");
            var dialogParams={
                calendar:$calendar,
                node_id:nodeId,
                calevent:calEvent,
                timeslottimes:$calendar.fullCalendar("getTimeslotTimes", calEvent.start)
            }
          
            $dialogContent.dialog({
                action:'create',
                params:dialogParams
            }).show();
         
        },
        eventClick:function(calEvent, jsEvent, view){
        
            var $dialogContent = $("#event_edit_container");
            var dialogParams={
                calendar:$calendar,
                node_id:nodeId,
                calevent:calEvent,
                timeslottimes:$calendar.fullCalendar("getTimeslotTimes", calEvent.start)
            }
            $dialogContent.dialog({
                action:'edit',
                params:dialogParams
            }).show();
        },

        eventRender:function(calEvent,$event) {
            if (calEvent.end.getTime() < new Date().getTime()) {
                $event.css("backgroundColor", "#aaa");
                $event.find(".time").css({
                    "backgroundColor" : "#119",
                    "border" : "2px solid #888"
                });
            }
            $event.append('<div class="info"> isMain '+calEvent.isMain+' Freq:'+calEvent.frequency+'</div>');
            $event.append(renderToolbar(calEvent))  ;

        }

    });

    

   
    function renderToolbar(calEvent)
    {
        var tools='<div id="tools"> <form action='+$actionUrl+' method="post">';
        tools+='<input type="image" name="EditButton" src='+$editIcon+' alt="Edit" />';
        tools+='<input type="hidden" name="ContentObjectLanguageCode" value="'+calEvent.currentLanguage+'"/>';
        tools+='<input type="hidden" name="ContentObjectID" value="'+calEvent.objectId+'"/>';
        tools+='<input type="hidden" name="NodeID" value="'+calEvent.nodeId+'" />';
        tools+='<input type="hidden" name="ContentNodeID" value="'+calEvent.nodeId+'" />';
        tools+='</form></div>';
        return tools;
    }


});