var legend={
    _init: function() {
         var options=this.options;
         this._renderInferface();
         this._setupEventDelegation();
    },
    _renderInferface:function(){
        var legend,$legend,$calendar;
        var options=this.options;
        legend='<div class="legend_box"></div>';
        $legend=$(legend).appendTo(this.element);
        for (var i in options.list){
         $calendar=$('<div class="calendar_element">'+options.list[i].calendar_name+
                    '<input checked="checked" class="cal_toggle" type="checkbox" value="'+options.list[i].calendar_id+'"/></div>').appendTo($legend);
         $calendar.css('background', options.list[i].event_color);
        }
     },
     _changeCalendarState:function($target){
        // alert(this.options.calendar.fullCalendar('option','eventSources').toSource());

     },
     _setupEventDelegation : function() {
        var self = this;
        this.element.click(function(event){
            var $target=$(event.target);
            if ($target.hasClass('cal_toggle')) {
                self._changeCalendarState($target)
            }
       });
    }
}
$.widget("ui.legend", legend);

$.ui.legend.defaults ={
    list:'',
    calendar:''
}