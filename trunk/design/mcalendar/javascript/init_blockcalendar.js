
$(document).ready(function() {
    var $blockcalendar = $('#block_calendar');
    var calendars_list=$('#config p[title="calendars_list"]').text();
    var calendars_list_data=eval('('+calendars_list+')');
    $blockcalendar.blockcalendar(
    {

        days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
        months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto',
        'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        calendars_list:calendars_list_data
    }
    );
});


