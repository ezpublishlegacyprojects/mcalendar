$(document).ready(function() {
  
    var $calendar = $('#calendar');
    var id = 10;
    var $actionUrl =$('p[title="action"]').text();
    var $editIcon=$('p[title="editIcon"]').text();

   
    $calendar.weekCalendar({
        timeslotsPerHour : 4,
        allowCalEventOverlap : true,
        firstDayOfWeek : 1,
        businessHours :{
            start: 8,
            end: 16,
            limitDisplay: true
        },
        height : function($calendar) {
            return $(window).height() - $("h1").outerHeight();
        },
        eventRender : function(calEvent, $event) {
            
            if (calEvent.end.getTime() < new Date().getTime()) {
                $event.css("backgroundColor", "#aaa");
                $event.find(".time").css({
                    "backgroundColor" : "#119",
                    "border" : "2px solid #888"
                });
            }
            $event.append('<div class="info"> isMain '+calEvent.isMain+' Freq:'+calEvent.frequency+'</div>');
           
            $event.append(renderToolbar(calEvent))  ;
            
        },
        draggable : function(calEvent, $event) {
            return (calEvent.readOnly != true)&&(calEvent.isMain==true);
            
        },
        resizable : function(calEvent, $event) {
            return (calEvent.readOnly != true)&&(calEvent.isMain==true);
        },
        eventNew : function(calEvent, $event) {
            var $dialogContent = $("#event_edit_container");
            resetForm($dialogContent);
            var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
            var endField =  $dialogContent.find("select[name='end']").val(calEvent.end);
            var titleField = $dialogContent.find("input[name='title']");
            var bodyField = $dialogContent.find("textarea[name='body']");
                   
            $dialogContent.dialog({
                modal: true,
                title: "New Calendar Event",
                close: function() {
                    $dialogContent.dialog("destroy");
                    $dialogContent.hide();
                    $('#calendar').weekCalendar("removeUnsavedEvents");
                },
                buttons: {
                    save : function(){
                        calEvent.id = id;
                        id++;
                        calEvent.start = new Date(startField.val());
                        calEvent.end = new Date(endField.val());
                        calEvent.title = titleField.val();
                        calEvent.body = bodyField.val();
                        var action='mcalendar::addEventAjax::1077::'+toTimestamp(calEvent.start)+'::'+toTimestamp(calEvent.end)+'::'+calEvent.body+'::'+calEvent.title+'::'+calEvent.id;
                        $.ez(action,{
                            postData: 'hi!'
                        },function(data){
                            $calendar.weekCalendar("updateEvent", data.content);
                            });

                        $calendar.weekCalendar("removeUnsavedEvents");
                        $calendar.weekCalendar("updateEvent", calEvent);
                        $dialogContent.dialog("close");
                    },
                    cancel : function(){
                        $dialogContent.dialog("close");
                    }
                }
            }).show();
             
            $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
            setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
            $(window).resize().resize(); //fixes a bug in modal overlay size ??
            
            
        },
        eventDrop : function(calEvent, $event) {
            if((calEvent.readOnly)||(!calEvent.isMain)) {
                return;
            }
            var action='mcalendar::updateEventAjax::'+calEvent.objectId+'::'+toTimestamp(calEvent.start)+'::'+toTimestamp(calEvent.end);
            $.ez(action);
        },
        eventResize : function(calEvent, $event) {
            if((calEvent.readOnly)||(!calEvent.isMain)) {
                return;
            }
            var action='mcalendar::updateEventAjax::'+calEvent.objectId+'::'+toTimestamp(calEvent.start)+'::'+toTimestamp(calEvent.end);
            $.ez(action);
           
        },
        eventClick : function(calEvent, $event) {
            
            if(calEvent.readOnly) {
                return;
            }
            
            var $dialogContent = $("#event_edit_container");
            resetForm($dialogContent);
            var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
            var endField =  $dialogContent.find("select[name='end']").val(calEvent.end);
            var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
            var bodyField = $dialogContent.find("textarea[name='body']");
            bodyField.val(calEvent.body);

            $dialogContent.dialog({
                modal: true,
                title: "Edit - " + calEvent.title,
                close: function() {
                    $dialogContent.dialog("destroy");
                    $dialogContent.hide();
                    $('#calendar').weekCalendar("removeUnsavedEvents");
                },
                buttons: {
                    save : function(){
   
                        calEvent.start = new Date(startField.val());
                        calEvent.end = new Date(endField.val());
                        calEvent.title = titleField.val();
                        calEvent.body = bodyField.val();
                                             
                        $calendar.weekCalendar("updateEvent", calEvent);
                        $dialogContent.dialog("close");
                    },
                    "delete" : function(){
                        var action='mcalendar::removeEvent::'+calEvent.nodeId;
                        $.ez(action);
                        $calendar.weekCalendar("removeEvent", calEvent.id);
                        $dialogContent.dialog("close");
                    },
                    cancel : function(){
                        $dialogContent.dialog("close");
                    }
                }
            }).show();
            
            var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
            var endField =  $dialogContent.find("select[name='end']").val(calEvent.end);
            $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
            setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
            $(window).resize().resize(); //fixes a bug in modal overlay size ??
        
        },
        eventMouseover : function(calEvent, $event) {
            
        },
        eventMouseout : function(calEvent, $event) {
        },
        noEvents : function() {
            
        },
        data : function(start, end, callback) {
       
            $.ez('mcalendar::fetchEvents::1077::'+Math.round(start.getTime()/1000)+'::'+Math.round(end.getTime()/1000)+'::ajaxweek',function(data) {
                callback(data.content);
            });
        }
    });
    
    function resetForm($dialogContent) {
        $dialogContent.find("input").val("");
        $dialogContent.find("textarea").val("");
    }
    
    function getEventData() {
   
        
        return {
            "events" : [
            {
                "id":1,
                "start":1.2566286e+12,
                "end":1.256634e+12,
                "title":"CANE CANE"
            }
            ]
        };
    }


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


    function toTimestamp(date){
        return Math.round(date.getTime()/1000);
    }
    
    /*
     * Sets up the start and end time fields in the calendar event 
     * form for editing based on the calendar event being edited
     */
    function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) {
            
        for(var i=0; i<timeslotTimes.length; i++) {
            var startTime = timeslotTimes[i].start; 
            var endTime = timeslotTimes[i].end;
            var startSelected = "";
            if(startTime.getTime() === calEvent.start.getTime()) {
                startSelected = "selected=\"selected\"";
            }
            var endSelected = "";
            if(endTime.getTime() === calEvent.end.getTime()) {
                endSelected = "selected=\"selected\"";
            }
            $startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
            $endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");
       
        }
        $endTimeOptions = $endTimeField.find("option"); 
        $startTimeField.trigger("change");
    }
   
    var $endTimeField = $("select[name='end']");
    var $endTimeOptions = $endTimeField.find("option");
    
    //reduces the end time options to be only after the start time options.
    $("select[name='start']").change(function(){
        var startTime = $(this).find(":selected").val();
        var currentEndTime = $endTimeField.find("option:selected").val();
        $endTimeField.html(
            $endTimeOptions.filter(function(){
                return startTime < $(this).val();
            })
            );
        
        var endTimeSelected = false;
        $endTimeField.find("option").each(function() {
            if($(this).val() === currentEndTime) {
                $(this).attr("selected", "selected");
                endTimeSelected = true;
                return false;
            }
        });
        
        if(!endTimeSelected) {
            //automatically select an end date 2 slots away.
            $endTimeField.find("option:eq(1)").attr("selected", "selected");
        }
        
    }); 
  
    
    var $about = $("#about");
    
    $("#about_button").click(function(){
        $about.dialog({
            title: "About this calendar demo",
            width: 600,
            close: function() {
                $about.dialog("destroy");
                $about.hide();
            },
            buttons: {
                close : function(){
                    $about.dialog("close");
                }
            }
        }).show();
    });
    

});