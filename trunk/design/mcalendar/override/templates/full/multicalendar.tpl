{* Multicalendar - Full view *}
{scuolapagedata_set( 'left_menu', true() )}
{scuolapagedata_set( 'left_nav_menu', true() )}
{scuolapagedata_set( 'extra_menu', false() )}
{def $related_node=''}

{run-once}
{ezcss_require(array('fullcalendar.css','mcalendar.css'))}
{ezscript_require( array( concat( 'ezjsc::', 'jqueryio' ),
        'classes/jquery-ui-min.js','classes/fullcalendar.js',
        'init_multicalendar.js','classes/dialogs.js','classes/calendar_legend.js' ))}
{/run-once}




    {if $node.object.state_id_array|contains('6')}
        <div class="wip rounded shadowmore">
            <p>{"Contenuto in preparazione non ancora visibile pubblicamente"|i18n('scuola/state')}</p>
        </div>
    {/if}
    
      
<div class="border-box">
     <div class="content-view-full">
         <div id="calendar_legend"></div>
        <div id="calendar"></div>
        <div id="event_edit_container">
            <form>
                <input type="hidden" />
                <ul>
                    <li>
                        <span>Date: </span><span class="date_holder"></span>
                    </li>
                    <li>
                        <label for="start">Start Time: </label>
                        <select name="start">

                        </select>
                    </li>
                    <li>
                        <label for="end">End Time: </label>
                        <select name="end">

                        </select>
                    </li>
                    <li>
                        <label for="title">Title: </label><input type="text" name="title" />
                    </li>
                    <li>
                        <label for="body">Body: </label><textarea name="body"></textarea>
                    </li>
                </ul>
            </form>
        </div>
        <div id="config" style="visibility:hidden">
            <p title="action">{"/content/action"|ezurl}</p>
            <p title="editIcon">{"icons/pencil_small.png"|ezimage}</p>
            <p title="node_id">{$node.node_id}</p>
            <p title="can_edit">{$node.can_edit}</p>
            <p title="calendars_list">[{foreach $node.data_map.calendars.content.relation_list as $relation}{set $related_node = fetch( 'content', 'node', hash( 'node_id', $relation.node_id ) )} {hash('calendar_id',$relation.node_id,'calendar_name',$related_node.name,'event_color',$related_node.data_map.color.content)|json_encode()},{/foreach}]</p>
        </div>
    </div>
</div>
{undef}