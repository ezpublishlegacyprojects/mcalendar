(function($) {
      
    $.fn.extend($.ui.dialog.prototype,{
        _original_init : $.ui.dialog.prototype._init,
        _init: function() {
            var self=this;
            var dialogElements={};
            var options=self.options;
            var calevent=options.params.calevent;

            if (options.action=='edit'){
                options.buttons['delete']=function(){
                    $(this).dialog('delete');
                }
            }
            self._original_init();
            dialogElements=this.dialogElements={
                fieldstart:self.element.find("select[name='start']").val(calevent.start),
                fieldend:self.element.find("select[name='end']").val(calevent.end),
                fieldtitle:self.element.find("input[name='title']").val(calevent.title),
                fieldbody:self.element.find("textarea[name='body']")
            };
            self._initTimeSlots(dialogElements.fieldstart,dialogElements.fieldend);
            self._setupStartAndEndTimeFields(dialogElements.fieldstart, dialogElements.fieldend, calevent, options.params.timeslottimes);
            
        },
        close:function(event,postCloseAction){
            var self=this;
            var options=self.options;
            var $calendar=options.params.calendar;
            var calevent=options.params.calevent;
            self.element.find('option').remove();
            self.destroy();

            switch(postCloseAction){
                case 'delete':
                  $calendar.fullCalendar('removeEvents',calevent.id);
                break;
                case 'cancel':
                    if (options.action=='create') $calendar.fullCalendar('removeEvents',calevent.id);
                break;
           }

        },
        "delete" : function(event){
            var self=this;
            var options=self.options;
            var $calendar=options.params.calendar;
            var calevent=options.params.calevent;
            var ezaction='mcalendar::removeEvent::'+calevent.nodeId;
            $.ez(ezaction);
            $calendar.fullCalendar('removeEvents',calevent.id);
            self.close(event,'delete');
          },
        save : function(event){
            var self=this;
            var ezaction,post_data;
            var options=self.options;
            var $calendar=options.params.calendar;
            var calevent=options.params.calevent;
                    
            calevent.start = new Date(self.dialogElements.fieldstart.val());
            calevent.end =   new Date(self.dialogElements.fieldend.val());
            calevent.title = self.dialogElements.fieldtitle.val();
            calevent.body = self.dialogElements.fieldbody.val();
            post_data=JSON.stringify({
                'short_title':calevent.title,
                'text':calevent.body,
                'id':calevent.id
            });
            switch(options.action){

                case 'create':
                    ezaction='mcalendar::addEventAjax::'+options.params.node_id+'::'+self._toTimestamp(calevent.start)+'::'+self._toTimestamp(calevent.end)
                    $.ez(ezaction,{
                        postdata: post_data
                    },function(data){
                        $calendar.fullCalendar("updateEvent", data.content);
                    });
                    break;
                case 'edit':
                    
                    ezaction='mcalendar::updateEventAjax::'+calevent.objectId+'::'+self._toTimestamp(calevent.start)+'::'+self._toTimestamp(calevent.end);
                    $.ez(ezaction,{
                        postdata: post_data
                    },function(data){
                        $calendar.fullCalendar("updateEvent", data.content);
                    });
                    break;
            }
            self.close(event,'save');
            $calendar.fullCalendar("updateEvent", calevent);
            
        },
        cancel : function(event){
            var self=this;
            var options=self.options;
            self.close(event,'cancel')
        },
        _toTimestamp:function(date){
            return Math.round(date.getTime()/1000);
        },
        _setupStartAndEndTimeFields:function($startTimeField, $endTimeField, calEvent, timeslotTimes) {
           
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
            $startTimeField.trigger("change");
        },
        _initTimeSlots:function($startTimeField, $endTimeField){
                   
            $startTimeField.change(function(){
                var $endTimeOptions = $endTimeField.find("option");
                var startTime = $(this).find(":selected").val();
                var currentEndTime = $endTimeField.find("option:selected").val();
                if (startTime)   {
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
                }
            });
        }
    });
    $.fn.extend($.ui.dialog.defaults,{
        action:'',
        modal:true,
        params:{},
        buttons:{
            save:function(){
                $(this).dialog('save');
            },
            cancel:function(){
                $(this).dialog('cancel');
            }
        }
    });
})(jQuery);