<?php
$host_not_required = TRUE;
include(realpath(dirname(dirname(__FILE__)))."/includes/connect.php");

if ($argv) $_REQUEST['key'] = $argv[1];

if (empty($GLOBALS['cron_key_string']) || $_REQUEST['key'] == $GLOBALS['cron_key_string']) {
	$q = "SELECT * FROM users WHERE api_access_code='' OR api_access_code IS NULL;";
	$r = $app->run_query($q);
	$counter = 0;
	while ($user = $r->fetch()) {
		$qq = "UPDATE users SET api_access_code=".$app->quote_escape($app->random_string(32))." WHERE user_id='".$user['user_id']."';";
		$rr = $app->run_query($qq);
		$counter++;
	}
	echo "Updated ".$counter." user accounts.";
}
else echo "Incorrect key.";
?>
