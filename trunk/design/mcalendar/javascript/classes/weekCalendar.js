/* 
 *
 *Javascript weekCalendar Class
 *
 *All Jquery object variables are $_prepended
 */

(function($){
  
    $.widget('ui.weekCalendar',{
        /*Constructor prototype*/
        _init:function(){
            var self=this;
            self._drawCalendar();
        },
        /*end constructor prototype*/
        /*draw the main calendar layout*/
        _drawCalendar: function(){
         var $calendarContainer;
	        var self = this;
	        var options = this.options;
	        //remove on final template modification
                self.element.find('div.calendar-week-view').remove();
                $calendarContainer = $("<div class=\"calendar-week-view\">").appendTo(self.element);
         }
        /*end draw main calendar layout*/


    });
$.extend($.ui.weekCalendar, {
	    version: '0.0.1'
});


})(jQuery);

