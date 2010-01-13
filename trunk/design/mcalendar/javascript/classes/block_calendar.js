var blockcalendar={
    _init:function(){
        this._renderCalInterface();
        this._setupEventDelegation();
        this._fetchEvents();
        
    },
    getHead: function(opts) {
        var html = [];
        for (var i = 0; i < opts.days.length; i++) {
            html.push('<th>' + opts.days[i] + '</th>');
        }
        return html.join('');
    },
    _updateCalInterface:function(cmonth,cyear){
        var self=this;
        var o=self.options;
        var today=0;
        var srcDate = new Date();
        var month = parseInt(cmonth, 10), year = parseInt(cyear, 10);
        srcDate.setDate(1);
        srcDate.setFullYear(year);
        srcDate.setMonth(month);
        var calTable=self._generateCalTable(srcDate,today);
        self.element.find('#cal_header').html('<span class="state" style="display:none;">' +
            calTable.curMonth + '.' + calTable.curYear + '</span><div class="monthName">' +
            o.months[calTable.curMonth] +' '+calTable.curYear+'</div>');
        self.element.find('.block_calendar').replaceWith(calTable.table);
        self._fetchEvents();
    },
    _renderCalInterface:function() {
        var self=this;
        var o = this.options;
        var $toolbar;
        var today = new Date();
        var srcDate = new Date();
        var calTable=self._generateCalTable(srcDate,today);
        $('<div id="cal_header"><span class="state" style="display:none;">' +
            calTable.curMonth + '.' + calTable.curYear + '</span><div class="monthName">' +
            o.months[calTable.curMonth] +' '+calTable.curYear+'</div></div>').appendTo(self.element);
        $toolbar=$('<div><a href="#" class="next">' + o.nextArrow + '</a><a href="#" class="prev">' + o.prevArrow + '</a></div>').appendTo(self.element);

        calTable.table.appendTo(self.element);
        $toolbar.find('.prev').click(function(){
            self._change(-1);
        });
        $toolbar.find('.next').click(function(){
            self._change(1);
        });
    },
    _generateCalTable:function(srcDate,today){
        var result= new Object;
        var o=this.options;
        var curDate =  srcDate.getDate();
        var curMonth = srcDate.getMonth();
        var curYear =  srcDate.getFullYear();
        result['curDate']=curDate;
        result['curMonth']=curMonth;
        result['curYear']=curYear;
        var dates = [];
        var dayCount = new Date(curYear, curMonth + 1, 0).getDate();
        
        for (var i = 1; i <= dayCount; i++) {
            var tmpDate = new Date(curYear, curMonth, i);
            if (tmpDate.getMonth() == curMonth && tmpDate.getFullYear() == curYear) {
                dates.push(tmpDate);
            }
        }

        o.start=dates[0];
        o.end=dates[dayCount-1];
        
        var $table = $('<table  class="block_calendar"></table>');
        var str = '<tbody><tr>' + this.getHead(o) + '</tr>', cl = '';
        var line = [];
        for (var j = 0; j < dates.length; j++) {
            var day = dates[j].getDay();
            var month = dates[j].getMonth();
            var year = dates[j].getFullYear();
            var date = dates[j].getDate();
            cl = '';
            if(today!=0) {
                if (date == today.getDate() && curMonth == today.getMonth() && curYear == today.getFullYear()) {
                    cl = ' class="curr"';
                } else if (day == 6 || day == 0) {
                    cl = ' class="weekend"';
                }
            }
           
            line.push('<td class="event_cel" title="'+parseInt(j+1)+'"'+cl + '><a>' + date + '</a></td>');
            if (dates[j].getDay() == 0) {
                if (line.length < 7) {
                    var ln = line.length;
                    var pad = [];
                    for (var k = 0; k < (7 - ln); k++) {
                        pad.push('<td class="pad">&nbsp;</td>');
                    }
                    line = pad.concat(line);
                }
                str += '<tr>' + line.join('') + '</tr>';
                line = [];
            } else if (j == (dates.length - 1)) {
                str += '<tr>' + line.join('') + '</tr>';
            }
        }
        str += '</tbody>';
        $table.html(str);
        result['table']=$table;
        return result;
    },
    _change:function(monthDelta) {
        var self=this;
        var opts = self.options;
        var state = self._getState();
        var d = new Date(state[1], state[0] + monthDelta, 1);
        opts.month = d.getMonth();
        opts.year  = d.getFullYear();
        self._updateCalInterface(d.getMonth(),d.getFullYear());
    },
    _getState:function() {
        var st = this.element.find('.state').text().split('.');
        return [parseInt(st[0], 10), parseInt(st[1], 10)];
    },
    _fetchEvents: function() {
        var self=this;
        var opts=self.options;
        var start=opts.start;
        var end=opts.end;
        var calendars=opts.calendars_list;

        for (var i in calendars){
            var action= 'mcalendar::fetchEvents::'+calendars[i].node_id+'::'+Math.round(start.getTime()/1000)+'::'+Math.round(end.getTime()/1000)+'::ajaxweek';
            opts[calendars[i].node_id]=calendars[i].color;
            $.ez(action,{
                postdata:'ready'
            },function(data) {
                 self._renderEvents(data.content);
            });
        }
    },
    _showEventsPopup:function($target){
        var self=this;
        var $popup,$list;
        var events=$target.data('events');

        $popup=$('<div class="popup"></div>').appendTo($target);
        $list=$('<ul class="popup"></ul>').appendTo($popup);
        for (var i in events){
            $('<li><span class="small_square" style="background:'+events[i].color+'"></span>'+events[i].title+'</li>').appendTo($list);
        }

    },
    _removeEventsPopup:function($target){
        $target.find('.popup').remove();
    },
    _renderEvents:function(events){
        var self=this;

        var tmp_day,tmp_date=new Date(),$cel,tmp_data;
        var $calendar_table=this.element.find('table.block_calendar');
        for (var i in events){
            events[i]['color']=this.options[events[i].parentNodeId];
            tmp_date.setTime(parseInt(events[i].start)*1000);
            tmp_day=tmp_date.getDate();
            $cel=$calendar_table.find('td[title="'+tmp_day+'"]');
            $cel.addClass('dayWevents');
            tmp_data=$cel.data('events');
            if (!tmp_data){
                tmp_data=new Array;
                tmp_data.push(events[i]);
            }else{
                tmp_data.push(events[i]);
            }
            $cel.data('events',tmp_data);
        }
    },
        _setupEventDelegation : function() {
        var self = this;
        var options = this.options;
        this.element.mouseover(function(event){
            var $target=$(event.target);
            if ($target.hasClass('dayWevents')) self._showEventsPopup($target)
                }).mouseout(function(event){
                    var $target=$(event.target);
                    if ($target.hasClass('dayWevents')) self._removeEventsPopup($target)
                });
    }

}

$.widget("ui.blockcalendar", blockcalendar);

$.ui.blockcalendar.defaults ={
    days: ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'Oktober', 'November', 'December'],
    linkFormat: null,
    dateFormat: '{%dd}.{%mm}.{%yyyy}',
    onSelect: null,
    showYear: false,
    prevArrow: '&laquo;',
    nextArrow: '&raquo;'
}