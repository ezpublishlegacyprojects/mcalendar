{* Event Calendar - Full view *}

<!--load jquery-->

{scuolapagedata_set( 'left_menu', true() )}
{scuolapagedata_set( 'left_nav_menu', true() )}
{scuolapagedata_set( 'extra_menu', false() )}
{run-once}
{ezcss_require(array('fullcalendar.css','mcalendar.css'))}
{ezscript_require( array( concat( 'ezjsc::', 'jqueryio' ),
        'jquery-ui-min.js','classes/fullcalendar.js',
        'fcalendar.js','classes/dialogs.js' ))}
{/run-once}



{if $node.object.state_id_array|contains('6')}
        <div class="wip rounded shadowmore">
            <p>{"Contenuto in preparazione non ancora visibile pubblicamente"|i18n('scuola/state')}</p>
        </div>
        {/if}


        
 {* include uri=concat("design:full/event_view_", $node.data_map.view.class_content.options[$node.data_map.view.value[0]].name|downcase(), ".tpl") *}

{$node.data_map.view.class_content.options[$node.data_map.view.value[0]].name|downcase()}

    <div class="border-box">
    <div class="content-view-full">
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
        <div id="tools_container" style="visibility:hidden">
            <p title="action">{"/content/action"|ezurl}</p>
            <p title="editIcon">{"icons/pencil_small.png"|ezimage}</p>
            <p title="node_id">{$node.node_id}</p>
            <p title="event_color">$node.data_map.color.content</p>
        </div>
    </div>
</div>


