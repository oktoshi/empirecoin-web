<?php
include("../includes/connect.php");
include("../includes/get_session.php");
$viewer_id = insert_pageview($thisuser);

if ($thisuser) {
	$preference = $_REQUEST['preference'];
	if ($preference != "public") $preference = "private";
	
	$alias = $_REQUEST['alias'];
	
	$q = "UPDATE users SET alias_preference='".$preference."', alias='".mysql_real_escape_string(strip_tags($alias))."' WHERE user_id='".$thisuser['user_id']."';";
	$r = run_query($q);
	
	echo "Your notification settings have been saved.";
}
else echo "First, please log in.";
?>