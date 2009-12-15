{* Event Calendar - week view *}

<link rel="stylesheet" type="text/css" href={"stylesheets/fullcalendar.css"|ezdesign}  />
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


