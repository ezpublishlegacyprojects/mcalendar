{* Event Calendar - week view *}
{def $event_color = $node.data_map.color.content
     $event_node  = $node
     $event_node_id = $event_node.node_id
     $curr_ts = currentdate()
     $curr_today = $curr_ts|cdatetime(custom, 'N')
     $curr_year =  $curr_ts|datetime(custom, '%Y')
     $curr_week =  $curr_ts|datetime( custom, '%W')}

     {if and(ne($view_parameters.week, ''),ne($view_parameters.year,''))}
       {def $week_time_stamps=cmaketime($view_parameters.week,$view_parameters.year)
            $temp_week=$view_parameters.week
            $temp_year=$view_parameters.year
            $temp_today=cond(ne($view_parameters.day,''),$view_parameters.day,1)}
     {else}
       {def $week_time_stamps=cmaketime($curr_week,$curr_year)
            $temp_week=$curr_week
            $temp_year=$curr_year
            $temp_today=$curr_today}
     {/if}

{def $first_ts=$week_time_stamps[0]
     $last_ts=$week_time_stamps[6]
     $url_reload=concat( $event_node.url_alias,"/(view)/week", "/(day)/", $temp_today, "/(week)/", $temp_week, "/(year)/", $temp_year, "/offset/2")
     $url_back=concat( $event_node.url_alias,  "/(view)/week","/(week)/", sub($temp_week, 1), "/(year)/", $temp_year)
     $url_forward=concat( $event_node.url_alias, "/(view)/week","/(week)/", sum($temp_week, 1), "/(year)/", $temp_year)
     $dayofweek = 0}

{* def $events_table=fetch('calendar','events_list',
        hash('parent_node_id',$node.node_id,'from_time',$first_ts,'to_time',$last_ts,'view','week')) *}

        {$first_ts}
        {$last_ts}  

   <link rel="stylesheet" type="text/css" href={"stylesheets/jquery.weekcalendar.css"|ezdesign}  />

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
					<label for="start">Start Time: </label><select name="start"><option value="">Select Start Time</option></select>
				</li>
				<li>
					<label for="end">End Time: </label><select name="end"><option value="">Select End Time</option></select>
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
    <div id="tools_container">
        <p title="action">{"/content/action"|ezurl}</p>
        <p title="editIcon">{"icons/pencil_small.png"|ezimage}</p>
    </div>

 </div>
</div>


